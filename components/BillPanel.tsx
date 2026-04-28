'use client';

import { useState } from 'react';
import { Receipt, Users, SplitSquareHorizontal, CheckCircle, ExternalLink, ChevronRight, Info, ShieldCheck, CreditCard } from 'lucide-react';
import { CartItem, RoomUser } from '@/lib/mockData';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  items: CartItem[];
  roomUsers: RoomUser[];
  userId: string;
}

type SplitMode = 'individual' | 'equal';

export default function BillPanel({ items, roomUsers, userId }: Props) {
  const [splitMode, setSplitMode] = useState<SplitMode>('individual');
  const [showCheckout, setShowCheckout] = useState(false);

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const deliveryFee = total > 500 ? 0 : 40;
  const platformFee = 5;
  const tax = Math.round(total * 0.05);
  const grandTotal = total + deliveryFee + tax + platformFee;

  // Individual split: group items by user
  const byUser: Record<string, { user: RoomUser | null; items: CartItem[]; subtotal: number }> = {};
  for (const item of items) {
    if (!byUser[item.addedBy]) {
      byUser[item.addedBy] = {
        user: roomUsers.find(u => u.id === item.addedBy) || null,
        items: [],
        subtotal: 0,
      };
    }
    byUser[item.addedBy].items.push(item);
    byUser[item.addedBy].subtotal += item.price * item.quantity;
  }

  const equalShare = roomUsers.length > 0 ? Math.ceil(grandTotal / roomUsers.length) : grandTotal;

  if (items.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 px-6 text-center bg-[#0c0c0c]">
        <div className="w-20 h-20 bg-[#161616] border border-[#252525] rounded-3xl flex items-center justify-center shadow-inner">
          <Receipt size={32} className="text-white/10" />
        </div>
        <div>
          <p className="font-display font-bold text-white text-xl">No Squad Bill Yet</p>
          <p className="text-white/30 text-sm mt-2 max-w-[200px] mx-auto">
            Once the squad starts adding food, we&apos;ll split the bill automatically!
          </p>
        </div>
      </div>
    );
  }

  if (showCheckout) {
    return <CheckoutScreen total={grandTotal} onBack={() => setShowCheckout(false)} />;
  }

  return (
    <div className="h-full flex flex-col bg-[#0c0c0c]">
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        
        {/* Split Mode Toggle */}
        <div className="bg-[#161616] p-1 rounded-2xl flex gap-1 border border-white/5">
          <button
            onClick={() => setSplitMode('individual')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              splitMode === 'individual' ? 'bg-[#FC8019] text-white shadow-lg shadow-[#FC8019]/20' : 'text-white/30 hover:text-white/50'
            }`}
          >
            <Receipt size={14} /> 
            Pay for What You Ordered
          </button>
          <button
            onClick={() => setSplitMode('equal')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              splitMode === 'equal' ? 'bg-[#FC8019] text-white shadow-lg shadow-[#FC8019]/20' : 'text-white/30 hover:text-white/50'
            }`}
          >
            <SplitSquareHorizontal size={14} /> 
            Split Equally
          </button>
        </div>

        {/* Bill Breakdown Cards */}
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {splitMode === 'individual' ? (
              <motion.div 
                key="individual"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-3"
              >
                {Object.entries(byUser).map(([uid, { user, items: userItems, subtotal }]) => {
                  const isMe = uid === userId;
                  const share = Math.round((subtotal / total) * grandTotal);
                  return (
                    <div key={uid} className={`bg-[#161616] rounded-3xl p-5 border transition-all ${isMe ? 'border-[#FC8019] bg-[#FC8019]/5 shadow-xl shadow-[#FC8019]/5' : 'border-white/5'}`}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${isMe ? 'bg-[#FC8019] text-white' : 'bg-white/5 text-white/40 border border-white/10'}`}>
                            {user?.avatar || '👤'}
                          </div>
                          <div>
                            <p className="text-xs font-black text-white uppercase tracking-tight">{user?.name || 'Unknown'} {isMe && '(You)'}</p>
                            <p className="text-[10px] text-white/30 font-bold">{userItems.length} items selected</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-black ${isMe ? 'text-[#FC8019]' : 'text-white'}`}>₹{share}</p>
                          <p className="text-[9px] text-white/20 font-bold uppercase">Proportional Share</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {userItems.map(item => (
                          <div key={item.id} className="bg-black/20 px-2 py-1 rounded-lg flex items-center gap-1 border border-white/5">
                            <span className="text-[10px]">{item.emoji}</span>
                            <span className="text-[9px] font-bold text-white/40 uppercase truncate max-w-[80px]">{item.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div 
                key="equal"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <div className="bg-gradient-to-br from-[#FC8019] to-[#ff9a3c] rounded-3xl p-8 text-center shadow-2xl shadow-[#FC8019]/20 overflow-hidden relative">
                  <div className="relative z-10">
                    <p className="text-[10px] text-white/60 font-black uppercase tracking-[0.2em] mb-2">Everyone Pays Exactly</p>
                    <p className="text-5xl font-black text-white">₹{equalShare}</p>
                    <p className="text-xs text-white/80 mt-4">Calculated for {roomUsers.length} squad members</p>
                  </div>
                  <Users size={120} className="absolute -right-8 -bottom-8 text-white/10" />
                </div>
                
                <div className="bg-[#161616] rounded-3xl p-5 border border-white/5 space-y-3">
                  {roomUsers.map(user => (
                    <div key={user.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{user.avatar}</span>
                        <span className="text-xs font-bold text-white/60 uppercase tracking-tight">{user.name}</span>
                      </div>
                      <span className="text-xs font-black text-white">₹{equalShare}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Grand Total Summary */}
        <div className="bg-[#161616] rounded-3xl p-6 border border-white/5 space-y-4 shadow-inner">
          <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.2em]">Detailed Invoice</p>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-white/40 font-medium">Squad Subtotal</span>
              <span className="text-white font-bold">₹{total}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-white/40 font-medium">Delivery Fee</span>
                <Info size={10} className="text-white/20" />
              </div>
              <span className={deliveryFee === 0 ? "text-green-500 font-bold" : "text-white font-bold"}>
                {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-white/40 font-medium">Platform Fee</span>
              <span className="text-white font-bold">₹{platformFee}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-white/40 font-medium">Restaurant GST & Charges</span>
              <span className="text-white font-bold">₹{tax}</span>
            </div>
          </div>
          <div className="pt-4 border-t border-white/5 flex justify-between items-end">
            <div>
              <p className="text-[9px] text-[#FC8019] font-black uppercase tracking-widest mb-1">Total Bill</p>
              <p className="text-3xl font-black text-white">₹{grandTotal}</p>
            </div>
            <div className="bg-green-500/10 px-3 py-1.5 rounded-xl border border-green-500/20 flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-green-500" />
              <span className="text-[10px] font-black text-green-500 uppercase tracking-tighter">Secure Split</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Checkout */}
      <div className="p-4 bg-[#161616] border-t border-white/5">
        <button
          onClick={() => setShowCheckout(true)}
          className="w-full bg-white text-black font-black py-4 rounded-2xl flex items-center justify-center gap-3 shadow-xl transition-all active:scale-95 group hover:bg-[#FC8019] hover:text-white"
        >
          <CreditCard size={18} />
          PROCEED TO FINAL PAYMENT
          <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}

function CheckoutScreen({ total, onBack }: { total: number; onBack: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="h-full flex flex-col items-center justify-center px-8 text-center bg-[#0c0c0c]"
    >
      <div className="relative mb-8">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 bg-green-500/20 blur-3xl rounded-full"
        />
        <div className="w-24 h-24 bg-green-500 rounded-[2.5rem] flex items-center justify-center relative z-10 shadow-2xl shadow-green-500/40">
          <CheckCircle size={48} className="text-white" />
        </div>
      </div>

      <h2 className="font-display font-black text-3xl text-white mb-3 tracking-tight">Order Confirmed!</h2>
      <p className="text-white/40 text-sm mb-10 max-w-xs font-medium">
        Your squad order is synced. Opening Swiggy to finalize payment and start cooking.
      </p>

      <div className="w-full max-w-sm space-y-3 mb-8">
        <div className="bg-[#161616] border border-white/5 rounded-3xl p-6 flex justify-between items-center shadow-inner">
          <div className="text-left">
            <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mb-1">Final Amount</p>
            <p className="text-4xl font-black text-[#FC8019]">₹{total}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
            <CreditCard size={24} className="text-white/20" />
          </div>
        </div>
      </div>

      <div className="w-full max-w-sm space-y-3">
        <button
          onClick={() => window.open('https://www.swiggy.com', '_blank')}
          className="w-full bg-[#FC8019] text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 shadow-2xl shadow-[#FC8019]/30 transition-all active:scale-95 group"
        >
          OPEN SWIGGY APP
          <ExternalLink size={18} />
        </button>
        <button 
          onClick={onBack} 
          className="w-full py-4 text-white/30 text-xs font-black uppercase tracking-widest hover:text-white transition-colors"
        >
          Cancel & Back to Room
        </button>
      </div>

      <p className="mt-12 text-[10px] text-white/10 font-bold uppercase tracking-[0.4em]">Powered by SquadBite AI Engine</p>
    </motion.div>
  );
}
