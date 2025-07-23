export interface ChatMessage {
  id: string;
  sender: string;
  receiver: string;
  text: string;
  timestamp: string;
}

export interface ChatConversation {
  id: string;
  partnerId: string;
  partnerName: string;
  partnerAvatar?: string;
  lastMessage?: ChatMessage;
  unreadCount: number;
  isOnline?: boolean;
}

export interface ChatState {
  conversations: ChatConversation[];
  activeConversation: ChatConversation | null;
  messages: ChatMessage[];
  isConnected: boolean;
  loading: boolean;
  error: string | null;
}