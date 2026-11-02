export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';
export type GameMode = 'elimination' | 'points' | 'survival';
export type TurnOrder = 'clockwise' | 'anticlockwise' | 'random';
export type GamePhase = 'LOBBY' | 'WORD_SELECTION' | 'IN_GAME' | 'ROUND_SUMMARY' | 'GAME_OVER';

export interface GameSettings {
  wordLength: number;             // 3 to 10
  difficulty: Difficulty;
  turnTimeLimit: number;          // 0 (no limit), 15, 30, 45, 60
  guessLimit: number;             // 2, 3, 5, 7, 999 (unlimited)
  gameMode: GameMode;
  turnOrder: TurnOrder;
  preventDuplicates: boolean;
  allowHints: boolean;
  maxPlayers: number;             // 2 to 15
}

export interface PlayerPublicState {
  id: string;
  name: string;
  isHost: boolean;
  isBot: boolean;
  isAlive: boolean;
  score: number;
  remainingGuesses: number;
  assignedTargetId: string;
  hasSubmittedWord: boolean;
  wordLength: number;
  knownPattern: string[]; // e.g. ['_', 'A', '_', 'A']
  testedLetters: Record<string, boolean>; // letter -> true (present) / false (absent)
  eliminatedBy?: string;
  eliminationRank?: number;
}

export interface GameEventLog {
  id: string;
  timestamp: number;
  actorId: string;
  actorName: string;
  targetId?: string;
  targetName?: string;
  type: 'LETTER_ASK' | 'WORD_GUESS' | 'ELIMINATION' | 'TIMEOUT' | 'HINT' | 'SYSTEM';
  message: string;
  success?: boolean;
  revealedPositions?: number[];
  letter?: string;
  guessedWord?: string;
}

export interface RoomState {
  roomCode: string;
  phase: GamePhase;
  settings: GameSettings;
  hostId: string;
  players: PlayerPublicState[];
  activePlayerIndex: number;
  activePlayerId: string;
  round: number;
  turnTimeRemaining: number;
  winner?: {
    id: string;
    name: string;
    score: number;
  };
  eventLogs: GameEventLog[];
}

export interface ClientGameState extends RoomState {
  myId: string;
  mySecretWord?: string;
  myAssignedTarget?: PlayerPublicState;
  myTargetPattern?: string[];
  myTargetTestedLetters?: Record<string, boolean>;
}

// Socket payload definitions
export interface CreateRoomPayload {
  playerName: string;
}

export interface JoinRoomPayload {
  roomCode: string;
  playerName: string;
}

export interface UpdateSettingsPayload {
  settings: Partial<GameSettings>;
}

export interface AddBotPayload {
  difficulty?: Difficulty;
}

export interface SubmitWordPayload {
  word: string;
}

export interface AskLetterPayload {
  targetId: string;
  letter: string;
}

export interface GuessWordPayload {
  targetId: string;
  word: string;
}

export interface UseHintPayload {
  targetId: string;
  hintType: 'first_letter' | 'last_letter' | 'vowel_count';
}

