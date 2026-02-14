import { type ReactElement, type RefObject } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import type { JoystickData } from './Joystick';



export const ControlledMesh = (props: {
  baseSpeed: number,
  children: ReactElement[] | ReactElement,
  meshRef: RefObject<THREE.Mesh>,
  joystickData: JoystickData
}) => {
  const { joystickData } = props;
  const { meshRef } = props;
  const { viewport } = useThree() // Получаем размеры экрана в 3D единицах

  const direction = new THREE.Vector3()
  const targetRotation = new THREE.Quaternion()

  useFrame((_, delta) => {
    if (joystickData.active) {
      const speed = props.baseSpeed * delta

      // 1. Рассчитываем новую позицию
      direction.set(joystickData.x, joystickData.y, 0)
      meshRef.current.position.addScaledVector(direction, speed)

      // 2. ОГРАНИЧЕНИЕ ДВИЖЕНИЯ (Screen Borders)
      // Берем ширину и высоту вьюпорта, делим пополам (от центра)
      // Вычитаем небольшой отступ (0.5), чтобы меш не заходил наполовину за край
      const boundaryX = viewport.width / 2 - 0.5
      const boundaryY = viewport.height / 2 - 0.5

      meshRef.current.position.x = THREE.MathUtils.clamp(
        meshRef.current.position.x,
        -boundaryX,
        boundaryX
      )
      meshRef.current.position.y = THREE.MathUtils.clamp(
        meshRef.current.position.y,
        -boundaryY,
        boundaryY
      )

      // 3. Поворот
      const angle = Math.atan2(direction.x, direction.y)
      targetRotation.setFromAxisAngle(new THREE.Vector3(0, 0, 1), -angle)
      meshRef.current.quaternion.slerp(targetRotation, 0.5)
    }
  })

  return (
    <group>
      {props.children}
    </group>

  )
}
