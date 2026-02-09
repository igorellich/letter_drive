import { useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { RigidBody, RapierRigidBody } from '@react-three/rapier'
import * as THREE from 'three'

interface Point {
  x: number
  y: number
}

interface PlayerCubeProps {
  path?: Point[]
  onPathComplete?: () => void
}

export const PlayerCube = ({ path = [], onPathComplete }: PlayerCubeProps) => {
  const rb = useRef<RapierRigidBody>(null)
  const { camera } = useThree()
  const [pathIndex, setPathIndex] = useState(0)
  const [isFollowingPath, setIsFollowingPath] = useState(false)
  
  // Vспомогательные объекты
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0) // Плоскость на уровне пола
  const raycaster = new THREE.Raycaster()
  const point = new THREE.Vector3()

  // Detect when path changes
  const prevPathLengthRef = useRef(0)

  useFrame((state) => {
    if (!rb.current) return

    // Start following when path has points (only on first point)
    if (path.length > 0 && prevPathLengthRef.current === 0) {
      setPathIndex(0)
      setIsFollowingPath(true)
    }
    prevPathLengthRef.current = path.length

    if (isFollowingPath && path.length > 0 && pathIndex < path.length) {
      // Following the drawn path
      const targetPoint = path[pathIndex]
      
      // Convert screen coordinates to world coordinates
      const vector = new THREE.Vector3(
        (targetPoint.x / window.innerWidth) * 2 - 1,
        -((targetPoint.y / window.innerHeight) * 2 - 1),
        0.5
      )
      vector.unproject(camera)
      
      raycaster.ray.origin.copy(camera.position)
      raycaster.ray.direction.copy(vector.sub(camera.position).normalize())
      
      const targetWorld = new THREE.Vector3()
      if (raycaster.ray.intersectPlane(plane, targetWorld)) {
        const currentPos = rb.current.translation()
        const currentVector = new THREE.Vector3(currentPos.x, currentPos.y, currentPos.z)
        const distance = currentVector.distanceTo(targetWorld)
        
        // Move towards the waypoint
        const lerpFactor = 0.15
        rb.current.setNextKinematicTranslation({
          x: THREE.MathUtils.lerp(currentPos.x, targetWorld.x, lerpFactor),
          y: 0.5,
          z: THREE.MathUtils.lerp(currentPos.z, targetWorld.z, lerpFactor)
        })
        
        // If close enough, move to next waypoint
        if (distance < 2) {
          const nextIndex = pathIndex + 1
          if (nextIndex < path.length) {
            setPathIndex(nextIndex)
          } else {
            // Path complete
            setIsFollowingPath(false)
            setPathIndex(0)
            prevPathLengthRef.current = 0
            if (onPathComplete) {
              onPathComplete()
            }
          }
        }
      }
    } else if (!isFollowingPath) {
      // Default behavior: follow mouse/pointer
      raycaster.setFromCamera(state.pointer, state.camera)
      
      if (raycaster.ray.intersectPlane(plane, point)) {
        const currentPos = rb.current.translation()
        
        rb.current.setNextKinematicTranslation({
          x: THREE.MathUtils.lerp(currentPos.x, point.x, 0.15),
          y: 0.5,
          z: THREE.MathUtils.lerp(currentPos.z, point.z, 0.15)
        })
      }
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
