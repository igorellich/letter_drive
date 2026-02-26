import { Html, Stats } from "@react-three/drei"
import { useThree } from "@react-three/fiber"
import { ControlledMesh } from "./ControlledMesh"

import { WaterPlane } from "./waterPlane/WaterPlane"
import { useCallback, useEffect, useRef, useState, type RefObject } from "react"
import * as THREE from 'three'
import { Shark } from "./Shark"
import { FoodManager, type FoodItem } from "./food/FoodManager"
import { Steak } from "./food/Steak"
import type { IQuestion, ITest } from "./food/tests/interfaces"
import React from "react"
import type { JoystickData } from "./Joystick"
// Создаем внешний объект для хранения данных джойстика

interface IGameSceneProps {
    test: ITest,
    joystickData: JoystickData
}
export const Scene = ({ test, joystickData }: IGameSceneProps) => {
    const sharkRef = useRef<THREE.Mesh>(null!);
    const [usedIndexes, setUsedIndexes] = useState<number[]>([]);
    const { viewport } = useThree();
    const createFoodItem = (variant: string): FoodItem => {


        const margin = 1
        const x = (Math.random() - 0.5) * (viewport.width - margin)
        const y = (Math.random() - 0.5) * (viewport.height - margin)

        const newItem: FoodItem = {
            id: variant,
            label: variant,
            position: new THREE.Vector3(x, y, -0.01),
            ref: React.createRef() as React.RefObject<THREE.Group<THREE.Object3DEventMap>>  // Создаем ref для связи с мешем
        }
        return newItem;

    }
    const [foodItems, setFoodItems] = useState<FoodItem[]>([])
    const [question, setQuestion] = useState<IQuestion>()
    useEffect(() => {
        const leftQuestions = test.questions.filter((q, i) => !usedIndexes.includes(i))
        const randomIndex = Math.floor(Math.random() * leftQuestions.length);
        setQuestion(leftQuestions[randomIndex])
    }, [usedIndexes])
    useEffect(() => {
        const newFoodItems: FoodItem[] = []
        if (question) {
            for (const variant of question?.variants) {
                const foodItem = createFoodItem(variant);
                newFoodItems.push(foodItem);
            }
        }
        setFoodItems(newFoodItems);
    }, [question])
    // Callback для удаления съеденного объекта
    const handleEat = useCallback((id: string) => {
        const item = foodItems.filter(f => f.id === id)[0];

        if (item) {
            item.eaten = true;

            setTimeout(() => {
                if (question) {
                    const questionIndex = test.questions.indexOf(question);
                    setUsedIndexes([...usedIndexes, questionIndex]);
                }
            }, 1000)
        }

    }, [foodItems])




    return (

        <>
            <Stats />
            <ambientLight intensity={2} />
            {/* Отображение вопроса сверху */}
            {question && (
                <Html fullscreen>
                    <div style={{
                        position: 'absolute',
                        top: '40px',          // Отступ от верхнего края
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 'max-content', // Текст в одну строку
                        textAlign: 'center',
                        pointerEvents: 'none',
                        userSelect: 'none',

                        // Стили самого текста
                        color: 'white',
                        fontSize: '32px',
                        fontWeight: 'bold',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                        background: 'rgba(0,0,0,0.4)',
                        padding: '10px 30px',
                        borderRadius: '20px',
                        fontFamily: 'sans-serif'
                    }}>
                        {question?.question}
                    </div>
                </Html>
            )}
            {/* <pointLight position={[10, 10, 10]} intensity={1.5} /> */}
            <ControlledMesh baseSpeed={3} meshRef={sharkRef} joystickData={joystickData}>
                {(actionRef: RefObject<THREE.AnimationAction>) => <Shark actionRef={actionRef} />}
            </ControlledMesh>
            {/* Менеджер только спавнит и рисует */}
            <FoodManager
                foodItems={foodItems}

                sharkRef={sharkRef}
                handleEat={handleEat}
                FoodComponent={Steak}
            />
            <WaterPlane />
        </>
    )
}