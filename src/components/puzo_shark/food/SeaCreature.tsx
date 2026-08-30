import { useMemo, useRef, useState, useContext, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import * as THREE from 'three'
// @ts-ignore
import { clone } from 'three/examples/jsm/utils/SkeletonUtils'
import type { FoodItem } from './FoodManager'
import { QuestionLabel } from '../hud/QuestionLabel'
import { FreezeContext } from '../../../main'
import { FOOD_SPECIES } from './foodSpecies'

const SWIM_PRIORITY = [/swim/i, /walk/i, /idle/i]

function pickSwimAction(actions: Record<string, THREE.AnimationAction | null>, names: string[]): THREE.AnimationAction | null {
  if (!names.length) return null
  let bestName = names[0]
  let bestScore = Infinity
  for (const name of names) {
    let score = SWIM_PRIORITY.length
    for (let i = 0; i < SWIM_PRIORITY.length; i++) {
      if (SWIM_PRIORITY[i].test(name)) { score = i; break }
    }
    if (score < bestScore) { bestScore = score; bestName = name }
  }
  return actions[bestName] || null
}

function hashStr(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

export const SeaCreature: React.ComponentType<{
  item: FoodItem,
  onSelectAnswer: (item: FoodItem) => void,
  sharkRef?: React.RefObject<THREE.Mesh>,
  sceneWidth?: number,
  sceneHeight?: number
}> = (props) => {
  const { item, onSelectAnswer, sharkRef, sceneWidth = 30, sceneHeight = 18 } = props
  const species = useMemo(() => FOOD_SPECIES[hashStr(item.id) % FOOD_SPECIES.length], [item.id])

  const { scene, animations } = useGLTF(species.path, '/draco/')
  const cloneScene = useMemo(() => clone(scene), [scene])
  const { actions, names } = useAnimations(animations, cloneScene)

  const groupRef = useRef<THREE.Group>(null!)
  const innerRef = useRef<THREE.Group>(null!)
  const markerRef = useRef<THREE.Group>(null!)
  const setFreeze = useContext(FreezeContext)

  const glowTex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 128
    const ctx = c.getContext('2d')!
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
    g.addColorStop(0, 'rgba(255,244,170,1)')
    g.addColorStop(0.4, 'rgba(255,212,70,0.55)')
    g.addColorStop(1, 'rgba(255,180,40,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 128, 128)
    const tex = new THREE.CanvasTexture(c)
    tex.needsUpdate = true
    return tex
  }, [])

  const [showQuestion, setShowQuestion] = useState(false)
  const [flying, setFlying] = useState(false)
  const [pop, setPop] = useState(false)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)

  const wanderTarget = useRef(new THREE.Vector3(
    item.position.x + (Math.random() - 0.5) * 4,
    item.position.y + (Math.random() - 0.5) * 4,
    item.position.z
  ))
  const fleePos = useRef(new THREE.Vector3())
  const tmpV = useRef(new THREE.Vector3())
  const tmpQ = useRef(new THREE.Quaternion())
  const faceQ = useRef(new THREE.Quaternion())
  const zAxis = useRef(new THREE.Vector3(0, 0, 1))
  const bobPhase = useRef(hashStr(item.id) % 7)

  useEffect(() => {
    const action = pickSwimAction(actions, names)
    if (action) {
      action.reset().fadeIn(0.4).play()
      action.timeScale = 1
    }
  }, [actions, names])

  useEffect(() => {
    // Показываем вопрос -> замораживаем кадры (frameloop never). Обязательно
    // сбрасываем на размонтировании, иначе пауза останется навсегда.
    setFreeze(showQuestion)
    return () => setFreeze(false)
  }, [showQuestion, setFreeze])

  useEffect(() => {
    // Ответ получен (через локальный стейт, а не мутацию item.right):
    // даём секунду на обратную связь, затем прячем оверлей и запускаем
    // полёт к шкале (или «пуф» для неверного ответа).
    if (!feedback) return
    const t = setTimeout(() => {
      setShowQuestion(false)
      if (feedback === 'correct') setFlying(true)
      else setPop(true)
    }, 700)
    return () => clearTimeout(t)
  }, [feedback])

  useEffect(() => {
    if (item.eaten === true && item.right !== true && item.right !== false) {
      if (!item.question) { setPop(true); return }
      setShowQuestion(true)
    }
  }, [item.eaten, item.right, item.question])

  const afterAnswer = (foodItem: FoodItem) => {
    onSelectAnswer(foodItem)
  }

  useFrame((_, delta) => {
    const g = groupRef.current
    if (!g) return

    if (flying) {
      g.position.x += delta * 6.5
      g.position.y += delta * 4.5
      g.rotation.z += delta * 3.2
      g.scale.setScalar(Math.min(2.5, g.scale.x + delta * 1.8))
      if (innerRef.current) innerRef.current.visible = Math.random() > 0.08
      return
    }
    if (pop) {
      const s = Math.max(0.001, g.scale.x - delta * 2.2)
      g.scale.setScalar(s)
      g.rotation.z += delta * 6
      if (s <= 0.02) g.visible = false
      return
    }
    if (showQuestion) return

    const halfW = sceneWidth / 2 - 0.5
    const halfH = sceneHeight / 2 - 0.5
    let target = wanderTarget.current

    // Плавное отталкивание от акулы: без жёсткого порога (который флапал
    // on/off и вызывал «тряску»), а с мягким затуханием по дистанции.
    // Чем ближе акула — тем сильнее рыбка смещается в противоположную сторону.
    if (sharkRef?.current) {
      sharkRef.current.getWorldPosition(fleePos.current)
      tmpV.current.subVectors(g.position, fleePos.current).setZ(0)
      const dist = tmpV.current.length()
      const maxDist = 1.6   // радиус, с которого начинается страх
      const minDist = 0.5   // мертвая зона (уже совсем рядом)
      const push = dist > minDist
        ? Math.min(1, (maxDist - dist) / (maxDist - minDist))
        : 1
      if (push > 0) {
        if (tmpV.current.lengthSq() < 0.001) tmpV.current.set(1, 0, 0)
        tmpV.current.normalize().multiplyScalar(2.5 * push).add(g.position)
        tmpV.current.x = THREE.MathUtils.clamp(tmpV.current.x, -halfW, halfW)
        tmpV.current.y = THREE.MathUtils.clamp(tmpV.current.y, -halfH, halfH)
        // Смешиваем цель побега с текущей wander-целью, чтобы уход был
        // плавным и не дёргался при переключении между целями.
        wanderTarget.current.lerp(tmpV.current, 0.25)
        target = wanderTarget.current
      }
    }
    if (g.position.distanceTo(target) < 0.7) {
      wanderTarget.current.set(
        THREE.MathUtils.clamp(g.position.x + (Math.random() - 0.5) * 7, -halfW, halfW),
        THREE.MathUtils.clamp(g.position.y + (Math.random() - 0.5) * 7, -halfH, halfH),
        g.position.z
      )
      target = wanderTarget.current
    }
    const ease = 1.2
    g.position.lerp(target, Math.min(ease, delta * ease))

    tmpV.current.subVectors(target, g.position)
    if (tmpV.current.length() > 0.05) {
      const angle = Math.atan2(tmpV.current.x, tmpV.current.y)
      faceQ.current.setFromAxisAngle(zAxis.current, -angle)
      tmpQ.current.slerpQuaternions(faceQ.current, g.quaternion, 0.08)
      g.quaternion.copy(tmpQ.current)
    }

    const t = performance.now() / 1000
    innerRef.current.position.z = Math.sin(t * 2 + bobPhase.current) * 0.02
    innerRef.current.rotation.z = Math.sin(t * 1.7 + bobPhase.current) * 0.15

    if (markerRef.current) {
      const m = markerRef.current
      m.scale.setScalar(1 + 0.18 * Math.sin(t * 3.5 + bobPhase.current))
      m.position.z = 0.28 + 0.05 * Math.sin(t * 2.1 + bobPhase.current)
    }
  })

  return (
    <group
      ref={(el) => {
        groupRef.current = el as THREE.Group
        item.ref = { current: el as THREE.Group }
      }}
      position={item.position}
    >
      {!showQuestion && (
        <group ref={innerRef}>
          <group
            rotation={species.rotation as [number, number, number]}
            scale={species.scale}
            position={species.position}
          >
            <primitive object={cloneScene} />
          </group>
        </group>
      )}

      {!showQuestion && !flying && !pop && (
        <group ref={markerRef} position={[0, 0, 0.28]}>
          <sprite scale={[0.55, 0.55, 1]}>
            <spriteMaterial map={glowTex} transparent opacity={0.9} depthWrite={false} />
          </sprite>
          <sprite position={[0, 0, 0.08]} scale={[0.22, 0.22, 1]}>
            <spriteMaterial map={glowTex} transparent opacity={1} depthWrite={false} />
          </sprite>
        </group>
      )}

      {showQuestion &&
        (() => {
          const q = item.question
          return q ? <QuestionLabel onSelectAnswer={afterAnswer} onGraded={(correct) => setFeedback(correct ? 'correct' : 'wrong')} foodItem={{ ...item, question: q }} /> : null
        })()}
    </group>
  )
}

for (const s of FOOD_SPECIES) {
  useGLTF.preload(s.path, '/draco/')
}