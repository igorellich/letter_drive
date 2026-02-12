import { Canvas } from '@react-three/fiber'
import { Physics, RigidBody } from '@react-three/rapier'
import { Grid } from '@react-three/drei'
import { useRef, useState } from 'react'
import { CameraController } from './components/CameraController'
import { ItemSpawner } from './components/ItemSpawner'
import { PlayerCube } from './components/PlayerCube'
import { DrawingCanvas } from './components/DrawingCanvas'
import { FramerateCounter } from './components/FramerateCounter'
import { FrameRateLimiter } from './components/FrameRateLimiter'
import { useItemSpawner } from './hooks/useItemSpawner'
import type { ViewportBounds } from './components/CameraController'

interface Point {
  x: number
  y: number
}

/**
 * Main application component
 * 
 * Combines 3D scene rendering with drawing canvas overlay.
 * Manages game state: drawing path, spawned items, and cube interaction.
 */
export default function App() {
  const [frameCount, setFrameCount] = useState(0)
  const [lastTime, setLastTime] = useState(0)
  const [fps, setFps] = useState(0)
  const [path, setPath] = useState<Point[]>([])
  const [viewportBounds, setViewportBounds] = useState<ViewportBounds | undefined>(undefined)
  const canvasRef = useRef<any>(null)

  // Use the item spawner hook
  const { items, handlePickup } = useItemSpawner({
    maxItems: 5,
    spawnInterval: 2000,
    spawnRadius: 80,
    seedCount: 4,
    viewportBounds,
  })

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

  // Determine plane size based on viewport or use default
  const planeSize = viewportBounds
    ? Math.max(viewportBounds.width, viewportBounds.height) + 4
    : 100

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Canvas shadows gl={{ preserveDrawingBuffer: true }} camera={{ position: [0, 80, 0], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[30, 100, 30]}
          intensity={2}
          castShadow
          shadow-mapSize={[1024, 1024]}
          color="#ffffff"
        />

        <CameraController items={items} defaultHeight={80} onViewportChange={setViewportBounds} />

        <Physics>
          <PlayerCube
            path={path}
            onPathComplete={clearDrawing}
            canvas={canvasRef.current}
            items={items}
            onPickup={handlePickup}
          />

          <RigidBody type="fixed" rotation={[-Math.PI / 2, 0, 0]}>
            <mesh receiveShadow>
              <planeGeometry args={[planeSize, planeSize]} />
              <meshStandardMaterial
                color="#2d5016"
                roughness={0.9}
                metalness={0}
              />
            </mesh>
          </RigidBody>

          <ItemSpawner items={items} />

          <Grid
            infiniteGrid
            fadeDistance={50}
            fadeStrength={5}
            cellSize={1}
            sectionSize={3}
            sectionColor="#1a3d0a"
            cellColor="#0d2605"
          />
        </Physics>
        <FramerateCounter limit={25} />
      </Canvas>

      <DrawingCanvas
        ref={canvasRef}
        onPathUpdate={handlePathUpdate}
        onPathComplete={handlePathComplete}
      />

      <div
        style={{
          position: 'absolute',
          left: 8,
          top: 8,
          zIndex: 30,
          color: 'white',
          background: 'rgba(0,0,0,0.4)',
          padding: 8,
          borderRadius: 6,
        }}
      >
        <div>Items: {items.length}</div>
        {items.slice(0, 6).map(it => (
          <div key={it.id} style={{ fontSize: 12 }}>
            {it.id}: ({it.x.toFixed(1)}, {it.z.toFixed(1)})
          </div>
        ))}
      </div>
    </div>
  )
}

