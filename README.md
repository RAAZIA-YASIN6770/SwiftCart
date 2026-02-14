# SwiftCart - Anti-Gravity E-Commerce Platform

**Status:** Story 1.1 - Project Manifold Initialization ✅  
**Sprint:** Sprint 1 - Physics Foundation  
**Phase:** Implementation (Phase 5)

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- Redis Server

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend will run on: http://localhost:5173

### Backend Setup
```bash
cd backend

# Activate virtual environment
.\venv\Scripts\activate  # Windows
source venv/bin/activate  # macOS/Linux

# Run migrations
python manage.py migrate

# Start Django with Daphne (ASGI server)
daphne -b 0.0.0.0 -p 8000 swiftcart.asgi:application
```
Backend will run on: http://localhost:8000

### Redis Setup
Make sure Redis is running on `localhost:6379`

---

## 📁 Project Structure

```
SwiftCart/
├── frontend/                 # Vite + React + TypeScript
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── physics/         # Physics engine (Matter.js)
│   │   │   └── physics.worker.ts  # Off-main-thread physics
│   │   ├── hooks/
│   │   │   └── useWebSocketHealthCheck.ts
│   │   ├── utils/
│   │   ├── App.tsx          # Health check UI
│   │   └── main.tsx
│   ├── vite.config.ts       # Optimized for 60 FPS
│   └── package.json
│
├── backend/                  # Django + Channels
│   ├── swiftcart/           # Django project
│   │   ├── settings.py      # Channels + Redis + CORS
│   │   ├── asgi.py          # ASGI configuration
│   │   └── urls.py
│   ├── physics/             # Physics app
│   │   ├── consumers.py     # WebSocket consumer
│   │   └── routing.py       # WebSocket routing
│   ├── requirements.txt
│   └── manage.py
│
└── _bmad-output/            # Planning & tracking
    ├── planning-artifacts/
    └── implementation/
```

---

## ✅ Story 1.1: Completed Features

### Frontend
- ✅ Vite + React + TypeScript initialized
- ✅ Optimized `vite.config.ts` for 60 FPS performance
- ✅ Physics worker shell (`physics.worker.ts`) with Matter.js
- ✅ WebSocket health check hook (`useWebSocketHealthCheck.ts`)
- ✅ Health check UI with latency display

### Backend
- ✅ Django + Channels + Redis configured
- ✅ ASGI application with WebSocket routing
- ✅ WebSocket consumer with ping-pong protocol
- ✅ CORS configured for frontend (port 5173)
- ✅ REST Framework integrated

### Core Dependencies
**Frontend:**
- React 18.2
- Zustand (state management)
- Matter.js (physics engine)
- Socket.io-client (WebSocket)
- Three.js + React Three Fiber (3D rendering)

**Backend:**
- Django 6.0
- Django REST Framework
- Channels 4.3 (WebSocket)
- Redis 7.1
- Django CORS Headers

---

## 🔌 WebSocket Health Check

The health check verifies the real-time pulse between frontend and backend:

**Endpoint:** `ws://localhost:8000/ws/health/`

**Protocol:**
1. Frontend connects to WebSocket
2. Backend sends connection confirmation
3. Frontend sends `ping` every 2 seconds
4. Backend responds with `pong`
5. Frontend calculates round-trip latency

**Target:** Sub-10ms latency ⚡

---

## 🎯 Next Steps (Story 1.2)

- [ ] Initialize Matter.js physics engine
- [ ] Configure anti-gravity parameters
- [ ] Implement 60 FPS physics loop
- [ ] Set up collision detection

---

## 📊 Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Frontend Framework | Vite + React + TS | Fastest HMR, 60 FPS workflow |
| Physics Engine | Matter.js | Lightweight 2D, proven 60 FPS |
| State Management | Zustand | Minimal overhead, high-frequency updates |
| Real-Time | Django Channels + WebSocket | Native Django, Redis for sub-10ms latency |
| ASGI Server | Daphne | Official Channels server |

---

## 🛠️ Development Commands

### Frontend
```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run preview      # Preview production build
```

### Backend
```bash
python manage.py migrate              # Run migrations
python manage.py createsuperuser      # Create admin user
daphne swiftcart.asgi:application     # Start ASGI server
```

---

## 📝 Implementation Tracking

See `_bmad-output/implementation/bmad-implementation.md` for detailed sprint tracking.

---

**Built with BMAD Methodology** 🚀
