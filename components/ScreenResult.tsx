
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
        <div className="inline-block p-4 rounded-full bg-zinc-900 mb-4 shadow-xl border border-zinc-800">
            {isOutsiderWin ? <VenetianMask size={64} className="text-red-600 animate-bounce" /> : <Crown size={64} className="text-yellow-500 animate-bounce" />}
        </div>
        
        {isOutsiderWin ? (
            <div className="animate-pop">
                <h1 className="text-5xl font-black mb-1 tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-red-500 to-red-800 drop-shadow-[0_2px_10px_rgba(220,38,38,0.8)] uppercase">
                    ABSOLUTE<br/>CINEMA
                </h1>
                <p className="text-red-300 font-bold text-lg">✋🤚 الدخيل هرب منكم ✋🤚</p>
                
                {jokerWasExecuted && (
                    <div className="mt-4 p-2 bg-yellow-900/30 border border-yellow-600/50 rounded-lg animate-pulse">
                        <p className="text-yellow-400 font-bold text-sm flex items-center justify-center gap-2">
                            <Laugh /> المخادع لبّسكم في الحيط!
                        </p>
                    </div>
                )}
                
                {!jokerWasExecuted && executedPlayerId && executedPlayerId !== outsider?.id && (
                     <div className="mt-4 p-2 bg-zinc-800 rounded-lg text-zinc-400 text-sm">
                        شكيتوا في <span className="text-white font-bold">{executedPlayer?.name}</span> بالغلط يا ظلمة!
                     </div>
                )}
            </div>
        ) : (
            <div>
                <h1 className="text-4xl font-black mb-2 tracking-tight text-green-500 drop-shadow-[0_0_15px_rgba(34,197,94,0.4)]">
                    مسكنا الدخيل 👮‍♂️
                </h1>
                <p className="text-zinc-400 font-medium">الناس الصاحية كسبت</p>
            </div>
        )}
      </div>

      {/* The Reveal Section */}
      <div className="space-y-4 mb-8 relative z-10">
          
          {/* Outsider Reveal */}
          <div className="bg-gradient-to-r from-red-900/40 to-black rounded-2xl p-5 border border-red-500/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-10"><AlertTriangle size={80} /></div>
            <div className="flex items-center gap-4 relative z-10">
                <div className="text-5xl bg-black/30 rounded-full p-2">{outsider?.avatar}</div>
                <div>
                    <p className="text-red-400 text-xs font-bold uppercase tracking-wider mb-1">الدخيل (الفريق C) كان</p>
                    <h2 className="text-2xl font-bold text-white">{outsider?.name}</h2>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-zinc-400 text-xs">كلمته:</span>
                        <span className="text-red-500 font-black text-xl bg-black/40 px-3 py-1 rounded-lg border border-red-900/50">{gameState.outsiderWord}</span>
                    </div>
                </div>
            </div>
          </div>

          {/* Teams Reveal */}
          <div className="grid grid-cols-1 gap-3">
              {/* Team A */}
              <div className="bg-zinc-900/50 rounded-xl p-3 border border-zinc-800">
                  <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-zinc-500 uppercase font-bold">تيم (A) - {gameState.majorityWord}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                      {gameState.players.filter(p => p.role === 'A').map(p => (
                          <div key={p.id} className="flex items-center gap-2 bg-black/30 px-2 py-1 rounded-lg">
                              <span>{p.avatar}</span>
                              <span className="text-sm font-bold">{p.name}</span>
                          </div>
                      ))}
                  </div>
              </div>

              {/* Team B */}
              {gameState.players.some(p => p.role === 'B') && (
                  <div className="bg-zinc-900/50 rounded-xl p-3 border border-zinc-800">
                      <div className="flex justify-between items-center mb-2">
                          <span className="text-xs text-zinc-500 uppercase font-bold">تيم (B) - {gameState.teamBWord}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                          {gameState.players.filter(p => p.role === 'B').map(p => (
                              <div key={p.id} className="flex items-center gap-2 bg-black/30 px-2 py-1 rounded-lg">
                                  <span>{p.avatar}</span>
                                  <span className="text-sm font-bold">{p.name}</span>
                              </div>
                          ))}
                      </div>
                  </div>
              )}

              {/* Team D (Large Groups) */}
              {gameState.players.some(p => p.role === 'D') && (
                  <div className="bg-zinc-900/50 rounded-xl p-3 border border-zinc-800">
                      <div className="flex justify-between items-center mb-2">
                          <span className="text-xs text-zinc-500 uppercase font-bold">تيم (D) - {gameState.teamDWord}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                          {gameState.players.filter(p => p.role === 'D').map(p => (
                              <div key={p.id} className="flex items-center gap-2 bg-black/30 px-2 py-1 rounded-lg">
                                  <span>{p.avatar}</span>
                                  <span className="text-sm font-bold">{p.name}</span>
                              </div>
                          ))}
                      </div>
                  </div>
              )}
          </div>
      </div>

      {/* Leaderboard & Voting Stats */}
      <div className="flex-1 bg-zinc-900/30 rounded-2xl p-4 border border-zinc-800/50 relative z-10">
        <h3 className="text-sm font-bold mb-4 text-zinc-400 uppercase tracking-widest">تحليل الأداء</h3>
        <div className="space-y-3">
            {sortedPlayers.map((p, idx) => {
                const myVote = gameState.votes[p.id];
                const teammateVoteId = myVote?.teammateId;
                const votedTeammate = gameState.players.find(tp => tp.id === teammateVoteId);
                const foundTeammate = votedTeammate && votedTeammate.role === p.role && votedTeammate.id !== p.id;
                const isActor = p.specialRole === 'ACTOR';
                
                return (
                    <div key={p.id} className={`flex flex-col bg-zinc-900/50 rounded-xl p-3 ${isActor && winners.includes(p) ? 'border border-pink-500/30 shadow-sm shadow-pink-900/20' : ''}`}>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <span className={`text-sm font-bold w-6 text-center ${idx === 0 ? 'text-yellow-500' : 'text-zinc-600'}`}>#{idx + 1}</span>
                                <span className="text-xl">{p.avatar}</span>
                                <span className="font-bold text-sm text-white">{p.name}</span>
                                {p.isOutsider && <span className="text-[10px] bg-red-900/50 text-red-400 px-1 rounded">دخيل</span>}
                                {isActor && <span className="text-[10px] bg-pink-900/50 text-pink-400 px-1 rounded">ممثل</span>}
                            </div>
                            <span className="font-bold text-white bg-zinc-800 px-2 py-1 rounded text-sm border border-zinc-700">{p.score} نقطة</span>
                        </div>
                        
                        {!p.isOutsider && (
                            <div className="flex items-center gap-4 text-[10px] text-zinc-500 px-8">
                                <div className="flex items-center gap-1">
                                    <span>صاحبه:</span>
                                    {foundTeammate ? (
                                        <span className="text-green-500 flex items-center gap-1 font-bold"><CheckCircle2 size={10} /> كشفه ({votedTeammate?.name})</span>
                                    ) : (
                                        <span className="text-red-500 flex items-center gap-1"><XCircle size={10} /> {votedTeammate?.name || "مفيش"}</span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
      </div>

      {isHost && (
        <div className="mt-8 relative z-10">
            <Button fullWidth onClick={onRestart} className="py-4 text-lg">
                لعبة كمان؟ 🔄
            </Button>
        </div>
      )}
    </div>
  );
};
