import type { Item } from '../hooks/useItemSpawner'

/**
 * Props for ItemSpawner component
 */
export interface ItemSpawnerProps {
  items: Item[]
}

/**
 * Renders spawned collectible items as flowers in the 3D scene
 * 
 * Each item is displayed as:
 * - Flower stem (green cylinder)
 * - Flower petals (colored sphere)
 * 
 * @param props Items to render
 * @returns Three.js mesh group
 */
export const ItemSpawner = ({ items }: ItemSpawnerProps) => {
  // Vary flower colors for visual interest
  const flowerColors = ['#ff69b4', '#ff6b9d', '#ff1493', '#ff69b4', '#ff85c1']
  
  return (
    <>
      {/* Flower items */}
      {items.map((item, idx) => {
        const flowerColor = flowerColors[idx % flowerColors.length]
        return (
          <group key={item.id} position={[item.x, 0, item.z]} scale={[3, 3, 3]}>
            {/* Stem */}
            <mesh castShadow>
              <cylinderGeometry args={[0.08, 0.1, 0.8, 8]} />
              <meshStandardMaterial color="#2d5016" roughness={0.7} />
            </mesh>
            
            {/* Flower head */}
            <mesh castShadow position={[0, 0.6, 0]}>
              <sphereGeometry args={[0.35, 16, 16]} />
              <meshStandardMaterial
                color={flowerColor}
                emissive={flowerColor}
                emissiveIntensity={0.3}
                roughness={0.4}
              />
            </mesh>
            
            {/* Flower center */}
            <mesh castShadow position={[0, 0.65, 0]}>
              <sphereGeometry args={[0.15, 12, 12]} />
              <meshStandardMaterial
                color="#ffde69"
                emissive="#ffde69"
                emissiveIntensity={0.5}
              />
            </mesh>
          </group>
        )
      })}
    </>
  )
}

