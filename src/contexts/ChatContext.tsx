// ChatContext.tsx
import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useWebSocket } from '../hooks/useWebSocket';

export interface ChatRequest {
  id: string;
  productId: string;
  senderId: string;
  receiverId: string;
  requestType: 'CHAT' | 'CALL';
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
  senderName: string;
  productName: string;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Notification {
  id: string;
  type: 'CHAT_REQUEST' | 'CALL_REQUEST' | 'REQUEST_ACCEPTED' | 'REQUEST_REJECTED' | 'NEW_MESSAGE';
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
  data?: any;
}

interface ChatState {
  notifications: Notification[];
  messages: ChatMessage[];
  activeChats: ChatRequest[];
  unreadCounts: {
    notifications: number;
    messages: number;
  };
  openChatId: string | null;
  showNotificationDialog: boolean;
  pendingRequest: ChatRequest | null;
}

const initialState: ChatState = {
  notifications: [],
  messages: [],
  activeChats: [],
  unreadCounts: {
    notifications: 0,
    messages: 0,
  },
  openChatId: null,
  showNotificationDialog: false,
  pendingRequest: null,
};

const ChatContext = createContext<any>(undefined);

function chatReducer(state: ChatState, action: any): ChatState {
  switch (action.type) {
    case 'SET_NOTIFICATIONS':
      return {
        ...state,
        notifications: action.payload,
        unreadCounts: {
          ...state.unreadCounts,
          notifications: action.payload.filter((n: any) => !n.read).length,
        },
      };

    case 'ADD_NOTIFICATION': {
      const updated = [action.payload, ...state.notifications];
      return {
        ...state,
        notifications: updated,
        unreadCounts: {
          ...state.unreadCounts,
          notifications: updated.filter((n: any) => !n.read).length,
        },
      };
    }

    case 'MARK_NOTIFICATION_READ': {
      const updatedNotifications = state.notifications.map((n) =>
        n.id === action.payload ? { ...n, read: true } : n
      );
      return {
        ...state,
        notifications: updatedNotifications,
        unreadCounts: {
          ...state.unreadCounts,
          notifications: updatedNotifications.filter((n) => !n.read).length,
        },
      };
    }

    case 'SET_MESSAGES':
      return {
        ...state,
        messages: action.payload,
        unreadCounts: {
          ...state.unreadCounts,
          messages: action.payload.filter((m: any) => !m.read).length,
        },
      };

    case 'ADD_MESSAGE': {
      const updated = [...state.messages, action.payload];
      return {
        ...state,
        messages: updated,
        unreadCounts: {
          ...state.unreadCounts,
          messages: updated.filter((m) => !m.read).length,
        },
      };
    }

    case 'SET_ACTIVE_CHATS':
      return { ...state, activeChats: action.payload };

    case 'ADD_ACTIVE_CHAT':
      return { ...state, activeChats: [...state.activeChats, action.payload] };

    case 'UPDATE_CHAT_STATUS':
      return {
        ...state,
        activeChats: state.activeChats.map((chat) =>
          chat.id === action.payload.id
            ? { ...chat, status: action.payload.status }
            : chat
        ),
      };

    case 'SET_OPEN_CHAT':
      return { ...state, openChatId: action.payload };

    case 'SET_SHOW_NOTIFICATION_DIALOG':
      return { ...state, showNotificationDialog: action.payload };

    case 'SET_PENDING_REQUEST':
      return { ...state, pendingRequest: action.payload };

    default:
      return state;
  }
}

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const { user } = useAuth();
  const [wsUserId, setWsUserId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) setWsUserId(user.id);
  }, [user?.id]);

  const { sendMessage: sendWsMessage } = useWebSocket(wsUserId || '', (data: any) => {
    console.log("📥 Incoming WebSocket data:", data);
    const payload = data.data || {};
    const type = data.type || data.requestType;
    switch (type) {
      case 'CHAT_REQUEST':
      case 'CALL_REQUEST':
        dispatch({
          type: 'ADD_NOTIFICATION',
          payload: {
            id: crypto.randomUUID(),
            type: type,
            title: `${payload.requestType} Request`,
            message: `${payload.senderName} wants to ${payload.requestType.toLowerCase()} about ${payload.productName}`,
            read: false,
            timestamp: new Date().toISOString(),
            data: payload,
          },
        });
        break;

      case 'REQUEST_ACCEPTED':
      case 'REQUEST_REJECTED':
        dispatch({
          type: 'ADD_NOTIFICATION',
          payload: {
            id: crypto.randomUUID(),
            type: type,
            title: `Request ${type === 'REQUEST_ACCEPTED' ? 'Accepted' : 'Rejected'}`,
            message: `Your ${type.toLowerCase()} request was ${type === 'REQUEST_ACCEPTED' ? 'Accepted' : 'Rejected'}`,
            read: false,
            timestamp: new Date().toISOString(),
            data: payload,
          },
        });
        dispatch({
          type: 'UPDATE_CHAT_STATUS',
          payload: {
            id: payload.requestId,
            status: payload.accepted ? 'ACCEPTED' : 'REJECTED',
          },
        });
        break;

      case 'NEW_MESSAGE':
        dispatch({
          type: 'ADD_MESSAGE',
          payload: {
            id: payload.messageId,
            chatId: payload.chatId,
            senderId: payload.senderId,
            content: payload.content,
            timestamp: payload.timestamp,
            read: false,
          },
        });
        break;
    }
  });

  const sendChatRequest = async (
    productId: string,
    receiverId: string,
    requestType: 'CHAT' | 'CALL'
  ) => {
    const response = await fetch('http://localhost:8081/web/api/v1/notification/chat/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ productId, receiverId, requestType, senderId: user?.id }),
    });

    if (response.ok) {
      const data = await response.json();
      sendWsMessage({
        type: 'CHAT_REQUEST',
        recipient: receiverId,
        data: {
          requestId: data.id,
          productId,
          senderId: user?.id,
          senderName: user?.name,
          requestType,
          productName: data.productName,
        },
      });
    } else {
      throw new Error('Chat request API failed');
    }
  };

  const respondToRequest = async (requestId: string, isRequestAccepted: boolean) => {
    const response = await fetch('http://localhost:8081/web/api/v1/notification/chat/response', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ requestId, isRequestAccepted }),
    });

    if (response.ok) {
      const data = await response.json();
      const status = isRequestAccepted ? 'ACCEPTED' : 'REJECTED';
      dispatch({ type: 'UPDATE_CHAT_STATUS', payload: { id: requestId, status } });
      if (isRequestAccepted) {
        dispatch({ type: 'ADD_ACTIVE_CHAT', payload: data });
      }
      sendWsMessage({
        type: isRequestAccepted ? 'REQUEST_ACCEPTED' : 'REQUEST_REJECTED',
        recipient: data.senderId,
        data: {
          requestId,
          accepted: isRequestAccepted,
          requestType: data.requestType,
          productId: data.productId,
          productName: data.productName,
          senderName: user?.name,
        },
      });
    }
  };

  const sendMessage = async (chatId: string, content: string) => {
    const response = await fetch('http://192.168.1.30:8081/web/api/v1/notification/chat/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ chatId, content, senderId: user?.id }),
    });

    if (response.ok) {
      const data = await response.json();
      const timestamp = new Date().toISOString();
      dispatch({
        type: 'ADD_MESSAGE',
        payload: {
          id: data.id,
          chatId,
          senderId: user?.id || '',
          content,
          timestamp,
          read: true,
        },
      });

      const chat = state.activeChats.find((c) => c.id === chatId);
      if (chat) {
        const recipientId = chat.senderId === user?.id ? chat.receiverId : chat.senderId;
        sendWsMessage({
          type: 'NEW_MESSAGE',
          recipient: recipientId,
          data: {
            messageId: data.id,
            chatId,
            senderId: user?.id,
            content,
            timestamp,
          },
        });
      }
    }
  };

  return (
    <ChatContext.Provider
      value={{
        state,
        sendChatRequest,
        respondToRequest,
        sendMessage,
        markNotificationAsRead: (id: string) =>
          dispatch({ type: 'MARK_NOTIFICATION_READ', payload: id }),
        markMessageAsRead: (id: string) =>
          dispatch({
            type: 'SET_MESSAGES',
            payload: state.messages.map((m) =>
              m.id === id ? { ...m, read: true } : m
            ),
          }),
        openChat: (id: string) => dispatch({ type: 'SET_OPEN_CHAT', payload: id }),
        closeChat: () => dispatch({ type: 'SET_OPEN_CHAT', payload: null }),
        dismissNotificationDialog: () =>
          dispatch({ type: 'SET_SHOW_NOTIFICATION_DIALOG', payload: false }),
        setPendingRequest: (r) =>
          dispatch({ type: 'SET_PENDING_REQUEST', payload: r }),
        setShowNotificationDialog: (show) =>
          dispatch({ type: 'SET_SHOW_NOTIFICATION_DIALOG', payload: show }),
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within a ChatProvider');
  return {
    ...ctx,
    notifications: ctx.state.notifications,
    messages: ctx.state.messages,
    unreadNotifications: ctx.state.unreadCounts.notifications,
    unreadMessages: ctx.state.unreadCounts.messages,
    showNotificationDialog: ctx.state.showNotificationDialog,
    pendingRequest: ctx.state.pendingRequest,
  };
};