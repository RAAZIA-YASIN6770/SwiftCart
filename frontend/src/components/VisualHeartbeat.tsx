import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface VisualHeartbeatProps {
    price: number;
    previousPrice?: number;
    reducedMotion?: boolean;
    children: React.ReactNode;
}

/**
 * VisualHeartbeat component extracted from FlickableOrb logic.
 * Triggers a 'Glow' on every price update and a 'Glitch' on price drops.
 * Intensity scales based on the delta.
 */
const VisualHeartbeat: React.FC<VisualHeartbeatProps> = ({
    price,
    reducedMotion = false,
    children
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const lastPrice = useRef<number>(price);

    const triggerUpdateEffect = React.useCallback((delta: number) => {
        if (!containerRef.current || reducedMotion) return;

        const isDrop = delta < 0;
        const absDelta = Math.abs(delta);

        // Intensity scaling: 0.1 delta -> 1.0 intensity, 1.0 delta -> 2.5 intensity (clamped)
        const intensity = Math.min(2.5, 1 + absDelta * 5);

        const tl = gsap.timeline();

        // 1. GLOW (Every update)
        // Glow color: Aqua for stable/up, Red-Orange for drop
        const glowColor = isDrop ? 'rgba(255, 68, 0, 0.8)' : 'rgba(0, 255, 255, 0.6)';

        tl.to(containerRef.current, {
            boxShadow: `0 0 ${15 * intensity}px ${glowColor}`,
            duration: 0.1,
            ease: "power2.out"
        });

        // 2. GLITCH (Only on drop)
        if (isDrop) {
            tl.to(containerRef.current, {
                filter: `hue-rotate(${45 * intensity}deg) brightness(${1.2 * intensity})`,
                duration: 0.05,
                repeat: 3,
                yoyo: true,
                ease: "none",
            }, 0);

            tl.to(containerRef.current, {
                clipPath: 'inset(10% 0 15% 0)',
                x: `+=${3 * intensity}`,
                duration: 0.04,
                repeat: 5,
                yoyo: true,
            }, 0);
        }

        // Return to normal
        tl.to(containerRef.current, {
            boxShadow: 'none',
            filter: 'none',
            clipPath: 'none',
            x: 0,
            duration: 0.3,
            ease: "power2.in"
        });

    }, [reducedMotion]);

    useEffect(() => {
        const delta = price - lastPrice.current;
        if (Math.abs(delta) > 0.001) {
            triggerUpdateEffect(delta);
        }
        lastPrice.current = price;
    }, [price, triggerUpdateEffect]);

    return (
        <div
            ref={containerRef}
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 'inherit' // Inherit from parent (orbital)
            }}
        >
            {children}
        </div>
    );
};

export default VisualHeartbeat;
