import { create } from 'zustand';

interface BodyState {
    id: number;
    productId: string; // Associated Product UUID
    position: { x: number; y: number };
    angle: number;
    isStatic: boolean;
    radius?: number;
    instability: number; // 0.0 to 1.0 (Redshift intensity)
}

interface PhysicsStore {
    bodies: Record<number, BodyState>;
    prices: Record<string, number>; // Current Price
    previousPrices: Record<string, number>; // Last Price (for deltas)
    viewMode: 'PHYSICS' | 'LIST';
    isSupported: boolean;
    reducedMotion: boolean;
    failedFlickCount: Record<number, number>; // bodyId -> failure count
    setBodies: (bodies: BodyState[]) => void;
    setInstability: (bodyId: number, instability: number) => void;
    updatePrice: (id: string, price: number) => void;
    setViewMode: (mode: 'PHYSICS' | 'LIST') => void;
    setIsSupported: (supported: boolean) => void;
    setReducedMotion: (reduced: boolean) => void;
    recordFlickFailure: (bodyId: number) => void;
    resetFlickFailure: (bodyId: number) => void;
}

export const usePhysicsStore = create<PhysicsStore>((set) => ({
    bodies: {},
    prices: {},
    previousPrices: {},
    viewMode: 'PHYSICS',
    isSupported: true,
    reducedMotion: false,
    failedFlickCount: {},
    setBodies: (bodyInfos) => {
        const bodiesMap: Record<number, BodyState> = {};
        bodyInfos.forEach((body) => {
            bodiesMap[body.id] = {
                ...body,
                instability: body.instability || 0
            };
        });
        set({ bodies: bodiesMap });
    },
    setInstability: (bodyId, instability) => set((state) => ({
        bodies: {
            ...state.bodies,
            [bodyId]: { ...state.bodies[bodyId], instability }
        }
    })),
    updatePrice: (id, price) => set((state) => ({
        previousPrices: { ...state.previousPrices, [id]: state.prices[id] || price },
        prices: { ...state.prices, [id]: price }
    })),
    setViewMode: (viewMode) => set({ viewMode }),
    setIsSupported: (isSupported) => set({ isSupported }),
    setReducedMotion: (reducedMotion) => set({ reducedMotion }),
    recordFlickFailure: (bodyId) => set((state) => ({
        failedFlickCount: {
            ...state.failedFlickCount,
            [bodyId]: (state.failedFlickCount[bodyId] || 0) + 1
        }
    })),
    resetFlickFailure: (bodyId) => set((state) => {
        const newCounts = { ...state.failedFlickCount };
        delete newCounts[bodyId];
        return { failedFlickCount: newCounts };
    }),
}));
