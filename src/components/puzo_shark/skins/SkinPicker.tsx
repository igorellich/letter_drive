import { useState, type CSSProperties } from 'react'
import { SKINS, type SharkSkin } from './sharkSkins'
import { SkinPreview } from './SkinPreview'
import { menuButtonStyle } from '../hud/TestSelectionMenu'
import { GRAD_GOOD, GRAD_TESTS, kidTitle, coinChip, backChip } from '../hud/kidStyle'

const SKIN_EMOJI: Record<string, string> = {
  classic: '🦈',
  hamburger: '🍔',
  donut: '🍩',
  octopus: '🐙',
  whale: '🐋',
  triceratops: '🦕',
  trex: '🦖',
  ufo: '🛸',
  robot: '🤖',
  rocket: '🚀',
  duck: '🦆'
}

const chipStyle = (state: string): CSSProperties => {
  const lock = state === 'locked'
  const selected = state === 'selected'
  const buy = state === 'buy'
  return {
    padding: 'clamp(6px, 1.6vh, 10px) clamp(10px, 2.4vw, 16px)',
    borderRadius: 999,
    cursor: lock ? 'not-allowed' : 'pointer',
    border: '2px solid ' + (selected ? '#00d2ff' : lock ? 'rgba(255,255,255,0.2)' : buy ? 'rgba(244,114,182,0.8)' : 'rgba(45,212,191,0.6)'),
    background: selected ? 'rgba(0,210,255,0.25)' : lock ? 'rgba(80,80,80,0.25)' : buy ? 'rgba(244,114,182,0.15)' : 'rgba(45,212,191,0.1)',
    color: lock ? 'rgba(255,255,255,0.45)' : 'white',
    fontSize: 'clamp(11px, 2.6vh, 14px)',
    lineHeight: 1,
    opacity: lock ? 0.8 : 1,
    transition: 'transform 0.2s'
  }
}

export const SkinPicker = (props: {
    currentSkinId: string,
    coins: number,
    ownedSkins: string[],
    onBuy: (skin: SharkSkin) => void,
    onPick: (id: string) => void,
    onClose: () => void
}) => {
    const { currentSkinId, coins, ownedSkins, onBuy, onPick, onClose } = props
    const [selectedId, setSelectedId] = useState(currentSkinId)
    const selected = SKINS.find(s => s.id === selectedId) ?? SKINS[0]
    const chipState = (s: SharkSkin): string =>
        selected.id === s.id ? 'selected' : (ownedSkins.includes(s.id) ? 'owned' : (coins >= s.price ? 'buy' : 'locked'))
    const chipText = (s: SharkSkin): string =>
        `${SKIN_EMOJI[s.id] ?? '🎈'} ${ownedSkins.includes(s.id) ? s.title : `🪙 ${s.price}`}`
    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 'clamp(6px, 1.8vh, 14px)', width: 'min(92vw, 540px)'
        }}>
            <h2 style={{ ...kidTitle('#f472b6'), fontSize: 'clamp(1.3rem, 5.5vh, 2rem)' }}>
                🎨 Скин акулы
            </h2>
            <div style={coinChip}>🪙 {coins}</div>
            <div style={{
                width: '100%', height: 'clamp(110px, 30vh, 260px)', flexShrink: 1, minHeight: 0,
                border: '2px solid rgba(244,114,182,0.5)', borderRadius: '18px', overflow: 'hidden',
                boxShadow: '0 0 30px rgba(244,114,182,0.25)'
            }}>
                <SkinPreview skin={selected} />
            </div>
            <p style={{ margin: 0, fontSize: 'clamp(1rem, 3vh, 1.2rem)', color: 'white', fontWeight: 'bold' }}>
                {SKIN_EMOJI[selected.id] ?? '🎈'} {selected.title}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(5px, 1.3vh, 9px)', justifyContent: 'center' }}>
                {SKINS.map(s => (
                    <button
                        key={s.id}
                        onClick={() => {
                            if (ownedSkins.includes(s.id)) setSelectedId(s.id)
                            else onBuy(s)
                        }}
                        style={chipStyle(chipState(s))}
                    >
                        {chipText(s)}
                    </button>
                ))}
            </div>
            <div style={{ display: 'flex', gap: 'clamp(8px, 1.8vh, 12px)', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
                <button onClick={() => onPick(selected.id)} style={{
                    ...menuButtonStyle,
                    background: selected && ownedSkins.includes(selected.id) ? GRAD_TESTS : GRAD_GOOD,
                    fontSize: 'clamp(14px, 3.2vh, 20px)',
                    padding: 'clamp(8px, 2vh, 14px) clamp(20px, 5vw, 40px)',
                    borderRadius: 999
                }}>
                    {ownedSkins.includes(selected.id) ? '✓ Применить' : '💎 Купить'}
                </button>
                <button onClick={onClose} style={{ ...backChip, fontSize: 'clamp(14px, 3.2vh, 20px)' }}>← Назад</button>
            </div>
        </div>
    )
}