import React from 'react';
import { Check, Copy, Volume2, VolumeX } from 'lucide-react';
import { BrandMark } from './BrandMark';
import { copyText } from '../lib/utils';

interface HeaderProps {
  roomCode?: string;
  isHost?: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
  playerCount?: number;
  maxPlayers?: number;
  isConnected?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  roomCode,
  isHost,
  soundEnabled,
  onToggleSound,
  playerCount = 0,
  maxPlayers,
  isConnected = true
}) => {
  const [copied, setCopied] = React.useState(false);
  const copyTimer = React.useRef<number | null>(null);

  React.useEffect(() => {
    return () => {
      if (copyTimer.current !== null) window.clearTimeout(copyTimer.current);
    };
  }, []);

  const copyRoomCode = async () => {
    if (!roomCode) return;
    const ok = await copyText(roomCode);
    if (!ok) return;
    setCopied(true);
    if (copyTimer.current !== null) window.clearTimeout(copyTimer.current);
    copyTimer.current = window.setTimeout(() => setCopied(false), 1800);
  };

  const seatLabel =
    playerCount > 0
      ? `${playerCount}${maxPlayers ? ` / ${maxPlayers}` : ''} seated`
      : '';

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <div className="brand">
          <BrandMark />
          <div>
            <span className="wordmark">Wordguesser</span>
            <span className="brand-tag">A game of secret words</span>
          </div>
        </div>

        <div className="header-actions">
          {seatLabel && <span className="header-meta">{seatLabel}</span>}

          {roomCode && (
            <button
              type="button"
              className="room-chip"
              onClick={copyRoomCode}
              title={copied ? 'Room code copied' : 'Copy room code'}
              aria-label={
                copied
                  ? `Room code ${roomCode} copied`
                  : `Copy room code ${roomCode}`
              }
            >
              <span
                className={`status-dot ${isConnected ? '' : 'status-dot--offline'}`}
                aria-hidden="true"
              />
              <span className="room-chip-label">
                {isHost ? 'Your table' : 'Table'}
              </span>
              <span className="room-chip-code">{roomCode}</span>
              {copied ? (
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <Copy className="h-3.5 w-3.5" aria-hidden="true" />
              )}
            </button>
          )}

          <button
            type="button"
            className="icon-button"
            onClick={onToggleSound}
            title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
            aria-label={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
            aria-pressed={soundEnabled}
          >
            {soundEnabled ? (
              <Volume2 className="h-4 w-4" aria-hidden="true" />
            ) : (
              <VolumeX className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
