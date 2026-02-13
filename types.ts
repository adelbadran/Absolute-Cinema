
export enum GamePhase {
  HOME = 'HOME',
  LOBBY = 'LOBBY',
  ROLE_REVEAL = 'ROLE_REVEAL',
  GAME_ROUND = 'GAME_ROUND',
  VOTING = 'VOTING',
  RESULTS = 'RESULTS',
  TUTORIAL = 'TUTORIAL'
}

export type SpecialRole = 'NORMAL' | 'MUTE' | 'JOKER' | 'OUTSIDER' | 'ACTOR';

export interface Player {
  id: string;
  name: string;
  isHost: boolean;
  avatar: string;
  score: number;
  word?: string; // Only visible locally or revealed at end
  role?: 'A' | 'B' | 'C' | 'D'; // Extended to include D
  isOutsider?: boolean;
  specialRole?: SpecialRole; // Current round role
  hadSpecialRole?: boolean; // Track if they already got a gift role
  wasJoker?: boolean; // Track if they ever held the Joker role
}

export interface GameConfig {
  maxRounds: number;
  roundDurationBase: number; // Base seconds for round 1
  includeSpecialRoles: boolean; // Toggle for Special Roles
}

export interface VotePayload {
    outsiderId: string;
    teammateId: string | null; // Null means "I have no teammate / I am the outsider"
}

export interface GameState {
  roomCode: string;
  phase: GamePhase;
  players: Player[];
  config: GameConfig;
  currentRound: number;
  currentTurnPlayerId: string | null;
  turnOrder: string[]; // Fixed array of Player IDs to guarantee order
  turnIndex: number; // Current index in the turnOrder array
  timer: number;
  hints: { playerId: string; round: number; text: string }[]; // Added text field
  votes: Record<string, VotePayload>; // VoterID -> {outsiderId, teammateId}
  winners: string[];
  wordPack: { A: string; B: string; C: string; D: string } | null;
  usedWordPackIndices: number[];
  majorityWord?: string; // Team A
  outsiderWord?: string; // Team C
  teamBWord?: string; // Team B
  teamDWord?: string; // Team D
  readyPlayers: string[]; // IDs of players who clicked ready
}

// Network Message Types
export type NetworkMessage =
  | { type: 'JOIN'; payload: Player }
  | { type: 'SYNC_STATE'; payload: GameState }
  | { type: 'UPDATE_SETTINGS'; payload: GameConfig }
  | { type: 'END_TURN'; payload: { playerId: string; text: string } }
  | { type: 'SUBMIT_VOTE'; payload: { voterId: string; vote: VotePayload } }
  | { type: 'RESTART'; payload: null }
  | { type: 'PLAYER_READY'; payload: string };
