
import React, { useState, useEffect } from 'react';
import { Player, GameState, GamePhase } from '../types';
import { Button } from './Button';
import { Eye, EyeOff, Clock, Megaphone, Crown, MicOff, Laugh, AlertTriangle, BadgeCheck, CheckCircle2, Send, Drama, Gift, Check } from 'lucide-react';
import { sounds } from '../services/sound';
import { SPECIAL_ROLES_INFO } from '../constants';
import { ConfirmModal } from './ConfirmModal';

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
  const [showEndTurnConfirm, setShowEndTurnConfirm] = useState(false);

  const myPlayer = gameState.players.find(p => p.id === myPlayerId);
  const isMyTurn = gameState.currentTurnPlayerId === myPlayerId;
  const turnPlayer = gameState.players.find(p => p.id === gameState.currentTurnPlayerId);
  
  // Resolve Role Info
  const roleKey = myPlayer?.specialRole || 'NORMAL';
  const roleInfo = SPECIAL_ROLES_INFO[roleKey as keyof typeof SPECIAL_ROLES_INFO];
  const isMute = roleKey === 'MUTE';
  
  // Role Visual Theme Logic - Enhanced Visuals
  const roleTheme = (() => {
      switch (roleKey) {
          case 'OUTSIDER': return {
              wrapper: "from-red-950 via-red-900 to-black bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]",
              border: "border-red-600 shadow-[0_0_50px_rgba(220,38,38,0.5)]",
              title: "text-red-500 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]",
              iconBg: "bg-gradient-to-br from-red-900 to-black border-red-500",
              glow: "shadow-red-900/50",
              decor: (
                  <>
                    <div className="absolute inset-0 bg-red-900/10 mix-blend-overlay"></div>
                    <AlertTriangle className="absolute -top-4 -right-4 text-red-600/20 w-32 h-32 rotate-12 animate-pulse" />
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-red-600 shadow-[0_0_20px_red]"></div>
                  </>
              )
          };
          case 'JOKER': return {
              wrapper: "from-purple-900 via-fuchsia-900 to-black bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')]",
              border: "border-purple-500 shadow-[0_0_50px_rgba(168,85,247,0.5)]",
              title: "text-purple-400 drop-shadow-[2px_2px_0_#000]",
              iconBg: "bg-gradient-to-br from-purple-900 to-black border-purple-500",
              glow: "shadow-purple-900/50",
              decor: (
                  <>
                     <div className="absolute inset-0 bg-purple-500/5"></div>
                     <Laugh className="absolute top-2 right-2 text-purple-400/30 w-16 h-16 animate-bounce" />
                     {/* Glitch Effect Containers */}
                     <div className="absolute top-1/2 left-0 w-full h-1 bg-purple-500/50 blur-sm animate-pulse"></div>
                     <div className="absolute bottom-10 right-10 text-6xl opacity-20 rotate-12 animate-pulse">🤡</div>
                  </>
              )
          };
          case 'MUTE': return {
              wrapper: "from-blue-900 via-cyan-900 to-black",
              border: "border-blue-400 shadow-[0_0_50px_rgba(59,130,246,0.5)]",
              title: "text-blue-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]",
              iconBg: "bg-gradient-to-br from-blue-900 to-black border-blue-400",
              glow: "shadow-blue-900/50",
              decor: (
                  <>
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%)] bg-[length:250%_250%] animate-shimmer"></div>
                    <MicOff className="absolute -bottom-6 -left-6 text-blue-400/20 w-40 h-40 -rotate-12" />
                    <div className="absolute top-4 right-4 text-5xl animate-pulse drop-shadow-lg opacity-50">🤫</div>
                  </>
              )
          };
          case 'ACTOR': return {
            wrapper: "from-pink-900 via-rose-900 to-black bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]",
            border: "border-pink-500 shadow-[0_0_50px_rgba(236,72,153,0.5)] ring-4 ring-pink-900/30",
            title: "text-pink-300 drop-shadow-[0_2px_10px_rgba(236,72,153,0.8)]",
            iconBg: "bg-gradient-to-br from-pink-900 to-black border-pink-500",
            glow: "shadow-pink-900/50",
            decor: (
                <>
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-pink-500/10 to-transparent"></div>
                    <Drama className="absolute -top-6 -right-6 text-pink-400/20 w-40 h-40 rotate-12" />
                    {/* Spotlight Effect */}
                    <div className="absolute top-[-50%] left-1/2 -translate-x-1/2 w-20 h-[150%] bg-white/10 rotate-12 blur-xl pointer-events-none"></div>
                </>
            )
        };
          default: return { // NORMAL
              wrapper: "from-zinc-900 to-black",
              border: "border-green-600 shadow-[0_0_30px_rgba(34,197,94,0.2)]",
              title: "text-green-500",
              iconBg: "bg-zinc-800 border-green-600",
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
      }
  }, [isMyTurn]);

  // Ensure Role Reveal shows up when phase changes, but allows dismissal
  useEffect(() => {
    if (gameState.phase === GamePhase.ROLE_REVEAL) {
        setShowRoleReveal(true);
        // REMOVED AUTO-TIMEOUT. User must click ready.
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

  const handleConfirmEndTurn = () => {
      sounds.vibrateSuccess();
      setShowEndTurnConfirm(false);
      onEndTurn("تم ✅");
  };

  // Role Reveal Screen (Round 1 Start or Reconnect)
  if (showRoleReveal && gameState.currentRound === 1) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-6 text-center animate-enter bg-black/95 z-50 absolute inset-0 overflow-hidden">
        <div className={`absolute inset-0 opacity-20 bg-gradient-to-b ${roleTheme.wrapper} animate-pulse pointer-events-none`}></div>
        
        <h2 className="text-xl text-zinc-400 mb-6 uppercase tracking-widest relative z-10 animate-fade-in">الدور المسند إليك</h2>
        
        <div className={`bg-gradient-to-b ${roleTheme.wrapper} p-1 rounded-[2.5rem] shadow-2xl ${roleTheme.glow} w-full max-w-xs transform hover:scale-105 transition-transform duration-500 border-2 ${roleTheme.border} relative z-10`}>
            <div className="bg-black/80 backdrop-blur-md rounded-[2.4rem] p-8 relative overflow-hidden h-full">
                {roleTheme.decor}
                <div className="animate-pop relative z-10">
                    <div className={`w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6 border-4 shadow-[0_0_30px_rgba(255,255,255,0.1)] ${roleTheme.iconBg}`}>
                            <span className="text-7xl drop-shadow-md filter saturate-150">{roleInfo.emoji}</span>
                    </div>
                    <h1 className={`text-4xl font-black mb-3 ${roleTheme.title}`}>{roleInfo.label}</h1>
                    <div className={`h-1 w-16 mx-auto mb-6 rounded-full bg-current opacity-50 ${roleTheme.title}`}></div>
                    <p className="text-zinc-200 text-sm leading-relaxed font-bold bg-black/60 p-3 rounded-xl border border-white/10 shadow-inner">
                        {roleInfo.desc}
                    </p>
                    <div className="mt-8">
                        <p className="text-zinc-500 text-[10px] mb-2 uppercase tracking-wider font-bold">
                            كلمتك السرية
                        </p>
                        <div className={`bg-black/80 border ${roleTheme.border} border-opacity-50 p-4 rounded-xl shadow-inner`}>
                            <span className={`text-3xl font-black ${roleTheme.title}`}>{myPlayer?.word}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="mt-10 w-full max-w-xs relative z-10">
            <Button onClick={() => setShowRoleReveal(false)} fullWidth variant="outline" className="backdrop-blur-md bg-black/30 border-zinc-600 text-zinc-300 hover:text-white hover:border-white hover:bg-white/5">
                جاهز 🎬
            </Button>
        </div>
      </div>
    );
  }

  // Main Game
  return (
    <div className={`flex flex-col h-full w-full overflow-y-auto items-center justify-between p-6 max-w-md mx-auto transition-colors duration-1000 ${isMyTurn ? 'bg-green-900/10' : ''}`}>
      
      <ConfirmModal 
        isOpen={showEndTurnConfirm}
        title="تأكيد انتهاء الدور"
        message="متأكد إنك قولت التلميح وخلصت دورك؟"
        confirmText="أيوه خلصت"
        onConfirm={handleConfirmEndTurn}
        onCancel={() => setShowEndTurnConfirm(false)}
      />

      {/* New Round Gift Popup */}
      {showNewRoundGift && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 animate-pop w-[90%] max-w-sm">
               <div className={`bg-gradient-to-r ${roleTheme.wrapper} border-2 ${roleTheme.border} p-4 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] flex items-center gap-4`}>
                   <div className="p-3 bg-black/60 rounded-full animate-bounce shadow-inner border border-white/10">
                       <Gift size={28} className={roleTheme.title.replace('text-', 'text-')} />
                   </div>
                   <div>
                       <h3 className={`font-black ${roleTheme.title} text-xl mb-1`}>جالك دور هدية!</h3>
                       <p className="text-white text-xs font-bold leading-tight">انت في الجولة دي: <span className="text-lg mx-1">{roleInfo.emoji}</span> {roleInfo.label}</p>
                   </div>
               </div>
          </div>
      )}

      {/* 1. Header: Round Info & Role Reminder */}
      <div className="w-full flex justify-between items-start glass-panel p-4 rounded-2xl relative z-20 shadow-lg">
        <div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest block font-bold">المشهد</span>
            <div className="flex items-baseline gap-1">
                 <span className="text-3xl font-black text-white drop-shadow-md">{gameState.currentRound}</span>
                 <span className="text-zinc-600 text-sm font-bold">/ {gameState.config.maxRounds}</span>
            </div>
            {/* Role Visual Cue in Header - Uses resolved roleKey (which hides outsider) */}
            <div className={`mt-2 flex items-center gap-2 px-3 py-1 rounded-lg border shadow-inner ${roleKey === 'OUTSIDER' ? 'bg-red-900/30 border-red-900/50 text-red-200' : 'bg-zinc-800/50 border-zinc-700 text-zinc-300'}`}>
                <span className="text-lg drop-shadow-sm">{roleInfo.emoji}</span>
                <span className="text-xs font-bold">{roleInfo.label}</span>
            </div>
        </div>
        
        {/* Secret Word Toggle */}
        <button 
            className="flex flex-col items-end gap-1 bg-zinc-900/80 hover:bg-zinc-800 px-4 py-3 rounded-xl border border-zinc-700 transition-all active:scale-95 shadow-md"
            onMouseDown={() => setShowWord(true)}
            onMouseUp={() => setShowWord(false)}
            onTouchStart={() => setShowWord(true)}
            onTouchEnd={() => setShowWord(false)}
            onTouchCancel={() => setShowWord(false)}
        >
           <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">كلمتك السرية</span>
           {showWord ? (
               <span className="font-black text-white text-lg animate-enter bg-red-600 px-2 rounded">{myPlayer?.word}</span>
           ) : (
               <div className="flex items-center gap-2">
                   <EyeOff size={16} className="text-zinc-500" />
                   <span className="text-zinc-300 text-sm font-bold">إضغط للكشف</span>
               </div>
           )}
        </button>
      </div>

      {/* 2. Main Focus: WHOSE TURN IS IT? */}
      <div className="flex-1 flex flex-col items-center justify-center w-full relative my-4">
            
            {/* The Spotlight Circle */}
            <div className={`relative w-72 h-72 rounded-full flex items-center justify-center mb-8 transition-all duration-500 ${isMyTurn ? 'bg-green-600/10 shadow-[0_0_100px_rgba(34,197,94,0.3)] scale-105' : 'bg-zinc-900/30 border border-zinc-800'}`}>
                {/* Rotating Border */}
                {isMyTurn && <div className="absolute inset-0 rounded-full border-[6px] border-dashed border-green-500/40 animate-[spin_10s_linear_infinite]"></div>}
                
                {/* Avatar */}
                <span className={`text-[9rem] select-none transition-transform duration-500 ${isMyTurn ? 'scale-110 drop-shadow-2xl filter saturate-125' : 'opacity-40 grayscale scale-90'}`}>
                    {turnPlayer?.avatar}
                </span>

                {/* Status Badge */}
                <div className={`absolute -bottom-6 px-8 py-3 rounded-full font-black text-xl shadow-2xl flex items-center gap-3 border-2 ${isMyTurn ? 'bg-green-600 text-white border-green-400 animate-bounce' : 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>
                    {isMyTurn ? (
                        <>
                            <Megaphone size={24} className="animate-pulse" />
                            <span>دورك يا فنان!</span>
                        </>
                    ) : (
                        <>
                            <span className="animate-pulse w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_red]"></span>
                            <span>بيتكلم...</span>
                        </>
                    )}
                </div>
            </div>

            {/* Player Name */}
            <h2 className={`text-5xl font-black mb-3 text-center transition-colors tracking-tight ${isMyTurn ? 'text-white drop-shadow-lg' : 'text-zinc-600'}`}>
                {turnPlayer?.name}
            </h2>
            <div className="bg-black/40 px-4 py-2 rounded-lg backdrop-blur-sm">
                <p className="text-zinc-400 font-bold text-sm">
                    {isMyTurn ? (isMute ? "🤐 أوعى تتكلم! استخدم الإيموجي بس" : "🎤 قول التلميح ودوس على الزرار") : "👂 ركز في الكلام اللي بيتقال"}
                </p>
            </div>

            {/* Timer */}
            <div className={`mt-8 text-6xl font-black tabular-nums transition-all ${gameState.timer <= 5 ? 'text-red-500 scale-110 animate-pulse drop-shadow-[0_0_20px_red]' : 'text-zinc-300'}`}>
                {gameState.timer} <span className="text-xl text-zinc-600 font-bold">ث</span>
            </div>
      </div>

      {/* 3. Footer Action */}
      <div className="w-full mt-4 pb-4 relative z-30">
        {isMyTurn ? (
            <div className="w-full animate-enter">
                <Button 
                    onClick={() => setShowEndTurnConfirm(true)} 
                    variant="primary" 
                    fullWidth
                    className="py-6 shadow-[0_0_40px_rgba(220,38,38,0.5)] text-2xl border-t-4 border-red-500"
                >
                    <Check size={32} />
                    قولت التلميح (تمام)
                </Button>
            </div>
        ) : (
            <div className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 text-center text-zinc-500 font-bold flex flex-col items-center justify-center gap-2">
                <Clock size={24} className="animate-spin opacity-20" />
                <span>انتظر دورك...</span>
            </div>
        )}
      </div>
    </div>
  );
};
