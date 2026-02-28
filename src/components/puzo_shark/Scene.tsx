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

interface IGameSceneProps {
    test: ITest,
    joystickData: JoystickData
}

export const Scene = ({ test, joystickData }: IGameSceneProps) => {
    const sharkRef = useRef<THREE.Mesh>(null!);
    const [usedIndexes, setUsedIndexes] = useState<number[]>([]);
    const { viewport } = useThree();
    const [foodItems, setFoodItems] = useState<FoodItem[]>([])
    const [question, setQuestion] = useState<IQuestion>()

    // Функция генерации позиции с проверкой расстояния
    const createSafeFoodItem = (variant: string, existingItems: FoodItem[], right: boolean): FoodItem => {
        const margin = 1.5;
        const minDistance = 5.5; // Минимальный радиус пустого пространства вокруг
        let x = 0;
        let y = 0;
        let isTooClose = true;
        let attempts = 0;

        // Текущая позиция акулы (если еще не отрендерена - центр 0,0)
        const sharkPos = sharkRef.current 
            ? new THREE.Vector2(sharkRef.current.position.x, sharkRef.current.position.y) 
            : new THREE.Vector2(0, 0);

        while (isTooClose && attempts < 100) {
            x = (Math.random() - 0.5) * (viewport.width - margin);
            y = (Math.random() - 0.5) * (viewport.height - margin);
            
            const newPos = new THREE.Vector2(x, y);
            
            // 1. Проверка расстояния до акулы
            const distToShark = newPos.distanceTo(sharkPos);
            
            // 2. Проверка расстояния до уже созданных в этом цикле стейков
            const distToOthers = existingItems.every(item => {
                const itemPos = new THREE.Vector2(item.position.x, item.position.y);
                return newPos.distanceTo(itemPos) > minDistance;
            });

            if (distToShark > minDistance && distToOthers) {
                isTooClose = false;
            }
            attempts++;
        }

        return {
            id: variant,
            label: variant,
            position: new THREE.Vector3(x, y, -0.01),
            ref: React.createRef() as React.RefObject<THREE.Group>,
            right
        };
    }

    // Выбор нового вопроса
    useEffect(() => {
        const leftQuestions = test.questions.filter((_, i) => !usedIndexes.includes(i))
        if (leftQuestions.length === 0) return; // Тест окончен

        const randomIndex = Math.floor(Math.random() * leftQuestions.length);
        setQuestion(leftQuestions[randomIndex])
    }, [usedIndexes, test.questions])

    // Спавн еды при смене вопроса
    useEffect(() => {
        if (question) {
            const newFoodItems: FoodItem[] = [];
            for (const variant of question.variants) {
                const foodItem = createSafeFoodItem(variant, newFoodItems, question.answer.includes(variant));
                newFoodItems.push(foodItem);
            }
            setFoodItems(newFoodItems);
        }
    }, [question, viewport])

    const handleEat = useCallback((id: string) => {
        setFoodItems(prev => prev.map(item => 
            item.id === id ? { ...item, eaten: true } : item
        ));

        setTimeout(() => {
            if (question) {
                const questionIndex = test.questions.findIndex(q => q.question === question.question);
                setUsedIndexes(prev => [...prev, questionIndex]);
            }
        }, 1000)
    }, [question, test.questions])

    return (
        <>
            {import.meta.env.DEV && <Stats />}
            <ambientLight intensity={2} />
            
            {question && (
                <Html fullscreen style={{pointerEvents:'none'}}>
                    <div style={{
                        position: 'absolute',
                        top: '40px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 'max-content',
                        textAlign: 'center',
                        pointerEvents: 'none',
                        userSelect: 'none',
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

            <ControlledMesh baseSpeed={3} meshRef={sharkRef} joystickData={joystickData}>
                {(actionRef: RefObject<THREE.AnimationAction>) => <Shark actionRef={actionRef} />}
            </ControlledMesh>

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
