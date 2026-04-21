import { useRef, useMemo, useState } from "react"
import { useFrame } from "@react-three/fiber"
import { Center, useGLTF, Html } from "@react-three/drei"
import * as THREE from "three"
import type { FoodItem } from "./FoodManager"

export const Steak = (props: { item: FoodItem }) => {
  const { item } = props
  const { scene: steakScene } = useGLTF('/models/toon_steak_min.glb', '/draco/')
  const { scene: boxScene } = useGLTF('/models/wooden_box_min.glb', '/draco/')
  
  const steakClone = useMemo(() => steakScene.clone(), [steakScene])
  const boxClone = useMemo(() => boxScene.clone(), [boxScene])

  const groupRef = useRef<THREE.Group>(null!)
  const pointsRef = useRef<THREE.Points>(null!)
  
  const [showSteak, setShowSteak] = useState(false)
  const [opacity, setOpacity] = useState(1)

  // Генерируем 30 мелких точек
  const count = 100
  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(count * 3).fill(0)
    const vels = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      vels[i * 3] = (Math.random() - 0.5) * 0.3
      vels[i * 3 + 1] = (Math.random() - 0.5) * 0.3
      vels[i * 3 + 2] = (Math.random() - 0.5) * 0.3
    }
    return [pos, vels]
  }, [])

  useFrame((_, delta) => {
    if (item.eaten) {
      // 1. Анимация разлета частиц (Пуф!)
      if (opacity > 0 && pointsRef.current) {
        const geo = pointsRef.current.geometry
        const posAttr = geo.attributes.position
        for (let i = 0; i < count; i++) {
          posAttr.setXYZ(
            i,
            posAttr.getX(i) + velocities[i * 3],
            posAttr.getY(i) + velocities[i * 3 + 1],
            posAttr.getZ(i) + velocities[i * 3 + 2]
          )
        }
        posAttr.needsUpdate = true
        setOpacity(prev => Math.max(0, prev - delta * 2))
        
        // Показываем стейк почти сразу после взрыва
        if (opacity < 0.7 && !showSteak) setShowSteak(true)
      }

      // 2. Полет стейка вверх
      if (showSteak && item.right) {
        groupRef.current.rotation.z += delta
      }
    }
  })

  return (
    <group ref={groupRef} position={item.position}>
      {/* КОРОБКА */}
      {!item.eaten && (
        <primitive ref={item.ref} object={boxClone} scale={0.003} />
      )}

      {/* ЧАСТИЦЫ: РЕАЛЬНО МАЛЕНЬКИЕ */}
      {item.eaten && opacity > 0 && (
        <points ref={pointsRef}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          </bufferGeometry>
          <pointsMaterial 
            size={0.02} // <-- Регулируй этот параметр для размера точек
            transparent 
            opacity={opacity} 
            color="brown" 
            sizeAttenuation={true}
          />
        </points>
      )}

      {/* СТЕЙК */}
      {showSteak && item.right && (
        <Center top>
          <primitive 
            object={steakClone} 
            scale={0.005} 
            rotation={[Math.PI / 2, Math.PI, 0]} 
          />
        </Center>
      )}

      {/* ТЕКСТ */}
      {item.label && (
        <Html position={[0, 0.4, 0]} center distanceFactor={8}>
          <div style={{
            color:item.eaten?item.right?'green':'red':'white',
            background: 'rgba(0,0,0,0.5)',
            padding: '4px 12px',
            borderRadius: '15px',
            fontSize: '28px',
            fontWeight: 'bold',
            pointerEvents: 'none'
          }}>
            {item.label}
          </div>
        </Html>
      )}
    </group>
  )
}

useGLTF.preload('/models/toon_steak_min.glb', '/draco/')
useGLTF.preload('/models/wooden_box_min.glb', '/draco/')
