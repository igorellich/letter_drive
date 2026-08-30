import { useRef, useCallback, useEffect, type ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export type CameraShakeHandle = { shake: (duration?: number, magnitude?: number) => void }

export const CameraShakeRig = ({ handleRef, children }: {
  handleRef?: React.RefObject<CameraShakeHandle | null>,
  children: ReactNode
}) => {
  const groupRef = useRef<THREE.Group>(null)
  const activeRef = useRef({ until: 0, mag: 0.06 })

  const shake = useCallback((duration = 0.35, magnitude = 0.06) => {
    activeRef.current.until = performance.now() + duration * 1000
    activeRef.current.mag = magnitude
  }, [])

  useEffect(() => {
    if (handleRef) handleRef.current = { shake }
    return () => { if (handleRef) handleRef.current = null }
  }, [handleRef, shake])

  useFrame(() => {
    const g = groupRef.current
    if (!g) return
    const k = (activeRef.current.until - performance.now()) / 1000
    if (k <= 0) {
      if (g.position.lengthSq() > 0.00001) g.position.set(0, 0, 0)
      return
    }
    const mag = activeRef.current.mag * Math.min(1, k * 3)
    g.position.set(
      (Math.random() - 0.5) * mag * 2,
      (Math.random() - 0.5) * mag * 2,
      (Math.random() - 0.5) * mag
    )
  })

  return <group ref={groupRef}>{children}</group>
}