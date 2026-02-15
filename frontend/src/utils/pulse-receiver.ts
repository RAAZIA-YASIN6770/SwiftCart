import { decode } from '@msgpack/msgpack';
import { usePhysicsStore } from '../store/physicsStore';

/**
 * PulseReceiver manages the binary WebSocket connection for price updates.
 * Decodes MessagePack packets and updates the Zustand store.
 */
class PulseReceiver {
    private socket: WebSocket | null = null;
    private url: string;
    private reconnectAttempts: number = 0;
    private maxReconnectTimeout: number = 30000; // 30s max
    private baseReconnectTimeout: number = 1000; // 1s start

    constructor(url: string = 'ws://localhost:8000/ws/pulse/') {
        this.url = url;
    }

    public connect() {
        if (this.socket) return;

        // Simplified JWT token for implementation demo
        const token = 'orbital_sync_token_v1';
        this.socket = new WebSocket(`${this.url}?token=${token}`);
        this.socket.binaryType = 'arraybuffer';

        this.socket.onopen = () => {
            console.log('[PulseReceiver] Connected to Pulse Stream');
            this.reconnectAttempts = 0; // Reset on success
        };

        this.socket.onmessage = (event: MessageEvent) => {
            try {
                // Decode binary MessagePack data
                const decoded = decode(event.data) as {
                    id: string,
                    p: number,
                    m?: number, // Mass
                    ins?: number, // Instability
                    pos: { x: number, y: number },
                    vel: { x: number, y: number },
                    t: number
                };

                // Update the global store (Price)
                usePhysicsStore.getState().updatePrice(decoded.id, decoded.p);

                const mass = decoded.m || 1.0;
                const instability = decoded.ins || 0;

                // Forward Position/Velocity/Mass/Instability to Physics Worker for Interpolation
                window.dispatchEvent(new CustomEvent('pulse_sync', {
                    detail: {
                        id: decoded.id,
                        pos: decoded.pos,
                        vel: decoded.vel,
                        mass: mass,
                        instability: instability
                    }
                }));

                // Performance Note: 
                // In a production environment with dozens of bodies, we might queue 
                // these updates and process them in a requestAnimationFrame loop 
                // to avoid multiple React re-renders in the same frame.
            } catch (err) {
                console.error('[PulseReceiver] Decoding error:', err);
            }
        };

        this.socket.onclose = () => {
            this.socket = null;
            this.reconnectAttempts++;

            // Exponential Backoff: base * 2^attempts (capped)
            const delay = Math.min(
                this.baseReconnectTimeout * Math.pow(2, this.reconnectAttempts),
                this.maxReconnectTimeout
            );

            console.warn(`[PulseReceiver] Pulse dead. Reconnecting in ${delay}ms (Attempt ${this.reconnectAttempts})...`);
            setTimeout(() => this.connect(), delay);
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

    public send(data: any) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(data));
        }
    }
}

// Export a singleton instance
export const pulseReceiver = new PulseReceiver();
