import { Html, Stats, useGLTF } from "@react-three/drei"
import { ControlledMesh } from "./ControlledMesh"
import { WaterPlane } from "./waterPlane/WaterPlane"
import { useCallback, useEffect, useRef, useState, type RefObject, useMemo } from "react"
import * as THREE from 'three'
import { Shark } from "./Shark"
import { type FoodItem, useFoodManager } from "./food/FoodManager"
import { Steak } from "./food/Steak"
import type { ITest } from "./food/tests/interfaces"

import type { JoystickData } from "./Joystick"
import { ProgressScale, type AnswerResult } from "./hud/ProgressScale"
import { TestEndScreen } from "./hud/TestEndScreen"
import { QuestionLabel } from "./hud/QuestionLabel"

interface IGameSceneProps {
    test: ITest,
    joystickData: JoystickData,
    paused?: boolean,
    onBack: () => void
}

export const Scene = ({ test, joystickData, onBack, paused }: IGameSceneProps) => {
    const sharkRef = useRef<THREE.Mesh>(null!);
    const wrongAnserHandleRef = useRef(() => null)

    const [sessionIndexes, setSessionIndexes] = useState<number[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [results, setResults] = useState<AnswerResult[]>(new Array(10).fill('pending'));

    const currentQuestion = useMemo(() => {
        if (sessionIndexes.length > 0 && currentIndex < sessionIndexes.length) {
            return test.questions[sessionIndexes[currentIndex]];
        }
        return undefined;
    }, [currentIndex, sessionIndexes, test.questions]);




    useEffect(() => {
        if (test.questions.length === 0) return;
        const allIndexes = test.questions.map((_, i) => i);
        const shuffled = [...allIndexes].sort(() => 0.5 - Math.random());
        setSessionIndexes(shuffled.slice(0, 10));
    }, [test]);

    const handleEat = useCallback((eatenItem: FoodItem) => {
        const isCorrect = currentQuestion?.answer.includes(eatenItem.label);
        if (!isCorrect) {
            wrongAnserHandleRef.current();
        }
        setResults(prev => {
            const newResults = [...prev];
            newResults[currentIndex] = isCorrect ? 'correct' : 'wrong';
            return newResults;
        });
        setTimeout(() => {
            setCurrentIndex(prev => prev + 1);
        }, 3000);
    }, [currentQuestion, currentIndex]);

    const isFinished = sessionIndexes.length > 0 && currentIndex >= sessionIndexes.length;
    const foodComponents = useFoodManager({
        question: currentQuestion,
        sharkRef: sharkRef,
        handleEat: handleEat,
        FoodComponent: Steak
    })
    return (
        <>
            {import.meta.env.DEV && <Stats />}
            <ambientLight intensity={2} />

            {!paused && <Html fullscreen style={{ pointerEvents: 'none' }}>
                <div style={{ position: 'relative', width: '100%', height: '100%', fontFamily: 'sans-serif' }}>

                    {/* Текст вопроса сверху */}
                    {currentQuestion && <QuestionLabel label={currentQuestion.question} />}

                    <ProgressScale currentIndex={currentIndex} results={results} />

                    {/* ЭКРАН ЗАВЕРШЕНИЯ */}
                    {isFinished && <TestEndScreen onBack={onBack} results={results} />}
                </div>
            </Html>}

            <ControlledMesh baseSpeed={3} meshRef={sharkRef} joystickData={joystickData}>
                {(actionRef: RefObject<THREE.AnimationAction>) => <Shark
                    wrongAnswerHandleRef={wrongAnserHandleRef}
                    actionRef={actionRef}
                    modelPath='/models/shark.glb'
                    rotation={[Math.PI / 2, Math.PI, 0]}
                    scale={0.003}
                />}
            </ControlledMesh>

            {currentQuestion && !paused && (
                <>{foodComponents}</>
            )}

            <WaterPlane />
        </>
    )
}
useGLTF.preload('/models/shark.glb')