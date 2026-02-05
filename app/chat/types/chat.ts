// ==========================================
// Chat TypeScript Types
// Backend Integration: Replace with API types
// ==========================================

/**
 * User/Participant type
 */
export interface Participant {
  id: string;
  name: string;
  avatar?: string;
  role: 'user' | 'vendor';
}

/**
 * Message type
 */
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
  type: 'text' | 'image' | 'file';
  // TODO: Add attachment field when API supports file uploads
  // attachment?: {
  //   url: string;
  //   name: string;
  //   type: string;
  // };
}

/**
 * Conversation type
 */
export interface Conversation {
  id: string;
  participant: Participant;
  lastMessage?: Message;
  unreadCount: number;
  productReference?: {
    id: string;
    name: string;
    image?: string;
  };
  updatedAt: Date;
}

/**
 * Socket event types
 * TODO: Update these based on actual backend Socket.io events
 */
export interface SocketEvents {
  // Outgoing events (client -> server)
  'joinConversation': (conversationId: string) => void;
  'leaveConversation': (conversationId: string) => void;
  'sendMessage': (message: Partial<Message>) => void;
  'typing': (conversationId: string) => void;
  'stopTyping': (conversationId: string) => void;

  // Incoming events (server -> client)
  'newMessage': (message: Message) => void;
  'messageRead': (messageId: string) => void;
  'userTyping': (data: { conversationId: string; userId: string }) => void;
  'userStoppedTyping': (data: { conversationId: string; userId: string }) => void;
}

/**
 * API Response types
 * TODO: Update based on actual API responses
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
