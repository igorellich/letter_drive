import { Canvas } from '@react-three/fiber'
import { Physics, RigidBody } from '@react-three/rapier'
import { PlayerCube } from './PlayerCube'
import { Grid } from '@react-three/drei'
import { DrawingCanvas } from './DrawingCanvas'
import { useRef, useState } from 'react'
import { CameraController } from './components/CameraController'
import { ItemSpawner } from './components/ItemSpawner'
import { useItemSpawner } from './hooks/useItemSpawner'

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
  const [path, setPath] = useState<Point[]>([])
  const canvasRef = useRef<any>(null)

  // Use the item spawner hook
  const { items, handlePickup } = useItemSpawner({
    maxItems: 12,
    spawnInterval: 2000,
    spawnRadius: 80,
    seedCount: 4,
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

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Canvas shadows camera={{ position: [0, 80, 0], fov: 50 }}>
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[0, 1000, 0]}
          intensity={2.5}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />

        <CameraController items={items} defaultHeight={80} />

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
              <planeGeometry args={[100, 100]} />
              <meshStandardMaterial
                color="#1e1eda"
                roughness={0.4}
                metalness={0.1}
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
            sectionColor="#333"
            cellColor="#222"
          />
        </Physics>
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

