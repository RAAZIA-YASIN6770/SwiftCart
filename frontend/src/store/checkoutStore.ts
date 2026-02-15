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

        try {
            // Parallel execution: Animation time + Backend Request
            const [response] = await Promise.all([
                fetch('http://localhost:8000/api/payments/confirm/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        clientSecret: get().clientSecret,
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

        } catch (err: any) {
            console.error("Paradox Detected:", err);
            // Paradox Handler: Trigger red screen glitch and unlock
            set({
                status: 'PARADOX',
                isWarping: false, // Unlock UI
                error: err.message || 'Timeline desynchronization detected.'
            });

            // Auto-reset from Paradox state after a delay or let user dismiss?
            // "Unlock the UI" implies user can try again.
        }
    },

    setClientSecret: (secret) => set({ clientSecret: secret }),
    setStatus: (status) => set({ status }),
    reset: () => set({ status: 'IDLE', error: null, isWarping: false })
}));
