import { useGLTF, useAnimations} from '@react-three/drei'
import { useEffect, type RefObject } from 'react'

import * as THREE from 'three'



export const Shark = (props:{actionRef:RefObject<THREE.AnimationAction>}) => {
 
  const { scene, animations } = useGLTF('/models/shark.glb')
  const { actions, names } = useAnimations(animations, scene)
  
  useEffect(() => {
    
    if (names.length > 0) {
      props.actionRef.current = actions[names[0]] as THREE.AnimationAction;
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



  return (
    <group rotation={[0,0,0]} position={[0,0, 0.45]}>
     
        <primitive 
          object={scene} 
          scale={0.003} 
          // Важно: поворот внутри primitive оставляем статичным, 
          // чтобы "нос" смотрел вперед по оси движения группы
          rotation={[Math.PI / 2, Math.PI, 0]} 
          
        />
    </group>
  )
}

useGLTF.preload('/models/shark.glb')
