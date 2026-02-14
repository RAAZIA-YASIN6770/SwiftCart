import React from 'react';
import { useGestures } from '../hooks/useGestures';

interface FlickableOrbProps {
    id: number;
    position: { x: number; y: number };
    radius: number;
    angle: number;
    isDragging: boolean;
    onDragStart: (id: number) => void;
    onDrag: (id: number, pos: { x: number; y: number }) => void;
    onFlick: (id: number, velocity: { x: number; y: number }) => void;
}

const FlickableOrb: React.FC<FlickableOrbProps> = ({
    id,
    position,
    radius,
    angle,
    isDragging,
    onDragStart,
    onDrag,
    onFlick
}) => {
    const { bindGesture } = useGestures({
        onDragStart,
        onDrag,
        onFlick
    });

    return (
        <div
            {...bindGesture(id)}
            style={{
                position: 'absolute',
                left: `${position.x}px`,
                top: `${position.y}px`,
                width: `${radius * 2}px`,
                height: `${radius * 2}px`,
                backgroundColor: isDragging ? '#00ffff' : '#00aaff',
                borderRadius: '50%',
                transform: `translate(-50%, -50%) rotate(${angle}rad)`,
                boxShadow: isDragging
                    ? '0 0 20px rgba(0, 255, 255, 0.8)'
                    : '0 3px 10px rgba(0, 170, 255, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                zIndex: isDragging ? 20 : 5,
                transition: isDragging ? 'none' : 'background-color 0.2s, box-shadow 0.2s',
                pointerEvents: 'auto'
            }}
        />
    );
};

export default FlickableOrb;
