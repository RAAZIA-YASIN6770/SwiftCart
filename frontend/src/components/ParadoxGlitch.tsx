import { useEffect, useState } from 'react';
import { useCheckoutStore } from '../store/checkoutStore';
import '../styles/glitch.css';

export default function ParadoxGlitch() {
    const { status, reset, error } = useCheckoutStore();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (status === 'PARADOX') {
            setIsVisible(true);
            const timer = setTimeout(() => {
                // Auto-dismiss after 3 seconds or just let user click?
                // "Unlock the UI" - prompt implies it happens after error.
                // We'll keep it visible until click to acknowledge "Paradox".
            }, 3000);
            return () => clearTimeout(timer);
        } else {
            setIsVisible(false);
        }
    }, [status]);

    if (!isVisible) return null;

    return (
        <div
            onClick={() => {
                setIsVisible(false);
                reset(); // Reset store to IDLE
            }}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: 10000,
                backgroundColor: 'rgba(255, 0, 0, 0.4)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
                backdropFilter: 'hue-rotate(90deg) contrast(1.5)',
                overflow: 'hidden'
            }}
        >
            <div className="glitch-desync" style={{
                fontSize: '5rem',
                color: '#fff',
                fontWeight: 'bold',
                textShadow: '5px 0 #ff0000, -5px 0 #00ffff',
                fontFamily: 'monospace',
                textAlign: 'center'
            }}>
                PARADOX DETECTED
            </div>

            <div style={{
                marginTop: '20px',
                fontSize: '1.5rem',
                color: '#fff',
                background: '#000',
                padding: '10px 20px',
                border: '2px solid red'
            }}>
                {error || "FATAL TIMELINE ERROR"}
            </div>

            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '10px',
                background: 'red',
                animation: 'glitch-stutter 0.1s infinite'
            }} />
            <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                height: '50px',
                background: 'rgba(255, 0, 0, 0.5)',
                animation: 'glitch-desync 0.2s infinite'
            }} />
        </div>
    );
}
