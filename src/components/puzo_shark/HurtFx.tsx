import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export type HurtFxHandle = { burst: () => void }

const STAR_COUNT = 12
const DURATION = 1.1

const RING_GEOM = new THREE.RingGeometry(0.26, 0.32, 48)
const STAR_GEOM = new THREE.TetrahedronGeometry(0.075)

export const HurtFx = ({ handleRef }: { handleRef?: RefObject<HurtFxHandle | null> }) => {
  const [bursting, setBursting] = useState(false)
  const startRef = useRef(0)
  const ringsRef = useRef<(THREE.Mesh | null)[]>([])
  const starsRef = useRef<(THREE.Mesh | null)[]>([])

  const ringMats = useMemo(() => [
    new THREE.MeshBasicMaterial({ color: '#ff6b6b', transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }),
    new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false })
  ], [])
  const starMats = useMemo(() => Array.from({ length: STAR_COUNT }, (_, i) =>
    new THREE.MeshBasicMaterial({
      color: i % 3 === 0 ? '#ffe066' : i % 3 === 1 ? '#ffffff' : '#ff9f43',
      transparent: true, opacity: 0, depthWrite: false
    })
  ), [])

  const burst = useCallback(() => {
    startRef.current = performance.now()
    setBursting(true)
  }, [])

  useEffect(() => {
    if (handleRef) handleRef.current = { burst }
    return () => { if (handleRef) handleRef.current = null }
  }, [handleRef, burst])

  useFrame(() => {
    if (!bursting) return
    const t = (performance.now() - startRef.current) / 1000
    if (t >= DURATION) {
      setBursting(false)
      ringsRef.current.forEach(m => { if (m) { m.visible = false } })
      starsRef.current.forEach(m => { if (m) { m.visible = false } })
      return
    }

    ringsRef.current.forEach((m, i) => {
      if (!m) return
      const p = Math.max(0, t - i * 0.18)
      const k = Math.min(1, p / 0.8)
      m.scale.setScalar(0.3 + k * k * 2.6)
      m.position.set(0, 0, -0.35)
      const mat = m.material as THREE.MeshBasicMaterial
      mat.opacity = (1 - k) * (i === 0 ? 0.8 : 0.6)
      m.visible = true
    })

    for (let i = 0; i < STAR_COUNT; i++) {
      const m = starsRef.current[i]
      if (!m) continue
      const a = (i / STAR_COUNT) * Math.PI * 2
      const r = 0.3 + Math.pow(t, 2) * 1.9
      const bob = Math.sin(t * 9 + a * 2) * 0.06
      m.position.set(Math.cos(a) * r, Math.sin(a) * r + bob, 0.05)
      m.rotation.x += 0.18
      m.rotation.y += 0.24
      const mat = m.material as THREE.MeshBasicMaterial
      mat.opacity = Math.max(0, 1 - t / 0.85)
      m.scale.setScalar(Math.min(1, 0.4 + t * 2.4))
      m.visible = true
    }
  })

  return (
    <group>
      {ringMats.map((mat, i) => (
        <mesh key={i} ref={(el) => { ringsRef.current[i] = el }} geometry={RING_GEOM} material={mat} visible={false} />
      ))}
      {starMats.map((mat, i) => (
        <mesh key={i} ref={(el) => { starsRef.current[i] = el }} geometry={STAR_GEOM} material={mat} visible={false} />
      ))}
    </group>
  )
}