import { create } from 'zustand';
import { encode, decode } from '@msgpack/msgpack';

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
    syncSnapshots: () => Promise<void>; // [STORY 5.3]
    recoverSnapshots: () => Promise<void>; // [STORY 5.3]
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
    },

    syncSnapshots: async () => {
        const { bodies, prices } = get();
        const snapshot = Object.values(bodies).map(b => ({
            id: b.id,
            pId: b.productId,
            pos: b.position,
            rot: b.angle,
            price: prices[b.productId]
        }));

        try {
            const packed = encode(snapshot);
            await fetch('http://localhost:8000/api/physics/snapshot/handshake/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-msgpack',
                    'X-Session-ID': 'sc_session_001'
                },
                body: packed
            });
            console.log('[Snapshot] Binary Anchor saved.');
        } catch (err) {
            console.error('[Snapshot] Failed to anchor:', err);
        }
    },

    recoverSnapshots: async () => {
        try {
            const response = await fetch('http://localhost:8000/api/physics/snapshot/recover/?session_id=sc_session_001');
            if (response.ok) {
                // Backend might send binary or JSON. Our current backend sends JSON with unpacked data.
                // But let's assume it could send binary.
                const buffer = await response.arrayBuffer();
                const data: any = decode(new Uint8Array(buffer)); // If backend sent raw msgpack

                // Adjustment: Our current backend DRF view returns a JSON Response with 'snapshot' key.
                // We'll fix the backend or adapt here. Let's fix the backend to send raw binary for "High-speed".

                if (data && Array.isArray(data)) {
                    const snapshot = data;
                    const bodiesMap: Record<number, BodyState> = {};
                    const priceMap: Record<string, number> = {};

                    snapshot.forEach((s: any) => {
                        bodiesMap[s.id] = {
                            id: s.id,
                            productId: s.pId,
                            position: s.pos,
                            angle: s.rot,
                            isStatic: false,
                            instability: 0,
                            stock: 100
                        };
                        priceMap[s.pId] = s.price;
                    });

                    set({ bodies: bodiesMap, prices: priceMap });
                    console.log('[Snapshot] Recovered from Binary Anchor.');
                }
            }
        } catch (err) {
            console.warn('[Snapshot] No previous anchor found or recovery failed.');
        }
    }
}));
