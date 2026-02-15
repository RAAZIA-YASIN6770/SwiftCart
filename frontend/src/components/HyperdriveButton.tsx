import { useCheckoutStore } from '../store/checkoutStore';

export default function HyperdriveButton() {
    const { confirmPayment, isWarping, status } = useCheckoutStore();

    if (status === 'COMPLETE') return (
        <button style={{
            padding: '15px 40px',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            color: '#00ff00',
            background: 'rgba(0, 255, 0, 0.1)',
            border: '2px solid #00ff00',
            borderRadius: '50px',
            cursor: 'default',
            boxShadow: '0 0 20px #00ff00'
        }}>
            JUMP SUCCESSFUL
        </button>
    );

    return (
        <button
            onClick={confirmPayment}
            disabled={isWarping}
            style={{
                position: 'relative',
                padding: '15px 40px',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                color: '#fff',
                background: isWarping ? '#333' : 'linear-gradient(45deg, #ff0055, #ff4d4d)',
                border: 'none',
                borderRadius: '50px',
                cursor: isWarping ? 'not-allowed' : 'pointer',
                boxShadow: isWarping ? 'none' : '0 0 20px #ff0055, 0 0 40px #ff4d4d',
                transition: 'all 0.3s ease',
                transform: isWarping ? 'scale(0.95)' : 'scale(1)',
                overflow: 'hidden'
            }}
        >
            {isWarping ? 'WARP INITIATED...' : 'ENGAGE HYPERDRIVE'}

            {!isWarping && (
                <div style={{
                    position: 'absolute',
                    top: '-50%',
                    left: '-50%',
                    width: '200%',
                    height: '200%',
                    background: 'linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0))',
                    transform: 'rotate(45deg)',
                    animation: 'shine 3s infinite',
                    opacity: 0.1,
                    pointerEvents: 'none'
                }} />
            )}
        </button>
    );
}
