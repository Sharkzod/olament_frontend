// ==========================================
// ChatWindow - Smooth Scrollable Message Area
// ==========================================

"use client";

import React, { useRef, useLayoutEffect } from "react";
import { Message, Participant } from "../types/chat";
import MessageBubble from "./MessageBubble";

interface ChatWindowProps {
  messages: Message[];
  participant: Participant;
  currentUserId: string;
  isTyping?: boolean;
  onAcceptOffer?: (offerId: string) => Promise<void>;
  onDeclineOffer?: (offerId: string) => Promise<void>;
  onCounterOffer?: (offerId: string) => void;
  onWithdrawOffer?: (offerId: string) => Promise<void>;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  participant,
  currentUserId,
  isTyping = false,
  onAcceptOffer,
  onDeclineOffer,
  onCounterOffer,
  onWithdrawOffer,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useLayoutEffect(() => {
    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <div
      ref={scrollRef}
      className="h-full overflow-y-auto px-2 py-3 space-y-1"
      style={{ 
        overflowY: "auto",
        WebkitOverflowScrolling: "touch"
      }}
    >
      {/* Date separator - first message */}
      {messages.length > 0 && (
        <div className="flex justify-center my-3">
          <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full font-normal">
            {new Date(messages[0].timestamp).toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
      )}

      {/* Messages */}
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-400">
          <p className="text-sm">No messages yet. Start a conversation!</p>
        </div>
      ) : (
        messages.map((message, index) => {
          const isOutgoing = message.senderId === currentUserId;
          // Show avatar only for the first message in a sequence
          const showAvatar =
            index === 0 || messages[index - 1]?.senderId !== message.senderId;
          // Consecutive message when previous message is from same sender
          const isConsecutive = index > 0 && messages[index - 1]?.senderId === message.senderId;

          return (
            <MessageBubble
              key={message.id}
              message={message}
              isOutgoing={isOutgoing}
              participant={participant}
              showAvatar={showAvatar && !isOutgoing}
              isConsecutive={isConsecutive}
              currentUserId={currentUserId}
              onAcceptOffer={onAcceptOffer}
              onDeclineOffer={onDeclineOffer}
              onCounterOffer={onCounterOffer}
              onWithdrawOffer={onWithdrawOffer}
            />
          );
        })
      )}

      {/* Typing indicator */}
      {isTyping && (
        <div className="flex items-center gap-2 mt-2">
          {/* Vendor avatar for typing indicator */}
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>

          {/* Typing dots */}
          <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1">
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      )}

      {/* Spacer */}
      <div className="h-2" />
    </div>
  );
};

export default ChatWindow;
