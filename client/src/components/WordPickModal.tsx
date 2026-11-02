import React, { useState } from 'react';
import { ClientGameState } from '../types';
import { pluralize } from '../lib/utils';

interface WordPickModalProps {
  gameState: ClientGameState;
  isConnected?: boolean;
  onSubmitSecretWord: (
    word: string,
    isCustom?: boolean
  ) => Promise<{ success: boolean; error?: string; canBeCustom?: boolean }>;
}

export const WordPickModal: React.FC<WordPickModalProps> = ({
  gameState,
  isConnected = true,
  onSubmitSecretWord
}) => {
  const [wordInput, setWordInput] = useState('');
  const [randomLoading, setRandomLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canBeCustom, setCanBeCustom] = useState(false);

  const wordLength = gameState.settings.wordLength;
  const myPlayer = gameState.players.find(
    (player) => player.id === gameState.myId
  );
  const myWord = (gameState.mySecretWord || wordInput).toUpperCase();
  const hasSubmitted = !!myPlayer?.hasSubmittedWord || !!gameState.mySecretWord;
  const waitingCount = gameState.players.filter(
    (player) => !player.hasSubmittedWord
  ).length;
  const submittedCount = gameState.players.length - waitingCount;

  const handleSubmit = async (
    event: React.FormEvent,
    forceCustom: boolean = false
  ) => {
    event.preventDefault();
    if (wordInput.length !== wordLength) {
      setError(`A word of exactly ${wordLength} letters, please.`);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const result = await onSubmitSecretWord(wordInput.toUpperCase(), forceCustom);
      if (!result.success) {
        setError(result.error || 'That word could not be sealed.');
        setCanBeCustom(!!result.canBeCustom);
      } else {
        setCanBeCustom(false);
      }
    } catch {
      setError('Something went wrong while sealing the word.');
    } finally {
      setLoading(false);
    }
  };

  const suggestWord = async () => {
    setRandomLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/words/random?length=${wordLength}&difficulty=${gameState.settings.difficulty}`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.word) {
          setWordInput(String(data.word).toUpperCase());
        }
      } else {
        setError('No suggestion could be fetched. Try another word.');
      }
    } catch {
      setError('No suggestion could be fetched. Try another word.');
    } finally {
      setRandomLoading(false);
    }
  };

  const difficultyLabel =
    gameState.settings.difficulty.charAt(0).toUpperCase() +
    gameState.settings.difficulty.slice(1);

  return (
    <div className="wordpick-page page-shell">
      <div className="wordpick-grid">
        <section className="wordpick-copy" aria-labelledby="wordpick-title">
          <p className="screen-label">
            Word selection · Table {gameState.roomCode}
          </p>
          <h1 id="wordpick-title" className="page-title">
            Choose your word.
          </h1>
          <p className="wordpick-lead">
            Every player hides one word. The ring will then decide who comes
            hunting for it. Pick something you can keep a straight face about.
          </p>

          <aside className="wordpick-note">
            <h2>Keep it to yourself.</h2>
            <ul>
              <li>Your word is visible only to you until the match is over.</li>
              <li>A rival can uncover one letter at a time by asking for it.</li>
              <li>If they name your word, you leave the table.</li>
              <li>The last player left in the ring takes the match.</li>
            </ul>
          </aside>
        </section>

        <section className="panel wordpick-panel" aria-labelledby="word-form-title">
          <div className="panel-head">
            <div>
              <h2 id="word-form-title" className="panel-title">
                {hasSubmitted ? 'Sealed and set.' : 'Your secret word.'}
              </h2>
              <p className="small muted mt-1">
                {hasSubmitted
                  ? 'Only you can see it until the match ends.'
                  : `${wordLength} letters · ${difficultyLabel} vocabulary`}
              </p>
            </div>
            <span className={`badge ${hasSubmitted ? 'badge-forest' : ''}`}>
              {hasSubmitted ? 'Locked' : 'Unsealed'}
            </span>
          </div>

          {error && (
            <div className="form-error mt-5" role="alert">
              {error}
            </div>
          )}

          {hasSubmitted ? (
            <div className="sealed-state mt-6">
              <div className="sealed-head">
                <h3 className="sealed-title">Your word is in the envelope.</h3>
              </div>

              <div
                className="tile-row"
                style={
                  { '--tile-count': wordLength } as React.CSSProperties
                }
                aria-label={`Your secret word: ${myWord.split('').join(' ')}.`}
              >
                {myWord.split('').map((letter, index) => (
                  <span
                    key={`${letter}-${index}`}
                    className="tile tile-known"
                    aria-hidden="true"
                  >
                    {letter}
                    <span className="tile-index">{index + 1}</span>
                  </span>
                ))}
              </div>

              <p className="waiting-line" role="status">
                <span className="waiting-dot" aria-hidden="true" />
                {waitingCount > 0
                  ? `Waiting for ${waitingCount} more ${pluralize(
                      waitingCount,
                      'player'
                    )} to seal a word.`
                  : 'Everyone has a word. The table is about to open.'}
              </p>
            </div>
          ) : (
            <form className="word-form" onSubmit={handleSubmit} noValidate>
              <div
                className="tile-row"
                style={
                  { '--tile-count': wordLength } as React.CSSProperties
                }
                aria-hidden="true"
              >
                {Array.from({ length: wordLength }).map((_, index) => {
                  const letter = wordInput[index] || '';
                  return (
                    <span
                      key={index}
                      className={`tile ${letter ? 'tile-known' : 'tile-empty'}`}
                    >
                      {letter}
                      <span className="tile-index">{index + 1}</span>
                    </span>
                  );
                })}
              </div>

              <div>
                <label className="field-label" htmlFor="secret-word">
                  Type your word
                </label>
                <input
                  id="secret-word"
                  className="word-input"
                  type="text"
                  autoFocus
                  maxLength={wordLength}
                  value={wordInput}
                  onChange={(event) =>
                    setWordInput(
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
                  required
                />
              </div>

              <div className="word-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={suggestWord}
                  disabled={randomLoading || loading || !isConnected}
                >
                  {randomLoading ? 'Finding…' : 'Suggest a word'}
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={
                    loading || wordInput.length !== wordLength || !isConnected
                  }
                >
                  {loading ? 'Sealing…' : 'Seal this word'}
                </button>
              </div>

              {canBeCustom && (
                <div style={{ marginTop: '1rem', padding: '0.875rem', borderRadius: '8px', border: '1px solid var(--accent)', backgroundColor: 'var(--accent-soft)' }}>
                  <p style={{ margin: 0, marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
                    Word not in standard dictionary? You can still lock it in:
                  </p>
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                    onClick={(e) => handleSubmit(e, true)}
                    disabled={loading || !isConnected}
                  >
                    ✨ Lock in &ldquo;{wordInput}&rdquo; as Custom Word
                  </button>
                </div>
              )}

              <p className="word-hint">
                Standard dictionary words, famous places, movies, cricket icons, food &amp; mythology accepted — or lock in any unique word as a Custom Word!
              </p>
            </form>
          )}

          <div className="submission-block">
            <h3 className="submission-title">
              Submissions · {submittedCount} of {gameState.players.length}
            </h3>
            <div className="submission-list">
              {gameState.players.map((player) => (
                <div className="submission-row" key={player.id}>
                  <span>
                    {player.name}
                    {player.id === gameState.myId ? ' (you)' : ''}
                  </span>
                  {player.hasSubmittedWord ? (
                    <span className="badge badge-forest">Sealed</span>
                  ) : (
                    <span className="badge">Choosing</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
