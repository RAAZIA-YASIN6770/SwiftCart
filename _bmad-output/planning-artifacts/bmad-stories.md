# User Stories: SwiftCart "Gravity Well" MVP

This document breaks down the core Epics into granular, sprint-ready User Stories.

---

## Epic 1: The Physics Foundation
**Objective:** Establish the off-main-thread physics manifold.

### Story 1.1: Project Manifold Initialization
**User Persona:** The Admin (Orbit-Admin)
**Story Statement:** As an Admin, I want the project base to be initialized with React 19 and GSAP so that I can begin building high-performance physics components without legacy constraints.

#### Acceptance Criteria
- [ ] Vite project generated with React 19 and TypeScript template.
- [ ] GSAP 3.14 installed and verified with a simple "Orbit" smoke test.
- [ ] Project directory structure follows the `src/features/physics/` pattern.
- [ ] ESLint and Prettier configured for strict TypeScript compliance.

#### Technical Constraints
- **Performance:** Initial build must support HMR (Hot Module Replacement) in <500ms.
- **Architecture:** Must use the decoupled Backend/Frontend structure defined in `bmad-architecture.md`.

---

### Story 1.2: The Off-Main-Thread Brain (Web Worker)
**User Persona:** Jax (The Hunter)
**Story Statement:** As a Hunter, I want the physics engine to run in its own thread so that the interface never stutters when I interact with dozens of floating products.

#### Acceptance Criteria
- [ ] `physics.worker.ts` successfully spawned from the main thread.
- [ ] Bi-directional communication established via `postMessage`.
- [ ] Worker successfully calculates a dummy "Orbit" position vector (x, y, z) and sends it back to the main thread.
- [ ] Main thread renders the worker's output using GSAP `ticker`.

#### Technical Constraints
- **Performance:** Physics loop must target 60 updates per second (16.6ms per frame).
- **Latency:** Zero visual lag between worker calculation and main-thread render.

---

### Story 1.3: The Gravity Well (Physics Container)
**User Persona:** Jax (The Hunter)
**Story Statement:** As a Hunter, I want products to float and rotate within a central "Well" so that the shopping experience feels like navigating a solar system.

#### Acceptance Criteria
- [ ] A central `GravityWell` component created in React.
- [ ] Products (placeholders)Exhibit orbital motion around a center point (x:0, y:0).
- [ ] Primitive "Soft Collider" logic prevents products from overlapping completely.
- [ ] Background environment uses subtle CSS gradients to simulate depths of space.

#### Technical Constraints
- **Rendering:** Use `will-change: transform` on all orbital elements to ensure hardware acceleration.
- **Complexity:** Support up to 50 active orbital elements at 60 FPS.

---

### Story 1.4: Tactile Flick & Orbital Capture
**User Persona:** Jax (The Hunter)
**Story Statement:** As a Hunter, I want to "Flick" products toward the Gravity Well so that adding items to my cart feels like a rhythmic, physical game.

#### Acceptance Criteria
- [ ] Pointer events capture "Flick" velocity (magnitude and direction).
- [ ] Flicked items transition smoothly from linear velocity into an "Orbital Capture" state.
- [ ] Visual "Tractor Beam" (distortion/blur) effect triggers when an item is pulled into the well.
- [ ] Items already in the well react to the "Impact" of a new incoming product.

#### Technical Constraints
- **Latency:** Visual reaction to a "Flick" gesture must be instantaneous (<16ms).
- **Control:** Use GSAP `InertiaPlugin` (or custom math in Worker) for natural-feeling decelerations.

---

### Story 1.5: Gesture Fallback (Accessibility)
**User Persona:** Jax (The Paradox Case)
**Story Statement:** As a user with restricted motion, I want a standard "Click to Orbit" alternative so that I can still enjoy the experience without high-velocity gestures.

#### Acceptance Criteria
- [ ] Secondary "Capture" button appears on product cards after two failed flick attempts.
- [ ] Standard click triggers a controlled "Tractor Beam" animation toward the well.
- [ ] System respects `prefers-reduced-motion` and simplifies orbital paths to basic rotations.

#### Technical Constraints
- **Usability:** Fallback interactions must achieve the same final state as physical gestures.

---

## Epic 2: The Real-time Pulse (Redis & WebSockets)
**Objective:** Establish a high-frequency synchronization layer for collective state.

### Story 2.1: The Binary Core (MessagePack Serialization)
**User Persona:** The Admin (Orbit-Admin)
**Story Statement:** As an Admin, I want all real-time state updates to be transmitted in binary MessagePack format so that we minimize bandwidth usage and maintain a strict sub-10ms delivery target for the Pulse.

#### Acceptance Criteria
- [ ] Shared `MessagePackSchema` defined for Position, Velocity, Mass, and Price.
- [ ] Python backend successfully serializes state updates using `msgpack`.
- [ ] TypeScript frontend successfully deserializes binary payloads in the Web Worker.
- [ ] Packet size reduction of >50% compared to equivalent JSON payloads verified.

#### Technical Constraints
- **Latency:** Serialization/Deserialization overhead must be <1ms per packet.
- **Goal:** Total end-to-end delivery latency (Pulse) target of <10ms.
- **Protocol:** Enforce binary mode on the WebSocket connection.

---

### Story 2.2: The Volatile Pulse (Redis-First State)
**User Persona:** Jax (The Hunter)
**Story Statement:** As a Hunter, I want product prices and positions to react to global activity so that the world feels alive and shared with other hunters.

#### Acceptance Criteria
- [ ] Product states stored in Redis Hashes using the `sc:prod:state:{id}` pattern.
- [ ] Backend worker process updates Redis states at a sustained frequency of 20Hz.
- [ ] "Communal Mass" increases atomically based on user interaction events.
- [ ] System handles concurrent state updates for 100+ simultaneous users without jitter.

#### Technical Constraints
- **Concurrency:** Use Lua scripts or `WATCH/MULTI` to ensure atomicity of mass updates.
- **Volatility:** Redis state is treated as the source of truth for all "Alive UI" components.

---

### Story 2.3: The Pulse Stream (Django Channels to Redis)
**User Persona:** Jax (The Hunter)
**Story Statement:** As a Hunter, I want the Redis price feed to be streamed directly through Django Channels so that my local Gravity Well reacts instantly to every 'Heartbeat' of the engine.

#### Acceptance Criteria
- [ ] Django Channels consumer established with "Global Pulse" group broadcasting.
- [ ] Backend bridging logic connects Redis Pub/Sub (Price Feed) to Channels Groups.
- [ ] Client successfully handshakes using JWT and transitions to the binary WebSocket stream.
- [ ] "Lag Compensation" logic in the frontend worker interpolates high-frequency state updates.

#### Technical Constraints
- **Latency:** End-to-end state propagation (Redis -> Channels -> Client) must be <10ms.
- **Reliability:** Auto-reconnect logic with exponential backoff implemented in the client.

---

### Story 2.4: The Price Decay Engine (Interaction-Driven)
**User Persona:** Jax (The Hunter)
**Story Statement:** As a Hunter, I want to see product prices drop in real-time as interaction frequency increases so that I can time my "Hyperdrive" purchase for the best deal.

#### Acceptance Criteria
- [ ] Price decay algorithm implemented in Python (Redis-side).
- [ ] Decayed price updates pushed via WebSocket at <200ms intervals.
- [ ] Visual "Price Glitch" effect triggers on the client when a significant decay threshold is hit.
- [ ] Price floor (70% MSRP) is strictly enforced by the engine.

#### Technical Constraints
- **Accuracy:** Final checkout price must exactly match the Redis `price_current` state at the moment of click.
- **Thematic:** Use "Temporal Decay" terminology in logs and internal documentation.

---

### Story 2.5: Visual Heartbeat (Glow & Pulse)
**User Persona:** Jax (The Hunter)
**Story Statement:** As a Hunter, I want the Physics Orbs to 'glow' or 'pulse' when a price update hits them so that I can visually feel the price flux.

#### Acceptance Criteria
- [ ] `VisualHeartbeat` component/primitive created for Physics Orbs.
- [ ] GSAP "Glow" animation triggers on every MessagePack `PRICE_UPDATE` event.
- [ ] Pulse intensity scales with the magnitude of the price shift.
- [ ] Smooth transition between "Stable" and "Pulsing" states at 60 FPS.

#### Technical Constraints
- **Performance:** Pulse animations must hit 60 FPS and avoid main-thread jank.
- **Visuals:** Use hardware-accelerated CSS filters and GSAP `ticker` for synchronization.

---

## Epic 3: Dimensional Scarcity (Redshift UI)
**Objective:** Visualize stock levels through thematic "Glitch" states.

### Story 3.1: Glitch Primitives & State Wiring
**User Persona:** Jax (The Hunter)
**Story Statement:** As a Hunter, I want the product image to exhibit a subtle shimmer when stock is low so that I can feel the competitive pressure without reading numbers.

#### Acceptance Criteria
- [ ] CSS Glitch primitives (RGB shift, scanlines) created as reusable styles.
- [ ] `instability` state pushed from Redis (via WebSocket) to the frontend.
- [ ] Global CSS Variable `--glitch-intensity` updated in real-time based on `instability` state.
- [ ] Glitch effects are masked to images; text and buttons remain perfectly readable.

#### Technical Constraints
- **Performance:** CSS Variable updates must not trigger layout reflows (use GPU-accelerated filter effects).
- **Thematic:** Glitch colors must follow the "Redshift" palette defined in the PRD.

---

### Story 3.2: Threshold Escalation Logic
**User Persona:** Jax (The Hunter)
**Story Statement:** As a Hunter, I want the UI "de-materialization" to become more intense as stock nears zero so that I know exactly when to hit the Hyperdrive button.

#### Acceptance Criteria
- [ ] Automatic intensity multipliers applied at 20%, 10%, and 5% stock thresholds.
- [ ] Dynamic frame-skipping added to glitch animations at <2% stock to simulate "Temporal Instability."
- [ ] High-frequency "Desync" positional offset (1-3px jump) active at exactly 1 item remaining.

#### Technical Constraints
- **Latency:** Logic for threshold recalculation must happen in the Redis Engine to ensure all clients see the same intensity simultaneously.

---

## Epic 4: Hyperdrive Fulfillment
**Objective:** Implement the zero-interface, one-click checkout system.

### Story 4.1: Warp Coordinate Retrieval (Stripe Init)
**User Persona:** Jax (The Hunter)
**Story Statement:** As a Hunter, I want my shipping and payment details to be ready as soon as I enter the orbit so that I can checkout instantly when I find a deal.

#### Acceptance Criteria
- [ ] Client background-fetches Stripe Payment Intents upon successful WebSocket handshake.
- [ ] Shipping address "Coordinates" cached locally in encrypted state.
- [ ] Hyperdrive button transitions from "Syncing" to "Ready" state once tokens are verified.

#### Technical Constraints
- **Security:** Zero-persistence of PII on the local SwiftCart database; use Stripe Token placeholders.

---

### Story 4.2: Zero-Step Execution
**User Persona:** Jax (The Hunter)
**Story Statement:** As a Hunter, I want to click the "Hyperdrive" button and be done so that I don't lose my items during complex review steps.

#### Acceptance Criteria
- [ ] Single click on the Hyperdrive button initiates the absolute state-save.
- [ ] "Warp" animation (full-screen GSAP overlay) triggers immediately.
- [ ] User is blocked from all further cart interaction until the Warp completes or Paradox triggers.

#### Technical Constraints
- **UX:** Minimum Warp duration of 800ms to ensure the user "feels" the transition.

---

### Story 4.3: Atomic Checkout & Paradox Safety
**User Persona:** Jax (The Hunter)
**Story Statement:** As a Hunter, I want to be guaranteed the price I saw when I clicked, or be told clearly if a "Paradox" occurred.

#### Acceptance Criteria
- [ ] Redis `WATCH` transaction locks the price and stock level at the exact click-timestamp.
- [ ] Background verification completes before the Warp animation finishes.
- [ ] Failed checkouts trigger a "Temporal Paradox" (Epic 5) and restore the cart state.

#### Technical Constraints
- **Integrity:** Checkout price MUST NOT change between "Click" and "Execution."

---

## Epic 5: Temporal Paradox Management
**Objective:** Ensure system stability through thematic recovery and rollbacks.

### Story 5.1: The Paradox Oracle (Global Error Handler)
**User Persona:** Jax (The Hunter)
**Story Statement:** As a Hunter, I want technical failures to be handled without breaking the immersion so that I don't feel like I'm using a broken website.

#### Acceptance Criteria
- [ ] Global `ERR_TEMPORAL_PARADOX` handler catches stock desyncs and payment failures.
- [ ] System triggers a "State Freeze" on the frontend during the error state.
- [ ] Recovery options are presented using time-travel/paradox terminology.

#### Technical Constraints
- **Consistency:** Error handler must ensure the client-side physics manifold is paused to prevent state divergence.

---

### Story 5.2: Thematic Rewind (UI Rollback)
**User Persona:** Jax (The Hunter)
**Story Statement:** As a Hunter, I want to see a visual "Rewind" when a purchase fails so that I understand my state has been safely restored.

#### Acceptance Criteria
- [ ] GSAP animation reverses all recent transforms (x, y, z, rotation) upon Paradox trigger.
- [ ] `Rewind` effect includes a visual "VHS Distortion" filter for thematic consistency.
- [ ] UI returns to the exact state captured at the last session snapshot.

#### Technical Constraints
- **Smoothness:** Rewind animation must follow the same physics manifold paths as the forward motion.

---

### Story 5.3: Dimensional Anchors (Session Snapshotting)
**User Persona:** Jax (The Hunter)
**Story Statement:** As a Hunter, I want my orbital state to be saved frequently so that I don't lose my carefully arranged cart if I refresh or crash.

#### Acceptance Criteria
- [ ] Session snapshots (item positions, rotations, price locks) saved to Redis every 5 seconds.
- [ ] Successful recovery of >99% orbital states upon page reload.
- [ ] Partial snapshots pushed via MessagePack during critical transitions (e.g., entering checkout).

#### Technical Constraints
- **Payload:** Snapshots must be differential where possible to minimize write frequency to Redis.

---

## Epic 6: Celestial Operations (Admin)
**Objective:** Provide the tools to tune the gravitational engine.

### Story 6.1: The Gravity Control Panel
**User Persona:** The Admin (Orbit-Admin)
**Story Statement:** As an Admin, I want to manually adjust product "Mass" and "Pull" so that I can react to market trends or inventory bottlenecks.

#### Acceptance Criteria
- [ ] Real-time sliders in the Admin portal update Redis `base_mass` and `g` coefficients.
- [ ] Changes are broadcasted to all active clients via the WebSocket pipe instantly.
- [ ] Ability to "Pulse" a product (force temporary mass increase) for promotional events.

#### Technical Constraints
- **Auth:** Strict JWT permission checks for all "Celestial" level operations.

---

### Story 6.2: Orbital Metric Visualization
**User Persona:** The Admin (Orbit-Admin)
**Story Statement:** As an Admin, I want to see the "Heat" of interactions in real-time so that I know which products are causing the most gravitational turbulence.

#### Acceptance Criteria
- [ ] Real-time chart showing interaction frequency (Flicks/Orbits) per product.
- [ ] Latency monitor for the Redis Price Decay loop.
- [ ] Visual alert system for "Stock Implosions" (Real-time stock-outs).

#### Technical Constraints
- **Performance:** Admin dashboard must not degrade the performance of the main physics engine.
