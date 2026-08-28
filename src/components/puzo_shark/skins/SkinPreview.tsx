import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Bounds, OrbitControls, useGLTF } from '@react-three/drei'
import type { SharkSkin } from './sharkSkins'

const PreviewModel = ({ skin }: { skin: SharkSkin }) => {
    const { scene } = useGLTF(skin.modelPath, '/draco/')
    return (
        <Bounds fit clip observe margin={1.15}>
            <group rotation={skin.preview.rotation}>
                <primitive object={scene} />
            </group>
        </Bounds>
    )
}

export const SkinPreview = ({ skin }: { skin: SharkSkin }) => {
    return (
        <Canvas
            camera={{ position: [0, 0, 5], fov: 45 }}
            gl={{ antialias: true }}
            dpr={[1, 2]}
            style={{ background: 'radial-gradient(circle at 50% 40%, #0a4a63, #001b26)' }}
        >
            <ambientLight intensity={1.4} />
            <directionalLight position={[4, 6, 3]} intensity={1.6} />
            <Suspense fallback={null}>
                <PreviewModel skin={skin} />
                <OrbitControls
                    makeDefault
                    enablePan={false}
                    autoRotate
                    autoRotateSpeed={skin.preview.autoRotateSpeed}
                    minDistance={1}
                    maxDistance={15}
                />
            </Suspense>
        </Canvas>
    )
}