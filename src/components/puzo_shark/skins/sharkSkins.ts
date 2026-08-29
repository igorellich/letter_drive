export interface SharkSkin {
    id: string
    title: string
    modelPath: string
    gameplay: {
        scale: number
        rotation: [number, number, number]
        fitSize?: number
        position?: [number, number, number]
    }
    preview: {
        rotation: [number, number, number]
        autoRotateSpeed: number
        scale?: number
        position?: [number, number, number]
    }
}

const LOCAL_STORAGE_KEY = 'eat_steak_skin'

export const SKINS: SharkSkin[] = [
    {
        id: 'classic',
        title: 'Классическая акула',
        modelPath: '/models/shark_min.glb',
        gameplay: { scale: 0.003, rotation: [Math.PI / 2, Math.PI, 0] },
        // Превью: акула «плывёт» горизонтально боком (нос вправо), спина вверх. Нос модели в корне = +Y.
        preview: { rotation: [0, Math.PI / 2, 0], autoRotateSpeed: 1.5 }
    },
    {
        id: 'hamburger',
        title: 'Гамбургер',
        modelPath: '/models/hamburger.glb',
        gameplay: {
            scale: 0.04901,
            rotation: [Math.PI / 2, Math.PI / 2, 0],
            position: [0.00945, -0.00151, -0.26618]
        },
        preview: { rotation: [0, -Math.PI / 2, 0], autoRotateSpeed: 1.5 }
    },
    {
        id: 'donut',
        title: 'Пончик',
        modelPath: '/models/donut.glb',
        gameplay: {
            scale: 0.06234,
            rotation: [Math.PI / 2, Math.PI / 2, 0],
            position: [0.00091, -0.00105, -0.15249]
        },
        preview: { rotation: [0, -Math.PI / 2, 0], autoRotateSpeed: 1.5 }
    },
    {
        id: 'octopus',
        title: 'Осьминог',
        modelPath: '/models/octopus.glb',
        gameplay: {
            scale: 0.00118,
            rotation: [Math.PI / 2, Math.PI / 2, 0],
            position: [0.01344, -0.0019, 0.18152]
        },
        preview: { rotation: [0, -Math.PI / 2, 0], autoRotateSpeed: 1.5 }
    },
    {
        id: 'whale',
        title: 'Кит',
        modelPath: '/models/whale.glb',
        gameplay: {
            scale: 0.55694,
            rotation: [Math.PI / 2, Math.PI / 2, 0],
            position: [0.12284, 0.09226, 0.04462]
        },
        preview: { rotation: [0, -Math.PI / 2, 0], autoRotateSpeed: 1.5 }
    },
    {
        id: 'triceratops',
        title: 'Трицератопс',
        modelPath: '/models/triceratops.glb',
        gameplay: {
            scale: 0.02772,
            rotation: [-Math.PI / 2, 0, -Math.PI],
            position: [0, 0.02801, -0.12082]
        },
        preview: { rotation: [0, 0, 0], autoRotateSpeed: 1.5, scale: 0.13327, position: [0, -0.4998, 0.1439] }
    },
    {
        id: 'trex',
        title: 'Тираннозавр',
        modelPath: '/models/trex.glb',
        gameplay: {
            scale: 0.02011,
            rotation: [-Math.PI / 2, 0, -Math.PI],
            position: [0, 0.01996, -0.16991]
        },
        preview: { rotation: [0, 0, 0], autoRotateSpeed: 1.5, scale: 0.09668, position: [0, -0.7358, 0.1054] }
    },
    {
        id: 'ufo',
        title: 'Летающая тарелка',
        modelPath: '/models/ufo.glb',
        gameplay: {
            scale: 0.00147,
            rotation: [Math.PI / 2, Math.PI / 2, 0],
            position: [0, -0.0019, -0.05954]
        },
        preview: { rotation: [0, -Math.PI / 2, 0], autoRotateSpeed: 1.5 }
    },
    {
        id: 'robot',
        title: 'Робот',
        modelPath: '/models/robot.glb',
        gameplay: {
            scale: 0.09428,
            rotation: [-Math.PI / 2, 0, -Math.PI],
            position: [-0.00026, -0.0004, -0.23346]
        },
        preview: { rotation: [0, 0, 0], autoRotateSpeed: 1.5 }
    },
    {
        id: 'rocket',
        title: 'Ракета',
        modelPath: '/models/rocket.glb',
        gameplay: {
            scale: 0.46272,
            rotation: [0, 0, 0],
            position: [0.00411, -0.13656, -0.01577]
        },
        preview: { rotation: [-Math.PI / 2, 0, -Math.PI], autoRotateSpeed: 1.5 }
    },
    {
        id: 'duck',
        title: 'Резиновая уточка',
        modelPath: '/models/rubber_duck.glb',
        gameplay: {
            scale: 0.08712,
            rotation: [-Math.PI / 2, 0, -Math.PI],
            position: [0, -0.0019, -0.26664]
        },
        preview: { rotation: [0, 0, 0], autoRotateSpeed: 1.5 }
    }
]

export function loadSkinId(): string {
    try {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY)
        if (saved && SKINS.some(s => s.id === saved)) return saved
    } catch { /* localStorage может быть недоступен */ }
    return SKINS[0].id
}

export function saveSkinId(id: string): void {
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, id)
    } catch { /* localStorage может быть недоступен */ }
}