
import React, { useState } from 'react';
import { Player, VotePayload } from '../types';
import { Button } from './Button';
import { Skull, AlertTriangle, Crosshair, BadgeCheck, Users, Check, ArrowRight, Ban, CheckCircle2 } from 'lucide-react';
import { sounds } from '../services/sound';

interface ScreenVoteProps {
  players: Player[];
  myPlayerId: string;
  onVote: (vote: VotePayload) => void;
}

export const ScreenVote: React.FC<ScreenVoteProps> = ({ players, myPlayerId, onVote }) => {
  const [step, setStep] = useState<1 | 2>(1); // 1 = Outsider, 2 = Teammate
  const [selectedOutsider, setSelectedOutsider] = useState<string | null>(null);
  const [selectedTeammate, setSelectedTeammate] = useState<string | null>(null); // null string or actual ID
  const [isNoTeammate, setIsNoTeammate] = useState(false);

  const myPlayer = players.find(p => p.id === myPlayerId);
  const otherPlayers = players.filter(p => p.id !== myPlayerId);
  
  // Players to show in list:
  // Step 1: All players (INCLUDING SELF - Strategy!)
  // Step 2: All players EXCEPT self (cannot be your own teammate) AND except the one selected as Outsider
  const availableToVote = step === 1 
    ? players 
    : otherPlayers.filter(p => p.id !== selectedOutsider);

  const handleSelect = (playerId: string) => {
    sounds.vibrateClick();
    if (step === 1) {
        setSelectedOutsider(playerId);
    } else {
        setSelectedTeammate(playerId);
        setIsNoTeammate(false);
    }
  };

  const handleNoTeammate = () => {
      sounds.vibrateClick();
      setIsNoTeammate(true);
      setSelectedTeammate(null);
  };

  const handleNext = () => {
      sounds.vibrateSuccess();
      setStep(2);
  };

  const handleConfirm = () => {
    if (selectedOutsider && (selectedTeammate || isNoTeammate)) {
        sounds.vibrateSuccess();
        onVote({ outsiderId: selectedOutsider, teammateId: isNoTeammate ? null : selectedTeammate });
    }
  };

  return (
    <div className={`flex flex-col h-full p-4 animate-fade-in max-w-md mx-auto bg-gradient-to-b ${step === 1 ? 'from-red-950/30' : 'from-blue-950/30'} to-black transition-colors duration-500`}>
      
      {/* Header */}
      <div className="text-center my-4 relative">
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 blur-[50px] rounded-full ${step === 1 ? 'bg-red-600/20' : 'bg-blue-600/20'}`}></div>
        
        {step === 1 ? (
             <>
                <h2 className="text-4xl font-black text-white mb-2 flex items-center justify-center gap-2 drop-shadow-[0_0_10px_rgba(220,38,38,0.8)]">
                    <Skull className="text-red-500 animate-pulse" size={36} />
                    مين الدخيل؟
                </h2>
                <p className="text-red-200/70 text-sm font-bold animate-pulse">
                    المرحلة ١/٢: اختار اللي بوظ اللعبة (ممكن تختار نفسك)
                </p>
             </>
        ) : (
            <>
                <h2 className="text-3xl font-black text-white mb-2 flex items-center justify-center gap-2 drop-shadow-[0_0_10px_rgba(37,99,235,0.8)]">
                    <Users className="text-blue-500 animate-bounce" size={36} />
                    مين صاحبك؟
                </h2>
                <p className="text-blue-200/70 text-sm font-bold">
                    المرحلة ٢/٢: اختار واحد معاك في نفس التيم
                </p>
            </>
        )}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto pb-40 px-2">
        
        {/* Special 'No Teammate' Button for Step 2 */}
        {step === 2 && (
             <button
                onClick={handleNoTeammate}
                className={`w-full mb-4 p-4 rounded-xl border-2 transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden
                    ${isNoTeammate 
                        ? 'bg-purple-900/80 border-purple-500 ring-2 ring-purple-500 ring-offset-2 ring-offset-black shadow-[0_0_30px_rgba(168,85,247,0.5)] scale-[1.02]' 
                        : 'bg-zinc-900/50 border-dashed border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800'
                    }
                `}
             >
                 {isNoTeammate && (
                     <div className="absolute inset-0 rounded-xl border-[3px] border-purple-400 animate-pulse opacity-70 pointer-events-none"></div>
                 )}
                <Ban size={24} className={isNoTeammate ? "text-purple-400" : "text-zinc-500"} />
                <span className={`font-bold text-lg ${isNoTeammate ? "text-white" : "text-zinc-400"}`}>
                    أنا الدخيل / مليش صاحب
                </span>
                {isNoTeammate && <Check size={20} className="text-purple-400 animate-pop" />}
             </button>
        )}

        <div className="grid grid-cols-2 gap-3 content-start">
            {availableToVote.map((p) => {
                const isSelected = (step === 1 ? selectedOutsider : selectedTeammate) === p.id;
                
                return (
                    <button
                        key={p.id}
                        onClick={() => handleSelect(p.id)}
                        className={`
                            relative p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-2 overflow-hidden group
                            ${isSelected 
                                ? (step === 1 
                                    ? 'bg-red-900/80 border-red-500 ring-2 ring-red-600 ring-offset-2 ring-offset-black shadow-[0_0_40px_rgba(220,38,38,0.6)] scale-105 z-10' 
                                    : 'bg-blue-900/80 border-blue-500 ring-2 ring-blue-600 ring-offset-2 ring-offset-black shadow-[0_0_40px_rgba(37,99,235,0.6)] scale-105 z-10')
                                : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800/80 grayscale-[0.5] hover:grayscale-0'
                            }
                        `}
                    >
                        {/* Background Texture for selected */}
                        {isSelected && (
                            <div className={`absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,${step === 1 ? '#ff000020' : '#0000ff20'}_10px,${step === 1 ? '#ff000020' : '#0000ff20'}_20px)]`}></div>
                        )}

                        {/* Pulsating Border Overlay */}
                        {isSelected && (
                            <div className={`absolute inset-0 rounded-xl border-[3px] ${step === 1 ? 'border-red-400' : 'border-blue-400'} animate-pulse opacity-70 pointer-events-none`}></div>
                        )}

                        {/* Selection Icon Overlay (Top-Right) */}
                        {isSelected && (
                             <div className={`absolute top-2 right-2 p-1.5 rounded-full ${step === 1 ? 'bg-red-600' : 'bg-blue-600'} text-white shadow-lg animate-enter z-20`}>
                                {step === 1 ? <Crosshair size={14} /> : <CheckCircle2 size={14} />}
                             </div>
                        )}

                        {/* Avatar */}
                        <div className="relative">
                            <span className={`text-5xl block transition-transform duration-300 ${isSelected ? 'scale-110' : 'group-hover:scale-105 opacity-80 group-hover:opacity-100'}`}>
                                {p.avatar}
                            </span>
                            
                            {/* Target Scope Overlay (Large) */}
                            {isSelected && step === 1 && (
                                <div className="absolute inset-[-20%] animate-[spin_6s_linear_infinite] opacity-90 pointer-events-none">
                                    <Crosshair className="w-full h-full text-red-500 drop-shadow-[0_0_5px_rgba(220,38,38,0.8)]" strokeWidth={1} />
                                </div>
                            )}
                        </div>
                        
                        <span className={`font-black text-lg truncate w-full ${isSelected ? 'text-white' : 'text-zinc-500'}`}>
                            {p.id === myPlayerId ? "أنا (نفسي)" : p.name}
                        </span>
                    </button>
                );
            })}
        </div>
      </div>

      {/* Action Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/95 to-transparent flex justify-center z-20 pointer-events-none">
        <div className="w-full max-w-md pointer-events-auto">
            {step === 1 ? (
                <Button 
                    fullWidth 
                    onClick={handleNext} 
                    disabled={!selectedOutsider}
                    variant="danger" 
                    className="animate-pop py-4"
                >
                   <span className="flex items-center gap-2 text-xl">
                       <ArrowRight size={24} />
                       اخترت الدخيل، اللي بعده
                   </span>
                </Button>
            ) : (
                <Button 
                    fullWidth 
                    onClick={handleConfirm} 
                    disabled={!selectedTeammate && !isNoTeammate}
                    variant="primary" 
                    className="animate-pop py-4 bg-blue-600 hover:bg-blue-700 border-blue-500 shadow-blue-900/40"
                >
                   <span className="flex items-center gap-2 text-xl">
                       <Check size={24} />
                       تأكيد الاختيارات
                   </span>
                </Button>
            )}
        </div>
      </div>
    </div>
  );
};
