
import React from 'react';
import { Player, GameState } from '../types';
import { Button } from './Button';
import { Crown, AlertTriangle, VenetianMask, Users, Smile, Laugh, CheckCircle2, XCircle, Drama } from 'lucide-react';
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
      // Standard weight 1 for all votes now that Mayor is removed
      const weight = 1;
      
      voteCounts[votePayload.outsiderId] = (voteCounts[votePayload.outsiderId] || 0) + weight;
      
      if (voteCounts[votePayload.outsiderId] > maxVotes) {
          maxVotes = voteCounts[votePayload.outsiderId];
          executedPlayerId = votePayload.outsiderId;
      }
  });

  const executedPlayer = gameState.players.find(p => p.id === executedPlayerId);
  const jokerWasExecuted = joker && executedPlayerId === joker.id;

  const getRoleEmoji = (p: Player) => {
      if (p.isOutsider) return SPECIAL_ROLES_INFO.OUTSIDER.emoji;
      if (p.specialRole && p.specialRole !== 'NORMAL') return SPECIAL_ROLES_INFO[p.specialRole].emoji;
      return null;
  };

  return (
    <div className="flex flex-col h-full p-4 animate-fade-in max-w-md mx-auto overflow-y-auto pb-20 relative">
      
      {/* Actor Win Special Effect */}
      {actorWin && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
               <div className="animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-pink-500/5 to-transparent"></div>
               <Drama className="absolute top-10 right-4 text-pink-500/20 animate-bounce" size={40} />
               <Drama className="absolute bottom-20 left-4 text-pink-500/20 animate-bounce delay-700" size={40} />
          </div>
      )}

      {/* Header Result */}
      <div className="text-center my-6 relative z-10">
        <div className={`inline-block p-6 rounded-full mb-6 shadow-[0_0_50px_rgba(0,0,0,0.5)] border-4 ${isOutsiderWin ? 'bg-red-900/20 border-red-600' : 'bg-green-900/20 border-green-500'}`}>
            {isOutsiderWin ? <VenetianMask size={80} className="text-red-500 animate-bounce drop-shadow-[0_0_10px_red]" /> : <Crown size={80} className="text-yellow-400 animate-bounce drop-shadow-[0_0_10px_gold]" />}
        </div>
        
        {isOutsiderWin ? (
            <div className="animate-pop">
                <h1 className="text-5xl font-black mb-2 tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-red-500 to-red-800 drop-shadow-[0_2px_10px_rgba(220,38,38,0.8)] uppercase">
                    الدخيل كسب!
                </h1>
                <p className="text-red-300 font-bold text-xl mt-2 tracking-wide">هرب منكم بذكاء.. مفيش فايدة فيكم 🤦‍♂️</p>
                
                {jokerWasExecuted && (
                    <div className="mt-6 p-4 bg-purple-900/40 border border-purple-500/50 rounded-xl animate-pulse shadow-lg">
                        <p className="text-purple-300 font-black text-lg flex items-center justify-center gap-2">
                            <Laugh size={24} /> المخادع لبّسكم في الحيط!
                        </p>
                        <p className="text-xs text-purple-400 mt-1">خد نقط عشان صوتوا عليه بالغلط</p>
                    </div>
                )}
                
                {!jokerWasExecuted && executedPlayerId && executedPlayerId !== outsider?.id && (
                     <div className="mt-6 p-4 bg-zinc-800/80 rounded-xl text-zinc-300 border border-zinc-700 shadow-lg">
                        <span className="block text-xs text-zinc-500 font-bold mb-1">الضحية البريئة</span>
                        <span className="text-white font-black text-xl mx-1">{executedPlayer?.name}</span>
                        <span className="block mt-1">ظلمتوه يا جماعة.. حرام عليكم!</span>
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

      {/* The Reveal Section */}
      <div className="space-y-4 mb-8 relative z-10">
          
          {/* Outsider Reveal */}
          <div className="bg-gradient-to-br from-red-950 to-black rounded-3xl p-6 border-2 border-red-600/50 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-4 opacity-10"><AlertTriangle size={100} /></div>
            <div className="flex items-center gap-6 relative z-10">
                <div className="text-6xl bg-black/40 rounded-full p-3 border border-red-500/20 shadow-inner">{outsider?.avatar}</div>
                <div>
                    <p className="text-red-500 text-xs font-black uppercase tracking-widest mb-1">الدخيل (الفريق C)</p>
                    <h2 className="text-3xl font-black text-white">{outsider?.name}</h2>
                    <div className="flex items-center gap-3 mt-3 bg-black/40 p-2 rounded-lg border border-red-500/20">
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

      {/* Leaderboard & Voting Stats */}
      <div className="flex-1 bg-zinc-900/30 rounded-3xl p-5 border border-zinc-800/50 relative z-10 mb-8 backdrop-blur-sm">
        <h3 className="text-sm font-black mb-4 text-zinc-500 uppercase tracking-[0.2em] text-center">ترتيب اللعيبة</h3>
        <div className="space-y-3">
            {sortedPlayers.map((p, idx) => {
                const myVote = gameState.votes[p.id];
                const teammateVoteId = myVote?.teammateId;
                const votedTeammate = gameState.players.find(tp => tp.id === teammateVoteId);
                const foundTeammate = votedTeammate && votedTeammate.role === p.role && votedTeammate.id !== p.id;
                const isActor = p.specialRole === 'ACTOR';
                
                return (
                    <div key={p.id} className={`flex flex-col bg-zinc-900/80 rounded-2xl p-3 shadow-md border ${idx === 0 ? 'border-yellow-500/50 bg-yellow-900/10' : 'border-zinc-800'} ${isActor && winners.includes(p) ? 'ring-2 ring-pink-500/30' : ''}`}>
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
                        
                        {!p.isOutsider && (
                            <div className="flex items-center gap-2 text-[11px] text-zinc-500 px-11 mt-1 bg-black/20 py-1 rounded mx-2">
                                <span className="font-bold">التخمين:</span>
                                {foundTeammate ? (
                                    <span className="text-green-500 flex items-center gap-1 font-bold"><CheckCircle2 size={12} /> كشف {votedTeammate?.name} (صح!)</span>
                                ) : (
                                    <span className="text-red-500 flex items-center gap-1 font-bold"><XCircle size={12} /> شك في {votedTeammate?.name || "مفيش"} (غلط)</span>
                                )}
                            </div>
                        )}
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
