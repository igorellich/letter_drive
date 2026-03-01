import { StrictMode, useState, useEffect, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Scene } from './components/puzo_shark/Scene'
import test from './components/puzo_shark/food/tests/math/30ex';
import { type JoystickData } from './components/puzo_shark/Joystick';
import { Canvas } from '@react-three/fiber';
import { Loader } from './components/puzo_shark/Loader';

const joystickData: JoystickData = { x: 0, y: 0, active: false }

const App = () => {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [gameStarted, setGameStarted] = useState(false) // Состояние старта

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
      // Если вышли из fullscreen вручную, можно оставить игру запущенной или сбросить
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const toggleFullscreen = (force?: boolean) => {
    const shouldEnter = force !== undefined ? force : !document.fullscreenElement;

    if (shouldEnter) {
      document.documentElement.requestFullscreen()
        .then(() => {
          //@ts-ignore
          if (screen.orientation?.lock) {
            // @ts-ignore
            screen.orientation.lock('landscape').catch(() => {});
          }
        })
        .catch((e) => console.error(e));
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }

  const handleStart = () => {
    setGameStarted(true);
    toggleFullscreen(true); // Принудительный вход при старте
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden', background: '#001b26' }}>
      
      {/* Экран старта */}
      {!gameStarted && (
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0, 27, 38, 0.9)'
        }}>
          <button 
            onClick={handleStart}
            style={{
              padding: '15px 40px', fontSize: '24px', cursor: 'pointer',
              background: '#00d2ff', color: 'white', border: 'none', borderRadius: '12px',
              fontWeight: 'bold', boxShadow: '0 4px 15px rgba(0,210,255,0.4)'
            }}
          >
            НАЧАТЬ ИГРУ
          </button>
        </div>
      )}

      {/* Кнопка Fullscreen (видна только когда игра идет) */}
      {gameStarted && (
        <button
          onClick={() => toggleFullscreen()}
          style={{
            position: 'absolute', top: '20px', right: '20px', zIndex: 1000,
            width: '48px', height: '48px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '12px', cursor: 'pointer', color: 'white'
          }}
        >
          {isFullscreen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" /></svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" /></svg>
          )}
        </button>
      )}

      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <Suspense fallback={<Loader />}>
          {gameStarted && <Scene joystickData={joystickData} test={test} />}
        </Suspense>
      </Canvas>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
