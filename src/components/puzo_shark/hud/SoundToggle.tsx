import { useState, type CSSProperties } from 'react'
import { soundBus } from '../hooks/soundBus'

const btnStyle: CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  width: 'clamp(42px, 5.5vh, 52px)', height: 'clamp(42px, 5.5vh, 52px)',
  borderRadius: '50%', border: '2px solid rgba(255,255,255,0.4)',
  background: 'rgba(0,0,0,0.4)', color: 'white', fontSize: 'clamp(1.3rem, 3.5vh, 1.7rem)',
  cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,0,0,0.35)', flexShrink: 0
}

// Глобальный переключатель звука; состояние хранится в localStorage через soundBus.
export const SoundToggle = (props: { style?: CSSProperties }) => {
  const [muted, setMuted] = useState(soundBus.getMuted())
  return (
    <button
      onClick={() => setMuted(soundBus.toggle())}
      title={muted ? 'Включить звук' : 'Выключить звук'}
      style={{ ...btnStyle, ...props.style }}
    >
      {muted ? '🔇' : '🔊'}
    </button>
  )
}
