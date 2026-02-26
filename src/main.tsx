import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Scene } from './components/puzo_shark/Scene'
import test from './components/puzo_shark/food/tests/math/simple';
import { Joystick, type JoystickData } from './components/puzo_shark/Joystick';
import { Canvas } from '@react-three/fiber';
const joystickData: JoystickData = { x: 0, y: 0, active: false }
const App = () => {
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Следим за тем, чтобы состояние кнопки менялось, если нажать Esc
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((e) => {
        console.error(`Ошибка: ${e.message}`)
      })
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>

      {/* Кнопка управления полноэкранным режимом */}
      <button
        onClick={toggleFullscreen}
        title={isFullscreen ? "Выйти из полноэкранного режима" : "Войти в полноэкранный режим"}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          zIndex: 1000,
          width: '48px',
          height: '48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '12px',
          cursor: 'pointer',
          color: 'white',
          outline: 'none',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.6)')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.4)')}
      >
        {isFullscreen ? (
          /* Иконка Свернуть (Minimize) */
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
          </svg>
        ) : (
          /* Иконка Развернуть (Maximize) */
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
          </svg>
        )}
      </button>
      <div style={{ width: '100vw', height: '100vh', background: '#001b26', overflow: 'hidden' }}>

        <Joystick joystickData={joystickData} />
        <Canvas style={{ overflow: 'hidden' }} camera={{ position: [0, 0, 5], fov: 45 }}>
          {/* Твоя 3D Сцена */}
          <Scene joystickData={joystickData} test={test} />
        </Canvas>

      </div>

    </div>
  )
}

// Рендеринг
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
