
import React from 'react';
import { Player, GameState } from '../types';
import { Button } from './Button';
import { Crown, AlertTriangle, VenetianMask, Users, Smile, Laugh, CheckCircle2, XCircle, Drama, Skull, Footprints, Wind, Film } from 'lucide-react';
import { SPECIAL_ROLES_INFO } from '../constants';

interface ScreenResultProps {
  gameState: GameState;
  onRestart: () => void;
  isHost: boolean;
}

export const ScreenResult: React.FC<ScreenResultProps> = ({ gameState, onRestart, isHost }) => {
  const outsider = gameState.players.find(p => p.isOutsider);
  const winners = gameState.players.filter(p => gameState.winners.includes(p.id));
  const isOutsiderWin = winners.some(p => p.isOutsider);
  const joker = gameState.players.find(p => p.specialRole === 'JOKER');
  
  const sortedPlayers = [...gameState.players].sort((a, b) => b.score - a.score);

  // Check if ACTOR won
  const actorWin = winners.some(p => p.specialRole === 'ACTOR');

  // --- Logic to see who was "Executed" (Received most votes as Outsider) ---
  let maxVotes = 0;
  let executedPlayerId: string | null = null;
  const voteCounts: Record<string, number> = {};

  Object.entries(gameState.votes).forEach(([voterId, votePayload]) => {
      const weight = 1;
      voteCounts[votePayload.outsiderId] = (voteCounts[votePayload.outsiderId] || 0) + weight;
      
      if (voteCounts[votePayload.outsiderId] > maxVotes) {
          maxVotes = voteCounts[votePayload.outsiderId];
          executedPlayerId = votePayload.outsiderId;
      }
  });

  const executedPlayer = gameState.players.find(p => p.id === executedPlayerId);
  const jokerWasExecuted = joker && executedPlayerId === joker.id;

  return (
    <div className="flex flex-col h-full p-4 animate-fade-in max-w-md mx-auto overflow-y-auto pb-20 relative">
      
      {/* --- 1. SPECIAL EFFECTS BACKGROUNDS --- */}

      {/* OUTSIDER WIN EFFECT (Dramatic Red/Glitch/Escape) */}
      {isOutsiderWin && (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
            {/* Red Pulse Overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/40 via-black/80 to-black animate-pulse"></div>
            
            {/* Glitch Overlay Background Text */}
             <div className="absolute inset-0 flex flex-col justify-around opacity-10 overflow-hidden select-none">
                {Array.from({length: 6}).map((_, i) => (
                    <div key={i} className="text-red-500 font-mono text-8xl whitespace-nowrap animate-glitch" style={{animationDelay: `${i * 0.2}s`, transform: 'scale(1.5)'}}>
                        SYSTEM_FAILURE ESCAPE 404 RUN
                    </div>
                ))}
             </div>

            {/* Escape Animation - Footprints running across screen */}
            <div className="absolute top-1/2 left-0 w-full -translate-y-1/2 h-32">
                <div className="animate-shimmer flex items-center gap-6 opacity-60">
                     <Wind size={100} className="text-white/20 transform -scale-x-100" />
                     <Footprints size={60} className="text-red-500 rotate-90" />
                     <Footprints size={60} className="text-red-500 rotate-90" />
                     <Footprints size={60} className="text-red-500 rotate-90" />
                </div>
            </div>

            {/* Floating Giant Icons */}
            <VenetianMask className="absolute -bottom-20 -right-20 text-red-600/20 rotate-12 w-96 h-96 animate-pulse" />
            <Film className="absolute top-20 -left-20 text-red-600/20 -rotate-12 w-80 h-80 animate-bounce delay-1000 duration-[3000ms]" />
            
            {/* Glitch Lines */}
            <div className="absolute top-1/4 left-0 w-full h-1 bg-red-600/50 blur-sm animate-ping"></div>
            <div className="absolute bottom-1/3 left-0 w-full h-0.5 bg-white/50 animate-pulse"></div>
        </div>
      )}

      {/* ACTOR WIN EFFECT (Pink Shimmer) */}
      {actorWin && !isOutsiderWin && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
               <div className="animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-pink-500/5 to-transparent"></div>
               <Drama className="absolute top-10 right-4 text-pink-500/20 animate-bounce" size={40} />
               <Drama className="absolute bottom-20 left-4 text-pink-500/20 animate-bounce delay-700" size={40} />
          </div>
      )}

      {/* --- 2. HEADER RESULT --- */}
      <div className="text-center my-6 relative z-10">
        <div className={`inline-block p-6 rounded-full mb-6 shadow-[0_0_60px_rgba(0,0,0,0.6)] border-[6px] transition-transform duration-700 hover:scale-110 ${isOutsiderWin ? 'bg-red-950 border-red-600 animate-bounce' : 'bg-green-900/20 border-green-500'}`}>
            {isOutsiderWin ? (
                <VenetianMask size={90} className="text-red-500 drop-shadow-[0_0_20px_red]" />
            ) : (
                <Crown size={80} className="text-yellow-400 animate-bounce drop-shadow-[0_0_10px_gold]" />
            )}
        </div>
        
        {isOutsiderWin ? (
            <div className="animate-enter">
                <h1 className="text-6xl font-black mb-2 tracking-tighter text-red-600 drop-shadow-[0_4px_0_#3f0000] uppercase animate-glitch leading-[0.9]">
                    ABSOLUTE<br/>CINEMA
                </h1>
                <p className="text-red-200 font-bold text-lg mt-2 tracking-wide bg-red-900/30 py-1 px-4 rounded-lg border border-red-500/20 inline-block animate-pulse">
                    الدخيل عمل نمرة عالية وهرب 🎬
                </p>
                
                {jokerWasExecuted && (
                    <div className="mt-6 p-4 bg-purple-900/60 border-2 border-purple-500 rounded-xl animate-pop shadow-[0_0_30px_rgba(168,85,247,0.4)]">
                        <p className="text-purple-200 font-black text-lg flex items-center justify-center gap-2">
                            <Laugh size={28} className="animate-spin-slow" /> المخادع لبّسكم في الحيط!
                        </p>
                        <p className="text-xs text-purple-300 mt-1 font-bold">شكيتوا فيه بالغلط وهو كسب نقط!</p>
                    </div>
                )}
                
                {!jokerWasExecuted && executedPlayerId && executedPlayerId !== outsider?.id && (
                     <div className="mt-6 p-4 bg-zinc-800/80 rounded-xl text-zinc-300 border border-zinc-700 shadow-lg">
                        <span className="block text-xs text-zinc-500 font-bold mb-1">الضحية البريئة</span>
                        <div className="flex items-center justify-center gap-2">
                            <span className="text-white font-black text-2xl">{executedPlayer?.name}</span>
                            <span className="text-4xl">💀</span>
                        </div>
                        <span className="block mt-1 text-sm font-bold text-red-400">ظلمتوه وطلعتوه برة!</span>
                     </div>
                )}
            </div>
        ) : (
            <div>
                <h1 className="text-5xl font-black mb-2 tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-green-400 to-green-700 drop-shadow-[0_0_25px_rgba(34,197,94,0.4)]">
                    مسكنا الدخيل! 👮‍♂️
                </h1>
                <p className="text-zinc-300 font-bold text-lg">تحيا العدالة! كل المواطنين الصالحين كسبوا نقط.</p>
            </div>
        )}
      </div>

      {/* --- 3. THE REVEAL SECTION --- */}
      <div className="space-y-4 mb-8 relative z-10">
          
          {/* Outsider Reveal Card */}
          <div className={`rounded-3xl p-6 border-2 relative overflow-hidden shadow-2xl ${isOutsiderWin ? 'bg-gradient-to-br from-red-950 to-black border-red-500 shadow-red-900/50' : 'bg-zinc-900/60 border-red-900/30'}`}>
            <div className="absolute top-0 right-0 p-4 opacity-10"><AlertTriangle size={100} /></div>
            <div className="flex items-center gap-6 relative z-10">
                <div className={`text-6xl rounded-full p-3 border shadow-inner ${isOutsiderWin ? 'bg-red-600/20 border-red-500 text-white' : 'bg-black/40 border-zinc-700 text-zinc-500 grayscale'}`}>
                    {outsider?.avatar}
                </div>
                <div>
                    <p className={`text-xs font-black uppercase tracking-widest mb-1 ${isOutsiderWin ? 'text-red-400' : 'text-zinc-500'}`}>الدخيل (الفريق C)</p>
                    <h2 className={`text-3xl font-black ${isOutsiderWin ? 'text-white' : 'text-zinc-300'}`}>{outsider?.name}</h2>
                    <div className="flex items-center gap-3 mt-3 bg-black/40 p-2 rounded-lg border border-white/5">
                        <span className="text-zinc-400 text-xs font-bold">كلمته:</span>
                        <span className="text-red-500 font-black text-2xl">{gameState.outsiderWord}</span>
                    </div>
                </div>
            </div>
          </div>

          {/* Teams Reveal */}
          <div className="grid grid-cols-1 gap-3">
              {/* Team A */}
              <div className="bg-zinc-900/60 rounded-2xl p-4 border border-zinc-700 shadow-lg">
                  <div className="flex justify-between items-center mb-3 border-b border-zinc-800 pb-2">
                      <span className="text-xs text-zinc-400 uppercase font-black tracking-wider">فريق (A) - المواطنين</span>
                      <span className="text-sm font-bold text-green-500">{gameState.majorityWord}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                      {gameState.players.filter(p => p.role === 'A').map(p => (
                          <div key={p.id} className="flex items-center gap-2 bg-black/40 px-3 py-2 rounded-xl border border-zinc-800">
                              <span className="text-xl">{p.avatar}</span>
                              <span className="text-sm font-bold text-zinc-200">{p.name}</span>
                          </div>
                      ))}
                  </div>
              </div>

              {/* Team B */}
              {gameState.players.some(p => p.role === 'B') && (
                  <div className="bg-zinc-900/60 rounded-2xl p-4 border border-zinc-700 shadow-lg">
                      <div className="flex justify-between items-center mb-3 border-b border-zinc-800 pb-2">
                          <span className="text-xs text-zinc-400 uppercase font-black tracking-wider">فريق (B) - المواطنين</span>
                          <span className="text-sm font-bold text-blue-500">{gameState.teamBWord}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                          {gameState.players.filter(p => p.role === 'B').map(p => (
                              <div key={p.id} className="flex items-center gap-2 bg-black/40 px-3 py-2 rounded-xl border border-zinc-800">
                                  <span className="text-xl">{p.avatar}</span>
                                  <span className="text-sm font-bold text-zinc-200">{p.name}</span>
                              </div>
                          ))}
                      </div>
                  </div>
              )}

              {/* Team D (Large Groups) */}
              {gameState.players.some(p => p.role === 'D') && (
                  <div className="bg-zinc-900/60 rounded-2xl p-4 border border-zinc-700 shadow-lg">
                      <div className="flex justify-between items-center mb-3 border-b border-zinc-800 pb-2">
                          <span className="text-xs text-zinc-400 uppercase font-black tracking-wider">فريق (D) - المواطنين</span>
                          <span className="text-sm font-bold text-yellow-500">{gameState.teamDWord}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                          {gameState.players.filter(p => p.role === 'D').map(p => (
                              <div key={p.id} className="flex items-center gap-2 bg-black/40 px-3 py-2 rounded-xl border border-zinc-800">
                                  <span className="text-xl">{p.avatar}</span>
                                  <span className="text-sm font-bold text-zinc-200">{p.name}</span>
                              </div>
                          ))}
                      </div>
                  </div>
              )}
          </div>
      </div>

      {/* --- 4. LEADERBOARD --- */}
      <div className="flex-1 bg-zinc-900/30 rounded-3xl p-5 border border-zinc-800/50 relative z-10 mb-8 backdrop-blur-sm">
        <h3 className="text-sm font-black mb-4 text-zinc-500 uppercase tracking-[0.2em] text-center">ترتيب اللعيبة</h3>
        <div className="space-y-3">
            {sortedPlayers.map((p, idx) => {
                const isActor = p.specialRole === 'ACTOR';
                const isWinner = winners.includes(p);
                
                return (
                    <div key={p.id} className={`flex flex-col bg-zinc-900/80 rounded-2xl p-3 shadow-md border ${idx === 0 ? 'border-yellow-500/50 bg-yellow-900/10' : 'border-zinc-800'} ${isActor && isWinner ? 'ring-2 ring-pink-500/30' : ''}`}>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <span className={`text-lg font-black w-8 text-center ${idx === 0 ? 'text-yellow-500 drop-shadow-sm' : 'text-zinc-600'}`}>#{idx + 1}</span>
                                <span className="text-2xl">{p.avatar}</span>
                                <div>
                                    <span className="font-bold text-base text-white block">{p.name}</span>
                                    <div className="flex gap-1 mt-0.5">
                                        {p.isOutsider && <span className="text-[9px] bg-red-900/50 text-red-300 px-1.5 py-0.5 rounded font-bold border border-red-900">دخيل</span>}
                                        {isActor && <span className="text-[9px] bg-pink-900/50 text-pink-300 px-1.5 py-0.5 rounded font-bold border border-pink-900">ممثل</span>}
                                        {p.specialRole === 'JOKER' && <span className="text-[9px] bg-purple-900/50 text-purple-300 px-1.5 py-0.5 rounded font-bold border border-purple-900">مخادع</span>}
                                    </div>
                                </div>
                            </div>
                            <span className={`font-black px-3 py-1 rounded-lg text-sm border ${idx === 0 ? 'bg-yellow-500 text-black border-yellow-400' : 'bg-zinc-800 text-white border-zinc-700'}`}>{p.score} نقطة</span>
                        </div>
                    </div>
                );
            })}
        </div>
      </div>

      {isHost && (
        <div className="relative z-10 mb-4">
            <Button fullWidth onClick={onRestart} className="py-5 text-xl shadow-[0_0_40px_rgba(220,38,38,0.4)]">
                لعبة كمان؟ 🔄
            </Button>
        </div>
      )}

      <div className="w-full text-center pb-4 opacity-50 relative z-10">
           <p className="text-[10px] text-yellow-600/50 font-bold tracking-widest uppercase">جروب الفرح للإنتاج السينمائي - 2026</p>
      </div>
    </div>
  );
};
