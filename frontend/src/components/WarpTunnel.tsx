import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useCheckoutStore } from '../store/checkoutStore';

export default function WarpTunnel() {
    const isWarping = useCheckoutStore((state) => state.isWarping);
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!isWarping) {
            gsap.to(containerRef.current, { opacity: 0, duration: 0.5, pointerEvents: "none" });
            return;
        }

        // Activate container
        gsap.set(containerRef.current, { opacity: 1, pointerEvents: "all" });

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Resize
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const cx = canvas.width / 2;
        const cy = canvas.height / 2;

        const streaks: { x: number, y: number, speed: number, length: number, angle: number, color: string }[] = [];
        const colors = ['#ff0055', '#ff0000', '#ff4d4d', '#ff99cc']; // Redshift Palette

        // Initialize streaks
        for (let i = 0; i < 200; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * Math.max(canvas.width, canvas.height);
            streaks.push({
                x: cx + Math.cos(angle) * dist,
                y: cy + Math.sin(angle) * dist,
                speed: 10 + Math.random() * 20,
                length: 50 + Math.random() * 100,
                angle: angle,
                color: colors[Math.floor(Math.random() * colors.length)]
            });
        }

        let animationFrameId: number;

        const render = () => {
            // Trail effect
            ctx.fillStyle = 'rgba(20, 0, 10, 0.3)'; // Deep Red/Black background
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Flash effect occasionally
            if (Math.random() > 0.95) {
                ctx.fillStyle = 'rgba(255, 0, 85, 0.1)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            ctx.lineWidth = 3;
            // Draw streaks moving OUTWARD from center
            // Actually, for a tunnel effect, they usually come AT you (expand out) or you move INTO them (they move out).
            // Let's make them radiate outward.

            streaks.forEach((s) => {
                // Update position
                // Move away from center
                const currentDist = Math.sqrt((s.x - cx) ** 2 + (s.y - cy) ** 2);
                const speedMult = 1 + (currentDist / 500); // Faster at edges

                s.x += Math.cos(s.angle) * s.speed * speedMult;
                s.y += Math.sin(s.angle) * s.speed * speedMult;

                // Draw
                ctx.strokeStyle = s.color;
                ctx.beginPath();
                ctx.moveTo(s.x, s.y);
                const tailX = s.x - Math.cos(s.angle) * s.length * speedMult;
                const tailY = s.y - Math.sin(s.angle) * s.length * speedMult;
                ctx.lineTo(tailX, tailY);
                ctx.stroke();

                // Reset if out of bounds
                if (s.x < 0 || s.x > canvas.width || s.y < 0 || s.y > canvas.height) {
                    // Respawn near center
                    const newAngle = Math.random() * Math.PI * 2;
                    const minDist = 10;
                    s.x = cx + Math.cos(newAngle) * minDist;
                    s.y = cy + Math.sin(newAngle) * minDist;
                    s.angle = newAngle;
                    s.speed = 10 + Math.random() * 20;
                }
            });

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            cancelAnimationFrame(animationFrameId);
        };

    }, [isWarping]);

    return (
        <div ref={containerRef} style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 9999,
            background: '#000',
            opacity: 0, // Hidden by default
            pointerEvents: 'none',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
            <h1 style={{
                position: 'absolute',
                color: '#fff',
                fontFamily: 'Orbitron, sans-serif',
                fontSize: '4rem',
                textShadow: '0 0 20px #ff0055',
                letterSpacing: '10px',
                mixBlendMode: 'overlay'
            }}>WARPING...</h1>
        </div>
    );
}
