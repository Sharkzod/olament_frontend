// hooks/useChats.ts
import { useState, useCallback, useEffect, useRef } from 'react';
import * as chatsApi from '@/app/lib/api/chatsApi';
import { Chat, GetChatsParams } from '@/app/lib/api/chatsApi';

// Additional types that extend the API types
export interface ExtendedChat extends Chat {
  lastMessage?: {
    content: string;
    timestamp: string;
    senderId: string;
  };
}



interface UseChatsOptions {
  params?: GetChatsParams;
  autoFetch?: boolean;
  initialData?: ExtendedChat[];
}

interface UseChatsReturn {
  chats: ExtendedChat[];
  loading: boolean;
  error: Error | null;
  hasMore: boolean;
  page: number;
  total: number;
  
  // Actions
  fetchChats: (params?: GetChatsParams) => Promise<ExtendedChat[]>;
  loadMore: () => Promise<void>;
  refreshChats: () => Promise<void>;
  getChatById: (chatId: string) => Promise<ExtendedChat | null>;
  updateChatLastMessage: (chatId: string, lastMessage: ExtendedChat['lastMessage']) => void;
  incrementUnreadCount: (chatId: string) => void;
  resetUnreadCount: (chatId: string) => void;
  markChatAsRead: (chatId: string) => Promise<void>;
  updateChatInList: (updatedChat: ExtendedChat) => void;
}

export const useChats = (options: UseChatsOptions = {}): UseChatsReturn => {
  const {
    params: initialParams = { limit: 20, page: 1 },
    autoFetch = true,
    initialData = [],
  } = options;

  const [chats, setChats] = useState<ExtendedChat[]>(initialData);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState<number>(initialParams.page || 1);
  const [total, setTotal] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch all chats
  const fetchChats = useCallback(async (customParams?: GetChatsParams) => {
    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for fetch API (not axios)
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const queryParams = {
        ...initialParams,
        ...customParams,
        page: customParams?.page || page,
      };

      console.log('Fetching chats with params:', queryParams);

      const response = await chatsApi.getAllChats(queryParams);
      
      console.log('Chats API response:', response);

      if (!response.success) {
  // Safely extract error message
        const errorMessage = 
          typeof response === 'object' && response !== null
            ? (response as any).message || 
              (response as any).error || 
              (response as any).errorMessage || 
              'Failed to fetch chats'
            : 'Failed to fetch chats';
        
        throw new Error(errorMessage);
      }

      const formattedChats = response.data.map(formatChatData);
      const isNewSearch = customParams?.page === 1;

      if (isNewSearch) {
        setChats(formattedChats);
      } else {
        setChats(prev => [...prev, ...formattedChats]);
      }

      setTotal(response.pagination?.total || 0);
      setHasMore(response.pagination?.page < response.pagination?.pages || false);
      
      if (customParams?.page) {
        setPage(customParams.page);
      }

      return formattedChats;
    } catch (err: any) {
      // Ignore abort errors
      if (err.name === 'AbortError') {
        return [];
      }

      console.error('Error fetching chats:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch chats';
      setError(new Error(errorMessage));
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [initialParams, page]);

  // Get a single chat by ID
  const getChatById = useCallback(async (chatId: string): Promise<ExtendedChat | null> => {
    if (!chatId || !isValidChatId(chatId)) {
      console.error('Invalid chat ID:', chatId);
      return null;
    }

    try {
      console.log('Fetching chat by ID:', chatId);
      const response = await chatsApi.getChatById(chatId);
      console.log('Chat by ID response:', response);

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch chat');
      }

      return formatChatData(response.data);
    } catch (err: any) {
      console.error('Error fetching chat by ID:', err);
      throw new Error(err.response?.data?.message || err.message || 'Failed to fetch chat');
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    if (autoFetch) {
      fetchChats();
    }

    return () => {
      // Cleanup: abort any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [autoFetch]);

  // Load more chats
  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    const nextPage = page + 1;
    await fetchChats({ ...initialParams, page: nextPage });
  }, [loading, hasMore, page, fetchChats, initialParams]);

  // Refresh chats
  const refreshChats = useCallback(async () => {
    await fetchChats({ ...initialParams, page: 1 });
  }, [fetchChats, initialParams]);

  // Update last message in a chat
  const updateChatLastMessage = useCallback((chatId: string, lastMessage: ExtendedChat['lastMessage']) => {
    setChats(prevChats => {
      return prevChats.map(chat => {
        if (chat._id === chatId) {
          return {
            ...chat,
            lastMessage,
            updatedAt: new Date().toISOString(),
          };
        }
        return chat;
      }).sort((a, b) => {
        // Sort by updatedAt to bring updated chats to top
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
    });
  }, []);

  // Increment unread count for a chat
  const incrementUnreadCount = useCallback((chatId: string) => {
    setChats(prevChats => {
      return prevChats.map(chat => {
        if (chat._id === chatId) {
          return {
            ...chat,
            unreadCount: (chat.unreadCount || 0) + 1,
          };
        }
        return chat;
      });
    });
  }, []);

  // Reset unread count for a chat
  const resetUnreadCount = useCallback((chatId: string) => {
    setChats(prevChats => {
      return prevChats.map(chat => {
        if (chat._id === chatId) {
          return {
            ...chat,
            unreadCount: 0,
          };
        }
        return chat;
      });
    });
  }, []);

  // Update a specific chat in the list
  const updateChatInList = useCallback((updatedChat: ExtendedChat) => {
    setChats(prevChats => {
      const index = prevChats.findIndex(chat => chat._id === updatedChat._id);
      if (index === -1) {
        // If not found, add to beginning
        return [updatedChat, ...prevChats];
      }
      
      const newChats = [...prevChats];
      newChats[index] = updatedChat;
      
      // Sort by updatedAt
      return newChats.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    });
  }, []);

  // Mark chat as read (API call)
  const markChatAsRead = useCallback(async (chatId: string) => {
    try {
      await chatsApi.markChatAsRead(chatId);
      resetUnreadCount(chatId);
    } catch (err) {
      console.error('Error marking chat as read:', err);
      throw err;
    }
  }, [resetUnreadCount]);

  return {
    chats,
    loading,
    error,
    hasMore,
    page,
    total,
    
    // Actions
    fetchChats,
    loadMore,
    refreshChats,
    getChatById,
    updateChatLastMessage,
    incrementUnreadCount,
    resetUnreadCount,
    markChatAsRead,
    updateChatInList,
  };
};

// Helper function to format chat data from API
export const formatChatData = (apiData: any): ExtendedChat => {
  return {
    _id: apiData._id,
    buyer: apiData.buyer,
    seller: apiData.seller,
    product: apiData.product,
    unreadCount: apiData.unreadCount || 0,
    createdAt: apiData.createdAt,
    updatedAt: apiData.updatedAt,
    __v: apiData.__v,
    
    // Extended fields
    lastMessage: apiData.lastMessage ? {
      content: apiData.lastMessage.content || '',
      timestamp: apiData.lastMessage.createdAt || new Date().toISOString(),
      senderId: apiData.lastMessage.sender?._id || apiData.lastMessage.senderId,
    } : undefined,
  };
};

// Validate if string is a valid MongoDB ObjectId
const isValidChatId = (id: string): boolean => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

// Export a simpler version for basic usage
// Export a simpler version for basic usage
export const useSimpleChats = (options: UseChatsOptions = {}) => {
  const {
    params = { limit: 100 },
    autoFetch = true,
  } = options;

  const [chats, setChats] = useState<ExtendedChat[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchChats = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await chatsApi.getAllChats(params);
      
      if (response.success) {
        const formattedChats = response.data.map(formatChatData);
        setChats(formattedChats);
      } else {
        // Apply the same fix as in useChats
        const errorMessage = 
          typeof response === 'object' && response !== null
            ? (response as any).message || 
              (response as any).error || 
              (response as any).errorMessage || 
              'Failed to fetch chats'
            : 'Failed to fetch chats';
        
        throw new Error(errorMessage);
      }
    } catch (err: any) {
      console.error('Error fetching chats:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchChats();
    }
  }, [autoFetch]);

  return {
    chats,
    loading,
    error,
    refetch: fetchChats,
  };
};