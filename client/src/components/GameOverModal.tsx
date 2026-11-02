import React, { useEffect, useRef } from 'react';
import { ClientGameState } from '../types';
import { ordinal } from '../lib/utils';

interface GameOverModalProps {
  gameState: ClientGameState;
  isConnected?: boolean;
  onRestartGame: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  gameState,
  isConnected = true,
  onRestartGame
}) => {
  const { winner, players, hostId, myId, round } = gameState;
  const isHost = hostId === myId;
  const panelRef = useRef<HTMLDivElement>(null);

  const ranked = [...players].sort((a, b) => {
    if (winner) {
      if (a.id === winner.id) return -1;
      if (b.id === winner.id) return 1;
    }
    return b.score - a.score;
  });
  const myPlayer = players.find((player) => player.id === myId);
  const myRank = ranked.findIndex((player) => player.id === myId) + 1;
  const isWinner = !!winner && winner.id === myId;

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab') return;

    const panel = panelRef.current;
    if (!panel) return;

    const focusable = panel.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) {
      event.preventDefault();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const title = !winner
    ? 'The table is closed.'
    : isWinner
      ? 'The table is yours.'
      : `${winner.name} takes the table.`;

  return (
    <div className="game-over-backdrop">
      <div
        ref={panelRef}
        className="game-over-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="game-over-title"
        aria-describedby="game-over-sub"
        tabIndex={-1}
        onKeyDown={handleKeyDown}
      >
        <div className="game-over-hero">
          <p className="game-over-label">Match over · Round {round}</p>
          <h2 id="game-over-title" className="game-over-title">
            {title}
          </h2>
          <p id="game-over-sub" className="game-over-sub">
            {winner ? (
              <>
                <strong>{winner.name}</strong> finishes with{' '}
                <strong>{winner.score} points</strong>.{' '}
                {isWinner
                  ? 'A clean read of the table.'
                  : myPlayer
                    ? `You finish ${ordinal(myRank)} with ${myPlayer.score} points.`
                    : ''}
              </>
            ) : (
              'The match ended without a champion. The table is resetting.'
            )}
          </p>
        </div>

        <div className="game-over-body">
          <h3 className="final-title">Final standings</h3>
          <ol className="final-list">
            {ranked.map((player, index) => (
              <li
                key={player.id}
                className={`final-row ${
                  winner && player.id === winner.id ? 'is-winner' : ''
                }`}
              >
                <span className="final-rank">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="final-name">
                  {player.name}
                  {player.id === myId ? ' · you' : ''}
                  {winner && player.id === winner.id ? ' · winner' : ''}
                </span>
                <span className="final-score">{player.score}</span>
              </li>
            ))}
          </ol>

          <div className="game-over-foot">
            {isHost ? (
              <>
                <button
                  type="button"
                  className="btn btn-primary btn-lg btn-block"
                  onClick={onRestartGame}
                  disabled={!isConnected}
                >
                  Return to the lobby
                </button>
                <p className="game-over-note">
                  A rematch keeps the same guests and clears the scores.
                </p>
              </>
            ) : (
              <p className="game-over-note">
                The host can call a rematch. This table will reopen shortly.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
