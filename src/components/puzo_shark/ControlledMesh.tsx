import { useMemo, useRef, type ReactElement, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { JoystickData } from './Joystick'
import { TopDownBubbleTrail } from './BubbleTrail'

const MAX_POINTS = 64; 

export const ControlledMesh = (props: {
  baseSpeed: number,
  children: (actionRef: RefObject<THREE.AnimationAction>) => ReactElement,
  meshRef: RefObject<THREE.Mesh>,
  joystickData: JoystickData,
  sceneWidth: number,
  sceneHeight: number
}) => {
  const { joystickData, meshRef,sceneHeight, sceneWidth } = props;
  
  
  const pathRef = useRef<THREE.Vector3[]>([]);
  //const isDrawing = useRef(false);
  const isMovingRef = useRef<boolean>(false);
  
  const targetPos = useMemo(() => new THREE.Vector3(0, 0, -0.5), [])
  const targetQuaternion = useMemo(() => new THREE.Quaternion(), [])
  const currentDir = useMemo(() => new THREE.Vector3(0, 1, 0), [])
  const moveDir = useMemo(() => new THREE.Vector3(), [])
  const actionRef = useRef<THREE.AnimationAction>(null!);

  const lineGeomRef = useRef<THREE.BufferGeometry>(null!);
  const linePoints = useMemo(() => new Float32Array(MAX_POINTS * 3), []);

  const updateLineVisual = () => {
    if (!lineGeomRef.current) return;
    const path = pathRef.current;
    const posAttr = lineGeomRef.current.attributes.position;
    for (let i = 0; i < MAX_POINTS; i++) {
      const p = path[i] || (path.length > 0 ? path[path.length - 1] : targetPos);
      linePoints[i * 3] = p.x;
      linePoints[i * 3 + 1] = p.y;
      linePoints[i * 3 + 2] = p.z;
    }
    posAttr.needsUpdate = true;
  };

  // const handlePointer = (e: any) => {
  //   if (!isDrawing.current) return;
  //   const path = pathRef.current;
  //   const lastPoint = path[path.length - 1];
  //   // Увеличили порог записи, чтобы линия была чище
  //   if (path.length < MAX_POINTS && (!lastPoint || lastPoint.distanceTo(e.point) > 0.5)) {
  //     const p = e.point.clone();
  //     p.z = -0.5;
  //     path.push(p);
  //     updateLineVisual();
  //   }
  // };

  useFrame((_, delta) => {
    if (delta > 2) {
      joystickData.active = false;
      joystickData.x = 0;
      joystickData.y = 0;
    }
    const mesh = meshRef.current;
    const path = pathRef.current;
    if (!mesh) return;

    let moving = joystickData.active;

    if (path.length > 0 && !joystickData.active) {
      moving = true;
      const nextPoint = path[0];
      const distToNext = targetPos.distanceTo(nextPoint);

      // 1. РАСЧЕТ НАПРАВЛЕНИЯ
      moveDir.subVectors(nextPoint, targetPos);
      
      // КЛЮЧЕВОЙ ФИКС: Поворачиваем только если цель не слишком близко (> 0.2)
      // Это убирает дерганье в финальной точке пути
      if (moveDir.length() > 0.2) {
        moveDir.normalize();
        currentDir.lerp(moveDir, 0.35); 
        const angle = Math.atan2(currentDir.x, currentDir.y);
        const targetQ = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), -angle);
        targetQuaternion.slerp(targetQ, 0.4);
      }

      // 2. ДВИЖЕНИЕ
      targetPos.addScaledVector(currentDir, 3.0 * delta);

      // 3. ПОГЛОЩЕНИЕ ТОЧКИ
      // Увеличили радиус до 0.8, чтобы меш "пролетал" через точки плавнее
      if (distToNext < 0.8) {
        path.shift();
        updateLineVisual();
      }
    } 
    else if (joystickData.active ) {
      if (path.length > 0) {
        pathRef.current = [];
        updateLineVisual();
      }
      const joySpeed = 10 * delta;
      
      targetPos.x += joystickData.x * joySpeed;
      targetPos.y += joystickData.y * joySpeed;
      
      const angle = Math.atan2(joystickData.x, joystickData.y);
      targetQuaternion.setFromAxisAngle(new THREE.Vector3(0, 0, 1), -angle);
    }

    isMovingRef.current = moving;

    // ПРИМЕНЕНИЕ ТРАНСФОРМАЦИЙ
    mesh.position.lerp(targetPos, 0.3);
    mesh.quaternion.slerp(targetQuaternion, 0.4);

    const margin = 0.5;
    //  mesh.position.x = THREE.MathUtils.clamp(mesh.position.x, -viewport.width / 2 + margin, viewport.width / 2 - margin);
    //  mesh.position.y = THREE.MathUtils.clamp(mesh.position.y, -viewport.height / 2 + margin, viewport.height / 2 - margin);
    mesh.position.x = THREE.MathUtils.clamp(mesh.position.x, -sceneWidth / 2 + margin, sceneWidth / 2 - margin);
     mesh.position.y = THREE.MathUtils.clamp(mesh.position.y, -sceneHeight / 2 + margin, sceneHeight / 2 - margin);
    
    if (joystickData.active || path.length === 0) {
       targetPos.copy(mesh.position);
    }

    if (actionRef.current) {
      const ts = moving ? (path.length > 0 || joystickData.active ? 11.0 : 3.5) : 0.6;
      actionRef.current.timeScale = THREE.MathUtils.lerp(actionRef.current.timeScale, ts, 0.2);
    }
  });

  return (
    <group>
      <mesh 
        visible={false} 
        // onPointerDown={(e) => { 
        //   isDrawing.current = true; 
        //   pathRef.current = [meshRef.current?.position.clone() || e.point.clone()];
        //   updateLineVisual();
        // }}
        // onPointerMove={handlePointer}
        // onPointerUp={() => isDrawing.current = false}
      >
        <planeGeometry args={[sceneWidth * 2, sceneHeight * 2]} />
      </mesh>

      <line>
        <bufferGeometry ref={lineGeomRef}>
          <bufferAttribute 
            attach="attributes-position" 
            args={[linePoints, 3]} 
            count={MAX_POINTS} 
            itemSize={3} 
          />
        </bufferGeometry>
        <lineBasicMaterial color="#00f2ff" transparent opacity={0.4} />
      </line>

      <group ref={meshRef}>
        {props.children(actionRef)}
      </group>
      
      <TopDownBubbleTrail 
        isMovingRef={isMovingRef} 
        sharkRef={meshRef} 
        count={400} 
        bubbleSize={0.03}

      />
    </group>
  )
}
