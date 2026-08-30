import { Html, PerspectiveCamera, PositionalAudio, Stats, useGLTF } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { ControlledMesh } from "./ControlledMesh"
import { WaterPlane } from "./waterPlane/WaterPlane"
import { SeaSchool } from "./waterPlane/SeaSchool"
import { Suspense, useRef, useState, type RefObject } from "react"
import * as THREE from 'three'
import { Shark } from "./Shark"



import { Joystick, type JoystickData } from "./Joystick"


import { useFollowingCamera } from "./hooks/useFollowingCamera"
import { useFoodManager, type FoodItem } from "./food/FoodManager"
import { Diver } from "./food/Diver"
import { EatFx, type EatFxHandle } from "./food/EatFx"
import { DiverEatParticles, type DiverEatParticlesHandle } from "./food/DiverEatParticles"
import { CameraShakeRig, type CameraShakeHandle } from "./hooks/useCameraShake"
import { TimerScreen } from "./hud/TimerSceen"
import { coinChip } from "./hud/kidStyle"
import { AppStateController } from "./food/AppStateController"
import { COINS_PER_DIVER } from "./food/economy"
import type { IQuestion } from "./food/tests/interfaces"
import { SKINS, type SharkSkin } from "./skins/sharkSkins"

interface IGameSceneProps {
    joystickData: JoystickData,
    onBack: () => void,
    width: number,
    height: number,
    freeze: boolean,
    skin?: SharkSkin
}
const a: IQuestion[] = []
for (let i = 0; i < 15; i++) {
    a.push({ answer: [], question: (i + 1).toString(), variants: [] })
}
const targetPositions: { [id: string]: THREE.Vector3 } = {};
export const DiversScene = ({ joystickData, onBack, freeze, height, width, skin = SKINS[0] }: IGameSceneProps) => {
    const sharkRef = useRef<THREE.Mesh>(null!);

    useFollowingCamera({ targetRef: sharkRef })

    const eatSoundRef = useRef<THREE.PositionalAudio | null>(null);
    const eatFxRef = useRef<EatFxHandle | null>(null)
    const eatParticlesRef = useRef<DiverEatParticlesHandle | null>(null)
    const shakeRef = useRef<CameraShakeHandle | null>(null)
    const [coins, setCoins] = useState<number>(() => AppStateController.getState().coins);
    const onEaten = (item: FoodItem) => {
        const p = new THREE.Vector3()
        item.ref?.current?.getWorldPosition(p)
        eatFxRef.current?.burstAt(p)
        eatParticlesRef.current?.burstAt(p)
        shakeRef.current?.shake(0.35, 0.06)
        eatSoundRef.current?.play()
    }
    const divers = useFoodManager({
        sharkRef,
        sceneHeight: height,
        sceneWidth: width,
        FoodComponent: Diver,
        questions: a,
        onEaten
    })


    // Храним целевую позицию, к которой меш будет стремиться


    // Вспомогательные объекты для расчетов
    const playerPos = new THREE.Vector3()

    useFrame((_, delta) => {
        if (!sharkRef.current) return
        for (const diver of divers) {
            if (!targetPositions[diver.props.item.id]) {
                targetPositions[diver.props.item.id] = new THREE.Vector3(0, 0, 0.4);
            }

            const targetPos = targetPositions[diver.props.item.id];

            const direction = new THREE.Vector3()

            sharkRef.current.getWorldPosition(playerPos)

            // 1. ВЫЧИСЛЯЕМ НАПРАВЛЕНИЕ УБЕГАНИЯ
            // direction = Вектор от игрока к мешу
            const item = diver.props.item;
            if (item.ref?.current) {
                if (diver.props.item.eaten) {
                    eatSoundRef.current?.play();
                    diver.props.item.eaten = false;
                    item.ref.current.position.set(100, 100, 100)
                    
                            
                            const state = AppStateController.getState();
                            state.diversEaten += 1;
                            state.coins += COINS_PER_DIVER;
                            AppStateController.setState(state);
                            setCoins(state.coins);
                  

                    setTimeout(() => {
                        
                        item.ref?.current.position.set(Math.random() * width - width / 2, Math.random() * height - height / 2, 0.4);

                    }, 1000)
                } else {
                    const itemWorldPos = new THREE.Vector3()
                    item.ref.current.getWorldPosition(itemWorldPos)
                    direction.subVectors(itemWorldPos, playerPos)
                    direction.z = 0

                    const currentDist = direction.length()

                    // 2. ОБНОВЛЯЕМ ЦЕЛЕВУЮ ТОЧКУ (Target)
                    if (currentDist < 2) {
                        // Если игрок близко, отодвигаем цель подальше в том же направлении
                        const escapePoint = direction.normalize().multiplyScalar(4).add(itemWorldPos)
                        targetPos.copy(escapePoint)
                    } else {
                        const targetDirection = new THREE.Vector3()
                        targetDirection.subVectors(itemWorldPos, targetPos)
                        if (targetDirection.length() < 1) {
                            targetPos.x = Math.random() * width - width / 2;
                            targetPos.y = Math.random() * height - height / 2;
                        }
                    }

                    // 3. ОГРАНИЧЕНИЕ ЦЕЛИ (Clamping)
                    // Чтобы цель не улетала за границы, и меш не пытался бесконечно бежать в стену
                    const halfW = width / 2
                    const halfH = height / 2

                    targetPos.x = THREE.MathUtils.clamp(targetPos.x, -halfW, halfW)
                    targetPos.y = THREE.MathUtils.clamp(targetPos.y, -halfH, halfH)

                    // 5. ИМИТАЦИЯ ОТСКОКА
                    // Если меш почти дошел до границы, мы можем "отбросить" целевую точку в центр
                    if (Math.abs(item.ref.current.position.x) >= halfW - 1) {
                        targetPos.x *= -0.5 // Цель прыгает в противоположную сторону
                    }
                    if (Math.abs(item.ref.current.position.y) >= halfH - 1) {
                        targetPos.y *= -0.5
                    }
                    // 4. ПЛАВНОЕ ДВИЖЕНИЕ (LERP)
                    // Меш плавно перемещается из текущей позиции в целевую
                    const angle = Math.atan2(targetPos.y - item.ref.current.position.y, targetPos.x - item.ref.current.position.x) - Math.PI / 2;
                    const targerQuaterion = new THREE.Quaternion();
                    targerQuaterion.setFromAxisAngle(new THREE.Vector3(0, 0, 1), angle);
                    item.ref.current.quaternion.slerp(targerQuaterion, 0.1);

                    item.ref.current.position.lerp(targetPos, delta / 3);
                    //item.ref.current.position.set(1,1,1)

                }

            }
        }
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
                            <TimerScreen onTimeEnd={onBack} />
                            <div style={{ position: 'absolute', top: 'clamp(50px, 9vh, 80px)', left: 12, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
                                <div style={coinChip}>🪙 {coins}</div>
                                <div style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 6,
                                    padding: 'clamp(5px, 1.3vh, 8px) clamp(10px, 2.4vw, 16px)',
                                    borderRadius: 999, color: 'white',
                                    background: 'rgba(0, 15, 25, 0.6)',
                                    border: '2px solid rgba(45,212,191,0.5)',
                                    fontSize: 'clamp(0.85rem, 2.4vh, 1.05rem)', fontWeight: 'bold',
                                    textShadow: '0 1px 4px rgba(0,0,0,0.6)'
                                }}>
                                    🤿 {AppStateController.getState().diversEaten}
                                </div>
                            </div>
                        </div></>}

                </Html>
                </PerspectiveCamera>
            </CameraShakeRig>


            <ControlledMesh baseSpeed={3} meshRef={sharkRef} joystickData={joystickData} sceneHeight={height} sceneWidth={width}>
                {(actionRef: RefObject<THREE.AnimationAction>) => <Shark

                    actionRef={actionRef}
                    modelPath={skin.modelPath}
                    rotation={skin.gameplay.rotation}
                    scale={skin.gameplay.scale}
                    fitSize={skin.gameplay.fitSize}
                    position={skin.gameplay.position}
                />}
            </ControlledMesh>

            {(
                <>{divers}</>
            )}
            <Suspense>
                <PositionalAudio ref={eatSoundRef} url="/music/crunch.ogg" distance={50} loop={false} />
            </Suspense>
            <EatFx handleRef={eatFxRef} />
            <DiverEatParticles handleRef={eatParticlesRef} />
            <SeaSchool sceneWidth={width} sceneHeight={height} />
            <WaterPlane height={height} width={width} />
        </>
    )
}
useGLTF.preload('/models/shark_min.glb', '/draco/')