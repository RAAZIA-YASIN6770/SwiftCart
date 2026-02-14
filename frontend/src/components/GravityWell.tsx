import React from 'react';
import './GravityWell.css';

const GravityWell: React.FC = () => {
    return (
        <div className="gravity-well-container">
            <div className="gravity-well-core" />
            <div className="gravity-well-pulse" />
            <div className="gravity-well-pulse secondary" />
        </div>
    );
};

export default GravityWell;
