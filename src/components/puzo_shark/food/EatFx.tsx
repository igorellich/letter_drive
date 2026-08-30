import { useRef, useCallback, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export type EatFxHandle = { burstAt: (worldPos: THREE.Vector3) => void }

const FLASH_GEOM = new THREE.SphereGeometry(0.18, 12, 12)
const SPLASH_GEOM = new THREE.RingGeometry(0.15, 0.2, 20)

export const EatFx = ({ handleRef }: { handleRef?: React.RefObject<EatFxHandle | null> }) => {
  const lightRef = useRef<THREE.PointLight>(null)
  const flashRef = useRef<THREE.Mesh>(null)
  const ringRefs = useRef<(THREE.Mesh | null)[]>([])
  const burstRef = useRef({ t: -1e9, pos: new THREE.Vector3() })

  const flashMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#cfffff', transparent: true, opacity: 0,
    blending: THREE.AdditiveBlending, depthWrite: false
  }), [])
  const ringMats = useMemo(() => [0, 1, 2].map(i => new THREE.MeshBasicMaterial({
    color: i % 2 === 0 ? '#7df9ff' : '#ffffff', transparent: true, opacity: 0,
    blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false
  })), [])

  const burstAt = useCallback((worldPos: THREE.Vector3) => {
    burstRef.current.t = performance.now()
    burstRef.current.pos.copy(worldPos)
  }, [])

  useEffect(() => {
    if (handleRef) handleRef.current = { burstAt }
    return () => { if (handleRef) handleRef.current = null }
  }, [handleRef, burstAt])

  useFrame(() => {
    const dt = (performance.now() - burstRef.current.t) / 1000
    if (dt < 0 || dt > 0.6) {
      if (lightRef.current) lightRef.current.intensity = 0
      if (flashRef.current) {
        flashRef.current.visible = false
        ;(flashRef.current.material as THREE.MeshBasicMaterial).opacity = 0
      }
      ringRefs.current.forEach(m => { if (m) m.visible = false })
      return
    }
    const pos = burstRef.current.pos

    if (lightRef.current) {
      lightRef.current.position.copy(pos)
      lightRef.current.position.z += 0.3
      lightRef.current.intensity = Math.max(0, 8 * (1 - dt / 0.4))
    }
    if (flashRef.current) {
      flashRef.current.position.copy(pos)
      flashRef.current.scale.setScalar(1 + dt * 3)
      const m = flashRef.current.material as THREE.MeshBasicMaterial
      m.opacity = Math.max(0, 0.9 * (1 - dt / 0.25))
      flashRef.current.visible = m.opacity > 0.01
    }
    ringRefs.current.forEach((m, i) => {
      if (!m) return
      const p = Math.max(0, dt - i * 0.07)
      const k = Math.min(1, p / 0.45)
      m.position.copy(pos)
      m.rotation.z = i
      m.scale.setScalar(0.6 + k * 2.4)
      const mat = m.material as THREE.MeshBasicMaterial
      mat.opacity = (1 - k) * 0.7
      m.visible = k < 1
    })
  })

  return (
    <group>
      <pointLight ref={lightRef} color="#7df9ff" intensity={0} distance={6} decay={1.5} />
      <mesh ref={flashRef} geometry={FLASH_GEOM} material={flashMat} visible={false} />
      {ringMats.map((mat, i) => (
        <mesh key={i} ref={(el) => { ringRefs.current[i] = el }} geometry={SPLASH_GEOM} material={mat} visible={false} />
      ))}
    </group>
  )
}