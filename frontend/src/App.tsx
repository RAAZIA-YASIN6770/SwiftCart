import { useEffect } from 'react';
import { useWebSocketHealthCheck } from './hooks/useWebSocketHealthCheck';
import './App.css';

function App() {
  const { isConnected, latency, sendPing, lastMessage } = useWebSocketHealthCheck(
    'ws://localhost:8000/ws/health/'
  );

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
          <h3>Story 1.1: Project Manifold Initialization</h3>
          <p>✅ Frontend: Vite + React + TypeScript</p>
          <p>✅ Backend: Django + Channels + Redis</p>
          <p>✅ Physics Worker: Matter.js (Off-Main-Thread)</p>
          <p>✅ WebSocket: Real-Time Ping-Pong</p>
        </div>
      </header>
    </div>
  );
}

export default App;
