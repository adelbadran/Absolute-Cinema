
import React, { useState, useEffect } from 'react';
import { Player, GameState, GamePhase } from '../types';
import { Button } from './Button';
import { Eye, EyeOff, Send, Clock, Mic2, Megaphone, Crown, MicOff, Laugh, AlertTriangle, BadgeCheck } from 'lucide-react';
import { sounds } from '../services/sound';
import { SPECIAL_ROLES_INFO } from '../constants';

interface ScreenGameProps {
  gameState: GameState;
  myPlayerId: string;
  onSendHint: (hint: string) => void;
  onTimeUp: () => void;
}

export const ScreenGame: React.FC<ScreenGameProps> = ({ gameState, myPlayerId, onSendHint }) => {
  const [showWord, setShowWord] = useState(false);
  const [hintInput, setHintInput] = useState('');
  const [showRoleReveal, setShowRoleReveal] = useState(true);

  const myPlayer = gameState.players.find(p => p.id === myPlayerId);
  const isMyTurn = gameState.currentTurnPlayerId === myPlayerId;
  const turnPlayer = gameState.players.find(p => p.id === gameState.currentTurnPlayerId);
  
  // Resolve Role Info
  const roleKey = myPlayer?.isOutsider ? 'OUTSIDER' : (myPlayer?.specialRole || 'NORMAL');
  const roleInfo = SPECIAL_ROLES_INFO[roleKey as keyof typeof SPECIAL_ROLES_INFO];

  // Role Visual Theme Logic
  const roleTheme = (() => {
      switch (roleKey) {
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
                     <Laugh className="absolute bottom-2 left-2 text-purple-500/30 w-16 h-16 animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </>
              )
          };
          case 'MAYOR': return {
              wrapper: "from-yellow-900 via-amber-900 to-black",
              border: "border-yellow-500",
              title: "text-yellow-400",
              iconBg: "bg-yellow-900/40 border-yellow-500",
              glow: "shadow-yellow-900/50",
              decor: (
                  <>
                    <div className="absolute inset-0 bg-yellow-500/5"></div>
                    <Crown className="absolute -top-6 -right-6 text-yellow-500/20 w-40 h-40 rotate-12" />
                    <BadgeCheck className="absolute bottom-4 right-4 text-yellow-500/30 w-8 h-8 animate-pulse" />
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
                    <div className="absolute top-4 right-4 text-2xl animate-pulse">🤐</div>
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
      }
  }, [isMyTurn]);

  useEffect(() => {
    if (gameState.phase === GamePhase.ROLE_REVEAL) {
        const timer = setTimeout(() => {
            setShowRoleReveal(false);
        }, 5000); 
        return () => clearTimeout(timer);
    }
  }, [gameState.phase]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (hintInput.trim()) {
      sounds.vibrateSuccess();
      onSendHint(hintInput.trim());
      setHintInput('');
    }
  };

  // Role Reveal Screen
  if (gameState.phase === GamePhase.ROLE_REVEAL || showRoleReveal) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-6 text-center animate-enter bg-black/95 z-50 absolute inset-0 overflow-hidden">
        {/* Ambient background based on role */}
        <div className={`absolute inset-0 opacity-20 bg-gradient-to-b ${roleTheme.wrapper} animate-pulse pointer-events-none`}></div>
        
        <h2 className="text-xl text-zinc-400 mb-6 uppercase tracking-widest relative z-10">الدور المسند إليك</h2>
        
        <div className={`bg-gradient-to-b ${roleTheme.wrapper} p-1 rounded-[2rem] shadow-2xl ${roleTheme.glow} w-full max-w-xs transform hover:scale-105 transition-transform duration-500 border ${roleTheme.border} relative z-10`}>
            <div className="bg-black/80 backdrop-blur-sm rounded-[1.9rem] p-8 relative overflow-hidden h-full">
                
                {/* Decorative Elements */}
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
                    
                    {/* Secret Word Section */}
                    <div className="mt-8">
                        <p className="text-zinc-500 text-[10px] mb-2 uppercase tracking-wider font-bold">
                            {myPlayer?.isOutsider ? "كلمة الدخيل (أنت)" : "كلمة الفريق السرية"}
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
    <div className={`flex flex-col h-full p-4 max-w-md mx-auto transition-colors duration-500 ${gameState.timer <= 5 && gameState.timer > 0 ? 'bg-red-900/10' : ''}`}>
      
      {/* Top Bar: Round & Timer */}
      <div className="flex justify-between items-center mb-4 glass-panel p-3 px-5 rounded-2xl relative z-20">
        <div className="flex flex-col">
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest">المشهد</span>
            <span className="text-xl font-black text-white">{gameState.currentRound} <span className="text-zinc-600 text-sm font-normal">/ {gameState.config.maxRounds}</span></span>
        </div>
        
        {/* BIG PULSING TIMER */}
        <div className={`flex items-center gap-2 text-4xl font-black tabular-nums transition-all ${gameState.timer <= 10 ? 'text-red-500 scale-110 drop-shadow-[0_0_15px_rgba(220,38,38,0.9)] animate-pulse' : 'text-white'}`}>
            <Clock size={28} className={gameState.timer <= 5 ? 'animate-spin' : ''} />
            {gameState.timer}
        </div>
      </div>

      {/* TURN INDICATOR - VERY PROMINENT */}
      <div className={`mb-4 rounded-xl p-3 flex items-center justify-between border transition-all duration-300 shadow-lg ${isMyTurn ? 'bg-green-900/20 border-green-500/50' : 'bg-zinc-900/50 border-zinc-800'}`}>
            {isMyTurn ? (
                <div className="flex items-center gap-3 w-full animate-pop">
                    <span className="text-2xl animate-bounce">🫵</span>
                    <div className="flex-1">
                        <p className="text-green-400 font-black text-lg leading-none">دورك دلوقتي!</p>
                        <p className="text-green-600 text-xs font-bold">الكل مستني يسمعك</p>
                    </div>
                    <Megaphone className="text-green-500" />
                </div>
            ) : (
                <div className="flex items-center gap-3 w-full opacity-80">
                    <div className="relative">
                        <span className="text-3xl">{turnPlayer?.avatar}</span>
                        <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                        </span>
                    </div>
                    <div className="flex-1">
                        <p className="text-zinc-400 text-xs font-bold uppercase mb-0.5">الدور على</p>
                        <p className="text-white font-bold text-lg leading-none">{turnPlayer?.name}</p>
                    </div>
                    <div className="text-xs bg-zinc-800 px-2 py-1 rounded text-zinc-500">بيفكر...</div>
                </div>
            )}
      </div>

      {/* Secret Word Peek (Floating) */}
      {!myPlayer?.isOutsider && (
        <button 
            className="absolute top-24 left-4 z-40 bg-black/40 backdrop-blur-md p-2 rounded-full shadow-lg border border-white/10 active:scale-90 transition-all text-white"
            onMouseDown={() => setShowWord(true)}
            onMouseUp={() => setShowWord(false)}
            onTouchStart={() => setShowWord(true)}
            onTouchEnd={() => setShowWord(false)}
        >
           {showWord ? (
               <span className="font-bold text-xs px-2 animate-enter">{myPlayer?.word}</span>
           ) : (
               <EyeOff size={18} />
           )}
        </button>
      )}

      {/* Hints Feed */}
      <div className="flex-1 overflow-y-auto space-y-3 px-1 mb-4 mask-image-gradient pb-2">
            {gameState.hints.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-zinc-700 opacity-50 space-y-2">
                    <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center">
                         <Mic2 size={32} />
                    </div>
                    <p className="font-medium">الهدوء يسبق العاصفة...</p>
                </div>
            )}
            {gameState.hints.map((h, idx) => {
                const player = gameState.players.find(p => p.id === h.playerId);
                const isMe = h.playerId === myPlayerId;
                return (
                    <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-enter`}>
                        <div className={`max-w-[85%] rounded-2xl p-3 px-4 shadow-lg flex flex-col ${isMe ? 'bg-gradient-to-br from-red-600 to-red-900 text-white rounded-tr-sm border border-red-800' : 'bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-tl-sm'}`}>
                            <div className="flex items-center gap-1.5 mb-1 opacity-70">
                                <span className="bg-black/20 rounded px-1 text-[10px]">{player?.avatar}</span>
                                <span className={`text-[10px] font-bold ${isMe ? 'text-red-100' : 'text-zinc-400'}`}>{player?.name}</span>
                            </div>
                            <p className="text-lg font-bold leading-tight">{h.hint}</p>
                        </div>
                    </div>
                );
            })}
      </div>

      {/* Action Bar */}
      <div className="glass-panel p-3 rounded-2xl mt-auto">
        <form onSubmit={handleSubmit} className="flex gap-2 relative">
            <input
                type="text"
                value={hintInput}
                onChange={(e) => setHintInput(e.target.value)}
                placeholder={isMyTurn ? (roleKey === 'MUTE' ? "استخدم إيموجي بس! 🤐" : "اكتب تلميحك هنا...") : "انتظر دورك..."}
                disabled={!isMyTurn}
                className="flex-1 bg-black/50 border-2 border-transparent focus:border-red-600 rounded-xl px-4 py-3 text-white text-lg outline-none transition-all placeholder-zinc-600 disabled:opacity-50 font-bold disabled:bg-zinc-900/50"
                maxLength={30}
                autoFocus={isMyTurn}
            />
            <button 
                type="submit"
                disabled={!isMyTurn || !hintInput.trim()}
                className="bg-red-600 hover:bg-red-500 disabled:bg-zinc-800 text-white w-14 rounded-xl flex items-center justify-center shadow-lg transition-all active:scale-95 disabled:shadow-none disabled:cursor-not-allowed"
            >
                <Send size={24} className={isMyTurn && hintInput.trim() ? "translate-x-1 -translate-y-1" : ""} />
            </button>
        </form>
      </div>
    </div>
  );
};
