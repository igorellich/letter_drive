import * as THREE from 'three'
import { useThree, useFrame } from "@react-three/fiber"
import { useRef, useMemo } from "react"
import { WaterMaterial } from "./WaterMaterial"

export const WaterLayer = ({ position, speed, opacity, zoom }: any) => {
  const mesh = useRef<THREE.Mesh>(null!)
  const { viewport } = useThree()

  // Клонируем униформы, чтобы слои были независимы
  const layerUniforms = useMemo(() => ({
    uTime: { value: 0 },
    uDepthColor: { value: new THREE.Color('#007da1') },
    uSurfaceColor: { value: new THREE.Color('#7df9ff') },
    uScale: { value: zoom },
    uOpacity: { value: opacity }
  }), [zoom, opacity])

  useFrame((state) => {
    layerUniforms.uTime.value = state.clock.getElapsedTime() * speed
  })

  return (
    <mesh ref={mesh} position={position} scale={[viewport.width * 1.5, viewport.height * 1.5, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        vertexShader={WaterMaterial.vertexShader}
        fragmentShader={WaterMaterial.fragmentShader}
        transparent
        uniforms={layerUniforms}
        depthWrite={false}
      />
    </mesh>
  )
}