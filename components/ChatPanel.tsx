'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Plus, Check, ShoppingBag, Clock, Star } from 'lucide-react';
import { ChatMessage, CartItem, MenuItem, MOCK_RESTAURANTS, AISuggestion } from '@/lib/mockData';
import { v4 as uuidv4 } from 'uuid';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  messages: ChatMessage[];
  isAITyping: boolean;
  userId: string;
  userName: string;
  onSend: (content: string) => void;
  onAddToCart: (item: CartItem) => void;
  cartItems: CartItem[];
}

const QUICK_PROMPTS = [
  '🥗 Veg under ₹200',
  '🌶️ Something spicy',
  '🍕 Pizza for 4',
  '🍔 Burgers under ₹300',
  '🍛 Biryani options',
];

export default function ChatPanel({ messages, isAITyping, userId, userName, onSend, onAddToCart, cartItems }: Props) {
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAITyping]);

  function handleSend() {
    const text = input.trim();
    if (!text) return;
    setInput('');
    onSend(text);
  }

  function handleAddItem(suggestion: AISuggestion, item: MenuItem | undefined, restaurantId: string) {
    if (!item) return;
    const cartItem: CartItem = {
      id: uuidv4(),
      menuItemId: item.id,
      restaurantId,
      restaurantName: suggestion.restaurant,
      name: item.name,
      price: item.price,
      quantity: 1,
      addedBy: userId,
      addedByName: userName,
      isVeg: item.isVeg,
      emoji: item.emoji || '🍴',
      image: item.image,
    };
    onAddToCart(cartItem);
  }

  function handleAddCombo(suggestion: AISuggestion) {
    if (!suggestion.itemDetails) return;
    suggestion.itemDetails.forEach(item => {
      handleAddItem(suggestion, item, suggestion.restaurantId || '');
    });
  }

  function isInCart(menuItemId: string) {
    return cartItems.some(i => i.menuItemId === menuItemId && i.addedBy === userId);
  }

  return (
    <div className="h-full flex flex-col bg-[#0c0c0c]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        <AnimatePresence initial={false}>
          {messages.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <WelcomeBanner onQuickPrompt={p => { setInput(p.replace(/^[^\s]+\s/, '')); inputRef.current?.focus(); }} />
            </motion.div>
          )}

          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              msg={msg}
              isOwn={msg.userId === userId}
              onAddItem={handleAddItem}
              onAddCombo={handleAddCombo}
              isInCart={isInCart}
            />
          ))}

          {isAITyping && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex gap-2 items-start"
            >
              <div className="w-8 h-8 rounded-full bg-[#FC8019]/20 border border-[#FC8019]/30 flex items-center justify-center text-sm">
                🤖
              </div>
              <div className="chat-bubble-ai py-4 px-6">
                <div className="flex gap-1.5">
                  <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1.5 h-1.5 rounded-full bg-[#FC8019]" />
                  <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-[#FC8019]" />
                  <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-[#FC8019]" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} className="h-4" />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-[#161616] border-t border-[#252525] shadow-2xl">
        {messages.length < 5 && (
          <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
            {QUICK_PROMPTS.map(p => (
              <button
                key={p}
                onClick={() => onSend(p.replace(/^[^\s]+\s/, ''))}
                className="flex-shrink-0 text-xs bg-white/5 border border-white/10 hover:border-[#FC8019]/50 text-white/60 hover:text-[#FC8019] rounded-full px-4 py-2 transition-all whitespace-nowrap"
              >
                {p}
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-2 relative">
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="What are we eating? e.g. Veg biryani for 2"
            className="w-full bg-[#1e1e1e] border border-[#2a2a2a] rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-[#FC8019]/60 transition-all placeholder-white/20"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#FC8019] hover:bg-[#e8730a] disabled:opacity-40 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-all active:scale-95"
          >
            <Send size={18} className="text-white" />
          </button>
        </div>
        <p className="text-center text-[#444] text-[10px] mt-2 flex items-center justify-center gap-1">
          <Sparkles size={10} className="text-[#FC8019]" />
          SquadBot AI uses real restaurant data
        </p>
      </div>
    </div>
  );
}

function WelcomeBanner({ onQuickPrompt }: { onQuickPrompt: (p: string) => void }) {
  return (
    <div className="flex flex-col items-center py-12 text-center">
      <div className="w-20 h-20 bg-[#FC8019]/10 rounded-3xl flex items-center justify-center mb-6 orange-glow">
        <Sparkles size={32} className="text-[#FC8019]" />
      </div>
      <h3 className="font-display font-extrabold text-white text-2xl mb-2">SquadBot Concierge 🍽️</h3>
      <p className="text-white/40 text-sm max-w-xs leading-relaxed">
        I can find the best combos, respect your budget, and help your squad decide!
      </p>
    </div>
  );
}

function MessageBubble({
  msg, isOwn, onAddItem, onAddCombo, isInCart,
}: {
  msg: ChatMessage;
  isOwn: boolean;
  onAddItem: (suggestion: AISuggestion, item: MenuItem | undefined, restaurantId: string) => void;
  onAddCombo: (suggestion: AISuggestion) => void;
  isInCart: (id: string) => boolean;
}) {
  if (msg.type === 'system') {
    return (
      <div className="flex justify-center">
        <span className="bg-white/5 text-white/30 rounded-full px-4 py-1.5 text-[10px] uppercase tracking-widest font-bold border border-white/5">
          {msg.content}
        </span>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {!isOwn && (
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-1 ${
          msg.type === 'ai' ? 'bg-[#FC8019]/20 border border-[#FC8019]/30' : 'bg-[#2a2a2a]'
        }`}>
          {msg.type === 'ai' ? '🤖' : '👤'}
        </div>
      )}

      <div className={`flex flex-col gap-1.5 max-w-[85%] ${isOwn ? 'items-end' : 'items-start'}`}>
        <div className={`px-5 py-3.5 rounded-2xl text-sm leading-relaxed ${
          isOwn ? 'bg-[#FC8019] text-white rounded-tr-none' : 'bg-[#1e1e1e] border border-[#2a2a2a] text-white/90 rounded-tl-none'
        }`}>
          {msg.content}
        </div>

        {msg.type === 'ai' && msg.suggestions && msg.suggestions.length > 0 && (
          <div className="w-full mt-3 space-y-4">
            {msg.suggestions.map((sug, si) => (
              <FoodSuggestionCard
                key={si}
                suggestion={sug}
                onAddItem={onAddItem}
                onAddCombo={onAddCombo}
                isInCart={isInCart}
              />
            ))}
          </div>
        )}

        <span className="text-[9px] text-white/20 uppercase font-bold tracking-tighter px-1">
          {msg.userName} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </motion.div>
  );
}

function FoodSuggestionCard({
  suggestion, onAddItem, onAddCombo, isInCart,
}: {
  suggestion: AISuggestion;
  onAddItem: (sug: AISuggestion, item: MenuItem | undefined, restaurantId: string) => void;
  onAddCombo: (suggestion: AISuggestion) => void;
  isInCart: (id: string) => boolean;
}) {
  const restaurant = MOCK_RESTAURANTS.find(r => r.id === suggestion.restaurantId || r.name === suggestion.restaurant);
  const allInCart = suggestion.itemDetails?.every(item => isInCart(item.id));

  return (
    <motion.div 
      whileHover={{ y: -2 }}
      className="bg-[#161616] border border-[#252525] rounded-3xl overflow-hidden shadow-xl w-full max-w-md"
    >
      {/* Restaurant Header */}
      <div className="p-4 border-b border-[#252525] flex items-center justify-between bg-gradient-to-r from-[#1a1a1a] to-[#161616]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/5 border border-white/10">
            {restaurant?.image.startsWith('http') ? (
              <img src={restaurant.image} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xl">{restaurant?.image || '🍽️'}</div>
            )}
          </div>
          <div>
            <h4 className="text-sm font-bold text-white leading-tight">{suggestion.restaurant}</h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="flex items-center gap-0.5 text-[10px] text-yellow-500 font-bold bg-yellow-500/10 px-1 rounded">
                <Star size={8} fill="currentColor" /> {restaurant?.rating || '4.0'}
              </span>
              <span className="text-[10px] text-white/40 flex items-center gap-0.5">
                <Clock size={8} /> {restaurant?.deliveryTime || '30 min'}
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[9px] text-white/30 font-bold uppercase">Total Est.</p>
          <p className="text-sm font-black text-[#FC8019]">₹{suggestion.totalEstimate}</p>
        </div>
      </div>

      {/* Items List */}
      <div className="p-4 space-y-4">
        {suggestion.reason && (
          <p className="text-[11px] text-[#FC8019]/80 bg-[#FC8019]/5 px-3 py-1.5 rounded-lg border border-[#FC8019]/10 italic">
            &quot;{suggestion.reason}&quot;
          </p>
        )}

        {(suggestion.itemDetails || []).map((item) => {
          const added = isInCart(item.id);
          return (
            <div key={item.id} className="flex gap-3">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/5 flex-shrink-0">
                {item.image ? (
                  <img src={item.image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">{item.emoji || '🍴'}</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <div className={`w-3 h-3 border flex items-center justify-center ${item.isVeg ? 'border-green-500' : 'border-red-500'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`} />
                  </div>
                  <h5 className="text-xs font-bold text-white truncate">{item.name}</h5>
                </div>
                <p className="text-[10px] text-white/40 line-clamp-2 leading-tight mb-2">
                  {item.description || 'Delicious meal prepared with fresh ingredients.'}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white/80">₹{item.price}</span>
                  <button
                    onClick={() => onAddItem(suggestion, item, restaurant?.id || '')}
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold transition-all ${
                      added
                        ? 'bg-green-500 text-white'
                        : 'bg-white/5 hover:bg-[#FC8019] text-white border border-white/10 hover:border-[#FC8019]'
                    }`}
                  >
                    {added ? (
                      <><Check size={10} /> ADDED</>
                    ) : (
                      <><Plus size={10} /> ADD</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Combo Action */}
      <div className="p-4 bg-white/5 border-t border-white/5 flex items-center justify-between">
        <p className="text-[10px] text-white/30 font-medium">Add all items as a combo</p>
        <button
          onClick={() => onAddCombo(suggestion)}
          disabled={allInCart}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[11px] font-black transition-all ${
            allInCart
              ? 'bg-white/5 text-white/20 cursor-not-allowed'
              : 'bg-[#FC8019] text-white shadow-lg orange-glow active:scale-95'
          }`}
        >
          <ShoppingBag size={14} />
          {allInCart ? 'ALL IN CART' : 'ADD COMBO'}
        </button>
      </div>
    </motion.div>
  );
}
