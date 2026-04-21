import { useRef, useEffect, useCallback, type RefObject, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface UseMeshDisintegrateOptions {
  particleCount?: number;
  particleSize?: number;
  explosionSpeed?: number;
  delayBeforeExplosion?: number;
  decay?: number;
  enabled?: boolean;
}

const randomVector = (min = -1, max = 1) =>
  new THREE.Vector3(
    Math.random() * (max - min) + min,
    Math.random() * (max - min) + min,
    Math.random() * (max - min) + min
  ).normalize();

export const useMeshDisintegrate = (
  gltf: THREE.Group | null,
  options: UseMeshDisintegrateOptions = {}
): RefObject<THREE.InstancedMesh | null> => {
  const {
    particleCount = 200,
    particleSize = 0.05,
    explosionSpeed = 0.02,
    delayBeforeExplosion = 800,
    decay = 0.995,
    enabled = false
  } = options;
  const colorArray = new Float32Array(particleCount*3);
  const meshRef = useRef<THREE.InstancedMesh | null>(null);
  const dummyRef = useRef(new THREE.Object3D());
  const [_, setCurrMesh] = useState<THREE.InstancedMesh | null>(null)
  const particleDataRef = useRef<{ position: THREE.Vector3; velocity: THREE.Vector3; rotation: THREE.Euler; rotationSpeed: THREE.Vector3 }[]>([]);
  

  // ✅ Пересоздаём initParticles при каждом изменении gltf/options
  const initParticles = useCallback(() => {
    if (!gltf) {
      console.warn('useMeshDisintegrate: gltf is null');
      return;
    }
   
    // Очистка старого меша (если есть)
    if (meshRef.current) {
      meshRef.current.geometry.dispose();
      const material = meshRef.current.material;
      if (Array.isArray(material)) {
        material.forEach((m) => m.dispose());
      } else {
        material.dispose();
      }
      meshRef.current.dispose();
      meshRef.current = null;
    }

    gltf.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(gltf);
    console.log('box', box)
    const positions: THREE.Vector3[] = [];
    for (let i = 0; i < particleCount; i++) {
      const p = new THREE.Vector3();
      p.x = 0//THREE.MathUtils.lerp(box.min.x, box.max.x, Math.random());
      p.y = 0//THREE.MathUtils.lerp(box.min.y, box.max.y, Math.random());
      p.z = 0//THREE.MathUtils.lerp(box.min.z, box.max.z, Math.random());
      positions.push(p);
    }

    const data = positions.map((pos) => ({
      position: pos.clone(),
      velocity: randomVector().multiplyScalar(explosionSpeed),
      rotation: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI),
      rotationSpeed: randomVector().multiplyScalar(0.1),
    }));

    particleDataRef.current = data;

    const geometry = new THREE.BoxGeometry(particleSize, particleSize, particleSize);
    const material = new THREE.MeshStandardMaterial({ vertexColors:true, roughness: 0.6 });
    const mesh = new THREE.InstancedMesh(geometry, material, particleCount);
    const tempColor = new THREE.Color();
    data.forEach((d, i) => {
      tempColor.set(Math.random()*0xffffff);
      tempColor.toArray(colorArray,i*3);
      dummyRef.current.position.copy(d.position);
      dummyRef.current.rotation.set(0, 0, 0);
      dummyRef.current.updateMatrix();
      mesh.setMatrixAt(i, dummyRef.current.matrix);
    });
    geometry.setAttribute('color', new THREE.InstancedBufferAttribute(colorArray,3));

    mesh.instanceMatrix.needsUpdate = true;
    setTimeout(()=>{
      meshRef.current = mesh;
      setCurrMesh(mesh);
    },100)
   

    console.log('✅ [INIT] Created', particleCount, 'particles, box:', box);
  }, [gltf, particleCount, particleSize, explosionSpeed]);

  useEffect(() => {
    // Инициализация при монтировании
    initParticles();
  }, [initParticles]);

  // ✅ Сброс при enabled = true
  useEffect(() => {
    if (enabled) {
      console.log('⚡ [ENABLED] Resetting particles...');
      initParticles();
    }
  }, [enabled, initParticles]);

  useFrame((state, delta) => {
    if (!enabled || !meshRef.current || particleDataRef.current.length === 0) return;
    if (state.clock.elapsedTime * 1000 < delayBeforeExplosion) return;

    const dummy = dummyRef.current;
    const data = particleDataRef.current;

    for (let i = 0; i < data.length; i++) {
      const d = data[i];
      d.velocity.multiplyScalar(decay); // замедление
      d.position.add(d.velocity.clone().multiplyScalar(delta * 60));
      d.rotation.x += d.rotationSpeed.x * delta * 60;
      d.rotation.y += d.rotationSpeed.y * delta * 60;
      d.rotation.z += d.rotationSpeed.z * delta * 60;

      dummy.position.copy(d.position);
      dummy.rotation.set(d.rotation.x, d.rotation.y, d.rotation.z);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return meshRef;
};