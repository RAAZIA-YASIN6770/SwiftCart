import React from 'react';
import { usePhysicsStore } from '../store/physicsStore';
import GravityWell from './GravityWell';

const GravityTest: React.FC = () => {
    const bodies = usePhysicsStore((state) => state.bodies);

    return (
        <div
            style={{
                position: 'relative',
                width: '800px',
                height: '600px',
                backgroundColor: '#050510', // Darker space-like background
                border: '2px solid #333',
                margin: '20px auto',
                overflow: 'hidden',
                borderRadius: '8px',
                boxShadow: '0 0 50px rgba(0, 255, 255, 0.1)',
            }}
        >
            <div style={{ position: 'absolute', top: 10, left: 10, color: '#00ffff', fontFamily: 'monospace', zIndex: 10 }}>
                Radial Attraction: Enabled | Pulse: Active
            </div>

            <GravityWell />

            {Object.values(bodies).map((body) => (
                <div
                    key={body.id}
                    style={{
                        position: 'absolute',
                        left: `${body.position.x}px`,
                        top: `${body.position.y}px`,
                        width: `${(body.radius || 20) * 2}px`,
                        height: `${(body.radius || 20) * 2}px`,
                        backgroundColor: '#00aaff',
                        borderRadius: '50%',
                        transform: `translate(-50%, -50%) rotate(${body.angle}rad)`,
                        boxShadow: '0 3px 10px rgba(0, 170, 255, 0.4)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                    }}
                />
            ))}
        </div>
    );
};

export default GravityTest;
