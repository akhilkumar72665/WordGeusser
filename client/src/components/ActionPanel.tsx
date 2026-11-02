import React, { useEffect, useState } from 'react';
import { ClientGameState } from '../types';

interface ActionPanelProps {
  gameState: ClientGameState;
  isConnected?: boolean;
  onAskLetter: (
    targetId: string,
    letter: string
  ) => Promise<{ success: boolean; error?: string }>;
  onGuessWord: (
    targetId: string,
    word: string
  ) => Promise<{ success: boolean; error?: string }>;
  selectedLetterFromBook?: string;
  onClearSelectedLetter?: () => void;
}

export const ActionPanel: React.FC<ActionPanelProps> = ({
  gameState,
  isConnected = true,
  onAskLetter,
  onGuessWord,
  selectedLetterFromBook,
  onClearSelectedLetter
}) => {
  const [activeTab, setActiveTab] = useState<'LETTER' | 'WORD'>('LETTER');
  const [letterInput, setLetterInput] = useState('');
  const [wordTargetId, setWordTargetId] = useState('');
  const [wordGuessInput, setWordGuessInput] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isMyTurn = gameState.activePlayerId === gameState.myId;
  const myPlayer = gameState.players.find(
    (player) => player.id === gameState.myId
  );
  const activePlayer = gameState.players.find(
    (player) => player.id === gameState.activePlayerId
  );
  const target = gameState.myAssignedTarget;
  const wordLength = gameState.settings.wordLength;
  const eligibleOpponents = gameState.players.filter(
    (player) => player.id !== gameState.myId && player.isAlive
  );

  useEffect(() => {
    if (selectedLetterFromBook) {
      setLetterInput(selectedLetterFromBook);
      setActiveTab('LETTER');
      setError(null);
      onClearSelectedLetter?.();
    }
  }, [selectedLetterFromBook, onClearSelectedLetter]);

  useEffect(() => {
    const stillEligible =
      !!wordTargetId &&
      eligibleOpponents.some((player) => player.id === wordTargetId);

    if (!stillEligible) {
      const fallback =
        target && target.isAlive
          ? target.id
          : eligibleOpponents[0]?.id ?? '';
      if (fallback !== wordTargetId) setWordTargetId(fallback);
    }
  }, [wordTargetId, target, eligibleOpponents]);

  if (!isMyTurn) {
    return (
      <section className="panel waiting-panel" aria-live="polite">
        <p className="screen-label">Please wait</p>
        <h2>{activePlayer?.name ?? 'The table'} is thinking.</h2>
        <p>
          The ring is quiet for a moment. Re-read the pattern, check your clue
          book, and be ready when the clock turns to you.
        </p>
      </section>
    );
  }

  const handleAskLetter = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!target) {
      setError('You have no quarry assigned yet.');
      return;
    }
    const letter = letterInput.trim().toUpperCase();
    if (!letter || letter.length !== 1 || !/^[A-Z]$/.test(letter)) {
      setError('Choose a single letter, A to Z.');
      return;
    }
    if (
      Object.prototype.hasOwnProperty.call(target.testedLetters ?? {}, letter)
    ) {
      setError(`The letter ${letter} has already been asked.`);
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const result = await onAskLetter(target.id, letter);
      if (!result.success) {
        setError(result.error || 'That question could not be asked.');
      } else {
        setLetterInput('');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuessWord = (event: React.FormEvent) => {
    event.preventDefault();
    if (!wordTargetId) {
      setError('Choose a rival to name.');
      return;
    }
    if (wordGuessInput.length !== wordLength) {
      setError(`A guess must be exactly ${wordLength} letters.`);
      return;
    }

    setError(null);
    setShowConfirmModal(true);
  };

  const confirmAndSendGuess = async () => {
    setShowConfirmModal(false);
    setError(null);
    setLoading(true);
    try {
      const result = await onGuessWord(wordTargetId, wordGuessInput);
      if (!result.success) {
        setError(result.error || 'That guess could not be made.');
      } else {
        setWordGuessInput('');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const remainingGuesses = myPlayer?.remainingGuesses ?? 0;
  const canGuess = remainingGuesses > 0 && eligibleOpponents.length > 0;

  return (
    <section
      className="panel action-panel is-turn"
      aria-labelledby="action-title"
    >
      <div className="action-head">
        <div>
          <p className="screen-label">Your turn</p>
          <h2 id="action-title" className="action-title">
            Make a move.
          </h2>
          <p className="action-note">
            One question or one word. Both end your turn.
          </p>
        </div>
      </div>

      <div className="tabs action-tabs" role="tablist" aria-label="Turn action">
        <button
          type="button"
          role="tab"
          id="tab-letter"
          className="tab"
          aria-selected={activeTab === 'LETTER'}
          aria-controls="panel-letter"
          onClick={() => {
            setActiveTab('LETTER');
            setError(null);
          }}
        >
          Ask a letter
        </button>
        <button
          type="button"
          role="tab"
          id="tab-word"
          className="tab"
          aria-selected={activeTab === 'WORD'}
          aria-controls="panel-word"
          onClick={() => {
            setActiveTab('WORD');
            setError(null);
          }}
        >
          Name the word
        </button>
      </div>

      {error && (
        <div className="form-error mt-5" role="alert">
          {error}
        </div>
      )}

      {activeTab === 'LETTER' ? (
        <div
          id="panel-letter"
          className="action-body"
          role="tabpanel"
          aria-labelledby="tab-letter"
        >
          <p className="action-helper">
            Ask <strong>{target?.name ?? 'your quarry'}</strong> whether a
            letter sits in their word. Every hit turns up all of its positions.
          </p>

          <form className="guess-form" onSubmit={handleAskLetter} noValidate>
            <div className="letter-row">
              <input
                className="letter-input"
                type="text"
                value={letterInput}
                onChange={(event) =>
                  setLetterInput(
                    event.target.value
                      .toUpperCase()
                      .replace(/[^A-Z]/g, '')
                      .slice(0, 1)
                  )
                }
                placeholder="A"
                maxLength={1}
                autoComplete="off"
                spellCheck={false}
                aria-label="Letter to ask"
                disabled={loading || !target}
              />
              <button
                type="submit"
                className="btn btn-ink btn-lg"
                disabled={loading || !letterInput || !target || !isConnected}
              >
                {loading ? 'Asking…' : `Ask ${target?.name ?? 'the table'}`}
              </button>
            </div>
            <p className="action-footnote">
              A question that misses still ends your turn. Choose deliberately.
            </p>
          </form>
        </div>
      ) : (
        <div
          id="panel-word"
          className="action-body"
          role="tabpanel"
          aria-labelledby="tab-word"
        >
          <p className="action-helper">
            Name <strong>{target?.name ?? 'a rival'}</strong>’s word to remove
            them from the ring. A wrong call costs one guess and five points.
          </p>

          {!canGuess ? (
            <p className="empty-state">
              {eligibleOpponents.length === 0
                ? 'There is no one left to name.'
                : 'You have used every word guess. Letters are all you have left.'}
            </p>
          ) : (
            <>
              <div className="danger-note">
                <div>
                  <strong>High stakes</strong>
                  A correct call ends their match. A wrong one is spent.
                </div>
                <div className="attempts">
                  <span className="attempts-value">
                    {remainingGuesses === 999 ? '∞' : remainingGuesses}
                  </span>
                  <span className="attempts-label">
                    {remainingGuesses === 999 ? 'unlimited' : 'guesses left'}
                  </span>
                </div>
              </div>

              <form className="guess-form" onSubmit={handleGuessWord} noValidate>
                <div>
                  <label className="field-label" htmlFor="guess-target">
                    Whose word?
                  </label>
                  <select
                    id="guess-target"
                    className="field select-field"
                    value={wordTargetId}
                    onChange={(event) => setWordTargetId(event.target.value)}
                    disabled={loading}
                  >
                    {eligibleOpponents.map((player) => (
                      <option key={player.id} value={player.id}>
                        {player.name}
                        {player.id === target?.id ? ' — your quarry' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="field-label" htmlFor="word-guess">
                    Your call ({wordLength} letters)
                  </label>
                  <input
                    id="word-guess"
                    className="word-input"
                    type="text"
                    value={wordGuessInput}
                    onChange={(event) =>
                      setWordGuessInput(
                        event.target.value
                          .toUpperCase()
                          .replace(/[^A-Z]/g, '')
                          .slice(0, wordLength)
                      )
                    }
                    placeholder={`${wordLength} LETTERS`}
                    autoComplete="off"
                    spellCheck={false}
                    disabled={loading}
                  />
                </div>

                {!showConfirmModal ? (
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg btn-block"
                    disabled={
                      loading ||
                      wordGuessInput.length !== wordLength ||
                      !wordTargetId ||
                      !isConnected
                    }
                  >
                    {loading ? 'Naming…' : 'Name the word'}
                  </button>
                ) : (
                  <div style={{
                    marginTop: '0.75rem',
                    padding: '1rem',
                    borderRadius: '8px',
                    border: '1px solid var(--accent)',
                    backgroundColor: 'var(--paper-deep)'
                  }}>
                    <p style={{ margin: '0 0 0.5rem 0', fontWeight: 600 }}>
                      Confirm Word Guess: <span style={{ color: 'var(--accent)', letterSpacing: '2px' }}>{wordGuessInput}</span> against {eligibleOpponents.find((p) => p.id === wordTargetId)?.name}?
                    </p>
                    <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', color: 'var(--ink-soft)' }}>
                      ⚠️ An incorrect guess will deduct 5 points and cost 1 attempt.
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => setShowConfirmModal(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={confirmAndSendGuess}
                        disabled={loading || !isConnected}
                      >
                        Yes, Confirm Guess
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </>
          )}
        </div>
      )}
    </section>
  );
};
