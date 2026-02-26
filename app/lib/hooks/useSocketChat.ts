// useSocketChat.ts
import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

// Add message normalization helper
const normalizeMessage = (message: any) => ({
  ...message,
  id: message._id || message.id,
  senderId: message.sender?._id || message.sender || message.senderId,
  timestamp: message.createdAt || message.timestamp,
  status: message.status || 'delivered',
  type: message.type || 'text',
});

export const useSocketChat = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    console.log('🔌 Initializing socket with token:', token ? 'Yes' : 'No');
    
    const socketInstance = io('https://olament-backend-2.onrender.com', {
      withCredentials: true,
      auth: {
        token: token
      }
    });

    //  const socketInstance = io('http://localhost:5000', {
    //   withCredentials: true,
    //   auth: {
    //     token: token
    //   }
    // });


    socketInstance.on('connect', () => {
      console.log('✅ Socket connected:', socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
    });

    // Listen for new messages - NORMALIZE HERE
    socketInstance.on('newMessage', (data) => {
      console.log('📨 Raw message from socket:', data);
      const normalizedMessage = normalizeMessage(data.message);
      console.log('📨 Normalized message:', normalizedMessage);
      setLastMessage(normalizedMessage);
    });

    // Listen for typing indicators
    socketInstance.on('typing', ({ userId, isTyping }) => {
      console.log(`✍️ User ${userId} is ${isTyping ? 'typing' : 'stopped typing'}`);
    });

    // Listen for read receipts
    socketInstance.on('messageRead', ({ conversationId, userId }) => {
      console.log('✅ User', userId, 'read messages in', conversationId);
    });

    setSocket(socketInstance);

    return () => {
      console.log('🔌 Cleaning up socket');
      socketInstance.disconnect();
    };
  }, []);

  // Helper function to emit events
  const emitEvent = useCallback((event: string, data: any) => {
    if (socket?.connected) {
      socket.emit(event, data);
      console.log(`📤 Emitted ${event}:`, data);
      return true;
    }
    console.warn(`⚠️ Socket not connected, cannot emit ${event}`);
    return false;
  }, [socket]);

  // Send typing indicator
  const sendTypingIndicator = useCallback((conversationId: string, isTyping: boolean) => {
    return emitEvent('typing', { conversationId, isTyping });
  }, [emitEvent]);

  // Emit message read event
  const emitMessageRead = useCallback((conversationId: string, messageIds: string[]) => {
    return emitEvent('markAsRead', { conversationId });
  }, [emitEvent]);

  // Join conversation room
  const joinConversation = useCallback((conversationId: string) => {
    return emitEvent('joinConversations', [conversationId]); // Backend expects array
  }, [emitEvent]);

  // Leave conversation room
  const leaveConversation = useCallback((conversationId: string) => {
    // Backend doesn't have a leave event, it auto-leaves on disconnect
    console.log('🚪 Leaving conversation:', conversationId);
  }, []);

  // Send message via socket (use backend's event name)
  const sendMessageViaSocket = useCallback((conversationId: string, content: string, productId?: string) => {
    return emitEvent('privateMessage', {
      conversationId,
      message: content,
      productId: productId || null
    });
  }, [emitEvent]);

  return {
    socket,
    isConnected,
    lastMessage,
    sendTypingIndicator,
    emitMessageRead,
    joinConversation,
    leaveConversation,
    sendMessageViaSocket,
    emitEvent
  };
};