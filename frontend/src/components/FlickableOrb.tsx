import React from 'react';
import gsap from 'gsap';
import { useGestures } from '../hooks/useGestures';
import { pulseReceiver } from '../utils/pulse-receiver';

interface FlickableOrbProps {
    id: number;
    productId: string;
    price: number;
    position: { x: number; y: number };
    radius: number;
    angle: number;
    isDragging: boolean;
    onDragStart: (id: number) => void;
    onDrag: (id: number, pos: { x: number; y: number }) => void;
    onFlick: (id: number, velocity: { x: number; y: number }) => void;
}

const FlickableOrb: React.FC<FlickableOrbProps> = ({
    id,
    productId,
    price,
    position,
    radius,
    angle,
    isDragging,
    onDragStart,
    onDrag,
    onFlick
}) => {
    const orbRef = React.useRef<HTMLDivElement>(null);
    const lastPrice = React.useRef<number>(price);

    const triggerGlitch = React.useCallback(() => {
        if (!orbRef.current) return;

        const tl = gsap.timeline();
        tl.to(orbRef.current, {
            filter: 'hue-rotate(90deg) brightness(1.5) contrast(1.2)',
            duration: 0.05,
            repeat: 5,
            yoyo: true,
            ease: "none",
        });
        tl.to(orbRef.current, {
            clipPath: 'inset(10% 0 20% 0)',
            x: '+=5',
            duration: 0.03,
            repeat: 8,
            yoyo: true,
        }, 0);
        tl.set(orbRef.current, { filter: 'none', clipPath: 'none', x: '0' });
    }, []);

    React.useEffect(() => {
        // Trigger glitch if price drops significantly (or at all for decay feedback)
        if (price < lastPrice.current) {
            triggerGlitch();
        }
        lastPrice.current = price;
    }, [price, triggerGlitch]);

    const handleFlickInternal = (id: number, velocity: { x: number; y: number }) => {
        // Send interaction to backend
        pulseReceiver.send({
            type: 'FLICK',
            product_id: productId
        });

        onFlick(id, velocity);
    };

    const { bindGesture } = useGestures({
        onDragStart,
        onDrag,
        onFlick: handleFlickInternal
    });

    return (
        <div
            ref={orbRef}
            {...bindGesture(id)}
            style={{
                position: 'absolute',
                left: `${position.x}px`,
                top: `${position.y}px`,
                width: `${radius * 2}px`,
                height: `${radius * 2}px`,
                backgroundColor: isDragging ? '#00ffff' : '#00aaff',
                borderRadius: '50%',
                transform: `translate(-50%, -50%) rotate(${angle}rad)`,
                boxShadow: isDragging
                    ? '0 0 20px rgba(0, 255, 255, 0.8)'
                    : '0 3px 10px rgba(0, 170, 255, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                zIndex: isDragging ? 20 : 5,
                transition: isDragging ? 'none' : 'background-color 0.2s, box-shadow 0.2s',
                pointerEvents: 'auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '10px',
                fontFamily: 'monospace',
                userSelect: 'none'
            }}
        >
            ${price.toFixed(2)}
        </div>
    );
};

export default FlickableOrb;
