
import React, { useEffect, useState, useRef } from 'react';
import { GamePhase, GameState, Player, NetworkMessage, GameConfig, SpecialRole } from './types';
import { AVATARS, ROUND_TIMERS, WORD_PACKS } from './constants';
import { network } from './services/network';
import { ScreenHome } from './components/ScreenHome';
import { ScreenLobby } from './components/ScreenLobby';
import { ScreenGame } from './components/ScreenGame';
import { ScreenVote } from './components/ScreenVote';
import { ScreenResult } from './components/ScreenResult';
import { Button } from './components/Button';
import { BookOpen, X, ArrowRight } from 'lucide-react';

const generateId = () => Math.random().toString(36).substr(2, 9);

// Main App Component
const App: React.FC = () => {
  const [myPlayerId, setMyPlayerId] = useState<string>('');
  const [gameState, setGameState] = useState<GameState>({
    roomCode: '',
    phase: GamePhase.HOME,
    players: [],
    config: { maxRounds: 3, roundDurationBase: 20 },
    currentRound: 1,
    currentTurnPlayerId: null,
    timer: 0,
    hints: [],
    votes: {},
    winners: [],
    wordPack: null,
    usedWordPackIndices: []
  });
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // --- Network Handling ---
  useEffect(() => {
    return () => {
      network.disconnect();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleNetworkMessage = (msg: NetworkMessage) => {
    switch (msg.type) {
      case 'JOIN':
        setGameState(prev => {
          if (prev.players.find(p => p.id === msg.payload.id)) return prev;
          const newPlayers = [...prev.players, msg.payload];
          return { ...prev, players: newPlayers };
        });
        break;
      case 'SYNC_STATE':
        const incoming = msg.payload as any;
        setGameState(prev => ({
            ...msg.payload,
            config: incoming.config || prev.config || { maxRounds: 3, roundDurationBase: 20 },
            usedWordPackIndices: incoming.usedWordPackIndices || prev.usedWordPackIndices || []
        }));
        break;
      case 'UPDATE_SETTINGS':
        setGameState(prev => ({ ...prev, config: msg.payload }));
        break;
      case 'SUBMIT_HINT':
        setGameState(prev => {
           if (prev.hints.some(h => h.hint === msg.payload.hint && h.playerId === msg.payload.playerId)) return prev;
           const newHints = [...prev.hints, { ...msg.payload, round: prev.currentRound }];
           return { ...prev, hints: newHints };
        });
        break;
      case 'SUBMIT_VOTE':
        setGameState(prev => ({
            ...prev,
            votes: { ...prev.votes, [msg.payload.voterId]: msg.payload.outsiderId }
        }));
        break;
      case 'RESTART':
         break;
    }
  };

  // --- Host Logic Loop ---
  const myPlayer = gameState.players.find(p => p.id === myPlayerId);
  const isHost = myPlayer?.isHost || false;

  useEffect(() => {
    if (!isHost) return;
    const timeout = setTimeout(() => {
        network.send({ type: 'SYNC_STATE', payload: gameState });
    }, 50);
    return () => clearTimeout(timeout);
  }, [gameState, isHost]);

  // --- Host Game Loop (Timer & Turns) ---
  useEffect(() => {
    if (!isHost) return;
    if (gameState.phase !== GamePhase.GAME_ROUND) {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        return;
    }

    if (!timerRef.current) {
        timerRef.current = setInterval(() => {
            setGameState(prev => {
                if (prev.timer > 0) {
                    return { ...prev, timer: prev.timer - 1 };
                } else {
                    return advanceTurn(prev);
                }
            });
        }, 1000);
    }
    
    return () => {};
  }, [gameState.phase, isHost]);

  const getRoundDuration = (round: number, base: number) => {
      if (round === 1) return base;
      if (round === 2) return Math.max(10, Math.floor(base * 0.75));
      return Math.max(5, Math.floor(base * 0.4));
  };

  const advanceTurn = (state: GameState): GameState => {
     const currentIndex = state.players.findIndex(p => p.id === state.currentTurnPlayerId);
     const nextIndex = (currentIndex + 1) % state.players.length;
     const nextPlayer = state.players[nextIndex];
     
     const hintsThisRound = state.hints.filter(h => h.round === state.currentRound);
     
     if (hintsThisRound.length >= state.players.length) {
         if (state.currentRound >= state.config.maxRounds) {
             return { ...state, phase: GamePhase.VOTING, currentTurnPlayerId: null, timer: 0 };
         } else {
             const nextRound = state.currentRound + 1;
             return {
                 ...state,
                 currentRound: nextRound,
                 currentTurnPlayerId: state.players[0].id,
                 timer: getRoundDuration(nextRound, state.config.roundDurationBase),
             };
         }
     }

     let newHints = state.hints;
     if (state.timer === 0) {
         newHints = [...state.hints, { playerId: state.currentTurnPlayerId!, hint: "عدى دوره 😶", round: state.currentRound }];
         const updatedHintsThisRound = newHints.filter(h => h.round === state.currentRound);
         
         if (updatedHintsThisRound.length >= state.players.length) {
            if (state.currentRound >= state.config.maxRounds) {
                return { ...state, hints: newHints, phase: GamePhase.VOTING, currentTurnPlayerId: null, timer: 0 };
            } else {
                const nextRound = state.currentRound + 1;
                return {
                    ...state,
                    hints: newHints,
                    currentRound: nextRound,
                    currentTurnPlayerId: state.players[0].id,
                    timer: getRoundDuration(nextRound, state.config.roundDurationBase)
                };
            }
         }
     }

     return {
         ...state,
         hints: newHints,
         currentTurnPlayerId: nextPlayer.id,
         timer: getRoundDuration(state.currentRound, state.config.roundDurationBase)
     };
  };

  // --- Actions ---

  const handleHost = async (name: string, avatar: string) => {
    // Retry logic for room code generation
    let code = '';
    let success = false;
    
    for (let i = 0; i < 3; i++) {
        code = Math.floor(1000 + Math.random() * 9000).toString();
        success = await network.startHosting(code, handleNetworkMessage);
        if (success) break;
    }

    if (!success) {
        alert("فشل إنشاء الروم، حاول مرة تانية!");
        return;
    }

    const pid = generateId();
    const player: Player = { id: pid, name, isHost: true, avatar, score: 0 };
    setMyPlayerId(pid);
    setGameState({ ...gameState, roomCode: code, phase: GamePhase.LOBBY, players: [player] });
  };

  const handleJoin = async (name: string, code: string, avatar: string) => {
    const success = await network.joinRoom(code, (msg) => { handleNetworkMessage(msg); });
    
    if (!success) {
        alert("مش قادر أوصل للروم دي. اتأكد من الكود أو النت!");
        return;
    }

    const pid = generateId();
    const player: Player = { id: pid, name, isHost: false, avatar, score: 0 };
    setMyPlayerId(pid);
    setGameState({ ...gameState, roomCode: code, phase: GamePhase.LOBBY, players: [player] });
    
    // Give a small delay to ensure connection is fully established before sending data
    setTimeout(() => network.send({ type: 'JOIN', payload: player }), 500);
  };

  const handleUpdateSettings = (newConfig: GameConfig) => {
      setGameState(prev => ({ ...prev, config: newConfig }));
      network.send({ type: 'UPDATE_SETTINGS', payload: newConfig });
  };

  const handleBack = () => {
    network.disconnect();
    setGameState(prev => ({
        ...prev,
        phase: GamePhase.HOME,
        roomCode: '',
        players: []
    }));
  };

  const handleStartGame = () => {
    if (!isHost) return;

    const availableIndices = WORD_PACKS.map((_, i) => i).filter(i => !gameState.usedWordPackIndices.includes(i));
    
    let packIndex: number;
    let newUsedIndices = [...gameState.usedWordPackIndices];

    if (availableIndices.length === 0) {
        packIndex = Math.floor(Math.random() * WORD_PACKS.length);
        newUsedIndices = [packIndex];
    } else {
        const randomIndex = Math.floor(Math.random() * availableIndices.length);
        packIndex = availableIndices[randomIndex];
        newUsedIndices.push(packIndex);
    }

    const pack = WORD_PACKS[packIndex];
    
    // Randomize which word is Majority and which is Outsider
    const useAForMajority = Math.random() > 0.5;
    const majorityWord = useAForMajority ? pack.A : pack.B;
    const outsiderWord = useAForMajority ? pack.B : pack.A;

    const players = [...gameState.players];
    const outsiderIdx = Math.floor(Math.random() * players.length);

    // Assign Roles
    // Create a pool of special roles for the rest of the players
    const specialRolesPool: SpecialRole[] = [];
    const teammatesCount = players.length - 1;
    
    // 15% Chance for Mayor, 20% Mute, 20% Joker, rest Normal
    if (teammatesCount >= 3) {
        if (Math.random() < 0.4) specialRolesPool.push('MAYOR');
        if (Math.random() < 0.4) specialRolesPool.push('MUTE');
        if (Math.random() < 0.4) specialRolesPool.push('JOKER');
    }

    // Shuffle the pool to distribute randomly
    const shuffledRoles = specialRolesPool.sort(() => 0.5 - Math.random());
    let roleIndex = 0;

    const newPlayers = players.map((p, idx) => {
        if (idx === outsiderIdx) {
            return { ...p, isOutsider: true, role: 'B' as const, word: outsiderWord, specialRole: 'NORMAL' as SpecialRole };
        }
        
        // Assign special role if available
        let sRole: SpecialRole = 'NORMAL';
        if (roleIndex < shuffledRoles.length) {
            sRole = shuffledRoles[roleIndex];
            roleIndex++;
        }

        return { ...p, isOutsider: false, role: 'A' as const, word: majorityWord, specialRole: sRole };
    });

    setGameState({
        ...gameState,
        players: newPlayers,
        wordPack: pack,
        majorityWord,
        outsiderWord,
        usedWordPackIndices: newUsedIndices,
        phase: GamePhase.ROLE_REVEAL,
        currentRound: 1,
        currentTurnPlayerId: newPlayers[0].id,
        timer: getRoundDuration(1, gameState.config.roundDurationBase),
        hints: [],
        votes: {},
        winners: []
    });

    setTimeout(() => {
        setGameState(prev => ({ ...prev, phase: GamePhase.GAME_ROUND }));
    }, 6000);
  };

  const handleSendHint = (hint: string) => {
    network.send({ type: 'SUBMIT_HINT', payload: { playerId: myPlayerId, hint } });
    if (isHost) {
        setGameState(prev => {
            if (prev.hints.some(h => h.hint === hint && h.playerId === myPlayerId)) return prev;
            
            const newHints = [...prev.hints, { playerId: myPlayerId, hint, round: prev.currentRound }];
            const currentIndex = prev.players.findIndex(p => p.id === prev.currentTurnPlayerId);
            const nextIndex = (currentIndex + 1) % prev.players.length;
            
            const hintsThisRound = newHints.filter(h => h.round === prev.currentRound);
            
            if (hintsThisRound.length >= prev.players.length) {
                if (prev.currentRound >= prev.config.maxRounds) {
                     return { ...prev, hints: newHints, phase: GamePhase.VOTING, currentTurnPlayerId: null, timer: 0 };
                } else {
                     const nextRound = prev.currentRound + 1;
                     return {
                         ...prev,
                         hints: newHints,
                         currentRound: nextRound,
                         currentTurnPlayerId: prev.players[0].id,
                         timer: getRoundDuration(nextRound, prev.config.roundDurationBase)
                     };
                }
            }
            return {
                ...prev,
                hints: newHints,
                currentTurnPlayerId: prev.players[nextIndex].id,
                timer: getRoundDuration(prev.currentRound, prev.config.roundDurationBase)
            };
        });
    }
  };

  const handleVote = (outsiderId: string) => {
      network.send({ type: 'SUBMIT_VOTE', payload: { voterId: myPlayerId, outsiderId } });
      setGameState(prev => ({ 
          ...prev, 
          votes: { ...prev.votes, [myPlayerId]: outsiderId }
      }));
  };

  useEffect(() => {
    if (!isHost) return;
    if (gameState.phase === GamePhase.VOTING) {
        if (Object.keys(gameState.votes).length >= gameState.players.length) {
            const outsider = gameState.players.find(p => p.isOutsider);
            if (!outsider) return; 

            // Calculate Votes with weights (Mayor = 2)
            let outsiderVotes = 0;
            let totalWeightedVotes = 0;

            Object.entries(gameState.votes).forEach(([voterId, votedId]) => {
                const voter = gameState.players.find(p => p.id === voterId);
                const weight = (voter?.specialRole === 'MAYOR') ? 2 : 1;
                
                totalWeightedVotes += weight;
                if (votedId === outsider.id) {
                    outsiderVotes += weight;
                }
            });

            // Threshold: 50% of weighted votes + 1 (simple majority) is usually standard.
            // Or just most votes? Let's stick to simple logic: 
            // If total people is 5, votes needed is 3. 
            // Weighted: If total weight is 6, need 4.
            const threshold = Math.floor(totalWeightedVotes / 2) + 0.1; // > 50%
            const outsiderCaught = outsiderVotes > threshold;
            const winnersIds: string[] = [];

            const updatedPlayers = gameState.players.map(p => {
                let roundScore = 0;
                
                if (p.isOutsider) {
                    if (!outsiderCaught) {
                        roundScore += 5; // Big win for escaping
                        winnersIds.push(p.id);
                    }
                } else {
                    // Teammate Logic
                    if (outsiderCaught) {
                        // Bonus for voting correctly
                        if (gameState.votes[p.id] === outsider.id) {
                            roundScore += 2; 
                        }
                        if (!winnersIds.includes(p.id)) winnersIds.push(p.id); // Team Win
                    } else {
                        // Special Logic for Joker: If Joker was voted out? (Too complex for now, just keep Joker as chaos agent)
                        // If we implemented Joker win condition on being voted out, we'd check here.
                    }
                }
                
                return { ...p, score: p.score + roundScore };
            });

            setTimeout(() => {
                setGameState(prev => ({ 
                    ...prev, 
                    phase: GamePhase.RESULTS, 
                    winners: winnersIds,
                    players: updatedPlayers
                }));
            }, 1000);
        }
    }
  }, [gameState.votes, gameState.phase, isHost]);

  const handleRestart = () => {
      if (!isHost) return;
      setGameState(prev => ({
          ...prev,
          phase: GamePhase.LOBBY,
          currentRound: 1,
          hints: [],
          votes: {},
          winners: [],
          players: prev.players.map(p => ({ ...p, role: undefined, isOutsider: undefined, word: undefined, specialRole: undefined }))
      }));
      network.send({ type: 'RESTART', payload: null });
  };

  return (
    <div className="h-screen w-screen bg-black text-zinc-100 overflow-hidden flex flex-col font-cairo">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] bg-red-900/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-20%] right-[-20%] w-[50%] h-[50%] bg-zinc-900/20 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 flex-1 h-full">
        {gameState.phase === GamePhase.TUTORIAL ? (
             <div className="p-6 h-full flex flex-col max-w-md mx-auto animate-fade-in overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-yellow-500">طريقة اللعب 🎬</h2>
                    <button 
                        onClick={() => setGameState(prev => ({...prev, phase: GamePhase.HOME}))}
                        className="bg-zinc-900 p-2 rounded-full hover:bg-zinc-800 transition"
                    >
                        <X size={24} />
                    </button>
                </div>
                <div className="space-y-6 text-zinc-300 leading-relaxed text-lg pb-10">
                    <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                        <BookOpen className="mb-2 text-red-600" />
                        <p><strong>١. التجمع:</strong> اللعبة دي بتتلعب وإنتوا قاعدين مع بعض. واحد Host والباقي Join.</p>
                    </div>
                    <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                        <p><strong>٢. الأدوار:</strong> كلكم <strong>مواطنين</strong> ما عدا واحد <strong>دخيل</strong>. بس في أدوار خاصة زي <strong>العمدة</strong> (صوته بـ 2) و <strong>الصامت</strong> (إيموجي بس).</p>
                    </div>
                    <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                        <p><strong>٣. التمثيل:</strong> كل واحد هيقول كلمة واحدة. الدخيل بيحاول يمثل زيكوا.</p>
                    </div>
                    <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                        <p><strong>٤. كشف الدخيل:</strong> بعد ٣ جولات، صوتوا على الدخيل. لو عرفتوه تكسبوا. لو هرب يكسب هو (Absolute Cinema).</p>
                    </div>
                    <Button onClick={() => setGameState(prev => ({...prev, phase: GamePhase.HOME}))} fullWidth>فهمت، يلا بينا!</Button>
                </div>
             </div>
        ) : gameState.phase === GamePhase.HOME ? (
            <ScreenHome 
                onHost={handleHost} 
                onJoin={handleJoin} 
                onTutorial={() => setGameState(prev => ({...prev, phase: GamePhase.TUTORIAL}))} 
            />
        ) : gameState.phase === GamePhase.LOBBY ? (
            <ScreenLobby 
                roomCode={gameState.roomCode} 
                players={gameState.players} 
                isHost={isHost}
                config={gameState.config}
                onUpdateSettings={handleUpdateSettings}
                onStart={handleStartGame}
                onBack={handleBack}
            />
        ) : gameState.phase === GamePhase.ROLE_REVEAL || gameState.phase === GamePhase.GAME_ROUND ? (
            <ScreenGame 
                gameState={gameState} 
                myPlayerId={myPlayerId}
                onSendHint={handleSendHint}
                onTimeUp={() => {}}
            />
        ) : gameState.phase === GamePhase.VOTING ? (
            <ScreenVote 
                players={gameState.players} 
                myPlayerId={myPlayerId} 
                onVote={handleVote}
            />
        ) : (
            <ScreenResult 
                gameState={gameState}
                onRestart={handleRestart}
                isHost={isHost}
            />
        )}
      </div>
    </div>
  );
};

export default App;
