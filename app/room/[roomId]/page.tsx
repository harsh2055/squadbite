'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { getRandomAvatar, MOCK_RESTAURANTS } from '@/lib/mockData';
import { useAppStore } from '@/lib/store';
import { socketService } from '@/lib/socket';
import { ChatMessage, CartItem, RoomUser } from '@/lib/mockData';
import ChatPanel from '@/components/ChatPanel';
import CartPanel from '@/components/CartPanel';
import BillPanel from '@/components/BillPanel';
import { Users, ShoppingCart, Receipt, Copy, Check, ChefHat, LogOut, MessageCircle, Share2, Sparkles } from 'lucide-react';
import JoinModal from '@/components/JoinModal';
import { motion, AnimatePresence } from 'framer-motion';

// ── Helpers ────────────────────────────────────────────────────────────────────
function getSessionUser() {
  if (typeof window === 'undefined') return null;
  const stored = sessionStorage.getItem('squadbite_user');
  return stored ? JSON.parse(stored) : null;
}

function saveSessionUser(user: { id: string; name: string; avatar: string }) {
  sessionStorage.setItem('squadbite_user', JSON.stringify(user));
}

// ── Component ──────────────────────────────────────────────────────────────────
export default function RoomPage() {
  const params = useParams();
  const roomId = (params.roomId as string).toUpperCase();
  const router = useRouter();

  const {
    setRoomId, userId, userName, userAvatar, setUser,
    roomUsers, setRoomUsers,
    cartItems, setCartItems,
    messages, setMessages, addMessage,
    isAITyping, setIsAITyping,
    activeTab, setActiveTab,
    cartAnimating, setCartAnimating,
  } = useAppStore();

  const [showJoin, setShowJoin] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [copied, setCopied] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const socketRef = useRef<any>(null);

  // ── Init ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    setRoomId(roomId);
    const sessionUser = getSessionUser();
    if (sessionUser) {
      setUser(sessionUser.id, sessionUser.name, sessionUser.avatar);
      initSocket(sessionUser);
    } else {
      setShowJoin(true);
      setInitializing(false);
    }
  }, [roomId, setUser, initSocket, setRoomId]);

  const initSocket = useCallback((user: { id: string; name: string; avatar: string }) => {
    const socket = socketService.connect();
    socketRef.current = socket;

    socket.emit('join-room', roomId);

    socket.on('init-data', ({ messages, cart }: { messages: any[], cart: any[] }) => {
      setMessages(messages.map(m => ({
        id: m.id.toString(),
        userId: m.senderId || m.userId,
        userName: m.sender || m.userName,
        content: m.text || m.content,
        type: m.type as any,
        timestamp: m.timestamp ? new Date(m.timestamp).getTime() : Date.now(),
        suggestions: m.suggestions || []
      })));
      setCartItems(cart.map(c => ({
        id: c.id.toString(),
        menuItemId: c.id.toString(),
        name: c.name,
        price: c.price,
        quantity: c.quantity,
        addedBy: c.addedBy,
        image: c.image,
        isVeg: c.isVeg
      })));
      setInitializing(false);
    });

    socket.on('new-message', (m: any) => {
      addMessage({
        id: m.id.toString(),
        userId: m.senderId || m.userId,
        userName: m.sender || m.userName,
        content: m.text || m.content,
        type: m.type as any,
        timestamp: m.timestamp ? new Date(m.timestamp).getTime() : Date.now(),
        suggestions: m.suggestions || []
      });
    });

    socket.on('cart-updated', (items: any[]) => {
      setCartItems(items.map(c => ({
        id: c.id.toString(),
        menuItemId: c.id.toString(),
        name: c.name,
        price: c.price,
        quantity: c.quantity || 1,
        addedBy: c.userId,
        addedByName: c.addedBy,
        image: c.image,
        isVeg: c.isVeg
      })));
    });
  }, [roomId, setMessages, setCartItems, addMessage]);

  useEffect(() => {
    return () => {
      socketService.disconnect();
    };
  }, []);

  // Cart badge animation
  useEffect(() => {
    if (cartItems.length > cartCount) {
      setCartAnimating(true);
      setTimeout(() => setCartAnimating(false), 500);
    }
    setCartCount(cartItems.length);
  }, [cartItems.length, cartCount, setCartAnimating]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  async function handleJoin(name: string) {
    const id = uuidv4();
    const avatar = getRandomAvatar();
    setUser(id, name, avatar);
    saveSessionUser({ id, name, avatar });
    setShowJoin(false);
    setInitializing(true);
    initSocket({ id, name, avatar });
  }

  async function handleSendMessage(content: string) {
    if (!userId || !userName || !socketRef.current) return;
    
    socketRef.current.emit('send-message', {
      roomId,
      sender: userName,
      senderId: userId,
      text: content,
      type: 'user'
    });
  }

  async function handleAddToCart(item: CartItem) {
    if (!userId || !socketRef.current) return;
    socketRef.current.emit('add-to-cart', {
      roomId,
      item,
      user: { id: userId, name: userName }
    });
  }

  async function handleRemoveFromCart(itemId: string) {
    // For the demo, we can just omit or implement if needed in backend
  }

  async function handleUpdateQty(itemId: string, qty: number) {
    // For the demo, we can just omit or implement if needed in backend
  }

  function copyRoomLink() {
    const url = `${window.location.origin}/room/${roomId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  if (showJoin) return <JoinModal roomId={roomId} onJoin={handleJoin} />;
  if (initializing) return <LoadingScreen />;

  const totalItems = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="h-screen flex flex-col bg-[#0c0c0c] overflow-hidden font-sans selection:bg-[#FC8019]/30">
      {/* Premium Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/5 flex-shrink-0 bg-[#0c0c0c]/80 backdrop-blur-xl z-30">
        <div className="flex items-center gap-4">
          <motion.div 
            whileHover={{ rotate: 10, scale: 1.1 }}
            onClick={() => router.push('/')}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FC8019] to-[#ff9a3c] flex items-center justify-center shadow-lg shadow-[#FC8019]/20 cursor-pointer"
          >
            <ChefHat size={20} className="text-white" />
          </motion.div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-display font-black text-white text-lg tracking-tight">SquadBite</p>
              <div className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-tighter">BETA</p>
              </div>
            </div>
            <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
              Room Code <span className="text-[#FC8019] font-mono tracking-normal">{roomId}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Active Users Pill */}
          <div className="hidden sm:flex items-center gap-2 bg-[#161616] border border-white/5 rounded-full pl-2 pr-4 py-1.5 transition-all hover:bg-[#1e1e1e]">
            <div className="flex -space-x-2">
              {roomUsers.slice(0, 3).map(u => (
                <div key={u.id} className="w-6 h-6 rounded-full bg-[#2a2a2a] flex items-center justify-center text-[10px] border-2 border-[#0c0c0c] shadow-sm">
                  {u.avatar}
                </div>
              ))}
              {roomUsers.length > 3 && (
                <div className="w-6 h-6 rounded-full bg-[#FC8019] flex items-center justify-center text-[8px] text-white font-black border-2 border-[#0c0c0c]">
                  +{roomUsers.length - 3}
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-white leading-none">{roomUsers.length} MEMBERS</span>
              <span className="text-[8px] text-green-500 font-bold flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                ACTIVE
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={copyRoomLink} 
              className={`h-10 px-4 rounded-xl flex items-center gap-2 text-xs font-bold transition-all ${
                copied ? 'bg-green-500 text-white' : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
              }`}
            >
              {copied ? <Check size={14} /> : <Share2 size={14} />}
              <span className="hidden xs:inline">{copied ? 'Copied!' : 'Invite Squad'}</span>
            </motion.button>
            
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/')}
              className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
            >
              <LogOut size={16} />
            </motion.button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="px-6 bg-[#0c0c0c] border-b border-white/5 flex-shrink-0">
        <div className="flex max-w-lg mx-auto">
          {([
            { id: 'chat', icon: MessageCircle, label: 'Chat', badge: null },
            { id: 'cart', icon: ShoppingCart, label: 'Cart', badge: totalItems },
            { id: 'bill', icon: Receipt, label: 'Split Bill', badge: null },
          ] as const).map(({ id, icon: Icon, label, badge }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 flex flex-col items-center gap-1.5 py-4 text-[10px] font-black uppercase tracking-widest transition-all relative group ${
                activeTab === id ? 'text-[#FC8019]' : 'text-white/30 hover:text-white/60'
              }`}
            >
              <div className="relative">
                <Icon size={18} className={activeTab === id ? 'animate-pulse' : ''} />
                {badge !== null && badge > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`absolute -top-2 -right-3 min-w-[16px] h-[16px] bg-[#FC8019] text-white text-[9px] rounded-full flex items-center justify-center px-1 font-black shadow-lg shadow-[#FC8019]/40 ${
                      cartAnimating && id === 'cart' ? 'animate-bounce' : ''
                    }`}
                  >
                    {badge}
                  </motion.span>
                )}
              </div>
              {label}
              {activeTab === id && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FC8019] rounded-t-full shadow-[0_-4px_10px_#FC8019]"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Panel Content */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {activeTab === 'chat' && (
              <ChatPanel
                messages={messages}
                isAITyping={isAITyping}
                userId={userId!}
                userName={userName!}
                onSend={handleSendMessage}
                onAddToCart={handleAddToCart}
                cartItems={cartItems}
              />
            )}
            {activeTab === 'cart' && (
              <CartPanel
                items={cartItems}
                userId={userId!}
                restaurants={MOCK_RESTAURANTS}
                onRemove={handleRemoveFromCart}
                onUpdateQty={handleUpdateQty}
                onCheckout={() => setActiveTab('bill')}
              />
            )}
            {activeTab === 'bill' && (
              <BillPanel
                items={cartItems}
                roomUsers={roomUsers}
                userId={userId!}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#FC8019]/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/5 blur-[120px] rounded-full" />
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="h-screen flex flex-col items-center justify-center gap-6 bg-[#0c0c0c] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#FC8019]/20 blur-[150px] rounded-full animate-pulse" />
      </div>
      
      <div className="relative">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="w-24 h-24 rounded-3xl border-2 border-dashed border-white/10 flex items-center justify-center"
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FC8019] to-[#ff9a3c] flex items-center justify-center shadow-2xl shadow-[#FC8019]/30">
          <ChefHat size={32} className="text-white" />
        </div>
      </div>
      
      <div className="text-center space-y-2 relative z-10">
        <h2 className="font-display font-black text-white text-xl tracking-tight">Summoning the Squad</h2>
        <p className="text-white/20 text-[10px] font-bold uppercase tracking-[0.3em]">Connecting to Kitchen...</p>
      </div>

      <div className="flex gap-2">
        {[0, 1, 2].map(i => (
          <motion.div 
            key={i}
            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
            className="w-1.5 h-1.5 rounded-full bg-[#FC8019]"
          />
        ))}
      </div>
    </div>
  );
}
