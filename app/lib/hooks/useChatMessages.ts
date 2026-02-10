// lib/hooks/useChatMessages.ts

'use client';

import { useState, useCallback, useEffect } from 'react';
import apiClient from '../api/apiClient';

interface Message {
  id: string;
  _id?: string;
  senderId: string;
  sender?: any;
  content: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  type: 'text' | 'image' | 'file';
  createdAt?: string;
  readBy?: string[];
}

interface UseChatMessagesOptions {
  autoFetch?: boolean;
}

export const useChatMessages = (
  conversationId: string,
  options: UseChatMessagesOptions = {}
) => {
  const { autoFetch = true } = options;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch messages - FIXED VERSION
  const fetchMessages = useCallback(async () => {
    if (!conversationId) {
      console.warn('⚠️ No conversationId provided to fetchMessages');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('📥 Fetching messages for conversation:', conversationId);
      
      const response = await apiClient.get(`/chats/${conversationId}/messages`);
      
      console.log('📦 Raw response:', {
        success: response.data?.success,
        dataType: typeof response.data?.data,
        isArray: Array.isArray(response.data?.data),
        arrayLength: Array.isArray(response.data?.data) ? response.data.data.length : 0,
        firstItem: Array.isArray(response.data?.data) && response.data.data[0] 
          ? Object.keys(response.data.data[0]) 
          : null
      });
      
      if (!response.data?.success) {
        throw new Error('API returned success: false');
      }
      
      let fetchedMessages = [];
      const responseData = response.data.data;
      
      // Handle different response structures
      if (Array.isArray(responseData)) {
        // Check if array items are messages or chats
        const firstItem = responseData[0];
        
        if (firstItem && 'content' in firstItem) {
          // Items are messages
          console.log('✅ Data is array of messages');
          fetchedMessages = responseData;
        } else if (firstItem && 'messages' in firstItem) {
          // Items are chat objects with messages property
          console.log('⚠️ Data is array of chats, extracting messages from first chat');
          fetchedMessages = firstItem.messages || [];
        } else {
          console.error('❌ Unknown array structure:', firstItem);
        }
      } else if (responseData?.messages && Array.isArray(responseData.messages)) {
        // Data is object with messages array
        console.log('✅ Data has messages property');
        fetchedMessages = responseData.messages;
      } else if (response.data.chat?.messages) {
        // Response has chat.messages
        console.log('✅ Data at chat.messages');
        fetchedMessages = response.data.chat.messages;
      } else if (response.data.messages && Array.isArray(response.data.messages)) {
        // Messages at top level
        console.log('✅ Messages at top level');
        fetchedMessages = response.data.messages;
      } else {
        console.error('❌ Could not find messages in response structure:', response.data);
      }
      
      console.log(`📨 Found ${fetchedMessages.length} messages`);
      
      // Normalize messages
      const normalizedMessages = fetchedMessages.map((msg: any, index: number) => {
        const normalized: Message = {
          id: msg._id || msg.id || `temp-${Date.now()}-${index}`,
          _id: msg._id,
          senderId: msg.sender?._id || msg.sender || msg.senderId || '',
          sender: msg.sender,
          content: msg.content || msg.text || '',
          timestamp: msg.createdAt || msg.timestamp || new Date().toISOString(),
          status: msg.status || (msg.readBy && msg.readBy.length > 0 ? 'read' : 'sent'),
          type: msg.messageType || msg.type || 'text',
          createdAt: msg.createdAt,
          readBy: msg.readBy || [],
        };
        
        return normalized;
      });
      
      console.log('✅ Messages normalized and loaded:', normalizedMessages.length);
      setMessages(normalizedMessages);
      
    } catch (err: any) {
      console.error('❌ Error fetching messages:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  // Send message
  const sendMessage = useCallback(async (content: string) => {
    if (!conversationId) {
      console.error('❌ No conversationId provided to sendMessage');
      throw new Error('No conversation ID');
    }
    
    if (!content.trim()) {
      console.warn('⚠️ Empty message content');
      return;
    }

    setSending(true);
    setError(null);

    try {
      console.log('📤 Sending message to conversation:', conversationId);
      
      const response = await apiClient.post('/chats/messages', {
        chatId: conversationId,
        content: content.trim(),
        attachment: null,
      });

      console.log('✅ Message sent successfully:', response.data);

      if (response.data.success) {
        const newMessage = response.data.data || response.data.message;
        
        // Normalize the new message
        const normalizedMessage: Message = {
          id: newMessage._id || newMessage.id || `temp-${Date.now()}`,
          _id: newMessage._id,
          senderId: newMessage.sender?._id || newMessage.sender || newMessage.senderId,
          sender: newMessage.sender,
          content: newMessage.content || newMessage.text,
          timestamp: newMessage.createdAt || newMessage.timestamp || new Date().toISOString(),
          status: newMessage.status || 'sent',
          type: newMessage.messageType || newMessage.type || 'text',
          createdAt: newMessage.createdAt,
          readBy: newMessage.readBy || [],
        };
        
        // Optimistically add message to UI if not already there
        setMessages((prev) => {
          const exists = prev.some((m) => m.id === normalizedMessage.id);
          
          if (exists) {
            console.log('⚠️ Message already exists in state');
            return prev;
          }
          
          console.log('✅ Adding new message to state');
          return [...prev, normalizedMessage];
        });
        
        return normalizedMessage;
      }
    } catch (err: any) {
      console.error('❌ Error sending message:', {
        message: err.message,
        response: err.response?.data
      });
      setError(err);
      throw err;
    } finally {
      setSending(false);
    }
  }, [conversationId]);

  // Receive message (from socket)
  const receiveMessage = useCallback((message: any) => {
    console.log('📨 Receiving message via socket:', message);
    
    // Normalize the received message
    const normalizedMessage: Message = {
      id: message._id || message.id || `temp-${Date.now()}`,
      _id: message._id,
      senderId: message.sender?._id || message.sender || message.senderId,
      sender: message.sender,
      content: message.content || message.text,
      timestamp: message.createdAt || message.timestamp || new Date().toISOString(),
      status: message.status || 'delivered',
      type: message.messageType || message.type || 'text',
      createdAt: message.createdAt,
      readBy: message.readBy || [],
    };
    
    setMessages((prev) => {
      const exists = prev.some((m) => m.id === normalizedMessage.id);
      
      if (exists) {
        console.log('⚠️ Message already exists, skipping');
        return prev;
      }
      
      console.log('✅ Adding new socket message to state');
      return [...prev, normalizedMessage];
    });
  }, []);

  // Mark messages as read
  const markAsRead = useCallback(
    async (messageIds: string[]) => {
      try {
        const validIds = messageIds.filter(id => id && id !== 'undefined');
        
        if (validIds.length === 0) {
          console.warn('⚠️ No valid message IDs to mark as read');
          return;
        }

        console.log('📖 Marking messages as read:', validIds);

        const promises = validIds.map(messageId =>
          apiClient.post(`/chats/messages/${messageId}/read`)
        );
        
        await Promise.all(promises);

        // Update local state
        setMessages((prev) =>
          prev.map((msg) =>
            validIds.includes(msg.id)
              ? { ...msg, status: 'read' as const }
              : msg
          )
        );
        
        console.log('✅ Messages marked as read');
      } catch (error) {
        console.error('❌ Error marking messages as read:', error);
      }
    },
    []
  );

  // Update message status
  const updateMessageStatus = useCallback((messageIds: string[], status: 'delivered' | 'read') => {
    console.log(`📝 Updating message status to ${status}:`, messageIds);
    
    setMessages((prev) =>
      prev.map((msg) =>
        messageIds.includes(msg.id || msg._id || '')
          ? { ...msg, status }
          : msg
      )
    );
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch && conversationId) {
      fetchMessages();
    }
  }, [autoFetch, conversationId, fetchMessages]);

  return {
    messages,
    loading,
    sending,
    isTyping,
    error,
    sendMessage,
    receiveMessage,
    markAsRead,
    updateMessageStatus,
    fetchMessages,
    setIsTyping,
  };
};
