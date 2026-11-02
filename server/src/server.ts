import express from 'express';
import http from 'http';
import path from 'path';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import { GameManager } from './engine/GameManager';
import { getRandomWordByConfig } from './data/dictionary';
import {
  CreateRoomPayload,
  JoinRoomPayload,
  UpdateSettingsPayload,
  AddBotPayload,
  SubmitWordPayload,
  AskLetterPayload,
  GuessWordPayload,
  Difficulty
} from '../../shared/types';

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const gameManager = new GameManager(io);

// HTTP Endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.get('/api/words/random', (req, res) => {
  const rawLength = parseInt(req.query.length as string) || 5;
  const length = Math.min(10, Math.max(3, rawLength));
  const difficulty = (req.query.difficulty as Difficulty) || 'medium';
  const word = getRandomWordByConfig(length, difficulty);
  res.json({ word });
});

// Socket.io handlers
io.on('connection', (socket: Socket) => {
  console.log(`[Socket] Connected: ${socket.id}`);

  // Create Room
  socket.on('create_room', (payload: CreateRoomPayload, callback) => {
    try {
      const room = gameManager.createRoom(socket.id, payload.playerName || 'Host Player');
      socket.join(room.roomCode);
      if (typeof callback === 'function') {
        callback({ success: true, roomCode: room.roomCode });
      }
      room.notifyState();
    } catch (err: any) {
      if (typeof callback === 'function') {
        callback({ success: false, error: err.message });
      }
    }
  });

  // Join Room
  socket.on('join_room', (payload: JoinRoomPayload, callback) => {
    try {
      const result = gameManager.joinRoom(payload.roomCode, socket.id, payload.playerName || 'Player');
      if (result.success && result.room) {
        socket.join(result.room.roomCode);
        if (typeof callback === 'function') {
          callback({ success: true, roomCode: result.room.roomCode });
        }
        result.room.notifyState();
      } else {
        if (typeof callback === 'function') {
          callback({ success: false, error: result.error });
        }
      }
    } catch (err: any) {
      if (typeof callback === 'function') {
        callback({ success: false, error: err.message });
      }
    }
  });

  // Update Settings
  socket.on('update_settings', (payload: UpdateSettingsPayload) => {
    const room = gameManager.getRoomBySocket(socket.id);
    if (room && room.hostId === socket.id) {
      room.updateSettings(payload.settings);
    }
  });

  // Add Bot
  socket.on('add_bot', (payload: AddBotPayload) => {
    const room = gameManager.getRoomBySocket(socket.id);
    if (room && room.hostId === socket.id) {
      room.addBot(payload?.difficulty);
    }
  });

  // Remove Bot
  socket.on('remove_bot', (botId: string) => {
    const room = gameManager.getRoomBySocket(socket.id);
    if (room && room.hostId === socket.id) {
      room.removeBot(botId);
    }
  });

  // Start Game
  socket.on('start_game', (callback) => {
    const room = gameManager.getRoomBySocket(socket.id);
    if (!room) {
      if (typeof callback === 'function') callback({ success: false, error: 'Room not found' });
      return;
    }
    if (room.hostId !== socket.id) {
      if (typeof callback === 'function') callback({ success: false, error: 'Only the host can start the game.' });
      return;
    }

    const res = room.startGame();
    if (typeof callback === 'function') callback(res);
  });

  // Submit Secret Word
  socket.on('submit_secret_word', (payload: SubmitWordPayload, callback) => {
    const room = gameManager.getRoomBySocket(socket.id);
    if (!room) {
      if (typeof callback === 'function') callback({ success: false, error: 'Room not found' });
      return;
    }
    const res = room.submitSecretWord(socket.id, payload.word);
    if (typeof callback === 'function') callback(res);
  });

  // Ask Letter
  socket.on('ask_letter', (payload: AskLetterPayload, callback) => {
    const room = gameManager.getRoomBySocket(socket.id);
    if (!room) {
      if (typeof callback === 'function') callback({ success: false, error: 'Room not found' });
      return;
    }
    const res = room.askLetter(socket.id, payload.targetId, payload.letter);
    if (typeof callback === 'function') callback(res);
  });

  // Guess Word
  socket.on('guess_word', (payload: GuessWordPayload, callback) => {
    const room = gameManager.getRoomBySocket(socket.id);
    if (!room) {
      if (typeof callback === 'function') callback({ success: false, error: 'Room not found' });
      return;
    }
    const res = room.guessWord(socket.id, payload.targetId, payload.word);
    if (typeof callback === 'function') callback(res);
  });

  // Restart Game / Rematch
  socket.on('restart_game', () => {
    const room = gameManager.getRoomBySocket(socket.id);
    if (room && room.hostId === socket.id) {
      room.restartGame();
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`[Socket] Disconnected: ${socket.id}`);
    gameManager.handleDisconnect(socket.id);
  });
});

// Serve frontend production build if available
const clientDist = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDist));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
    return next();
  }
  res.sendFile(path.join(clientDist, 'index.html'), (err) => {
    if (err) {
      res.status(200).send('Wordguesser API running. Build the frontend at client/dist.');
    }
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Wordguesser server listening on http://localhost:${PORT}`);
});

