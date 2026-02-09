import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { RigidBody, RapierRigidBody } from '@react-three/rapier'
import * as THREE from 'three'

export const PlayerCube = () => {
  const rb = useRef<RapierRigidBody>(null)
  const { viewport } = useThree()
  
  // Вспомогательные объекты
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0) // Плоскость на уровне пола
  const raycaster = new THREE.Raycaster()
  const point = new THREE.Vector3()

  useFrame((state) => {
    if (!rb.current) return

    // Обновляем луч из камеры через точку касания
    raycaster.setFromCamera(state.pointer, state.camera)
    
    // Находим точку пересечения луча с нашей невидимой плоскостью пола
    if (raycaster.ray.intersectPlane(plane, point)) {
      const currentPos = rb.current.translation()
      
      // Плавное следование (lerp)
      // 0.15 — скорость догона. Увеличьте до 1 для мгновенного следования.
      rb.current.setNextKinematicTranslation({
        x: THREE.MathUtils.lerp(currentPos.x, point.x, 0.15),
        y: 0.5,
        z: THREE.MathUtils.lerp(currentPos.z, point.z, 0.15)
      })
    }
  })

  return (
    <RigidBody ref={rb} type="kinematicPosition" colliders="cuboid">
      <mesh castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="orange" />
      </mesh>
    </RigidBody>
  )
}
