
export enum GamePhase {
  HOME = 'HOME',
  LOBBY = 'LOBBY',
  ROLE_REVEAL = 'ROLE_REVEAL',
  GAME_ROUND = 'GAME_ROUND',
  VOTING = 'VOTING',
  RESULTS = 'RESULTS',
  TUTORIAL = 'TUTORIAL'
}

export type SpecialRole = 'NORMAL' | 'MUTE' | 'JOKER' | 'MAYOR';

export interface Player {
  id: string;
  name: string;
  isHost: boolean;
  avatar: string;
  score: number;
  word?: string; // Only visible locally or revealed at end
  role?: 'A' | 'B' | 'C'; // A (Majority), B (Outsider)
  isOutsider?: boolean;
  specialRole?: SpecialRole; // New field for sub-roles
}

export interface GameConfig {
  maxRounds: number;
  roundDurationBase: number; // Base seconds for round 1
}

export interface GameState {
  roomCode: string;
  phase: GamePhase;
  players: Player[];
  config: GameConfig; // New settings object
  currentRound: number;
  currentTurnPlayerId: string | null;
  timer: number;
  hints: { playerId: string; hint: string; round: number }[];
  votes: Record<string, string>; // VoterID -> VotedPlayerID (Outsider Vote)
  winners: string[]; // IDs of winners
  wordPack: { A: string; B: string; C: string } | null;
  usedWordPackIndices: number[]; // Track used words to avoid repetition
  majorityWord?: string; // Explicitly store which word was majority
  outsiderWord?: string; // Explicitly store which word was outsider
}

// Network Message Types
export type NetworkMessage =
  | { type: 'JOIN'; payload: Player }
  | { type: 'SYNC_STATE'; payload: GameState }
  | { type: 'UPDATE_SETTINGS'; payload: GameConfig }
  | { type: 'SUBMIT_HINT'; payload: { playerId: string; hint: string } }
  | { type: 'SUBMIT_VOTE'; payload: { voterId: string; outsiderId: string } }
  | { type: 'RESTART'; payload: null };
