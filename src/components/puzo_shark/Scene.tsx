import { Html, Stats } from "@react-three/drei"
import { useThree } from "@react-three/fiber"
import { ControlledMesh } from "./ControlledMesh"
import { WaterPlane } from "./waterPlane/WaterPlane"
import { useCallback, useEffect, useRef, useState, type RefObject, useMemo } from "react"
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
    paused: boolean,
    onBack: () => void // Добавлен проп для возврата
}

type AnswerResult = 'correct' | 'wrong' | 'pending';

export const Scene = ({ test, joystickData, paused, onBack }: IGameSceneProps) => {
    const sharkRef = useRef<THREE.Mesh>(null!);
    const { viewport } = useThree();
    
    const [sessionIndexes, setSessionIndexes] = useState<number[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0); 
    const [results, setResults] = useState<AnswerResult[]>(new Array(10).fill('pending'));
    const [foodItems, setFoodItems] = useState<FoodItem[]>([]);

    const GRID_X = 16;
    const GRID_Y = 9;
    const MIN_CELL_DIST = 3;

    // 1. Инициализация сессии
    useEffect(() => {
        if (test.questions.length === 0) return;
        const allIndexes = test.questions.map((_, i) => i);
        const shuffled = [...allIndexes].sort(() => 0.5 - Math.random());
        setSessionIndexes(shuffled.slice(0, 10));
    }, [test]);

    // Текущий активный вопрос
    const currentQuestion = useMemo(() => {
        if (sessionIndexes.length > 0 && currentIndex < sessionIndexes.length) {
            return test.questions[sessionIndexes[currentIndex]];
        }
        return null;
    }, [currentIndex, sessionIndexes, test.questions]);

    // Генерация позиций
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
                const gx = Math.floor(Math.random() * (GRID_X - 2)) + 1;
                const gy = Math.floor(Math.random() * (GRID_Y - 4)) + 1; 
                const currentCell = new THREE.Vector2(gx, gy);
                if (currentCell.distanceTo(sharkGridPos) >= MIN_CELL_DIST && 
                    occupiedCells.every(c => currentCell.distanceTo(c) >= MIN_CELL_DIST)) {
                    occupiedCells.push(currentCell);
                    positions.push(new THREE.Vector3(
                        (gx - GRID_X / 2) * cellW + cellW / 2,
                        (gy - GRID_Y / 2) * cellH + cellH / 2,
                        -0.01
                    ));
                    found = true;
                }
                attempts++;
            }
        }
        return positions;
    }, [viewport.width, viewport.height]);

    // 2. Спавн еды
    useEffect(() => {
        if (currentQuestion) {
            const positions = generateGridPositions(currentQuestion.variants.length);
            const newItems = currentQuestion.variants.map((variant, index) => ({
                id: variant,
                label: variant,
                position: positions[index] || new THREE.Vector3(0, 0, -10),
                ref: React.createRef() as React.RefObject<THREE.Group>,
                right: currentQuestion.answer.includes(variant),
                eaten: false
            }));
            setFoodItems(newItems);
        }
    }, [currentQuestion, generateGridPositions]);

    // 3. Обработка поедания
    const handleEat = useCallback((id: string) => {
        if (!currentQuestion) return;

        const isCorrect = currentQuestion.answer.includes(id);

        setResults(prev => {
            const newResults = [...prev];
            newResults[currentIndex] = isCorrect ? 'correct' : 'wrong';
            return newResults;
        });

        setFoodItems(prev => prev.map(item => 
            item.id === id ? { ...item, eaten: true } : item
        ));

        setTimeout(() => {
            setCurrentIndex(prev => prev + 1);
        }, 800);
    }, [currentQuestion, currentIndex]);

    const isFinished = sessionIndexes.length > 0 && currentIndex >= sessionIndexes.length;

    return (
        <>
            {import.meta.env.DEV && <Stats />}
            <ambientLight intensity={2} />
            
            <Html fullscreen style={{ pointerEvents: 'none' }}>
                <div style={{
                    position: 'absolute',
                    top: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '15px',
                    width: '100%',
                    fontFamily: 'sans-serif'
                }}>
                    {/* Шкала прогресса */}
                    <div style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.6)', padding: '12px', borderRadius: '15px', backdropFilter: 'blur(5px)' }}>
                        {results.map((res, i) => (
                            <div key={i} style={{
                                width: '30px',
                                height: '14px',
                                borderRadius: '4px',
                                border: i === currentIndex ? '2px solid white' : '1px solid rgba(255,255,255,0.3)',
                                backgroundColor: 
                                    res === 'correct' ? '#4ade80' : 
                                    res === 'wrong' ? '#f87171' : 
                                    '#374151',
                                transition: 'background-color 0.4s ease, transform 0.2s ease',
                                transform: i === currentIndex ? 'scale(1.1)' : 'scale(1)'
                            }} />
                        ))}
                    </div>

                    {currentQuestion ? (
                        <div style={{
                            textAlign: 'center',
                            color: 'white',
                            fontSize: '32px',
                            fontWeight: 'bold',
                            textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                            background: 'rgba(0,0,0,0.4)',
                            padding: '10px 40px',
                            borderRadius: '20px',
                            maxWidth: '80%',
                            userSelect: 'none'
                        }}>
                            {currentQuestion.question}
                        </div>
                    ) : isFinished && (
                        <div style={{
                            background: 'rgba(0,0,0,0.9)',
                            padding: '40px',
                            borderRadius: '30px',
                            textAlign: 'center',
                            color: 'white',
                            border: '4px solid #4ade80',
                            pointerEvents: 'auto', // Включаем клики
                            boxShadow: '0 0 20px rgba(74, 222, 128, 0.4)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '20px'
                        }}>
                            <div>
                                <h2 style={{ margin: '0 0 10px 0', fontSize: '36px' }}>ТЕСТ ЗАВЕРШЕН</h2>
                                <p style={{ fontSize: '28px', margin: 0, color: '#4ade80' }}>
                                    Правильно: {results.filter(r => r === 'correct').length} из 10
                                </p>
                            </div>
                            
                            <button 
                                onClick={onBack}
                                style={{
                                    padding: '12px 24px',
                                    fontSize: '20px',
                                    fontWeight: 'bold',
                                    color: 'white',
                                    background: '#4ade80',
                                    border: 'none',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    transition: 'transform 0.1s active',
                                    boxShadow: '0 4px 0 #166534'
                                }}
                                onMouseDown={(e) => (e.currentTarget.style.transform = 'translateY(2px)')}
                                onMouseUp={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                            >
                                К ВЫБОРУ ТЕСТА
                            </button>
                        </div>
                    )}
                </div>
            </Html>

            <ControlledMesh baseSpeed={3} meshRef={sharkRef} joystickData={joystickData}>
                {(actionRef: RefObject<THREE.AnimationAction>) => <Shark actionRef={actionRef} />}
            </ControlledMesh>

            {currentQuestion && (
                <FoodManager
                    foodItems={foodItems}
                    sharkRef={sharkRef}
                    handleEat={handleEat}
                    FoodComponent={Steak}
                />
            )}
            
            <WaterPlane />
        </>
    )
}
