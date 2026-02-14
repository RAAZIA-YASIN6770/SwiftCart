/**
 * Physics Worker - Off-Main-Thread Physics Calculations
 * 
 * This Web Worker handles all physics calculations to maintain 60 FPS on the main thread.
 * It runs the Matter.js physics engine in a separate thread and communicates results
 * back to the main thread via message passing.
 */

import Matter from 'matter-js';

// Physics engine instance
let engine: Matter.Engine | null = null;
let world: Matter.World | null = null;
let lastTimestamp = 0;

// Physics configuration
const PHYSICS_CONFIG = {
    gravity: {
        x: 0,
        y: 0, // Disable linear gravity
        scale: 0.001
    },
    attractor: {
        x: 400,
        y: 300,
        strength: 0.5,
        softening: 200 // Prevent infinite force at distance 0
    },
    fps: 60,
    delta: 1000 / 60
};

/**
 * Initialize the physics engine
 */
function initPhysics() {
    // Create engine
    engine = Matter.Engine.create({
        gravity: PHYSICS_CONFIG.gravity
    });

    world = engine.world;

    // Add multiple orbital objects
    for (let i = 0; i < 15; i++) {
        const x = Math.random() * 800;
        const y = Math.random() * 600;
        const radius = 10 + Math.random() * 20;

        const body = Matter.Bodies.circle(x, y, radius, {
            frictionAir: 0.02, // Higher friction to help objects settle
            restitution: 0.5,  // Bounciness
            render: {
                fillStyle: '#00aaff'
            }
        });

        Matter.World.add(world, body);
    }

    console.log('[Physics Worker] Engine initialized with Radial Attraction');

    // Start the animation loop
    lastTimestamp = performance.now();
    requestAnimationFrame(loop);

    return {
        type: 'PHYSICS_INITIALIZED',
        config: PHYSICS_CONFIG
    };
}

/**
 * Main physics loop running at 60 FPS
 */
function loop(time: number) {
    if (!engine || !world) return;

    const delta = time - lastTimestamp;

    // Target 60 FPS
    if (delta >= PHYSICS_CONFIG.delta) {
        // Apply radial attraction to all bodies
        const bodies = Matter.Composite.allBodies(world);
        const { x: attrX, y: attrY, strength, softening } = PHYSICS_CONFIG.attractor;

        bodies.forEach(body => {
            if (body.isStatic) return;

            const dx = attrX - body.position.x;
            const dy = attrY - body.position.y;
            const distanceSq = dx * dx + dy * dy;
            const distance = Math.sqrt(distanceSq);

            if (distance > 0) {
                // Inverse Square Law: Force = m1*m2*G / r^2
                // We'll use a simplified version: Force = Strength / (r^2 + softening)
                const forceMagnitude = (body.mass * strength) / (distanceSq + softening);

                // Unit vector pointing to center
                const force = {
                    x: (dx / distance) * forceMagnitude,
                    y: (dy / distance) * forceMagnitude
                };

                Matter.Body.applyForce(body, body.position, force);
            }
        });

        Matter.Engine.update(engine, PHYSICS_CONFIG.delta);

        // Extract body states
        const bodyStates = bodies.map(body => ({
            id: body.id,
            position: { x: body.position.x, y: body.position.y },
            angle: body.angle,
            isStatic: body.isStatic,
            radius: (body as any).circleRadius // Matter.js specific
        }));

        self.postMessage({
            type: 'PHYSICS_UPDATE',
            bodies: bodyStates,
            timestamp: time
        });

        lastTimestamp = time;
    }

    requestAnimationFrame(loop);
}

/**
 * Add a body to the physics world
 */
function addBody(bodyConfig: { type: string; x: number; y: number; width?: number; height?: number; radius?: number; options?: any }) {
    if (!world) {
        return { type: 'ERROR', message: 'World not initialized' };
    }

    let body: Matter.Body;

    switch (bodyConfig.type) {
        case 'rectangle':
            body = Matter.Bodies.rectangle(
                bodyConfig.x,
                bodyConfig.y,
                bodyConfig.width || 50,
                bodyConfig.height || 50,
                bodyConfig.options
            );
            break;
        case 'circle':
            body = Matter.Bodies.circle(
                bodyConfig.x,
                bodyConfig.y,
                bodyConfig.radius || 25,
                bodyConfig.options
            );
            break;
        default:
            return { type: 'ERROR', message: `Unknown body type: ${bodyConfig.type}` };
    }

    Matter.World.add(world, body);

    return {
        type: 'BODY_ADDED',
        bodyId: body.id
    };
}

// Message handler
self.onmessage = (event: MessageEvent) => {
    const { type, payload } = event.data;

    switch (type) {
        case 'INIT':
            initPhysics();
            break;
        case 'ADD_BODY':
            addBody(payload);
            break;
        default:
            console.warn(`[Physics Worker] Unknown message type: ${type}`);
    }
};

// Export for TypeScript
export { };
