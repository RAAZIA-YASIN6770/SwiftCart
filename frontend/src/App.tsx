import { useEffect } from 'react';
import { useWebSocketHealthCheck } from './hooks/useWebSocketHealthCheck';
import { usePhysicsWorker } from './hooks/usePhysicsWorker';
import GravityTest from './components/GravityTest';
import './App.css';

function App() {
  const { isConnected, latency, sendPing, lastMessage } = useWebSocketHealthCheck(
    'ws://localhost:8000/ws/health/'
  );

  // Initialize Physics Worker
  usePhysicsWorker();

  // Send ping every 2 seconds
  useEffect(() => {
    if (isConnected) {
      const interval = setInterval(() => {
        sendPing();
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isConnected, sendPing]);

  return (
    <div className="App">
      <header className="App-header">
        <h1>🚀 SwiftCart - Anti-Gravity E-Commerce</h1>

        <div className="story-section">
          <h2>Story 1.2: The Off-Main-Thread Brain</h2>
          <p>Physics Engine running in Web Worker at 60 FPS</p>
          <GravityTest />
        </div>

        <div className="health-check">
          <h2>Real-Time Pulse Health Check</h2>

          <div className="status-indicator">
            <div className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`} />
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>

          {latency !== null && (
            <div className="latency-display">
              <strong>Latency:</strong> {latency}ms
              {latency < 10 && <span className="success"> ✓ Sub-10ms Target Met!</span>}
            </div>
          )}

          {lastMessage && (
            <div className="last-message">
              <strong>Last Message:</strong>
              <pre>{JSON.stringify(lastMessage, null, 2)}</pre>
            </div>
          )}

          <button onClick={sendPing} disabled={!isConnected}>
            Send Ping
          </button>
        </div>

        <div className="info">
          <h3>Implementation Progress</h3>
          <p>✅ Story 1.1: Project Manifold Initialization</p>
          <p>⏳ Story 1.2: Physics Engine Core (Verification In Progress)</p>
        </div>
      </header>
    </div>
  );
}

export default App;
