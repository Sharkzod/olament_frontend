// ==========================================
// Chat Page - Clean, Premium Messaging UI
// ==========================================

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useChatMessages } from './hooks/useChatMessages';
import { useSocketChat } from './hooks/useSocketChat';
import { Message, Participant } from './types/chat';
import { mockParticipants } from './data/mockData';

// Components
import ChatHeader from './components/ChatHeader';
import ChatWindow from './components/ChatWindow';
import MessageInput from './components/MessageInput';
import { ChatLoadingSkeleton } from './components/EmptyState';

// Icons
import { 
  ChevronLeft
} from 'lucide-react';

/**
 * Check if running on mobile
 */
const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
};

/**
 * Main Chat Page - Single Conversation View
 */
export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [isMobile, setIsMobile] = useState(false);
  const [prefilledMessage, setPrefilledMessage] = useState('');
  
  // Get conversation ID from params or use default (conv_fitness for Smart Fitness Watch)
  const conversationId = searchParams.get('conversationId') || 'conv_fitness';
  
  // Get participant info based on conversation
  const participant = mockParticipants.vendor1; // Default to Tech Gadgets Store

  // Read query parameters on mount for pre-filled message
  useEffect(() => {
    const message = searchParams.get('message');
    if (message) {
      setPrefilledMessage(decodeURIComponent(message));
    }
  }, [searchParams]);

  // Handle window resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(isMobileDevice());
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch messages for conversation
  const {
    messages,
    loading: messagesLoading,
    sending,
    isTyping,
    sendMessage,
    receiveMessage,
    markAsRead,
  } = useChatMessages(conversationId);

  // Socket connection for real-time updates
  useSocketChat({
    conversationId,
    onNewMessage: receiveMessage,
  });

  // Navigate to product listing
  const handleBack = useCallback(() => {
    router.push('/product-listing');
  }, [router]);

  // Send message handler
  const handleSendMessage = useCallback(async (content: string) => {
    await sendMessage(content);
    if (prefilledMessage) {
      setPrefilledMessage('');
    }
  }, [sendMessage, prefilledMessage]);

  // Mark messages as read when conversation is opened
  useEffect(() => {
    if (messages.length > 0) {
      const unreadMessages = messages
        .filter((m) => m.senderId !== 'user1' && m.status !== 'read')
        .map((m) => m.id);
      
      if (unreadMessages.length > 0) {
        markAsRead(unreadMessages);
      }
    }
  }, [messages, markAsRead]);

  // Loading state
  if (messagesLoading) {
    return (
      <div className="h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <header className="h-14 bg-white border-b border-gray-100 flex items-center px-4 shrink-0">
          <button
            onClick={handleBack}
            className="p-2 -ml-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
            aria-label="Back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-[15px] font-semibold text-gray-900 ml-2">Loading...</h1>
        </header>
        <div className="flex-1 overflow-hidden">
          <ChatLoadingSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen chat-page flex flex-col bg-gray-50">
      {/* Header */}
      <ChatHeader
        participant={participant}
        onBack={handleBack}
        isMobile={isMobile}
      />

      {/* Chat Window - scrollable area */}
      <div className="flex-1 overflow-hidden">
        <ChatWindow
          messages={messages}
          participant={participant}
          currentUserId="user1"
          isTyping={isTyping}
        />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-100 shrink-0">
        <MessageInput
          onSendMessage={handleSendMessage}
          sending={sending}
          placeholder="Write a Message"
          initialMessage={prefilledMessage}
        />
      </div>
    </div>
  );
}
