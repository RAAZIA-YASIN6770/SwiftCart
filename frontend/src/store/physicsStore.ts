import { create } from 'zustand';

interface BodyState {
    id: number;
    position: { x: number; y: number };
    angle: number;
    isStatic: boolean;
}

interface PhysicsStore {
    bodies: Record<number, BodyState>;
    setBodies: (bodies: BodyState[]) => void;
}

export const usePhysicsStore = create<PhysicsStore>((set) => ({
    bodies: {},
    setBodies: (bodyInfos) => {
        const bodiesMap: Record<number, BodyState> = {};
        bodyInfos.forEach((body) => {
            bodiesMap[body.id] = body;
        });
        set({ bodies: bodiesMap });
    },
}));
