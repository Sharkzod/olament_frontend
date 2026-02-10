// ==========================================
// Chat List Page - Integrated with API
// ==========================================

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useChats } from '../lib/hooks/useChats';
import { Chat } from '../lib/api/chatsApi';
import { Search, ChevronRight, MoreVertical, RefreshCw } from 'lucide-react';
import BottomNav from '../components/Sidebar';

/**
 * Get initials from name
 */
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Format timestamp to readable format
 */
const formatTimestamp = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  // Today - show time
  if (diffInDays === 0) {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  // Yesterday
  if (diffInDays === 1) {
    return 'Yesterday';
  }

  // Within a week - show day name
  if (diffInDays < 7) {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  }

  // Older - show date
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Get the other participant in the chat (not the current user)
 */
const getChatParticipant = (chat: Chat, currentUserId: string) => {
  // Determine if current user is buyer or seller
  const isBuyer = chat.buyer.id === currentUserId || chat.buyer._id === currentUserId;
  return isBuyer ? chat.seller : chat.buyer;
};

/**
 * Chat Preview Item Component
 */
interface ChatPreviewItemProps {
  chat: Chat;
  currentUserId: string;
  onClick: () => void;
}

function ChatPreviewItem({ chat, currentUserId, onClick }: ChatPreviewItemProps) {
  const participant = getChatParticipant(chat, currentUserId);
  const primaryImage = chat.product.images.find(img => img.isPrimary) || chat.product.images[0];
  
  // Determine if user is online (you can enhance this with real-time status)
  const isOnline = participant.accountStatus === 'active';

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100"
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
          {participant.avatar && participant.avatar !== 'default-avatar.png' ? (
            <img
              src={participant.avatar}
              alt={participant.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-sm font-medium text-gray-600">
              {getInitials(participant.name)}
            </span>
          )}
        </div>
        {isOnline && (
          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-[15px] font-semibold text-gray-900 truncate">
            {participant.name}
          </h3>
          <span className="text-xs text-gray-500 ml-2 shrink-0">
            {formatTimestamp(chat.updatedAt)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 truncate">
            {chat.product.name}
            {!chat.product.inStock && (
              <span className="text-red-500 ml-1">(Out of stock)</span>
            )}
          </p>
          {chat.unreadCount > 0 && (
            <div className="ml-2 shrink-0 min-w-[20px] h-5 px-1.5 bg-yellow-500 rounded-full flex items-center justify-center">
              <span className="text-xs font-semibold text-white">
                {chat.unreadCount}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Chevron */}
      <ChevronRight className="w-5 h-5 text-gray-300 shrink-0" />
    </div>
  );
}

/**
 * Loading Skeleton Component
 */
function ChatListSkeleton() {
  return (
    <div className="divide-y divide-gray-100">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3">
          <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse" />
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2 animate-pulse" />
            <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Empty State Component
 */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-4 text-center py-16">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <Search className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        No messages yet
      </h3>
      <p className="text-sm text-gray-600">
        Start a conversation with a seller to see your chats here
      </p>
    </div>
  );
}

/**
 * Error State Component
 */
function ErrorState({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-4 text-center py-16">
      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Failed to load chats
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        {error.message || 'Something went wrong'}
      </p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium"
      >
        Try Again
      </button>
    </div>
  );
}

/**
 * Main Chat List Page
 */
export default function ChatListPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch chats using the custom hook
  const {
    chats,
    pagination,
    isLoading,
    error,
    refetch,
    isEmpty,
    totalUnread,
  } = useChats({
    params: {
      page: 1,
      limit: 50, // Fetch more chats initially
    },
    autoFetch: true,
  });

  // Get current user ID (you should replace this with actual auth context)
  const currentUserId = 'user1'; // TODO: Get from auth context

  // Filter chats based on search query
  const filteredChats = useMemo(() => {
  // First deduplicate
  const uniqueChats = chats.filter((chat, index, self) => 
    index === self.findIndex((c) => c._id === chat._id)
  );
  
  if (!searchQuery.trim()) return uniqueChats;

  const query = searchQuery.toLowerCase();
  return uniqueChats.filter((chat) => {
    const participant = getChatParticipant(chat, currentUserId);
    const participantName = participant.name.toLowerCase();
    const productName = chat.product.name.toLowerCase();
    
    return participantName.includes(query) || productName.includes(query);
  });
}, [chats, searchQuery, currentUserId]);

  // Navigate to chat
  const handleChatClick = useCallback((chat: Chat) => {
    router.push(`/chat?conversationId=${chat._id}`);
  }, [router]);

  // Refresh chats
  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 shrink-0">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900">Messages</h1>
            {totalUnread > 0 && (
              <div className="min-w-[20px] h-5 px-1.5 bg-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-xs font-semibold text-white">
                  {totalUnread}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="p-2 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
              aria-label="Refresh chats"
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 ${isLoading ? 'animate-spin' : ''}`} />
            </button> */}
            <button
              className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
              aria-label="More options"
            >
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search messages"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
            />
          </div>
        </div>
      </header>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto bg-white">
        {isLoading && <ChatListSkeleton />}
        
        {error && !isLoading && (
          <ErrorState error={error} onRetry={handleRefresh} />
        )}
        
        {!isLoading && !error && isEmpty && <EmptyState />}
        
        {!isLoading && !error && filteredChats.length === 0 && !isEmpty && (
          <div className="flex flex-col items-center justify-center h-full px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No messages found
            </h3>
            <p className="text-sm text-gray-600">
              Try searching with different keywords
            </p>
          </div>
        )}
        
        {!isLoading && !error && filteredChats.length > 0 && (
          <>
            {filteredChats.map((chat) => (
              <ChatPreviewItem
                key={chat._id}
                chat={chat}
                currentUserId={currentUserId}
                onClick={() => handleChatClick(chat)}
              />
            ))}
            
            {/* Pagination info */}
            {pagination && pagination.pages > 1 && (
              <div className="px-4 py-3 text-center text-sm text-gray-500 border-t border-gray-100">
                Page {pagination.page} of {pagination.pages}
              </div>
            )}
          </>
        )}
      </div>
      <BottomNav/>
    </div>
  );
}