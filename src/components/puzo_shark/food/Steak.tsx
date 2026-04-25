import { useRef, useMemo, useState, useEffect, useContext } from "react"
import { useFrame } from "@react-three/fiber"
import { Center, useGLTF } from "@react-three/drei"
import * as THREE from "three"
import type { FoodItem } from "./FoodManager"
import { QuestionLabel } from "../hud/QuestionLabel"
import { FreezeContext } from "../../../main"

export const Steak: React.ComponentType<{ item: FoodItem, onSelectAnswer:(item: FoodItem)=>void }> = (props: { item: FoodItem, onSelectAnswer:(item: FoodItem)=>void }) => {
  const { item, onSelectAnswer } = props
  const { scene: steakScene } = useGLTF('/models/toon_steak_min.glb', '/draco/')
  const { scene: boxScene } = useGLTF('/models/wooden_box_min.glb', '/draco/')
  
  const steakClone = useMemo(() => steakScene.clone(), [steakScene])
  const boxClone = useMemo(() => boxScene.clone(), [boxScene])
  const setFreeze = useContext(FreezeContext);
  const groupRef = useRef<THREE.Group>(null!)
  const pointsRef = useRef<THREE.Points>(null!)
  
  const [showSteak, setShowSteak] = useState(false)
  const [opacity, setOpacity] = useState(1)

  const [showQuestion, setShowQuestion] = useState<boolean>(false);

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
      if (item.right !== true && item.right !== false) {
        setShowQuestion(true)
      }

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

      }

      // 2. Полет стейка вверх
      if (showSteak && item.right) {
        groupRef.current.rotation.z += delta
        groupRef.current.position.y += delta/2
      }
    }
  })
  useEffect(() => {
    if (showSteak) {
      setShowQuestion(false)
    }
  }, [showSteak])
  useEffect(() => {

    setFreeze(showQuestion);


  }, [showQuestion])
  const afterAnswer = (foodItem: FoodItem) => {
    
    setShowSteak(true);
    onSelectAnswer(foodItem);

  }
  return (
    <group ref={groupRef} position={item.position}>
      {/* КОРОБКА */}
      {!showQuestion && !showSteak && (
        <primitive ref={item.ref} object={boxClone} scale={0.003} />
      )}

      {/* ЧАСТИЦЫ: РЕАЛЬНО МАЛЕНЬКИЕ */}
      {showQuestion && opacity > 0 && (
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
            scale={0.01}
            rotation={[Math.PI / 2, Math.PI, 0]}
          />
        </Center>
      )}

      {/* Текст вопроса сверху */}
      {showQuestion && <QuestionLabel onSelectAnswer={afterAnswer} foodItem={item} />}

    </group>
  )
}

useGLTF.preload('/models/toon_steak_min.glb', '/draco/')
useGLTF.preload('/models/wooden_box_min.glb', '/draco/')
