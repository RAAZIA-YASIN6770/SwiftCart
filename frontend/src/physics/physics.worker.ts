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
let runner: Matter.Runner | null = null;

// Physics configuration for anti-gravity
const PHYSICS_CONFIG = {
    gravity: {
        x: 0,
        y: -0.5, // Negative gravity for anti-gravity effect
        scale: 0.001
    },
    fps: 60,
    delta: 1000 / 60 // 16.67ms per frame
};

/**
 * Initialize the physics engine
 */
function initPhysics() {
    // Create engine with custom gravity
    engine = Matter.Engine.create({
        gravity: PHYSICS_CONFIG.gravity
    });

    world = engine.world;

    // Create runner for 60 FPS
    runner = Matter.Runner.create({
        delta: PHYSICS_CONFIG.delta,
        isFixed: true
    });

    console.log('[Physics Worker] Engine initialized with anti-gravity');

    return {
        type: 'PHYSICS_INITIALIZED',
        config: PHYSICS_CONFIG
    };
}

/**
 * Update physics simulation
 */
function updatePhysics(delta: number) {
    if (!engine) {
        return { type: 'ERROR', message: 'Engine not initialized' };
    }

    // Run physics step
    Matter.Engine.update(engine, delta);

    // Extract body positions for rendering
    const bodies = Matter.Composite.allBodies(world!);
    const bodyStates = bodies.map(body => ({
        id: body.id,
        position: { x: body.position.x, y: body.position.y },
        angle: body.angle,
        velocity: { x: body.velocity.x, y: body.velocity.y }
    }));

    return {
        type: 'PHYSICS_UPDATE',
        bodies: bodyStates,
        timestamp: Date.now()
    };
}

/**
 * Add a body to the physics world
 */
function addBody(bodyConfig: any) {
    if (!world) {
        return { type: 'ERROR', message: 'World not initialized' };
    }

    let body: Matter.Body;

    // Create body based on type
    switch (bodyConfig.type) {
        case 'rectangle':
            body = Matter.Bodies.rectangle(
                bodyConfig.x,
                bodyConfig.y,
                bodyConfig.width,
                bodyConfig.height,
                bodyConfig.options
            );
            break;
        case 'circle':
            body = Matter.Bodies.circle(
                bodyConfig.x,
                bodyConfig.y,
                bodyConfig.radius,
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

/**
 * Remove a body from the physics world
 */
function removeBody(bodyId: number) {
    if (!world) {
        return { type: 'ERROR', message: 'World not initialized' };
    }

    const body = Matter.Composite.get(world, bodyId, 'body') as Matter.Body;
    if (body) {
        Matter.World.remove(world, body);
        return { type: 'BODY_REMOVED', bodyId };
    }

    return { type: 'ERROR', message: `Body not found: ${bodyId}` };
}

/**
 * Apply force to a body
 */
function applyForce(bodyId: number, force: { x: number; y: number }) {
    if (!world) {
        return { type: 'ERROR', message: 'World not initialized' };
    }

    const body = Matter.Composite.get(world, bodyId, 'body') as Matter.Body;
    if (body) {
        Matter.Body.applyForce(body, body.position, force);
        return { type: 'FORCE_APPLIED', bodyId };
    }

    return { type: 'ERROR', message: `Body not found: ${bodyId}` };
}

// Message handler
self.onmessage = (event: MessageEvent) => {
    const { type, payload } = event.data;

    let response;

    switch (type) {
        case 'INIT':
            response = initPhysics();
            break;
        case 'UPDATE':
            response = updatePhysics(payload.delta);
            break;
        case 'ADD_BODY':
            response = addBody(payload);
            break;
        case 'REMOVE_BODY':
            response = removeBody(payload.bodyId);
            break;
        case 'APPLY_FORCE':
            response = applyForce(payload.bodyId, payload.force);
            break;
        default:
            response = { type: 'ERROR', message: `Unknown message type: ${type}` };
    }

    self.postMessage(response);
};

// Export for TypeScript
export { };
