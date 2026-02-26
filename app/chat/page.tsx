// app/chat/[id]/page.tsx - CORRECTED
'use client';

import React, { useState, useCallback, useEffect, useMemo, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useChatMessages } from '@/app/lib/hooks/useChatMessages';
import { useSocketChat } from '@/app/lib/hooks/useSocketChat';
import { useAuth } from '@/app/lib/hooks/useAuthApi';
import { useOffers } from '@/app/lib/hooks/useOffers';
import apiClient from '@/app/lib/api/apiClient';

// Components
import ChatHeader from './components/ChatHeader';
import ChatWindow from './components/ChatWindow';
import MessageInput from './components/MessageInput';
import MakeOfferModal from './components/MakeOfferModal';
import CounterOfferModal from './components/CounterOfferModal';
import { ChatLoadingSkeleton } from './components/EmptyState';

// Icons
import { ChevronLeft } from 'lucide-react';

interface ChatParticipant {
  id: string;
  name: string;
  avatar?: string;
  role: 'user' | 'vendor';
  online: boolean;
}

const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
};

const getChatParticipant = (chat: any, currentUserId: string): ChatParticipant | null => {
  if (!chat || !currentUserId) return null;
  
  const isBuyer = chat.buyer.id === currentUserId || chat.buyer._id === currentUserId;
  const otherParticipant = isBuyer ? chat.seller : chat.buyer;
  
  return {
    id: otherParticipant._id || otherParticipant.id,
    name: otherParticipant.name,
    avatar: otherParticipant.avatar !== 'default-avatar.png' ? otherParticipant.avatar : undefined,
    role: isBuyer ? 'vendor' : 'user',
    online: otherParticipant.accountStatus === 'active',
  };
};

// RENAME THIS TO ChatPageContent
function ChatPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading, isInitialized } = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  const [prefilledMessage, setPrefilledMessage] = useState('');
  const [showMakeOfferModal, setShowMakeOfferModal] = useState(false);
  const [showCounterOfferModal, setShowCounterOfferModal] = useState(false);
  const [counterOfferTarget, setCounterOfferTarget] = useState<{ offerId: string; price: number; quantity: number } | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const conversationId = searchParams.get('conversationId');
  const currentUserId = user?._id || user?.id;

  // Redirect to login if not authenticated
  useEffect(() => {
    if (isInitialized && !authLoading && !user) {
      console.log('🚫 Not authenticated, redirecting to login');
      router.push('/login');
    }
  }, [isInitialized, authLoading, user, router]);

  // Socket connection
  const { 
    socket, 
    isConnected, 
    lastMessage,
    sendTypingIndicator, 
    emitMessageRead, 
    joinConversation,
    leaveConversation,
  } = useSocketChat();

  // Fetch the specific chat directly by ID
  const [currentChat, setCurrentChat] = useState<any>(null);
  const [chatLoading, setChatLoading] = useState(true);

  useEffect(() => {
    if (!conversationId || !currentUserId) {
      setChatLoading(false);
      return;
    }

    let cancelled = false;
    setChatLoading(true);

    apiClient.get(`/chats/${conversationId}`)
      .then((res) => {
        if (!cancelled && res.data?.success) {
          setCurrentChat(res.data.data);
        }
      })
      .catch((err) => {
        console.error('Error fetching chat:', err);
      })
      .finally(() => {
        if (!cancelled) setChatLoading(false);
      });

    return () => { cancelled = true; };
  }, [conversationId, currentUserId]);

  const participant = useMemo(() => {
    if (!currentUserId) return null;
    return getChatParticipant(currentChat, currentUserId);
  }, [currentChat, currentUserId]);

  // Read query parameters
  useEffect(() => {
    const message = searchParams.get('message');
    if (message) {
      setPrefilledMessage(decodeURIComponent(message));
    }
  }, [searchParams]);

  // Handle window resize
  useEffect(() => {
    const checkMobile = () => setIsMobile(isMobileDevice());
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch messages
  const {
    messages,
    loading: messagesLoading,
    sending,
    isTyping,
    sendMessage,
    receiveMessage,
    markAsRead,
    setIsTyping,
    error: messagesError,
    fetchMessages
  } = useChatMessages(conversationId || '', {
    autoFetch: !!conversationId && !!currentUserId,
  });

  // Offers hook
  const {
    makeOffer,
    respond: respondToOffer,
    counter: counterOffer,
    withdraw: withdrawOffer,
    fetchOffers,
    updateOfferStatus,
  } = useOffers(conversationId || '', {
    autoFetch: !!conversationId && !!currentUserId,
  });

  // Setup socket listeners
  useEffect(() => {
    if (!socket || !conversationId || !currentUserId) return;

    const handleConnect = () => {
      console.log('✅ Socket connected, joining conversation:', conversationId);
      joinConversation(conversationId);
    };

    const handleNewMessage = (data: any) => {
      const message = data.message || data;
      const messageConvId = data.conversationId || message.conversation || message.chat;
      
      if (messageConvId === conversationId) {
        receiveMessage(message);
      }
    };

    const handleTyping = ({ userId, isTyping: typing }: any) => {
      if (userId !== currentUserId) {
        setIsTyping(typing);
      }
    };

    const handleOfferUpdate = (data: any) => {
      if (data.chatId === conversationId) {
        // Refresh messages to get updated offer statuses
        fetchMessages();
      }
    };

    socket.on('connect', handleConnect);
    socket.on('newMessage', handleNewMessage);
    socket.on('typing', handleTyping);
    socket.on('offerUpdate', handleOfferUpdate);

    if (isConnected) {
      joinConversation(conversationId);
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('newMessage', handleNewMessage);
      socket.off('typing', handleTyping);
      socket.off('offerUpdate', handleOfferUpdate);

      if (conversationId) {
        leaveConversation(conversationId);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, isConnected, conversationId, currentUserId, receiveMessage, setIsTyping, joinConversation, leaveConversation]);

  // Handle typing
  const handleTyping = useCallback(() => {
    if (conversationId && isConnected && currentUserId) {
      sendTypingIndicator(conversationId, true);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        if (isConnected) {
          sendTypingIndicator(conversationId, false);
        }
      }, 3000);
    }
  }, [conversationId, sendTypingIndicator, isConnected, currentUserId]);

  // Send message handler
  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!conversationId || !content.trim() || !currentUserId) return;

      try {
        if (isConnected) {
          sendTypingIndicator(conversationId, false);
        }
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        await sendMessage(content);
        
        if (prefilledMessage) {
          setPrefilledMessage('');
        }
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    },
    [sendMessage, prefilledMessage, conversationId, sendTypingIndicator, isConnected, currentUserId]
  );

  // Mark as read
  useEffect(() => {
    if (messages.length > 0 && currentUserId && conversationId && isConnected) {
      const unreadMessages = messages
        .filter((m) => m.senderId !== currentUserId && m.status !== 'read')
        .map((m) => m.id)
        .filter(id => id && id !== 'undefined');
      
      if (unreadMessages.length > 0) {
        markAsRead(unreadMessages);
        emitMessageRead(conversationId, unreadMessages);
      }
    }
  }, [messages, markAsRead, currentUserId, emitMessageRead, conversationId, isConnected]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Message structure debugging
  useEffect(() => {
    if (messages.length > 0) {
      console.log('First message structure:', messages[0]);
      console.log('Timestamp field type:', typeof messages[0].timestamp);
      console.log('CreatedAt field:', messages[0].createdAt);
    }
  }, [messages]);

  // Offer handlers
  const handleMakeOffer = useCallback(async (price: number, quantity: number, message?: string) => {
    await makeOffer(price, quantity, message);
    await fetchMessages();
  }, [makeOffer, fetchMessages]);

  const handleAcceptOffer = useCallback(async (offerId: string) => {
    await respondToOffer(offerId, 'accept');
    await fetchMessages();
  }, [respondToOffer, fetchMessages]);

  const handleDeclineOffer = useCallback(async (offerId: string) => {
    await respondToOffer(offerId, 'decline');
    await fetchMessages();
  }, [respondToOffer, fetchMessages]);

  const handleCounterOffer = useCallback((offerId: string) => {
    // Find the offer data from messages to get price/quantity
    const offerMsg = messages.find(m => m.offerData?.offerId === offerId);
    const price = offerMsg?.offerData?.price || 0;
    const quantity = offerMsg?.offerData?.quantity || 1;
    setCounterOfferTarget({ offerId, price, quantity });
    setShowCounterOfferModal(true);
  }, [messages]);

  const handleCounterOfferSubmit = useCallback(async (offerId: string, price: number, quantity: number, message?: string) => {
    await counterOffer(offerId, price, quantity, message);
    await fetchMessages();
  }, [counterOffer, fetchMessages]);

  const handleWithdrawOffer = useCallback(async (offerId: string) => {
    await withdrawOffer(offerId);
    await fetchMessages();
  }, [withdrawOffer, fetchMessages]);

  // Product info from current chat for the offer modal
  const chatProduct = useMemo(() => {
    if (!currentChat?.product) return null;
    const p = currentChat.product;
    return {
      name: p.name,
      image: p.images?.[0]?.url,
      price: p.price,
    };
  }, [currentChat]);

  const transformedMessages = useMemo(() => {
    return messages.map(message => {
      return {
        ...message,
        conversationId: conversationId || '',
        timestamp: new Date(message.timestamp || message.createdAt || Date.now()),
      };
    });
  }, [messages, conversationId]);

  if (!conversationId) {
    return (
      <div className="h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="text-center px-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No conversation selected</h3>
          <button
            onClick={() => router.push('/orders')}
            className="px-6 py-2.5 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
          >
            Go to Messages
          </button>
        </div>
      </div>
    );
  }

  if (!isInitialized || authLoading) {
    return (
      <div className="h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mb-4"></div>
        <p className="text-sm text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!user || !currentUserId) {
    return null;
  }

  if (messagesLoading) {
    return (
      <div className="h-screen bg-gray-50 flex flex-col">
        <header className="h-14 bg-white border-b flex items-center px-4">
          <button onClick={() => router.push('/orders')} className="p-2">
            <ChevronLeft className="w-5 h-5" />
          </button>
        </header>
        <ChatLoadingSkeleton />
      </div>
    );
  }

  if (messagesError) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Failed to load messages</h3>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-yellow-500 text-white rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (chatLoading) {
    return (
      <div className="h-screen bg-gray-50 flex flex-col">
        <header className="h-14 bg-white border-b flex items-center px-4">
          <button onClick={() => router.push('/orders')} className="p-2">
            <ChevronLeft className="w-5 h-5" />
          </button>
        </header>
        <ChatLoadingSkeleton />
      </div>
    );
  }

  if (!participant) {
    return (
      <div className="h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="text-center px-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to load chat participant</h3>
          <button
            onClick={() => router.push('/orders')}
            className="px-6 py-2.5 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
          >
            Go to Messages
          </button>
        </div>
      </div>
    );
  }

  // REMOVE SUSPENSE FROM HERE - just return the JSX directly
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <ChatHeader
        participant={participant}
        onBack={() => router.push('/orders')}
        isMobile={isMobile}
      />
      <div className="flex-1 overflow-hidden">
        <ChatWindow
          messages={transformedMessages}
          participant={participant}
          currentUserId={currentUserId}
          isTyping={isTyping}
          onAcceptOffer={handleAcceptOffer}
          onDeclineOffer={handleDeclineOffer}
          onCounterOffer={handleCounterOffer}
          onWithdrawOffer={handleWithdrawOffer}
        />
      </div>

      <div className="bg-white border-t shrink-0">
        <MessageInput
          onSendMessage={handleSendMessage}
          sending={sending}
          placeholder="Write a Message"
          initialMessage={prefilledMessage}
          onTyping={handleTyping}
          onMakeOffer={() => setShowMakeOfferModal(true)}
        />
      </div>

      {/* Offer Modals */}
      <MakeOfferModal
        isOpen={showMakeOfferModal}
        onClose={() => setShowMakeOfferModal(false)}
        onSubmit={handleMakeOffer}
        productName={chatProduct?.name}
        productImage={chatProduct?.image}
        listedPrice={chatProduct?.price}
      />

      {counterOfferTarget && (
        <CounterOfferModal
          isOpen={showCounterOfferModal}
          onClose={() => {
            setShowCounterOfferModal(false);
            setCounterOfferTarget(null);
          }}
          onSubmit={handleCounterOfferSubmit}
          offerId={counterOfferTarget.offerId}
          originalPrice={counterOfferTarget.price}
          originalQuantity={counterOfferTarget.quantity}
        />
      )}
    </div>
  );
}

// NEW DEFAULT EXPORT - WRAP THE ENTIRE COMPONENT HERE
export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mb-4"></div>
          <p className="text-sm text-gray-600 font-medium">Loading chat...</p>
        </div>
      </div>
    }>
      <ChatPageContent />
    </Suspense>
  );
}