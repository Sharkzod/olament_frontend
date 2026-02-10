// lib/hooks/useChat.ts
import { useState, useCallback } from 'react';
import apiClient from '../api/apiClient';

interface CreateChatParams {
  productId: string;
  vendorId: string;
}

interface ChatResponse {
  success: boolean;
  data: {
    _id: string;
    participants: string[];
    product: string;
    lastMessage?: any;
    createdAt: string;
    updatedAt: string;
  };
  message?: string;
}

interface UseChatReturn {
  createChat: (params: CreateChatParams) => Promise<ChatResponse>;
  isCreating: boolean;
  error: Error | null;
  reset: () => void;
}

export const useChat = (): UseChatReturn => {
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const createChat = useCallback(async (params: CreateChatParams): Promise<ChatResponse> => {
    setIsCreating(true);
    setError(null);

    try {
      console.log('🔄 Creating chat with params:', params);
      
      const response = await apiClient.post('/chats/create', {
        productId: params.productId,
        vendorId: params.vendorId,
      });

      console.log('✅ Chat created successfully:', response.data);
      return response.data;
    } catch (err: any) {
      const error = err instanceof Error ? err : new Error('Failed to create chat');
      console.error('❌ Error creating chat:', err);
      
      // Store the error in state
      setError(error);
      
      // Re-throw so the component can catch it
      throw error;
    } finally {
      setIsCreating(false);
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setIsCreating(false);
  }, []);

  return {
    createChat,
    isCreating,
    error,
    reset,
  };
};