import { create } from 'zustand';

interface CheckoutState {
    clientSecret: string | null;
    status: 'IDLE' | 'SYNCING' | 'READY' | 'PROCESSING' | 'COMPLETE' | 'ERROR';
    error: string | null;
    fetchPaymentIntent: () => Promise<void>;
    setClientSecret: (secret: string) => void;
    setStatus: (status: CheckoutState['status']) => void;
}

export const useCheckoutStore = create<CheckoutState>((set) => ({
    clientSecret: null,
    status: 'IDLE',
    error: null,

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

    setClientSecret: (secret) => set({ clientSecret: secret }),
    setStatus: (status) => set({ status })
}));
