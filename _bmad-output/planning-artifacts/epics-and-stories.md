# Epic & Story Mapping: SwiftCart Gravity Well MVP

This document decomposes the SwiftCart architecture into actionable Epics and User Stories, providing a clear roadmap from initialization to a functional MVP.

---

## Epic 1: The Physics Foundation
**Objective:** Establish the off-main-thread physics manifold to achieve a rock-solid 60 FPS visual experience.

### User Stories
- **As a user,** I want the interface to feel tactile and responsive, even when I'm flicking products around at high speed.
- **As a developer,** I want the physics calculations to be isolated from the UI thread to prevent frame drops during complex interactions.

### Technical Tasks
- [ ] Initialize Vite + React 19 + TypeScript project structure.
- [ ] Implement the `Physics.worker.ts` web worker for off-main-thread calculations.
- [ ] Integrate GSAP 3.14 for hardware-accelerated transforms.
- [ ] Create the "Gravity Well" container with repulsive soft-collider logic.
- [ ] Implement "Flick-to-Orbit" gesture detection on the client side.

---

## Epic 2: The Real-time Pulse
**Objective:** Connect the frontend manifold to a high-frequency Redis state via WebSockets for communal synchronization.

### User Stories
- **As a user,** I want to see products moving and reacting in real-time based on collective activity.
- **As a developer,** I want to sync volatile states (position, mass, price) with sub-50ms latency.

### Technical Tasks
- [ ] Set up Django 6.0 with Channels 4.3 and Redis 8.0 support.
- [ ] Implement the `physics/engine.py` for server-side state recalculations.
- [ ] Create the MessagePack serialization schema for binary WebSocket payloads.
- [ ] Build the `sc:prod:state:{id}` Redis Hash structure for volatile product data.
- [ ] Implement the WebSocket consumer in Django to broadcast state updates to all clients.

---

## Epic 3: Dimensional Scarcity (Redshift UI)
**Objective:** Implement the visual "Redshift" glitch system to communicate inventory urgency through thematic instability.

### User Stories
- **As a user,** I want to feel the urgency of low stock through visual cues that feel part of the world, not just text.
- **As a user,** I want the purchase buttons to remains stable even when the rest of the UI is "glitching."

### Technical Tasks
- [ ] Create CSS/JS glitch primitives driven by dynamic CSS variables.
- [ ] Implement the stock-threshold listener to escalate glitch intensity.
- [ ] Build the "Desync" positional offset effect for the final stock unit.
- [ ] Ensure CTA (Call to Action) stability during high-intensity de-materialization phases.

---

## Epic 4: Hyperdrive Fulfillment
**Objective:** Realize the "Zero-Interface" checkout experience using Stripe Tokenization and optimistic UI updates.

### User Stories
- **As a user,** I want to buy my "Discovery Hunt" finds in a single click without being slowed down by traditional checkout forms.
- **As a user,** I want the system to remember my shipping and payment details automatically.

### Technical Tasks
- [ ] Integrate Stripe REST API for secure tokenization.
- [ ] Implement the `HyperdriveButton` with one-click execution logic.
- [ ] Build the "Warp" animation (GSAP) to mask background verification latency.
- [ ] Set up the atomic checkout protocol (Redis WATCH + DB Transaction) to prevent stock race conditions.

---

## Epic 5: Temporal Paradox Management
**Objective:** Master the "failure as a feature" model through thematic state rollbacks and recovery.

### User Stories
- **As a user,** I want any errors (payment fail, stock out) to be explained in-theme and my state restored without losing my progress.
- **As a developer,** I want a unified error handling system that can "Rewind" the UI state to a stable checkpoint.

### Technical Tasks
- [ ] Define the `ERR_TEMPORAL_PARADOX` global error handler.
- [ ] Implement the "Rewind" animation logic for UI state rollbacks.
- [ ] Create session state snapshotting in Redis for 99.9% accurate recovery.
- [ ] Build the "Price Freezing" logic to protect users from price hikes during technical failures.

---

## Epic 6: Celestial Operations (Admin)
**Objective:** Provide internal tools to manipulate the "Gravity" of the platform.

### User Stories
- **As an admin,** I want to increase a product's "Gravitational Pull" to promote specific items or clearance stock.
- **As an admin,** I want to monitor the Redis-First price decay logs in real-time.

### Technical Tasks
- [ ] Build a basic React Admin portal for product metadata management.
- [ ] Implement controls to adjust `base_mass` and `gravity_coefficient` in Redis.
- [ ] Create a dashboard to visualize real-time interaction metrics (Flicks/Orbits).
- [ ] Set up the manual "Price Floor" override for automatic decay protection.

---

## Roadmap Milestones
1. **Milestone 1: The Singularity (Week 1-2)** - End of Epic 1 & 2. A blank screen becomes a synchronized workspace with moving products.
2. **Milestone 2: The Event Horizon (Week 3)** - End of Epic 3 & 4. Urgency UI is active and one-click purchase is possible.
3. **Milestone 3: The Stable Orbit (Week 4)** - End of Epic 5 & 6. Error handling is polished and admin controls are live. MVP complete.
