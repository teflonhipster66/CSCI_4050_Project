import { useCallback, useEffect, useRef } from "react";

export function useStudyAudio() {
  const audioContext = useRef<AudioContext | null>(null);

  useEffect(() => () => {
    const context = audioContext.current;
    audioContext.current = null;
    if (context && context.state !== "closed") void context.close().catch(() => {});
  }, []);

  const getAudioContext = useCallback(() => {
    if (typeof AudioContext === "undefined") return null;
    if (!audioContext.current || audioContext.current.state === "closed") {
      try {
        audioContext.current = new AudioContext();
      } catch {
        return null;
      }
    }
    const context = audioContext.current;
    if (context.state === "suspended") void context.resume().catch(() => {});
    return context;
  }, []);

  const playSelectionSound = useCallback((correct: boolean | null) => {
    const context = getAudioContext();
    if (!context) return;

    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const now = context.currentTime;

    oscillator.type = "sine";
    oscillator.frequency.value = correct === null ? 440 : correct ? 740 : 190;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.19);
  }, [getAudioContext]);

  return { getAudioContext, playSelectionSound };
}
