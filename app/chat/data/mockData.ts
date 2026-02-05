// ==========================================
// Mock Data for Chat Feature
// TODO: Replace with actual API calls
// ==========================================

import { Conversation, Message, Participant } from '../types/chat';

// Current user (simulated logged-in user)
export const currentUser: Participant = {
  id: 'user1',
  name: 'John Doe',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
  role: 'user',
};

// Mock participants (vendors)
export const mockParticipants: Record<string, Participant> = {
  vendor1: {
    id: 'vendor1',
    name: 'Tech Gadgets Store',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tech',
    role: 'vendor',
  },
  vendor2: {
    id: 'vendor2',
    name: 'Fashion Hub',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fashion',
    role: 'vendor',
  },
  vendor3: {
    id: 'vendor3',
    name: 'Home Essentials',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Home',
    role: 'vendor',
  },
};

// Mock messages
const createMessage = (
  id: string,
  senderId: string,
  content: string,
  timestamp: Date,
  status: Message['status'] = 'read'
): Message => ({
  id,
  conversationId: 'conv1',
  senderId,
  content,
  timestamp,
  status,
  type: 'text',
});

// Generate timestamps for messages
const now = new Date();
const timestamps = [
  new Date(now.getTime() - 24 * 60 * 60 * 1000), // 1 day ago
  new Date(now.getTime() - 23 * 60 * 60 * 1000), // 23 hours ago
  new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
  new Date(now.getTime() - 1 * 60 * 60 * 1000), // 1 hour ago
  new Date(now.getTime() - 30 * 60 * 1000), // 30 minutes ago
  new Date(now.getTime() - 5 * 60 * 1000), // 5 minutes ago
];

export const mockMessages: Record<string, Message[]> = {
  conv1: [
    createMessage('m1', 'vendor1', 'Hello! Welcome to Tech Gadgets Store. How can I help you today?', timestamps[0], 'read'),
    createMessage('m2', 'user1', 'Hi! I saw your wireless earbuds on sale. Are they still available?', timestamps[1], 'read'),
    createMessage('m3', 'vendor1', 'Yes, absolutely! The wireless earbuds are in stock and ready to ship.', timestamps[2], 'read'),
    createMessage('m4', 'vendor1', 'They come with 30-day battery life and noise cancellation.', timestamps[2], 'read'),
    createMessage('m5', 'user1', 'That sounds amazing! What\'s the price?', timestamps[3], 'read'),
    createMessage('m6', 'vendor1', "They're currently ₦75,000, down from ₦120,000. Limited time offer!", timestamps[4], 'read'),
    createMessage('m7', 'user1', 'Great! I\'d like to place an order.', timestamps[5], 'delivered'),
  ],
  conv2: [
    createMessage('m8', 'vendor2', 'Hi there! Thanks for your interest in our collection.', timestamps[0], 'read'),
    createMessage('m9', 'user1', 'Do you have this shirt in size M?', timestamps[1], 'read'),
    createMessage('m10', 'vendor2', 'Let me check that for you...', timestamps[2], 'read'),
    createMessage('m11', 'vendor2', 'Yes, we have size M in stock!', timestamps[4], 'read'),
  ],
  conv3: [
    createMessage('m12', 'vendor3', 'Your order has been shipped!', timestamps[2], 'read'),
    createMessage('m13', 'user1', 'Thank you! When should I expect delivery?', timestamps[3], 'read'),
    createMessage('m14', 'vendor3', 'You should receive it within 2-3 business days.', timestamps[4], 'read'),
  ],
  // Smart Fitness Watch conversation (from product inquiry)
  conv_fitness: [
    createMessage('fw1', 'vendor1', 'Hello! Welcome to Tech Gadgets Store. How can I help you today?', new Date(Date.now() - 5 * 60 * 1000), 'read'),
    createMessage('fw2', 'user1', 'Hi, I\'m interested in "Smart Fitness Watch". Is this still available?', new Date(Date.now() - 4 * 60 * 1000), 'read'),
    createMessage('fw3', 'vendor1', 'Hi! Yes, the Smart Fitness Watch is in stock! It\'s one of our best sellers.', new Date(Date.now() - 3 * 60 * 1000), 'read'),
    createMessage('fw4', 'vendor1', 'It features heart rate monitoring, sleep tracking, and 7-day battery life.', new Date(Date.now() - 3 * 60 * 1000), 'read'),
    createMessage('fw5', 'user1', 'That sounds perfect! What\'s the price?', new Date(Date.now() - 2 * 60 * 1000), 'read'),
    createMessage('fw6', 'vendor1', 'It\'s ₦125,000. Would you like me to reserve one for you?', new Date(Date.now() - 1 * 60 * 1000), 'delivered'),
  ],
};

// Mock conversations
export const mockConversations: Conversation[] = [
  {
    id: 'conv1',
    participant: mockParticipants.vendor1,
    lastMessage: mockMessages.conv1[mockMessages.conv1.length - 1],
    unreadCount: 0,
    productReference: {
      id: 'prod1',
      name: 'Wireless Earbuds Pro',
      image: 'https://picsum.photos/seed/earbuds/100/100',
    },
    updatedAt: timestamps[5],
  },
  {
    id: 'conv2',
    participant: mockParticipants.vendor2,
    lastMessage: mockMessages.conv2[mockMessages.conv2.length - 1],
    unreadCount: 1,
    productReference: {
      id: 'prod2',
      name: 'Classic Cotton Shirt',
      image: 'https://picsum.photos/seed/shirt/100/100',
    },
    updatedAt: timestamps[4],
  },
  {
    id: 'conv3',
    participant: mockParticipants.vendor3,
    lastMessage: mockMessages.conv3[mockMessages.conv3.length - 1],
    unreadCount: 0,
    updatedAt: timestamps[4],
  },
  {
    id: 'conv_fitness',
    participant: mockParticipants.vendor1,
    lastMessage: mockMessages.conv_fitness[mockMessages.conv_fitness.length - 1],
    unreadCount: 0,
    productReference: {
      id: 'prod_fitness',
      name: 'Smart Fitness Watch',
      image: 'https://picsum.photos/seed/fitness/100/100',
    },
    updatedAt: new Date(Date.now() - 1 * 60 * 1000),
  },
];

// Helper to generate a new message
export const createNewMessage = (
  conversationId: string,
  senderId: string,
  content: string
): Message => ({
  id: `msg_${Date.now()}`,
  conversationId,
  senderId,
  content,
  timestamp: new Date(),
  status: 'sent',
  type: 'text',
});
