import React, { useState } from 'react';
import './CelestialAdmin.css';

const CelestialAdmin: React.FC = () => {
    const [gravity, setGravity] = useState(0.5);
    const [baseMass, setBaseMass] = useState(1.0);
    const [isPropagating, setIsPropagating] = useState(false);
    const [lastAction, setLastAction] = useState<string | null>(null);

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

            <div className="admin-panel">
                <div className="panel-header">
                    <div className="crown-icon">👑</div>
                    <h1>Celestial Operations</h1>
                    <span className="status-badge">GOD MODE ACTIVE</span>
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
