import { useEffect, useRef } from 'react';
import { usePhysicsStore } from '../store/physicsStore';

export const usePhysicsWorker = () => {
    const workerRef = useRef<Worker | null>(null);
    const { setBodies } = usePhysicsStore();

    useEffect(() => {
        // Initialize Physics Worker
        // Note: Vite handles this URL correctly in both dev and production
        const worker = new Worker(
            new URL('../physics/physics.worker.ts', import.meta.url),
            { type: 'module' }
        );

        workerRef.current = worker;

        // Listen for messages from the worker
        worker.onmessage = (event: MessageEvent) => {
            const { type, bodies } = event.data;

            if (type === 'PHYSICS_UPDATE') {
                setBodies(bodies);
            }
        };

        // Initialize the engine
        worker.postMessage({ type: 'INIT' });

        // Cleanup on unmount
        return () => {
            worker.terminate();
            workerRef.current = null;
        };
    }, [setBodies]);

    const addBody = (payload: any) => {
        workerRef.current?.postMessage({ type: 'ADD_BODY', payload });
    };

    const applyImpulse = (bodyId: number, impulse: { x: number; y: number }) => {
        workerRef.current?.postMessage({ type: 'APPLY_IMPULSE', payload: { bodyId, impulse } });
    };

    const updateBody = (bodyId: number, update: any) => {
        workerRef.current?.postMessage({ type: 'UPDATE_BODY', payload: { bodyId, update } });
    };

    return { addBody, applyImpulse, updateBody };
};
