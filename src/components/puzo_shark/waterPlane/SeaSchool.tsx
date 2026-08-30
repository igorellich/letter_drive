import { useMemo, useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import * as THREE from 'three'
// @ts-ignore
import { clone } from 'three/examples/jsm/utils/SkeletonUtils'
import { FOOD_SPECIES } from '../food/foodSpecies'

const SCHOOL_LIMIT = 18
const SCHOOL_SPECIES = ['clownfish', 'yellow_tang', 'goldfish', 'blue_tang', 'piranha', 'koi']

const SchoolFish = ({ speciesId, sceneWidth, sceneHeight, rand }: {
  speciesId: string, sceneWidth: number, sceneHeight: number, rand: number
}) => {
  const species = useMemo(() => FOOD_SPECIES.find(s => s.id === speciesId)!, [speciesId])
  const { scene, animations } = useGLTF(species.path, '/draco/')
  const cloneScene = useMemo(() => clone(scene), [scene])
  const { actions, names } = useAnimations(animations, cloneScene)
  const g = useRef<THREE.Group>(null!)
  const target = useRef(new THREE.Vector3(0, 0, -0.35))
  const tmpV = useRef(new THREE.Vector3())
  const tmpQ = useRef(new THREE.Quaternion())
  const faceQ = useRef(new THREE.Quaternion())
  const phase = useRef(rand * Math.PI * 2)
  const speed = useRef(0.7 + rand * 0.7)

  useEffect(() => {
    const action = names.length ? (actions[names.find(n => /swim|swimming/i.test(n)) || names[0]] || null) : null
    action?.reset().fadeIn(0.3).play()
    if (action) action.timeScale = 0.8
  }, [actions, names])

  useFrame((state, delta) => {
    const node = g.current
    if (!node) return
    const t = state.clock.getElapsedTime()
    const halfW = sceneWidth / 2 - 0.5
    const halfH = sceneHeight / 2 - 0.5
    // Целевая точка — плавное блуждание
    if (node.position.distanceTo(target.current) < 0.8 || t < delta) {
      target.current.set(
        THREE.MathUtils.clamp(node.position.x + (Math.random() - 0.5) * 9, -halfW, halfW),
        THREE.MathUtils.clamp(node.position.y + (Math.random() - 0.5) * 9, -halfH, halfH),
        -0.3 - Math.random() * 0.4
      )
    }
    tmpV.current.subVectors(target.current, node.position)
    if (tmpV.current.length() > 0.05) {
      const angle = Math.atan2(tmpV.current.x, tmpV.current.y)
      faceQ.current.setFromAxisAngle(new THREE.Vector3(0, 0, 1), -angle)
      tmpQ.current.slerpQuaternions(faceQ.current, node.quaternion, 0.06)
      node.quaternion.copy(tmpQ.current)
    }
    node.position.lerp(target.current, Math.min(speed.current, delta * speed.current))
    node.position.z += Math.sin(t * 1.2 + phase.current) * 0.004
  })

  return (
    <group ref={g} position={[
      (Math.random() - 0.5) * sceneWidth * 0.8,
      (Math.random() - 0.5) * sceneHeight * 0.8,
      -0.35
    ]}>
      <group rotation={species.rotation as [number, number, number]} scale={species.scale * 0.7} position={species.position}>
        <primitive object={cloneScene} />
      </group>
    </group>
  )
}

export const SeaSchool = ({ sceneWidth, sceneHeight }: { sceneWidth: number, sceneHeight: number }) => {
  const instances = useMemo(() =>
    Array.from({ length: SCHOOL_LIMIT }, (_, i) => ({
      id: `${i}-${Math.random()}`,
      species: SCHOOL_SPECIES[i % SCHOOL_SPECIES.length],
      rand: Math.random()
    }))
  , [])
  return (
    <group>
      {instances.map(inst => (
        <SchoolFish key={inst.id} speciesId={inst.species} sceneWidth={sceneWidth} sceneHeight={sceneHeight} rand={inst.rand} />
      ))}
    </group>
  )
}