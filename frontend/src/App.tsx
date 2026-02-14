import { useEffect } from 'react';
import { useWebSocketHealthCheck } from './hooks/useWebSocketHealthCheck';
import { usePhysicsWorker } from './hooks/usePhysicsWorker';
import { usePhysicsStore } from './store/physicsStore';
import { checkPhysicsSupport } from './utils/capabilityDetection';
import GravityTest from './components/GravityTest';
import ProductGrid from './components/ProductGrid';
import './App.css';

function App() {
  const { isConnected, latency, sendPing } = useWebSocketHealthCheck(
    'ws://localhost:8000/ws/health/'
  );

  const { viewMode, setViewMode, isSupported, setIsSupported } = usePhysicsStore();

  // Initialize Physics Worker
  usePhysicsWorker();

  // Detection and initialization
  useEffect(() => {
    const supported = checkPhysicsSupport();
    setIsSupported(supported);
    if (!supported) {
      setViewMode('LIST');
    }
  }, [setIsSupported, setViewMode]);

  // Send ping every 2 seconds
  useEffect(() => {
    if (isConnected) {
      const interval = setInterval(() => {
        sendPing();
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isConnected, sendPing]);

  const toggleMode = () => {
    setViewMode(viewMode === 'PHYSICS' ? 'LIST' : 'PHYSICS');
  };

  return (
    <div className="App">
      <header className="App-header">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
          <h1>🚀 SwiftCart</h1>
          <button
            onClick={toggleMode}
            className={`mode-toggle ${viewMode === 'PHYSICS' ? 'active' : ''}`}
            style={{
              padding: '10px 20px',
              borderRadius: '20px',
              border: '2px solid #00ffff',
              background: viewMode === 'PHYSICS' ? 'rgba(0, 255, 255, 0.1)' : 'transparent',
              color: '#00ffff',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.3s'
            }}
          >
            {viewMode === 'PHYSICS' ? '🌌 IMMERSIVE VIEW' : '📑 CLASSIC LIST'}
          </button>
        </div>

        <div className="story-section">
          <h2>Story 1.5: Gesture Fallback</h2>
          <p>
            {isSupported
              ? `Hardware Acceleration: Active | Mode: ${viewMode}`
              : '⚠️ Web Worker not supported. Classic List Mode forced.'}
          </p>

          {viewMode === 'PHYSICS' && isSupported ? (
            <GravityTest />
          ) : (
            <ProductGrid />
          )}
        </div>

        <div className="health-check">
          <div className="status-indicator">
            <div className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`} />
            <span>{isConnected ? 'Pulse Connected' : 'Pulse Disconnected'}</span>
          </div>
          {latency !== null && (
            <div className="latency-display">
              <strong>Latency:</strong> {latency}ms
            </div>
          )}
        </div>

        <div className="info">
          <p>✅ Epic 1: The Physics Foundation - 100% Locked</p>
        </div>
      </header>
    </div>
  );
}

export default App;
