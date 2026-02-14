import { useState, useRef, useCallback } from 'react';

interface Velocity {
    x: number;
    y: number;
}

interface GestureOptions {
    onDragStart?: (id: number) => void;
    onDrag?: (id: number, position: { x: number; y: number }) => void;
    onFlick?: (id: number, velocity: Velocity) => void;
}

export const useGestures = (options: GestureOptions) => {
    const [draggingId, setDraggingId] = useState<number | null>(null);
    const lastPos = useRef({ x: 0, y: 0 });
    const velocity = useRef<Velocity>({ x: 0, y: 0 });
    const lastTime = useRef<number>(0);

    const handlePointerDown = useCallback((e: React.PointerEvent, id: number) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        setDraggingId(id);
        lastPos.current = { x: e.clientX, y: e.clientY };
        lastTime.current = performance.now();
        velocity.current = { x: 0, y: 0 };

        options.onDragStart?.(id);
    }, [options]);

    const handlePointerMove = useCallback((e: React.PointerEvent) => {
        if (draggingId === null) return;

        const now = performance.now();
        const dt = now - lastTime.current;

        if (dt > 0) {
            const dx = e.clientX - lastPos.current.x;
            const dy = e.clientY - lastPos.current.y;

            // Smoothing velocity
            velocity.current = {
                x: (dx / dt) * 16.67, // Normalize to px per frame
                y: (dy / dt) * 16.67
            };

            const rect = (e.currentTarget as HTMLElement).parentElement?.getBoundingClientRect();
            if (rect) {
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                options.onDrag?.(draggingId, { x, y });
            }
        }

        lastPos.current = { x: e.clientX, y: e.clientY };
        lastTime.current = now;
    }, [draggingId, options]);

    const handlePointerUp = useCallback((e: React.PointerEvent) => {
        if (draggingId === null) return;

        e.currentTarget.releasePointerCapture(e.pointerId);

        // Final velocity injection
        options.onFlick?.(draggingId, velocity.current);

        setDraggingId(null);
    }, [draggingId, options]);

    return {
        draggingId,
        bindGesture: (id: number) => ({
            onPointerDown: (e: React.PointerEvent) => handlePointerDown(e, id),
            onPointerMove: handlePointerMove,
            onPointerUp: handlePointerUp,
            style: { cursor: draggingId === id ? 'grabbing' : 'grab', touchAction: 'none' }
        })
    };
};
