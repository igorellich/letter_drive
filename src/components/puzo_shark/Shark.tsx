import { useGLTF, useAnimations, PositionalAudio } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, type RefObject, useState, Suspense, useRef, useLayoutEffect } from 'react'

import * as THREE from 'three'
import { HurtFx, type HurtFxHandle } from './HurtFx'
import { usePositionalMute } from './hooks/usePositionalMute'



const ANIM_PRIORITY = [/swim/i, /idle/i, /walk/i, /run/i]
const CHARACTER_SKINS = /(robot|trex|triceratops)\.glb/i
// Кэп, чтобы персонажевые скины (робот/дino) не разгонялись до 11x — иначе анимация "дёргается"
const CHARACTER_MAX_TIMESCALE = 2.5

type DriveScaledAction = THREE.AnimationAction & { userData?: { maxTimeScale?: number } }

// У скинов с несколькими анимациями первая не всегда подходящая (у робота — dancer, у дino — attack).
// Выбираем осмысленную: swim > idle > walk > run.
function pickAnimation(actions: { [x: string]: THREE.AnimationAction | null }, names: string[]): THREE.AnimationAction | null {
  if (!names.length) return null
  let bestName = names[0]
  let bestScore = Infinity
  for (const name of names) {
    let score = ANIM_PRIORITY.length
    for (let i = 0; i < ANIM_PRIORITY.length; i++) {
      if (ANIM_PRIORITY[i].test(name)) { score = i; break }
    }
    if (score < bestScore) { bestScore = score; bestName = name }
  }
  return actions[bestName] || null
}

export const Shark = (props: { actionRef: RefObject<THREE.AnimationAction>, wrongAnswerHandleRef?: RefObject<() => void>, modelPath: string, scale: number, rotation: number[], fitSize?: number, position?: [number, number, number] }) => {
  const { modelPath, rotation, scale, fitSize, position = [0, 0, 0] } = props;
  const { scene, animations } = useGLTF(modelPath, '/draco/');
  const { actions, names } = useAnimations(animations, scene)

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
  usePositionalMute(explodeSoundRef);
  const hurtFxRef = useRef<HurtFxHandle | null>(null);
  const hurtStartRef = useRef(-9999);
  const wobRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (props.wrongAnswerHandleRef) {
      props.wrongAnswerHandleRef.current = () => {
        hurtFxRef.current?.burst();
        hurtStartRef.current = performance.now();
        explodeSoundRef.current?.play();
      };
    }
    if (names.length > 0) {
      const action = pickAnimation(actions, names)
      props.actionRef.current = action as THREE.AnimationAction;
      action?.reset().fadeIn(0.5).play()
      if (action) {
        action.timeScale = 1
        // Персонажевые скины анимируются с телами — не даём движку разгонять их до 11x
        ;(action as DriveScaledAction).userData = { maxTimeScale: CHARACTER_SKINS.test(modelPath) ? CHARACTER_MAX_TIMESCALE : 0 }
      }
    }

    scene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        obj.castShadow = true
        obj.receiveShadow = true
      }
    })
  }, [actions, names, scene, modelPath])

  useFrame(() => {
    const g = wobRef.current
    if (!g) return
    const t = (performance.now() - hurtStartRef.current) / 1000
    if (t < 0 || t >= 0.9) {
      g.rotation.z = 0
      g.scale.setScalar(1)
      return
    }
    const k = 1 - t / 0.9
    const wob = Math.sin(t * 42) * 0.2 * k
    const sq = Math.sin(t * 42 + Math.PI) * 0.12 * k
    g.rotation.z = wob
    g.scale.set(1 + sq, 1 - sq, 1)
  })

  return (

    <group position={[0, 0, 0.45]}>
      <group ref={wobRef}>
        <group rotation={rotation as [number, number, number]} scale={effectiveScale} position={position}>
          <primitive object={scene} />
        </group>
      </group>
      <HurtFx handleRef={hurtFxRef} />
      <Suspense>
        <PositionalAudio ref={explodeSoundRef} url="/music/boxes.ogg" distance={50} loop={false} />
      </Suspense>
    </group>
  )
}




