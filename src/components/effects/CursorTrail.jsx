import React, { useEffect, useRef, useCallback } from 'react';
import './CursorTrail.css';

/**
 * BeaconCursor — a smooth, canvas-based beacon cursor effect.
 * 
 *  • Inner dot: small, opaque circle centered on the cursor
 *  • Outer ring: large circle that "lags" behind the cursor with a lerp
 *  • Ripple pulses: periodic expanding + fading rings emitted from cursor position
 *  • Completely CSS-free animation (all canvas, no DOM particles)
 *  • Single instance rendered at App root — templates must NOT render this
 */
const CursorTrail = () => {
    const canvasRef = useRef(null);
    const mouse = useRef({ x: -999, y: -999 });
    const ring = useRef({ x: -999, y: -999 });
    const ripples = useRef([]);
    const rafRef = useRef(null);
    const lastRippleTime = useRef(0);

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        // Resize canvas to viewport
        if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const mx = mouse.current.x;
        const my = mouse.current.y;

        // ── Lerp outer ring towards mouse ──
        const lerpFactor = 0.12;
        ring.current.x += (mx - ring.current.x) * lerpFactor;
        ring.current.y += (my - ring.current.y) * lerpFactor;

        const rx = ring.current.x;
        const ry = ring.current.y;

        // ── Emit a ripple periodically ──
        const now = Date.now();
        if (now - lastRippleTime.current > 600) {
            ripples.current.push({ x: mx, y: my, r: 0, alpha: 0.6, born: now });
            lastRippleTime.current = now;
        }

        // ── Draw ripples (expanding + fading rings) ──
        ripples.current = ripples.current.filter(rp => {
            const age = (now - rp.born) / 1000; // seconds
            if (age > 1.2) return false;

            const progress = age / 1.2;
            const radius = 20 + progress * 60;
            const alpha = (1 - progress) * 0.45;

            ctx.beginPath();
            ctx.arc(rp.x, rp.y, radius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();

            return true;
        });

        // ── Outer ring (large, lagging circle) ──
        const outerRadius = 28;
        const distX = mx - rx;
        const distY = my - ry;
        const dist = Math.sqrt(distX * distX + distY * distY);
        const squishScale = Math.max(0.7, 1 - dist * 0.004);

        ctx.save();
        ctx.translate(rx, ry);
        ctx.scale(squishScale, 1 / squishScale);

        // Gradient stroke for the outer ring
        const grad = ctx.createRadialGradient(0, 0, outerRadius - 4, 0, 0, outerRadius + 4);
        grad.addColorStop(0, 'rgba(99, 102, 241, 0.7)');
        grad.addColorStop(0.5, 'rgba(139, 92, 246, 0.5)');
        grad.addColorStop(1, 'rgba(99, 102, 241, 0)');

        ctx.beginPath();
        ctx.arc(0, 0, outerRadius, 0, Math.PI * 2);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();

        // ── Inner glow backdrop (soft fill) ──
        const glow = ctx.createRadialGradient(mx, my, 0, mx, my, 18);
        glow.addColorStop(0, 'rgba(139, 92, 246, 0.18)');
        glow.addColorStop(1, 'rgba(99, 102, 241, 0)');
        ctx.beginPath();
        ctx.arc(mx, my, 18, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        // ── Inner dot (sharp center) ──
        ctx.beginPath();
        ctx.arc(mx, my, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.shadowColor = 'rgba(139, 92, 246, 0.9)';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;

        rafRef.current = requestAnimationFrame(draw);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const onMouseMove = (e) => {
            mouse.current.x = e.clientX;
            mouse.current.y = e.clientY;
        };

        const onResize = () => {
            if (canvasRef.current) {
                canvasRef.current.width = window.innerWidth;
                canvasRef.current.height = window.innerHeight;
            }
        };

        window.addEventListener('mousemove', onMouseMove, { passive: true });
        window.addEventListener('resize', onResize, { passive: true });

        rafRef.current = requestAnimationFrame(draw);

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('resize', onResize);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [draw]);

    return <canvas ref={canvasRef} className="beacon-cursor-canvas" />;
};

export default CursorTrail;
