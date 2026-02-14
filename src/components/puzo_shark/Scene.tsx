import { Stats } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
import { ControlledMesh } from "./ControlledMesh"
import { Joystick, type JoystickData } from "./Joystick"
import { WaterPlane } from "./waterPlane/WaterPlane"
import { useCallback, useRef, useState } from "react"
import * as THREE from 'three'
import { Shark } from "./Shark"
import { FoodManager, type FoodItem } from "./food/FoodManager"
import { Steak } from "./food/Steak"
// Создаем внешний объект для хранения данных джойстика
const joystickData: JoystickData = { x: 0, y: 0, active: false }
export const Scene = () => {
    const sharkRef = useRef<THREE.Mesh>(null!);

    const [foodItems, setFoodItems] = useState<FoodItem[]>([])

    // Callback для удаления съеденного объекта
    const handleEat = useCallback((id: number) => {
        setFoodItems(prev => prev.filter(item => item.id !== id))

        // Эффект роста (опционально)
        if (sharkRef.current) {
            sharkRef.current.scale.addScalar(0.02)
        }
    }, [])



    return (
        <div style={{ width: '100vw', height: '100vh', background: '#001b26', overflow: 'hidden' }}>

            <Joystick joystickData={joystickData} />
            <Canvas style={{ overflow: 'hidden' }} camera={{ position: [0, 0, 5], fov: 45 }}>

                <Stats />
                <ambientLight intensity={2} />
                {/* <pointLight position={[10, 10, 10]} intensity={1.5} /> */}
                <ControlledMesh baseSpeed={3} meshRef={sharkRef} joystickData={joystickData}>
                    <Shark meshRef={sharkRef} joystickData={joystickData} />
                </ControlledMesh>
                {/* Менеджер только спавнит и рисует */}
                <FoodManager
                    foodItems={foodItems}
                    setFoodItems={setFoodItems}
                    maxItems={15}
                    sharkRef={sharkRef}
                    handleEat={handleEat}
                    FoodComponent={Steak}
                />
                <WaterPlane />
            </Canvas>

        </div>
    )
}