import React, { useState } from 'react';
import { RingCarousel } from './RingCarousel';
import { TargetSpotlight } from './TargetSpotlight';
import { ClueBook } from './ClueBook';
import { ActionPanel } from './ActionPanel';
import { Leaderboard } from './Leaderboard';
import { ClientGameState } from '../types';
import { formatSeconds, pluralize } from '../lib/utils';

interface GameBoardProps {
  gameState: ClientGameState;
  secondsRemaining: number | null;
  isConnected?: boolean;
  onAskLetter: (
    targetId: string,
    letter: string
  ) => Promise<{ success: boolean; error?: string }>;
  onGuessWord: (
    targetId: string,
    word: string
  ) => Promise<{ success: boolean; error?: string }>;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  gameState,
  secondsRemaining,
  isConnected = true,
  onAskLetter,
  onGuessWord
}) => {
  const [selectedLetter, setSelectedLetter] = useState<string | undefined>();
  const {
    players,
    activePlayerId,
    myId,
    myAssignedTarget,
    settings,
    round
  } = gameState;

  const isMyTurn = activePlayerId === myId;
  const activePlayer = players.find((player) => player.id === activePlayerId);
  const myPlayer = players.find((player) => player.id === myId);
  const target = myAssignedTarget;
  const aliveCount = players.filter((player) => player.isAlive).length;
  const hasClock = settings.turnTimeLimit > 0 && secondsRemaining !== null;
  const isLow =
    hasClock && secondsRemaining !== null && secondsRemaining <= 10;
  const clockPercentage =
    hasClock && secondsRemaining !== null
      ? Math.max(
          0,
          Math.min(100, (secondsRemaining / settings.turnTimeLimit) * 100)
        )
      : 0;

  let title = 'The table is quiet.';
  if (!myPlayer?.isAlive) {
    title = 'You are out of the ring.';
  } else if (isMyTurn) {
    title = 'Your move.';
  } else if (activePlayer) {
    title = `${activePlayer.name} is on the clock.`;
  }

  let subtitle: string;
  if (!myPlayer?.isAlive) {
    subtitle = `${activePlayer?.name ?? 'The table'} plays on. Watch the patterns and wait for the rematch.`;
  } else if (isMyTurn) {
    subtitle = target
      ? `You are probing ${target.name}. Ask for a letter, or spend a word guess while you still can.`
      : 'Ask for a letter, or spend a word guess while you still can.';
  } else {
    subtitle = target
      ? `You are probing ${target.name}. Watch ${activePlayer?.name ?? 'the table'} and keep your notes close.`
      : `Watch ${activePlayer?.name ?? 'the table'} and keep your notes close.`;
  }

  const guessesRemaining = myPlayer?.remainingGuesses ?? 0;
  const guessSummary =
    guessesRemaining === 999
      ? 'Unlimited word guesses'
      : `${guessesRemaining} ${pluralize(
          guessesRemaining,
          'word guess',
          'word guesses'
        )} left`;

  return (
    <div className="game-page page-shell">
      <div className="game-head">
        <div className="game-head-main">
          <p className="screen-label">
            Table {gameState.roomCode} · Round {round} · {aliveCount}{' '}
            {pluralize(aliveCount, 'player')} in the ring
          </p>
          <h1 className="game-title">{title}</h1>
          <p className="game-sub">
            {subtitle}{' '}
            {myPlayer?.isAlive && <span className="muted">· {guessSummary}</span>}
          </p>
        </div>

        <div
          className={`clock ${isLow ? 'is-low' : ''}`}
          aria-label={
            hasClock
              ? `${secondsRemaining} seconds remaining on the turn clock`
              : 'No turn clock'
          }
        >
          {hasClock && secondsRemaining !== null ? (
            <>
              <div className="clock-top">
                <span className="clock-label">Turn clock</span>
                <span className="clock-label">
                  {isMyTurn ? 'Yours' : activePlayer?.name ?? ''}
                </span>
              </div>
              <div className="clock-value">
                {formatSeconds(secondsRemaining)}
                <span className="clock-unit">sec</span>
              </div>
              <div
                className="clock-track"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={settings.turnTimeLimit}
                aria-valuenow={Math.max(0, secondsRemaining)}
                aria-label="Turn clock"
              >
                <div
                  className="clock-fill"
                  style={{ width: `${clockPercentage}%` }}
                />
              </div>
            </>
          ) : (
            <p className="clock-off">
              No clock on this table.
              <br />
              Take your time.
            </p>
          )}
        </div>
      </div>

      <RingCarousel gameState={gameState} />

      <div className="game-grid">
        <div className="game-main">
          <TargetSpotlight
            target={target}
            wordLength={settings.wordLength}
            remainingGuesses={myPlayer?.remainingGuesses}
          />

          <ActionPanel
            gameState={gameState}
            isConnected={isConnected}
            onAskLetter={onAskLetter}
            onGuessWord={onGuessWord}
            selectedLetterFromBook={selectedLetter}
            onClearSelectedLetter={() => setSelectedLetter(undefined)}
          />

          <ClueBook
            target={target}
            wordLength={settings.wordLength}
            eventLogs={gameState.eventLogs}
            onQuickLetterSelect={(letter) => setSelectedLetter(letter)}
            isMyTurn={isMyTurn}
          />
        </div>

        <aside className="game-side" aria-label="Match details">
          <Leaderboard gameState={gameState} />
        </aside>
      </div>
    </div>
  );
};
