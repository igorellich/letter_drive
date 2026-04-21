import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface FollowCameraProps {
  targetRef: React.RefObject<THREE.Mesh>
  offset?: [number, number, number]
}

export const useFollowingCamera = ({ targetRef, offset = [0, 0, 5] }: FollowCameraProps) => {
  // Вспомогательные векторы для расчетов (чтобы не создавать новые каждый кадр)
  const targetPosition = new THREE.Vector3()
  const cameraPosition = new THREE.Vector3()

  useFrame((state) => {
    if (!targetRef.current) return

    // 1. Получаем текущую позицию меша в мировых координатах
    targetRef.current.getWorldPosition(targetPosition)

    // 2. Вычисляем желаемую позицию камеры с учетом смещения (offset)
    cameraPosition.set(
      targetPosition.x + offset[0],
      targetPosition.y + offset[1],
      targetPosition.z + offset[2]
    )

    // 3. Плавно перемещаем камеру (lerp) к новой позиции
    // 0.1 — коэффициент плавности (чем меньше, тем медленнее следование)
    state.camera.position.lerp(cameraPosition, 0.5)

    // 4. Заставляем камеру всегда смотреть на меш
    state.camera.lookAt(targetPosition)
  })
  
}