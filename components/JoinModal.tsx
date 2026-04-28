'use client';

import { useState } from 'react';
import { ChefHat, Users } from 'lucide-react';
import { AVATAR_EMOJIS } from '@/lib/mockData';

interface Props {
  roomId: string;
  onJoin: (name: string) => void;
}

export default function JoinModal({ roomId, onJoin }: Props) {
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_EMOJIS[0]);

  function handleSubmit() {
    const n = name.trim();
    if (n.length < 2) return;
    onJoin(n);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0c0c0c] px-4">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-96 h-96 bg-[#FC8019]/8 rounded-full blur-3xl" />
      </div>

      <div className="card w-full max-w-sm p-6 relative z-10 orange-glow">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-9 h-9 rounded-xl bg-[#FC8019] flex items-center justify-center">
            <ChefHat size={18} className="text-white" />
          </div>
          <div>
            <p className="font-display font-bold text-white">SquadBite</p>
            <p className="text-xs text-[#555]">Joining room <span className="text-[#FC8019] font-mono">{roomId}</span></p>
          </div>
        </div>

        <h2 className="font-display text-2xl font-bold text-white mb-1">
          Who are you? 👋
        </h2>
        <p className="text-[#666] text-sm mb-5">Enter your name to join the squad</p>

        {/* Avatar picker */}
        <div className="mb-4">
          <p className="text-xs text-[#666] mb-2 font-medium uppercase tracking-wide">Pick your vibe</p>
          <div className="flex flex-wrap gap-2">
            {AVATAR_EMOJIS.map(emoji => (
              <button
                key={emoji}
                onClick={() => setSelectedAvatar(emoji)}
                className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all ${
                  selectedAvatar === emoji
                    ? 'bg-[#FC8019]/20 border-2 border-[#FC8019] scale-110'
                    : 'bg-[#1e1e1e] border-2 border-transparent hover:border-[#3a3a3a]'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Name input */}
        <div className="mb-5">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">{selectedAvatar}</span>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="Your nickname..."
              maxLength={20}
              autoFocus
              className="chat-input pl-10"
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={name.trim().length < 2}
          className="btn-orange w-full flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Users size={16} />
          Join Squad Room
        </button>

        <p className="text-center text-xs text-[#444] mt-4">
          No signup required · Leave anytime
        </p>
      </div>
    </div>
  );
}
