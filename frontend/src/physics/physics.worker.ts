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
        y: 1, // Standard gravity for the initial test
        scale: 0.001
    },
    fps: 60,
    delta: 1000 / 60 // 16.67ms per frame
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

    // Add a ground plane for the gravity test
    const ground = Matter.Bodies.rectangle(400, 580, 810, 60, { isStatic: true });
    Matter.World.add(world, [ground]);

    // Add a falling box
    const box = Matter.Bodies.rectangle(400, 200, 80, 80);
    Matter.World.add(world, [box]);

    console.log('[Physics Worker] Engine initialized');

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
    if (!engine) return;

    const delta = time - lastTimestamp;

    // Target 60 FPS (approx 16.6ms)
    if (delta >= PHYSICS_CONFIG.delta) {
        Matter.Engine.update(engine, PHYSICS_CONFIG.delta);

        // Extract body positions for rendering
        const bodies = Matter.Composite.allBodies(world!);
        const bodyStates = bodies.map(body => ({
            id: body.id,
            position: { x: body.position.x, y: body.position.y },
            angle: body.angle,
            isStatic: body.isStatic
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
