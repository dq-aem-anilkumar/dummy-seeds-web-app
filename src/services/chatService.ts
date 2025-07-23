import axios from 'axios';
import { ChatMessage, ChatConversation } from '../types/chat';

const BASE_URL = 'https://api.myapp.com/web/api/v1/chat';

// Create axios instance with auth headers
const chatApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
chatApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const chatService = {
  // Get all conversations
  getConversations: async (): Promise<ChatConversation[]> => {
    const response = await chatApi.get('/conversations');
    return response.data;
  },

  // Get chat history with a specific partner
  getChatHistory: async (partnerId: string): Promise<ChatMessage[]> => {
    const response = await chatApi.get(`/history/${partnerId}`);
    return response.data;
  },

  // Get a specific message
  getMessage: async (messageId: string): Promise<ChatMessage> => {
    const response = await chatApi.get(`/message/${messageId}`);
    return response.data;
  },

  // Send a new message (if you have a POST endpoint)
  sendMessage: async (receiverId: string, text: string): Promise<ChatMessage> => {
    const response = await chatApi.post('/send', {
      receiver: receiverId,
      text: text,
      timestamp: new Date().toISOString(),
    });
    return response.data;
  },
};