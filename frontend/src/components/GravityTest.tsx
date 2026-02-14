import React from 'react';
import { usePhysicsStore } from '../store/physicsStore';

const GravityTest: React.FC = () => {
    const bodies = usePhysicsStore((state) => state.bodies);

    return (
        <div
            style={{
                position: 'relative',
                width: '800px',
                height: '600px',
                backgroundColor: '#111',
                border: '2px solid #333',
                margin: '20px auto',
                overflow: 'hidden',
                borderRadius: '8px',
            }}
        >
            <div style={{ position: 'absolute', top: 10, left: 10, color: '#0f0', fontFamily: 'monospace' }}>
                Physics Worker: 60 FPS | Zustand Sync: Active
            </div>

            {Object.values(bodies).map((body) => (
                <div
                    key={body.id}
                    style={{
                        position: 'absolute',
                        left: `${body.position.x}px`,
                        top: `${body.position.y}px`,
                        width: body.isStatic ? '810px' : '80px',
                        height: body.isStatic ? '60px' : '80px',
                        backgroundColor: body.isStatic ? '#555' : '#00aaff',
                        transform: `translate(-50%, -50%) rotate(${body.angle}rad)`,
                        boxShadow: body.isStatic ? 'none' : '0 0 20px rgba(0, 170, 255, 0.5)',
                        border: body.isStatic ? '1px solid #777' : '1px solid #00ffff',
                    }}
                />
            ))}
        </div>
    );
};

export default GravityTest;
