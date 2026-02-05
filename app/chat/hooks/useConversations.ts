// ==========================================
// useConversations Hook
// ==========================================
// BACKEND DEVELOPER INTEGRATION GUIDE
//
// 1. FETCH CONVERSATIONS API:
//    Endpoint: GET /api/conversations
//    Response: { success: boolean, data: Conversation[], error?: string }
//
// 2. CONVERSATION STRUCTURE:
//    interface Conversation {
//      id: string;
//      participant: Participant;
//      lastMessage?: Message;
//      unreadCount: number;
//      productReference?: {
//        id: string;
//        name: string;
//        image?: string;
//      };
//      updatedAt: Date;
//    }
//
// 3. PARTICIPANT STRUCTURE:
//    interface Participant {
//      id: string;
//      name: string;
//      avatar?: string;
//      role: 'user' | 'vendor';
//    }
// ==========================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Conversation } from '../types/chat';
import { mockConversations } from '../data/mockData';

/**
 * Custom hook for managing conversations list
 */
export const useConversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ==========================================
  // TODO: Replace with API call
  // const response = await fetch('/api/conversations');
  // const data = await response.json();
  // if (!data.success) throw new Error(data.error);
  // setConversations(data.data);
  // ==========================================
  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Simulate API delay (REMOVE WHEN API IS READY)
      await new Promise((resolve) => setTimeout(resolve, 500));
      setConversations(mockConversations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch conversations');
      console.error('Error fetching conversations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Select a conversation
  const selectConversation = useCallback((conversationId: string) => {
    console.log('Selected conversation:', conversationId);
    // TODO: Navigate to conversation or set active conversation
  }, []);

  // Refresh conversations
  const refresh = useCallback(() => {
    void fetchConversations();
  }, [fetchConversations]);

  // Initial fetch
  useEffect(() => {
    void fetchConversations();
  }, [fetchConversations]);

  return {
    conversations,
    loading,
    error,
    selectConversation,
    refresh,
    refetch: fetchConversations,
  };
};

export default useConversations;
