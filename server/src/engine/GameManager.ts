import { Room, StateChangeCallback } from './Room';
import { ClientGameState, RoomState } from '../../../shared/types';
import { Server, Socket } from 'socket.io';

export class GameManager {
  private rooms: Map<string, Room> = new Map();
  private socketToRoom: Map<string, string> = new Map(); // socket.id -> roomCode
  private io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  public generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    do {
      code = '';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    } while (this.rooms.has(code));
    return code;
  }

  public createRoom(hostSocketId: string, hostName: string): Room {
    const code = this.generateRoomCode();
    const room = new Room(code, hostSocketId, hostName, (state: RoomState) => {
      this.broadcastRoomState(code, state);
    });

    room.setTimerTickCallback((seconds) => {
      this.io.to(code).emit('timer_tick', { secondsRemaining: seconds });
    });

    this.rooms.set(code, room);
    this.socketToRoom.set(hostSocketId, code);

    return room;
  }

  public getRoom(roomCode: string): Room | undefined {
    return this.rooms.get(roomCode.toUpperCase());
  }

  public getRoomBySocket(socketId: string): Room | undefined {
    const code = this.socketToRoom.get(socketId);
    if (!code) return undefined;
    return this.rooms.get(code);
  }

  public joinRoom(roomCode: string, socketId: string, playerName: string): { success: boolean; room?: Room; error?: string } {
    const room = this.getRoom(roomCode);
    if (!room) {
      return { success: false, error: 'Room code not found.' };
    }

    const added = room.addPlayer(socketId, playerName, false, false);
    if (!added) {
      return { success: false, error: 'Could not join room. Game may be full or in progress.' };
    }

    this.socketToRoom.set(socketId, room.roomCode);
    return { success: true, room };
  }

  public handleDisconnect(socketId: string): void {
    const code = this.socketToRoom.get(socketId);
    if (!code) return;

    this.socketToRoom.delete(socketId);
    const room = this.rooms.get(code);
    if (room) {
      room.removePlayer(socketId);
      if (room.players.size === 0) {
        this.rooms.delete(code);
      }
    }
  }

  public broadcastRoomState(roomCode: string, state: RoomState): void {
    const room = this.rooms.get(roomCode);
    if (!room) return;

    // Send personalized state to each connected player
    for (const [playerId, player] of room.players.entries()) {
      if (player.isBot) continue;

      const target = player.assignedTargetId ? room.players.get(player.assignedTargetId) : undefined;
      const clientState: ClientGameState = {
        ...state,
        myId: playerId,
        mySecretWord: player.secretWord,
        myAssignedTarget: target
          ? {
              id: target.id,
              name: target.name,
              isHost: target.isHost,
              isBot: target.isBot,
              isAlive: target.isAlive,
              score: target.score,
              remainingGuesses: target.remainingGuesses,
              assignedTargetId: target.assignedTargetId,
              hasSubmittedWord: target.hasSubmittedWord,
              wordLength: target.knownPattern.length,
              knownPattern: target.knownPattern,
              testedLetters: target.testedLetters,
              eliminatedBy: target.eliminatedBy,
              eliminationRank: target.eliminationRank
            }
          : undefined,
        myTargetPattern: target ? target.knownPattern : undefined,
        myTargetTestedLetters: target ? target.testedLetters : undefined
      };

      this.io.to(playerId).emit('room_state_updated', clientState);
    }
  }
}

