import { Html } from "@react-three/drei"
import { GRAD_TESTS, panelCard } from "./hud/kidStyle"

// ВАЖНО: этот компонент — Suspense-fallback, монтируется ВНУТРИ Canvas, пока
// сцена грузит модели 3D. Нельзя использовать drei useProgress() прямо здесь:
// он вызывает set() на zustand-сторе из callbacks DefaultLoadingManager (onStart/
// onProgress), которые срабатывают синхронно ВО ВРЕМЯ render (cold load модели),
// и React 19 падает с «Cannot update a component while rendering a different
// component», размонтируя всё дерево -> белый экран при входе в тест.
// Поэтому здесь только статичная панель с CSS-анимацией (без подписки на прогресс).
export const Loader = () => {
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
                        width: '40%',
                        height: '100%',
                        background: GRAD_TESTS,
                        borderRadius: 999,
                        animation: 'ldr-slide 1.2s ease-in-out infinite'
                    }} />
                </div>
            </div>
        </Html>
    )
}
