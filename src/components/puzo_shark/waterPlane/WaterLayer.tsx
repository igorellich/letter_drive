import * as THREE from 'three'
import { useFrame } from "@react-three/fiber"
import { useRef, useMemo } from "react"
import { WaterMaterial } from "./WaterMaterial"

export const WaterLayer = (props:{ position: [x: number, y: number, z: number], speed:number, opacity:number, zoom:number, width:number, height:number }) => {
  const mesh = useRef<THREE.Mesh>(null!)
  const {height,opacity,position,speed,width,zoom} = props;

  // Клонируем униформы, чтобы слои были независимы
  const layerUniforms = useMemo(() => ({
    uTime: { value: 0 },
    uDepthColor: { value: new THREE.Color('#007da1') },
    uSurfaceColor: { value: new THREE.Color('#7df9ff') },
    uScale: { value: (width+height)/2 },
    uOpacity: { value: opacity }
  }), [zoom, opacity])

  useFrame((state) => {
    layerUniforms.uTime.value = state.clock.getElapsedTime() * speed
  })

  return (
    <mesh ref={mesh} position={position} scale={[1, 1, 1]}>
      <planeGeometry args={[width,height]} />
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