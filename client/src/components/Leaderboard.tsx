import React from 'react';
import { ClientGameState } from '../types';
import { cleanEventText, formatEventTime } from '../lib/utils';

interface LeaderboardProps {
  gameState: ClientGameState;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ gameState }) => {
  const { players, eventLogs, mySecretWord, myId } = gameState;
  const myPlayer = players.find((player) => player.id === myId);

  const ranked = [...players].sort((a, b) => {
    if (a.isAlive !== b.isAlive) return a.isAlive ? -1 : 1;
    return b.score - a.score;
  });

  const recentLogs = eventLogs.slice(-12).reverse();

  const markerTone = (type: string, success?: boolean) => {
    if (type === 'ELIMINATION') return 'feed-marker--bad';
    if (type === 'WORD_GUESS' || type === 'LETTER_ASK') {
      return success ? 'feed-marker--good' : 'feed-marker--bad';
    }
    if (type === 'TIMEOUT') return 'feed-marker--alert';
    return '';
  };

  return (
    <>
      {mySecretWord && (
        <section className="word-vault" aria-labelledby="vault-title">
          <div className="vault-head">
            <span id="vault-title" className="vault-label">
              Your secret word
            </span>
            <span className="vault-score">{myPlayer?.score ?? 0} pts</span>
          </div>
          <div
            className="vault-tiles"
            style={
              {
                '--tile-count': mySecretWord.length
              } as React.CSSProperties
            }
            aria-label={`Your secret word: ${mySecretWord
              .split('')
              .join(' ')}.`}
          >
            {mySecretWord.split('').map((letter, index) => (
              <span key={`${letter}-${index}`} className="vault-tile" aria-hidden="true">
                {letter}
              </span>
            ))}
          </div>
          <p className="vault-note">
            If a rival names this word, you leave the table.
          </p>
        </section>
      )}

      <section className="panel side-panel" aria-labelledby="standings-title">
        <div className="side-head">
          <h2 id="standings-title" className="side-title">
            Standings
          </h2>
          <span className="side-note">Alive first, then score</span>
        </div>

        <ol className="standings">
          {ranked.map((player, index) => (
            <li
              key={player.id}
              className={`standing-row ${
                player.id === myId ? 'is-me' : ''
              } ${!player.isAlive ? 'is-out' : ''}`}
            >
              <span className="standing-rank">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="standing-main">
                <span className="standing-name">{player.name}</span>
                {player.id === myId && (
                  <span className="standing-you">you</span>
                )}
              </span>
              <span className="standing-score">{player.score}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="panel side-panel" aria-labelledby="feed-title">
        <div className="side-head">
          <h2 id="feed-title" className="side-title">
            Table talk
          </h2>
          <span className="side-note">Latest first</span>
        </div>

        {recentLogs.length === 0 ? (
          <p className="empty-state">
            The table is quiet. The first question will appear here.
          </p>
        ) : (
          <ol className="feed-list">
            {recentLogs.map((log) => (
              <li className="feed-item" key={log.id}>
                <time
                  className="feed-time"
                  dateTime={new Date(log.timestamp).toISOString()}
                >
                  {formatEventTime(log.timestamp)}
                </time>
                <span
                  className={`feed-marker ${markerTone(
                    log.type,
                    log.success
                  )}`}
                  aria-hidden="true"
                />
                <p className="feed-text">{cleanEventText(log.message)}</p>
              </li>
            ))}
          </ol>
        )}
      </section>
    </>
  );
};
