import { useEffect, useRef, useState, useCallback } from 'react';
import { ChatMessage } from '../types/chat';

interface UseWebSocketChatProps {
  onMessageReceived: (message: ChatMessage) => void;
  onConnectionChange: (isConnected: boolean) => void;
}

export const useWebSocketChat = ({ onMessageReceived, onConnectionChange }: UseWebSocketChatProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    try {
      const token = localStorage.getItem('token');
      
      // Skip connection if no token is available
      if (!token) {
        console.log('No authentication token available, skipping WebSocket connection');
        setIsConnected(false);
        onConnectionChange(false);
        return;
      }
      
      const wsUrl = `wss://api.myapp.com/ws/chat?token=${token}`;
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        onConnectionChange(true);
        reconnectAttempts.current = 0;
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: ChatMessage = JSON.parse(event.data);
          onMessageReceived(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        onConnectionChange(false);

        // Attempt to reconnect if not manually closed
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, delay);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }
  }, [onMessageReceived, onConnectionChange]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect');
    }
  }, []);

  const sendMessage = useCallback((message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const fullMessage: ChatMessage = {
        ...message,
        id: `temp_${Date.now()}`,
        timestamp: new Date().toISOString(),
      };
      wsRef.current.send(JSON.stringify(fullMessage));
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    sendMessage,
    disconnect,
    reconnect: connect,
  };
};