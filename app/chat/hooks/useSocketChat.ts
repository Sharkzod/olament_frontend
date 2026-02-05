// ==========================================
// useSocketChat Hook
// ==========================================
// BACKEND DEVELOPER INTEGRATION GUIDE - SOCKET.IO
//
// 1. SOCKET.IO SETUP:
//    - Install: npm install socket.io-client
//    - Create socket instance: @/lib/socket.ts
//    - Connect to your Socket.io server
//
// 2. SOCKET EVENTS:
//
//    CLIENT -> SERVER (emit):
//    ┌─────────────────────────┬─────────────────────────────────────┐
//    │ Event                  │ Payload                              │
//    ├─────────────────────────┼─────────────────────────────────────┤
//    │ joinConversation       │ { conversationId: string }          │
//    │ leaveConversation      │ { conversationId: string }          │
//    │ sendMessage            │ { conversationId, content }         │
//    │ typing                 │ { conversationId, userId }          │
//    │ stopTyping             │ { conversationId, userId }          │
//    └─────────────────────────┴─────────────────────────────────────┘
//
//    SERVER -> CLIENT (on):
//    ┌─────────────────────────┬─────────────────────────────────────┐
//    │ Event                  │ Payload                              │
//    ├─────────────────────────┼─────────────────────────────────────┤
//    │ newMessage             │ Message object                       │
//    │ messageRead            │ { messageId, conversationId }       │
//    │ userTyping             │ { conversationId, userId }          │
//    │ userStoppedTyping       │ { conversationId, userId }          │
//    │ connect                │ (no payload)                         │
//    │ disconnect             │ (no payload)                         │
//    └─────────────────────────┴─────────────────────────────────────┘
//
// 3. BACKEND IMPLEMENTATION EXAMPLE:
//
//    // server.js (Node.js/Socket.io)
//    io.on('connection', (socket) => {
//      // Join conversation room
//      socket.on('joinConversation', ({ conversationId }) => {
//        socket.join(conversationId);
//      });
//
//      // Leave conversation room
//      socket.on('leaveConversation', ({ conversationId }) => {
//        socket.leave(conversationId);
//      });
//
//      // Handle new message
//      socket.on('sendMessage', async ({ conversationId, content }) => {
//        // Save to database
//        const message = await saveMessage({ conversationId, content });
//        // Broadcast to conversation participants
//        io.to(conversationId).emit('newMessage', message);
//      });
//
//      // Typing indicator
//      socket.on('typing', ({ conversationId, userId }) => {
//        socket.to(conversationId).emit('userTyping', { conversationId, userId });
//      });
//
//      socket.on('stopTyping', ({ conversationId, userId }) => {
//        socket.to(conversationId).emit('userStoppedTyping', { conversationId, userId });
//      });
//    });
//
// 4. FRONTEND SOCKET SETUP:
//
//    // @/lib/socket.ts
//    import { io } from 'socket.io-client';
//
//    export const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
//      autoConnect: false,
//    });
//
// ==========================================

'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { Message } from '../types/chat';
import { currentUser } from '../data/mockData';

// TODO: Import socket instance when Socket.io is set up
// import { socket } from '@/lib/socket';

interface UseSocketChatOptions {
  conversationId: string | null;
  onNewMessage?: (message: Message) => void;
  onTyping?: (userId: string) => void;
  onStopTyping?: (userId: string) => void;
}

/**
 * Custom hook for managing Socket.io connection for chat
 */
export const useSocketChat = ({
  conversationId,
  onNewMessage,
  onTyping,
  onStopTyping,
}: UseSocketChatOptions) => {
  const [connected, setConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const socketRef = useRef<unknown>(null);

  // Connect to socket
  const connect = useCallback(() => {
    // TODO: Implement socket connection
    // if (socket.connected) {
    //   setConnected(true);
    //   return;
    // }
    //
    // socket.connect();
    // socket.on('connect', () => setConnected(true));
    // socket.on('disconnect', () => setConnected(false));

    // Mock connection for development
    console.log('Socket: Connecting...');
    setConnected(true);
  }, []);

  // Disconnect from socket
  const disconnect = useCallback(() => {
    // TODO: Implement socket disconnection
    // socket.disconnect();
    // socket.off('connect');
    // socket.off('disconnect');

    console.log('Socket: Disconnecting...');
    setConnected(false);
  }, []);

  // Join a conversation room
  const joinConversation = useCallback((convId: string) => {
    // TODO: Emit socket event
    // socket.emit('joinConversation', convId);
    console.log('Socket: Joined conversation', convId);
  }, []);

  // Leave a conversation room
  const leaveConversation = useCallback((convId: string) => {
    // TODO: Emit socket event
    // socket.emit('leaveConversation', convId);
    console.log('Socket: Left conversation', convId);
  }, []);

  // Send a message
  const sendMessage = useCallback((message: Partial<Message>) => {
    // TODO: Emit socket event
    // socket.emit('sendMessage', { ...message, senderId: currentUser.id });
    console.log('Socket: Sending message', message);
  }, []);

  // Send typing indicator
  const sendTyping = useCallback((convId: string) => {
    // TODO: Emit socket event
    // socket.emit('typing', { conversationId: convId, userId: currentUser.id });
  }, []);

  // Send stop typing indicator
  const sendStopTyping = useCallback((convId: string) => {
    // TODO: Emit socket event
    // socket.emit('stopTyping', { conversationId: convId, userId: currentUser.id });
  }, []);

  // Set up socket event listeners
  useEffect(() => {
    if (!conversationId) return;

    // Connect
    connect();

    // Join conversation room
    joinConversation(conversationId);

    // TODO: Set up socket event listeners
    // socket.on('newMessage', (message: Message) => {
    //   onNewMessage?.(message);
    // });
    //
    // socket.on('userTyping', ({ userId }) => {
    //   setTypingUsers((prev) => new Set([...prev, userId]));
    //   onTyping?.(userId);
    // });
    //
    // socket.on('userStoppedTyping', ({ userId }) => {
    //   setTypingUsers((prev) => {
    //     const next = new Set(prev);
    //     next.delete(userId);
    //     return next;
    //   });
    //   onStopTyping?.(userId);
    // });
    //
    // socket.on('messageRead', ({ messageId }) => {
    //   // Handle read receipt
    // });

    // Cleanup on unmount
    return () => {
      leaveConversation(conversationId);
      disconnect();
      
      // TODO: Remove socket event listeners
      // socket.off('newMessage');
      // socket.off('userTyping');
      // socket.off('userStoppedTyping');
      // socket.off('messageRead');
    };
  }, [conversationId, connect, disconnect, joinConversation, leaveConversation, onNewMessage, onTyping, onStopTyping]);

  return {
    connected,
    typingUsers: Array.from(typingUsers),
    sendMessage,
    sendTyping,
    sendStopTyping,
  };
};

export default useSocketChat;
