import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { FoodItem } from './FoodManager'

export const useCollision = (
  meshRef: React.RefObject<THREE.Mesh>,
  foodItems: FoodItem[],
  onEat: (id: number) => void,
  radius: number = 0.7
) => {
  useFrame(() => {
    if (!meshRef.current || foodItems.length === 0) return

    const playerPos = meshRef.current.position

    for (const food of foodItems) {
      // Используем квадрат расстояния для оптимизации (быстрее чем distanceTo)
      const distanceSq = playerPos.distanceToSquared(food.pos)
      
      if (distanceSq < radius * radius) {
        onEat(food.id)
      }
    }
  })
}
