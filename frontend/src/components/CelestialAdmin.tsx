import React, { useState, useEffect } from 'react';
import { usePhysicsStore } from '../store/physicsStore';
import './CelestialAdmin.css';

interface HeatmapItem {
    id: string;
    hits: number;
}

const TurbulenceMonitor: React.FC<{ data: HeatmapItem[] }> = ({ data }) => {
    const maxHits = Math.max(...data.map(d => d.hits), 1);

    return (
        <div className="turbulence-monitor">
            <div className="monitor-header">TURBULENCE MONITOR</div>
            <div className="chart-container">
                {data.map((item) => (
                    <div key={item.id} className="chart-bar-group">
                        <div className="bar-label">{item.id.split('_')[1] || item.id.slice(0, 4)}</div>
                        <div className="bar-wrapper">
                            <svg width="100%" height="20">
                                <rect
                                    x="0" y="5"
                                    width={`${(item.hits / maxHits) * 100}%`}
                                    height="10"
                                    className="bar-rect"
                                />
                            </svg>
                        </div>
                        <div className="bar-value">{item.hits}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const CelestialAdmin: React.FC = () => {
    const [gravity, setGravity] = useState(0.5);
    const [baseMass, setBaseMass] = useState(1.0);
    const [isPropagating, setIsPropagating] = useState(false);
    const [lastAction, setLastAction] = useState<string | null>(null);

    // Story 6.2 Metrics
    const [heatmap, setHeatmap] = useState<HeatmapItem[]>([]);
    const [latency, setLatency] = useState(0);
    const [alerts, setAlerts] = useState<string[]>([]);

    const bodies = usePhysicsStore((state) => state.bodies);

    // [STORY 6.2] Stock Implosion Alerts (The Singularity)
    useEffect(() => {
        const outOfStock = Object.values(bodies).find(b => b.stock === 0);
        if (outOfStock) {
            const alertMsg = `SINGULARITY DETECTED: ${outOfStock.productId} has imploded (Stock 0)`;
            if (!alerts.includes(alertMsg)) {
                setAlerts(prev => [alertMsg, ...prev].slice(0, 3));
            }
        }
    }, [bodies, alerts]);

    // [STORY 6.2] Metrics Polling (Performance Isolated)
    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/physics/celestial/metrics/');
                const data = await response.json();
                setHeatmap(data.heatmap);
                setLatency(data.latency);
            } catch (err) {
                console.error("Metrics isolation failed:", err);
            }
        };

        const interval = setInterval(fetchMetrics, 2000);
        return () => clearInterval(interval);
    }, []);

    const CELESTIAL_TOKEN = "CELESTIAL_ADMIN_2026";


    const updatePhysics = async (payload: any) => {
        setIsPropagating(true);
        try {
            const response = await fetch('http://localhost:8000/api/physics/celestial/control/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Celestial-Token': CELESTIAL_TOKEN
                },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            setLastAction(data.status || data.error);
        } catch (err) {
            setLastAction('Propagation Failed: Network Error');
        } finally {
            setIsPropagating(false);
            setTimeout(() => setLastAction(null), 3000);
        }
    };

    const handleGravityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value);
        setGravity(val);
        updatePhysics({ gravity_coefficient: val });
    };

    const handleMassChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value);
        setBaseMass(val);
        updatePhysics({ base_mass: val });
    };

    const handleForcePulse = () => {
        // Pulse the first available product in the demo
        updatePhysics({ force_pulse: true, product_id: 'pro_001_nebula' });
    };

    return (
        <div className="celestial-admin-container">
            <div className="celestial-overlay" />

            {alerts.length > 0 && (
                <div className="alerts-dock">
                    {alerts.map((alert, i) => (
                        <div key={i} className="critical-alert">
                            <div className="alert-pulse" />
                            {alert}
                        </div>
                    ))}
                </div>
            )}

            <div className="admin-panel">
                <div className="panel-header">
                    <div className="crown-icon">👑</div>
                    <h1>Mission Control</h1>
                    <span className="status-badge">CELESTIAL MONITOR ACTIVE</span>
                </div>

                <TurbulenceMonitor data={heatmap} />

                <div className="latency-monitor">
                    <span>Decay Pulse Latency:</span>
                    <span className="latency-value">{latency.toFixed(1)}ms</span>
                </div>

                <div className="control-group">
                    <div className="control-label">
                        <span>GLOBAL GRAVITY</span>
                        <span className="value">{gravity.toFixed(2)}G</span>
                    </div>
                    <input
                        type="range"
                        min="0.01"
                        max="2.0"
                        step="0.01"
                        value={gravity}
                        onChange={handleGravityChange}
                        className="celestial-slider"
                    />
                    <div className="slider-hints">
                        <span>ZERO-G</span>
                        <span>SINGULARITY</span>
                    </div>
                </div>

                <div className="control-group">
                    <div className="control-label">
                        <span>BASE PRODUCT MASS</span>
                        <span className="value">{baseMass.toFixed(1)}kg</span>
                    </div>
                    <input
                        type="range"
                        min="0.5"
                        max="10.0"
                        step="0.5"
                        value={baseMass}
                        onChange={handleMassChange}
                        className="celestial-slider mass-slider"
                    />
                    <div className="slider-hints">
                        <span>ETHEREAL</span>
                        <span>DENSE</span>
                    </div>
                </div>

                <div className="actions-group">
                    <button
                        className="pulse-button"
                        onClick={handleForcePulse}
                        disabled={isPropagating}
                    >
                        <div className="pulse-ring" />
                        INITIATE FORCE PULSE
                    </button>
                    <p className="description">
                        Temporarily triples mass and glow of Nebula Orb for all users.
                    </p>
                </div>

                {lastAction && (
                    <div className="debug-log">
                        <span className="cursor">&gt;</span> {lastAction}
                    </div>
                )}
            </div>

            <div className="nebula-bg" />
        </div>
    );
};

export default CelestialAdmin;
