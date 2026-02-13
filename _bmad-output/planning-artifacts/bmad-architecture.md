---
stepsCompleted: [1, 2, 3, 4]
inputDocuments: ['_bmad-output/planning-artifacts/prd.md']
workflowType: 'architecture'
project_name: 'SwiftCart'
user_name: 'AQ'
date: '2026-02-13'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
The system is built around four immersive clusters. Architecturally, this necessitates a **high-frequency bidirectional sync** between the client-side GSAP physics manifold and the server-side Redis engine. The "Paradox" system requires robust **state snapshotting and rollback mechanisms** to ensure a coherent user experience (visual "Rewind") during transaction failures.

**Non-Functional Requirements:**
Performance is the primary driver, with a strict **<50ms visual latency budget** and **60 FPS** frame rate target. Reliability is managed through **99.9% accurate session recovery from Redis**, while security demands **zero-persistence of payment data**, relying entirely on external tokenization (Stripe).

**Scale & Complexity:**
The project is categorized as **High Complexity** due to the requirement for real-time physics synchronization across a distributed state (Redis to multiple clients).

- Primary domain: Full-stack Web (Real-time Experience)
- Complexity level: High
- Estimated architectural components: 5 (Frontend, WebSocket Layer, Redis Engine, Pricing Worker, API/Admin)

### Technical Constraints & Dependencies
- **Browser Constraints**: Modern Evergreen browsers only; legacy support is explicitly out of scope.
- **State Dependency**: Heavy reliance on **Redis** for sub-200ms state recalculations.
- **Latency Budget**: Global performance constraints dictate the use of WebSockets (Django Channels) as the primary communication protocol.

### Cross-Cutting Concerns Identified
- **Latency Management**: Maintaining visual coherence between physical gestures and server state.
- **Thematic Consistency (Paradox Logic)**: Unified error handling and state rollbacks.
- **Distributed Concurrency**: Using Redis locks to manage inventory atomicity during rapid checkouts.

## Starter Template Evaluation

### Primary Technology Domain
**High-Performance Full-stack Web** based on real-time physics and volatile state requirements.

### Starter Options Considered
- **Vite + React 19 (Frontend Only)**: Highly optimized build pipeline, but requires manual backend integration.
- **Django 6 + Channels 4.3 (Backend Only)**: Best-in-class for real-time WebSockets and Redis integration, but needs a separate frontend build.
- **Next.js 15 (Full-stack)**: Excellent DX, but integrating Django Channels/Redis-First Decay Engine adds unnecessary complexity compared to a pure Python backend.

### Selected Starter: Custom Decoupled (Vite-React + Django-Channels)

**Rationale for Selection:**
To maintain a consistent **60 FPS**, the **Physics Engine must be isolated from the standard E-commerce CRUD logic**. A decoupled architecture allows the frontend to run the physics manifold (GSAP) in a dedicated **Web Worker**, synchronized via a high-frequency **WebSocket pipe** (Django Channels) that bypasses traditional REST/HTTP bottlenecks used for typical CRUD (Product metadata, User Auth).

**Initialization Recommendation:**
- **Frontend**: `npm create vite@latest ./ -- --template react-ts` (React 19, TypeScript)
- **Backend**: `pip install django channels[daphne] redis` (Django 6.0, Channels 4.3)

**Architectural Decisions Provided by Foundation:**
- **Language**: TypeScript (Frontend) / Python 3.12+ (Backend)
- **Styling**: Tailwind CSS 4.0 (for UI stability) + GSAP 3.14 (for physics-driven dynamics).
- **Build Tooling**: Vite for sub-second HMR and optimized asset lazy-loading.
- **Real-Time**: Django Channels + Redis for sub-50ms state propagation.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- **Off-Main-Thread Physics Mirror**: Use of Web Workers is essential to hit the 60 FPS target.
- **MessagePack Serialization**: Binary format required to minimize payload overhead for <50ms packets.
- **Redis Hash State**: Primary store for volatile orbital data for MVP velocity.

**Important Decisions (Shape Architecture):**
- **Lag Compensation Logic**: Robust interpolation required within the Web Worker to handle network jitters.
- **Stripe-Only Payments**: Explicit decision to use zero-persistence PII for compliance and security.

### Data Architecture

- **Primary Volatile Store**: Redis 8.0 (Hashes)
  - *Rationale*: Individual product states (coordinates, mass, price) will be stored as Redis Hashes for O(1) access and update speeds. Simple to implement and extremely fast for high-frequency reads/writes.
- **Persistent Database**: PostgreSQL 17
  - *Rationale*: Standard CRUD (Users, Orders, Product Metadata) and historical price logging.
- **Caching Strategy**: Redis-first for all "Alive UI" components; aggressive PostgreSQL query caching for static metadata.

### Authentication & Security

- **Authentication**: JWT (JSON Web Tokens) with 15-minute expiry.
- **Security Middleware**: Django-standard CSRF/XSS protection for CRUD; WebSocket Origin validation for the Physics manifold.
- **Payment Security**: Stripe Tokenization only. No PCI data touches local disks or memory beyond RAM-volatile buffers during transaction handoffs.

### API & Communication Patterns

- **High-Frequency Pipe**: WebSockets (Django Channels) + MessagePack.
  - *Rationale*: Binary serialization via MessagePack reduces packet size by ~40% compared to JSON, critical for maintaining the <50ms visual latency budget.
- **Standard CRUD API**: REST (Django REST Framework).
  - *Rationale*: Used for non-time-sensitive actions like user login, product catalog management, and order history.

### Frontend Architecture

- **Physics Isolation (Web Worker)**:
  - **WebSocket Worker**: Manages the persistent socket and deserializes MessagePack packets.
  - **Manifold Worker**: Performs lag compensation and state interpolation.
- **Rendering Layer**: React 19 + GSAP 3.14 (hardware-accel transforms only).
- **State Management**: Zustand for UI state; raw Worker buffers for physics state to avoid React reconciliation overhead for 60FPS visuals.

### Decision Impact Analysis

**Implementation Sequence:**
1. Initialize Vite (React/TS) and Django (Channels/Redis).
2. Implement WebSocket Web Worker with MessagePack support.
3. Build Redis Pricing/Physics Engine (Hashes).
4. Integrate GSAP Manifold with Worker state.
5. Implement Stripe/Checkout CRUD flows.

**Cross-Component Dependencies:**
The **Manifold Worker** is the "single source of truth" for the UI, but it depends entirely on the **Django Channels** stream being alive. Failure in the socket triggers the "Temporal Paradox" (Thematic Rollback) logic immediately.




## High-Level System Architecture

SwiftCart utilizes a high-frequency, event-driven architecture designed to support real-time physics and dynamic pricing with sub-50ms visual latency. The system is split into three primary layers: the **React/GSAP "Alive UI"**, the **Django Channels WebSocket Layer**, and the **Redis-First Decay Engine**.

### 1. Redis-First Decay Engine (The Heartbeat)
The core logic resides in a high-performance Redis implementation that manages the volatile state of all products in the "Gravity Well."
- **Physics Calculations**: Redis handles sub-50ms recalculations of orbital coordinates, velocities, and communal mass state.
- **Price Decay**: A specialized worker process monitors interaction frequency and inventory, updating decayed prices directly in Redis at <200ms intervals.
- **Atomicity**: Distributed locks and atomic operations ensure that price freezing (during Hyperdrive Checkout) and inventory decrements are consistent.

### 2. Django Channels (Real-Time Synchronization)
Django Channels serves as the persistent communication bridge between the backend state and the frontend interface.
- **WebSocket Streams**: High-frequency packets (positions, rotations, stock glitches) are pushed from Redis through Channels to active client sessions.
- **Minimal Overhead**: The WebSocket layer bypasses traditional HTTP overhead to meet the <50ms latency budget for visual state updates.
- **State Partitioning**: Channels manages session-specific data (Personal Cart Orbits) while broadcasting communal state changes (Global Mass/Price Decay).

### 3. React/GSAP Frontend (The Physics Manifold)
The frontend is responsible for translating backend state into an immersive, tactile experience.
- **GSAP Physics Engine**: Rather than simple animations, GSAP is used as a physics manifold. It interpolates incoming WebSocket data to create smooth, high-60FPS movements even with slight network jitter.
- **Redshift Glitch UI**: React state-driven components trigger CSS/JS glitches based on "instability" variables pushed via the WebSocket.
- **Gesture Interaction**: "Flick-to-Orbit" and "Tractor-Beam" gestures are captured on the client, processed via GSAP for immediate feedback, and synced back to Redis via the WebSocket for communal mass updates.

### Data Flow Diagram (Conceptual)
```mermaid
graph TD
    User((User Interaction)) -->|Gesture/Flick| React[React/GSAP UI]
    React -->|WebSocket| Channels[Django Channels]
    Channels -->|Update State| Redis[(Redis Decay Engine)]
    Redis -->|Recalculate Physics/Price| Redis
    Redis -->|State Push| Channels
    Channels -->|WebSocket| React
    Redis -->|Async Sync| DB[(PostgreSQL)]
    React -->|Stripe Token| Stripe[[Stripe API]]
```
