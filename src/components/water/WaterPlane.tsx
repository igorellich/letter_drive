import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { KeyboardControls, OrbitControls, Stats } from '@react-three/drei'
import * as THREE from 'three'
import { Shark } from './shark'
import {  ControlledMesh} from './ControlledMesh'
import { Joystick } from './joystick'

const WaterMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uDepthColor: { value: new THREE.Color('#007da1') },
    uSurfaceColor: { value: new THREE.Color('#7df9ff') },
    uScale: { value: 8.0 },
    uOpacity: { value: 0.6 }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec3 uDepthColor;
    uniform vec3 uSurfaceColor;
    uniform float uScale;
    uniform float uOpacity;
    varying vec2 vUv;

    float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
    float noise(vec2 p) {
      vec2 i = floor(p); vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i + vec2(0,0)), hash(i + vec2(1,0)), f.x),
                 mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x), f.y);
    }

    void main() {
      vec2 uv1 = vUv * uScale + vec2(uTime * 0.5, uTime * 0.3);
      vec2 uv2 = vUv * (uScale * 1.2) - vec2(uTime * 0.4, -uTime * 0.2);
      float n1 = noise(uv1);
      float n2 = noise(uv2);
      float finalNoise = (n1 + n2 * 0.5) / 1.5;
      float wave = pow(finalNoise, 1.5);
      vec3 color = mix(uDepthColor, uSurfaceColor, wave);
      float caustics = smoothstep(0.45, 0.55, n1 * n2);
      color += caustics * 0.4;
      gl_FragColor = vec4(color, uOpacity + caustics * 0.2);
    }
  `
}

const WaterLayer = ({ position, speed, opacity, zoom }: any) => {
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

const Bubbles = ({ count = 800 }) => {
  const points = useRef<THREE.Points>(null!)
  const { viewport } = useThree()
  const particles = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for(let i=0; i<count*3; i++) pos[i] = (Math.random() - 0.5) * 15
    return pos
  }, [count])

  useFrame((state) => {
    points.current.position.y = (state.clock.getElapsedTime() * 0.1) % 1
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[particles, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#ffffff" transparent opacity={0.3} sizeAttenuation />
    </points>
  )
}
  // Настройка клавиш
  const map = [
    { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
    { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
    { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
    { name: 'right', keys: ['ArrowRight', 'KeyD'] },
  ]
export const Scene = () => {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#001b26' }}>
          <KeyboardControls map={map}>
             
      {/* Слой интерфейса */}
      <Joystick />
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <OrbitControls 
  makeDefault 
  enablePan={true} 
  enableZoom={true}

/>
        <Stats />
         <ambientLight intensity={2} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
       
       <ControlledMesh />
        <Bubbles count={1000} />
 
  
        <WaterLayer position={[0, 0, -1]} speed={0.4} opacity={0.4} zoom={5.0} />
        <WaterLayer position={[0, 0, 0]} speed={0.8} opacity={0.5} zoom={10.0} />
      </Canvas>
      </KeyboardControls>
    </div>
  )
}
