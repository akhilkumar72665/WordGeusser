import React, { useEffect, useRef, useState } from 'react';
import {
  ClientGameState,
  Difficulty,
  TurnOrder
} from '../types';
import { copyText, initials, inviteMessage, pluralize } from '../lib/utils';

interface LobbyViewProps {
  gameState: ClientGameState | null;
  isConnected?: boolean;
  onJoinRoom: (code: string, name: string) => Promise<any>;
  onCreateRoom: (name: string) => Promise<any>;
  onUpdateSettings: (settings: any) => void;
  onAddBot: () => void;
  onRemoveBot: (id: string) => void;
  onStartGame: () => Promise<any>;
}

const WORD_LENGTHS = [3, 4, 5, 6, 7, 8, 9, 10];
const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard', 'expert'];
const TURN_TIMERS = [
  { label: 'Off', value: 0 },
  { label: '15', value: 15 },
  { label: '30', value: 30 },
  { label: '45', value: 45 },
  { label: '60', value: 60 }
];
const GUESS_LIMITS = [
  { label: '3', value: 3 },
  { label: '5', value: 5 },
  { label: '7', value: 7 },
  { label: '∞', value: 999 }
];
const TURN_ORDERS: { label: string; value: TurnOrder }[] = [
  { label: 'Clockwise', value: 'clockwise' },
  { label: 'Reverse', value: 'anticlockwise' },
  { label: 'Random', value: 'random' }
];

function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export const LobbyView: React.FC<LobbyViewProps> = ({
  gameState,
  isConnected = true,
  onJoinRoom,
  onCreateRoom,
  onUpdateSettings,
  onAddBot,
  onRemoveBot,
  onStartGame
}) => {
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [name, setName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const copyTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimer.current !== null) window.clearTimeout(copyTimer.current);
    };
  }, []);

  const switchMode = (next: 'create' | 'join') => {
    setMode(next);
    setError(null);
  };

  const handleEntry = async (event: React.FormEvent) => {
    event.preventDefault();
    const playerName = name.trim();

    if (!playerName) {
      setError('Please enter a nickname first.');
      return;
    }
    if (mode === 'join' && joinCode.length !== 6) {
      setError('A room code is six characters long.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const result =
        mode === 'create'
          ? await onCreateRoom(playerName)
          : await onJoinRoom(joinCode, playerName);

      if (!result.success) {
        setError(
          result.error ||
            (mode === 'create'
              ? 'The table could not be created.'
              : 'That table could not be found.')
        );
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyInvite = async () => {
    if (!gameState) return;
    const ok = await copyText(inviteMessage(gameState.roomCode));
    setCopied(ok);
    setCopyFailed(!ok);
    if (copyTimer.current !== null) window.clearTimeout(copyTimer.current);
    copyTimer.current = window.setTimeout(() => {
      setCopied(false);
      setCopyFailed(false);
    }, 2400);
  };

  const startGame = async () => {
    setError(null);
    setLoading(true);
    try {
      const result = await onStartGame();
      if (!result.success) {
        setError(result.error || 'The table could not be started.');
      }
    } catch {
      setError('Something went wrong while starting the table.');
    } finally {
      setLoading(false);
    }
  };

  /* ----------------------------------------------------------------
     Landing
     ---------------------------------------------------------------- */
  if (!gameState) {
    return (
      <div className="landing">
        <div className="landing-grid">
          <section className="landing-intro" aria-labelledby="landing-title">
            <p className="screen-label">
              A parlour game of secret words · Two to fifteen players
            </p>
            <h1 id="landing-title" className="landing-title">
              <span>Everyone is</span>
              <span className="text-accent">hiding a word.</span>
            </h1>
            <p className="landing-lead">
              Wordguesser is a live table game of secret words. Everyone
              conceals one, then probes the ring for letters. Read the pattern,
              name a rival’s word, and stay in your seat.
            </p>
          </section>

          <div className="landing-card">
            <section className="entry-card" aria-labelledby="entry-title">
              <h2 id="entry-title" className="entry-title">
                Take a seat.
              </h2>
              <p className="entry-sub">
                Start a fresh table, or join one with a six-character code.
              </p>

              <div className="mode-tabs" role="tablist" aria-label="Room action">
                <button
                  type="button"
                  role="tab"
                  id="tab-create"
                  aria-selected={mode === 'create'}
                  aria-controls="entry-form"
                  className="mode-tab"
                  onClick={() => switchMode('create')}
                >
                  New table
                </button>
                <button
                  type="button"
                  role="tab"
                  id="tab-join"
                  aria-selected={mode === 'join'}
                  aria-controls="entry-form"
                  className="mode-tab"
                  onClick={() => switchMode('join')}
                >
                  Join a table
                </button>
              </div>

              <form
                id="entry-form"
                className="entry-form"
                onSubmit={handleEntry}
                noValidate
              >
                {error && (
                  <div className="form-error form-error-dark" role="alert">
                    {error}
                  </div>
                )}

                <div>
                  <label
                    htmlFor="player-name"
                    className="field-label field-label-dark"
                  >
                    Your name
                  </label>
                  <input
                    id="player-name"
                    className="field field-dark field-lg"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="e.g. Ada, Cipher, Marlowe"
                    maxLength={18}
                    autoComplete="nickname"
                    disabled={loading}
                    required
                  />
                </div>

                {mode === 'join' && (
                  <div>
                    <label
                      htmlFor="room-code"
                      className="field-label field-label-dark"
                    >
                      Room code
                    </label>
                    <input
                      id="room-code"
                      className="field field-dark field-lg room-code"
                      type="text"
                      value={joinCode}
                      onChange={(event) =>
                        setJoinCode(
                          event.target.value
                            .toUpperCase()
                            .replace(/[^A-Z0-9]/g, '')
                            .slice(0, 6)
                        )
                      }
                      placeholder="ABC123"
                      maxLength={6}
                      autoComplete="off"
                      spellCheck={false}
                      disabled={loading}
                      required
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  disabled={loading || !isConnected}
                >
                  {loading
                    ? mode === 'create'
                      ? 'Setting the table…'
                      : 'Finding your seat…'
                    : mode === 'create'
                      ? 'Create a table'
                      : 'Join the table'}
                </button>

                <p className="text-[12px] leading-relaxed text-night-muted">
                  {mode === 'create'
                    ? 'You will be the host. The rules can be changed before the first word is sealed.'
                    : 'Ask the host for the six-character code. There are no accounts and nothing to install.'}
                </p>
              </form>

              <div className="entry-foot">
                <span className="connection-status">
                  <span
                    className={`status-dot ${isConnected ? '' : 'status-dot--offline'}`}
                    aria-hidden="true"
                  />
                  {isConnected ? 'Table server online' : 'Reconnecting…'}
                </span>
                <span>2–15 players</span>
              </div>
            </section>
          </div>

          <section className="landing-detail" aria-label="How a turn works">
            <div className="word-ribbon">
              <div className="ribbon-tiles" aria-hidden="true">
                {['C', 'I', '_', 'H', 'E', 'R'].map((letter, index) => (
                  <span
                    key={`${letter}-${index}`}
                    className={`ribbon-tile ${
                      letter === '_' ? 'ribbon-tile--empty' : 'ribbon-tile--known'
                    }`}
                  >
                    {letter === '_' ? '' : letter}
                  </span>
                ))}
              </div>
              <p className="ribbon-caption">
                A rival word, half uncovered. Ask for a letter and every
                matching position turns up at once.
              </p>
            </div>

            <div className="rules-grid">
              <div className="rule-item">
                <h3>1. Conceal a word</h3>
                <p>
                  Choose an approved word of the table’s length. It stays
                  sealed until the match is over.
                </p>
              </div>
              <div className="rule-item">
                <h3>2. Ask for a letter</h3>
                <p>
                  Name one letter. Every matching position in your rival’s word
                  is revealed. A miss still ends your turn.
                </p>
              </div>
              <div className="rule-item">
                <h3>3. Name the word</h3>
                <p>
                  Spend a guess on the whole word. A correct call removes its
                  owner from the ring. A wrong one costs you.
                </p>
              </div>
            </div>
          </section>
        </div>

        <footer className="landing-foot">
          <span>
            <strong>Wordguesser</strong> — a game of secret words.
          </span>
          <span>No accounts. No downloads. Share a code and play.</span>
        </footer>
      </div>
    );
  }

  /* ----------------------------------------------------------------
     Room lobby
     ---------------------------------------------------------------- */
  const isHost = gameState.hostId === gameState.myId;
  const { settings, players, roomCode } = gameState;
  const host = players.find((player) => player.id === gameState.hostId);
  const canStart = players.length >= 2 && !loading && isConnected;
  const tableIsFull = players.length >= settings.maxPlayers;
  const seatsOpen = Math.max(0, settings.maxPlayers - players.length);

  return (
    <div className="lobby-page page-shell">
      <div className="page-head">
        <div>
          <p className="screen-label">Lobby · Table {roomCode}</p>
          <h1 className="page-title">Take your seats.</h1>
          <p className="page-sub">
            <span>Hosted by {host?.name ?? 'the host'}</span>
            <span className="dot" aria-hidden="true" />
            <span>
              {players.length} of {settings.maxPlayers} seated
            </span>
            <span className="dot" aria-hidden="true" />
            <span>{settings.wordLength}-letter words</span>
          </p>
        </div>

        <div className="head-actions">
          {isHost ? (
            <>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => onAddBot()}
                disabled={tableIsFull || !isConnected}
              >
                Add a bot
              </button>
              <button
                type="button"
                className="btn btn-primary btn-lg"
                onClick={startGame}
                disabled={!canStart}
              >
                {loading ? 'Starting…' : 'Start the game'}
              </button>
            </>
          ) : (
            <p className="head-note">
              The host sets the rules and starts the match. Settle in — the
              table will open when everyone is ready.
            </p>
          )}
        </div>
      </div>

      {error && (
        <div className="form-error mb-5" role="alert">
          {error}
        </div>
      )}

      <div className="lobby-grid">
        <section className="panel panel-pad" aria-labelledby="seats-title">
          <div className="panel-head">
            <div>
              <h2 id="seats-title" className="panel-title">
                The guests
              </h2>
              <p className="small muted mt-1">
                A full table seats up to {settings.maxPlayers} players.
              </p>
            </div>
            <span className="badge">
              {players.length} / {settings.maxPlayers}
            </span>
          </div>

          <ul className="seats-list">
            {players.map((player) => (
              <li className="seat" key={player.id}>
                <div className="seat-person">
                  <span className="seat-avatar" aria-hidden="true">
                    {player.isBot ? 'AI' : initials(player.name)}
                  </span>
                  <div className="seat-main">
                    <div className="seat-name-row">
                      <span className="seat-name">{player.name}</span>
                      {player.isHost && (
                        <span className="badge badge-accent">Host</span>
                      )}
                      {player.id === gameState.myId && (
                        <span className="badge">You</span>
                      )}
                      {player.isBot && <span className="badge">Bot</span>}
                    </div>
                    <p className="seat-meta">
                      {player.isBot
                        ? 'Automated player'
                        : player.isHost
                          ? 'Sets the rules'
                          : 'Human player'}
                    </p>
                  </div>
                </div>

                {isHost && player.isBot && (
                  <div className="seat-actions">
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => onRemoveBot(player.id)}
                      disabled={!isConnected}
                      aria-label={`Remove ${player.name} from the table`}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>

          <div className="seats-foot">
            <div className="share-code">
              <span className="small muted">Table code</span>
              <strong>{roomCode}</strong>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={copyInvite}
              >
                {copied ? 'Invite copied' : 'Copy invite'}
              </button>
            </div>
            {copyFailed ? (
              <span className="small text-accent" role="status">
                Copy failed — share the code above.
              </span>
            ) : (
              <span className="small muted">
                {seatsOpen > 0
                  ? `Share the code — ${seatsOpen} ${pluralize(
                      seatsOpen,
                      'seat'
                    )} still open.`
                  : 'The table is full. Start when everyone is ready.'}
              </span>
            )}
          </div>

          {players.length < 2 ? (
            <p className="seat-note seat-note--warning">
              <strong>The table needs one more.</strong> Add a bot or invite a
              friend with the code above.
            </p>
          ) : (
            <p className="seat-note">
              <strong>Everyone is seated.</strong>{' '}
              {isHost
                ? 'Set the house rules, then start the game.'
                : 'The host will start the game when the rules are set.'}
            </p>
          )}
        </section>

        <section className="panel panel-pad" aria-labelledby="rules-title">
          <div className="panel-head">
            <div>
              <h2 id="rules-title" className="panel-title">
                House rules
              </h2>
              <p className="small muted mt-1">
                {isHost ? 'Changes apply to this table only.' : 'Set by the host.'}
              </p>
            </div>
            {!isHost && <span className="badge">Host only</span>}
          </div>

          <div className="settings-list">
            <div>
              <div className="setting-head">
                <span className="setting-label">Word length</span>
                <span className="setting-hint">
                  {settings.wordLength} letters
                </span>
              </div>
              <div className="seg seg-8" role="group" aria-label="Word length">
                {WORD_LENGTHS.map((length) => (
                  <button
                    key={length}
                    type="button"
                    className="seg-option"
                    aria-pressed={settings.wordLength === length}
                    disabled={!isHost || !isConnected}
                    onClick={() => onUpdateSettings({ wordLength: length })}
                  >
                    {length}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="setting-head">
                <span className="setting-label">Vocabulary tier</span>
                <span className="setting-hint">
                  {titleCase(settings.difficulty)}
                </span>
              </div>
              <div className="seg seg-4" role="group" aria-label="Vocabulary tier">
                {DIFFICULTIES.map((difficulty) => (
                  <button
                    key={difficulty}
                    type="button"
                    className="seg-option"
                    aria-pressed={settings.difficulty === difficulty}
                    disabled={!isHost || !isConnected}
                    onClick={() => onUpdateSettings({ difficulty })}
                  >
                    {titleCase(difficulty)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="setting-head">
                <span className="setting-label">Turn clock</span>
                <span className="setting-hint">
                  {settings.turnTimeLimit === 0
                    ? 'No limit'
                    : `${settings.turnTimeLimit} seconds`}
                </span>
              </div>
              <div className="seg seg-5" role="group" aria-label="Turn clock">
                {TURN_TIMERS.map((timer) => (
                  <button
                    key={timer.value}
                    type="button"
                    className="seg-option"
                    aria-pressed={settings.turnTimeLimit === timer.value}
                    disabled={!isHost || !isConnected}
                    onClick={() =>
                      onUpdateSettings({ turnTimeLimit: timer.value })
                    }
                  >
                    {timer.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="setting-head">
                <span className="setting-label">Word guess limit</span>
                <span className="setting-hint">
                  {settings.guessLimit === 999
                    ? 'Unlimited'
                    : `${settings.guessLimit} attempts`}
                </span>
              </div>
              <div className="seg seg-4" role="group" aria-label="Word guess limit">
                {GUESS_LIMITS.map((limit) => (
                  <button
                    key={limit.value}
                    type="button"
                    className="seg-option"
                    aria-pressed={settings.guessLimit === limit.value}
                    aria-label={
                      limit.value === 999
                        ? 'Unlimited attempts'
                        : `${limit.value} attempts`
                    }
                    disabled={!isHost || !isConnected}
                    onClick={() =>
                      onUpdateSettings({ guessLimit: limit.value })
                    }
                  >
                    {limit.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="setting-head">
                <span className="setting-label">Turn direction</span>
                <span className="setting-hint">
                  {
                    TURN_ORDERS.find((order) => order.value === settings.turnOrder)
                      ?.label
                  }
                </span>
              </div>
              <div className="seg seg-3" role="group" aria-label="Turn direction">
                {TURN_ORDERS.map((order) => (
                  <button
                    key={order.value}
                    type="button"
                    className="seg-option"
                    aria-pressed={settings.turnOrder === order.value}
                    disabled={!isHost || !isConnected}
                    onClick={() =>
                      onUpdateSettings({ turnOrder: order.value })
                    }
                  >
                    {order.label}
                  </button>
                ))}
              </div>
            </div>

            <label className="check-row">
              <input
                type="checkbox"
                checked={settings.preventDuplicates}
                disabled={!isHost || !isConnected}
                onChange={(event) =>
                  onUpdateSettings({ preventDuplicates: event.target.checked })
                }
              />
              <span>
                <span className="check-copy">No repeated words</span>
                <span className="check-hint">
                  Refuse a secret word that someone else has already sealed.
                </span>
              </span>
            </label>
          </div>

          <p className="settings-note">
            {isHost
              ? 'Rules can be changed until the first word is sealed. After that, the table is locked.'
              : 'Only the host can change the house rules. The table will open when they are ready.'}
          </p>
        </section>
      </div>
    </div>
  );
};
