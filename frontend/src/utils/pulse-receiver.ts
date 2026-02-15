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
    private isPaused: boolean = false; // [EPIC 5] Paradox Pause

    constructor(url: string = 'ws://localhost:8000/ws/pulse/') {
        this.url = url;

        // Listen for global Paradox events
        if (typeof window !== 'undefined') {
            window.addEventListener('freeze_manifold', () => this.pause());
            window.addEventListener('resume_manifold', () => this.resume());
        }
    }

    public connect() {
        if (this.socket || this.isPaused) return;

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
                const decoded = decode(event.data) as any;

                // [STORY 6.1] Celestial Update (Admin Operations)
                if (decoded.type === 'CELESTIAL') {
                    window.dispatchEvent(new CustomEvent('celestial_update', {
                        detail: decoded
                    }));
                    return;
                }

                // Standard Price/State Pulse
                const pDecoded = decoded as {
                    id: string,
                    p: number,
                    m?: number, // Mass
                    ins?: number, // Instability
                    stk?: number, // Stock (Story 3.2)
                    pos: { x: number, y: number },
                    vel: { x: number, y: number },
                    t: number
                };


                // Update the global store (Price)
                usePhysicsStore.getState().updatePrice(pDecoded.id, pDecoded.p);

                const mass = pDecoded.m || 1.0;
                const instability = pDecoded.ins || 0;
                const stock = pDecoded.stk !== undefined ? pDecoded.stk : 100;

                // Forward Position/Velocity/Mass/Instability/Stock to Physics Worker for Interpolation
                window.dispatchEvent(new CustomEvent('pulse_sync', {
                    detail: {
                        id: pDecoded.id,
                        pos: pDecoded.pos,
                        vel: pDecoded.vel,
                        mass: mass,
                        instability: instability,
                        stock: stock
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
            if (this.isPaused) {
                console.warn('[PulseReceiver] Socket paused due to Paradox. No reconnect.');
                this.socket = null;
                return;
            }

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

    public pause() {
        console.warn('[PulseReceiver] Pausing stream due to Temporal Paradox.');
        this.isPaused = true;
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
    }

    public resume() {
        console.log('[PulseReceiver] Resuming stream. Re-stabilizing timeline.');
        this.isPaused = false;
        this.reconnectAttempts = 0;
        this.connect();
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
