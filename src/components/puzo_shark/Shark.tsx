import { useGLTF, useAnimations } from '@react-three/drei'
import { useEffect, type RefObject, useState } from 'react'

import * as THREE from 'three'
import { useMeshDisintegrate } from './hooks/useMeshDisintegrate'



export const Shark = (props: { actionRef: RefObject<THREE.AnimationAction>, wrongAnswerHandleRef:RefObject<()=>void>, modelPath: string, scale: number, rotation:number[] }) => {
  const {modelPath, rotation, scale} = props;
  const { scene, animations } = useGLTF(modelPath, '/draco/');
  const { actions, names } = useAnimations(animations, scene)
  const [exploded, setExploded] = useState<boolean>(false);
  const explodedRef =  useMeshDisintegrate(scene, { delayBeforeExplosion: 500, enabled: exploded });
  useEffect(() => {
    props.wrongAnswerHandleRef.current = ()=>setExploded(true);
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
 
  useEffect(() => {
    if (exploded) {      
      setTimeout(() => {
        setExploded(false);
      },2500)
    }else{
      explodedRef.current=null;
    }
  }, [exploded])


  return (

    <group rotation={[0, 0, 0]} position={[0, 0, 0.45]}>
      {exploded && explodedRef.current ? <primitive object={explodedRef.current as THREE.InstancedMesh} /> : (
        <primitive
          
          object={scene}
          scale={scale}
          // Важно: поворот внутри primitive оставляем статичным, 
          // чтобы "нос" смотрел вперед по оси движения группы
          rotation={rotation}

        />)}
    </group>
  )
}




