import { decode } from '@msgpack/msgpack';
import { usePhysicsStore } from '../store/physicsStore';

/**
 * PulseReceiver manages the binary WebSocket connection for price updates.
 * Decodes MessagePack packets and updates the Zustand store.
 */
class PulseReceiver {
    private socket: WebSocket | null = null;
    private url: string;
    private reconnectTimeout: number = 2000;

    constructor(url: string = 'ws://localhost:8000/ws/pulse/') {
        this.url = url;
    }

    public connect() {
        if (this.socket) return;

        this.socket = new WebSocket(this.url);
        this.socket.binaryType = 'arraybuffer';

        this.socket.onopen = () => {
            console.log('[PulseReceiver] Connected to Pulse Stream');
        };

        this.socket.onmessage = (event: MessageEvent) => {
            try {
                // Decode binary MessagePack data
                const decoded = decode(event.data) as { id: string, p: number, t: number };

                // Update the global store at high frequency
                usePhysicsStore.getState().updatePrice(decoded.id, decoded.p);

                // Performance Note: 
                // In a production environment with dozens of bodies, we might queue 
                // these updates and process them in a requestAnimationFrame loop 
                // to avoid multiple React re-renders in the same frame.
            } catch (err) {
                console.error('[PulseReceiver] Decoding error:', err);
            }
        };

        this.socket.onclose = () => {
            console.warn('[PulseReceiver] Disconnected. Reconnecting...');
            this.socket = null;
            setTimeout(() => this.connect(), this.reconnectTimeout);
        };

        this.socket.onerror = (err) => {
            console.error('[PulseReceiver] WebSocket error:', err);
        };
    }

    public disconnect() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
    }
}

// Export a singleton instance
export const pulseReceiver = new PulseReceiver();
