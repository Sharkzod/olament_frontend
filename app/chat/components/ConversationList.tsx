// ==========================================
// ConversationList - Clean, Modern List Design
// ==========================================

"use client";

import React from "react";
import { Conversation } from "../types/chat";

interface ConversationListProps {
  conversations: Conversation[];
  selectedId?: string;
  onSelect: (conversationId: string) => void;
}

const formatTime = (date: Date): string => {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

// Grey user icon
const UserIcon: React.FC<{ className?: string }> = ({
  className = "w-6 h-6",
}) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
);

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedId,
  onSelect,
}) => {
  if (conversations.length === 0) {
    return (
      <div className="p-4 text-center text-gray-400">
        <p className="text-sm">No conversations</p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto">
      {conversations.map((conversation) => {
        const isSelected = conversation.id === selectedId;
        const hasUnread = conversation.unreadCount > 0;

        return (
          <button
            key={conversation.id}
            onClick={() => onSelect(conversation.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 transition-colors cursor-pointer ${
              isSelected ? "bg-gray-100" : "hover:bg-gray-50"
            }`}
          >
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                <UserIcon className="w-6 h-6 text-gray-400" />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center justify-between gap-2">
                <h3
                  className="text-[15px] font-medium truncate text-gray-900"
                >
                  {conversation.participant.name}
                </h3>
                <span className="text-xs text-gray-500 font-normal shrink-0">
                  {formatTime(conversation.updatedAt)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 mt-0.5">
                <p
                  className={`text-sm truncate ${
                    hasUnread ? "text-gray-900 font-normal" : "text-gray-500 font-normal"
                  }`}
                >
                  {conversation.lastMessage?.content || "Start a conversation"}
                </p>
                {hasUnread && (
                  <span className="w-5 h-5 bg-gray-900 text-white text-xs font-medium rounded-full flex items-center justify-center shrink-0">
                    {conversation.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default ConversationList;
