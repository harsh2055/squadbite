import { create } from 'zustand';
import { CartItem, ChatMessage, RoomUser } from './mockData';

interface AppState {
  // Room
  roomId: string | null;
  setRoomId: (id: string) => void;

  // User
  userId: string | null;
  userName: string | null;
  userAvatar: string | null;
  setUser: (id: string, name: string, avatar: string) => void;

  // Users in room
  roomUsers: RoomUser[];
  setRoomUsers: (users: RoomUser[]) => void;

  // Cart
  cartItems: CartItem[];
  setCartItems: (items: CartItem[]) => void;
  addToCart: (item: CartItem) => void;

  // Chat
  messages: ChatMessage[];
  setMessages: (msgs: ChatMessage[]) => void;
  addMessage: (msg: ChatMessage) => void;

  // UI
  isAITyping: boolean;
  setIsAITyping: (v: boolean) => void;
  activeTab: 'chat' | 'cart' | 'bill';
  setActiveTab: (tab: 'chat' | 'cart' | 'bill') => void;
  cartAnimating: boolean;
  setCartAnimating: (v: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  roomId: null,
  setRoomId: (id) => set({ roomId: id }),

  userId: null,
  userName: null,
  userAvatar: null,
  setUser: (id, name, avatar) => set({ userId: id, userName: name, userAvatar: avatar }),

  roomUsers: [],
  setRoomUsers: (users) => set({ roomUsers: users }),

  cartItems: [],
  setCartItems: (items) => set({ cartItems: items }),
  addToCart: (item) => set((state) => ({ cartItems: [...state.cartItems, item] })),

  messages: [],
  setMessages: (msgs) => set({ messages: msgs }),
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),

  isAITyping: false,
  setIsAITyping: (v) => set({ isAITyping: v }),

  activeTab: 'chat',
  setActiveTab: (tab) => set({ activeTab: tab }),

  cartAnimating: false,
  setCartAnimating: (v) => set({ cartAnimating: v }),
}));
