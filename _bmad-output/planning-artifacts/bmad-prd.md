---
stepsCompleted: [step-01-init, step-02-discovery, step-03-success, step-04-journeys, step-05-domain, step-06-innovation, step-07-project-type, step-08-scoping, step-09-functional, step-10-nonfunctional, step-11-polish]
inputDocuments: ['_bmad-output/brainstorming/brainstorming-session-2026-02-13.md']
workflowType: 'prd'
documentCounts:
  briefCount: 0
  researchCount: 0
  brainstormingCount: 1
  projectDocsCount: 0
classification:
  projectType: 'web_app'
  domain: 'e-commerce'
  complexity: 'high'
  projectContext: 'greenfield'
---

# Product Requirements Document - SwiftCart

**Author:** AQ
**Date:** 2026-02-13

## Executive Summary
SwiftCart is a futuristic, anti-gravity themed e-commerce platform designed to transform shopping from a utility into a competitive "Discovery Hunt." By blending real-time physics (Redis-first price decay) with a high-energy "Alive UI," SwiftCart targets Gen-Z and Alpha audiences who demand immersive, gamified experiences. The primary differentiator is the **"Gravity Well"** interaction model, where products possess communal mass and state-driven scarcity.

## Success Criteria

### User Success
Users feel **"Empowered by Community Logic."** Success is achieved when shopping feels like a live social event driven by collective interaction rather than a solitary transaction.

### Business Success
The north-star metric is **"Micro-Interaction Frequency"** (Flicks/Orbits per session), validating the core gamification engine's engagement power.

### Technical Success
Achieve **<50ms latency** for physics/state recalculations to ensure a responsive, native-like experience.

### Measurable Outcomes
- Average Flick/Orbit interactions per user session.
- 95th percentile latency for orbital state updates.
- Conversion rate delta: Hyperdrive Checkout vs. traditional flows.

## Strategic Roadmap & Scope

### MVP Strategy: "The Experience Alpha"
Prioritize "Gamified Discovery" over broad features to validate the brand premise.
- **Resource Needs**: Specialized GSAP/Three.js frontend talent and Redis real-time backend expertise.

### Phase 1: MVP - The Anti-Gravity Core
- **Gravity Well Cart**: 3D orbital system with repulsive soft colliders.
- **Redshift Glitch UI**: Temporal scarcity visualization via state-driven "de-materialization."
- **Hyperdrive Checkout**: One-click purchase via Stripe Tokenization.
- **Paradox Error Handling**: Thematic recovery from transaction failures.

### Phase 2: Growth - Social Gravity
- **Democratic Gravity**: Community-driven mass engine (Social discovery).
- **Celestial Events**: Time-gated flash sales triggered by planetary alignments.

### Phase 3: Vision - The Celestial Ecosystem
- **Solar System Categories**: Constellation-based navigation system.
- **Black Hole Inventory**: Speculative hardware/software handling for "void" stock states.
- **Atmospheric Friction**: Haptic and visual navigation feedback.

## User Journeys

### 1. The Primary "Hunter": Jax (Gen-Z / Alpha Early Adopter)
*   **Opening Scene**: Jax is scrolling through social media, bored of static ads. They hear about a "Celestial Event" on SwiftCart.
*   **Rising Action**: Jax opens the mobile app. Instead of a list, they see a constellation of products. Jax uses **Flick-to-Orbit** to test the "weight" of a limited-edition sneaker.
*   **Climax**: As the stock drops, the sneaker starts to **Glitch** (Redshift UI). Jax feels the urgency.
*   **Resolution**: Jax hits **Hyperdrive Checkout**. In one click, the "Warp" animation plays, and they receive a confirmation instantly.

### 2. The "Orbit-Admin" (Internal Operations)
*   **Opening Scene**: A Product Manager needs to move "Old Season" gear. 
*   **Rising Action**: They log into the Admin Portal and increase the **Gravitational Pull** of the "Clearance Constellation."
*   **Climax**: They monitor the **Redis-First Decay** logs as the price begins to drop in real-time based on community interaction.
*   **Resolution**: Inventory moves 30% faster as users are "pulled" toward the high-gravity, low-priced items.

### 3. The "Paradox" Case (Support/Edge Case)
*   **Opening Scene**: A user attempts a Hyperdrive purchase, but their saved "Warp Coordinates" (Card) has expired.
*   **Climax**: A **"Temporal Paradox"** occurs. The UI time-travels back to the cart state.
*   **Resolution**: The system clearly explains the paradox using "Time-travel" terminology and guides the user to a secure flow to update their credentials without losing their orbital state.

### Journey Requirements Summary
- **Capability: Real-time Physics Engine**: Supporting Flick-to-Orbit, mass-based drag, and communal gravity pulls.
- **Capability: Temporal Scarcity Visualization**: WebSocket-driven glitch effects for low-stock products.
- **Capability: Zero-Interface Fulfillment**: One-click "Hyperdrive" checkout with optimistic status updates.
- **Capability: State Paradox Management**: Specialized error handling that treats transaction failures as "Temporal Paradoxes," involving state rollbacks to preserve the user's navigational context.

## Domain-Specific Requirements

### Technical Constraints: Physics & Sync
- **Visual Latency Budget**: <50ms for real-time visual states (position, rotation, velocity).
- **Price Latency Budget**: <200ms for decayed price recalculations (Redis-hardened values).
- **Soft Colliders**: Primary interaction model allows slight item overlap with a repulsive force to optimize mobile performance.
- **Sync Logic**: Persistence from Redis to PostgreSQL is event-driven, triggered only during "Cart Add" and "Checkout" to minimize database load.

### Compliance & Error Handling
- **Security**: Utilization of Stripe Tokenization for "Hyperdrive" checkout. No raw payment data is stored; transactions are 1:1 mappings to stored Stripe Payment Intents.
- **Paradox Logic**: In the event of a technical failure (Temporal Paradox), the system will "Freeze" the discovered price to ensure the user does not lose a promotional opportunity due to system errors.

### Market Stability & Safety
- **Pricing Floor**: Automatic orbital decay is hard-capped at 70% of the Original MSRP.
- **Community Mass Protection**: Community interaction weights are session-validated. Guest users contribute 0.1x weight compared to authenticated sessions to prevent mass-manipulation via bots.

## Innovation & Novel Patterns

### Detected Innovation Areas
- **The "Alive" UI Paradigm**: SwiftCart shatters the "static predictability" rule of traditional e-commerce. By utilizing a "glitching," shifting interface (Redshift UI), we trigger a deep emotional response of urgency and novelty that list-based containers cannot achieve.
- **Physicality in Browser**: Movement is not just decorative; it is the core interaction model. The "Flick-to-Orbit" gesture bridges the gap between digital listing and physical touch.
- **High-Frequency Backend**: A purpose-built Redis architecture for sub-50ms physics recalculations allows for a shopping experience that feels like a live event.

### Market Context & Competitive Landscape
- **Brand Moat**: While major utility retailers (Amazon/eBay) focus on efficiency and predictability, SwiftCart is a "Digital Playground." This brand DNA is difficult to copy without alienating a functionalist core audience.
- **Technical Barrier**: Retrofitting a high-frequency physics engine and real-time state management into legacy e-commerce stacks (which are optimized for consistency and long-tail caching) provides a significant head start.

### Validation Approach
- **A/B Testing Framework**: Group A (Glitch/Physics UI) vs. Group B (Static Bootstrap List).
- **Core KPIs**: 
    - **Time-to-Cart**: Measuring the speed of discovery and decision-making.
    - **Add-to-Cart Conversion**: Validating if the emotional "urgency" of the glitch UI translates to higher intent.

### Risk Mitigation
- **Cognitive Overload**: Ensuring the novelty doesn't become a barrier to purchase by maintaining the "Hyperdrive" checkout as a simple, stable exit point.
- **Infrastructure Fallback**: The "Temporal Paradox" system ensures pricing is frozen and recoverable during unexpected system desyncs.

## Web App Specific Requirements

### Project-Type Overview
SwiftCart is a high-performance **Single Page Application (SPA)** designed for Modern Evergreen Browsers. It prioritizes immersive, physics-based interactions that require persistent state management and low-latency UI updates.

### Technical Architecture Considerations
- **Frontend Framework**: React or Vue.js for robust DOM manipulation and state management of the "Glitch UI" and "Orbital" elements.
- **Real-Time Engine**: WebSockets via **Django Channels** for live state pushes from the Redis decay engine.
- **Graphics & Physics**: Highly optimized JavaScript using **GSAP** and **Three.js**. (WASM excluded from MVP to prioritize development velocity).

### Platform & Performance Targets
- **Browser Support**: Modern Evergreen Browsers ONLY (Chrome, Safari, Edge). Legacy browser support is explicitly out of scope.
- **Initial Load Time**: < 2 seconds.
- **Asset Strategy**: Lazy-loading and predictive fetching for 3D assets/textures to ensure the "Discovery Hunt" begins instantly.

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** Experience-First MVP. We prioritize the "Gamified discovery" feeling over broad feature sets to validate the core "Anti-gravity" brand premise.
**Resource Requirements:** Specialized frontend talent (GSAP/Three.js) and backend expertise in Redis-based real-time state management.

### MVP Feature Set (Phase 1)

**Core User Journeys Supported:**
- **Jax's "Hunter" Journey**: Full discovery-to-checkout flow using physics gestures and glitch UI.
- **Orbit-Admin Management**: Basic manual control over product mass and pricing floor.
- **Paradox Error Handling**: Terminology-specific recovery for transaction failures.

**Must-Have Capabilities:**
- **Gravity Well Cart**: 3D orbital cart system with repulsive soft colliders.
- **Redshift Glitch UI**: Temporal scarcity visualization via CSS/JS glitches.
- **Hyperdrive Checkout**: One-click purchase via Stripe Tokenization.

### Post-MVP Features

**Phase 2 (Growth):**
- **Democratic Gravity**: Community-driven mass engine (Social discovery).
- **Celestial Events**: Time-gated flash sales based on planetary alignments.

**Phase 3 (Expansion):**
- **Solar System Categories**: Constellation-based navigation.
- **Black Hole Inventory**: Handling speculative or "negative" stock states.
- **Atmospheric Friction**: Haptic and visual navigation feedback.

### Risk Mitigation Strategy
- **Technical Risk**: Achieving <50ms latency for GSAP physics with Redis sync.
    - *Mitigation*: Soft colliders and event-driven async sync to PostgreSQL.
- **Market Risk**: Users find "Glitch" UI confusing.
    - *Mitigation*: A/B testing framework against a "Static" control group.
- **Resource Risk**: Complexity of Three.js implementation.
    - *Mitigation*: Prioritize 2D-translated physics manifold over complex 3D collisions.

## Functional Requirements

### 1. Dynamic Cart Management (The Gravity Well)
- **FR-GW1 (Orbital Addition)**: Users can add items to the cart via a "Tractor-Beam" interaction; the cart icon must exert a visual "Pull" (distortion) to swallow items flicked toward it.
- **FR-GW2 (Proximity Interaction)**: Users can manually "Drag and Re-orbit" items within the cart; moving an item closer to the center of the Well "Pins" it for prioritized accessibility.
- **FR-GW3 (Visual Feedback)**: Items must exhibit a visual "Glow" and increased orbital velocity as their communal/individual mass increases, simulating a high-energy state.
- **FR-GW4 (Removal Gesture)**: Users can remove items by "Flicking into the Void" (swiping away from the cart); the system provides a secondary "Delete" button only after failed gesture attempts to ensure accessibility.
- **FR-GW5 (Inventory Sync)**: The system must "Implode" any item in the cart (visual glitch/shrink to zero) if its inventory status becomes unavailable in real-time.

### 2. Visual Scarcity Engine (Redshift Glitch UI)
- **FR-RG1 (State-Driven Instability)**: The UI must trigger visual "Glitch/Shimmer" effects driven by a dynamic CSS variable updated by the Redis-state via the Django backend.
- **FR-RG2 (Threshold Escalation)**: The intensity of the "De-materialization" effect must increase automatically at predefined stock thresholds (e.g., 20%, 10%, 5%).
- **FR-RG3 (UX Coherence)**: Product images may glitch, but core purchasing elements (Price, "Add to Cart" CTA) must remain stable and actionable at all times.
- **FR-RG4 (Desync Effect)**: At exactly 1 unit of stock remaining, the product element should exhibit a "Slight Desync" positional offset to maximize thematic urgency.

### 3. Rapid Fulfillment (Hyperdrive Checkout)
- **FR-HC1 (Warp Coordinate Retrieval)**: The system must automatically fetch pre-saved shipping and payment intents (Stripe Tokenization) for authenticated users as soon as the cart is opened.
- **FR-HC2 (Zero-Step Execution)**: The "Hyperdrive" button must execute a complete purchase in a single click, bypassing intermediate review screens.
- **FR-HC3 (Optimistic Verification)**: The UI must trigger the "Warp" animation (minimum duration: 800ms) immediately upon click, allowing background verification to complete without user-perceived processing lag.
- **FR-HC4 (Paradox Handling)**: If background verification fails, the system must trigger a "Temporal Paradox" error state, including a thematic "Rewind" animation and an intentional rollback to the cart state.

### 4. State & Paradox Management (The Safety Net)
- **FR-SP1 (Price Freezing)**: In the event of a transaction failure, the system must "Freeze" the price at the moment the "Hyperdrive" attempt was initiated.
- **FR-SP2 (State Checkpointing)**: The system must maintain a high-frequency "Session Snapshot" in Redis, including item 3D coordinates, rotations, and the "Last Known CSS Glitch Intensity" for persistent state recovery.
- **FR-SP3 (Atomic Orbits)**: The system must utilize atomic inventory updates (e.g., `select_for_update()` or Redis Locks) during the "Warp" execution to ensure 100% stock accuracy.
- **FR-SP4 (Thematic Rollback)**: When a Temporal Paradox occurs, the system must visually reverse all state changes via the "Rewind" animation, returning the user to a precise, stable prior state.

## Non-Functional Requirements

### Performance
- **NFR-P1 (Physics Frame-Rate)**: The GSAP/Three.js engine must maintain a consistent **60 FPS** on modern mobile browsers.
- **NFR-P2 (State Sync)**: Redis-to-UI state updates must complete in **<50ms** for visual positions and **<200ms** for price recalculations.
- **NFR-P3 (Load Velocity)**: The initial "Landing Constellation" must be interactive in **<2 seconds** on a standard 4G/5G connection.

### Security
- **NFR-S1 (Zero-Persistence)**: No raw credit card data or PII (Personally Identifiable Information) shall ever touch the SwiftCart database; all transactions remain 100% Stripe-Tokenized.
- **NFR-S2 (Atomic Locking)**: Background purchase verification must use a Distributed Lock (Redis) to prevent race conditions during traffic spikes.

### Usability & Accessibility
- **NFR-U1 (Gesture Fallback)**: Every physical gesture (Flick/Orbit) must have a secondary click/tap alternative that appears automatically after 2 failed intentional attempts.
- **NFR-U2 (Motion Sensitivity)**: The system must respect the `prefers-reduced-motion` OS setting by substituting high-velocity animations with "Static Glitch" frames.

### Reliability
- **NFR-R1 (State Persistence)**: In the event of a client-side crash, the user's "Orbital State" must be recoverable from Redis with **99.9% accuracy** upon refresh.
