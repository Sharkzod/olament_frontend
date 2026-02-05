// ==========================================
// useChatMessages Hook
// ==========================================
// BACKEND DEVELOPER INTEGRATION GUIDE
//
// 1. FETCH MESSAGES API:
//    Endpoint: GET /api/conversations/:conversationId/messages
//    Response: { success: boolean, data: Message[], error?: string }
//
// 2. SEND MESSAGE API:
//    Endpoint: POST /api/conversations/:conversationId/messages
//    Body: { content: string }
//    Response: { success: boolean, data: Message, error?: string }
//
// 3. MARK READ API:
//    Endpoint: POST /api/messages/read
//    Body: { messageIds: string[] }
//    Response: { success: boolean, error?: string }
//
// 4. SOCKET.IO EVENTS (real-time):
//    - Client -> Server:
//      * 'joinConversation' - { conversationId: string }
//      * 'leaveConversation' - { conversationId: string }
//      * 'sendMessage' - { conversationId: string, content: string }
//      * 'typing' - { conversationId: string }
//      * 'stopTyping' - { conversationId: string }
//
//    - Server -> Client:
//      * 'newMessage' - Message object
//      * 'messageRead' - { messageId: string, conversationId: string }
//      * 'userTyping' - { conversationId: string, userId: string }
//      * 'userStoppedTyping' - { conversationId: string, userId: string }
// ==========================================

"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Message } from "../types/chat";
import { currentUser, mockMessages, createNewMessage } from "../data/mockData";

export const useChatMessages = (conversationId: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const responseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingMessageIdRef = useRef<string | null>(null);

  // ==========================================
  // TODO: Replace with API call
  // const response = await fetch(`/api/conversations/${conversationId}/messages`);
  // const data = await response.json();
  // if (!data.success) throw new Error(data.error);
  // setMessages(data.data);
  // ==========================================
  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;

    try {
      setLoading(true);
      setError(null);

      // Simulate API delay (REMOVE WHEN API IS READY)
      await new Promise((resolve) => setTimeout(resolve, 300));
      const conversationMessages = mockMessages[conversationId] || [];
      setMessages(conversationMessages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch messages");
      console.error("Error fetching messages:", err);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  // ==========================================
  // TODO: Replace with API call
  // const response = await fetch(`/api/conversations/${conversationId}/messages`, {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({ content }),
  // });
  // const data = await response.json();
  // if (!data.success) throw new Error(data.error);
  // return data.data;
  // ==========================================
  const sendMessage = useCallback(
    async (content: string) => {
      if (!conversationId || !content.trim()) return;

      try {
        setSending(true);

        // Create the message locally first (optimistic update)
        // TODO: Remove when API is ready, server will return the message
        const newMessage = createNewMessage(conversationId, currentUser.id, content);
        pendingMessageIdRef.current = newMessage.id;
        setMessages((prev) => [...prev, newMessage]);

        // Simulate API delay (REMOVE WHEN API IS READY)
        await new Promise((resolve) => setTimeout(resolve, 200));

        // Update message status to delivered
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === newMessage.id ? { ...msg, status: "delivered" } : msg
          )
        );

        // ==========================================
        // TODO: Socket.io Integration
        // socket.emit("sendMessage", { conversationId, content });
        // socket.emit("stopTyping", { conversationId });
        // ==========================================

        // ==========================================
        // SIMULATED VENDOR RESPONSE (Demo Only)
        // TODO: Remove this block when backend is connected
        // The backend should emit 'newMessage' event when vendor replies
        // ==========================================
        
        // Show typing indicator after user sends message
        // TODO: Replace with socket event from backend
        setTimeout(() => {
          setIsTyping(true);

          // Hide typing indicator and show response after delay
          typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);

            // Create automated vendor response (REMOVE WHEN API IS READY)
            const vendorResponse = createNewMessage(
              conversationId,
              "vendor1",
              "Thanks for contacting us! We'll get back to you shortly."
            );
            vendorResponse.status = "sent";

            setMessages((prev) => [...prev, vendorResponse]);

            // Simulate message delivery status update (REMOVE WHEN API IS READY)
            setTimeout(() => {
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === vendorResponse.id
                    ? { ...msg, status: "delivered" }
                    : msg
                )
              );
            }, 500);
          }, 1500); // Show typing for 1.5 seconds
        }, 500);

        return newMessage;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to send message");
        console.error("Error sending message:", err);

        // Remove the optimistically added message on error
        if (pendingMessageIdRef.current) {
          setMessages((prev) =>
            prev.filter((msg) => msg.id !== pendingMessageIdRef.current)
          );
        }
        throw err;
      } finally {
        setSending(false);
        pendingMessageIdRef.current = null;
      }
    },
    [conversationId]
  );

  // ==========================================
  // TODO: Socket.io Integration
  // socket.on("newMessage", (message: Message) => {
  //   receiveMessage(message);
  // });
  // ==========================================
  const receiveMessage = useCallback((message: Message) => {
    setMessages((prev) => {
      if (prev.some((msg) => msg.id === message.id)) {
        return prev;
      }
      return [...prev, message];
    });
  }, []);

  // ==========================================
  // TODO: Replace with API call
  // await fetch("/api/messages/read", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({ messageIds }),
  // });
  // ==========================================
  const markAsRead = useCallback(async (messageIds: string[]) => {
    // Optimistic update
    setMessages((prev) =>
      prev.map((msg) =>
        messageIds.includes(msg.id) ? { ...msg, status: "read" } : msg
      )
    );
  }, []);

  // Clear typing indicator
  const clearTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (responseTimeoutRef.current) {
      clearTimeout(responseTimeoutRef.current);
    }
    setIsTyping(false);
  }, []);

  // ==========================================
  // TODO: Socket.io Integration
  // socket.on("userTyping", ({ conversationId, userId }) => {
  //   if (userId !== currentUser.id) {
  //     handleTyping();
  //   }
  // });
  // ==========================================
  const handleTyping = useCallback(() => {
    if (!isTyping) {
      setIsTyping(true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 3000);
  }, [isTyping]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (responseTimeoutRef.current) {
        clearTimeout(responseTimeoutRef.current);
      }
    };
  }, []);

  // Fetch messages when conversation changes
  useEffect(() => {
    if (conversationId) {
      void fetchMessages();
    } else {
      setMessages([]);
    }
  }, [conversationId, fetchMessages]);

  return {
    messages,
    loading,
    sending,
    error,
    isTyping,
    sendMessage,
    receiveMessage,
    markAsRead,
    handleTyping,
    clearTyping,
    refetch: fetchMessages,
  };
};

export default useChatMessages;
