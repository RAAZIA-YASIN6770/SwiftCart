import React, { useEffect } from 'react';
import { useCheckoutStore } from '../store/checkoutStore';

const HyperdriveButton: React.FC = () => {
    const { status, fetchPaymentIntent } = useCheckoutStore();

    useEffect(() => {
        // Auto-fetch on mount (mocking "Coordinate Retrieval")
        if (status === 'IDLE') {
            fetchPaymentIntent();
        }
    }, [status, fetchPaymentIntent]);

    const getLabel = () => {
        switch (status) {
            case 'IDLE': return 'INITIALIZING...';
            case 'SYNCING': return 'SYNCING COORDINATES...';
            case 'READY': return 'ENGAGE HYPERDRIVE';
            case 'PROCESSING': return 'WARPING...';
            case 'COMPLETE': return 'DESTINATION REACHED';
            case 'ERROR': return 'SYSTEM FAILURE';
            default: return 'HYPERDRIVE';
        }
    };

    const isReady = status === 'READY';
    const isError = status === 'ERROR';

    return (
        <button
            disabled={!isReady && !isError}
            onClick={() => {
                if (isError) {
                    fetchPaymentIntent(); // Retry
                } else {
                    console.log("Hyperdrive Engaged!");
                }
            }}
            style={{
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                padding: '15px 30px',
                backgroundColor: isError ? '#ff003c' : (isReady ? '#00f3ff' : '#1a1a2e'),
                color: isReady ? '#000' : (isError ? '#fff' : '#00aaff'),
                border: `2px solid ${isError ? '#ff003c' : '#00f3ff'}`,
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: isReady || isError ? 'pointer' : 'wait',
                boxShadow: isReady
                    ? '0 0 20px rgba(0, 243, 255, 0.6), inset 0 0 10px rgba(0, 243, 255, 0.2)'
                    : 'none',
                transition: 'all 0.3s ease',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                animation: status === 'SYNCING' ? 'pulse-opacity 1s infinite' : 'none',
                zIndex: 1000,
                opacity: status === 'IDLE' ? 0 : 1
            }}
        >
            {getLabel()}
            <style>
                {`
                    @keyframes pulse-opacity {
                        0% { opacity: 0.6; }
                        50% { opacity: 1; }
                        100% { opacity: 0.6; }
                    }
                `}
            </style>
        </button>
    );
};

export default HyperdriveButton;
