import React from 'react';
import { ClientGameState } from '../types';
import { initials } from '../lib/utils';

interface RingCarouselProps {
  gameState: ClientGameState;
}

export const RingCarousel: React.FC<RingCarouselProps> = ({ gameState }) => {
  const { players, activePlayerId, myId } = gameState;

  return (
    <section className="panel ring-panel" aria-labelledby="ring-title">
      <div className="ring-head">
        <h2 id="ring-title" className="ring-title">
          The table
        </h2>
        <span className="ring-note">
          Each player hunts one name in the ring.
        </span>
      </div>

      <div className="ring-track">
        {players.map((player) => {
          const isActive = player.id === activePlayerId;
          const isMe = player.id === myId;
          const target = players.find(
            (candidate) => candidate.id === player.assignedTargetId
          );

          return (
            <article
              key={player.id}
              className={`ring-player ${isActive ? 'is-active' : ''} ${
                !player.isAlive ? 'is-out' : ''
              }`}
              aria-label={`${player.name}, ${player.score} points${
                isActive ? ', on the clock' : ''
              }${!player.isAlive ? ', eliminated' : ''}`}
            >
              {isActive && (
                <span className="ring-tag">On the clock</span>
              )}
              {!isActive && !player.isAlive && (
                <span className="ring-tag">Out</span>
              )}
              {!isActive && player.isAlive && isMe && (
                <span className="ring-tag">Your seat</span>
              )}

              <div className="ring-person">
                <span className="ring-avatar" aria-hidden="true">
                  {player.isBot ? 'AI' : initials(player.name)}
                </span>
                <span>
                  <span className="ring-name">
                    {player.name}
                    {isMe ? ' · you' : ''}
                  </span>
                  <span className="ring-score">
                    {player.score} pts
                    {player.isBot ? ' · bot' : ''}
                  </span>
                </span>
              </div>

              <p className="ring-target">
                Hunts <strong>{target ? target.name : 'no one'}</strong>
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
};
