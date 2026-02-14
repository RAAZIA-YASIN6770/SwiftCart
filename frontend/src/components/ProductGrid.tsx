import React from 'react';
import { usePhysicsStore } from '../store/physicsStore';

const ProductGrid: React.FC = () => {
    const bodies = usePhysicsStore((state) => state.bodies);

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: '20px',
            padding: '20px',
            width: '800px',
            margin: '20px auto',
            backgroundColor: '#0a0a1a',
            borderRadius: '12px',
            border: '2px solid #1a1a2e',
            minHeight: '400px'
        }}>
            {Object.values(bodies).length === 0 && (
                <div style={{ color: '#666', gridColumn: '1/-1', textAlign: 'center', paddingTop: '100px' }}>
                    Initializing Product Stream...
                </div>
            )}
            {Object.values(bodies).map((product) => (
                <div
                    key={product.id}
                    style={{
                        backgroundColor: '#16162d',
                        border: '1px solid #2a2a4a',
                        borderRadius: '8px',
                        padding: '15px',
                        textAlign: 'center',
                        color: '#00ffff',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                        transition: 'transform 0.2s',
                        cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <div style={{
                        width: '60px',
                        height: '60px',
                        backgroundColor: '#00aaff',
                        borderRadius: '50%',
                        margin: '0 auto 10px',
                        boxShadow: '0 0 15px rgba(0, 170, 255, 0.4)'
                    }} />
                    <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Product {product.id}</div>
                    <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '5px' }}>Mass: {product.radius}</div>
                </div>
            ))}
        </div>
    );
};

export default ProductGrid;
