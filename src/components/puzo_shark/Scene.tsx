import { Html, Stats } from "@react-three/drei"
import { useThree } from "@react-three/fiber"
import { ControlledMesh } from "./ControlledMesh"
import { WaterPlane } from "./waterPlane/WaterPlane"
import { useCallback, useEffect, useRef, useState, type RefObject, useMemo } from "react"
import * as THREE from 'three'
import { Shark } from "./Shark"
import { FoodManager, type FoodItem } from "./food/FoodManager"
import { Steak } from "./food/Steak"
import type { ITest } from "./food/tests/interfaces"
import React from "react"
import type { JoystickData } from "./Joystick"

interface IGameSceneProps {
    test: ITest,
    joystickData: JoystickData,
    paused?: boolean,
    onBack: () => void
}

type AnswerResult = 'correct' | 'wrong' | 'pending';

export const Scene = ({ test, joystickData, onBack }: IGameSceneProps) => {
    const sharkRef = useRef<THREE.Mesh>(null!);
    const { viewport } = useThree();
    
    const [sessionIndexes, setSessionIndexes] = useState<number[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0); 
    const [results, setResults] = useState<AnswerResult[]>(new Array(10).fill('pending'));
    const [foodItems, setFoodItems] = useState<FoodItem[]>([]);

    // Константы сетки
    const GRID_X = 16;
    const GRID_Y = 9;
    const MIN_CELL_DIST = 3;
    // Отступ справа (в ячейках сетки), чтобы еда не попадала под прогресс-бар
    const RIGHT_MARGIN_CELLS = 2; 

    useEffect(() => {
        if (test.questions.length === 0) return;
        const allIndexes = test.questions.map((_, i) => i);
        const shuffled = [...allIndexes].sort(() => 0.5 - Math.random());
        setSessionIndexes(shuffled.slice(0, 10));
    }, [test]);

    const currentQuestion = useMemo(() => {
        if (sessionIndexes.length > 0 && currentIndex < sessionIndexes.length) {
            return test.questions[sessionIndexes[currentIndex]];
        }
        return null;
    }, [currentIndex, sessionIndexes, test.questions]);

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
                // ОГРАНИЧЕНИЕ: gx генерируется от 1 до GRID_X - RIGHT_MARGIN_CELLS (отступ справа)
                const gx = Math.floor(Math.random() * (GRID_X - 2 - RIGHT_MARGIN_CELLS)) + 1;
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

    const handleEat = useCallback((id: string) => {
        if (!currentQuestion) return;
        const isCorrect = currentQuestion.answer.includes(id);

        setResults(prev => {
            const newResults = [...prev];
            newResults[currentIndex] = isCorrect ? 'correct' : 'wrong';
            return newResults;
        });

        setFoodItems(prev => prev.map(item => item.id === id ? { ...item, eaten: true } : item));

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
                <div style={{ position: 'relative', width: '100%', height: '100%', fontFamily: 'sans-serif' }}>
                    
                    {/* Текст вопроса сверху */}
                    {currentQuestion && (
                        <div style={{
                            position: 'absolute',
                            top: '20px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            textAlign: 'center',
                            color: 'white',
                            fontSize: '28px',
                            fontWeight: 'bold',
                            textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                            background: 'rgba(0,0,0,0.4)',
                            padding: '10px 30px',
                            borderRadius: '15px',
                            maxWidth: '70%'
                        }}>
                            {currentQuestion.question}
                        </div>
                    )}

                    {/* ВЕРТИКАЛЬНАЯ ШКАЛА СПРАВА */}
                    <div style={{ 
                        position: 'absolute', 
                        right: '20px', 
                        top: '50%', 
                        transform: 'translateY(-50%)',
                        display: 'flex', 
                        flexDirection: 'column-reverse', // Чтобы 1-й вопрос был снизу или сверху (по вкусу)
                        gap: '10px', 
                        background: 'rgba(0,0,0,0.6)', 
                        padding: '15px 10px', 
                        borderRadius: '20px', 
                        backdropFilter: 'blur(5px)',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        {results.map((res, i) => (
                            <div key={i} style={{
                                width: '14px',
                                height: '30px',
                                borderRadius: '4px',
                                border: i === currentIndex ? '2px solid white' : '1px solid rgba(255,255,255,0.2)',
                                backgroundColor: 
                                    res === 'correct' ? '#4ade80' : 
                                    res === 'wrong' ? '#f87171' : 
                                    '#374151',
                                transition: 'all 0.3s ease',
                                transform: i === currentIndex ? 'scale(1.2)' : 'scale(1)',
                                boxShadow: i === currentIndex ? '0 0 10px white' : 'none'
                            }} />
                        ))}
                    </div>

                    {/* ЭКРАН ЗАВЕРШЕНИЯ */}
                    {isFinished && (
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            background: 'rgba(0,0,0,0.95)',
                            padding: '40px',
                            borderRadius: '30px',
                            textAlign: 'center',
                            color: 'white',
                            border: '4px solid #4ade80',
                            pointerEvents: 'auto',
                            boxShadow: '0 0 30px rgba(0,0,0,0.5)'
                        }}>
                            <h2 style={{ fontSize: '36px', marginBottom: '10px' }}>ИТОГ</h2>
                            <p style={{ fontSize: '28px', color: '#4ade80', marginBottom: '30px' }}>
                                Результат: {results.filter(r => r === 'correct').length} / 10
                            </p>
                            <button 
                                onClick={onBack}
                                style={{
                                    padding: '15px 40px',
                                    fontSize: '20px',
                                    fontWeight: 'bold',
                                    color: 'white',
                                    background: '#4ade80',
                                    border: 'none',
                                    borderRadius: '15px',
                                    cursor: 'pointer'
                                }}
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
