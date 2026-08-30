import { useEffect } from "react"
import { GRAD_DIVERS } from "./kidStyle"

export type Reward = { id: number, amount: number }

// Всплывающее уведомление «+N сек дайверам ⏰» — заметная награда за поедание
// рыбки-приманки (без вопроса). Каждый тост живёт ~1.6с и сам себя убирает.
export const RewardToast = ({ rewards, onDone }: {
  rewards: Reward[],
  onDone: (id: number) => void,
}) => {
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0,
      top: '16%',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
      pointerEvents: 'none', zIndex: 1500,
    }}>
      {rewards.map(r => (
        <ToastItem key={r.id} reward={r} onDone={onDone} />
      ))}
    </div>
  )
}

const ToastItem = ({ reward, onDone }: { reward: Reward, onDone: (id: number) => void }) => {
  useEffect(() => {
    const t = setTimeout(() => onDone(reward.id), 1600)
    return () => clearTimeout(t)
  }, [reward.id, onDone])

  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 10,
      padding: 'clamp(8px, 2vh, 14px) clamp(18px, 4vw, 30px)',
      borderRadius: 999,
      background: 'linear-gradient(135deg, rgba(2,32,26,0.92) 0%, rgba(6,78,59,0.95) 100%)',
      border: '3px solid #2dd4bf',
      boxShadow: '0 8px 26px rgba(0,0,0,0.5), inset 0 0 18px rgba(45,212,191,0.25)',
      color: '#fff', fontWeight: 900,
      fontSize: 'clamp(1.2rem, 4vh, 1.8rem)',
      textShadow: '0 1px 3px rgba(0,0,0,0.6)',
      animation: 'toast-pop 1.6s ease-out forwards',
    }}>
      <span style={{ fontSize: '1.2em' }}>⏰</span>
      <span style={{ background: GRAD_DIVERS, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
        +{reward.amount} сек!
      </span>
      <span style={{ fontSize: '0.6em', opacity: 0.9, color: '#a7f3d0' }}>дайверам</span>
    </div>
  )
}
