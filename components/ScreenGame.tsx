
import React, { useState, useEffect } from 'react';
import { Player, GameState, GamePhase } from '../types';
import { Button } from './Button';
import { Eye, EyeOff, Clock, Megaphone, Crown, MicOff, Laugh, AlertTriangle, BadgeCheck, CheckCircle2, Send, Drama, Gift } from 'lucide-react';
import { sounds } from '../services/sound';
import { SPECIAL_ROLES_INFO } from '../constants';

interface ScreenGameProps {
  gameState: GameState;
  myPlayerId: string;
  onEndTurn: (word: string) => void;
  onTimeUp: () => void;
}

export const ScreenGame: React.FC<ScreenGameProps> = ({ gameState, myPlayerId, onEndTurn }) => {
  const [showWord, setShowWord] = useState(false);
  const [showRoleReveal, setShowRoleReveal] = useState(true);
  const [showNewRoundGift, setShowNewRoundGift] = useState(false);
  const [turnWord, setTurnWord] = useState('');

  const myPlayer = gameState.players.find(p => p.id === myPlayerId);
  const isMyTurn = gameState.currentTurnPlayerId === myPlayerId;
  const turnPlayer = gameState.players.find(p => p.id === gameState.currentTurnPlayerId);
  
  // Resolve Role Info
  // HIDING OUTSIDER: Always show 'NORMAL' (or special role) even if isOutsider is true.
  // The outsider should NOT know they are the outsider.
  const roleKey = myPlayer?.specialRole || 'NORMAL';
  const roleInfo = SPECIAL_ROLES_INFO[roleKey as keyof typeof SPECIAL_ROLES_INFO];
  const isMute = roleKey === 'MUTE';
  const isActor = roleKey === 'ACTOR';

  // Role Visual Theme Logic
  const roleTheme = (() => {
      switch (roleKey) {
          // OUTSIDER theme is now technically unused in Game Screen, but kept for reference or if we revert
          case 'OUTSIDER': return {
              wrapper: "from-red-950 via-red-900 to-black",
              border: "border-red-600",
              title: "text-red-500",
              iconBg: "bg-red-900/40 border-red-500",
              glow: "shadow-red-900/50",
              decor: (
                  <>
                    <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#ef444405_10px,#ef444405_20px)] opacity-50"></div>
                    <AlertTriangle className="absolute -top-4 -right-4 text-red-800/20 w-32 h-32 rotate-12 animate-pulse" />
                  </>
              )
          };
          case 'JOKER': return {
              wrapper: "from-purple-900 via-fuchsia-900 to-black",
              border: "border-purple-500",
              title: "text-purple-400",
              iconBg: "bg-purple-900/40 border-purple-500",
              glow: "shadow-purple-900/50",
              decor: (
                  <>
                     <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')]"></div>
                     <Laugh className="absolute top-2 right-2 text-purple-500/30 w-12 h-12 animate-bounce" />
                     {/* Playful Glitch Effect */}
                     <div className="absolute bottom-2 left-2 pointer-events-none">
                        <div className="text-6xl animate-glitch select-none opacity-50 blur-[1px]">🤡</div>
                     </div>
                     <div className="absolute top-1/2 left-2 text-purple-500/20 w-8 h-8 animate-spin">?</div>
                  </>
              )
          };
          case 'MUTE': return {
              wrapper: "from-blue-900 via-indigo-900 to-black",
              border: "border-blue-500",
              title: "text-blue-400",
              iconBg: "bg-blue-900/40 border-blue-500",
              glow: "shadow-blue-900/50",
              decor: (
                  <>
                    <div className="absolute inset-0 bg-blue-500/5"></div>
                    <MicOff className="absolute -bottom-6 -left-6 text-blue-500/20 w-40 h-40 -rotate-12" />
                    {/* Subtle Shushing Animation */}
                    <div className="absolute top-4 right-4 text-4xl animate-shush drop-shadow-lg">🤫</div>
                  </>
              )
          };
          case 'ACTOR': return {
            wrapper: "from-pink-900 via-rose-900 to-black",
            border: "border-pink-500",
            title: "text-pink-400",
            iconBg: "bg-pink-900/40 border-pink-500",
            glow: "shadow-pink-900/50",
            decor: (
                <>
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-pink-500/5 to-transparent"></div>
                    <Drama className="absolute -top-6 -right-6 text-pink-500/20 w-40 h-40 rotate-12" />
                    <div className="absolute bottom-4 left-4 text-pink-500/30 w-8 h-8 animate-bounce">🎭</div>
                </>
            )
        };
          default: return { // NORMAL
              wrapper: "from-zinc-900 to-black",
              border: "border-green-600",
              title: "text-green-500",
              iconBg: "bg-green-900/40 border-green-500",
              glow: "shadow-green-900/50",
              decor: (
                  <div className="absolute inset-0 bg-green-500/5"></div>
              )
          };
      }
  })();

  // Vibration on turn start
  useEffect(() => {
      if (isMyTurn) {
          sounds.vibrateTurn();
          setTurnWord(''); // Reset input
      }
  }, [isMyTurn]);

  // Ensure Role Reveal shows up when phase changes, but allows dismissal
  useEffect(() => {
    if (gameState.phase === GamePhase.ROLE_REVEAL) {
        setShowRoleReveal(true);
        const timer = setTimeout(() => {
            setShowRoleReveal(false);
        }, 5000); 
        return () => clearTimeout(timer);
    }
  }, [gameState.phase]);

  // Show "Gift" animation if I get a special role mid-game (e.g. Round 2 or 3)
  useEffect(() => {
      if (gameState.currentRound > 1 && roleKey !== 'NORMAL') {
          setShowNewRoundGift(true);
          const timer = setTimeout(() => setShowNewRoundGift(false), 4000);
          return () => clearTimeout(timer);
      }
  }, [gameState.currentRound, roleKey]);

  const handleEndTurn = () => {
      if (!turnWord.trim()) return;
      sounds.vibrateSuccess();
      onEndTurn(turnWord.trim());
      setTurnWord('');
  };

  // Role Reveal Screen (Round 1 Start or Reconnect)
  if (showRoleReveal && gameState.currentRound === 1) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-6 text-center animate-enter bg-black/95 z-50 absolute inset-0 overflow-hidden">
        <div className={`absolute inset-0 opacity-20 bg-gradient-to-b ${roleTheme.wrapper} animate-pulse pointer-events-none`}></div>
        
        <h2 className="text-xl text-zinc-400 mb-6 uppercase tracking-widest relative z-10">الدور المسند إليك</h2>
        
        <div className={`bg-gradient-to-b ${roleTheme.wrapper} p-1 rounded-[2rem] shadow-2xl ${roleTheme.glow} w-full max-w-xs transform hover:scale-105 transition-transform duration-500 border ${roleTheme.border} relative z-10`}>
            <div className="bg-black/80 backdrop-blur-sm rounded-[1.9rem] p-8 relative overflow-hidden h-full">
                {roleTheme.decor}
                <div className="animate-pop relative z-10">
                    <div className={`w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-6 border-2 shadow-[0_0_30px_rgba(255,255,255,0.1)] ${roleTheme.iconBg}`}>
                            <span className="text-6xl drop-shadow-md">{roleInfo.emoji}</span>
                    </div>
                    <h1 className={`text-4xl font-black mb-3 ${roleTheme.title} drop-shadow-sm`}>{roleInfo.label}</h1>
                    <div className={`h-1 w-16 mx-auto mb-6 rounded-full bg-current opacity-50 ${roleTheme.title}`}></div>
                    <p className="text-zinc-300 text-sm leading-relaxed font-bold bg-black/40 p-2 rounded-lg border border-white/5">
                        {roleInfo.desc}
                    </p>
                    <div className="mt-8">
                        <p className="text-zinc-500 text-[10px] mb-2 uppercase tracking-wider font-bold">
                            كلمتك السرية
                        </p>
                        <div className={`bg-black/60 border ${roleTheme.border} border-opacity-50 p-4 rounded-xl shadow-inner`}>
                            <span className={`text-3xl font-black ${roleTheme.title}`}>{myPlayer?.word}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="mt-10 w-full max-w-xs relative z-10">
            <Button onClick={() => setShowRoleReveal(false)} fullWidth variant="outline" className="backdrop-blur-md bg-black/30 border-zinc-600 text-zinc-300 hover:text-white hover:border-white">
                جاهز 🎬
            </Button>
        </div>
      </div>
    );
  }

  // Main Game
  return (
    <div className={`flex flex-col h-full items-center justify-between p-6 max-w-md mx-auto transition-colors duration-1000 ${isMyTurn ? 'bg-green-900/10' : ''}`}>
      
      {/* New Round Gift Popup */}
      {showNewRoundGift && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 animate-pop w-[90%] max-w-sm">
               <div className={`bg-gradient-to-r ${roleTheme.wrapper} border ${roleTheme.border} p-4 rounded-xl shadow-2xl flex items-center gap-4`}>
                   <div className="p-3 bg-black/40 rounded-full animate-bounce">
                       <Gift size={24} className={roleTheme.title.replace('text-', 'text-')} />
                   </div>
                   <div>
                       <h3 className={`font-black ${roleTheme.title} text-lg`}>جالك دور هدية!</h3>
                       <p className="text-white text-xs font-bold">انت في الجولة دي: {roleInfo.label} {roleInfo.emoji}</p>
                   </div>
               </div>
          </div>
      )}

      {/* 1. Header: Round Info & Role Reminder */}
      <div className="w-full flex justify-between items-start glass-panel p-4 rounded-2xl relative z-20">
        <div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest block">المشهد</span>
            <div className="flex items-baseline gap-1">
                 <span className="text-2xl font-black text-white">{gameState.currentRound}</span>
                 <span className="text-zinc-600 text-sm font-bold">/ {gameState.config.maxRounds}</span>
            </div>
            {/* Role Visual Cue in Header - Uses resolved roleKey (which hides outsider) */}
            <div className={`mt-1 flex items-center gap-1.5 px-2 py-0.5 rounded-md border border-white/10 ${roleKey === 'OUTSIDER' ? 'bg-red-900/40 text-red-200' : 'bg-zinc-800/50 text-zinc-400'}`}>
                <span className="text-sm">{roleInfo.emoji}</span>
                <span className="text-[10px] font-bold">{roleInfo.label}</span>
            </div>
        </div>
        
        {/* Secret Word Toggle */}
        <button 
            className="flex flex-col items-end gap-1 bg-zinc-800/50 hover:bg-zinc-700/50 px-3 py-2 rounded-xl border border-zinc-700 transition-colors"
            onMouseDown={() => setShowWord(true)}
            onMouseUp={() => setShowWord(false)}
            onTouchStart={() => setShowWord(true)}
            onTouchEnd={() => setShowWord(false)}
            onTouchCancel={() => setShowWord(false)}
        >
           <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">كلمتك السرية</span>
           {showWord ? (
               <span className="font-black text-white text-sm animate-enter">{myPlayer?.word}</span>
           ) : (
               <div className="flex items-center gap-2">
                   <EyeOff size={14} className="text-zinc-500" />
                   <span className="text-zinc-300 text-sm font-bold">إضغط للكشف</span>
               </div>
           )}
        </button>
      </div>

      {/* 2. Main Focus: WHOSE TURN IS IT? */}
      <div className="flex-1 flex flex-col items-center justify-center w-full relative">
            
            {/* The Spotlight Circle */}
            <div className={`relative w-64 h-64 rounded-full flex items-center justify-center mb-8 transition-all duration-500 ${isMyTurn ? 'bg-green-600/10 shadow-[0_0_80px_rgba(34,197,94,0.2)] scale-110' : 'bg-zinc-900/30'}`}>
                {/* Rotating Border */}
                {isMyTurn && <div className="absolute inset-0 rounded-full border-4 border-dashed border-green-500/30 animate-[spin_10s_linear_infinite]"></div>}
                
                {/* Avatar */}
                <span className={`text-[8rem] select-none transition-transform duration-500 ${isMyTurn ? 'scale-110 drop-shadow-2xl' : 'opacity-50 grayscale scale-90'}`}>
                    {turnPlayer?.avatar}
                </span>

                {/* Status Badge */}
                <div className={`absolute -bottom-4 px-6 py-2 rounded-full font-black text-lg shadow-xl flex items-center gap-2 border ${isMyTurn ? 'bg-green-600 text-white border-green-400 animate-bounce' : 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>
                    {isMyTurn ? (
                        <>
                            <Megaphone size={18} />
                            <span>دورك يا فنان!</span>
                        </>
                    ) : (
                        <>
                            <span className="animate-pulse w-2 h-2 rounded-full bg-red-500"></span>
                            <span>بيتكلم...</span>
                        </>
                    )}
                </div>
            </div>

            {/* Player Name */}
            <h2 className={`text-4xl font-black mb-2 text-center transition-colors ${isMyTurn ? 'text-white' : 'text-zinc-500'}`}>
                {turnPlayer?.name}
            </h2>
            <p className="text-zinc-500 font-bold mb-8">
                {isMyTurn ? (isMute ? "أوعى تتكلم! استخدم الإيموجي بس 🤐" : "قول تلميحك واكتبه عشان السكور") : "ركز في الكلام اللي بيتقال"}
            </p>

            {/* Timer */}
            <div className={`text-5xl font-black tabular-nums transition-all ${gameState.timer <= 3 ? 'text-red-500 scale-125 animate-pulse' : 'text-zinc-300'}`}>
                {gameState.timer} <span className="text-lg text-zinc-600">ث</span>
            </div>
      </div>

      {/* 3. Footer Action */}
      <div className="w-full mt-4">
        {isMyTurn ? (
            <div className="flex gap-2 w-full animate-enter">
                <input 
                    type="text" 
                    value={turnWord}
                    onChange={(e) => setTurnWord(e.target.value)}
                    placeholder={isMute ? "🤫 إيموجي بس! (ممنوع الكلام)" : isActor ? "مثل تلميحك بصوتك وأنت بتكتبه! 🎭" : "اكتب كلمتك هنا..."}
                    className={`flex-1 bg-zinc-900 border ${isMute ? 'border-blue-500 text-blue-300 placeholder-blue-500/50' : isActor ? 'border-pink-500 text-pink-300 placeholder-pink-500/50' : 'border-zinc-700 text-white placeholder-zinc-600'} rounded-xl px-4 font-bold outline-none focus:border-red-500 transition-colors`}
                    autoFocus
                />
                <Button 
                    onClick={handleEndTurn} 
                    disabled={!turnWord.trim()}
                    variant="primary" 
                    className="py-4 px-6 shadow-[0_0_20px_rgba(220,38,38,0.4)]"
                >
                    <Send size={24} />
                </Button>
            </div>
        ) : (
            <div className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 text-center text-zinc-500 font-bold">
                انتظر دورك...
            </div>
        )}
      </div>
    </div>
  );
};
