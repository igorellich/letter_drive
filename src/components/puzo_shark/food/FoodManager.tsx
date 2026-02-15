import React, { useEffect} from 'react'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'
import { useCollision } from './useCollision'


export interface FoodItem {
  id: number
  position: THREE.Vector3
  // Добавляем ref, чтобы коллизии видели реальное положение меша, а не стейт
  ref?: React.RefObject<THREE.Group> 
}

interface FoodManagerProps {
  foodItems: FoodItem[]
  setFoodItems: React.Dispatch<React.SetStateAction<FoodItem[]>>
  maxItems?: number
  sharkRef: React.RefObject<THREE.Mesh>
  handleEat: (id: number) => void
  // Компонент, который будет отрисован для каждой еды
  FoodComponent: React.ComponentType<{ item: FoodItem }>
}

export const FoodManager = ({ 
  foodItems, 
  setFoodItems, 
  maxItems = 15,
  sharkRef,
  handleEat,
  FoodComponent
}: FoodManagerProps) => {
  const { viewport } = useThree()

  // Логика коллизий (использует ref-ы объектов для точности)
  useCollision(sharkRef, foodItems, handleEat, 0.7)

  // Интервал спавна
  useEffect(() => {
    const interval = setInterval(() => {
      setFoodItems(prev => {
        if (prev.length >= maxItems) return prev

        const margin = 1
        const x = (Math.random() - 0.5) * (viewport.width - margin)
        const y = (Math.random() - 0.5) * (viewport.height - margin)
        
        const newItem: FoodItem = {
          id: Date.now(),
          position: new THREE.Vector3(x, y, -0.45),
          ref: React.createRef() as React.RefObject<THREE.Group<THREE.Object3DEventMap>>  // Создаем ref для связи с мешем
        }
        return [...prev, newItem]
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [viewport, maxItems, setFoodItems])

  return (
    <>
      {foodItems.map(item => (
        <group key={item.id} ref={item.ref} position={item.position}>
          <FoodComponent item={item} />
        </group>
      ))}
    </>
  )
}
