// ==========================================
// MessageInput - Clean, Minimal Chat Input
// ==========================================

"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";

interface MessageInputProps {
  onSendMessage: (content: string) => Promise<void>;
  sending?: boolean;
  placeholder?: string;
  initialMessage?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  sending = false,
  placeholder = "Message...",
  initialMessage = "",
}) => {
  const [message, setMessage] = useState(initialMessage);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const newHeight = Math.min(textarea.scrollHeight, 120);
      textarea.style.height = `${newHeight}px`;
    }
  }, [message]);

  // Focus textarea on mount if there's initial message
  useEffect(() => {
    if (initialMessage && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [initialMessage]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setMessage(e.target.value);
    },
    []
  );

  const handleSend = useCallback(async () => {
    if (!message.trim() || sending) return;

    try {
      await onSendMessage(message.trim());
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  }, [message, sending, onSendMessage]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const canSend = message.trim() && !sending;

  return (
    <div className="w-full bg-white px-3 py-2 border-t border-gray-100">
      <div className="flex items-center gap-2">
        {/* Plus button - circular */}
        <button
          type="button"
          className="flex-shrink-0 w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors cursor-pointer"
          aria-label="Add attachment"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>

        {/* Text input - modern rectangular with rounded corners */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={1}
            disabled={sending}
            className="w-full bg-gray-100 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:bg-gray-50 resize-none min-h-[44px] max-h-[120px] font-normal text-[15px] leading-relaxed"
            style={{ 
              height: "auto",
              overflowY: "auto",
              display: "block"
            }}
          />
        </div>

        {/* Send button - circular */}
        <button
          type="button"
          onClick={handleSend}
          disabled={!canSend}
          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
            canSend
              ? "bg-yellow-400 hover:bg-yellow-500"
              : "bg-gray-200 cursor-not-allowed"
          }`}
          aria-label="Send message"
        >
          <svg className={`w-5 h-5 ${canSend ? "text-gray-900" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
