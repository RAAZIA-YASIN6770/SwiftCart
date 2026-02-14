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
    viewMode: 'PHYSICS' | 'LIST';
    isSupported: boolean;
    setBodies: (bodies: BodyState[]) => void;
    setViewMode: (mode: 'PHYSICS' | 'LIST') => void;
    setIsSupported: (supported: boolean) => void;
}

export const usePhysicsStore = create<PhysicsStore>((set) => ({
    bodies: {},
    viewMode: 'PHYSICS',
    isSupported: true,
    setBodies: (bodyInfos) => {
        const bodiesMap: Record<number, BodyState> = {};
        bodyInfos.forEach((body) => {
            bodiesMap[body.id] = body;
        });
        set({ bodies: bodiesMap });
    },
    setViewMode: (viewMode) => set({ viewMode }),
    setIsSupported: (isSupported) => set({ isSupported }),
}));
