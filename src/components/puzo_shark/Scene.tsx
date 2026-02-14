import { Stats } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
import { ControlledMesh } from "./ControlledMesh"
import { Joystick, type JoystickData } from "./Joystick"
import { WaterPlane } from "./waterPlane/WaterPlane"
import { useRef } from "react"
import * as THREE from 'three'
import { Shark } from "./Shark"
export const Scene = () => {
    const sharkRef = useRef<THREE.Mesh>(null!);
    // Создаем внешний объект для хранения данных джойстика
    const joystickData: JoystickData = { x: 0, y: 0, active: false }
    return (
        <div style={{ width: '100vw', height: '100vh', background: '#001b26', overflow:'hidden' }}>

            <Joystick joystickData={joystickData} />
            <Canvas style={{overflow:'hidden'}} camera={{ position: [0, 0, 5], fov: 45 }}>

                <Stats />
                <ambientLight intensity={2} />
                {/* <pointLight position={[10, 10, 10]} intensity={1.5} /> */}
                <ControlledMesh baseSpeed={3} meshRef={sharkRef} joystickData={joystickData}>
                    <Shark meshRef={sharkRef} joystickData={joystickData}/>
                </ControlledMesh>
                <WaterPlane />
            </Canvas>

        </div>
    )
}