import React, { useEffect, useRef, useState } from 'react';
import { useSocket } from './hooks/useSocket';
import { useSoundEffects } from './hooks/useSoundEffects';
import { Header } from './components/Header';
import { LobbyView } from './components/LobbyView';
import { WordPickModal } from './components/WordPickModal';
import { GameBoard } from './components/GameBoard';
import { GameOverModal } from './components/GameOverModal';
import { HowToPlay } from './components/HowToPlay';

export function App() {
  const {
    gameState,
    secondsRemaining,
    isConnected,
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
  } = useSocket();

  const [soundEnabled, setSoundEnabled] = useState(true);
  const sounds = useSoundEffects();
  const prevLogsLengthRef = useRef(0);
  const prevActivePlayerRef = useRef<string | null>(null);

  // Sound triggers on state changes. Refs are advanced even while muted so
  // unmuting never replays a backlog of events.
  useEffect(() => {
    if (!gameState) {
      prevActivePlayerRef.current = null;
      prevLogsLengthRef.current = 0;
      return;
    }

    const currentLogs = gameState.eventLogs;

    if (gameState.phase !== 'IN_GAME') {
      prevActivePlayerRef.current = null;
      prevLogsLengthRef.current = currentLogs.length;
      return;
    }

    const turnChanged =
      gameState.activePlayerId !== prevActivePlayerRef.current;
    const myTurn = gameState.activePlayerId === gameState.myId;
    const latest =
      currentLogs.length > prevLogsLengthRef.current
        ? currentLogs[currentLogs.length - 1]
        : undefined;

    if (soundEnabled) {
      if (turnChanged && myTurn) sounds.playTurn();

      if (latest) {
        if (latest.type === 'ELIMINATION') {
          sounds.playElimination();
        } else if (
          (latest.type === 'WORD_GUESS' || latest.type === 'LETTER_ASK') &&
          latest.success === true
        ) {
          sounds.playCorrect();
        } else if (
          (latest.type === 'WORD_GUESS' || latest.type === 'LETTER_ASK') &&
          latest.success === false
        ) {
          sounds.playWrong();
        }
      }
    }

    prevActivePlayerRef.current = gameState.activePlayerId;
    prevLogsLengthRef.current = currentLogs.length;
  }, [gameState, soundEnabled, sounds]);

  return (
    <div className="flex min-h-[100svh] flex-col">
      <a className="skip-link" href="#main-content">
        Skip to the table
      </a>

      <Header
        roomCode={gameState?.roomCode}
        isHost={gameState?.hostId === gameState?.myId}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((enabled) => !enabled)}
        playerCount={gameState?.players.length}
        maxPlayers={gameState?.settings.maxPlayers}
        isConnected={isConnected}
      />

      {!isConnected && gameState && (
        <div className="connection-banner" role="status" aria-live="polite">
          <div className="connection-banner-inner">
            <span
              className="status-dot status-dot--offline"
              aria-hidden="true"
            />
            Connection lost. Reconnecting to the table…
          </div>
        </div>
      )}

      <main id="main-content" className="flex-1">
        {!gameState || gameState.phase === 'LOBBY' ? (
          <LobbyView
            gameState={gameState}
            isConnected={isConnected}
            onJoinRoom={joinRoom}
            onCreateRoom={createRoom}
            onUpdateSettings={updateSettings}
            onAddBot={addBot}
            onRemoveBot={removeBot}
            onStartGame={startGame}
          />
        ) : gameState.phase === 'WORD_SELECTION' ? (
          <WordPickModal
            gameState={gameState}
            isConnected={isConnected}
            onSubmitSecretWord={submitSecretWord}
          />
        ) : (
          <>
            <GameBoard
              gameState={gameState}
              secondsRemaining={secondsRemaining}
              isConnected={isConnected}
              onAskLetter={askLetter}
              onGuessWord={guessWord}
            />

            {gameState.phase === 'GAME_OVER' && (
              <GameOverModal
                gameState={gameState}
                isConnected={isConnected}
                onRestartGame={restartGame}
              />
            )}
          </>
        )}
      </main>

      <footer className="mt-8 pb-12">
        <HowToPlay />
      </footer>
    </div>
  );
}

export default App;
