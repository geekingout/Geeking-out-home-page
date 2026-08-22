import React, { useEffect, useRef } from 'react';

/**
 * The cinematic background: layered fog glows, a canvas of drifting dust motes with a touch of
 * mouse parallax, film grain and a vignette. Fixed behind all content. Motes render a single
 * static frame when the user prefers reduced motion.
 */
export const Atmosphere: React.FC = () => {
    const ref = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = ref.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const dpr = Math.min(2, window.devicePixelRatio || 1);

        type Mote = { x: number; y: number; r: number; a: number; vy: number; sway: number; phase: number; gold: boolean; depth: number };
        let motes: Mote[] = [];
        let raf = 0;
        let w = 0, h = 0;
        let mx = 0, my = 0;          // mouse offset, -1..1
        let px = 0, py = 0;          // eased parallax

        const seed = () => {
            w = window.innerWidth; h = window.innerHeight;
            canvas.width = Math.floor(w * dpr); canvas.height = Math.floor(h * dpr);
            canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            const count = Math.min(140, Math.floor((w * h) / 14000));
            motes = Array.from({ length: count }, () => {
                const depth = Math.random();
                return {
                    x: Math.random() * w, y: Math.random() * h,
                    r: 0.6 + depth * 1.6,
                    a: 0.12 + Math.random() * 0.45,
                    vy: 0.08 + depth * 0.22,
                    sway: 0.2 + Math.random() * 0.5,
                    phase: Math.random() * Math.PI * 2,
                    gold: Math.random() < 0.18,
                    depth,
                };
            });
        };

        const draw = (t: number) => {
            ctx.clearRect(0, 0, w, h);
            for (const m of motes) {
                const sx = m.x + Math.sin(t / 1800 * m.sway + m.phase) * 14 + px * 18 * m.depth;
                const sy = m.y + py * 12 * m.depth;
                const tw = 0.7 + 0.3 * Math.sin(t / 900 + m.phase);
                ctx.globalAlpha = m.a * tw;
                ctx.fillStyle = m.gold ? '#f5d324' : m.depth > 0.6 ? '#e9e4ff' : '#b8aeff';
                ctx.beginPath();
                ctx.arc(sx, sy, m.r, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;
        };

        let last = 0;
        const frame = (t: number) => {
            const dt = Math.min(50, t - last); last = t;
            px += (mx - px) * 0.03; py += (my - py) * 0.03;
            for (const m of motes) {
                m.y -= m.vy * (dt / 16);
                if (m.y < -10) { m.y = h + 10; m.x = Math.random() * w; }
            }
            draw(t);
            raf = requestAnimationFrame(frame);
        };

        seed();
        if (reduced) { draw(0); }
        else { raf = requestAnimationFrame(frame); }

        const onResize = () => { seed(); draw(last); };
        const onMouse = (e: MouseEvent) => { mx = (e.clientX / w) * 2 - 1; my = (e.clientY / h) * 2 - 1; };
        const onVis = () => {
            if (reduced) return;
            if (document.hidden) cancelAnimationFrame(raf);
            else { last = performance.now(); raf = requestAnimationFrame(frame); }
        };
        window.addEventListener('resize', onResize);
        window.addEventListener('mousemove', onMouse, { passive: true });
        document.addEventListener('visibilitychange', onVis);
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('resize', onResize);
            window.removeEventListener('mousemove', onMouse);
            document.removeEventListener('visibilitychange', onVis);
        };
    }, []);

    return (
        <>
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
                {/* base gradient: slightly lighter at the horizon, darker at the top */}
                <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #07070f 0%, #0a0a18 55%, #0d0b22 100%)' }} />
                {/* fog glows */}
                <div className="fog animate-drift" style={{ width: '70vw', height: '70vw', left: '-15vw', top: '35vh', background: 'radial-gradient(circle, rgba(95,46,234,0.28) 0%, rgba(95,46,234,0) 65%)' }} />
                <div className="fog animate-drift-2" style={{ width: '60vw', height: '60vw', right: '-20vw', top: '-10vh', background: 'radial-gradient(circle, rgba(77,225,255,0.12) 0%, rgba(77,225,255,0) 65%)' }} />
                <div className="fog animate-drift" style={{ width: '50vw', height: '50vw', left: '30vw', bottom: '-25vh', background: 'radial-gradient(circle, rgba(245,211,36,0.10) 0%, rgba(245,211,36,0) 65%)', animationDelay: '-20s' }} />
                {/* horizon line */}
                <div className="absolute left-0 right-0 top-[62vh] rule" style={{ opacity: 0.5 }} />
                <canvas ref={ref} className="absolute inset-0" />
            </div>
            <div className="vignette" aria-hidden="true" />
            <div className="grain" aria-hidden="true" />
        </>
    );
};
