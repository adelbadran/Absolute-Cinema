
import React, { useState } from 'react';
import { Player } from '../types';
import { Button } from './Button';
import { Skull, AlertTriangle, Crosshair, BadgeCheck } from 'lucide-react';
import { sounds } from '../services/sound';

interface ScreenVoteProps {
  players: Player[];
  myPlayerId: string;
  onVote: (outsiderId: string) => void;
}

export const ScreenVote: React.FC<ScreenVoteProps> = ({ players, myPlayerId, onVote }) => {
  const [selectedOutsider, setSelectedOutsider] = useState<string | null>(null);

  const myPlayer = players.find(p => p.id === myPlayerId);
  const otherPlayers = players.filter(p => p.id !== myPlayerId);
  const isMayor = myPlayer?.specialRole === 'MAYOR';

  const handleSelect = (playerId: string) => {
    sounds.vibrateClick();
    setSelectedOutsider(playerId);
  };

  const handleConfirm = () => {
    if (selectedOutsider) {
        sounds.vibrateSuccess();
        onVote(selectedOutsider);
    }
  };

  return (
    <div className="flex flex-col h-full p-4 animate-fade-in max-w-md mx-auto bg-gradient-to-b from-red-950/30 to-black">
      
      {/* Header */}
      <div className="text-center my-4 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-red-600/20 blur-[50px] rounded-full"></div>
        <h2 className="text-4xl font-black text-white mb-2 flex items-center justify-center gap-2 drop-shadow-[0_0_10px_rgba(220,38,38,0.8)]">
            <Skull className="text-red-500 animate-pulse" size={36} />
            مين الدخيل؟
        </h2>
        <p className="text-red-200/70 text-sm font-bold animate-pulse">
            اللحظة الحاسمة! اختار اللي بوظ اللعبة.
        </p>

        {isMayor && (
            <div className="mt-3 inline-flex items-center gap-2 bg-gradient-to-r from-yellow-700 to-yellow-900 border border-yellow-500/50 px-4 py-1.5 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.3)] animate-enter">
                <BadgeCheck size={16} className="text-yellow-400" />
                <span className="text-yellow-100 text-xs font-bold">أنت العمدة: صوتك بـ 2 🔥</span>
            </div>
        )}
      </div>

      {/* Grid */}
      <div className="flex-1 grid grid-cols-2 gap-3 content-start overflow-y-auto pb-40 px-2">
        {otherPlayers.map((p) => {
            const isSelected = selectedOutsider === p.id;
            
            return (
                <button
                    key={p.id}
                    onClick={() => handleSelect(p.id)}
                    className={`
                        relative p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-2 overflow-hidden group
                        ${isSelected 
                            ? 'bg-red-900/60 border-red-500 shadow-[0_0_30px_rgba(220,38,38,0.4)] scale-[1.02] z-10' 
                            : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800'
                        }
                    `}
                >
                    {/* Background Texture for selected */}
                    {isSelected && (
                        <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#ff000010_10px,#ff000010_20px)]"></div>
                    )}

                    {/* Avatar */}
                    <div className="relative">
                        <span className={`text-5xl block transition-transform duration-300 ${isSelected ? 'scale-110' : 'group-hover:scale-105 grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100'}`}>
                            {p.avatar}
                        </span>
                        
                        {/* Target Scope Overlay */}
                        {isSelected && (
                            <div className="absolute inset-[-20%] animate-spin-slow opacity-80 pointer-events-none">
                                <Crosshair className="w-full h-full text-red-500" strokeWidth={1} />
                            </div>
                        )}
                    </div>
                    
                    <span className={`font-black text-lg truncate w-full ${isSelected ? 'text-red-100' : 'text-zinc-500'}`}>
                        {p.name}
                    </span>

                    {/* Suspicion Meter (Visual Only) */}
                    <div className="w-full h-1 bg-black rounded-full mt-1 overflow-hidden">
                         <div className={`h-full ${isSelected ? 'bg-red-500 w-[90%]' : 'bg-zinc-700 w-[20%]'} transition-all duration-500`}></div>
                    </div>
                </button>
            );
        })}
      </div>

      {/* Action Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/95 to-transparent flex justify-center z-20">
        <div className="w-full max-w-md">
            {selectedOutsider ? (
                <Button fullWidth onClick={handleConfirm} variant="danger" className="animate-pop shadow-[0_0_30px_rgba(220,38,38,0.6)] border-red-500 py-4">
                   <span className="flex items-center gap-2 text-xl">
                       <AlertTriangle size={24} />
                       إعدام {players.find(p => p.id === selectedOutsider)?.name} ⚖️
                   </span>
                </Button>
            ) : (
                <div className="text-center text-zinc-500 font-bold animate-pulse text-sm py-4">
                    حدد الدخيل عشان نخلص عليه...
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
