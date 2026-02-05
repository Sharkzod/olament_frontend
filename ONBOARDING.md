# Olament Project Onboarding Guide

## 1️⃣ High-Level Overview

### Product Vision
**Olament** is a digital marketplace platform designed to "digitize Africa's local markets." It connects local vendors/shops with customers, enabling:
- Browsing markets, shops, and products by Nigerian states/cities
- Direct vendor-customer messaging (real-time chat)
- Product discovery with filtering, search, and sorting
- Vendor management for sellers to manage their shops

### User Roles
1. **Customer** - Browse shops/products, place orders, chat with vendors
2. **Vendor/Seller** - Manage shops, products, respond to customer inquiries
3. **Rider** - Delivery personnel (limited functionality)
4. **Admin** - Platform management (backend only)

### Main Features Implemented
| Feature | Status | Notes |
|---------|--------|-------|
| User Authentication (Login/Signup) | ✅ Complete | JWT-based, role selection |
| Dashboard with Tabs | ✅ Complete | Markets/Shops/Products tabs |
| Product Listing & Filtering | ✅ Complete | Grid/list views, filters |
| Shop Listing & Filtering | ✅ Complete | By state, city, category |
| Profile Management | ✅ Complete | Personal + Business info |
| Real-time Messaging | ✅ Backend + Partial Frontend | Socket.io, chat UI needed |
| Market Browsing | ✅ Complete | By state selection |
| Product Search | ✅ Complete | Debounced search |

### What's Missing (Your Tasks)
- **Product Listing Page** - Create new page at `/app/products-listing/page.tsx`
- **Chat Page** - Create new page at `/app/chat/page.tsx`
- **UI Cleanup** - Fine-tune existing pages

---

## 2️⃣ Tech Stack & Architecture

### Frontend Stack
```
Framework: Next.js 16.1.1 (App Router)
Language: TypeScript 5
Styling: Tailwind CSS 4 (PostCSS, CSS variables)
State Management: React Context API + Custom Hooks
Data Fetching: React Query (@tanstack/react-query) + Axios
Icons: Lucide React 0.525.0
Notifications: react-hot-toast 2.5.2
Fonts: Geist Sans/Mono (Google Fonts via next/font)
```

### Styling System Deep Dive

**Tailwind CSS 4** is the primary styling solution. Here's what you need to know:

#### Configuration
- **Config file**: `postcss.config.mjs` (not `tailwind.config.js`)
- **Tailwind version**: 4.x (uses CSS-first configuration)
- **Import method**: `@import "tailwindcss"` in CSS files

#### Theme Variables (in [`app/globals.css`](olament_frontend/app/globals.css))
```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}
```

#### Tailwind Classes Used Throughout
| Category | Classes | Example |
|----------|---------|---------|
| Colors | `yellow-400`, `gray-900`, `blue-600`, `red-500`, `green-400` | `bg-yellow-400 text-gray-900` |
| Spacing | `p-4`, `m-4`, `gap-4`, `space-y-4` | `px-4 py-3` |
| Typography | `text-sm`, `font-bold`, `text-gray-600` | `text-lg font-semibold` |
| Layout | `flex`, `grid`, `block`, `inline-block` | `flex items-center justify-between` |
| Borders | `border`, `border-gray-200`, `rounded-xl` | `border border-gray-300 rounded-lg` |
| Effects | `shadow-md`, `hover:shadow-lg` | `hover:bg-gray-800` |
| Transitions | `transition-colors`, `transition-all` | `transition-colors duration-200` |
| Responsive | `sm:`, `md:`, `lg:` prefixes | `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` |

#### CSS Modules (Not Used)
This project does NOT use CSS Modules. All styling is done via Tailwind utility classes directly in JSX.

#### Chakra UI (Not Used)
No component library like Chakra UI is installed. All components are built with native HTML + Tailwind.

#### Styling Best Practices Used
1. **Component-scoped styles**: Tailwind classes applied directly to elements
2. **Color consistency**: Hardcoded color values (yellow-400, gray-900, etc.)
3. **Spacing consistency**: Using Tailwind's spacing scale (p-4 = 1rem)
4. **No custom CSS** except for theme variables in `globals.css`
5. **Dark mode**: Handled via CSS media query, no `dark:` class prefix usage seen

### Backend Stack
```
Runtime: Node.js
Framework: Express.js
Database: MongoDB with Mongoose ODM
Authentication: JWT (jsonwebtoken)
Real-time: Socket.io
File Upload: Cloudinary (for images)
Security: Helmet, CORS, Rate Limiting, XSS protection
```

### Backend Stack
```
Runtime: Node.js
Framework: Express.js
Database: MongoDB with Mongoose ODM
Authentication: JWT (jsonwebtoken)
Real-time: Socket.io
File Upload: Cloudinary (for images)
Security: Helmet, CORS, Rate Limiting, XSS protection
```

### Frontend ↔ Backend Communication
- **Protocol**: REST API over HTTP
- **Real-time**: Socket.io WebSockets
- **Base URL**: `http://localhost:5000/api` (configurable via `NEXT_PUBLIC_API_URL`)
- **Auth**: Bearer token in Authorization header
- **CORS**: Configured for localhost:3000

### Key Architectural Patterns
1. **API Client Pattern**: Centralized `apiClient.ts` with interceptors for auth tokens and refresh
2. **Custom Hooks**: Data fetching abstracted into hooks (`useProducts`, `useShop`, `useAuthApi`)
3. **Context Providers**: `AuthProvider` wraps the app for auth state
4. **Component Organization**: Reusable components in `/app/components/`, pages in `/app/`

---

## 3️⃣ Project Structure Walkthrough

```
olament_frontend/
├── app/
│   ├── components/           # Reusable UI components
│   │   ├── Sidebar.tsx       # Bottom navigation (mobile)
│   │   ├── ProtectedRoute.tsx # Auth guard wrapper
│   │   ├── LoadingSpinner.tsx
│   │   └── MyShops.tsx
│   │
│   ├── lib/
│   │   ├── api/              # API client layer
│   │   │   ├── apiClient.ts  # Axios instance with interceptors
│   │   │   ├── authApi.ts
│   │   │   ├── productApi.ts
│   │   │   ├── shopApi.ts
│   │   │   ├── marketApi.ts
│   │   │   ├── ordersApi.ts
│   │   │   ├── categoryApi.ts
│   │   │   ├── profileApi.ts
│   │   │   ├── userApi.ts
│   │   │   └── vendorApi.ts
│   │   │
│   │   ├── hooks/            # Custom React hooks for data fetching
│   │   │   ├── useProducts.ts
│   │   │   ├── useShop.ts
│   │   │   ├── useMarkets.ts
│   │   │   ├── useAuthApi.ts
│   │   │   ├── useProfile.ts
│   │   │   └── ...
│   │   │
│   │   ├── contexts/         # React Context providers
│   │   │   └── AuthContext.tsx
│   │   │
│   │   └── utils/            # Utility functions
│   │       └── cookieStorage.ts
│   │
│   ├── dashboard/            # Main dashboard (markets/shops/products tabs)
│   ├── products/             # Product listing page (existing)
│   ├── shops/                # Shop listing page (existing)
│   ├── profile/              # User profile page
│   ├── login/                # Login page
│   ├── signup/               # Signup page
│   ├── layout.tsx            # Root layout (AuthProvider wrapper)
│   ├── page.tsx              # Currently signup page (confusing naming)
│   ├── globals.css           # Tailwind CSS + theme variables
│   └── constant.ts
│
├── types/                    # TypeScript type definitions
│   └── product.ts
│
├── utils/                    # Demo data and utilities
│   ├── demodata.ts
│   └── types.ts
│
└── public/                   # Static assets (images, SVGs)
```

### Key Locations for Your Tasks

**For Product Listing Page:**
- Use existing [`/app/products/page.tsx`](olament_frontend/app/products/page.tsx) as reference
- API: [`/app/lib/api/productApi.ts`](olament_frontend/app/lib/api/productApi.ts)
- Hooks: [`/app/lib/hooks/useProducts.ts`](olament_frontend/app/lib/hooks/useProducts.ts)

**For Chat Page:**
- Backend: [`/Olament-backend-2/controllers/conversationController.js`](Olament-backend-2/controllers/conversationController.js)
- Socket: [`/Olament-backend-2/socket/socket.js`](Olament-backend-2/socket/socket.js)
- Models: [`/Olament-backend-2/models/Conversation.js`](Olament-backend-2/models/Conversation.js), [`/Olament-backend-2/models/Message.js`](Olament-backend-2/models/Message.js)

**Shared Layouts:**
- Root layout: [`/app/layout.tsx`](olament_frontend/app/layout.tsx) - wraps with `AuthProvider`
- No global layout wrapper exists - each page handles its own structure

---

## 4️⃣ UI & Design System Analysis

### Design System
**No formal design system exists.** The UI uses Tailwind CSS with minimal customization.

### Color Palette
```css
/* From globals.css */
--background: #ffffff (light) / #0a0a0a (dark)
--foreground: #171717 / #ededed
--primary: #facc15 (yellow-400) - Used for CTAs, brand
--accent: #3b82f6 (blue-600) - Used for active states, links
--text-primary: #171717 (black)
--text-secondary: #6b7280 (gray-500)
--border: #e5e7eb (gray-200)
```

### Typography
- **Font**: Geist Sans (variable) + Geist Mono
- **Fallback**: Arial, Helvetica, sans-serif
- **Base size**: 14-16px (Tailwind default)

### Component Patterns Observed

**Buttons:**
- Primary: `bg-yellow-400 text-gray-900 hover:bg-yellow-300`
- Secondary: `bg-gray-900 text-white hover:bg-gray-800`
- Outline: `border border-gray-300 bg-white`

**Cards:**
- Rounded corners: `rounded-xl`
- Border: `border border-gray-200`
- Shadow: `hover:shadow-md` on hover

**Forms:**
- Input: `rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500`
- Label: `block text-sm font-medium text-gray-700 mb-2`

**Status Badges:**
- Open: `bg-green-100 text-green-800`
- Closed: `bg-gray-100 text-gray-800`
- Discount: `bg-red-500 text-white`
- Verified: `bg-blue-100 text-blue-800`

### UI Inconsistencies to Fix

| Issue | Location | Suggested Fix |
|-------|----------|---------------|
| Page naming confusion | `app/page.tsx` is signup | Rename or redirect |
| Missing bottom nav | Some pages have it, others don't | Standardize with `Sidebar.tsx` |
| Inconsistent header styles | Dashboard vs Products vs Shops | Create shared `PageHeader` component |
| Toast notification styling | Inconsistent across pages | Extract `Toast` component to `/components` |
| Loading states | Varies by page | Create `LoadingSpinner` component usage |
| Empty states | Basic text only | Create reusable `EmptyState` component |

### Design Constraints ⚠️
1. **Mobile-first**: The dashboard has bottom nav, indicating mobile priority
2. **State-based filtering**: Most pages filter by Nigerian states (hardcoded list)
3. **Yellow-400 brand color**: Used consistently for primary actions
4. **Card-based layouts**: Products and shops use card/grid layouts
5. **Responsive**: Use Tailwind's `sm:`, `md:`, `lg:` prefixes

---

## 5️⃣ Existing Pages Audit

### Page-by-Page Analysis

| Page | Purpose | UI Quality | Safe to Improve | Don't Touch |
|------|---------|------------|-----------------|-------------|
| `/dashboard` | Main hub - markets/shops/products tabs | Good ⭐⭐⭐ | Styling, card layouts | Tab logic, API calls |
| `/products` | Product listing with filters | Good ⭐⭐⭐ | Filters UI, empty states | Product data fetching |
| `/shops` | Shop listing with filters | Good ⭐⭐⭐ | Filters UI, card styles | Shop data fetching |
| `/profile` | User profile management | Good ⭐⭐⭐ | Form styling | Profile update logic |
| `/login` | User authentication | Good ⭐⭐⭐ | Styling improvements | Auth flow |
| `/signup` | User registration | Good ⭐⭐⭐ | Styling improvements | Validation logic |
| `/page.tsx` | Misnamed - is signup page | Needs cleanup | N/A | Contains complex form logic |

### Specific UI Cleanup Suggestions

**Safe Visual Improvements:**
- Empty state components (product not found, shop not found)
- Loading skeletons instead of spinners
- Consistent button styles across pages
- Better spacing/padding consistency
- Search bar styling standardization
- Filter panel visual hierarchy

**Logic-Sensitive Areas (Don't Modify):**
- `useAuthApi` hook - auth flow is complex
- `apiClient` interceptors - token refresh logic
- `useProducts/useShop` hooks - pagination, filtering logic
- Profile update mutations - data validation
- Socket.io connection handling

---

## 6️⃣ Product Listing Page Guidance

### Location Recommendation
```
Create: /app/product-listing/page.tsx (new folder)
OR Use: /app/products/page.tsx (enhance existing)
```

**Recommendation**: Create a new `/app/product-listing/page.tsx` as a dedicated product browsing page with:
- Better product card designs
- Advanced filtering sidebar
- Grid/list toggle
- Quick add to cart
- Comparison feature

### Component Breakdown

```
product-listing/
├── page.tsx              # Main page with state management
├── components/
│   ├── ProductGrid.tsx   # Grid display component
│   ├── ProductList.tsx   # List display component
│   ├── ProductCard.tsx   # Individual product card (extract from products/page)
│   ├── FilterSidebar.tsx # Filter panel (categories, price, etc.)
│   ├── SortDropdown.tsx  # Sort options
│   ├── SearchBar.tsx     # Search input with debounce
│   └── ActiveFilters.tsx # Show active filter tags
└── hooks/
    └── useProductListing.ts  # Custom hook for product fetching
```

### Product Data Fetching

**API Endpoint**: `GET /api/products`

**Parameters**:
```typescript
{
  page?: number;
  limit?: number;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  state?: string;
  search?: string;
  sortBy?: 'createdAt' | 'price' | 'rating' | 'name';
  order?: 'asc' | 'desc';
  vendorId?: string; // for shop-specific view
}
```

**Response Format**:
```typescript
{
  success: true;
  data: {
    products: Product[];
    total: number;
    page: number;
    totalPages: number;
  }
}
```

**Use Existing Hook**: [`/app/lib/hooks/useProducts.ts`](olament_frontend/app/lib/hooks/useProducts.ts) or extend it.

### Vendor vs Customer Views

| Aspect | Customer View | Vendor View |
|--------|---------------|-------------|
| Product cards | Show price, add to cart | Show inventory, edit button |
| Filters | Price, category, rating | Stock status, visibility |
| Actions | Add to cart, favorite | Edit, archive, duplicate |
| Sorting | Popular, new, price | Stock level, views |

---

## 7️⃣ Chat Page Guidance

### Real-time Messaging Architecture

**Backend Infrastructure:**
- **Socket.io** for real-time communication ([`/socket/socket.js`](Olament-backend-2/socket/socket.js))
- **REST API** for conversation management ([`/controllers/conversationController.js`](Olament-backend-2/controllers/conversationController.js))
- **JWT authentication** required for socket connections

**Socket Events:**
| Event | Direction | Purpose |
|-------|-----------|---------|
| `connection` | Client→Server | Establish connection |
| `joinConversations` | Client→Server | Join multiple chat rooms |
| `privateMessage` | Bidirectional | Send/receive messages |
| `typing` | Bidirectional | Show typing indicator |
| `markAsRead` | Client→Server | Update read status |
| `newMessage` | Server→Client | Receive new message |
| `messageNotification` | Server→Client | Push notification |

### Data Models

**Conversation Schema** ([`/models/Conversation.js`](Olament-backend-2/models/Conversation.js)):
```javascript
{
  participants: [UserIds];
  product: ProductId; // optional, for product inquiries
  lastMessage: MessageId;
  lastMessageAt: Date;
  unreadCount: [{ userId, count }];
  status: 'active' | 'archived' | 'blocked';
}
```

**Message Schema** ([assumed - not shown]):
```javascript
{
  conversation: ConversationId;
  sender: UserId;
  content: string;
  product: ProductId; // optional
  readBy: [{ userId, readAt }];
  createdAt: Date;
}
```

### UI Structure Recommendation

```
chat/
├── page.tsx                    # Main chat page
├── components/
│   ├── ConversationList.tsx    # Left sidebar - conversation list
│   ├── ChatWindow.tsx          # Right panel - messages
│   ├── MessageBubble.tsx       # Individual message bubble
│   ├── MessageInput.tsx        # Text input with send button
│   ├── ConversationItem.tsx    # List item for sidebar
│   ├── TypingIndicator.tsx     # "User is typing..." animation
│   └── ChatHeader.tsx          # Chat header with participant info
├── hooks/
│   ├── useConversations.ts     # Fetch conversations list
│   ├── useChatMessages.ts      # Fetch messages for conversation
│   └── useSocketChat.ts        # Socket.io integration for chat
└── types/
    └── chat.ts                 # TypeScript types for chat
```

### Chat Page Layout

```
┌─────────────────────────────────────────────────────┐
│ Header: User info, back button, more options         │
├──────────────┬──────────────────────────────────────┤
│              │  ┌────────────────────────────────┐  │
│ Conversation │  │ Message bubbles (scrollable)   │  │
│ List         │  │                                │  │
│              │  │ [Avatar] User message          │  │
│ ┌──────────┐ │  │              My message        │  │
│ │ Avatar   │ │  │                                │  │
│ │ Name     │ │  └────────────────────────────────┘  │
│ │ Preview  │ │  ┌────────────────────────────────┐  │
│ │ Time     │ │  │ [Input] [Send]                 │  │
│ └──────────┘ │  └────────────────────────────────┘  │
│              │                                       │
│ ┌──────────┐ │                                       │
│ │ Avatar   │ │                                       │
│ │ ...      │ │                                       │
│ └──────────┘ │                                       │
├──────────────┴──────────────────────────────────────┤
│ Bottom Navigation (optional, similar to dashboard)  │
└─────────────────────────────────────────────────────┘
```

### State & Performance Pitfalls ⚠️

1. **Socket Connection Management**
   - Reconnect on auth changes
   - Handle connection drops gracefully
   - Clean up socket on unmount

2. **Message Pagination**
   - Load older messages on scroll top (infinite scroll up)
   - Don't refetch entire conversation on new message

3. **Typing Indicator Debounce**
   - Send typing event with debounce (don't spam)
   - Clear typing status after 3-5 seconds of inactivity

4. **Read Receipts**
   - Mark messages as read when chat is open
   - Update unread counts in conversation list

5. **Memory Leaks**
   - Use `useEffect` cleanup for subscriptions
   - Cancel pending API requests on unmount

---

## 8️⃣ Integration & Safety Checks

### Global Styles & Layout Wrappers

**Root Layout** ([`/app/layout.tsx`](olament_frontend/app/layout.tsx)):
- Wraps all pages with `AuthProvider`
- Sets up fonts (Geist Sans/Mono)
- No global navigation or sidebar

**What affects all pages:**
- Tailwind CSS reset + base styles
- Dark mode media query (in `globals.css`)
- Font variables

**What does NOT affect all pages:**
- Bottom navigation (only some pages use it)
- Headers (each page has its own)
- Sidebar (none currently)

### Auth/Role Checks

**ProtectedRoute Component** ([`/app/components/ProtectedRoute.tsx`](olament_frontend/app/components/ProtectedRoute.tsx)):
```tsx
// Use for protected pages
<ProtectedRoute requiredRole={['customer', 'vendor']}>
  <ChatPage />
</ProtectedRoute>
```

**Current Auth Flow:**
1. Check `localStorage` for token on mount
2. `useAuth` hook initializes auth state
3. Redirect to `/login` if not authenticated

**For New Pages:**
- Chat page: Authenticated users only (any role)
- Product listing: Public access (no auth required)
- Vendor-only pages: Check `user.role === 'vendor'`

### Testing UI Changes

1. **Manual Testing Checklist:**
   - [ ] Test on mobile (375px width)
   - [ ] Test on tablet (768px width)
   - [ ] Test on desktop (1024px+ width)
   - [ ] Verify dark mode compatibility
   - [ ] Test with slow network (throttling)
   - [ ] Test empty states
   - [ ] Test loading states
   - [ ] Test error states

2. **Isolation Strategy:**
   - Create components in isolation first
   - Test with mock data before integrating API
   - Use the existing `useProducts` hook mock pattern
   - Keep changes in separate branches

3. **Code Review-Friendly:**
   - Keep PRs under 500 lines when possible
   - Separate UI cleanup from new features
   - Use meaningful commit messages
   - Add comments for complex logic

---

## 9️⃣ Final Actionable Summary

### Step-by-Step Plan

#### Phase 1: UI Cleanup (Start Here)
- [ ] Create reusable components: `Toast`, `LoadingSpinner`, `EmptyState`
- [ ] Standardize button styles across all pages
- [ ] Fix empty state UI in `/products` and `/shops`
- [ ] Add loading skeletons instead of spinners
- [ ] Standardize header component design

#### Phase 2: Product Listing Page
- [ ] Create `/app/product-listing/page.tsx`
- [ ] Extract `ProductCard` component from existing code
- [ ] Create `FilterSidebar` component
- [ ] Implement responsive grid layout
- [ ] Add grid/list view toggle
- [ ] Integrate with `productApi`
- [ ] Test with real API data

#### Phase 3: Chat Page
- [ ] Create `/app/chat/page.tsx`
- [ ] Create `ConversationList` component
- [ ] Create `ChatWindow` with message bubbles
- [ ] Create `MessageInput` component
- [ ] Implement Socket.io client connection
- [ ] Handle real-time message updates
- [ ] Add typing indicators
- [ ] Test conversation creation from products

### UI Cleanup Checklist

- [ ] Empty states for:
  - [ ] No products found
  - [ ] No shops found
  - [ ] No conversations
  - [ ] No search results
- [ ] Loading states:
  - [ ] Product cards skeleton
  - [ ] Conversation list skeleton
  - [ ] Chat messages skeleton
- [ ] Error states:
  - [ ] Network error recovery
  - [ ] API error display
- [ ] Consistent button variants:
  - [ ] Primary (yellow-400)
  - [ ] Secondary (gray-900)
  - [ ] Outline (border-gray-300)
  - [ ] Ghost (text-gray-600)

### Red Flags to Watch 🚩

1. **No API client for conversations yet** - You'll need to create `conversationApi.ts`
2. **Socket.io client not installed on frontend** - Run `npm install socket.io-client`
3. **Mixed Tailwind versions** - Package shows v4 but some classes suggest v3 usage
4. **Page naming confusion** - `page.tsx` is signup, should be renamed
5. **No global layout wrapper** - Each page is independent
6. **Hardcoded Nigerian states** - In `products/page.tsx`, `shops/page.tsx`, `dashboard/page.tsx`
7. **Missing product detail page** - No `/app/products/[id]/page.tsx` exists

### Quick Reference

**Start Development:**
```bash
cd olament_frontend
npm run dev  # Starts on http://localhost:3000

# In another terminal
cd Olament-backend-2
npm run dev  # Starts on http://localhost:5000
```

**Key Files to Reference:**
- Product listing: [`/app/products/page.tsx`](olament_frontend/app/products/page.tsx)
- Shop listing: [`/app/shops/page.tsx`](olament_frontend/app/shops/page.tsx)
- API patterns: [`/app/lib/api/productApi.ts`](olament_frontend/app/lib/api/productApi.ts)
- Auth hook: [`/app/lib/hooks/useAuthApi.ts`](olament_frontend/app/lib/hooks/useAuthApi.ts)
- Sidebar nav: [`/app/components/Sidebar.tsx`](olament_frontend/app/components/Sidebar.tsx)

---

**Good luck building the Product Listing and Chat pages!** Start with UI cleanup to familiarize yourself with the codebase, then tackle the new pages incrementally.
