import { Html, PerspectiveCamera, PositionalAudio, Stats, useGLTF } from "@react-three/drei"
import { ControlledMesh } from "./ControlledMesh"
import { WaterPlane } from "./waterPlane/WaterPlane"
import { SeaSchool } from "./waterPlane/SeaSchool"
import { Suspense, useEffect, useMemo, useRef, useState, type RefObject } from "react"
import * as THREE from 'three'
import { Shark } from "./Shark"
import { type FoodItem, useFoodManager } from "./food/FoodManager"
import { SeaCreature } from "./food/SeaCreature"
import { EatFx, type EatFxHandle } from "./food/EatFx"
import { CameraShakeRig, type CameraShakeHandle } from "./hooks/useCameraShake"
import type { ITest } from "./food/tests/interfaces"

import { Joystick, type JoystickData } from "./Joystick"
import { ProgressScale, type AnswerResult } from "./hud/ProgressScale"
import { TestEndScreen } from "./hud/TestEndScreen"

import { useFollowingCamera } from "./hooks/useFollowingCamera"
import { AppStateController } from "./food/AppStateController"
import { TEST_TIME_REWARD_GOOD, TEST_TIME_REWARD_PERFECT } from "./food/economy"
import { SKINS, type SharkSkin } from "./skins/sharkSkins"

interface IGameSceneProps {
    test: ITest,
    joystickData: JoystickData,
    onBack: () => void,
    width: number,
    height: number,
    freeze: boolean,
    skin?: SharkSkin
}

export const Scene = ({ test, joystickData, onBack, freeze, height, width, skin = SKINS[0] }: IGameSceneProps) => {
    const sharkRef = useRef<THREE.Mesh>(null!);
    const wrongAnserHandleRef = useRef(() => null)
    useFollowingCamera({ targetRef: sharkRef })
    const eatFxRef = useRef<EatFxHandle | null>(null)
    const shakeRef = useRef<CameraShakeHandle | null>(null)
    const [sessionIndexes, setSessionIndexes] = useState<number[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [results, setResults] = useState<AnswerResult[]>(new Array(10).fill('pending'));
    const eatSoundRef = useRef<THREE.PositionalAudio | null>(null);
    const [finished, setFinished] = useState<boolean>(false)
    
    useEffect(()=>{
        setFinished(sessionIndexes.length > 0 && currentIndex >= sessionIndexes.length);
    },[sessionIndexes, currentIndex])
    useEffect(() => {
        if (finished) {
            const rightAnswersNum = results.filter(r => r === 'correct').length;
            if (rightAnswersNum > 7) {
                const appState = AppStateController.getState();
                appState.diversTimeLeftSec += rightAnswersNum == 10 ? TEST_TIME_REWARD_PERFECT : TEST_TIME_REWARD_GOOD;
                AppStateController.setState(appState);
            }
        }
    }, [finished])
    useEffect(() => {
        if (test.questions.length === 0) return;
        const allIndexes = test.questions.map((_, i) => i);
        const shuffled = [...allIndexes].sort(() => 0.5 - Math.random());
        setSessionIndexes(shuffled.slice(0, 10));
    }, [test]);
    useEffect(() => {
        const resultsLength = results.filter(r => r !== 'pending').length;
           
                setCurrentIndex(resultsLength);
            
    }, [results])



    const onSelectAnswer = (item: FoodItem) => {
        if (item) {
            if (item.right === false && wrongAnserHandleRef.current) {
                wrongAnserHandleRef.current();
            }
            setResults(prev => {
                const newResults = [...prev];
                newResults[currentIndex] = item.right ? 'correct' : 'wrong';
                return newResults;
            });
         
        }
    }


    
    const selectedQuestions = useMemo(() => test.questions.filter((_, i) => sessionIndexes.includes(i)), [test, sessionIndexes]);
    const onEaten = (item: FoodItem) => {
        const p = new THREE.Vector3()
        item.ref?.current?.getWorldPosition(p)
        eatFxRef.current?.burstAt(p)
        shakeRef.current?.shake(0.35, 0.06)
        eatSoundRef.current?.play()
    }
    const foodComponents = useFoodManager({
        questions: selectedQuestions,
        sharkRef: sharkRef,
        FoodComponent: SeaCreature,
        sceneHeight: height,
        sceneWidth: width,
        onSelectAnswer,
        onEaten
    })
    return (
        <>
            {import.meta.env.DEV && <Stats />}
            <ambientLight intensity={2} />
            <CameraShakeRig handleRef={shakeRef}>
                <PerspectiveCamera makeDefault position={[0, 0, 5]}>
                    <Html fullscreen style={{ pointerEvents: 'none', position: 'absolute', top: 0, left: 0 }}>

                    {!freeze && <>
                        <Joystick joystickData={joystickData} />
                        <div style={{ position: 'absolute', width: '100%', height: '100%', fontFamily: 'sans-serif' }}>


                            <ProgressScale currentIndex={currentIndex} results={results} />

                            {/* ЭКРАН ЗАВЕРШЕНИЯ */}
                            {finished && <TestEndScreen onBack={onBack} results={results} />}
                        </div></>}

                    </Html>
                </PerspectiveCamera>
            </CameraShakeRig>


            <ControlledMesh baseSpeed={3} meshRef={sharkRef} joystickData={joystickData} sceneHeight={height} sceneWidth={width}>
                {(actionRef: RefObject<THREE.AnimationAction>) => <Shark
                    wrongAnswerHandleRef={wrongAnserHandleRef}
                    actionRef={actionRef}
                    modelPath={skin.modelPath}
                    rotation={skin.gameplay.rotation}
                    scale={skin.gameplay.scale}
                    fitSize={skin.gameplay.fitSize}
                    position={skin.gameplay.position}
                />}
            </ControlledMesh>

            {(
                <>{foodComponents}</>
            )}
            <Suspense>
                <PositionalAudio ref={eatSoundRef} url="/music/crunch.ogg" distance={50} loop={false} />
            </Suspense>
            <EatFx handleRef={eatFxRef} />
            <SeaSchool sceneWidth={width} sceneHeight={height} />
            <WaterPlane height={height} width={width} />
        </>
    )
}
useGLTF.preload('/models/shark_min.glb', '/draco/')