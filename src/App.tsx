import { Canvas } from '@react-three/fiber'
import { Physics, RigidBody } from '@react-three/rapier'
import { PlayerCube } from './PlayerCube' // импорт вашего компонента
import { Grid } from '@react-three/drei'
import { DrawingCanvas } from './DrawingCanvas'
import { useState, useRef } from 'react'

interface Point {
  x: number
  y: number
}

export default function App() {
  const [path, setPath] = useState<Point[]>([])
  const canvasRef = useRef<any>(null)

  const handlePathUpdate = (points: Point[]) => {
    setPath([...points])
  }

  const handlePathComplete = (points: Point[]) => {
    setPath(points)
  }

  const clearDrawing = () => {
    if (canvasRef.current?.clearDrawing) {
      canvasRef.current.clearDrawing()
    }
    setPath([])
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
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

        <Physics>
         
          <PlayerCube path={path} onPathComplete={clearDrawing} />
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
      <DrawingCanvas ref={canvasRef} onPathUpdate={handlePathUpdate} onPathComplete={handlePathComplete} />
    </div>
  )
}

