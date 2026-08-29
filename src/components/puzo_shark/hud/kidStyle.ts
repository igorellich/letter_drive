import type { CSSProperties } from 'react'

export const GRAD_TESTS = 'linear-gradient(135deg, #00d2ff 0%, #0078ff 100%)'
export const GRAD_DIVERS = 'linear-gradient(135deg, #2dd4bf 0%, #0d9488 100%)'
export const GRAD_SKINS = 'linear-gradient(135deg, #f472b6 0%, #a855f7 100%)'
export const GRAD_GOOD = 'linear-gradient(135deg, #4ade80 0%, #16a34a 100%)'
export const GRAD_RED = 'linear-gradient(135deg, #f87171 0%, #dc2626 100%)'
export const GRAD_GOLD = 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'

export const ANSWERS_COLORS = [
  'linear-gradient(135deg, #00d2ff 0%, #0078ff 100%)',
  'linear-gradient(135deg, #f472b6 0%, #a855f7 100%)',
  'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
  'linear-gradient(135deg, #2dd4bf 0%, #0d9488 100%)'
]

export const panelCard: CSSProperties = {
  background: 'linear-gradient(180deg, rgba(8,47,73,0.95) 0%, rgba(2,20,30,0.97) 100%)',
  border: '2px solid rgba(0,210,255,0.35)',
  borderRadius: 26,
  boxShadow: '0 12px 40px rgba(0,0,0,0.5), inset 0 0 30px rgba(0,210,255,0.06)'
}

export const coinChip: CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: 'clamp(6px, 1.4vh, 9px) clamp(10px, 2.4vw, 16px)',
  borderRadius: 999, border: '2px solid rgba(255,215,0,0.6)',
  background: 'rgba(0,0,0,0.35)', color: '#ffd700', fontWeight: 'bold',
  fontSize: 'clamp(0.9rem, 2.6vh, 1.15rem)', textShadow: '0 0 10px rgba(255,215,0,0.4)'
}

export const pill = (gradient: string, foreground = '#fff'): CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  border: 'none', cursor: 'pointer', color: foreground, fontWeight: 'bold',
  background: gradient,
  borderRadius: 999, boxShadow: '0 6px 18px rgba(0,0,0,0.4)',
  transition: 'transform 0.15s'
})

export const backChip: CSSProperties = {
  alignSelf: 'center',
  background: 'rgba(0,210,255,0.15)', color: '#d6f6ff', border: '1px solid rgba(0,210,255,0.75)',
  padding: 'clamp(6px, 1.8vh, 10px) clamp(14px, 3.5vw, 24px)', borderRadius: 999,
  cursor: 'pointer', fontWeight: 'bold', fontSize: 'clamp(0.9rem, 2.6vh, 1.05rem)',
  textShadow: '0 1px 2px rgba(0,0,0,0.5)'
}

export const kidTitle = (color = '#00d2ff', extra: CSSProperties = {}): CSSProperties => ({
  color, margin: 0, fontWeight: 900, textShadow: `0 0 20px ${color}55`, ...extra
})