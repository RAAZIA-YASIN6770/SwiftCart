import { create } from 'zustand';

interface CheckoutState {
    clientSecret: string | null;
    status: 'IDLE' | 'SYNCING' | 'READY' | 'WARPING' | 'PROCESSING' | 'COMPLETE' | 'ERROR' | 'PARADOX';
    error: string | null;
    isWarping: boolean;
    fetchPaymentIntent: () => Promise<void>;
    confirmPayment: () => Promise<void>;
    setClientSecret: (secret: string) => void;
    setStatus: (status: CheckoutState['status']) => void;
    reset: () => void;
}

export const useCheckoutStore = create<CheckoutState>((set, get) => ({
    clientSecret: null,
    status: 'IDLE',
    error: null,
    isWarping: false,

    fetchPaymentIntent: async () => {
        set({ status: 'SYNCING', error: null });

        try {
            const response = await fetch('http://localhost:8000/api/payments/create-payment-intent/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: [{ id: 'pro_001_nebula' }] })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            set({
                clientSecret: data.clientSecret,
                status: 'READY'
            });

        } catch (err: any) {
            console.error("Stripe Warp Coordinate Failure:", err);
            set({
                status: 'ERROR',
                error: err.message || 'Failed to sync warp coordinates.'
            });
        }
    },

    confirmPayment: async () => {
        // Lockdown: Immediately block interactions
        set({ status: 'WARPING', isWarping: true, error: null });

        const MIN_DURATION = 800; // 800ms minimum duration for warp animation

        const { usePhysicsStore } = await import('./physicsStore');
        const productId = 'pro_001_nebula';

        // Find bodyId for this product
        const physicsState = usePhysicsStore.getState();

        // [STORY 5.3] Critical Transition Snapshot
        await physicsState.syncSnapshots();

        const body = Object.values(physicsState.bodies).find(b => b.productId === productId);
        if (body) {
            physicsState.captureSnapshot(productId, body.id);
        }

        const currentPrice = usePhysicsStore.getState().prices[productId] || 100.00;
        const timestamp = Date.now();

        try {
            // Parallel execution: Animation time + Backend Request
            const [response] = await Promise.all([
                fetch('http://localhost:8000/api/payments/confirm/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        clientSecret: get().clientSecret,
                        price: currentPrice,
                        timestamp: timestamp,
                        // Simulate random error for testing "Paradox" handler if needed
                        // force_paradox: Math.random() > 0.8 
                    })
                }),
                new Promise(resolve => setTimeout(resolve, MIN_DURATION))
            ]);

            if (!response.ok) {
                // Try to get error message
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            // Success: Warp Complete
            set({ status: 'COMPLETE', isWarping: false });

            // Restore Orb? (Or it disappears). Logic says:
            // "If the Redis transaction fails... restore the Orb... instead of deleting it."
            // Success means we BOUGHT it. It should disappear or show "Purchased".
            // We'll leave success behavior as is (COMPLETE state likely shows success UI).

        } catch (err: any) {
            console.error("Paradox Detected:", err);

            // Paradox Handler: Trigger red screen glitch and unlock
            set({
                status: 'PARADOX',
                isWarping: false, // Unlock UI
                error: err.message || 'Timeline desynchronization detected.'
            });

            // Trigger Orb Restore (Visual Glitch)
            // The ParadoxGlitch component should watch this state.
        }
    },

    setClientSecret: (secret) => set({ clientSecret: secret }),
    setStatus: (status) => set({ status }),
    reset: () => set({ status: 'IDLE', error: null, isWarping: false })
}));
