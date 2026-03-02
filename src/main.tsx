import { StrictMode, useState, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Scene } from './components/puzo_shark/Scene'
import { type JoystickData } from './components/puzo_shark/Joystick'
import { Canvas } from '@react-three/fiber'
import { Loader } from './components/puzo_shark/Loader'

// Типы и данные
import type { IGrade, ITest } from './components/puzo_shark/food/tests/interfaces';
import { TwoGrade } from './components/puzo_shark/food/tests/grades/2grade/2Grade';

const joystickData: JoystickData = { x: 0, y: 0, active: false }

const App = () => {
  
  const [gameStarted, setGameStarted] = useState(false)
  const [paused, setPaused] = useState(true)
  
  // Состояния выбора
  const [selectedTest, setSelectedTest] = useState<ITest | null>(null)
  const [currentGrade, setCurrentGrade] = useState<IGrade | null>(null)

 

  const toggleFullscreen = (force?: boolean) => {
    const shouldEnter = force !== undefined ? force : !document.fullscreenElement;
    if (shouldEnter) {
      document.documentElement.requestFullscreen().then(() => {
        //@ts-ignore
        if (screen.orientation?.lock) screen.orientation.lock('landscape').catch(() => {});
      }).catch((e) => console.error(e));
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }

  const startGame = (test: ITest) => {
    setSelectedTest(test);
    setGameStarted(true);
    setPaused(false);
    toggleFullscreen(true);
  }

  const exitToMenu = () => {
    setGameStarted(false);
    setSelectedTest(null);
    setPaused(true);
    if (document.fullscreenElement) document.exitFullscreen();
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden', background: '#001b26' }}>
      
      {/* Overlay: Меню и Пауза */}
      {paused && (
        <div style={overlayStyle}>
          {!gameStarted ? (
            /* ГЛАВНОЕ МЕНЮ */
            <>
              <h1 style={{ color: '#00d2ff', marginBottom: '30px', fontSize: '3rem', textShadow: '0 0 20px rgba(0,210,255,0.5)' }}>Дай стейк!</h1>
              
              {!currentGrade ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <p style={{ fontSize: '1.2rem' }}>Выберите класс:</p>
                  {[TwoGrade].map(g => (
                    <button key={g.title} onClick={() => setCurrentGrade(g)} style={menuButtonStyle}>{g.title}</button>
                  ))}
                </div>
              ) : (
                <div style={{ width: '100%', maxWidth: '400px' }}>
                  <button onClick={() => setCurrentGrade(null)} style={backButtonStyle}>← К выбору класса</button>
                  <h3 style={{ margin: '20px 0' }}>{currentGrade.title}</h3>
                  {currentGrade.subjects.map(subject => (
                    <div key={subject.title} style={{ marginBottom: '20px', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                      <p style={{ fontSize: '0.9rem', opacity: 0.6, marginBottom: '10px' }}>{subject.title}</p>
                      {subject.tests.map(t => (
                        <button key={t.title} onClick={() => startGame(t)} style={testButtonStyle}>
                          Начать: {t.title}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            /* МЕНЮ ПАУЗЫ */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h2 style={{ marginBottom: '20px' }}>ПАУЗА</h2>
              <button onClick={() => { setPaused(false); toggleFullscreen(true); }} style={menuButtonStyle}>
                ПРОДОЛЖИТЬ
              </button>
              <button onClick={exitToMenu} style={{ ...menuButtonStyle, background: '#ff4b4b' }}>
                ВЫЙТИ В МЕНЮ
              </button>
            </div>
          )}
        </div>
      )}

      {/* Кнопка паузы (HUD) */}
      {gameStarted && !paused && (
        <button onClick={() => setPaused(true)} style={pauseIconStyle}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
          </svg>
        </button>
      )}

      {/* 3D Сцена */}
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <Suspense fallback={<Loader />}>
          {selectedTest && (
            <Scene 
              paused={paused} 
              joystickData={joystickData} 
              test={selectedTest} 
            />
          )}
        </Suspense>
      </Canvas>
    </div>
  )
}

// Стили
const overlayStyle: React.CSSProperties = {
  position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
  zIndex: 2000, display: 'flex', flexDirection: 'column', alignItems: 'center', 
  justifyContent: 'center', background: 'rgba(0, 27, 38, 0.96)', color: 'white',
  padding: '20px', textAlign: 'center', backdropFilter: 'blur(5px)'
};

const menuButtonStyle = {
  padding: '14px 40px', fontSize: '20px', cursor: 'pointer',
  background: '#00d2ff', color: 'white', border: 'none', borderRadius: '12px',
  fontWeight: 'bold' as const, transition: 'transform 0.2s',
  boxShadow: '0 4px 15px rgba(0,210,255,0.3)'
};

const testButtonStyle = {
  ...menuButtonStyle,
  background: 'white', color: '#001b26', width: '100%', fontSize: '16px', marginBottom: '8px'
};

const backButtonStyle = {
  background: 'none', color: '#00d2ff', border: '1px solid #00d2ff', 
  padding: '5px 15px', borderRadius: '20px', cursor: 'pointer', marginBottom: '10px'
};

const pauseIconStyle: React.CSSProperties = {
  position: 'absolute', top: '20px', right: '20px', zIndex: 1000,
  width: '50px', height: '50px', backgroundColor: 'rgba(0, 0, 0, 0.5)',
  border: '2px solid rgba(255, 255, 255, 0.3)', borderRadius: '15px', 
  cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'
};

createRoot(document.getElementById('root')!).render(
  <StrictMode><App /></StrictMode>
)
