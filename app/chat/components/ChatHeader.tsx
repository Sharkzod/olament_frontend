// ==========================================
// ChatHeader - Clean, Modern Header Design
// ==========================================

"use client";

import React, { useState } from "react";
import { Participant } from "../types/chat";

interface ChatHeaderProps {
  participant: Participant | null;
  onBack?: () => void;
  isMobile?: boolean;
}

const OnlineDot: React.FC<{ isOnline: boolean }> = ({ isOnline }) => (
  <span
    className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
      isOnline ? "bg-green-500" : "bg-gray-300"
    }`}
  />
);

// Grey user icon
const UserIcon: React.FC<{ className?: string }> = ({
  className = "w-5 h-5",
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

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  participant,
  onBack,
  isMobile = false,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const isOnline = true;

  if (!participant) {
    return (
      <header className="flex items-center px-3 h-14 border-b border-gray-100 bg-white">
        <button
          onClick={onBack}
          className="p-2 -ml-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          aria-label="Back"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <div className="ml-2 w-8 h-8 rounded-full bg-gray-100 animate-pulse" />
      </header>
    );
  }

  return (
    <>
      <header className="flex items-center justify-between px-3 h-14 border-b border-gray-100 bg-white sticky top-0 z-10">
        {/* Left: Back + Avatar + Name */}
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={onBack}
            className="p-2 -ml-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer shrink-0"
            aria-label="Back"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-gray-400" />
            </div>
            <OnlineDot isOnline={isOnline} />
          </div>

          {/* Name + Status */}
          <div className="min-w-0">
            <h2 className="text-[15px] font-medium text-gray-900 truncate">
              {participant.name}
            </h2>
            <p className="text-xs text-gray-500 truncate capitalize font-normal">
              {participant.role === "vendor"
                ? isOnline
                  ? "Online"
                  : "Offline"
                : "Online"}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-full transition-colors cursor-pointer"
            aria-label="Voice call"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
          </button>

          <button
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-full transition-colors cursor-pointer"
            aria-label="Video call"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </button>

          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-full transition-colors cursor-pointer"
            aria-label="More options"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
              />
            </svg>
          </button>
        </div>
      </header>

      {/* Dropdown menu */}
      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-20"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-3 top-14 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-30 min-w-[180px]">
            <button
              onClick={() => {
                setShowMenu(false);
              }}
              className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 cursor-pointer font-normal"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              View Profile
            </button>

            <button
              onClick={() => {
                setShowMenu(false);
              }}
              className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 cursor-pointer font-normal"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              Search Messages
            </button>

            <button
              onClick={() => {
                setShowMenu(false);
              }}
              className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 cursor-pointer font-normal"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                />
              </svg>
              Mute Notifications
            </button>

            <div className="border-t border-gray-100 my-1" />

            <button
              onClick={() => {
                setShowMenu(false);
              }}
              className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 cursor-pointer font-normal"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                />
              </svg>
              Archive
            </button>

            <button
              onClick={() => {
                setShowMenu(false);
              }}
              className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 cursor-pointer font-normal"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Delete
            </button>

            <div className="border-t border-gray-100 my-1" />

            <button
              onClick={() => {
                setShowMenu(false);
              }}
              className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 cursor-pointer font-normal"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                />
              </svg>
              Block
            </button>

            <button
              onClick={() => {
                setShowMenu(false);
              }}
              className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 cursor-pointer font-normal"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
                />
              </svg>
              Report Issue
            </button>
          </div>
        </>
      )}
    </>
  );
};

export default ChatHeader;
