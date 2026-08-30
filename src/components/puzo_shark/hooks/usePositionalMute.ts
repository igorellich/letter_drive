import { useEffect } from 'react'
import { soundBus } from './soundBus'

// Применяет глобальный мьют к three.js PositionalAudio/Audio (звуковые эффекты).
// При muted объём обнуляется, иначе возвращается к полному.
export const usePositionalMute = (ref: React.RefObject<{ setVolume: (v: number) => void } | null>) => {
  useEffect(() => {
    return soundBus.subscribe((m) => {
      ref.current?.setVolume(m ? 0 : 1)
    })
  }, [ref])
}
