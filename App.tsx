
import React, { useEffect, useState, useRef } from 'react';
import { GamePhase, GameState, Player, NetworkMessage, GameConfig, SpecialRole, VotePayload } from './types';
import { AVATARS, ROUND_TIMERS, WORD_PACKS } from './constants';
import { network } from './services/network';
import { ScreenHome } from './components/ScreenHome';
import { ScreenLobby } from './components/ScreenLobby';
import { ScreenGame } from './components/ScreenGame';
import { ScreenVote } from './components/ScreenVote';
import { ScreenResult } from './components/ScreenResult';
import { ScreenTutorial } from './components/ScreenTutorial';
import { BookOpen, X } from 'lucide-react';

const generateId = () => Math.random().toString(36).substr(2, 9);

// Main App Component
const App: React.FC = () => {
  const [myPlayerId, setMyPlayerId] = useState<string>('');
  const [gameState, setGameState] = useState<GameState>({
    roomCode: '',
    phase: GamePhase.HOME,
    players: [],
    config: { maxRounds: 3, roundDurationBase: 30, includeSpecialRoles: true },
    currentRound: 1,
    currentTurnPlayerId: null,
    turnOrder: [],
    turnIndex: 0,
    timer: 0,
    hints: [],
    votes: {},
    winners: [],
    wordPack: null,
    usedWordPackIndices: [],
    readyPlayers: []
  });
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // Ref to track if I am host, usable inside stale network callbacks
  const isHostRef = useRef(false);

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
            config: incoming.config || prev.config || { maxRounds: 3, roundDurationBase: 30, includeSpecialRoles: true },
            turnOrder: incoming.turnOrder || prev.turnOrder || [],
            usedWordPackIndices: incoming.usedWordPackIndices || prev.usedWordPackIndices || [],
            readyPlayers: incoming.readyPlayers || prev.readyPlayers || []
        }));
        break;
      case 'UPDATE_SETTINGS':
        setGameState(prev => ({ ...prev, config: msg.payload }));
        break;
      case 'END_TURN':
        setGameState(prev => {
           const lastHint = prev.hints[prev.hints.length - 1];
           // Prevent duplicate hints
           if (lastHint && lastHint.playerId === msg.payload.playerId && lastHint.round === prev.currentRound) {
               return prev;
           }
           
           const newHints = [...prev.hints, { playerId: msg.payload.playerId, round: prev.currentRound, text: msg.payload.text }];
           const tempState = { ...prev, hints: newHints };

           // CRITICAL FIX: If I am Host, I must calculate the next turn immediately
           if (isHostRef.current) {
               return advanceTurn(tempState);
           }

           return tempState;
        });
        break;
      case 'SUBMIT_VOTE':
        setGameState(prev => ({
            ...prev,
            votes: { ...prev.votes, [msg.payload.voterId]: msg.payload.vote }
        }));
        break;
      case 'PLAYER_READY':
        setGameState(prev => ({
            ...prev,
            readyPlayers: prev.readyPlayers.includes(msg.payload) ? prev.readyPlayers : [...prev.readyPlayers, msg.payload]
        }));
        break;
      case 'RESTART':
         break;
    }
  };

  // --- Host Logic Loop ---
  const myPlayer = gameState.players.find(p => p.id === myPlayerId);
  const isHost = myPlayer?.isHost || false;

  // Sync ref
  useEffect(() => {
      isHostRef.current = isHost;
  }, [isHost]);

  useEffect(() => {
    if (!isHost) return;
    const timeout = setTimeout(() => {
        network.send({ type: 'SYNC_STATE', payload: gameState });
    }, 50);
    return () => clearTimeout(timeout);
  }, [gameState, isHost]);

  // --- Host: Check for All Ready to Start Game ---
  useEffect(() => {
      if (!isHost) return;
      if (gameState.phase === GamePhase.ROLE_REVEAL) {
          // Check if all connected players are ready
          const allReady = gameState.players.every(p => gameState.readyPlayers.includes(p.id));
          if (allReady && gameState.players.length > 0) {
              setGameState(prev => ({ ...prev, phase: GamePhase.GAME_ROUND }));
          }
      }
  }, [gameState.phase, gameState.players, gameState.readyPlayers, isHost]);

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

  // FIXED TIME LOGIC: Use the base value constantly
  const getRoundDuration = (round: number, base: number) => {
      return base; // Constant time per round as requested
  };

  // STRICT SINGLE GIFT LOGIC
  const assignRoundRoles = (currentPlayers: Player[], roundNumber: number): Player[] => {
      // 1. Reset ALL players to Normal first
      let updatedPlayers = currentPlayers.map(p => ({
          ...p,
          specialRole: p.isOutsider ? 'NORMAL' as SpecialRole : 'NORMAL' as SpecialRole
      }));

      // 2. Identify candidates (Innocents who haven't had a special role yet)
      const candidates = updatedPlayers.filter(p => !p.isOutsider && !p.hadSpecialRole);

      // 3. Pick EXACTLY ONE candidate randomly
      if (candidates.length > 0) {
          const randomCandidateIndex = Math.floor(Math.random() * candidates.length);
          const luckyId = candidates[randomCandidateIndex].id;

          const possibleRoles: SpecialRole[] = ['MUTE', 'JOKER', 'ACTOR'];
          const randomRole = possibleRoles[Math.floor(Math.random() * possibleRoles.length)];

          updatedPlayers = updatedPlayers.map(p => {
              if (p.id === luckyId) {
                  return {
                      ...p,
                      specialRole: randomRole,
                      hadSpecialRole: true,
                      wasJoker: (p.wasJoker || randomRole === 'JOKER')
                  };
              }
              return p;
          });
      }

      return updatedPlayers;
  };

  const advanceTurn = (state: GameState): GameState => {
     const totalPlayers = state.turnOrder.length;
     // Note: Mute check happens on current state players
     const mutePlayerIds = state.players.filter(p => p.specialRole === 'MUTE').map(p => p.id);
     const speakingPlayersCount = totalPlayers - mutePlayerIds.length;

     let newHints = state.hints;
     // Auto-submit only if current player was SUPPOSED to play and time ran out
     if (state.timer === 0 && state.currentTurnPlayerId && !mutePlayerIds.includes(state.currentTurnPlayerId)) {
         const hasPlayed = state.hints.some(h => h.playerId === state.currentTurnPlayerId && h.round === state.currentRound);
         if (!hasPlayed) {
             newHints = [...state.hints, { playerId: state.currentTurnPlayerId, round: state.currentRound, text: "مجاش 🤐" }];
         }
     }
     
     const hintsInCurrentRound = newHints.filter(h => h.round === state.currentRound).length;

     // Check if round is complete (based on speaking players only)
     if (hintsInCurrentRound >= speakingPlayersCount) {
         if (state.currentRound >= state.config.maxRounds) {
             return { 
                 ...state, 
                 hints: newHints, 
                 phase: GamePhase.VOTING, 
                 currentTurnPlayerId: null, 
                 timer: 0 
             };
         } else {
             const nextRound = state.currentRound + 1;
             
             // --- NEW ROUND LOGIC: ASSIGN NEW ROLES ---
             let playersWithNewRoles = state.players;
             if (state.config.includeSpecialRoles) {
                 playersWithNewRoles = assignRoundRoles(state.players, nextRound);
             }

             // Re-calculate mutes based on NEW roles
             const nextMutePlayerIds = playersWithNewRoles.filter(p => p.specialRole === 'MUTE').map(p => p.id);

             // Find first NON-MUTE player for next round
             let nextIndex = 0;
             let nextPlayerId = state.turnOrder[0];
             
             for(let i=0; i<totalPlayers; i++) {
                 if (!nextMutePlayerIds.includes(state.turnOrder[i])) {
                     nextIndex = i;
                     nextPlayerId = state.turnOrder[i];
                     break;
                 }
             }

             return {
                 ...state,
                 players: playersWithNewRoles, // Update players with new roles
                 hints: newHints,
                 currentRound: nextRound,
                 turnIndex: nextIndex,
                 currentTurnPlayerId: nextPlayerId,
                 timer: getRoundDuration(nextRound, state.config.roundDurationBase)
             };
         }
     }

     // Round continues: Find next NON-MUTE player
     let nextTurnIndex = state.turnIndex + 1;
     let nextPlayerId = state.turnOrder[nextTurnIndex % totalPlayers];

     // Loop to skip mutes
     while (mutePlayerIds.includes(nextPlayerId)) {
         nextTurnIndex++;
         nextPlayerId = state.turnOrder[nextTurnIndex % totalPlayers];
         if (nextTurnIndex > state.turnIndex + totalPlayers) break; 
     }

     return {
         ...state,
         hints: newHints,
         turnIndex: nextTurnIndex,
         currentTurnPlayerId: nextPlayerId,
         timer: getRoundDuration(state.currentRound, state.config.roundDurationBase)
     };
  };

  // --- Actions ---

  const handleHost = async (name: string, avatar: string) => {
    let code = '';
    let success = false;
    for (let i = 0; i < 3; i++) {
        code = Math.floor(1000 + Math.random() * 9000).toString();
        success = await network.startHosting(code, handleNetworkMessage);
        if (success) break;
    }
    if (!success) { alert("فشل إنشاء الروم"); return; }

    const pid = generateId();
    const player: Player = { id: pid, name, isHost: true, avatar, score: 0 };
    setMyPlayerId(pid);
    setGameState({ ...gameState, roomCode: code, phase: GamePhase.LOBBY, players: [player] });
  };

  const handleJoin = async (name: string, code: string, avatar: string) => {
    const success = await network.joinRoom(code, (msg) => { handleNetworkMessage(msg); });
    if (!success) { alert("مش قادر أوصل للروم"); return; }

    const pid = generateId();
    const player: Player = { id: pid, name, isHost: false, avatar, score: 0 };
    setMyPlayerId(pid);
    setGameState({ ...gameState, roomCode: code, phase: GamePhase.LOBBY, players: [player] });
    setTimeout(() => network.send({ type: 'JOIN', payload: player }), 500);
  };

  const handleUpdateSettings = (newConfig: GameConfig) => {
      setGameState(prev => ({ ...prev, config: newConfig }));
      network.send({ type: 'UPDATE_SETTINGS', payload: newConfig });
  };

  const handleBack = () => {
    network.disconnect();
    setGameState(prev => ({ ...prev, phase: GamePhase.HOME, roomCode: '', players: [] }));
  };

  const handleReady = () => {
      setGameState(prev => ({
          ...prev,
          readyPlayers: prev.readyPlayers.includes(myPlayerId) ? prev.readyPlayers : [...prev.readyPlayers, myPlayerId]
      }));
      network.send({ type: 'PLAYER_READY', payload: myPlayerId });
  };

  const handleStartGame = () => {
    if (!isHost) return;
    
    // 1. Pick Word Pack (Ensure no repeats)
    // Filter available packs based on history
    const availableIndices = WORD_PACKS.map((_, i) => i).filter(i => !gameState.usedWordPackIndices.includes(i));
    
    let packIndex: number;
    let newUsedIndices: number[];

    // If all packs have been used, reset the cycle
    if (availableIndices.length === 0) {
        // Pick any random pack from the full list
        packIndex = Math.floor(Math.random() * WORD_PACKS.length);
        // Start a new history list with just this one
        newUsedIndices = [packIndex];
    } else {
        // Pick a random pack from the available ones
        const randomIndex = Math.floor(Math.random() * availableIndices.length);
        packIndex = availableIndices[randomIndex];
        // Append to existing history
        newUsedIndices = [...gameState.usedWordPackIndices, packIndex];
    }

    const pack = WORD_PACKS[packIndex];

    const wordA = pack.A;
    const wordB = pack.B;
    const wordD = pack.D;
    const wordC = pack.C; // Outsider Word

    // 2. Strict Team Pair Logic
    const totalPlayers = gameState.players.length;
    const innocentCount = totalPlayers - 1; // Always 1 outsider
    let rolesPool: ('A'|'B'|'D')[] = [];

    // Always start with Team A (2 players)
    rolesPool.push('A', 'A');

    // If we have enough players for Team B
    if (rolesPool.length < innocentCount) {
        rolesPool.push('B', 'B');
    }

    // If we have enough players for Team D
    if (rolesPool.length < innocentCount) {
        rolesPool.push('D', 'D');
    }

    // Fill remaining
    while (rolesPool.length < innocentCount) {
         const countA = rolesPool.filter(r => r === 'A').length;
         const countB = rolesPool.filter(r => r === 'B').length;
         const countD = rolesPool.filter(r => r === 'D').length;

         if (countA <= countB) {
             rolesPool.push('A');
         } else if (countB <= countD) {
             rolesPool.push('B');
         } else {
             rolesPool.push('D');
         }
    }

    // Trim just in case
    rolesPool = rolesPool.slice(0, innocentCount);

    // 3. Assign Roles
    let players = [...gameState.players];
    // Shuffle players to assign roles randomly
    players = players.sort(() => 0.5 - Math.random());

    const outsider = players[0]; // First player is Outsider
    
    // Shuffle the roles pool to randomize who gets what team
    rolesPool = rolesPool.sort(() => 0.5 - Math.random());

    // --- NO INITIAL SPECIAL ROLES (They are gifts per round) ---
    // Just assign teams
    let newPlayers: Player[] = players.map(p => {
        if (p.id === outsider.id) {
            return { ...p, isOutsider: true, role: 'C' as const, word: wordC, specialRole: 'NORMAL' as SpecialRole, wasJoker: false, hadSpecialRole: false };
        }
        
        const assignedRole = rolesPool.pop()!;
        let assignedWord = wordA;
        if (assignedRole === 'B') assignedWord = wordB;
        if (assignedRole === 'D') assignedWord = wordD;

        return { ...p, isOutsider: false, role: assignedRole, word: assignedWord, specialRole: 'NORMAL' as SpecialRole, wasJoker: false, hadSpecialRole: false };
    });

    // --- INITIAL GIFT ROLE FOR ROUND 1 ---
    if (gameState.config.includeSpecialRoles) {
        newPlayers = assignRoundRoles(newPlayers, 1);
    }

    const turnOrder = [...newPlayers].sort(() => 0.5 - Math.random()).map(p => p.id);

    // Find the first player who is NOT Mute to start the turn
    let initialTurnIndex = 0;
    let initialTurnPlayerId = turnOrder[0];
    const mutePlayerIds = newPlayers.filter(p => p.specialRole === 'MUTE').map(p => p.id);
    
    for(let i=0; i<turnOrder.length; i++) {
        if (!mutePlayerIds.includes(turnOrder[i])) {
            initialTurnIndex = i;
            initialTurnPlayerId = turnOrder[i];
            break;
        }
    }

    setGameState({
        ...gameState,
        players: newPlayers,
        wordPack: pack,
        majorityWord: wordA, 
        teamBWord: wordB,
        teamDWord: wordD,
        outsiderWord: wordC,
        usedWordPackIndices: newUsedIndices,
        phase: GamePhase.ROLE_REVEAL,
        turnOrder: turnOrder,
        turnIndex: initialTurnIndex,
        currentRound: 1,
        currentTurnPlayerId: initialTurnPlayerId,
        timer: getRoundDuration(1, gameState.config.roundDurationBase),
        hints: [],
        votes: {},
        winners: [],
        readyPlayers: [] // Reset ready players
    });

    // REMOVED AUTO TIMEOUT. Now waits for everyone to be ready.
  };

  const handleEndTurn = (text: string) => {
    if (gameState.currentTurnPlayerId !== myPlayerId) return;

    network.send({ type: 'END_TURN', payload: { playerId: myPlayerId, text } });
    if (isHost) {
        setGameState(prev => {
             const newHints = [...prev.hints, { playerId: myPlayerId, round: prev.currentRound, text }];
             const tempState = { ...prev, hints: newHints };
             return advanceTurn(tempState);
        });
    }
  };

  const handleVote = (vote: VotePayload) => {
      network.send({ type: 'SUBMIT_VOTE', payload: { voterId: myPlayerId, vote } });
      setGameState(prev => ({ 
          ...prev, 
          votes: { ...prev.votes, [myPlayerId]: vote }
      }));
  };

  useEffect(() => {
    if (!isHost) return;
    if (gameState.phase === GamePhase.VOTING) {
        if (Object.keys(gameState.votes).length >= gameState.players.length) {
            // Process Results
            const outsider = gameState.players.find(p => p.isOutsider);
            if (!outsider) return; 

            // 1. Determine who was "Executed" (Max Outsider Votes)
            let maxVotes = 0;
            const voteCounts: Record<string, number> = {};
            
            // JOKER SCORING PREP
            const votesReceived: Record<string, number> = {};

            Object.entries(gameState.votes).forEach(([voterId, votePayload]) => {
                const weight = 1;
                voteCounts[votePayload.outsiderId] = (voteCounts[votePayload.outsiderId] || 0) + weight;
                
                // Track total votes received for everyone
                votesReceived[votePayload.outsiderId] = (votesReceived[votePayload.outsiderId] || 0) + 1;
            });
            
            // 2. Check if Outsider caught
            let outsiderVotes = voteCounts[outsider.id] || 0;
            let totalVotes = Object.values(voteCounts).reduce((a, b) => a + b, 0);
            const outsiderCaught = outsiderVotes > (totalVotes / 2);

            const winnersIds: string[] = [];

            // 3. Calculate Scores
            const updatedPlayers = gameState.players.map(p => {
                let roundScore = 0;
                const myVote = gameState.votes[p.id];
                const myTeammateId = myVote?.teammateId;

                // JOKER BONUS: If they were EVER a Joker, they get points for votes against them
                if (p.wasJoker) {
                    const myReceivedVotes = votesReceived[p.id] || 0;
                    if (myReceivedVotes > 0) {
                        roundScore += (myReceivedVotes * 2); // 2 points per vote received!
                    }
                }

                if (p.isOutsider) {
                    if (!outsiderCaught) {
                        roundScore += 5; 
                        winnersIds.push(p.id);
                    }
                    if (myTeammateId === null) {
                        roundScore += 3;
                    }
                } else {
                    if (outsiderCaught) roundScore += 2;
                    
                    if (myTeammateId === null) {
                        roundScore -= 2;
                    } else {
                        const targetTeammate = gameState.players.find(tp => tp.id === myTeammateId);
                        if (targetTeammate && targetTeammate.role === p.role && targetTeammate.id !== p.id) {
                            roundScore += 2;
                        }
                    }

                    if (outsiderCaught && !winnersIds.includes(p.id)) winnersIds.push(p.id);
                }
                return { ...p, score: p.score + roundScore };
            });

            setTimeout(() => {
                setGameState(prev => ({ ...prev, phase: GamePhase.RESULTS, winners: winnersIds, players: updatedPlayers }));
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
          turnOrder: [], 
          turnIndex: 0,
          readyPlayers: [],
          players: prev.players.map(p => ({ 
              ...p, 
              role: undefined, 
              isOutsider: undefined, 
              word: undefined, 
              specialRole: undefined,
              wasJoker: undefined,
              hadSpecialRole: undefined
          }))
      }));
      network.send({ type: 'RESTART', payload: null });
  };

  return (
    <div className="h-[100dvh] w-screen bg-transparent text-zinc-100 overflow-hidden flex flex-col font-cairo">
      <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] bg-red-900/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-20%] right-[-20%] w-[50%] h-[50%] bg-zinc-900/20 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 flex-1 h-full">
        {gameState.phase === GamePhase.TUTORIAL ? (
             <ScreenTutorial onBack={() => setGameState(prev => ({...prev, phase: GamePhase.HOME}))} />
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
                onEndTurn={handleEndTurn}
                onTimeUp={() => {}}
                onReady={handleReady}
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
