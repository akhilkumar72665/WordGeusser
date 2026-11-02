import {
  GamePhase,
  GameSettings,
  PlayerPublicState,
  RoomState,
  GameEventLog,
  Difficulty
} from '../../../shared/types';
import { validateWordSubmission, calculateDifficultyPoints } from '../data/validator';
import { BotAI } from './BotAI';

export interface InternalPlayer {
  id: string;
  name: string;
  isHost: boolean;
  isBot: boolean;
  isAlive: boolean;
  score: number;
  remainingGuesses: number;
  assignedTargetId: string;
  secretWord: string;
  hasSubmittedWord: boolean;
  knownPattern: string[];
  testedLetters: Record<string, boolean>;
  eliminatedBy?: string;
  eliminationRank?: number;
}

export type StateChangeCallback = (roomState: RoomState) => void;
export type TimerTickCallback = (secondsRemaining: number) => void;

export class Room {
  public roomCode: string;
  public phase: GamePhase = 'LOBBY';
  public settings: GameSettings;
  public hostId: string;
  public players: Map<string, InternalPlayer> = new Map();
  public turnPlayerOrder: string[] = []; // player IDs in turn sequence
  public activePlayerIndex: number = 0;
  public round: number = 1;
  public turnTimeRemaining: number = 0;
  public eventLogs: GameEventLog[] = [];
  public winner?: { id: string; name: string; score: number };

  private timerInterval: NodeJS.Timeout | null = null;
  private botTurnTimeout: NodeJS.Timeout | null = null;
  private onStateChange: StateChangeCallback;
  private onTimerTick?: TimerTickCallback;

  constructor(roomCode: string, hostId: string, hostName: string, onStateChange: StateChangeCallback) {
    this.roomCode = roomCode;
    this.hostId = hostId;
    this.onStateChange = onStateChange;

    this.settings = {
      wordLength: 5,
      difficulty: 'medium',
      turnTimeLimit: 30,
      guessLimit: 5,
      gameMode: 'elimination',
      turnOrder: 'clockwise',
      preventDuplicates: true,
      allowHints: true,
      maxPlayers: 15
    };

    // Add host
    this.addPlayer(hostId, hostName, true, false);
  }

  public setTimerTickCallback(callback: TimerTickCallback) {
    this.onTimerTick = callback;
  }

  public addPlayer(id: string, name: string, isHost: boolean = false, isBot: boolean = false): boolean {
    if (this.players.size >= this.settings.maxPlayers && !this.players.has(id)) {
      return false;
    }
    if (this.phase !== 'LOBBY') {
      return false;
    }

    const player: InternalPlayer = {
      id,
      name,
      isHost,
      isBot,
      isAlive: true,
      score: 0,
      remainingGuesses: this.settings.guessLimit,
      assignedTargetId: '',
      secretWord: '',
      hasSubmittedWord: false,
      knownPattern: Array(this.settings.wordLength).fill('_'),
      testedLetters: {}
    };

    this.players.set(id, player);
    this.addLog('SYSTEM', `${name} joined the game.`, id, name);
    this.notifyState();
    return true;
  }

  public removePlayer(id: string): void {
    const p = this.players.get(id);
    if (!p) return;

    const leftTargetId = p.assignedTargetId;
    const wasActivePlayer =
      this.phase === 'IN_GAME' && this.turnPlayerOrder[this.activePlayerIndex] === id;
    this.players.delete(id);
    this.addLog('SYSTEM', `${p.name} left the game.`, id, p.name);

    if (id === this.hostId && this.players.size > 0) {
      // Reassign host
      const nextHost = Array.from(this.players.values())[0];
      nextHost.isHost = true;
      this.hostId = nextHost.id;
      this.addLog('SYSTEM', `${nextHost.name} is now the host.`, nextHost.id, nextHost.name);
    }

    // If game in progress, handle ring topology reassignment. The removed
    // player is already out of the map, so pass their old target along.
    if (this.phase === 'IN_GAME') {
      this.handlePlayerEliminationOrLeave(id, leftTargetId);

      // If the player whose turn it was abandoned the table, pass the turn on
      // instead of leaving the match stalled on a player who no longer exists.
      if (wasActivePlayer && this.phase === 'IN_GAME') {
        this.nextTurn();
        return;
      }
    }

    this.notifyState();
  }

  public addBot(difficulty: Difficulty = this.settings.difficulty): boolean {
    if (this.players.size >= this.settings.maxPlayers || this.phase !== 'LOBBY') {
      return false;
    }
    const botIndex = Array.from(this.players.values()).filter((p) => p.isBot).length + 1;
    const botId = `bot_${Date.now()}_${botIndex}`;
    const botNames = ['SherlockBot', 'EnigmaBot', 'WatsonAI', 'CipherAI', 'OrchestraBot', 'NexusBot', 'OracleAI'];
    const botName = botNames[(botIndex - 1) % botNames.length];

    return this.addPlayer(botId, botName, false, true);
  }

  public removeBot(botId: string): boolean {
    const p = this.players.get(botId);
    if (p && p.isBot && this.phase === 'LOBBY') {
      this.removePlayer(botId);
      return true;
    }
    return false;
  }

  public updateSettings(newSettings: Partial<GameSettings>): void {
    if (this.phase !== 'LOBBY') return;

    const next = { ...this.settings, ...newSettings };
    next.wordLength = Math.min(10, Math.max(3, Math.round(next.wordLength || 5)));
    next.maxPlayers = Math.min(15, Math.max(2, Math.round(next.maxPlayers || 15)));
    next.guessLimit =
      next.guessLimit === 999
        ? 999
        : Math.min(10, Math.max(1, Math.round(next.guessLimit || 5)));
    next.turnTimeLimit = Math.max(0, Math.round(next.turnTimeLimit || 0));

    this.settings = next;

    // Update player patterns and guesses according to new settings
    for (const p of this.players.values()) {
      p.knownPattern = Array(this.settings.wordLength).fill('_');
      p.testedLetters = {};
      p.remainingGuesses = this.settings.guessLimit;
    }
    this.notifyState();
  }

  public startGame(): { success: boolean; error?: string } {
    if (this.players.size < 2) {
      return { success: false, error: 'At least 2 players are required to start.' };
    }
    if (this.phase !== 'LOBBY') {
      return { success: false, error: 'Game is already started.' };
    }

    this.phase = 'WORD_SELECTION';
    this.winner = undefined;
    this.round = 1;
    this.eventLogs = [];

    // Reset player state for the match
    for (const p of this.players.values()) {
      p.isAlive = true;
      p.hasSubmittedWord = false;
      p.secretWord = '';
      p.remainingGuesses = this.settings.guessLimit;
      p.knownPattern = Array(this.settings.wordLength).fill('_');
      p.testedLetters = {};
      delete p.eliminatedBy;
      delete p.eliminationRank;
    }

    // Automatically pick secret words for AI bots
    const existingWords: string[] = [];
    for (const p of this.players.values()) {
      if (p.isBot) {
        const word = BotAI.selectSecretWord(this.settings.wordLength, this.settings.difficulty, existingWords);
        p.secretWord = word;
        p.hasSubmittedWord = true;
        existingWords.push(word);
      }
    }

    this.addLog('SYSTEM', 'The table is set. Each player must now seal a word.');
    this.notifyState();

    // Check if everyone (e.g. all bots) has submitted already
    this.checkAllWordsSubmitted();

    return { success: true };
  }

  public submitSecretWord(playerId: string, word: string): { success: boolean; error?: string } {
    if (this.phase !== 'WORD_SELECTION') {
      return { success: false, error: 'Not currently in secret word selection phase.' };
    }

    const player = this.players.get(playerId);
    if (!player) return { success: false, error: 'Player not found.' };

    const existingWords = Array.from(this.players.values())
      .filter((p) => p.id !== playerId && p.hasSubmittedWord)
      .map((p) => p.secretWord);

    const validation = validateWordSubmission(
      word,
      this.settings.wordLength,
      this.settings.difficulty,
      existingWords,
      this.settings.preventDuplicates
    );

    if (!validation.valid) {
      return { success: false, error: validation.reason };
    }

    player.secretWord = validation.sanitizedWord;
    player.hasSubmittedWord = true;
    this.addLog('SYSTEM', `${player.name} has locked in their secret word.`, player.id, player.name);

    this.notifyState();
    this.checkAllWordsSubmitted();

    return { success: true };
  }

  private checkAllWordsSubmitted(): void {
    const allSubmitted = Array.from(this.players.values()).every((p) => p.hasSubmittedWord);
    if (allSubmitted && this.phase === 'WORD_SELECTION') {
      this.initiateInGamePhase();
    }
  }

  private initiateInGamePhase(): void {
    this.phase = 'IN_GAME';

    // Build Ring Topology
    let playerList = Array.from(this.players.values());
    if (this.settings.turnOrder === 'random') {
      playerList = playerList.sort(() => Math.random() - 0.5);
    } else if (this.settings.turnOrder === 'anticlockwise') {
      playerList.reverse();
    }

    this.turnPlayerOrder = playerList.map((p) => p.id);
    const n = playerList.length;

    // Directed ring: P_i -> P_(i+1 % n)
    for (let i = 0; i < n; i++) {
      const current = playerList[i];
      const target = playerList[(i + 1) % n];
      current.assignedTargetId = target.id;
    }

    this.activePlayerIndex = 0;
    this.addLog('SYSTEM', 'Every word is sealed. The first turn begins.');
    this.notifyState();

    this.startTurn();
  }

  public startTurn(): void {
    this.clearTurnTimer();

    // Check game over condition
    const alivePlayers = Array.from(this.players.values()).filter((p) => p.isAlive);
    if (alivePlayers.length <= 1) {
      this.endGame(alivePlayers[0]);
      return;
    }

    // Ensure active player is alive
    const currentId = this.turnPlayerOrder[this.activePlayerIndex];
    const currentPlayer = this.players.get(currentId);
    if (!currentPlayer || !currentPlayer.isAlive) {
      this.nextTurn();
      return;
    }

    // Setup timer
    if (this.settings.turnTimeLimit > 0) {
      this.turnTimeRemaining = this.settings.turnTimeLimit;
      this.timerInterval = setInterval(() => {
        this.turnTimeRemaining--;
        if (this.onTimerTick) {
          this.onTimerTick(this.turnTimeRemaining);
        }
        if (this.turnTimeRemaining <= 0) {
          this.handleTurnTimeout();
        }
      }, 1000);
    }

    this.notifyState();

    // If bot, trigger AI decision
    if (currentPlayer.isBot) {
      this.triggerBotTurn(currentPlayer);
    }
  }

  private triggerBotTurn(botPlayer: InternalPlayer): void {
    const target = this.players.get(botPlayer.assignedTargetId);
    if (!target || !target.isAlive) {
      this.nextTurn();
      return;
    }

    const delay = 1500 + Math.random() * 1000;
    this.botTurnTimeout = setTimeout(() => {
      if (this.phase !== 'IN_GAME' || this.turnPlayerOrder[this.activePlayerIndex] !== botPlayer.id) return;

      const decision = BotAI.decideAction(
        botPlayer.id,
        this.sanitizePlayer(target, true),
        this.settings.difficulty,
        this.settings.wordLength
      );

      if (decision.type === 'GUESS_WORD') {
        this.guessWord(botPlayer.id, decision.targetId, decision.payload);
      } else {
        this.askLetter(botPlayer.id, decision.targetId, decision.payload);
      }
    }, delay);
  }

  public askLetter(actorId: string, targetId: string, rawLetter: string): { success: boolean; error?: string } {
    if (this.phase !== 'IN_GAME') return { success: false, error: 'Not in game' };
    const currentId = this.turnPlayerOrder[this.activePlayerIndex];
    if (currentId !== actorId) return { success: false, error: 'Not your turn' };

    const actor = this.players.get(actorId);
    const target = this.players.get(targetId);
    if (!actor || !target) return { success: false, error: 'Player or target not found' };
    if (!target.isAlive) return { success: false, error: 'Target player is already eliminated' };

    // Assigned target rule check
    if (actor.assignedTargetId !== targetId) {
      return { success: false, error: 'You can only ask alphabet questions to your assigned target opponent!' };
    }

    const letter = rawLetter.trim().toUpperCase();
    if (!letter || letter.length !== 1 || !/^[A-Z]$/.test(letter)) {
      return { success: false, error: 'Please choose a single letter (A-Z)' };
    }

    if (Object.prototype.hasOwnProperty.call(target.testedLetters, letter)) {
      return {
        success: false,
        error: `The letter '${letter}' has already been asked. Choose another.`
      };
    }

    // Check if letter in target's secret word
    const secret = target.secretWord.toUpperCase();
    const positions: number[] = [];
    for (let i = 0; i < secret.length; i++) {
      if (secret[i] === letter) {
        positions.push(i);
        target.knownPattern[i] = letter;
      }
    }

    const isHit = positions.length > 0;
    target.testedLetters[letter] = isHit;

    if (isHit) {
      // 1-based readable positions
      const pos1Based = positions.map((p) => p + 1).join(', ');
      this.addLog(
        'LETTER_ASK',
        `${actor.name} asked ${target.name} for '${letter}': FOUND at position(s) ${pos1Based}!`,
        actor.id,
        actor.name,
        target.id,
        target.name,
        true,
        positions,
        letter
      );
    } else {
      this.addLog(
        'LETTER_ASK',
        `${actor.name} asked ${target.name} for '${letter}': NOT found.`,
        actor.id,
        actor.name,
        target.id,
        target.name,
        false,
        [],
        letter
      );
    }

    this.nextTurn();
    return { success: true };
  }

  public guessWord(actorId: string, targetId: string, rawWord: string): { success: boolean; error?: string } {
    if (this.phase !== 'IN_GAME') return { success: false, error: 'Not in game' };
    const currentId = this.turnPlayerOrder[this.activePlayerIndex];
    if (currentId !== actorId) return { success: false, error: 'Not your turn' };

    const actor = this.players.get(actorId);
    const target = this.players.get(targetId);
    if (!actor || !target) return { success: false, error: 'Player or target not found' };
    if (!target.isAlive) return { success: false, error: 'Target player is already eliminated' };
    if (actor.remainingGuesses <= 0) return { success: false, error: 'You have exhausted your word guess attempts!' };

    const cleanWord = rawWord.trim().toUpperCase();
    if (cleanWord.length !== this.settings.wordLength) {
      return { success: false, error: `Word must be ${this.settings.wordLength} letters.` };
    }

    const isMatch = cleanWord === target.secretWord.toUpperCase();

    if (isMatch) {
      // CORRECT GUESS: Eliminate target!
      target.isAlive = false;
      target.eliminatedBy = actor.id;

      // Base difficulty points + bonuses
      const basePoints = calculateDifficultyPoints(this.settings.difficulty);
      const isFirstAttempt = actor.remainingGuesses === this.settings.guessLimit;
      const pointsEarned = basePoints + (isFirstAttempt ? 15 : 0);
      actor.score += pointsEarned;

      // Fill target's pattern for confirmation to the guesser
      target.knownPattern = target.secretWord.split('');

      this.addLog(
        'WORD_GUESS',
        `${actor.name} named ${target.name}'s secret word. Correct. (+${pointsEarned} pts)`,
        actor.id,
        actor.name,
        target.id,
        target.name,
        true
      );

      this.addLog('ELIMINATION', `${target.name} has been eliminated by ${actor.name}.`, target.id, target.name);

      // Ring Reassignment: Reassign whoever was targeting this eliminated target
      this.handlePlayerEliminationOrLeave(target.id);

      // Check survivor condition
      const alivePlayers = Array.from(this.players.values()).filter((p) => p.isAlive);
      if (alivePlayers.length <= 1) {
        this.endGame(alivePlayers[0]);
        return { success: true };
      }
    } else {
      // INCORRECT GUESS: Deduct attempt and apply penalty
      actor.remainingGuesses = Math.max(0, actor.remainingGuesses - 1);
      actor.score = Math.max(0, actor.score - 5);

      this.addLog(
        'WORD_GUESS',
        `${actor.name} guessed '${cleanWord}' against ${target.name}. Incorrect. (-5 pts, ${actor.remainingGuesses} attempts left)`,
        actor.id,
        actor.name,
        target.id,
        target.name,
        false,
        undefined,
        undefined,
        cleanWord
      );
    }

    this.nextTurn();
    return { success: true };
  }

  private handlePlayerEliminationOrLeave(eliminatedId: string, eliminatedTargetId?: string): void {
    const eliminated = this.players.get(eliminatedId);
    const fallbackTargetId = eliminated?.assignedTargetId || eliminatedTargetId || '';

    // Find the player whose assigned target was this eliminated player
    for (const p of this.players.values()) {
      if (!p.isAlive || p.assignedTargetId !== eliminatedId) continue;

      // Reassign to the eliminated player's target, skipping dead players and
      // walking no further than the ring itself.
      let nextTargetId = fallbackTargetId;
      let candidate = this.players.get(nextTargetId);
      let hops = 0;

      while (
        candidate &&
        (!candidate.isAlive || candidate.id === p.id || candidate.id === eliminatedId) &&
        this.getAliveCount() > 1 &&
        hops < this.players.size + 1
      ) {
        nextTargetId = candidate.assignedTargetId;
        candidate = this.players.get(nextTargetId);
        hops++;
      }

      if (!candidate || !candidate.isAlive || candidate.id === p.id) {
        candidate = Array.from(this.players.values()).find(
          (other) => other.isAlive && other.id !== p.id
        );
      }

      if (candidate && candidate.isAlive && candidate.id !== p.id) {
        p.assignedTargetId = candidate.id;

        // Notes belong to the hunter, not the quarry. A new assignment starts
        // with a clean page so old intelligence cannot leak across the ring.
        p.knownPattern = Array(this.settings.wordLength).fill('_');
        p.testedLetters = {};
        candidate.knownPattern = Array(this.settings.wordLength).fill('_');
        candidate.testedLetters = {};

        this.addLog('SYSTEM', `${p.name} now hunts ${candidate.name}.`, p.id, p.name);
      }
    }
  }

  private handleTurnTimeout(): void {
    const currentId = this.turnPlayerOrder[this.activePlayerIndex];
    const player = this.players.get(currentId);
    if (player) {
      this.addLog('TIMEOUT', `${player.name}'s turn timed out. The turn passes.`, player.id, player.name);
    }
    this.nextTurn();
  }

  public nextTurn(): void {
    this.clearTurnTimer();
    if (this.phase !== 'IN_GAME') return;

    const aliveCount = this.getAliveCount();
    if (aliveCount <= 1) {
      const winner = Array.from(this.players.values()).find((p) => p.isAlive);
      this.endGame(winner);
      return;
    }

    // Advance to next alive player
    let attempts = 0;
    const total = this.turnPlayerOrder.length;
    do {
      this.activePlayerIndex = (this.activePlayerIndex + 1) % total;
      attempts++;
      const candidateId = this.turnPlayerOrder[this.activePlayerIndex];
      const candidate = this.players.get(candidateId);
      if (candidate && candidate.isAlive) {
        break;
      }
    } while (attempts < total * 2);

    this.startTurn();
  }

  private getAliveCount(): number {
    return Array.from(this.players.values()).filter((p) => p.isAlive).length;
  }

  public endGame(survivingWinner?: InternalPlayer): void {
    this.clearTurnTimer();
    this.phase = 'GAME_OVER';

    // Award survival bonus to last standing player
    if (survivingWinner) {
      survivingWinner.score += 20;
    }

    // Determine highest score or surviving winner
    const rankedPlayers = Array.from(this.players.values()).sort((a, b) => {
      if (a.isAlive !== b.isAlive) return a.isAlive ? -1 : 1;
      return b.score - a.score;
    });

    const champ = survivingWinner || rankedPlayers[0];
    if (champ) {
      this.winner = {
        id: champ.id,
        name: champ.name,
        score: champ.score
      };
      this.addLog('SYSTEM', `Match over. ${champ.name} takes the table with ${champ.score} points.`);
    }

    this.notifyState();
  }

  public restartGame(): void {
    this.phase = 'LOBBY';
    this.clearTurnTimer();
    this.winner = undefined;
    for (const p of this.players.values()) {
      p.isAlive = true;
      p.hasSubmittedWord = false;
      p.secretWord = '';
      p.score = 0;
      p.remainingGuesses = this.settings.guessLimit;
      p.knownPattern = Array(this.settings.wordLength).fill('_');
      p.testedLetters = {};
      delete p.eliminatedBy;
      delete p.eliminationRank;
    }
    this.addLog('SYSTEM', 'The table has reopened for a rematch.');
    this.notifyState();
  }

  private clearTurnTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    if (this.botTurnTimeout) {
      clearTimeout(this.botTurnTimeout);
      this.botTurnTimeout = null;
    }
  }

  private addLog(
    type: GameEventLog['type'],
    message: string,
    actorId: string = 'system',
    actorName: string = 'Game',
    targetId?: string,
    targetName?: string,
    success?: boolean,
    revealedPositions?: number[],
    letter?: string,
    guessedWord?: string
  ): void {
    const entry: GameEventLog = {
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
      type,
      message,
      actorId,
      actorName,
      targetId,
      targetName,
      success,
      revealedPositions,
      letter,
      guessedWord
    };
    this.eventLogs.push(entry);
    if (this.eventLogs.length > 50) {
      this.eventLogs.shift();
    }
  }

  private sanitizePlayer(p: InternalPlayer, includeIntel: boolean = false): PlayerPublicState {
    return {
      id: p.id,
      name: p.name,
      isHost: p.isHost,
      isBot: p.isBot,
      isAlive: p.isAlive,
      score: p.score,
      remainingGuesses: p.remainingGuesses,
      assignedTargetId: p.assignedTargetId,
      hasSubmittedWord: p.hasSubmittedWord,
      wordLength: this.settings.wordLength,
      // Intelligence belongs to one hunter. Public player records never carry
      // another player's pattern or tested letters; only the personal target
      // payload in GameManager may include it (and bots need it internally).
      knownPattern: includeIntel
        ? [...p.knownPattern]
        : Array(this.settings.wordLength).fill('_'),
      testedLetters: includeIntel ? { ...p.testedLetters } : {},
      eliminatedBy: p.eliminatedBy,
      eliminationRank: p.eliminationRank
    };
  }

  public getPublicState(): RoomState {
    const sanitizedPlayers = Array.from(this.players.values()).map((p) => this.sanitizePlayer(p));
    const activePlayerId = this.turnPlayerOrder[this.activePlayerIndex] || '';

    return {
      roomCode: this.roomCode,
      phase: this.phase,
      settings: this.settings,
      hostId: this.hostId,
      players: sanitizedPlayers,
      activePlayerIndex: this.activePlayerIndex,
      activePlayerId,
      round: this.round,
      turnTimeRemaining: this.turnTimeRemaining,
      winner: this.winner,
      eventLogs: [...this.eventLogs]
    };
  }

  public notifyState(): void {
    this.onStateChange(this.getPublicState());
  }
}

