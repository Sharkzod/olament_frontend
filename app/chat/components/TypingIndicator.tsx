// ==========================================
// TypingIndicator Component
// ==========================================

'use client';

import React from 'react';

interface TypingIndicatorProps {
  participantName?: string;
}

/**
 * Animated typing indicator component
 */
export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  participantName = 'Someone',
}) => {
  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <div className="flex items-center gap-1 bg-gray-100 rounded-full px-4 py-2">
        {/* Animated dots */}
        <div className="flex gap-1">
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.32s]" />
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.16s]" />
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
        </div>
      </div>
      <span className="text-xs text-gray-400">{participantName} is typing...</span>
    </div>
  );
};

/**
 * Alternative typing indicator for multiple users
 */
export const MultipleTypingIndicator: React.FC<{
  names: string[];
}> = ({ names }) => {
  if (names.length === 0) return null;

  const displayText =
    names.length === 1
      ? `${names[0]} is typing...`
      : `${names.slice(0, -1).join(', ')} and ${names.slice(-1)} are typing...`;

  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <div className="flex items-center gap-1 bg-gray-100 rounded-full px-4 py-2">
        <div className="flex gap-1">
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.32s]" />
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.16s]" />
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
        </div>
      </div>
      <span className="text-xs text-gray-400">{displayText}</span>
    </div>
  );
};

export default TypingIndicator;
