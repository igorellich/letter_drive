export interface FoodSpecies {
  id: string
  path: string
  rotation: [number, number, number]
  scale: number
  position: [number, number, number]
  /** бюджет пропорциональный размеру для обычной рыбы; для крупных (кит/манта/дельфин) — чуть меньше */
  sizeTier: 1 | 2 | 3
}

export const FOOD_SPECIES: FoodSpecies[] = [
  { id: 'clownfish', path: '/models/food/clownfish.glb', rotation: [Math.PI / 2, Math.PI, 0], scale: 0.083506, position: [0.0015, -0.0583, 0.0233], sizeTier: 1 },
  { id: 'koi', path: '/models/food/koi.glb', rotation: [Math.PI / 2, Math.PI, 0], scale: 0.074993, position: [-0.0154, -0.0725, 0.041], sizeTier: 1 },
  { id: 'puffer', path: '/models/food/puffer.glb', rotation: [Math.PI / 2, Math.PI, 0], scale: 0.106646, position: [-0.0031, -0.0552, 0.0083], sizeTier: 1 },
  { id: 'anglerfish', path: '/models/food/anglerfish.glb', rotation: [Math.PI / 2, Math.PI, 0], scale: 0.079535, position: [-0.0001, 0.0029, 0.0451], sizeTier: 1 },
  { id: 'blue_tang', path: '/models/food/blue_tang.glb', rotation: [Math.PI / 2, Math.PI, 0], scale: 0.089866, position: [-0.0059, 0.0061, 0.0063], sizeTier: 1 },
  { id: 'swordfish', path: '/models/food/swordfish.glb', rotation: [Math.PI / 2, Math.PI, 0], scale: 0.06539, position: [-0.0118, 0.0101, 0.0438], sizeTier: 2 },
  { id: 'tuna', path: '/models/food/tuna.glb', rotation: [Math.PI / 2, Math.PI, 0], scale: 0.074882, position: [-0.0115, -0.0605, 0.0077], sizeTier: 2 },
  { id: 'goldfish', path: '/models/food/goldfish.glb', rotation: [Math.PI / 2, Math.PI, 0], scale: 0.080147, position: [-0.0016, -0.0631, 0.0367], sizeTier: 1 },
  { id: 'piranha', path: '/models/food/piranha.glb', rotation: [Math.PI / 2, Math.PI, 0], scale: 0.090804, position: [-0.0085, -0.0354, 0.0075], sizeTier: 1 },
  { id: 'yellow_tang', path: '/models/food/yellow_tang.glb', rotation: [Math.PI / 2, Math.PI, 0], scale: 0.093649, position: [-0.0157, -0.0253, 0.0307], sizeTier: 1 },
  { id: 'dolphin', path: '/models/food/dolphin.glb', rotation: [Math.PI / 2, Math.PI, 0], scale: 0.045685, position: [-0.0001, 0.0002, 0.0293], sizeTier: 2 },
  { id: 'whale', path: '/models/food/whale.glb', rotation: [Math.PI / 2, Math.PI, 0], scale: 0.04181, position: [0, -0.0622, -0.028], sizeTier: 3 },
  { id: 'manta', path: '/models/food/manta.glb', rotation: [Math.PI / 2, Math.PI, 0], scale: 0.035861, position: [-0.0043, -0.0879, -0.0245], sizeTier: 3 },
  // Краб: модель Quaternius скелетная, raw box ~2.54×1.51×1.39 → fit-scale для цели 0.42 ≈ 0.165
  { id: 'crab', path: '/models/food/crab.glb', rotation: [Math.PI / 2, Math.PI, 0], scale: 0.16516, position: [0, -0.003, -0.124], sizeTier: 1 }
]

export const FOOD_BY_ID: Record<string, FoodSpecies> = FOOD_SPECIES.reduce((acc, s) => {
  acc[s.id] = s
  return acc
}, {} as Record<string, FoodSpecies>)