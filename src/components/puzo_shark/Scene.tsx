import { Html, Stats } from "@react-three/drei"
import { ControlledMesh } from "./ControlledMesh"
import { WaterPlane } from "./waterPlane/WaterPlane"
import { useCallback, useEffect, useRef, useState, type RefObject, useMemo } from "react"
import * as THREE from 'three'
import { Shark } from "./Shark"
import { FoodManager } from "./food/FoodManager"
import { Steak } from "./food/Steak"
import type { ITest } from "./food/tests/interfaces"

import type { JoystickData } from "./Joystick"
import { ProgressScale, type AnswerResult } from "./hud/ProgressScale"
import { TestEndScreen } from "./hud/TestEndScreen"
import { QuestionLabel } from "./hud/QuestionLabel"
import { useFoodItemsGridSpawner } from "./hooks/useFoodItemsGridSpawner"

interface IGameSceneProps {
    test: ITest,
    joystickData: JoystickData,
    paused?: boolean,
    onBack: () => void
}

export const Scene = ({ test, joystickData, onBack }: IGameSceneProps) => {
    const sharkRef = useRef<THREE.Mesh>(null!);


    const [sessionIndexes, setSessionIndexes] = useState<number[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [results, setResults] = useState<AnswerResult[]>(new Array(10).fill('pending'));

    const currentQuestion = useMemo(() => {
        if (sessionIndexes.length > 0 && currentIndex < sessionIndexes.length) {
            return test.questions[sessionIndexes[currentIndex]];
        }
        return null;
    }, [currentIndex, sessionIndexes, test.questions]);
    const [foodItems, setFoodItems] = useFoodItemsGridSpawner(sharkRef, currentQuestion)



    useEffect(() => {
        if (test.questions.length === 0) return;
        const allIndexes = test.questions.map((_, i) => i);
        const shuffled = [...allIndexes].sort(() => 0.5 - Math.random());
        setSessionIndexes(shuffled.slice(0, 10));
    }, [test]);

    const handleEat = useCallback((id: string) => {
        if (!currentQuestion) return;
        const canEat = foodItems.filter(i => i.eaten === true).length === 0
        if (canEat) {
            const eatenItem = foodItems.filter(i => i.id === id)[0];
            if (eatenItem && eatenItem.label) {
                eatenItem.eaten = true;
                const isCorrect = currentQuestion.answer.includes(eatenItem.label);

                setResults(prev => {
                    const newResults = [...prev];
                    newResults[currentIndex] = isCorrect ? 'correct' : 'wrong';
                    return newResults;
                });

                setFoodItems(prev => prev.map(item => item.id === id ? { ...item, eaten: true } : item));

                setTimeout(() => {
                    setCurrentIndex(prev => prev + 1);
                }, 2000);
            }
        }
    }, [currentQuestion, currentIndex, foodItems]);

    const isFinished = sessionIndexes.length > 0 && currentIndex >= sessionIndexes.length;

    return (
        <>
            {import.meta.env.DEV && <Stats />}
            <ambientLight intensity={2} />

            <Html fullscreen style={{ pointerEvents: 'none' }}>
                <div style={{ position: 'relative', width: '100%', height: '100%', fontFamily: 'sans-serif' }}>

                    {/* Текст вопроса сверху */}
                    {currentQuestion && <QuestionLabel label={currentQuestion.question} />}

                    <ProgressScale currentIndex={currentIndex} results={results} />

                    {/* ЭКРАН ЗАВЕРШЕНИЯ */}
                    {isFinished && <TestEndScreen onBack={onBack} results={results} />}
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
