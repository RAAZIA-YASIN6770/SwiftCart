import { create } from 'zustand';

interface BodyState {
    id: number;
    productId: string; // Associated Product UUID
    position: { x: number; y: number };
    angle: number;
    isStatic: boolean;
    radius?: number;
    instability: number; // 0.0 to 1.0 (Redshift intensity)
    stock: number;
}

interface PhysicsStore {
    bodies: Record<number, BodyState>;
    prices: Record<string, number>; // Current Price
    previousPrices: Record<string, number>; // Last Price (for deltas)
    viewMode: 'PHYSICS' | 'LIST';
    isSupported: boolean;
    reducedMotion: boolean;
    failedFlickCount: Record<number, number>; // bodyId -> failure count
    paradoxError: string | null; // [EPIC 5]
    snapshots: Record<string, { x: number; y: number; rotation: number; price: number }>; // [EPIC 5.2]
    setBodies: (bodies: BodyState[]) => void;
    setInstability: (bodyId: number, instability: number) => void;
    updatePrice: (id: string, price: number) => void;
    setViewMode: (mode: 'PHYSICS' | 'LIST') => void;
    setIsSupported: (supported: boolean) => void;
    setReducedMotion: (reduced: boolean) => void;
    recordFlickFailure: (bodyId: number) => void;
    resetFlickFailure: (bodyId: number) => void;
    setParadoxError: (error: string | null) => void;
    clearParadoxError: () => void;
    captureSnapshot: (productId: string, bodyId: number) => void;
    restoreFromSnapshot: (productId: string) => void;
}

export const usePhysicsStore = create<PhysicsStore>((set, get) => ({
    bodies: {},
    prices: {},
    previousPrices: {},
    viewMode: 'PHYSICS',
    isSupported: true,
    reducedMotion: false,
    failedFlickCount: {},
    snapshots: {},
    setBodies: (bodyInfos) => {
        const bodiesMap: Record<number, BodyState> = {};
        bodyInfos.forEach((body) => {
            bodiesMap[body.id] = {
                ...body,
                instability: body.instability || 0,
                stock: body.stock !== undefined ? body.stock : 100
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
    paradoxError: null, // [EPIC 5] Global Error State
    setParadoxError: (error) => set({ paradoxError: error }),
    clearParadoxError: () => set({ paradoxError: null }),

    captureSnapshot: (productId, bodyId) => {
        const state = get();
        const body = state.bodies[bodyId];
        if (body) {
            set((state) => ({
                snapshots: {
                    ...state.snapshots,
                    [productId]: {
                        x: body.position.x,
                        y: body.position.y,
                        rotation: body.angle,
                        price: state.prices[productId] || 0
                    }
                }
            }));
        }
    },

    restoreFromSnapshot: (productId) => {
        const snapshot = get().snapshots[productId];
        if (snapshot) {
            set((state) => ({
                prices: { ...state.prices, [productId]: snapshot.price },
                // We keep snapshots record for potential multiple retries
            }));
        }
    }
}));
