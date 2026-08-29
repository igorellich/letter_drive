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
    }
}

const LOCAL_STORAGE_KEY = 'eat_steak_skin'

export const SKINS: SharkSkin[] = [
    {
        id: 'classic',
        title: 'Классическая акула',
        modelPath: '/models/shark_min.glb',
        gameplay: { scale: 0.003, rotation: [Math.PI / 2, Math.PI, 0] },
        preview: { rotation: [Math.PI / 2, Math.PI, 0], autoRotateSpeed: 1.5 }
    },
    {
        id: 'hamburger',
        title: 'Гамбургер',
        modelPath: '/models/hamburger.glb',
        gameplay: {
            scale: 0.13686,
            rotation: [0, 0, Math.PI / 2],
            position: [0.6961, -0.0009, 0.0095]
        },
        preview: { rotation: [0, 0, Math.PI / 2], autoRotateSpeed: 1.5 }
    },
    {
        id: 'donut',
        title: 'Пончик',
        modelPath: '/models/donut.glb',
        gameplay: {
            scale: 0.17409,
            rotation: [0, 0, Math.PI / 2],
            position: [0.3786, 0.0004, -0.0144]
        },
        preview: { rotation: [0, 0, Math.PI / 2], autoRotateSpeed: 1.5 }
    },
    {
        id: 'octopus',
        title: 'Осьминог',
        modelPath: '/models/octopus.glb',
        gameplay: {
            scale: 0.00331,
            rotation: [Math.PI / 2, Math.PI / 2, 0],
            position: [0.0375, -0.0019, 0.5372]
        },
        preview: { rotation: [Math.PI / 2, Math.PI / 2, 0], autoRotateSpeed: 1.5 }
    },
    {
        id: 'whale',
        title: 'Кит',
        modelPath: '/models/whale.glb',
        gameplay: {
            scale: 1.55519,
            rotation: [Math.PI / 2, Math.PI / 2, 0],
            position: [0.343, 0.261, 0.1549]
        },
        preview: { rotation: [Math.PI / 2, Math.PI / 2, 0], autoRotateSpeed: 1.5 }
    },
    {
        id: 'triceratops',
        title: 'Трицератопс',
        modelPath: '/models/triceratops.glb',
        gameplay: {
            scale: 0.07741,
            rotation: [-Math.PI / 2, 0, -Math.PI],
            position: [0, 0.0816, -0.3071]
        },
        preview: { rotation: [-Math.PI / 2, 0, -Math.PI], autoRotateSpeed: 1.5 }
    },
    {
        id: 'trex',
        title: 'Тираннозавр',
        modelPath: '/models/trex.glb',
        gameplay: {
            scale: 0.05616,
            rotation: [-Math.PI / 2, 0, -Math.PI],
            position: [0, 0.0591, -0.4442]
        },
        preview: { rotation: [-Math.PI / 2, 0, -Math.PI], autoRotateSpeed: 1.5 }
    },
    {
        id: 'ufo',
        title: 'Летающая тарелка',
        modelPath: '/models/ufo.glb',
        gameplay: {
            scale: 0.00411,
            rotation: [Math.PI / 2, Math.PI / 2, 0],
            position: [0, -0.0019, -0.136]
        },
        preview: { rotation: [Math.PI / 2, Math.PI / 2, 0], autoRotateSpeed: 1.5 }
    },
    {
        id: 'robot',
        title: 'Робот',
        modelPath: '/models/robot.glb',
        gameplay: {
            scale: 0.26327,
            rotation: [-Math.PI / 2, 0, -Math.PI],
            position: [-0.0007, 0.0022, -0.6216]
        },
        preview: { rotation: [-Math.PI / 2, 0, -Math.PI], autoRotateSpeed: 1.5 }
    },
    {
        id: 'rocket',
        title: 'Ракета',
        modelPath: '/models/rocket.glb',
        gameplay: {
            scale: 1.29208,
            rotation: [0, 0, 0],
            position: [0.0115, -0.3779, -0.0138]
        },
        preview: { rotation: [0, 0, 0], autoRotateSpeed: 1.5 }
    },
    {
        id: 'duck',
        title: 'Резиновая уточка',
        modelPath: '/models/rubber_duck.glb',
        gameplay: {
            scale: 0.24329,
            rotation: [-Math.PI / 2, 0, -Math.PI],
            position: [0, -0.0019, -0.7143]
        },
        preview: { rotation: [-Math.PI / 2, 0, -Math.PI], autoRotateSpeed: 1.5 }
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