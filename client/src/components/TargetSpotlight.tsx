import React from 'react';
import { PlayerPublicState } from '../types';
import { pluralize } from '../lib/utils';

interface TargetSpotlightProps {
  target?: PlayerPublicState;
  wordLength: number;
  remainingGuesses?: number;
}

export const TargetSpotlight: React.FC<TargetSpotlightProps> = ({
  target,
  wordLength,
  remainingGuesses
}) => {
  if (!target) {
    return (
      <section className="panel target-panel" aria-labelledby="target-title">
        <div className="target-empty">
          <p className="screen-label">Your quarry</p>
          <h2 id="target-title">No target yet.</h2>
          <p>
            The ring is still being set. Your quarry will appear once every
            word has been sealed.
          </p>
        </div>
      </section>
    );
  }

  const pattern =
    target.knownPattern && target.knownPattern.length > 0
      ? target.knownPattern
      : Array(wordLength).fill('_');
  const unknownCount = pattern.filter((letter) => letter === '_').length;
  const knownCount = pattern.length - unknownCount;
  const testedCount = Object.keys(target.testedLetters ?? {}).length;

  return (
    <section className="panel target-panel" aria-labelledby="target-title">
      <div className="target-head">
        <div>
          <p className="screen-label">Your quarry</p>
          <h2 id="target-title" className="target-name">
            {target.name}
          </h2>
        </div>

        <div className="metric">
          <div className="metric-value">{unknownCount}</div>
          <div className="metric-label">
            {pluralize(unknownCount, 'letter')} still unknown
          </div>
        </div>
      </div>

      <div className="pattern-block">
        <div className="pattern-label">
          <span>The word so far</span>
          <span>
            {knownCount} of {pattern.length} letters uncovered
          </span>
        </div>

        <div
          className="pattern"
          style={{ '--tile-count': pattern.length } as React.CSSProperties}
        >
          {pattern.map((letter, index) => {
            const known = letter !== '_' && letter !== '';
            return (
              <div
                key={index}
                className={`tile ${known ? 'tile-known' : 'tile-empty'}`}
                role="img"
                aria-label={`Letter ${index + 1}: ${
                  known ? letter : 'unknown'
                }`}
              >
                <span aria-hidden="true">{known ? letter : '?'}</span>
                <span className="tile-index" aria-hidden="true">
                  {index + 1}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="target-foot">
        <span>
          Word guesses left: <strong>{remainingGuesses ?? target.remainingGuesses}</strong>
        </span>
        <span>
          {testedCount} {pluralize(testedCount, 'letter')} tested · their score: {target.score}
        </span>
      </div>
    </section>
  );
};
