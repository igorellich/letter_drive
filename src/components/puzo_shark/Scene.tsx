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
    joystickData: JoystickData,
    paused: boolean
}

export const Scene = ({ test, joystickData, paused }: IGameSceneProps) => {
    const sharkRef = useRef<THREE.Mesh>(null!);
    const [usedIndexes, setUsedIndexes] = useState<number[]>([]);
    const { viewport } = useThree();
    const [foodItems, setFoodItems] = useState<FoodItem[]>([])
    const [question, setQuestion] = useState<IQuestion>()
    console.log(paused);
    // Константы сетки
    const GRID_X = 16;
    const GRID_Y = 9;
    const MIN_CELL_DIST = 3;

    const generateGridPositions = useCallback((count: number): THREE.Vector3[] => {
    const cellW = viewport.width / GRID_X;
    const cellH = viewport.height / GRID_Y;
    
    const occupiedCells: THREE.Vector2[] = [];
    const positions: THREE.Vector3[] = [];

    const sharkGridPos = sharkRef.current 
        ? new THREE.Vector2(
            Math.round((sharkRef.current.position.x / cellW) + (GRID_X / 2)),
            Math.round((sharkRef.current.position.y / cellH) + (GRID_Y / 2))
        )
        : new THREE.Vector2(GRID_X / 2, GRID_Y / 2);

    for (let i = 0; i < count; i++) {
        let found = false;
        let attempts = 0;

        while (!found && attempts < 200) {
            // ОГРАНИЧЕНИЕ: gy генерируется от 1 до GRID_Y - 3 (убираем верхние 2 ряда)
            const gx = Math.floor(Math.random() * (GRID_X - 2)) + 1;
            const gy = Math.floor(Math.random() * (GRID_Y - 4)) + 1; // Запас под текст
            
            const currentCell = new THREE.Vector2(gx, gy);
            const distToShark = currentCell.distanceTo(sharkGridPos);
            const distToOthers = occupiedCells.every(cell => 
                currentCell.distanceTo(cell) >= MIN_CELL_DIST
            );

            if (distToShark >= MIN_CELL_DIST && distToOthers) {
                occupiedCells.push(currentCell);
                const worldX = (gx - GRID_X / 2) * cellW + cellW / 2;
                const worldY = (gy - GRID_Y / 2) * cellH + cellH / 2;
                positions.push(new THREE.Vector3(worldX, worldY, -0.01));
                found = true;
            }
            attempts++;
        }
    }
    return positions;
}, [viewport.width, viewport.height]);


    // Выбор нового вопроса
    useEffect(() => {
        const leftQuestions = test.questions.filter((_, i) => !usedIndexes.includes(i))
        if (leftQuestions.length === 0) return;

        const randomIndex = Math.floor(Math.random() * leftQuestions.length);
        setQuestion(leftQuestions[randomIndex])
    }, [usedIndexes, test.questions])

    // Спавн еды по сетке при смене вопроса
    useEffect(() => {
        if (question) {
            const positions = generateGridPositions(question.variants.length);
            
            const newFoodItems: FoodItem[] = question.variants.map((variant, index) => ({
                id: variant,
                label: variant,
                position: positions[index] || new THREE.Vector3(0, 0, -10), // fallback если место не нашлось
                ref: React.createRef() as React.RefObject<THREE.Group>,
                right: question.answer.includes(variant),
                eaten: false
            }));
            
            setFoodItems(newFoodItems);
        }
    }, [question, generateGridPositions])

    const handleEat = useCallback((id: string) => {
        setFoodItems(prev => prev.map(item => 
            item.id === id ? { ...item, eaten: true } : item
        ));

        setTimeout(() => {
            if (question) {
                const questionIndex = test.questions.findIndex(q => q.question === question.question);
                if (questionIndex !== -1) {
                    setUsedIndexes(prev => [...prev, questionIndex]);
                }
            }
        }, 800)
    }, [question, test.questions])

    return (
        <>
            {import.meta.env.DEV && <Stats />}
            <ambientLight intensity={2} />
            
            {question && (
                <Html fullscreen style={{ pointerEvents: 'none' }}>
                    <div style={{
                        position: 'absolute',
                        top: '0px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 'max-content',
                        textAlign: 'center',
                        color: 'white',
                        fontSize: '32px',
                        fontWeight: 'bold',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                        background: 'rgba(0,0,0,0.4)',
                        padding: '10px 30px',
                        borderRadius: '20px',
                        fontFamily: 'sans-serif',
                        userSelect: 'none'
                    }}>
                        {question.question}
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
