import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import { Center, useGLTF } from "@react-three/drei"
import * as THREE from "three"
import type { FoodItem } from "./FoodManager"

export const Steak = (props: { item: FoodItem }) => {
  const { item } = props
  const { scene } = useGLTF('/models/toon_steak.glb')
  const clone = useMemo(() => scene.clone(), [scene])
  
  const particlesCount = 100
  
  // Создаем геометрию один раз
  const particlesGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const pos = new Float32Array(particlesCount * 3)
    for (let i = 0; i < particlesCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 0.5
      pos[i * 3 + 1] = (Math.random() - 0.5) * 0.5
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.5
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return geo
  }, [])

  const particlesRef = useRef<THREE.Points>(null!)

  useFrame((_, delta) => {
    if (item.ref && item.ref.current && !item.eaten) {
      item.ref.current.rotation.z += 0.04
    }

    if (item.eaten && particlesRef.current) {
      // Делаем видимыми, когда съедено
      particlesRef.current.visible = true
      
      const mat = particlesRef.current.material as THREE.PointsMaterial
      if (mat.opacity > 0) {
        mat.opacity -= delta * 1.0  // Скорость исчезновения
        particlesRef.current.scale.addScalar(delta * 1.5) // Расширение
        particlesRef.current.position.z += delta * 1.0   // Движение вверх
      } else {
        particlesRef.current.visible = false // Полностью скрываем в конце
      }
    }
  })

  return (
    <group position={item.position}>
      {/* Стейк */}
      <Center ref={item.ref} top visible={!item.eaten}>
          <primitive
            object={clone}
            scale={0.005}
            position={[0, -0.4, 0]}
            rotation={[Math.PI / 2, Math.PI, 0]}
          />
      </Center>

      {/* Частицы крови */}
      <points 
        ref={particlesRef} 
        geometry={particlesGeometry} 
        visible={false}
      >
        <pointsMaterial
          transparent
          color="#ff0000"
          size={0.04}           // Уменьши, если слишком большие
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending} // Сделает их "светящимися"
        />
      </points>
    </group>
  )
}

useGLTF.preload('/models/toon_steak.glb')
