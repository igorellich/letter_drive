import { useRef, useMemo, useState } from "react"
import { useFrame } from "@react-three/fiber"
import { Center, useGLTF, PointMaterial, Html } from "@react-three/drei" // Добавили Html
import * as THREE from "three"
import type { FoodItem } from "./FoodManager"

export const Steak = (props: { item: FoodItem }) => {
  const { item } = props
  const { scene } = useGLTF('/models/toon_steak.glb')
  const clone = useMemo(() => scene.clone(), [scene])
  const [eaten, setEaten] = useState<boolean>(false);
  const particlesCount = 50

  const [positions, stepVectors] = useMemo(() => {
    const pos = new Float32Array(particlesCount * 3)
    const steps = []
    for (let i = 0; i < particlesCount; i++) {
      pos[i * 3] = 0; pos[i * 3 + 1] = 0; pos[i * 3 + 2] = 0;
      steps.push(new THREE.Vector3(
        (Math.random() - 0.5) * 0.05,
        (Math.random() - 0.5) * 0.05,
        (Math.random() - 0.5) * 0.05
      ))
    }
    return [pos, steps]
  }, [])

  const particlesRef = useRef<THREE.Points>(null!)

  useFrame((_, delta) => {
    setEaten(!!item.eaten)
    if (item.ref && item.ref.current && !item.eaten) {
      item.ref.current.rotation.z += 0.01
    }

    if (item.eaten && particlesRef.current) {
      particlesRef.current.visible = true
      const geo = particlesRef.current.geometry
      const posAttr = geo.attributes.position
      const mat = particlesRef.current.material as THREE.PointsMaterial

      if (mat.opacity > 0) {
        mat.opacity -= delta * 0.8
        mat.size += delta * 0.5
        for (let i = 0; i < particlesCount; i++) {
          posAttr.setXYZ(
            i,
            posAttr.getX(i) + stepVectors[i].x,
            posAttr.getY(i) + stepVectors[i].y,
            posAttr.getZ(i) + stepVectors[i].z
          )
        }
        posAttr.needsUpdate = true
      } else {
        particlesRef.current.visible = false
      }
    }
  })

  return (
    <group position={item.position}>
      {/* Отображение Label */}
      {item.label && !eaten && (
        <>
          <Html
            position={[0, 0.3, 0]} // Чуть выше стейка
            center                 // Центрируем текст относительно точки
            distanceFactor={6}     // Уменьшает текст при отдалении камеры
          >
            <div style={{
              color: 'white',
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
              background: 'rgba(0,0,0,0.4)',
              padding: '2px 8px',
              borderRadius: '10px',
              fontSize: '32px',
              fontWeight: 'bold',
              fontFamily: 'sans-serif',
              whiteSpace: 'nowrap',
              pointerEvents: 'none', // Чтобы текст не мешал кликам
              userSelect: 'none'
            }}>
              {item.label}
            </div>
          </Html>
          <Center ref={item.ref} top visible={!eaten}>
            <primitive
              object={clone}
              scale={0.005}
              position={[0, -0.4, 0]}
              rotation={[Math.PI / 2, Math.PI, 0]}
            />
          </Center>
        </>
      )}



      <points ref={particlesRef} visible={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <PointMaterial
          transparent
          color={item.right?"#00aa00":"#aa0000"}
          size={0.02}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={1}
          blending={THREE.NormalBlending}
        />
      </points>
    </group>
  )
}

useGLTF.preload('/models/toon_steak.glb')
