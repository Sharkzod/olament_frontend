'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, Tag } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  sending: boolean;
  placeholder?: string;
  initialMessage?: string;
  onTyping?: () => void;
  onMakeOffer?: () => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  sending,
  placeholder = 'Type a message...',
  initialMessage = '',
  onTyping,
  onMakeOffer,
}) => {
  const [value, setValue] = useState(initialMessage);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update value when initialMessage changes
  useEffect(() => {
    if (initialMessage) {
      setValue(initialMessage);
      inputRef.current?.focus();
    }
  }, [initialMessage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!value.trim() || sending) return;
    
    onSendMessage(value.trim());
    setValue('');
    inputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    
    // Trigger typing indicator
    if (onTyping) {
      onTyping();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4">
      <div className="flex items-center gap-3">
        {onMakeOffer && (
          <button
            type="button"
            onClick={onMakeOffer}
            className="p-3 text-yellow-600 hover:bg-yellow-50 rounded-xl transition-colors flex-shrink-0"
            title="Make an offer"
          >
            <Tag className="h-5 w-5" />
          </button>
        )}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={sending}
          className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900 placeholder-gray-500"
        />
        <button
          type="submit"
          disabled={!value.trim() || sending}
          className="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-300 disabled:cursor-not-allowed text-gray-900 font-semibold rounded-xl flex items-center gap-2 transition-colors"
        >
          {sending ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="hidden sm:inline">Sending...</span>
            </>
          ) : (
            <>
              <Send className="h-5 w-5" />
              <span className="hidden sm:inline">Send</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default MessageInput;