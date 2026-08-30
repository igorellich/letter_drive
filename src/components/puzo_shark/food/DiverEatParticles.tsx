import { useRef, useEffect, useMemo, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

type Particle = {
  pos: THREE.Vector3
  vel: THREE.Vector3
  size: number
  life: number
  maxLife: number
  color: THREE.Color
}

export type DiverEatParticlesHandle = { burstAt: (worldPos: THREE.Vector3) => void }

const COUNT = 80

export const DiverEatParticles = ({ handleRef }: { handleRef?: React.RefObject<DiverEatParticlesHandle | null> }) => {
  const pointsRef = useRef<THREE.Points>(null)
  const geometryRef = useRef<THREE.BufferGeometry | null>(null)
  const particlesRef = useRef<Particle[]>([])
  const isReadyRef = useRef(false)

  // Мягкая круглая точка-искра (как пузырёк, но плотнее по центру)
  const sparkTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 32
    canvas.height = 32
    const ctx = canvas.getContext('2d')!
    const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 16)
    g.addColorStop(0, 'rgba(255,255,255,1)')
    g.addColorStop(0.4, 'rgba(255,255,255,0.9)')
    g.addColorStop(0.7, 'rgba(255,255,255,0.35)')
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 32, 32)
    return new THREE.CanvasTexture(canvas)
  }, [])

  // Геометрия и «мёртвые» частицы внизу
  useEffect(() => {
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(COUNT * 3)
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3] = 0
      positions[i * 3 + 1] = -1000
      positions[i * 3 + 2] = 0
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.computeBoundingSphere()
    geometryRef.current = geometry

    const arr: Particle[] = []
    for (let i = 0; i < COUNT; i++) {
      arr.push({
        pos: new THREE.Vector3(0, -1000, 0),
        vel: new THREE.Vector3(),
        size: 0.04 + Math.random() * 0.05,
        life: 2, // сразу «мёртвые»
        maxLife: 1,
        color: new THREE.Color('#fff')
      })
    }
    particlesRef.current = arr
    isReadyRef.current = true
    return () => geometry.dispose()
  }, [])

  const burstAt = useCallback((worldPos: THREE.Vector3) => {
    const src = new THREE.Vector3().copy(worldPos)
    src.z += 0.2 // над поверхностью воды
    for (const p of particlesRef.current) {
      p.life = 0
      p.pos.set(src.x, src.y, src.z)
      // случайный разлёт по кругу (top-down: x/y), небольшой разброс по z
      const angle = Math.random() * Math.PI * 2
      const speed = 0.6 + Math.random() * 1.6
      p.vel.set(Math.cos(angle) * speed, Math.sin(angle) * speed, (Math.random() - 0.5) * 0.6)
      p.maxLife = 0.35 + Math.random() * 0.45
      p.size = 0.035 + Math.random() * 0.05
      // красно-оранжевые «брызги» + белые искры
      const hot = Math.random() < 0.5
      p.color.set(hot ? '#ff9a5a' : '#aef3ff')
    }
  }, [])

  useEffect(() => {
    if (handleRef) handleRef.current = { burstAt }
    return () => { if (handleRef) handleRef.current = null }
  }, [handleRef, burstAt])

  useFrame((_, delta) => {
    if (!isReadyRef.current || !geometryRef.current) return
    const positions = (geometryRef.current.attributes.position as THREE.BufferAttribute).array as Float32Array
    for (let i = 0; i < particlesRef.current.length; i++) {
      const p = particlesRef.current[i]
      p.life += delta
      if (p.life < p.maxLife) {
        p.pos.x += p.vel.x * delta
        p.pos.y += p.vel.y * delta
        p.pos.z += p.vel.z * delta
        // небольшое торможение
        p.vel.multiplyScalar(1 - delta * 2.2)
        // оседаем/всплываем чуть вверх после разлёта
        p.pos.z += 0.08 * delta
      } else {
        p.pos.set(0, -1000, 0)
      }
      positions[i * 3] = p.pos.x
      positions[i * 3 + 1] = p.pos.y
      positions[i * 3 + 2] = p.pos.z
    }
    ;(geometryRef.current.attributes.position as THREE.BufferAttribute).needsUpdate = true
    geometryRef.current.computeBoundingSphere()
  })

  if (!isReadyRef.current) return null

  return (
    // @ts-ignore
    <points ref={pointsRef} geometry={geometryRef.current}>
      <pointsMaterial
        color="#fff"
        map={sparkTexture}
        size={0.35}
        transparent
        opacity={1}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation={true}
      />
    </points>
  )
}
