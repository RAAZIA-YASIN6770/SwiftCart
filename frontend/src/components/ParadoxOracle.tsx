import { useEffect, useState } from 'react';
import { usePhysicsStore } from '../store/physicsStore';
import '../styles/glitch.css';

export default function ParadoxOracle() {
    const { paradoxError, clearParadoxError } = usePhysicsStore();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (paradoxError) {
            setIsVisible(true);
            // Trigger Freeze: Pause Physics Worker and WebSocket
            window.dispatchEvent(new CustomEvent('freeze_manifold'));
            console.warn('[ParadoxOracle] ❄️ MANIFOLD FROZEN due to:', paradoxError);
        } else {
            setIsVisible(false);
        }
    }, [paradoxError]);

    const handleStabilize = () => {
        // Clear error and resume physics
        clearParadoxError();
        window.dispatchEvent(new CustomEvent('resume_manifold'));
    };

    const handleRewind = () => {
        // Full reload to reset state
        window.location.reload();
    };

    if (!isVisible) return null;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            backgroundColor: 'rgba(0, 10, 30, 0.9)',
            backdropFilter: 'grayscale(0.5) blur(2px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: '#e0f0ff',
            fontFamily: '"Courier New", monospace',
            overflow: 'hidden',
        }}>
            {/* Background Glitch Elements */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '5px',
                background: '#00ffff',
                opacity: 0.7,
                animation: 'glitch-stutter 2s infinite linear'
            }} />
            <div style={{
                position: 'absolute',
                bottom: '10%',
                width: '100%',
                height: '2px',
                background: '#fff',
                opacity: 0.5,
                animation: 'glitch-desync 0.5s infinite steps(5)'
            }} />

            {/* Error Message */}
            <h1 className="glitch-desync" style={{
                fontSize: '4rem',
                textShadow: '2px 0 #fff, -2px 0 #00ffff',
                marginBottom: '1rem',
                textAlign: 'center',
                letterSpacing: '5px'
            }}>
                TEMPORAL PARADOX
            </h1>

            <div style={{
                fontSize: '1.2rem',
                border: '1px solid #00ffff',
                padding: '1rem 2rem',
                background: 'rgba(0, 255, 255, 0.1)',
                color: '#80ffff',
                marginBottom: '3rem',
                maxWidth: '600px',
                textAlign: 'center'
            }}>
                ERROR: {paradoxError || 'UNK_TIMELINE_DIVERGENCE'}
                <br />
                <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                    PHYSICS_WORKER: SUSPENDED | WEBSOCKET: PAUSED
                </span>
            </div>

            {/* Recovery Options */}
            <div style={{ display: 'flex', gap: '2rem' }}>
                <button
                    onClick={handleStabilize}
                    style={{
                        padding: '1rem 2rem',
                        fontSize: '1.2rem',
                        background: 'transparent',
                        border: '2px solid #00ffff',
                        color: '#00ffff',
                        cursor: 'pointer',
                        textTransform: 'uppercase',
                        fontWeight: 'bold',
                        boxShadow: '0 0 10px rgba(0, 255, 255, 0.3)',
                        transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#00ffff';
                        e.currentTarget.style.color = '#000';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#00ffff';
                    }}
                >
                    Re-Stabilize Timeline
                </button>

                <button
                    onClick={handleRewind}
                    style={{
                        padding: '1rem 2rem',
                        fontSize: '1.2rem',
                        background: '#fff',
                        border: '2px solid #fff',
                        color: '#000',
                        cursor: 'pointer',
                        textTransform: 'uppercase',
                        fontWeight: 'bold',
                        boxShadow: '0 0 10px rgba(255, 255, 255, 0.5)',
                        transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                    }}
                >
                    Rewind to Orbit
                </button>
            </div>
        </div>
    );
}
