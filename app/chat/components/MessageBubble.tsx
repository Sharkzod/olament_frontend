// ==========================================
// MessageBubble - Clean, Premium Messaging UI
// ==========================================

"use client";

import React from "react";
import { Message, Participant } from "../types/chat";
import OfferCard from "./OfferCard";

interface MessageBubbleProps {
  message: Message;
  showAvatar?: boolean;
  avatar?: string;
  participant?: Participant;
  isOutgoing?: boolean;
  isConsecutive?: boolean;
  currentUserId?: string;
  onAcceptOffer?: (offerId: string) => Promise<void>;
  onDeclineOffer?: (offerId: string) => Promise<void>;
  onCounterOffer?: (offerId: string) => void;
  onWithdrawOffer?: (offerId: string) => Promise<void>;
}

const formatTime = (date: Date): string => {
  const d = new Date(date);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

// Status icon - read receipts
const StatusIcon: React.FC<{ status: Message["status"] }> = ({ status }) => {
  if (status === "read") {
    return (
      <svg className="w-4 h-4 text-blue-500" viewBox="0 0 18 12" fill="none">
        <path
          d="M1.5 5.5L5 9L9 3.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6.5 5.5L10 9L16 2"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (status === "delivered") {
    return (
      <svg className="w-4 h-4 text-gray-400" viewBox="0 0 18 12" fill="none">
        <path
          d="M1.5 5.5L5 9L9 3.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6.5 5.5L10 9L16 2"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg className="w-4 h-4 text-gray-400" viewBox="0 0 14 10" fill="none">
      <path
        d="M1.5 5L5 8.5L12.5 1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

// Grey user icon for incoming messages
const UserIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
);

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  showAvatar = false,
  avatar,
  isOutgoing: propIsOutgoing,
  isConsecutive = false,
  currentUserId,
  onAcceptOffer,
  onDeclineOffer,
  onCounterOffer,
  onWithdrawOffer,
}) => {
  // Determine if message is outgoing based on prop or message sender
  const isOutgoing = propIsOutgoing ?? message.senderId === "user1";

  return (
    <div
      className={`flex w-full px-2 ${
        isOutgoing ? "justify-end" : "justify-start"
      } ${isConsecutive ? "mt-0.5" : "mt-3"}`}
    >
      {/* Avatar - incoming messages only - show for first message in group */}
      {!isOutgoing && showAvatar && (
        <div className="flex-shrink-0 w-8 h-8 mr-2 self-start mt-1">
          {avatar ? (
            <img
              src={avatar}
              alt=""
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-gray-400" />
            </div>
          )}
        </div>
      )}

      {/* Spacer for avatar when not showing avatar on consecutive messages */}
      {!isOutgoing && !showAvatar && <div className="w-10 flex-shrink-0" />}

      {/* Message bubble - Properly constrained width with overflow handling */}
      <div
        className={`max-w-[75%] md:max-w-[60%] ${
          isOutgoing ? "order-1" : "order-2"
        } flex-shrink-0`}
      >
        <div
          className={`px-4 py-2.5 overflow-hidden ${
            isOutgoing
              ? "bg-yellow-400 rounded-2xl rounded-tr-sm"
              : "bg-gray-100 rounded-2xl rounded-tl-sm"
          } ${isConsecutive && !isOutgoing ? "rounded-tl-2xl" : ""} ${
            isConsecutive && isOutgoing ? "rounded-tr-2xl" : ""
          }`}
        >
          {/* Message content - Wraps properly with overflow hidden */}
          {message.type === "offer" && message.offerData ? (
            <OfferCard
              offerData={message.offerData}
              isOutgoing={isOutgoing}
              currentUserId={currentUserId || ''}
              senderId={message.senderId}
              onAccept={onAcceptOffer}
              onDecline={onDeclineOffer}
              onCounter={onCounterOffer}
              onWithdraw={onWithdrawOffer}
            />
          ) : message.type === "text" ? (
            <p
              className="text-[15px] leading-[1.5] text-gray-900 font-normal break-word overflow-wrap-break-word"
              style={{ wordBreak: "break-word", overflowWrap: "break-word" }}
            >
              {message.content}
            </p>
          ) : message.type === "image" ? (
            <div className="space-y-2">
              <div className="bg-gray-200/50 rounded-lg p-4 text-center">
                <span className="text-sm text-gray-500">Image</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-gray-500 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                />
              </svg>
              <span className="text-[15px] leading-[1.5] text-gray-700 font-normal">
                Attachment
              </span>
            </div>
          )}

          {/* Timestamp + Status - ALWAYS shown for outgoing messages */}
          {isOutgoing && (
            <div className="flex items-center gap-1.5 mt-1 justify-end flex-shrink-0">
              <span className="text-xs text-gray-600 font-normal whitespace-nowrap">
                {formatTime(message.timestamp)}
              </span>
              <StatusIcon status={message.status} />
            </div>
          )}

          {/* Timestamp only for incoming messages (even consecutive) */}
          {!isOutgoing && !isConsecutive && (
            <div className="flex items-center gap-1.5 mt-1 justify-start flex-shrink-0">
              <span className="text-xs text-gray-400 font-normal whitespace-nowrap">
                {formatTime(message.timestamp)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
