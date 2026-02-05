// ==========================================
// EmptyState Component
// ==========================================

'use client';

import React from 'react';

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Empty state component for when there's no conversation or messages
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Conversation Yet',
  message = 'Start a conversation with a vendor!',
  icon,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
      {/* Icon */}
      <div className="mb-4 text-gray-300">
        {icon || (
          <svg
            className="w-16 h-16 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        )}
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900 mb-1 font-sans">{title}</h3>

      {/* Message */}
      <p className="text-sm text-gray-500 mb-4 max-w-sm font-sans">{message}</p>

      {/* Action button */}
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-2.5 bg-yellow-400 text-gray-900 rounded-full font-medium text-sm hover:bg-yellow-300 transition-colors shadow-md hover:shadow-lg"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

/**
 * Loading skeleton for chat
 */
export const ChatLoadingSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col h-full">
      {/* Header skeleton */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100">
        <div className="w-10 h-10 rounded-full bg-gray-100 animate-pulse" />
        <div className="flex-1">
          <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
          <div className="h-3 w-16 bg-gray-100 rounded animate-pulse mt-1" />
        </div>
      </div>

      {/* Messages skeleton */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {/* Mock messages */}
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`flex w-full ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                i % 2 === 0
                  ? 'bg-yellow-100'
                  : 'bg-gray-100'
              }`}
            >
              <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      {/* Input skeleton */}
      <div className="p-3 bg-white border-t border-gray-100">
        <div className="h-12 bg-gray-100 rounded-full animate-pulse" />
      </div>
    </div>
  );
};

export default EmptyState;
