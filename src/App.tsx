import { Canvas } from '@react-three/fiber'
import { Physics, RigidBody } from '@react-three/rapier'
import { PlayerCube } from './PlayerCube' // импорт вашего компонента
import { Grid } from '@react-three/drei'
import { DrawingCanvas } from './DrawingCanvas'
import { useState, useRef, useEffect } from 'react'
import { useThree } from '@react-three/fiber'

interface Point {
  x: number
  y: number
}

interface Item {
  id: number
  x: number
  z: number
}

export default function App() {
  const [path, setPath] = useState<Point[]>([])
  const canvasRef = useRef<any>(null)
  const [items, setItems] = useState<Item[]>([])

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

  // Spawn items periodically
  useEffect(() => {
    // seed a few items immediately for testing (include one at origin)
    setItems(() => {
      const seeded: Item[] = []
      // guaranteed visible item near origin
      seeded.push({ id: Date.now(), x: 0, z: 0 })
      // a second nearby item
      seeded.push({ id: Date.now() + 1, x: 3, z: -2 })
      for (let i = 2; i < 4; i++) {
        const id = Date.now() + i
        const x = (Math.random() - 0.5) * 80
        const z = (Math.random() - 0.5) * 80
        seeded.push({ id, x, z })
      }
      console.log('seeded items', seeded)
      return seeded
    })

    const spawnInterval = setInterval(() => {
      setItems(prev => {
        if (prev.length >= 12) return prev
        const id = Date.now() + Math.floor(Math.random() * 1000)
        const x = (Math.random() - 0.5) * 80 // within plane [-40,40]
        const z = (Math.random() - 0.5) * 80
        const next = [...prev, { id, x, z }]
        console.log('spawned item', next[next.length - 1])
        return next
      })
    }, 2000)

    return () => clearInterval(spawnInterval)
  }, [])

  const handlePickup = (id: number) => {
    console.log('picked up', id)
    setItems(prev => prev.filter(i => i.id !== id))
  }

  // Camera controller component to focus on items
  function CameraController({ items }: { items: Item[] }) {
    const { camera } = useThree()

    // set top-down on mount
    useEffect(() => {
      camera.position.set(0, 80, 0)
      camera.up.set(0, 0, -1)
      camera.lookAt(0, 0, 0)
      camera.updateProjectionMatrix()
    }, [])

    const focusOnItems = () => {
      if (!items || items.length === 0) return
      // compute bounding box center
      let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity
      for (const it of items) {
        minX = Math.min(minX, it.x)
        maxX = Math.max(maxX, it.x)
        minZ = Math.min(minZ, it.z)
        maxZ = Math.max(maxZ, it.z)
      }
      const centerX = (minX + maxX) / 2
      const centerZ = (minZ + maxZ) / 2
      const spanX = maxX - minX
      const spanZ = maxZ - minZ
      const span = Math.max(spanX, spanZ, 10)

      // position camera directly above the center so view is top-down
      camera.position.set(centerX, Math.max(30, span * 1.5), centerZ)
      camera.up.set(0, 0, -1)
      camera.lookAt(centerX, 0, centerZ)
      camera.updateProjectionMatrix()
    }

    // Expose via global for debug button
    ;(window as any).__focusItems = focusOnItems

    return null
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Canvas shadows camera={{ position: [0, 80, 0], fov: 50 }}>
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

        <CameraController items={items} />

        <Physics>
         
          <PlayerCube path={path} onPathComplete={clearDrawing} canvas={canvasRef.current} items={items} onPickup={handlePickup} />
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
          {/* spawned items (physics bodies) */}
          {items.map(item => (
            <RigidBody key={item.id} type="fixed" position={[item.x, 0.6, item.z]}>
              <mesh castShadow>
                <sphereGeometry args={[0.6, 16, 16]} />
                <meshStandardMaterial color="yellow" emissive="#ffb84d" emissiveIntensity={0.6} />
              </mesh>
            </RigidBody>
          ))}

          {/* debug-only plain markers (always visible) */}
          {items.map(item => (
            <mesh key={"dbg" + item.id} position={[item.x, 1.0, item.z]}> 
              <sphereGeometry args={[0.8, 12, 12]} />
              <meshStandardMaterial color="red" emissive="#ff4444" emissiveIntensity={0.9} opacity={0.9} transparent={true} />
            </mesh>
          ))}

          {/* guaranteed debug marker at origin */}
          <mesh position={[0, 1.0, 0]}> 
            <sphereGeometry args={[0.8, 12, 12]} />
            <meshStandardMaterial color="lime" emissive="#aaff00" emissiveIntensity={0.9} />
          </mesh>

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
      <div style={{ position: 'absolute', left: 8, top: 8, zIndex: 30, color: 'white', background: 'rgba(0,0,0,0.4)', padding: 8, borderRadius: 6 }}>
        <div>Items: {items.length}</div>
        {items.slice(0, 6).map(it => (
          <div key={it.id} style={{ fontSize: 12 }}>{it.id}: ({it.x.toFixed(1)}, {it.z.toFixed(1)})</div>
        ))}
      </div>
    </div>
  )
}

