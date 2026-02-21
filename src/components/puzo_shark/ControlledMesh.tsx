import { useMemo, useRef, type ReactElement, type RefObject } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import type { JoystickData } from './Joystick';
import { TopDownBubbleTrail } from './BubbleTrail';



export const ControlledMesh = (props: {
  baseSpeed: number,
  children: (actionRef: RefObject<THREE.AnimationAction>) => ReactElement,
  meshRef: RefObject<THREE.Mesh>,
  joystickData: JoystickData
}) => {
  const { joystickData } = props;

  const { viewport } = useThree() // Получаем размеры экрана в 3D единицах


  // Вспомогательные переменные для расчетов (чтобы не создавать новые каждый кадр)
  const targetPos = useMemo(() => new THREE.Vector3(0, 0, -0.5), [])
  const targetQuaternion = useMemo(() => new THREE.Quaternion(), [])
  const actionRef = useRef<THREE.AnimationAction>(null!);

  useFrame((_, delta) => {

    // 1. Ускорение анимации

    if (actionRef.current) {
      const inputIntensity = Math.sqrt(joystickData.x ** 2 + joystickData.y ** 2)
      // Базовая скорость 0.6 + бонус от джойстика. Lerp делает ускорение мягким.
      const targetSpeed = 0.6 + inputIntensity * 30.0
      actionRef.current.timeScale = THREE.MathUtils.lerp(actionRef.current.timeScale, targetSpeed, 0.1)
    }

    // 2. Плавное движение (Lerp)
    if (joystickData.active) {
      const moveSpeed = 3 * delta
      // Вычисляем смещение
      targetPos.x += joystickData.x * moveSpeed
      targetPos.y += joystickData.y * moveSpeed

      // Ограничение границами экрана
      const margin = 0.5
      targetPos.x = THREE.MathUtils.clamp(targetPos.x, -viewport.width / 2 + margin, viewport.width / 2 - margin)
      targetPos.y = THREE.MathUtils.clamp(targetPos.y, -viewport.height / 2 + margin, viewport.height / 2 - margin)

      // Поворот "лицом" к направлению
      const angle = Math.atan2(joystickData.x, joystickData.y)
      targetQuaternion.setFromAxisAngle(new THREE.Vector3(0, 0, 1), -angle)
    }

    // Применяем позицию и поворот плавно
    props.meshRef.current.position.lerp(targetPos, 0.2) // 0.1 - коэффициент мягкости хода
    props.meshRef.current.quaternion.slerp(targetQuaternion, 0.25) // 0.1 - мягкость поворота

  })

  return (
    <group>
      <group ref={props.meshRef}>
        {props.children(actionRef)}
      </group>
      
        {/* ПУЗЫРЬКИ! 🫧 */}
        <TopDownBubbleTrail
          sharkRef={props.meshRef}
          count={400}                 // много пузырьков
          bubbleColor="#aaddff"        // нежно-голубые
          bubbleSize={0.03}             // крупные, чтобы было видно сверху
          riseSpeed={0.004}              // медленно поднимаются
          trailWidth={0.005}             // широкий след
          trailDensity={0.3}           // очень плотный
          maxHeight={0.1}              // высоко поднимаются
        />
      
    </group>

  )
}
