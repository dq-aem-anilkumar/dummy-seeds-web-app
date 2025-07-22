import { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client/dist/sockjs';

interface WebSocketMessage {
  type: string;
  recipient?: string;
  data: any;
}

type MessageCallback = (message: WebSocketMessage) => void;

export const useWebSocket = (userId: string, onMessage: MessageCallback) => {
  const clientRef = useRef<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    const client = new Client({
      webSocketFactory: () =>
        new SockJS(`http://192.168.1.30:8081/ws?userId=${userId}`),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (str) => {
        console.log('STOMP Debug:', str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      console.log('✅ WebSocket connected');
      setIsConnected(true);

      client.subscribe('/user/queue/notifications', (message) => {
        try {
          const data: WebSocketMessage = JSON.parse(message.body);
          onMessage(data);
        } catch (err) {
          console.error('Error parsing notification message:', err);
        }
      });

      client.subscribe('/user/queue/messages', (message) => {
        try {
          const data: WebSocketMessage = JSON.parse(message.body);
          onMessage(data);
        } catch (err) {
          console.error('Error parsing chat message:', err);
        }
      });
    };

    client.onDisconnect = () => {
      console.log('⚠️ WebSocket disconnected');
      setIsConnected(false);
    };

    client.onStompError = (frame) => {
      console.error('❌ STOMP error:', frame);
      setIsConnected(false);
    };

    client.activate();
    clientRef.current = client;

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
    };
  }, [userId]);

  const sendMessage = (message: WebSocketMessage) => {
    if (clientRef.current && isConnected) {
      clientRef.current.publish({
        destination: '/app/message',
        body: JSON.stringify(message),
      });
    }
  };

  return { isConnected, sendMessage };
};