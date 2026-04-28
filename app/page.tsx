'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Sparkles, ShoppingCart, Receipt, ArrowRight, ChefHat, Zap, MessageSquare, Target } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);

  async function createRoom() {
    setLoading(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
      const res = await fetch(`${backendUrl}/api/room`, { method: 'POST' });
      const { roomId } = await res.json();
      router.push(`/room/${roomId}`);
    } catch {
      setLoading(false);
    }
  }

  function joinRoom() {
    const code = roomCode.trim().toUpperCase();
    if (code.length < 4) return;
    router.push(`/room/${code}`);
  }

  return (
    <main className="min-h-screen bg-[#0c0c0c] flex flex-col relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#FC8019]/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-500/10 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] left-[10%] w-[20%] h-[20%] bg-blue-500/5 blur-[80px] rounded-full" />
      </div>

      {/* Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-[#0c0c0c]/50 backdrop-blur-md z-30"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FC8019] to-[#ff9a3c] flex items-center justify-center shadow-lg shadow-[#FC8019]/20">
            <ChefHat size={20} className="text-white" />
          </div>
          <span className="font-display font-black text-2xl text-white tracking-tight">SquadBite</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">NVIDIA AI Engine Live</span>
          </div>
        </div>
      </motion.header>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center relative z-10">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          {/* AI Badge */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-[#FC8019]/10 border border-[#FC8019]/20 rounded-full px-5 py-2 mb-8"
          >
            <Sparkles size={14} className="text-[#FC8019]" />
            <span className="text-xs text-[#FC8019] font-black uppercase tracking-widest">Real-time Group Ordering</span>
          </motion.div>

          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="font-display text-6xl md:text-8xl font-black text-white mb-6 leading-[0.9] tracking-tighter"
          >
            Order food with<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FC8019] to-[#ff9a3c]">your squad.</span>
          </motion.h1>

          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-white/40 text-lg md:text-xl mb-12 leading-relaxed max-w-xl mx-auto font-medium"
          >
            The smartest way for squads to decide what to eat. 
            AI suggestions, shared carts, and instant bill splitting.
          </motion.p>

          {/* Main Actions */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
              <button
                onClick={createRoom}
                disabled={loading}
                className="flex-1 bg-[#FC8019] hover:bg-[#e8730a] text-white font-black py-5 px-8 rounded-2xl flex items-center justify-center gap-3 shadow-2xl shadow-[#FC8019]/30 transition-all active:scale-95 text-lg"
              >
                {loading ? (
                  <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Users size={20} />
                )}
                {loading ? 'OPENING KITCHEN...' : 'CREATE A ROOM'}
              </button>
            </div>

            <div className="flex items-center gap-4 w-full max-w-sm relative">
              <div className="absolute left-4 pointer-events-none">
                <Target size={16} className="text-white/20" />
              </div>
              <input
                value={roomCode}
                onChange={e => setRoomCode(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && joinRoom()}
                placeholder="OR ENTER ROOM CODE..."
                maxLength={8}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-12 pr-4 text-center tracking-[0.4em] font-mono font-black text-white focus:border-[#FC8019] focus:outline-none transition-all placeholder:text-white/10"
              />
              <motion.button
                whileHover={{ x: 3 }}
                onClick={joinRoom}
                disabled={roomCode.length < 4}
                className="absolute right-3 bg-white/10 hover:bg-white/20 text-white p-2 rounded-xl disabled:opacity-0 transition-all"
              >
                <ArrowRight size={20} />
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Feature Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="px-6 pb-20 relative z-10"
      >
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Users, label: 'Live Squad', desc: 'Real-time multi-user sync', color: 'bg-blue-500' },
            { icon: Sparkles, label: 'AI Concierge', desc: 'NVIDIA powered picks', color: 'bg-[#FC8019]' },
            { icon: ShoppingCart, label: 'Shared Cart', desc: 'Add together, buy once', color: 'bg-green-500' },
            { icon: Receipt, label: 'Smart Split', desc: 'Fair billing for all', color: 'bg-purple-500' },
          ].map(({ icon: Icon, label, desc, color }) => (
            <div key={label} className="bg-[#161616] border border-white/5 rounded-3xl p-6 transition-all hover:border-[#FC8019]/30 hover:bg-[#1c1c1c] group">
              <div className={`w-12 h-12 ${color}/10 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 group-hover:rotate-6`}>
                <Icon size={20} className={color.replace('bg-', 'text-')} />
              </div>
              <p className="font-display font-black text-white text-lg mb-1">{label}</p>
              <p className="text-white/30 text-sm font-medium">{desc}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Footer */}
      <footer className="border-t border-white/5 px-8 py-10 text-center relative z-10">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 opacity-30 grayscale hover:grayscale-0 transition-all">
            <img src="https://upload.wikimedia.org/wikipedia/commons/2/21/Nvidia_logo.svg" alt="Nvidia" className="h-4" />
            <span className="text-xs font-black text-white">+ SquadBite Engine</span>
          </div>
          <p className="text-white/10 text-[10px] font-black uppercase tracking-[0.5em]">
            &copy; 2026 SquadBite AI · Premium Food Experience
          </p>
        </div>
      </footer>
    </main>
  );
}
