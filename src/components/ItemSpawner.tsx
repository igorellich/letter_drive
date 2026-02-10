import { RigidBody } from '@react-three/rapier'
import type { Item } from '../hooks/useItemSpawner'

/**
 * Props for ItemSpawner component
 */
export interface ItemSpawnerProps {
  items: Item[]
}

/**
 * Renders spawned collectible items in the 3D scene
 * 
 * Each item is displayed as:
 * - Yellow sphere (physics) at height 0.6
 * - Red debug marker at height 1.0
 * 
 * @param props Items to render
 * @returns Three.js mesh group
 */
export const ItemSpawner = ({ items }: ItemSpawnerProps) => {
  return (
    <>
      {/* Main physics-enabled item spheres */}
      {items.map(item => (
        <RigidBody key={item.id} type="fixed" position={[item.x, 0.6, item.z]}>
          <mesh castShadow>
            <sphereGeometry args={[0.6, 16, 16]} />
            <meshStandardMaterial
              color="yellow"
              emissive="#ffb84d"
              emissiveIntensity={0.6}
            />
          </mesh>
        </RigidBody>
      ))}

      {/* Debug red markers for item visualization */}
      {items.map(item => (
        <mesh key={'dbg' + item.id} position={[item.x, 1.0, item.z]}>
          <sphereGeometry args={[0.8, 12, 12]} />
          <meshStandardMaterial
            color="red"
            emissive="#ff4444"
            emissiveIntensity={0.9}
            opacity={0.9}
            transparent={true}
          />
        </mesh>
      ))}

      {/* Origin marker (debug only) */}
      <mesh position={[0, 1.0, 0]}>
        <sphereGeometry args={[0.8, 12, 12]} />
        <meshStandardMaterial
          color="lime"
          emissive="#aaff00"
          emissiveIntensity={0.9}
        />
      </mesh>
    </>
  )
}
