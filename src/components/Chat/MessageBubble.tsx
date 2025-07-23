import React from 'react';
import { ChatMessage } from '../../types/chat';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '../../lib/utils';

interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
  showAvatar?: boolean;
  senderName?: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  showAvatar = false,
  senderName,
}) => {
  return (
    <div className={cn('flex items-end space-x-2 mb-4', isOwn ? 'justify-end' : 'justify-start')}>
      {!isOwn && showAvatar && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-semibold">
          {senderName?.charAt(0).toUpperCase() || 'U'}
        </div>
      )}
      
      <div className={cn('max-w-xs lg:max-w-md', isOwn ? 'order-1' : 'order-2')}>
        <div
          className={cn(
            'px-4 py-2 rounded-2xl shadow-sm',
            isOwn
              ? 'bg-blue-600 text-white rounded-br-md'
              : 'bg-white border border-gray-200 text-gray-900 rounded-bl-md'
          )}
        >
          <p className="text-sm leading-relaxed break-words">{message.text}</p>
        </div>
        
        <div className={cn('mt-1 text-xs text-gray-500', isOwn ? 'text-right' : 'text-left')}>
          {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
        </div>
      </div>
      
      {isOwn && showAvatar && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white text-sm font-semibold">
          You
        </div>
      )}
    </div>
  );
};