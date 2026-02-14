import { useFrame } from "@react-three/fiber"
import { useRef } from "react"
import * as THREE from 'three'
import type { FoodItem } from "./FoodManager"

export const Steak = (props:{item:FoodItem}) => {
    const {item} = props;
  const meshRef = useRef<THREE.Mesh>(null!)
  
  useFrame((state) => {
    // Своя логика: плавно плаваем вверх-вниз
    const time = state.clock.getElapsedTime()
    meshRef.current.position.y = item.position.y + Math.sin(time + item.position.x) * 0.01
    // И вращаемся
    meshRef.current.rotation.z += 0.01
  })

  return (
    <mesh ref={meshRef} position={item.position}>
      <coneGeometry args={[0.2, 0.5]} />
      <meshStandardMaterial color="red" />
    </mesh>
  )
}
