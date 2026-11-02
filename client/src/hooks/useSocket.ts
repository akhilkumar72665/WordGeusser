import { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  ClientGameState,
  CreateRoomPayload,
  JoinRoomPayload,
  UpdateSettingsPayload,
  AddBotPayload,
  SubmitWordPayload,
  AskLetterPayload,
  GuessWordPayload
} from '../types';

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [gameState, setGameState] = useState<ClientGameState | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    // In dev with Vite proxy, connecting to current origin or :4000 works seamlessly
    const socketInstance = io(window.location.hostname === 'localhost' ? 'http://localhost:4000' : '/', {
      transports: ['websocket', 'polling']
    });

    socketInstance.on('connect', () => {
      console.log('Connected to server with socket ID:', socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    socketInstance.on('room_state_updated', (state: ClientGameState) => {
      setGameState(state);
      setSecondsRemaining(state.turnTimeRemaining);
    });

    socketInstance.on('timer_tick', ({ secondsRemaining }: { secondsRemaining: number }) => {
      setSecondsRemaining(secondsRemaining);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const createRoom = useCallback(
    (playerName: string): Promise<{ success: boolean; roomCode?: string; error?: string }> => {
      return new Promise((resolve) => {
        if (!socket) return resolve({ success: false, error: 'Socket not connected' });
        socket.emit('create_room', { playerName }, (res: any) => resolve(res));
      });
    },
    [socket]
  );

  const joinRoom = useCallback(
    (roomCode: string, playerName: string): Promise<{ success: boolean; roomCode?: string; error?: string }> => {
      return new Promise((resolve) => {
        if (!socket) return resolve({ success: false, error: 'Socket not connected' });
        socket.emit('join_room', { roomCode, playerName }, (res: any) => resolve(res));
      });
    },
    [socket]
  );

  const updateSettings = useCallback(
    (settings: UpdateSettingsPayload['settings']) => {
      if (socket) socket.emit('update_settings', { settings });
    },
    [socket]
  );

  const addBot = useCallback(
    (difficulty?: any) => {
      if (socket) socket.emit('add_bot', { difficulty });
    },
    [socket]
  );

  const removeBot = useCallback(
    (botId: string) => {
      if (socket) socket.emit('remove_bot', botId);
    },
    [socket]
  );

  const startGame = useCallback((): Promise<{ success: boolean; error?: string }> => {
    return new Promise((resolve) => {
      if (!socket) return resolve({ success: false, error: 'Socket not connected' });
      socket.emit('start_game', (res: any) => resolve(res));
    });
  }, [socket]);

  const submitSecretWord = useCallback(
    (word: string, isCustom?: boolean): Promise<{ success: boolean; error?: string; canBeCustom?: boolean }> => {
      return new Promise((resolve) => {
        if (!socket) return resolve({ success: false, error: 'Socket not connected' });
        socket.emit('submit_secret_word', { word, isCustom }, (res: any) => resolve(res));
      });
    },
    [socket]
  );

  const askLetter = useCallback(
    (targetId: string, letter: string): Promise<{ success: boolean; error?: string }> => {
      return new Promise((resolve) => {
        if (!socket) return resolve({ success: false, error: 'Socket not connected' });
        socket.emit('ask_letter', { targetId, letter }, (res: any) => resolve(res));
      });
    },
    [socket]
  );

  const guessWord = useCallback(
    (targetId: string, word: string): Promise<{ success: boolean; error?: string }> => {
      return new Promise((resolve) => {
        if (!socket) return resolve({ success: false, error: 'Socket not connected' });
        socket.emit('guess_word', { targetId, word }, (res: any) => resolve(res));
      });
    },
    [socket]
  );

  const restartGame = useCallback(() => {
    if (socket) socket.emit('restart_game');
  }, [socket]);

  return {
    socket,
    isConnected,
    gameState,
    secondsRemaining,
    errorMsg,
    setErrorMsg,
    createRoom,
    joinRoom,
    updateSettings,
    addBot,
    removeBot,
    startGame,
    submitSecretWord,
    askLetter,
    guessWord,
    restartGame
  };
}

