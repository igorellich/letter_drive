import { Html, PerspectiveCamera, Stats, useGLTF } from "@react-three/drei"
import { ControlledMesh } from "./ControlledMesh"
import { WaterPlane } from "./waterPlane/WaterPlane"
import {useEffect, useMemo, useRef, useState, type RefObject } from "react"
import * as THREE from 'three'
import { Shark } from "./Shark"
import { type FoodItem, useFoodManager } from "./food/FoodManager"
import { Steak } from "./food/Steak"
import type { ITest } from "./food/tests/interfaces"

import { Joystick, type JoystickData } from "./Joystick"
import { ProgressScale, type AnswerResult } from "./hud/ProgressScale"
import { TestEndScreen } from "./hud/TestEndScreen"

import { useFollowingCamera } from "./hooks/useFollowingCamera"

interface IGameSceneProps {
    test: ITest,
    joystickData: JoystickData,
    onBack: () => void,
    width: number,
    height: number,
    freeze:boolean
}

export const Scene = ({ test, joystickData, onBack, freeze, height, width }: IGameSceneProps) => {
    const sharkRef = useRef<THREE.Mesh>(null!);
    const wrongAnserHandleRef = useRef(() => null)
    useFollowingCamera({ targetRef: sharkRef })
    const [sessionIndexes, setSessionIndexes] = useState<number[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [results, setResults] = useState<AnswerResult[]>(new Array(10).fill('pending'));
    
    useEffect(() => {
        if (test.questions.length === 0) return;
        const allIndexes = test.questions.map((_, i) => i);
        const shuffled = [...allIndexes].sort(() => 0.5 - Math.random());
        setSessionIndexes(shuffled.slice(0, 10));
    }, [test]);

   

    const onSelectAnswer =(item: FoodItem) => {
        if (item) {
           if(item.right===false && wrongAnserHandleRef.current){
            wrongAnserHandleRef.current();
           }
            setResults(prev => {
                const newResults = [...prev];
                newResults[currentIndex] = item.right ? 'correct' : 'wrong';
                return newResults;
            });
            setTimeout(() => {
                setCurrentIndex(prev => prev + 1);
            }, 3000);
        }
    }

    const isFinished = sessionIndexes.length > 0 && currentIndex >= sessionIndexes.length;
    const selectedQuestions = useMemo(()=>test.questions.filter((_,i)=>sessionIndexes.includes(i)),[test, sessionIndexes]);
    const foodComponents = useFoodManager({
        questions: selectedQuestions,
        sharkRef: sharkRef,       
        FoodComponent: Steak,
        sceneHeight: height,
        sceneWidth: width,
        onSelectAnswer,
        sessionIndexes
    })
    return (
        <>
            {import.meta.env.DEV && <Stats />}
            <ambientLight intensity={2} />
            <PerspectiveCamera makeDefault position={[0, 0, 5]}>
                <Html fullscreen style={{ pointerEvents: 'none', position: 'absolute', top: 0, left: 0 }}>
                    
                    {!freeze && <>
                    <Joystick joystickData={joystickData} />
                    <div style={{ position: 'absolute', width: '100%', height: '100%', fontFamily: 'sans-serif' }}>

                      
                        <ProgressScale currentIndex={currentIndex} results={results} />

                        {/* ЭКРАН ЗАВЕРШЕНИЯ */}
                        {isFinished && <TestEndScreen onBack={onBack} results={results} />}
                    </div></>}
                    
                </Html>
            </PerspectiveCamera>


            <ControlledMesh baseSpeed={3} meshRef={sharkRef} joystickData={joystickData} sceneHeight={height} sceneWidth={width}>
                {(actionRef: RefObject<THREE.AnimationAction>) => <Shark
                    wrongAnswerHandleRef={wrongAnserHandleRef}
                    actionRef={actionRef}
                    modelPath='/models/shark_min.glb'
                    rotation={[Math.PI / 2, Math.PI, 0]}
                    scale={0.003}
                />}
            </ControlledMesh>

            {(
                <>{foodComponents}</>
            )}

            <WaterPlane height={height} width={width} />
        </>
    )
}
useGLTF.preload('/models/shark_min.glb', '/draco/')