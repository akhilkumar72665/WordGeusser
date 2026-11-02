import React from 'react';
import { PlayerPublicState, GameEventLog } from '../types';
import { cleanEventText, formatEventTime } from '../lib/utils';

interface ClueBookProps {
  target?: PlayerPublicState;
  wordLength: number;
  eventLogs: GameEventLog[];
  onQuickLetterSelect?: (letter: string) => void;
  isMyTurn: boolean;
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export const ClueBook: React.FC<ClueBookProps> = ({
  target,
  wordLength,
  eventLogs,
  onQuickLetterSelect,
  isMyTurn
}) => {
  if (!target) return null;

  const testedLetters = target.testedLetters ?? {};
  const targetLogs = eventLogs.filter(
    (log) =>
      log.targetId === target.id &&
      (log.type === 'LETTER_ASK' || log.type === 'WORD_GUESS')
  );
  const testedCount = Object.keys(testedLetters).length;
  const patternKnown = (target.knownPattern ?? []).filter(
    (letter) => letter !== '_' && letter !== ''
  ).length;

  return (
    <section className="panel clue-panel" aria-labelledby="clue-title">
      <div className="panel-head">
        <div>
          <h2 id="clue-title" className="panel-title">
            The clue book
          </h2>
          <p className="small muted mt-1">
            {testedCount} tested · {patternKnown} of {wordLength} letters known
          </p>
        </div>
        <p className="panel-note">
          Notes on <strong>{target.name}</strong>
        </p>
      </div>

      <div className="clue-grid">
        <div>
          <div className="legend">
            <span className="legend-item">
              <span
                className="legend-mark legend-mark--present"
                aria-hidden="true"
              />
              Present
            </span>
            <span className="legend-item">
              <span
                className="legend-mark legend-mark--absent"
                aria-hidden="true"
              />
              Absent
            </span>
            <span className="legend-item">
              <span
                className="legend-mark legend-mark--untried"
                aria-hidden="true"
              />
              Untried
            </span>
          </div>

          <div className="alphabet-grid">
            {ALPHABET.map((letter) => {
              const isTested = Object.prototype.hasOwnProperty.call(
                testedLetters,
                letter
              );
              const isPresent = testedLetters[letter] === true;
              const isAbsent = testedLetters[letter] === false;
              const canAsk = isMyTurn && !isTested;

              return (
                <button
                  key={letter}
                  type="button"
                  className={`key ${isPresent ? 'key-present' : ''} ${
                    isAbsent ? 'key-absent' : ''
                  }`}
                  disabled={!canAsk}
                  onClick={() => onQuickLetterSelect?.(letter)}
                  aria-label={
                    isPresent
                      ? `${letter} is present in the word`
                      : isAbsent
                        ? `${letter} is absent from the word`
                        : canAsk
                          ? `Ask for the letter ${letter}`
                          : `${letter} has not been tested`
                  }
                  title={
                    isPresent
                      ? `${letter} is present`
                      : isAbsent
                        ? `${letter} is absent`
                        : canAsk
                          ? `Ask for ${letter}`
                          : `${letter} has not been tested`
                  }
                >
                  <span aria-hidden="true">{letter}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="log-block">
          <div className="log-heading">
            <h3 className="log-title">Question log</h3>
            <span className="log-count">
              {targetLogs.length} {targetLogs.length === 1 ? 'entry' : 'entries'}
            </span>
          </div>

          {targetLogs.length === 0 ? (
            <p className="empty-state">
              Nothing asked of {target.name} yet. Pick a letter to begin.
            </p>
          ) : (
            <div className="log-list">
              {targetLogs
                .slice(-7)
                .reverse()
                .map((log) => (
                  <div className="log-item" key={log.id}>
                    <span
                      className={`log-marker ${
                        log.success ? 'log-marker--good' : 'log-marker--bad'
                      }`}
                      aria-hidden="true"
                    />
                    <div>
                      <p className="log-text">{cleanEventText(log.message)}</p>
                      <time
                        className="log-time"
                        dateTime={new Date(log.timestamp).toISOString()}
                      >
                        {formatEventTime(log.timestamp)}
                      </time>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
