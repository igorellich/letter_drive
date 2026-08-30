import { useEffect, useRef } from 'react';
import { soundBus } from './soundBus';

interface UseAudioOptions {
  src: string;
  paused: boolean;
  autoRepeat?: boolean;
  volume?: number;
}

export const useAudio = ({ src, paused, autoRepeat = true, volume = 0.5 }: UseAudioOptions) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(src);
    audio.loop = autoRepeat;
    audio.volume = volume;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, [src, autoRepeat, volume]);

  useEffect(() => {
    if (!audioRef.current) return;

    if (!paused) {
      audioRef.current.play().catch(() => {
        console.warn("Автовоспроизведение заблокировано до взаимодействия с UI");
      });
    } else {
      audioRef.current.pause();
    }
  }, [paused]);

  // Глобальный мьют (кнопка звука): применяем muted к созданному <audio>.
  useEffect(() => {
    const unsub = soundBus.subscribe((m) => {
      if (audioRef.current) audioRef.current.muted = m;
    });
    return unsub;
  }, []);

  return audioRef;
};
