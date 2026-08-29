import { Html, useProgress } from "@react-three/drei" // Добавили useProgress
import { GRAD_TESTS, panelCard } from "./hud/kidStyle"

export const Loader = () => {
    const { progress } = useProgress()
    return (
        <Html center>
            <div style={{
                ...panelCard,
                color: 'white',
                padding: 'clamp(18px, 4vh, 28px)',
                fontFamily: 'sans-serif',
                textAlign: 'center',
                minWidth: 'clamp(180px, 50vw, 260px)'
            }}>
                <div style={{ fontSize: 'clamp(1.6rem, 5vh, 2.4rem)', marginBottom: '8px' }}>🦈</div>
                <div style={{ fontSize: 'clamp(1rem, 3vh, 1.3rem)', marginBottom: '12px', fontWeight: 'bold' }}>
                    Загрузка...
                </div>
                <div style={{
                    width: '100%',
                    height: '12px',
                    background: 'rgba(255,255,255,0.12)',
                    borderRadius: 999,
                    overflow: 'hidden'
                }}>
                    <div style={{
                        width: `${progress}%`,
                        height: '100%',
                        background: GRAD_TESTS,
                        borderRadius: 999,
                        transition: 'width 0.2s'
                    }} />
                </div>
                <div style={{ marginTop: '6px', fontWeight: 'bold', color: '#d6f6ff', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>{Math.round(progress)}%</div>
            </div>
        </Html>
    )
}