import type { CSSProperties } from "react"

export const MainMenu = (props: {
  coins: number
  diversTimeLeftSec: number
  diversEaten: number
  testsCount: number
  onOpenTests: () => void
  onStartDivers: () => void
  onOpenSkins: () => void
  onShare: () => void
}) => {
  const { coins, diversTimeLeftSec, diversEaten, testsCount, onOpenTests, onStartDivers, onOpenSkins, onShare } = props
  const hasDiverTime = diversTimeLeftSec > 0
  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  const bigButtonStyle = (gradient: string, disabled: boolean): CSSProperties => ({
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: 'clamp(0px, 0.6vh, 4px)',
    width: '100%',
    padding: 'clamp(10px, 2.4vh, 18px)',
    borderRadius: '22px',
    border: '2px solid rgba(255,255,255,0.4)',
    background: gradient,
    color: 'white',
    cursor: disabled ? 'not-allowed' : 'pointer',
    boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
    opacity: disabled ? 0.55 : 1,
    transition: 'transform 0.15s'
  })

  const coinChip: CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: 'clamp(6px, 1.4vh, 9px) clamp(10px, 2.4vw, 16px)',
    borderRadius: '999px',
    border: '2px solid rgba(255,215,0,0.6)',
    background: 'rgba(0,0,0,0.35)',
    color: '#ffd700',
    fontSize: 'clamp(0.9rem, 2.6vh, 1.15rem)', fontWeight: 'bold',
    textShadow: '0 0 10px rgba(255,215,0,0.4)'
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 'clamp(8px, 2vh, 16px)',
      width: 'min(92vw, 420px)',
      maxHeight: '100%', overflowY: 'auto'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <h1 style={{
          color: '#00d2ff', margin: 0,
          fontSize: 'clamp(1.6rem, 5vh, 2.4rem)',
          textShadow: '0 0 20px rgba(0,210,255,0.5)'
        }}>🦈 Дай стейк!</h1>
        <div style={coinChip}>🪙 {coins}</div>
      </div>

      <button onClick={onOpenTests} style={bigButtonStyle('linear-gradient(135deg, #00d2ff 0%, #0078ff 100%)', false)}>
        <span style={{ fontSize: 'clamp(1.8rem, 7vh, 2.8rem)', lineHeight: 1.15 }}>📚</span>
        <span style={{ fontSize: 'clamp(1.15rem, 3.4vh, 1.6rem)', fontWeight: 'bold' }}>Тесты</span>
        <span style={{ fontSize: 'clamp(0.7rem, 2vh, 0.85rem)', opacity: 1, textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}>{testsCount} тестов · 2–3 класс</span>
      </button>

      <button onClick={onStartDivers} disabled={!hasDiverTime} style={bigButtonStyle('linear-gradient(135deg, #2dd4bf 0%, #0d9488 100%)', !hasDiverTime)}>
        <span style={{ fontSize: 'clamp(1.8rem, 7vh, 2.8rem)', lineHeight: 1.15 }}>🏄</span>
        <span style={{ fontSize: 'clamp(1.15rem, 3.4vh, 1.6rem)', fontWeight: 'bold' }}>Дайверы</span>
        <span style={{ fontSize: 'clamp(0.7rem, 2vh, 0.85rem)', opacity: 1, textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}>
          {hasDiverTime ? `Осталось ${fmt(diversTimeLeftSec)} · 🐟 ${diversEaten}` : 'Получи время в тестах!'}
        </span>
      </button>

      <button onClick={onOpenSkins} style={bigButtonStyle('linear-gradient(135deg, #f472b6 0%, #a855f7 100%)', false)}>
        <span style={{ fontSize: 'clamp(1.8rem, 7vh, 2.8rem)', lineHeight: 1.15 }}>🎨</span>
        <span style={{ fontSize: 'clamp(1.15rem, 3.4vh, 1.6rem)', fontWeight: 'bold' }}>Скины</span>
        <span style={{ fontSize: 'clamp(0.7rem, 2vh, 0.85rem)', opacity: 1, textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}>Смени акулу!</span>
      </button>

      <button onClick={onShare} style={bigButtonStyle('linear-gradient(135deg, #34d399 0%, #059669 100%)', false)}>
        <span style={{ fontSize: 'clamp(1.8rem, 7vh, 2.8rem)', lineHeight: 1.15 }}>📤</span>
        <span style={{ fontSize: 'clamp(1.15rem, 3.4vh, 1.6rem)', fontWeight: 'bold' }}>Поделиться</span>
        <span style={{ fontSize: 'clamp(0.7rem, 2vh, 0.85rem)', opacity: 1, textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}>Отправь друзьям ссылку!</span>
      </button>
    </div>
  )
}