import * as THREE from 'three'
import { useFrame } from "@react-three/fiber"
import { useRef, useMemo } from "react"

export const Bubbles = ({ count = 800 }) => {
  const points = useRef<THREE.Points>(null!)

  const particles = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count * 3; i++) pos[i] = (Math.random() - 0.5) * 15
    return pos
  }, [count])

  useFrame((state) => {
    points.current.position.y = (state.clock.getElapsedTime() * 0.1) % 1
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[particles, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#ffffff" transparent opacity={0.3} sizeAttenuation />
    </points>
  )
}