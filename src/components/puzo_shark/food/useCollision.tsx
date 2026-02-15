import { useFrame } from "@react-three/fiber"
import type { FoodItem } from "./FoodManager"
import * as THREE from 'three'
export const useCollision = (
  playerRef: React.RefObject<THREE.Mesh>, 
  items: FoodItem[], 
  onEat: (id: number) => void,
  distance: number
) => {
  const worldPos = new THREE.Vector3()

  useFrame(() => {
    if (!playerRef.current) return

    items.forEach(item => {
      if (item.ref && item.ref.current) {
        // Получаем реальную позицию объекта в пространстве (с учетом анимации)
        item.ref.current.getWorldPosition(worldPos)
        const playerworldPos= new THREE.Vector3();
        playerRef.current!.getWorldPosition(playerworldPos);
        console.log(playerworldPos, worldPos)
        if (playerworldPos.distanceTo(worldPos) < distance) {
          onEat(item.id)
        }
      }
    })
  })
}
