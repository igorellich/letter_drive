import * as THREE from 'three'
import { useFrame } from "@react-three/fiber"
import { useRef, useMemo } from "react"

interface LayerProps {
  count: number
  spread: number
  size: number
  color: string
  opacity: number
  riseSpeed: number
  driftX: number
  z: number
}

const Layer = ({ count, spread, size, color, opacity, riseSpeed, driftX, z }: LayerProps) => {
  const points = useRef<THREE.Points>(null!)

  const seed = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * spread
      pos[i * 3 + 1] = (Math.random() - 0.5) * spread
      pos[i * 3 + 2] = z + (Math.random() - 0.5) * 0.5
    }
    return pos
  }, [count, spread, z])

  const speeds = useMemo(() => {
    const s = new Float32Array(count)
    for (let i = 0; i < count; i++) s[i] = riseSpeed * (0.5 + Math.random())
    return s
  }, [count, riseSpeed])

  useFrame((state) => {
    const p = points.current
    if (!p) return
    const t = state.clock.getElapsedTime()
    const posAttr = (p.geometry.attributes.position as THREE.BufferAttribute)
    const arr = posAttr.array as Float32Array
    for (let i = 0; i < count; i++) {
      let y = arr[i * 3 + 1] + speeds[i] * 0.02
      if (y > spread / 2) y = -spread / 2
      arr[i * 3 + 1] = y
      // Лёгкий дрейф
      arr[i * 3] += Math.sin(t * 0.7 + i) * 0.0015 + driftX * 0.003
      if (arr[i * 3] > spread / 2) arr[i * 3] = -spread / 2
    }
    posAttr.needsUpdate = true
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[seed, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        color={color}
        transparent
        opacity={opacity}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  )
}

export const Bubbles = ({ count = 900 }: { count?: number }) => {
  return (
    <group>
      {/* Глубокая "пыль"/планктон — медленная, сине-голубая */}
      <Layer count={Math.floor(count * 0.5)} spread={16} size={0.02} color="#7fd4ff" opacity={0.25} riseSpeed={0.05} driftX={0.01} z={-1.2} />
      {/* Передний планктон */}
      <Layer count={Math.floor(count * 0.35)} spread={16} size={0.035} color="#bff2ff" opacity={0.35} riseSpeed={0.12} driftX={-0.02} z={-0.6} />
      {/* Крупные пузырьки */}
      <Layer count={Math.floor(count * 0.15)} spread={15} size={0.06} color="#ffffff" opacity={0.4} riseSpeed={0.25} driftX={0.0} z={-0.1} />
    </group>
  )
}