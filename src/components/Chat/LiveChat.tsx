import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Search, MessageCircle, X } from 'lucide-react';
import { ConversationList } from './ConversationList';
import { ChatWindow } from './ChatWindow';
import { useWebSocketChat } from '../../hooks/useWebSocketChat';
import { chatService } from '../../services/chatService';
import { ChatMessage, ChatConversation, ChatState } from '../../types/chat';
import { useAuth } from '../../hooks/useAuth';
import { toast } from '../ui/use-toast';
import { cn } from '../../lib/utils';

interface LiveChatProps {
  className?: string;
  defaultOpen?: boolean;
}

export const LiveChat: React.FC<LiveChatProps> = ({ 
  className,
  defaultOpen = false 
}) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [searchTerm, setSearchTerm] = useState('');
  const [state, setState] = useState<ChatState>({
    conversations: [],
    activeConversation: null,
    messages: [],
    isConnected: false,
    loading: false,
    error: null,
  });

  // WebSocket integration
  const { isConnected, sendMessage: sendWsMessage } = useWebSocketChat({
    onMessageReceived: useCallback((message: ChatMessage) => {
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, message],
        conversations: prev.conversations.map(conv => 
          conv.partnerId === message.sender || conv.partnerId === message.receiver
            ? { ...conv, lastMessage: message, unreadCount: conv.unreadCount + 1 }
            : conv
        ),
      }));
    }, []),
    onConnectionChange: useCallback((connected: boolean) => {
      setState(prev => ({ ...prev, isConnected: connected }));
    }, []),
  });

  // Load conversations on mount
  useEffect(() => {
    if (user && isOpen) {
      loadConversations();
    }
  }, [user, isOpen]);

  const loadConversations = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const conversations = await chatService.getConversations();
      setState(prev => ({ ...prev, conversations, loading: false }));
    } catch (error) {
      console.error('Failed to load conversations:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Failed to load conversations' 
      }));
      toast({
        title: 'Error',
        description: 'Failed to load conversations',
        variant: 'destructive',
      });
    }
  };

  const loadChatHistory = async (partnerId: string) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      const messages = await chatService.getChatHistory(partnerId);
      setState(prev => ({ ...prev, messages, loading: false }));
    } catch (error) {
      console.error('Failed to load chat history:', error);
      setState(prev => ({ ...prev, loading: false }));
      toast({
        title: 'Error',
        description: 'Failed to load chat history',
        variant: 'destructive',
      });
    }
  };

  const handleConversationSelect = (conversation: ChatConversation) => {
    setState(prev => ({ 
      ...prev, 
      activeConversation: conversation,
      conversations: prev.conversations.map(conv =>
        conv.id === conversation.id ? { ...conv, unreadCount: 0 } : conv
      ),
    }));
    loadChatHistory(conversation.partnerId);
  };

  const handleSendMessage = async (text: string) => {
    if (!state.activeConversation || !user) return;

    const tempMessage: ChatMessage = {
      id: `temp_${Date.now()}`,
      sender: user.id,
      receiver: state.activeConversation.partnerId,
      text,
      timestamp: new Date().toISOString(),
    };

    // Optimistically add message to UI
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, tempMessage],
    }));

    try {
      // Send via WebSocket for real-time delivery
      const success = sendWsMessage({
        sender: user.id,
        receiver: state.activeConversation.partnerId,
        text,
      });

      if (!success) {
        // Fallback to REST API if WebSocket fails
        await chatService.sendMessage(state.activeConversation.partnerId, text);
      }

      // Update conversation's last message
      setState(prev => ({
        ...prev,
        conversations: prev.conversations.map(conv =>
          conv.id === state.activeConversation?.id
            ? { ...conv, lastMessage: tempMessage }
            : conv
        ),
      }));

    } catch (error) {
      console.error('Failed to send message:', error);
      // Remove the optimistic message on failure
      setState(prev => ({
        ...prev,
        messages: prev.messages.filter(msg => msg.id !== tempMessage.id),
      }));
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    }
  };

  const filteredConversations = state.conversations.filter(conv =>
    conv.partnerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalUnreadCount = state.conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  if (!isOpen) {
    return (
      <div className={cn('fixed bottom-4 right-4 z-50', className)}>
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-14 h-14 bg-blue-600 hover:bg-blue-700 shadow-lg relative"
        >
          <MessageCircle className="h-6 w-6" />
          {totalUnreadCount > 0 && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
              {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
            </div>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className={cn('fixed bottom-4 right-4 z-50', className)}>
      <Card className="w-96 h-[600px] shadow-2xl border-0 bg-white overflow-hidden">
        <div className="flex h-full">
          {/* Conversations Sidebar */}
          <div className={cn(
            'border-r border-gray-200 bg-gray-50 transition-all duration-300',
            state.activeConversation ? 'w-0 md:w-80 overflow-hidden md:overflow-visible' : 'w-full'
          )}>
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-300 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-hidden">
              <ConversationList
                conversations={filteredConversations}
                activeConversation={state.activeConversation}
                onConversationSelect={handleConversationSelect}
                loading={state.loading}
              />
            </div>
          </div>

          {/* Chat Window */}
          <div className={cn(
            'flex-1 transition-all duration-300',
            state.activeConversation ? 'w-full' : 'w-0 md:w-full overflow-hidden md:overflow-visible'
          )}>
            <ChatWindow
              conversation={state.activeConversation}
              messages={state.messages}
              currentUserId={user?.id || ''}
              onSendMessage={handleSendMessage}
              onBack={() => setState(prev => ({ ...prev, activeConversation: null }))}
              loading={state.loading}
              isConnected={isConnected}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};