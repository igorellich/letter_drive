import { useGLTF, useAnimations, PositionalAudio } from '@react-three/drei'
import { useEffect, type RefObject, useState, Suspense, useRef, useLayoutEffect } from 'react'

import * as THREE from 'three'
import { useMeshDisintegrate } from './hooks/useMeshDisintegrate'



export const Shark = (props: { actionRef: RefObject<THREE.AnimationAction>, wrongAnswerHandleRef?: RefObject<() => void>, modelPath: string, scale: number, rotation: number[], fitSize?: number, position?: [number, number, number] }) => {
  const { modelPath, rotation, scale, fitSize, position = [0, 0, 0] } = props;
  const { scene, animations } = useGLTF(modelPath, '/draco/');
  const { actions, names } = useAnimations(animations, scene)
  const [exploded, setExploded] = useState<boolean>(false);
  const explodedRef = useMeshDisintegrate(scene, { delayBeforeExplosion: 500, enabled: exploded });

  const [normalizedScale, setNormalizedScale] = useState<number | null>(null);
  useLayoutEffect(() => {
    if (!fitSize) { setNormalizedScale(null); return; }
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim > 0) setNormalizedScale(fitSize / maxDim);
  }, [fitSize, scene]);
  const effectiveScale = normalizedScale ?? scale;

  const explodeSoundRef = useRef<THREE.PositionalAudio | null>(null);
  useEffect(() => {
    if (props.wrongAnswerHandleRef) {
      props.wrongAnswerHandleRef.current = () => setExploded(true);
    }
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
      }, 2500)
      if (explodeSoundRef.current) {
        explodeSoundRef.current.play();
      }
    } else {
      explodedRef.current = null;
    }
  }, [exploded])


  return (

    <group rotation={[0, 0, 0]} position={[0, 0, 0.45]}>
      {exploded && explodedRef.current ? <>

        <primitive object={explodedRef.current as THREE.InstancedMesh} /></> : (
        <primitive

          object={scene}
          scale={effectiveScale}
          position={position}
          // Важно: поворот внутри primitive оставляем статичным, 
          // чтобы "нос" смотрел вперед по оси движения группы
          rotation={rotation}

        />)}
      <Suspense>
        <PositionalAudio ref={explodeSoundRef} url="/music/boxes.ogg" distance={50} loop={false} />
      </Suspense>
    </group>
  )
}




