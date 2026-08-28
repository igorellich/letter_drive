import { useState } from 'react'
import { SKINS } from './sharkSkins'
import { SkinPreview } from './SkinPreview'
import { menuButtonStyle } from '../hud/TestSelectionMenu'

const backButtonStyle = {
    background: 'none', color: '#00d2ff', border: '1px solid #00d2ff',
    padding: 'clamp(6px, 1.8vh, 10px) clamp(12px, 3vw, 18px)', borderRadius: '20px',
    cursor: 'pointer', fontSize: 'clamp(12px, 2.8vh, 15px)'
};

const chipStyle = (selected: boolean): React.CSSProperties => ({
    padding: 'clamp(5px, 1.5vh, 9px) clamp(9px, 2.2vw, 14px)',
    borderRadius: '18px',
    cursor: 'pointer',
    border: selected ? '2px solid #00d2ff' : '1px solid rgba(0,210,255,0.4)',
    background: selected ? 'rgba(0,210,255,0.2)' : 'rgba(255,255,255,0.08)',
    color: 'white',
    fontSize: 'clamp(11px, 2.6vh, 14px)',
    lineHeight: 1,
    transition: 'transform 0.2s'
})

export const SkinPicker = (props: { currentSkinId: string, onPick: (id: string) => void, onClose: () => void }) => {
    const { currentSkinId } = props
    const [selectedId, setSelectedId] = useState(currentSkinId)
    const selected = SKINS.find(s => s.id === selectedId) ?? SKINS[0]
    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 'clamp(6px, 1.8vh, 14px)', width: 'min(92vw, 540px)'
        }}>
            <h2 style={{ color: '#00d2ff', margin: '4px 0 0', fontSize: 'clamp(1.2rem, 5vh, 1.9rem)', textShadow: '0 0 20px rgba(0,210,255,0.5)' }}>
                Скин акулы
            </h2>
            <div style={{
                width: '100%', height: 'clamp(110px, 30vh, 260px)', flexShrink: 1, minHeight: 0,
                border: '2px solid rgba(0,210,255,0.5)', borderRadius: '14px', overflow: 'hidden',
                boxShadow: '0 0 30px rgba(0,210,255,0.25)'
            }}>
                <SkinPreview skin={selected} />
            </div>
            <p style={{ margin: 0, fontSize: 'clamp(0.9rem, 2.6vh, 1.05rem)', color: 'rgba(255,255,255,0.9)' }}>{selected.title}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(4px, 1.2vh, 8px)', justifyContent: 'center' }}>
                {SKINS.map(s => (
                    <button key={s.id} onClick={() => setSelectedId(s.id)} style={chipStyle(selected.id === s.id)}>
                        {s.title}
                    </button>
                ))}
            </div>
            <div style={{ display: 'flex', gap: 'clamp(8px, 1.8vh, 12px)', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
                <button onClick={() => props.onPick(selected.id)} style={{ ...menuButtonStyle, fontSize: 'clamp(14px, 3.2vh, 20px)', padding: 'clamp(8px, 2vh, 14px) clamp(20px, 5vw, 40px)' }}>
                    Применить
                </button>
                <button onClick={props.onClose} style={backButtonStyle}>← Назад</button>
            </div>
        </div>
    )
}