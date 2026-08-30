import { StrictMode, useState, Suspense, useEffect, createContext} from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Scene } from './components/puzo_shark/Scene'
import { type JoystickData } from './components/puzo_shark/Joystick'
import { Canvas } from '@react-three/fiber'
import { Loader } from './components/puzo_shark/Loader'

// Типы и данные
import type { ITest } from './components/puzo_shark/food/tests/interfaces';
import { menuButtonStyle, TestSelectionMenu } from './components/puzo_shark/hud/TestSelectionMenu'
import { useAudio } from './components/puzo_shark/hooks/useAudio'
import { DiversScene } from './components/puzo_shark/DiversScene'
import { AppStateController } from './components/puzo_shark/food/AppStateController'
import { SKINS, loadSkinId, saveSkinId, type SharkSkin } from './components/puzo_shark/skins/sharkSkins'
import { SkinPicker } from './components/puzo_shark/skins/SkinPicker'
import { MainMenu } from './components/puzo_shark/hud/MainMenu'
import { TwoGrade } from './components/puzo_shark/food/tests/grades/2grade/2Grade'
import { ThreeGrade } from './components/puzo_shark/food/tests/grades/3grade/3Grade'

const ALL_GRADES = [TwoGrade, ThreeGrade];

const joystickData: JoystickData = { x: 0, y: 0, active: false }
export const FreezeContext = createContext<(freeze:boolean)=>void>((_)=>true);
const App = () => {
  const [gameStarted, setGameStarted] = useState(false)
  const [paused, setPaused] = useState(true)
  const [selectedTest, setSelectedTest] = useState<ITest | null>(null)
  const [freeze, setFreeze] = useState<boolean>(false);
  const [diversMode, setDiversMode] = useState<boolean>(false);
  const [currentSkinId, setCurrentSkinId] = useState<string>(loadSkinId);
  const [skinPickerOpen, setSkinPickerOpen] = useState<boolean>(false);
  const [testMenuOpen, setTestMenuOpen] = useState<boolean>(false);
  const [coins, setCoins] = useState<number>(() => AppStateController.getState().coins);
  const [ownedSkins, setOwnedSkins] = useState<string[]>(() => AppStateController.getState().ownedSkins);
  const currentSkin = SKINS.find(s => s.id === currentSkinId) ?? SKINS[0];
  const buySkin = (skin: SharkSkin) => {
    if (ownedSkins.includes(skin.id) || coins < skin.price) return;
    const newCoins = coins - skin.price;
    const newOwned = [...ownedSkins, skin.id];
    setCoins(newCoins);
    setOwnedSkins(newOwned);
    setCurrentSkinId(skin.id);
    saveSkinId(skin.id);
    const state = AppStateController.getState();
    state.coins = newCoins;
    state.ownedSkins = newOwned;
    AppStateController.setState(state);
  }
  // Используем наш хук. Музыка играет только если игра запущена И не на паузе.
  useAudio({
    src: '/music/main.ogg',
    paused: !gameStarted || paused,
    autoRepeat: true,
    volume: 0.5
  });
  useEffect(()=>{
    const onVisibilityChange = ()=>{
      if(document.hidden){
        setPaused(true);
      }
        
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return ()=>document.removeEventListener('visibilitychange', onVisibilityChange);
  },[])
  const toggleFullscreen = (force?: boolean) => {
    const shouldEnter = force !== undefined ? force : !document.fullscreenElement;
    if (shouldEnter) {
      document.documentElement.requestFullscreen().then(() => {
        //@ts-ignore
        if (screen.orientation?.lock) screen.orientation.lock('landscape').catch(() => { });
      }).catch((e) => console.error(e));
    } 
    else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }

  useEffect(()=>{
    setFreeze(paused);
  },[paused])

  const startGame = (test: ITest|null) => {
    setSelectedTest(test);
    setGameStarted(true);
    setPaused(false);
    toggleFullscreen(true);
    setDiversMode(test===null);
  }

  const exitToMenu = () => {
    setGameStarted(false);
    setSelectedTest(null);
    setPaused(true);
    setDiversMode(false);
    if (document.fullscreenElement) document.exitFullscreen();
  }
  const shareGame = () => {
    const url = location.href;
    const text = '🦈 Попробуй «Ешь стейк!» — решай тесты, лови дайверов и собирай скины!';
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({ title: 'Ешь стейк!', text, url }).catch(() => {});
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
    }
  };
  const diversTimeLeft = AppStateController.getState().diversTimeLeftSec;
  return (
    <div className="app-root" style={{ width: '100vw', position: 'relative', overflow: 'hidden', background: '#001b26' }}>

      {/* Overlay: Меню и Пауза */}
      {paused && (
        <div style={overlayStyle}>
          {!gameStarted ? (skinPickerOpen ? (
            <SkinPicker
              currentSkinId={currentSkin.id}
              coins={coins}
              ownedSkins={ownedSkins}
              onBuy={buySkin}
              onPick={(id) => { saveSkinId(id); setCurrentSkinId(id); setSkinPickerOpen(false); }}
              onClose={() => setSkinPickerOpen(false)}
            />
          ) : testMenuOpen ? (
            <TestSelectionMenu startGame={startGame} onExitMenu={() => setTestMenuOpen(false)} />
          ) : (
            <MainMenu
              coins={coins}
              diversTimeLeftSec={diversTimeLeft}
              diversEaten={AppStateController.getState().diversEaten}
              testsCount={ALL_GRADES.reduce((n, g) => n + g.subjects.reduce((s, subj) => s + subj.quarters.reduce((t, q) => t + q.tests.length, 0), 0), 0)}
              onOpenTests={() => setTestMenuOpen(true)}
              onStartDivers={() => { if (diversTimeLeft > 0) startGame(null) }}
              onOpenSkins={() => setSkinPickerOpen(true)}
              onShare={shareGame}
            />
          )
          ) : (
            /* МЕНЮ ПАУЗЫ */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(10px, 2.4vh, 18px)', alignItems: 'center' }}>
              <h2 style={{ margin: 0, color: '#00d2ff', fontSize: 'clamp(1.8rem, 6vh, 2.6rem)', textShadow: '0 0 20px rgba(0,210,255,0.5)' }}>⏸ Пауза</h2>
              <button onClick={() => { setPaused(false); toggleFullscreen(true); }} style={{ ...menuButtonStyle, width: 'min(70vw, 320px)', borderRadius: 20 }}>
                ▶ Продолжить
              </button>
              <button onClick={exitToMenu} style={{ ...menuButtonStyle, width: 'min(70vw, 320px)', borderRadius: 20, background: 'linear-gradient(135deg, #f87171 0%, #dc2626 100%)' }}>
                🏠 Выйти в меню
              </button>
            </div>
          )}
        </div>
      )}

      {/* Кнопка паузы (HUD) */}
      {gameStarted && !freeze && (
        <button onClick={() => setPaused(true)} style={pauseIconStyle}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
          </svg>
        </button>
      )}
      <FreezeContext.Provider value={setFreeze}>
      {/* 3D Сцена */}
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }} frameloop={freeze?"never":"always"}>
        {gameStarted && <Suspense fallback={<Loader />}>
          {selectedTest && (
            <Scene
              onBack={exitToMenu}
              freeze={freeze}
              joystickData={joystickData}
              test={selectedTest}
              height={15}
              width={15}
              skin={currentSkin}
            />
          )}
          {diversMode && (
            <DiversScene
              onBack={exitToMenu}
              freeze={freeze}
              joystickData={joystickData}             
              height={20}
              width={20}
              skin={currentSkin}
            />
          )}
        </Suspense>}
      </Canvas>
      </FreezeContext.Provider>
    </div>
  )
}

// Стили
const overlayStyle: React.CSSProperties = {
  position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
  zIndex: 2000, display: 'flex', flexDirection: 'column', alignItems: 'center',
  justifyContent: 'center', background: 'rgba(8, 25, 38, 0.97)', color: 'white',
  textAlign: 'center', backdropFilter: 'blur(6px)', opacity: 1
};

const pauseIconStyle: React.CSSProperties = {
  position: 'absolute', top: '20px', right: '80px', zIndex: 1000,
  width: '50px', height: '50px', backgroundColor: 'rgba(0, 0, 0, 0.5)',
  border: '2px solid rgba(255, 255, 255, 0.3)', borderRadius: '15px',
  cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'
};

createRoot(document.getElementById('root')!).render(
  <StrictMode><App /></StrictMode>
)
