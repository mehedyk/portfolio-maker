import React, { useEffect, useRef, useCallback } from 'react';
import './CursorTrail.css';

/**
 * BeaconCursor — smooth canvas-based cursor effect.
 * Fixes applied:
 *  - aria-hidden="true" so screen readers skip the canvas
 *  - RAF pauses when document is hidden (Page Visibility API) to save CPU
 *  - Mouse tracking only starts after first mousemove (no default 0,0 artifact)
 */
const CursorTrail = () => {
    const canvasRef = useRef(null);
    const mouse = useRef({ x: -999, y: -999 });
    const ring = useRef({ x: -999, y: -999 });
    const ripples = useRef([]);
    const rafRef = useRef(null);
    const lastRippleTime = useRef(0);
    const isVisible = useRef(!document.hidden);

    const draw = useCallback(() => {
        if (!isVisible.current) {
            rafRef.current = requestAnimationFrame(draw);
            return;
        }

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const mx = mouse.current.x;
        const my = mouse.current.y;

        // If mouse hasn't moved yet, don't draw anything
        if (mx === -999) {
            rafRef.current = requestAnimationFrame(draw);
            return;
        }

        const lerpFactor = 0.12;
        ring.current.x += (mx - ring.current.x) * lerpFactor;
        ring.current.y += (my - ring.current.y) * lerpFactor;

        const rx = ring.current.x;
        const ry = ring.current.y;

        const now = Date.now();
        if (now - lastRippleTime.current > 600) {
            ripples.current.push({ x: mx, y: my, r: 0, alpha: 0.6, born: now });
            lastRippleTime.current = now;
        }

        ripples.current = ripples.current.filter(rp => {
            const age = (now - rp.born) / 1000;
            if (age > 1.2) return false;

            const progress = age / 1.2;
            const radius = 20 + progress * 60;
            const alpha = (1 - progress) * 0.45;

            ctx.beginPath();
            ctx.arc(rp.x, rp.y, radius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(67, 56, 202, ${alpha})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();

            return true;
        });

        const outerRadius = 28;
        const distX = mx - rx;
        const distY = my - ry;
        const dist = Math.sqrt(distX * distX + distY * distY);
        const squishScale = Math.max(0.7, 1 - dist * 0.004);

        ctx.save();
        ctx.translate(rx, ry);
        ctx.scale(squishScale, 1 / squishScale);

        const grad = ctx.createRadialGradient(0, 0, outerRadius - 4, 0, 0, outerRadius + 4);
        grad.addColorStop(0, 'rgba(67, 56, 202, 0.85)');
        grad.addColorStop(0.5, 'rgba(109, 40, 217, 0.6)');
        grad.addColorStop(1, 'rgba(67, 56, 202, 0)');

        ctx.beginPath();
        ctx.arc(0, 0, outerRadius, 0, Math.PI * 2);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();

        const glow = ctx.createRadialGradient(mx, my, 0, mx, my, 18);
        glow.addColorStop(0, 'rgba(67, 56, 202, 0.15)');
        glow.addColorStop(1, 'rgba(67, 56, 202, 0)');
        ctx.beginPath();
        ctx.arc(mx, my, 18, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(mx, my, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#312e81';
        ctx.shadowColor = 'rgba(109, 40, 217, 0.8)';
        ctx.shadowBlur = 10;
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

        const onVisibilityChange = () => {
            isVisible.current = !document.hidden;
        };

        window.addEventListener('mousemove', onMouseMove, { passive: true });
        window.addEventListener('resize', onResize, { passive: true });
        document.addEventListener('visibilitychange', onVisibilityChange);

        rafRef.current = requestAnimationFrame(draw);

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('resize', onResize);
            document.removeEventListener('visibilitychange', onVisibilityChange);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [draw]);

    return (
        <canvas
            ref={canvasRef}
            className="beacon-cursor-canvas"
            aria-hidden="true"
            role="presentation"
        />
    );
};

export default CursorTrail;
