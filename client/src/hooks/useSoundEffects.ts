import { useCallback, useMemo, useRef } from 'react';

export function useSoundEffects() {
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const playTone = useCallback((freq: number, type: OscillatorType, duration: number, delay: number = 0, gainLevel: number = 0.1) => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const startTime = ctx.currentTime + delay;
      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(gainLevel, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    } catch (e) {
      // Audio might be blocked by browser policy before user interaction
    }
  }, [getAudioContext]);

  const playTurn = useCallback(() => {
    playTone(523.25, 'sine', 0.15, 0, 0.15); // C5
    playTone(659.25, 'sine', 0.25, 0.08, 0.12); // E5
  }, [playTone]);

  const playCorrect = useCallback(() => {
    // Upward fanfare
    playTone(440, 'triangle', 0.2, 0, 0.2);     // A4
    playTone(554.37, 'triangle', 0.2, 0.1, 0.2); // C#5
    playTone(659.25, 'triangle', 0.3, 0.2, 0.25); // E5
    playTone(880, 'sine', 0.5, 0.3, 0.3);        // A5
  }, [playTone]);

  const playWrong = useCallback(() => {
    playTone(220, 'sawtooth', 0.25, 0, 0.15);
    playTone(196, 'sawtooth', 0.35, 0.12, 0.15);
  }, [playTone]);

  const playElimination = useCallback(() => {
    playTone(130.81, 'sawtooth', 0.5, 0, 0.25);
    playTone(98, 'sine', 0.7, 0.2, 0.3);
  }, [playTone]);

  const playTick = useCallback(() => {
    playTone(800, 'sine', 0.04, 0, 0.05);
  }, [playTone]);

  return useMemo(
    () => ({
      playTurn,
      playCorrect,
      playWrong,
      playElimination,
      playTick
    }),
    [playTurn, playCorrect, playWrong, playElimination, playTick]
  );
}

