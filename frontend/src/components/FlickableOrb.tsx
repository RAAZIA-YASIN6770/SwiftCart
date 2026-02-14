import React from 'react';
import { useGestures } from '../hooks/useGestures';
import { pulseReceiver } from '../utils/pulse-receiver';
import { usePhysicsStore } from '../store/physicsStore';
import VisualHeartbeat from './VisualHeartbeat';

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
    const { reducedMotion, failedFlickCount, recordFlickFailure, resetFlickFailure } = usePhysicsStore();

    const failedAttempts = failedFlickCount[id] || 0;

    // [COMMUNAL MASS] UI Scaling
    // The 'radius' prop passed from GravityTest is actually the circleRadius from Matter.js.
    // So if the worker scales the body, 'radius' will reflect the new size.

    // Glitch logic now handled by VisualHeartbeat

    // Heartbeat Effect handled externally

    const handleFlickInternal = (id: number, velocity: { x: number; y: number }) => {
        const speed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2);

        // Threshold for a "successful" flick (e.g., 5px/frame)
        if (speed < 5) {
            recordFlickFailure(id);
        } else {
            resetFlickFailure(id);
            // Send interaction to backend
            pulseReceiver.send({
                type: 'FLICK',
                product_id: productId
            });
        }

        onFlick(id, velocity);
    };

    const handleCapture = (e: React.MouseEvent) => {
        e.stopPropagation();
        resetFlickFailure(id);
        // Simulate a perfect flick towards center
        const rect = orbRef.current?.parentElement?.getBoundingClientRect();
        if (rect) {
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const dx = centerX - position.x;
            const dy = centerY - position.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const captureVelocity = {
                x: (dx / dist) * 15,
                y: (dy / dist) * 15
            };

            // Send interaction to backend
            pulseReceiver.send({
                type: 'FLICK',
                product_id: productId
            });

            onFlick(id, captureVelocity);
        }
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
                transition: reducedMotion ? 'none' : (isDragging ? 'none' : 'background-color 0.2s, box-shadow 0.2s'),
                pointerEvents: 'auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: `${Math.max(8, radius / 2)}px`,
                fontFamily: 'monospace',
                userSelect: 'none',
                overflow: 'visible'
            }}
        >
            <VisualHeartbeat price={price} previousPrice={lastPrice.current} reducedMotion={reducedMotion}>
                ${price.toFixed(2)}
            </VisualHeartbeat>

            {failedAttempts >= 2 && (
                <button
                    onClick={handleCapture}
                    style={{
                        position: 'absolute',
                        top: '110%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        padding: '4px 8px',
                        backgroundColor: '#ff4400',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '9px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.5)',
                        zIndex: 100
                    }}
                >
                    CAPTURE
                </button>
            )}
        </div>
    );
};

export default FlickableOrb;
