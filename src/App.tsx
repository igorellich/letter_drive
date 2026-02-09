import { Canvas } from '@react-three/fiber'
import { Physics, RigidBody } from '@react-three/rapier'
import { PlayerCube } from './PlayerCube' // импорт вашего компонента
import { Grid } from '@react-three/drei'

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas shadows camera={{ position: [0, 15, 0], fov: 50 }}>
        {/* 1. Общий мягкий свет, чтобы сцена не была черной */}
        <ambientLight intensity={0.4} />

        {/* 2. Направленный свет (имитация солнца) для создания теней */}
        <directionalLight
          position={[0, 1000, 0]}
          intensity={2.5}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />

        {/* 3. Опционально: точечный свет над кубом, чтобы он "светился" */}
        {/* Можно поместить его прямо внутрь компонента PlayerCube */}

        <Physics debug>
         
          <PlayerCube />
          <RigidBody type="fixed" rotation={[-Math.PI / 2, 0, 0]}>
            <mesh receiveShadow>
              <planeGeometry args={[100, 100]} />
              <meshStandardMaterial
                color="#1e1eda"    // Темно-синий оттенок
                roughness={0.4}    // Сделает пол чуть глянцевым
                metalness={0.1}
              />
            </mesh>
          </RigidBody>
           <Grid
            infiniteGrid
            fadeDistance={50}
            fadeStrength={5}
            cellSize={1}
            sectionSize={3}
            sectionColor="#333"
            cellColor="#222"
          />
        </Physics>
      </Canvas>
    </div>
  )
}

