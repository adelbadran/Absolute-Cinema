
import React from 'react';
import { Player, GameState } from '../types';
import { Button } from './Button';
import { Crown, AlertTriangle, VenetianMask, Users, Smile, Laugh } from 'lucide-react';
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
  
  // Players who are not outsider
  const majorityPlayers = gameState.players.filter(p => !p.isOutsider);
  const sortedPlayers = [...gameState.players].sort((a, b) => b.score - a.score);

  // --- Logic to see who was "Executed" (Received most votes) ---
  let maxVotes = 0;
  let executedPlayerId: string | null = null;
  const voteCounts: Record<string, number> = {};

  Object.entries(gameState.votes).forEach(([voterId, votedId]) => {
      // Calculate weight based on Mayor role
      const voter = gameState.players.find(p => p.id === voterId);
      const weight = (voter?.specialRole === 'MAYOR') ? 2 : 1;
      
      voteCounts[votedId] = (voteCounts[votedId] || 0) + weight;
      
      if (voteCounts[votedId] > maxVotes) {
          maxVotes = voteCounts[votedId];
          executedPlayerId = votedId;
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
    <div className="flex flex-col h-full p-4 animate-fade-in max-w-md mx-auto overflow-y-auto pb-20">
      
      {/* Header Result */}
      <div className="text-center my-6">
        <div className="inline-block p-4 rounded-full bg-zinc-900 mb-4 shadow-xl border border-zinc-800">
            {isOutsiderWin ? <VenetianMask size={64} className="text-red-600 animate-bounce" /> : <Crown size={64} className="text-yellow-500 animate-bounce" />}
        </div>
        
        {isOutsiderWin ? (
            <div className="animate-pop">
                <h1 className="text-5xl font-black mb-1 tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-red-500 to-red-800 drop-shadow-[0_2px_10px_rgba(220,38,38,0.8)] uppercase">
                    ABSOLUTE<br/>CINEMA
                </h1>
                <p className="text-red-300 font-bold text-lg">✋🤚 سينما عبثية ✋🤚</p>
                
                {jokerWasExecuted && (
                    <div className="mt-4 p-2 bg-yellow-900/30 border border-yellow-600/50 rounded-lg animate-pulse">
                        <p className="text-yellow-400 font-bold text-sm flex items-center justify-center gap-2">
                            <Laugh /> المخادع لبّسكم في الحيط!
                        </p>
                    </div>
                )}
                
                {!jokerWasExecuted && executedPlayerId && executedPlayerId !== outsider?.id && (
                     <div className="mt-4 p-2 bg-zinc-800 rounded-lg text-zinc-400 text-sm">
                        قتلتوا <span className="text-white font-bold">{executedPlayer?.name}</span> بالغلط يا ظلمة!
                     </div>
                )}
            </div>
        ) : (
            <div>
                <h1 className="text-4xl font-black mb-2 tracking-tight text-green-500 drop-shadow-[0_0_15px_rgba(34,197,94,0.4)]">
                    مسكنا الدخيل 👮‍♂️
                </h1>
                <p className="text-zinc-400 font-medium">التيم كسب الجولة</p>
            </div>
        )}
      </div>

      {/* The Reveal Section */}
      <div className="space-y-4 mb-8">
          
          {/* Joker Reveal (If exists) */}
          {joker && (
              <div className={`rounded-xl p-4 border relative overflow-hidden ${jokerWasExecuted ? 'bg-gradient-to-r from-yellow-900/40 to-black border-yellow-500/50' : 'bg-zinc-900 border-zinc-800'}`}>
                  <div className="flex items-center gap-4 relative z-10">
                      <div className="text-3xl bg-black/50 rounded-full p-2">{SPECIAL_ROLES_INFO.JOKER.emoji}</div>
                      <div>
                          <p className="text-yellow-500 text-[10px] font-bold uppercase tracking-wider mb-0.5">المخادع (الطرف الثالث)</p>
                          <h2 className="text-xl font-bold text-white">{joker.name}</h2>
                          <p className="text-xs text-zinc-400 mt-1">
                              {jokerWasExecuted ? "نجح في مهمته وخد الأصوات كلها!" : "فشل إنه يخليكم تشكوا فيه."}
                          </p>
                      </div>
                  </div>
              </div>
          )}

          {/* Outsider Reveal */}
          <div className="bg-gradient-to-r from-red-900/40 to-black rounded-2xl p-5 border border-red-500/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-10"><AlertTriangle size={80} /></div>
            <div className="flex items-center gap-4 relative z-10">
                <div className="text-5xl bg-black/30 rounded-full p-2">{outsider?.avatar}</div>
                <div>
                    <p className="text-red-400 text-xs font-bold uppercase tracking-wider mb-1">الدخيل كان</p>
                    <h2 className="text-2xl font-bold text-white">{outsider?.name}</h2>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-zinc-400 text-xs">كلمته:</span>
                        <span className="text-red-500 font-black text-xl bg-black/40 px-3 py-1 rounded-lg border border-red-900/50">{gameState.outsiderWord}</span>
                    </div>
                </div>
            </div>
          </div>

          {/* Majority Word Reveal */}
          <div className="bg-gradient-to-r from-zinc-900 to-black rounded-xl p-4 border border-zinc-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-5"><Users size={60} /></div>
              <div className="relative z-10">
                  <p className="text-xs text-zinc-500 mb-2 flex items-center gap-1 uppercase tracking-widest"><Users size={12}/> كلمة باقي التيم</p>
                  <div className="flex items-center justify-between">
                      <p className="text-white font-black text-2xl">{gameState.majorityWord}</p>
                      <div className="flex -space-x-2 space-x-reverse overflow-hidden py-1">
                          {majorityPlayers.map(p => (
                              <div key={p.id} className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-sm border border-zinc-700 shadow-md relative" title={p.name}>
                                  {p.avatar}
                                  {/* Small badge for special role */}
                                  {getRoleEmoji(p) && (
                                      <div className="absolute -top-2 -right-1 text-[10px] bg-black rounded-full w-4 h-4 flex items-center justify-center border border-zinc-600">
                                          {getRoleEmoji(p)}
                                      </div>
                                  )}
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
      </div>

      {/* Leaderboard */}
      <div className="flex-1 bg-zinc-900/30 rounded-2xl p-4 border border-zinc-800/50">
        <h3 className="text-sm font-bold mb-4 text-zinc-400 uppercase tracking-widest">لوحة الشرف</h3>
        <div className="space-y-3">
            {sortedPlayers.map((p, idx) => (
                <div key={p.id} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                        <span className={`text-sm font-bold w-6 text-center ${idx === 0 ? 'text-yellow-500' : 'text-zinc-600'}`}>#{idx + 1}</span>
                        <span className="text-2xl group-hover:scale-110 transition-transform relative">
                            {p.avatar}
                            {getRoleEmoji(p) && <span className="absolute -bottom-1 -right-1 text-[10px]">{getRoleEmoji(p)}</span>}
                        </span>
                        <div className="flex flex-col">
                            <span className={`font-bold text-sm ${gameState.winners.includes(p.id) ? 'text-white' : 'text-zinc-400'}`}>{p.name}</span>
                            {gameState.winners.includes(p.id) && <span className="text-[10px] text-yellow-500">كسب الجولة</span>}
                        </div>
                    </div>
                    <span className="font-bold text-white bg-zinc-800 px-3 py-1 rounded-lg border border-zinc-700 min-w-[3rem] text-center">{p.score}</span>
                </div>
            ))}
        </div>
      </div>

      {isHost && (
        <div className="mt-8">
            <Button fullWidth onClick={onRestart} className="py-4 text-lg">
                لعبة كمان؟ 🔄
            </Button>
        </div>
      )}
    </div>
  );
};
