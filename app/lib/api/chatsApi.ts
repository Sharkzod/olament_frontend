// lib/api/chatsApi.ts
import apiClient from './apiClient';

export interface ChatParticipant {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  fullAddress: string;
  accountStatus: string;
  id: string;
}

export interface ChatProduct {
  _id: string;
  name: string;
  price: number;
  images: Array<{
    url: string;
    altText: string;
    isPrimary: boolean;
    order: number;
    _id: string;
    id: string;
  }>;
  discountPercentage: number;
  inStock: boolean;
  id: string;
}

export interface Chat {
  _id: string;
  buyer: ChatParticipant;
  seller: ChatParticipant;
  product: ChatProduct;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface ChatMessage {
  _id: string;
  chat: string;
  sender: ChatParticipant;
  content: string;
  messageType: 'text' | 'image' | 'file';
  attachments: any[];
  readBy: Array<{
    user: string;
    readAt: string;
    _id: string;
  }>;
  isDeleted: boolean;
  deletedFor: any[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface ChatsResponse {
  success: boolean;
  data: Chat[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface MessagesResponse {
  success: boolean;
  data: ChatMessage[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface SendMessageResponse {
  success: boolean;
  message: string;
  data: ChatMessage;
}

export interface GetChatsParams {
  page?: number;
  limit?: number;
}

export interface GetMessagesParams {
  page?: number;
  limit?: number;
}

export interface SendMessageParams {
  content: string;
  messageType?: 'text' | 'image' | 'file';
  attachments?: any[];
}

/**
 * Get all chats for the current user
 */
export const getAllChats = async (params?: GetChatsParams): Promise<ChatsResponse> => {
  const response = await apiClient.get('/chats/chats', { params });
  return response.data;
};

/**
 * Get a specific chat by ID
 */
export const getChatById = async (chatId: string) => {
  const response = await apiClient.get(`/chats/${chatId}`);
  return response.data;
};

/**
 * Get messages for a specific chat
 */
export const getChatMessages = async (
  chatId: string,
  params?: GetMessagesParams
): Promise<MessagesResponse> => {
  const response = await apiClient.get(`/chats/${chatId}/messages`, { params });
  return response.data;
};

/**
 * Send a message in a chat
 */
export const sendChatMessage = async (
  chatId: string,
  data: SendMessageParams
): Promise<SendMessageResponse> => {
  const response = await apiClient.post(`/chats/messages`, {
    chatId,
    ...data,
  });
  return response.data;
};

/**
 * Mark chat messages as read
 */
export const markChatAsRead = async (chatId: string) => {
  const response = await apiClient.put(`/chats/${chatId}/read`);
  return response.data;
};