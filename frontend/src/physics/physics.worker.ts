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

            // Apply dragging: if a body is being dragged, we update its position and velocity manually
            // This is handled by main thread via UPDATE_BODY

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
            velocity: { x: body.velocity.x, y: body.velocity.y },
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

/**
 * Apply an impulse (flick velocity) to a body
 */
function applyImpulse(payload: { bodyId: number; impulse: { x: number; y: number } }) {
    if (!world) return;

    const bodies = Matter.Composite.allBodies(world);
    const body = bodies.find(b => b.id === payload.bodyId);

    if (body) {
        // Apply the initial impulse
        Matter.Body.setVelocity(body, {
            x: payload.impulse.x * 0.5, // Scale down for better feel
            y: payload.impulse.y * 0.5
        });

        // Orbital Snapping Logic: 
        // If the flick is towards the center and has "just enough" speed,
        // we can nudge it into a circular orbit.
        const { x: attrX, y: attrY } = PHYSICS_CONFIG.attractor;
        const dx = attrX - body.position.x;
        const dy = attrY - body.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Calculate velocity magnitude and direction
        const speed = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2);

        // Target orbital velocity for circular orbit: v = sqrt(force * distance / mass)
        // Force at this distance = (mass * strength) / (distanceSq + softening)
        const forceAtDistance = (body.mass * PHYSICS_CONFIG.attractor.strength) / (distance * distance + PHYSICS_CONFIG.attractor.softening);
        const targetOrbitalSpeed = Math.sqrt(forceAtDistance * distance / body.mass);

        // If speed is within 30% of target orbital speed, snap it
        if (speed > targetOrbitalSpeed * 0.7 && speed < targetOrbitalSpeed * 1.3) {
            console.log('[Physics Worker] Orbital Capture Triggered for body', body.id);

            // Vector perpendicular to the center: (-dy, dx)
            const perpX = -dy / distance;
            const perpY = dx / distance;

            // Determine direction based on current velocity dot product
            const dot = body.velocity.x * perpX + body.velocity.y * perpY;
            const direction = dot >= 0 ? 1 : -1;

            Matter.Body.setVelocity(body, {
                x: perpX * targetOrbitalSpeed * direction,
                y: perpY * targetOrbitalSpeed * direction
            });
        }
    }
}

/**
 * Update a body's properties (e.g., position during drag)
 */
function updateBody(payload: { bodyId: number; update: any }) {
    if (!world) return;

    const bodies = Matter.Composite.allBodies(world);
    const body = bodies.find(b => b.id === payload.bodyId);

    if (body) {
        if (payload.update.position) {
            Matter.Body.setPosition(body, payload.update.position);
            // Reset velocity during drag to avoid buildup
            Matter.Body.setVelocity(body, { x: 0, y: 0 });
        }
        if (payload.update.isStatic !== undefined) {
            Matter.Body.setStatic(body, payload.update.isStatic);
        }
    }
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
        case 'APPLY_IMPULSE':
            applyImpulse(payload);
            break;
        case 'UPDATE_BODY':
            updateBody(payload);
            break;
        default:
            console.warn(`[Physics Worker] Unknown message type: ${type}`);
    }
};

// Export for TypeScript
export { };
