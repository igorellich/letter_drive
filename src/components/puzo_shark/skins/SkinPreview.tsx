import { Suspense, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import type { SharkSkin } from './sharkSkins'

const FIT_SIZE = 4.5

const PreviewModel = ({ skin }: { skin: SharkSkin }) => {
    const { scene } = useGLTF(skin.modelPath, '/draco/')
    const holder = useRef<THREE.Group>(null!)
    const rootRef = useRef<THREE.Group>(null!)
    const innerRef = useRef<THREE.Group>(null!)
    const { camera } = useThree()

    // Recompute fit until the previewed size stabilizes at FIT_SIZE (handles async glTF/draco load)
    useFrame(() => {
        const w = window as { __prevDbg?: unknown }
        const g = holder.current
        if (skin.preview.scale !== undefined) {
            g.scale.setScalar(skin.preview.scale)
            g.position.set(...(skin.preview.position ?? [0, 0, 0]))
        } else {
            let maxDim = Math.max(...new THREE.Box3().setFromObject(rootRef.current).getSize(new THREE.Vector3()).toArray())
            const wanted = FIT_SIZE
            if (Math.abs(maxDim - wanted) > wanted * 0.05) {
                g.scale.setScalar(1)
                g.position.set(0, 0, 0)
                g.updateMatrixWorld(true)
                const box = new THREE.Box3().setFromObject(innerRef.current)
                const size = box.getSize(new THREE.Vector3())
                if (size.length() > 0) {
                    const center = box.getCenter(new THREE.Vector3())
                    const m = Math.max(size.x, size.y, size.z)
                    g.scale.setScalar(wanted / m)
                    g.position.copy(center).multiplyScalar(-(wanted / m))
                    g.updateMatrixWorld(true)
                }
            }
        }
        const maxDim = Math.max(...new THREE.Box3().setFromObject(rootRef.current).getSize(new THREE.Vector3()).toArray())
        const rawBox = new THREE.Box3().setFromObject(innerRef.current).getSize(new THREE.Vector3())
        const rawMax = Math.max(rawBox.x, rawBox.y, rawBox.z)
        const rootBox = new THREE.Box3().setFromObject(rootRef.current)
        const rootCenter = rootBox.getCenter(new THREE.Vector3())
        w.__prevDbg = { skin: skin.id, maxDim: +maxDim.toFixed(2), rawMax: +rawMax.toFixed(3), rawBox: rawBox.toArray().map(v => +Number(v).toFixed(2)), holderScale: g.scale.toArray().map(v => +Number(v).toFixed(4)), holderPos: g.position.toArray().map(v => +Number(v).toFixed(4)), rootCenter: rootCenter.toArray().map(v => +Number(v).toFixed(3)), camPos: camera.position.toArray().map(v => +Number(v).toFixed(2)), camTarget: (camera as unknown as { target?: THREE.Vector3 }).target?.toArray().map(v => +Number(v).toFixed(2)) }
    })

    return (
        <group ref={rootRef}>
            <group ref={holder}>
                <group ref={innerRef} rotation={skin.preview.rotation}>
                    <primitive object={scene} />
                </group>
            </group>
        </group>
    )
}

export const SkinPreview = ({ skin }: { skin: SharkSkin }) => {
    return (
        <Canvas
            camera={{ position: [4.5, 2.2, 4.5], fov: 45 }}
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
                    minDistance={1.5}
                    maxDistance={15}
                    target={[0, 0, 0]}
                />
            </Suspense>
        </Canvas>
    )
}
