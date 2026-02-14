import { create } from 'zustand';

interface BodyState {
    id: number;
    position: { x: number; y: number };
    angle: number;
    isStatic: boolean;
    radius?: number;
}

interface PhysicsStore {
    bodies: Record<number, BodyState>;
    prices: Record<string, number>; // Product ID -> Current Price
    viewMode: 'PHYSICS' | 'LIST';
    isSupported: boolean;
    setBodies: (bodies: BodyState[]) => void;
    updatePrice: (id: string, price: number) => void;
    setViewMode: (mode: 'PHYSICS' | 'LIST') => void;
    setIsSupported: (supported: boolean) => void;
}

export const usePhysicsStore = create<PhysicsStore>((set) => ({
    bodies: {},
    prices: {},
    viewMode: 'PHYSICS',
    isSupported: true,
    setBodies: (bodyInfos) => {
        const bodiesMap: Record<number, BodyState> = {};
        bodyInfos.forEach((body) => {
            bodiesMap[body.id] = body;
        });
        set({ bodies: bodiesMap });
    },
    updatePrice: (id, price) => set((state) => ({
        prices: { ...state.prices, [id]: price }
    })),
    setViewMode: (viewMode) => set({ viewMode }),
    setIsSupported: (isSupported) => set({ isSupported }),
}));
