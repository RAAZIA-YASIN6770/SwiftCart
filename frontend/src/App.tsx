import { useEffect } from 'react';
import { useWebSocketHealthCheck } from './hooks/useWebSocketHealthCheck';
import { usePhysicsWorker } from './hooks/usePhysicsWorker';
import { usePhysicsStore } from './store/physicsStore';
import { checkPhysicsSupport } from './utils/capabilityDetection';
import { pulseReceiver } from './utils/pulse-receiver';
import { useAccessibility } from './hooks/useAccessibility';
import GravityTest from './components/GravityTest';
import ProductGrid from './components/ProductGrid';
import WarpTunnel from './components/WarpTunnel';
import ParadoxGlitch from './components/ParadoxGlitch';
import HyperdriveButton from './components/HyperdriveButton';
import ParadoxOracle from './components/ParadoxOracle';
import './App.css';

function App() {
  const { isConnected: isHealthConnected, latency, sendPing } = useWebSocketHealthCheck(
    'ws://localhost:8000/ws/health/'
  );

  const { viewMode, setViewMode, isSupported, setIsSupported, prices, setReducedMotion, syncSnapshots, recoverSnapshots } = usePhysicsStore();
  const { reducedMotion } = useAccessibility();

  // [STORY 5.3] Session Recovery
  useEffect(() => {
    recoverSnapshots();
  }, [recoverSnapshots]);

  // Sync accessibility state to store
  useEffect(() => {
    setReducedMotion(reducedMotion);
  }, [reducedMotion, setReducedMotion]);

  // Initialize Physics Worker
  usePhysicsWorker();

  // Initialize Pulse Receiver (Sprint 2)
  useEffect(() => {
    pulseReceiver.connect();
    return () => pulseReceiver.disconnect();
  }, []);

  // Detection and initialization
  useEffect(() => {
    const supported = checkPhysicsSupport();
    setIsSupported(supported);
    if (!supported) {
      setViewMode('LIST');
    }
  }, [setIsSupported, setViewMode]);

  // [STORY 5.3] Snapshot Handshake (5-second interval)
  useEffect(() => {
    const interval = setInterval(() => {
      syncSnapshots();
    }, 5000);

    return () => clearInterval(interval);
  }, [syncSnapshots]);

  // Send ping every 2 seconds
  useEffect(() => {
    if (isHealthConnected) {
      const interval = setInterval(() => {
        sendPing();
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isHealthConnected, sendPing]);

  const toggleMode = () => {
    setViewMode(viewMode === 'PHYSICS' ? 'LIST' : 'PHYSICS');
  };

  return (
    <div className="App">
      <ParadoxOracle />
      <WarpTunnel />
      <ParadoxGlitch />
      <header className="App-header">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
          <h1>🚀 SwiftCart</h1>
          <HyperdriveButton />
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
          <h2>Epic 2: The Real-time Pulse</h2>
          <div className="pulse-monitor" style={{
            background: 'rgba(0, 255, 255, 0.05)',
            padding: '15px',
            borderRadius: '10px',
            border: '1px solid rgba(0, 255, 255, 0.2)',
            marginBottom: '20px'
          }}>
            <p><strong>Binary Pulse Feed:</strong> {Object.keys(prices).length > 0 ? 'ACTIVE ⚡' : 'WAITING...'}</p>
            {Object.entries(prices).map(([id, price]) => (
              <div key={id} className="price-tag" style={{ color: '#00ffff', fontSize: '24px', fontWeight: 'bold' }}>
                ID: {id.slice(0, 8)} | $ {price.toFixed(2)}
              </div>
            ))}
          </div>

          <h3>Story 1.5: Gesture Fallback</h3>
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
            <div className={`status-dot ${isHealthConnected ? 'connected' : 'disconnected'}`} />
            <span>{isHealthConnected ? 'Pulse Connected' : 'Pulse Disconnected'}</span>
          </div>
          {latency !== null && (
            <div className="latency-display">
              <strong>Latency:</strong> {latency}ms
            </div>
          )}
        </div>

        <div className="info">
          <p>✅ Epic 1: Locked | ⚡ Epic 2: Real-time Pulse Syncing</p>
        </div>
      </header>
    </div>
  );
}

export default App;
