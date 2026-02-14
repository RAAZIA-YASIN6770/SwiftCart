/**
 * Detects if the browser supports mandatory features for the Physics Manifold.
 */
export const checkPhysicsSupport = (): boolean => {
    try {
        // 1. Check for Web Worker support
        if (typeof Worker === 'undefined') {
            return false;
        }

        // 2. Performance check: Optional but recommended for "Immersive Mode"
        if (typeof performance === 'undefined' || !performance.now) {
            return false;
        }

        // 3. OffscreenCanvas check: Ideal for heavy workers but not required currently
        // If we were using Three.js in worker, we'd check this.

        return true;
    } catch (e) {
        return false;
    }
};
