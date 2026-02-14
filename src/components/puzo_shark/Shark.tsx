import { useGLTF, useAnimations, Center } from '@react-three/drei'
import { useEffect, useMemo, type RefObject } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import type { JoystickData } from './Joystick'


export const Shark = (props:{meshRef: RefObject<THREE.Mesh>, joystickData: JoystickData}) => {
  const {joystickData} = props;
  const { scene, animations } = useGLTF('/models/shark.glb')
  const { actions, names } = useAnimations(animations, scene)
  const { viewport } = useThree()

  // Вспомогательные переменные для расчетов (чтобы не создавать новые каждый кадр)
  const targetPos = useMemo(() => new THREE.Vector3(0, 0, -0.5), [])
  const targetQuaternion = useMemo(() => new THREE.Quaternion(), [])

  useEffect(() => {
    if (names.length > 0) {
      // Запускаем основную анимацию (обычно плавание)
      const action = actions[names[0]]
      action?.reset().fadeIn(0.5).play()
    }
    
    scene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        obj.castShadow = true
        obj.receiveShadow = true
      }
    })
  }, [actions, names, scene])

  useFrame((_, delta) => {
    if (!props.meshRef.current) return

    // 1. Ускорение анимации
    const action = actions[names[0]]
    if (action) {
      const inputIntensity = Math.sqrt(joystickData.x ** 2 + joystickData.y ** 2)
      // Базовая скорость 0.6 + бонус от джойстика. Lerp делает ускорение мягким.
      const targetSpeed = 0.6 + inputIntensity * 30.0
      action.timeScale = THREE.MathUtils.lerp(action.timeScale, targetSpeed, 0.1)
    }

    // 2. Плавное движение (Lerp)
    if (joystickData.active) {
      const moveSpeed = 6 * delta
      // Вычисляем смещение
      targetPos.x += joystickData.x * moveSpeed
      targetPos.y += joystickData.y * moveSpeed

      // Ограничение границами экрана
      const margin = 1.0
      targetPos.x = THREE.MathUtils.clamp(targetPos.x, -viewport.width / 2 + margin, viewport.width / 2 - margin)
      targetPos.y = THREE.MathUtils.clamp(targetPos.y, -viewport.height / 2 + margin, viewport.height / 2 - margin)
      
      // Поворот "лицом" к направлению
      const angle = Math.atan2(joystickData.x, joystickData.y)
      targetQuaternion.setFromAxisAngle(new THREE.Vector3(0, 0, 1), -angle)
    }

    // Применяем позицию и поворот плавно
    props.meshRef.current.position.lerp(targetPos, 0.1) // 0.1 - коэффициент мягкости хода
    props.meshRef.current.quaternion.slerp(targetQuaternion, 0.1) // 0.1 - мягкость поворота
  })

  return (
    <group ref={props.meshRef}>
      <Center top position={[0,0,0.44]}> 
        <primitive 
          object={scene} 
          scale={0.003} 
          // Важно: поворот внутри primitive оставляем статичным, 
          // чтобы "нос" смотрел вперед по оси движения группы
          rotation={[Math.PI / 2, Math.PI, 0]} 
        />
      </Center>
    </group>
  )
}

useGLTF.preload('/models/shark.glb')
