import { useEffect, type RefObject } from 'react'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'
import { useCollision } from './useCollision'

export interface FoodItem {
  id: number
  pos: THREE.Vector3
}

export const FoodManager = ({ 
  foodItems, 
  setFoodItems, 
  maxItems = 15,
  sharkRef,
  handleEat
}: { 
  foodItems: FoodItem[], 
  setFoodItems: React.Dispatch<React.SetStateAction<FoodItem[]>>,
  maxItems?: number ,
  sharkRef:RefObject<THREE.Mesh>,
  handleEat: (id: number) => void
}) => {
  const { viewport } = useThree()
    // Логика коллизий теперь живет здесь и работает каждый кадр
    useCollision(sharkRef, foodItems, handleEat, 0.6)
  useEffect(() => {
    const interval = setInterval(() => {
      setFoodItems(prev => {
        if (prev.length >= maxItems) return prev

        // Генерируем позицию в пределах вьюпорта (с небольшим отступом 0.5)
        const margin = 0.5
        const x = (Math.random() - 0.5) * (viewport.width - margin)
        const y = (Math.random() - 0.5) * (viewport.height - margin)

        return [...prev, { id: Date.now(), pos: new THREE.Vector3(x, y, 0) }]
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [viewport, maxItems, setFoodItems])

  return (
    <>
      {foodItems.map(item => (
        <mesh key={item.id} position={item.pos}>
          <sphereGeometry args={[0.2]} />
          <meshStandardMaterial color="#ffdd00" emissive="#ffaa00" />
        </mesh>
      ))}
    </>
  )
}
