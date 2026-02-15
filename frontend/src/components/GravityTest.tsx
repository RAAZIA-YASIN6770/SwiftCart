import React from 'react';
import { usePhysicsStore } from '../store/physicsStore';
import { usePhysicsWorker } from '../hooks/usePhysicsWorker';
import GravityWell from './GravityWell';
import FlickableOrb from './FlickableOrb';

const GravityTest: React.FC = () => {
    const bodies = usePhysicsStore((state) => state.bodies);
    const { updateBody, applyImpulse } = usePhysicsWorker();
    const [draggingId, setDraggingId] = React.useState<number | null>(null);

    const handleDragStart = (id: number) => {
        setDraggingId(id);
        updateBody(id, { isStatic: true });
    };

    const handleDrag = (id: number, pos: { x: number; y: number }) => {
        updateBody(id, { position: pos });
    };

    const handleFlick = (id: number, velocity: { x: number; y: number }) => {
        setDraggingId(null);
        updateBody(id, { isStatic: false });
        applyImpulse(id, velocity);
    };

    const prices = usePhysicsStore((state) => state.prices);

    return (
        <div
            style={{
                position: 'relative',
                width: '800px',
                height: '600px',
                backgroundColor: '#050510',
                border: '2px solid #333',
                margin: '20px auto',
                overflow: 'hidden',
                borderRadius: '8px',
                boxShadow: '0 0 50px rgba(0, 255, 255, 0.1)',
                touchAction: 'none' // Prevent scrolling while dragging
            }}
        >
            <div style={{ position: 'absolute', top: 10, left: 10, color: '#00ffff', fontFamily: 'monospace', zIndex: 10 }}>
                Radial Attraction: Enabled | Decay Engine: Active | Price Glitch: READY
            </div>

            <GravityWell />

            {Object.values(bodies).map((body) => (
                <FlickableOrb
                    key={body.id}
                    id={body.id}
                    productId={body.productId}
                    price={prices[body.productId] || 100.00}
                    position={body.position}
                    radius={body.radius || 20}
                    angle={body.angle}
                    instability={body.instability}
                    stock={body.stock}
                    isDragging={draggingId === body.id}
                    onDragStart={handleDragStart}
                    onDrag={handleDrag}
                    onFlick={handleFlick}
                />
            ))}
        </div>
    );
};

export default GravityTest;
