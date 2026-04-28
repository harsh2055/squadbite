'use client';

import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, User, Users } from 'lucide-react';
import { CartItem, Restaurant } from '@/lib/mockData';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  items: CartItem[];
  userId: string;
  restaurants: Restaurant[];
  onRemove: (id: string) => void;
  onUpdateQty: (id: string, qty: number) => void;
  onCheckout: () => void;
}

export default function CartPanel({ items, userId, restaurants, onRemove, onUpdateQty, onCheckout }: Props) {
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const myItems = items.filter(i => i.addedBy === userId);
  const myTotal = myItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  // Group by user for split bill preview
  const userTotals = items.reduce<Record<string, { name: string, total: number }>>((acc, item) => {
    if (!acc[item.addedBy]) acc[item.addedBy] = { name: item.addedByName, total: 0 };
    acc[item.addedBy].total += item.price * item.quantity;
    return acc;
  }, {});

  // Group by restaurant for display
  const grouped = items.reduce<Record<string, CartItem[]>>((acc, item) => {
    if (!acc[item.restaurantId]) acc[item.restaurantId] = [];
    acc[item.restaurantId].push(item);
    return acc;
  }, {});

  if (items.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 px-6 text-center bg-[#0c0c0c]">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 bg-[#161616] border border-[#252525] rounded-3xl flex items-center justify-center shadow-inner"
        >
          <ShoppingBag size={32} className="text-white/10" />
        </motion.div>
        <div>
          <p className="font-display font-bold text-white text-xl">Squad Cart is Empty</p>
          <p className="text-white/30 text-sm mt-2 max-w-[200px] mx-auto">
            Your squad hasn't added anything yet. Ask SquadBot for some tasty ideas!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#0c0c0c]">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#252525] flex items-center justify-between bg-[#161616]/50">
        <h3 className="font-display font-bold text-white flex items-center gap-2">
          <ShoppingBag size={18} className="text-[#FC8019]" />
          Squad Cart
        </h3>
        <div className="flex items-center gap-1.5 bg-[#FC8019]/10 px-2 py-1 rounded-lg">
          <Users size={12} className="text-[#FC8019]" />
          <span className="text-[10px] font-black text-[#FC8019]">{Object.keys(userTotals).length} SQUAD MEMBERS</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8">
        {/* Your personal items highlight */}
        {myItems.length > 0 && (
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="bg-gradient-to-br from-[#FC8019] to-[#ff9a3c] rounded-3xl p-5 shadow-lg shadow-[#FC8019]/10 relative overflow-hidden"
          >
            <div className="relative z-10">
              <p className="text-[10px] text-white/60 font-black uppercase tracking-widest mb-1">Your Personal Selection</p>
              <p className="text-2xl font-black text-white">₹{myTotal}</p>
              <p className="text-xs text-white/80 mt-1">{myItems.length} items from your choice</p>
            </div>
            <User size={80} className="absolute -right-4 -bottom-4 text-white/10 rotate-12" />
          </motion.div>
        )}

        {/* Grouped by restaurant */}
        {Object.entries(grouped).map(([restId, restItems]) => {
          const restaurant = restaurants.find(r => r.id === restId);
          const restTotal = restItems.reduce((s, i) => s + i.price * i.quantity, 0);
          return (
            <div key={restId} className="space-y-3">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-sm border border-white/10">
                    {restaurant?.image.startsWith('http') ? (
                      <img src={restaurant.image} alt="" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      restaurant?.image || '🍽️'
                    )}
                  </div>
                  <p className="text-xs font-black text-white/40 uppercase tracking-tighter">{restItems[0].restaurantName}</p>
                </div>
                <p className="text-xs font-bold text-white/60">₹{restTotal}</p>
              </div>

              <div className="space-y-2">
                <AnimatePresence>
                  {restItems.map(item => (
                    <CartItemRow
                      key={item.id}
                      item={item}
                      isOwn={item.addedBy === userId}
                      onRemove={onRemove}
                      onUpdateQty={onUpdateQty}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          );
        })}

        {/* Bill Summary Preview */}
        <div className="bg-[#161616] rounded-3xl p-5 border border-[#252525] space-y-4">
          <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">Squad Bill Split</p>
          <div className="space-y-3">
            {Object.values(userTotals).map((user, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-[10px] text-white/40 font-bold border border-white/10">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs text-white/60 font-medium">{user.name}</span>
                </div>
                <span className="text-xs font-bold text-white">₹{user.total}</span>
              </div>
            ))}
          </div>
          <div className="pt-3 border-t border-white/5 flex items-center justify-between">
            <span className="text-sm font-bold text-white">Total Squad Bill</span>
            <span className="text-lg font-black text-[#FC8019]">₹{total}</span>
          </div>
        </div>
      </div>

      {/* Checkout Action */}
      <div className="p-4 bg-[#161616] border-t border-[#252525]">
        <button
          onClick={() => alert('Proceeding to Swiggy Checkout...')}
          className="w-full bg-[#FC8019] hover:bg-[#e8730a] text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 shadow-xl transition-all active:scale-95 group"
        >
          <ShoppingBag size={20} />
          ORDER NOW ON SWIGGY
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}

function CartItemRow({
  item, isOwn, onRemove, onUpdateQty,
}: {
  item: CartItem;
  isOwn: boolean;
  onRemove: (id: string) => void;
  onUpdateQty: (id: string, qty: number) => void;
}) {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, x: 20 }}
      className="bg-[#1e1e1e] border border-white/5 rounded-2xl p-3 flex gap-3 items-center group"
    >
      <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/5 flex-shrink-0">
        {item.image ? (
          <img src={item.image} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xl">{item.emoji || '🍴'}</div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <div className={`w-2.5 h-2.5 border flex items-center justify-center ${item.isVeg ? 'border-green-500' : 'border-red-500'}`}>
            <div className={`w-1 h-1 rounded-full ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`} />
          </div>
          <p className="text-xs font-bold text-white truncate">{item.name}</p>
        </div>
        <p className="text-[10px] text-white/30 font-medium">
          Added by <span className={isOwn ? 'text-[#FC8019]' : 'text-white/60'}>{isOwn ? 'You' : item.addedByName}</span>
        </p>
      </div>

      {isOwn ? (
        <div className="flex items-center gap-2 bg-black/20 rounded-xl px-1.5 py-1">
          <button
            onClick={() => onUpdateQty(item.id, item.quantity - 1)}
            disabled={item.quantity <= 1}
            className="w-5 h-5 rounded-lg hover:bg-white/5 flex items-center justify-center transition-colors disabled:opacity-20"
          >
            <Minus size={10} className="text-white" />
          </button>
          <span className="text-xs font-black text-white w-4 text-center">{item.quantity}</span>
          <button
            onClick={() => onUpdateQty(item.id, item.quantity + 1)}
            className="w-5 h-5 rounded-lg hover:bg-white/5 flex items-center justify-center transition-colors"
          >
            <Plus size={10} className="text-[#FC8019]" />
          </button>
          <button
            onClick={() => onRemove(item.id)}
            className="w-5 h-5 ml-1 rounded-lg hover:bg-red-500/20 flex items-center justify-center transition-colors"
          >
            <Trash2 size={10} className="text-white/20 hover:text-red-400" />
          </button>
        </div>
      ) : (
        <div className="text-right">
          <p className="text-xs font-black text-white">₹{item.price * item.quantity}</p>
          <p className="text-[9px] text-white/20 font-bold uppercase">QTY: {item.quantity}</p>
        </div>
      )}
    </motion.div>
  );
}
