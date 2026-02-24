import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import { Center, useGLTF, PointMaterial } from "@react-three/drei"
import * as THREE from "three"
import type { FoodItem } from "./FoodManager"

export const Steak = (props: { item: FoodItem }) => {
  const { item } = props
  const { scene } = useGLTF('/models/toon_steak.glb')
  const clone = useMemo(() => scene.clone(), [scene])
  
  const particlesCount = 50 // Меньше частиц, но они крупнее
  
  // Создаем начальные позиции и направления разлета
  const [positions, stepVectors] = useMemo(() => {
    const pos = new Float32Array(particlesCount * 3)
    const steps = []
    for (let i = 0; i < particlesCount; i++) {
      // Все частицы начинаются в центре (0,0,0)
      pos[i * 3] = 0; pos[i * 3 + 1] = 0; pos[i * 3 + 2] = 0;
      
      // Генерируем случайный вектор разлета во все стороны
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
    if (item.ref && item.ref.current && !item.eaten) {
      item.ref.current.rotation.z += 0.04
    }

    if (item.eaten && particlesRef.current) {
      particlesRef.current.visible = true
      const geo = particlesRef.current.geometry
      const posAttr = geo.attributes.position
      const mat = particlesRef.current.material as THREE.PointsMaterial

      if (mat.opacity > 0) {
        // 1. Плавное исчезновение
        mat.opacity -= delta * 0.8
        
        // 2. Увеличение размера (эффект расширения газа)
        mat.size += delta * 0.5

        // 3. Двигаем каждую частицу по её вектору
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
      <Center ref={item.ref} top visible={!item.eaten}>
        <primitive
          object={clone}
          scale={0.005}
          position={[0, -0.4, 0]}
          rotation={[Math.PI / 2, Math.PI, 0]}
        />
      </Center>

      <points ref={particlesRef} visible={false}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
        </bufferGeometry>
        {/* PointMaterial из Drei автоматически делает точки мягкими кругами */}
        <PointMaterial
          transparent
          color="#aa0000"
          size={0.02}            // Начальный крупный размер
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
