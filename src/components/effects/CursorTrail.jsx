import React, { useEffect, useState, useCallback } from 'react';
import './CursorTrail.css';

const CursorTrail = () => {
    const [particles, setParticles] = useState([]);

    const handleMouseMove = useCallback((e) => {
        const newParticle = {
            x: e.clientX,
            y: e.clientY,
            id: Date.now() + Math.random(),
            timestamp: Date.now()
        };

        setParticles(prev => {
            // Keep only last 15 particles for performance
            const filtered = prev.filter(p => Date.now() - p.timestamp < 1000);
            return [...filtered, newParticle].slice(-15);
        });
    }, []);

    useEffect(() => {
        // Throttle mousemove events for better performance
        let rafId;
        let lastTime = 0;
        const throttleDelay = 30; // ms

        const throttledMove = (e) => {
            const now = Date.now();
            if (now - lastTime >= throttleDelay) {
                lastTime = now;
                handleMouseMove(e);
            }
        };

        window.addEventListener('mousemove', throttledMove);

        // Cleanup old particles periodically
        const cleanupInterval = setInterval(() => {
            setParticles(prev => prev.filter(p => Date.now() - p.timestamp < 1000));
        }, 500);

        return () => {
            window.removeEventListener('mousemove', throttledMove);
            clearInterval(cleanupInterval);
            if (rafId) cancelAnimationFrame(rafId);
        };
    }, [handleMouseMove]);

    return (
        <div className="cursor-trail-container">
            {particles.map((particle, index) => {
                const age = Date.now() - particle.timestamp;
                const opacity = Math.max(0, 1 - age / 1000);
                const scale = 1 - age / 1000;

                return (
                    <div
                        key={particle.id}
                        className="trail-particle"
                        style={{
                            left: `${particle.x}px`,
                            top: `${particle.y}px`,
                            opacity: opacity,
                            transform: `translate(-50%, -50%) scale(${scale})`
                        }}
                    />
                );
            })}
        </div>
    );
};

export default CursorTrail;
