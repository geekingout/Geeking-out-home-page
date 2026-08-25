/* ------------------------------------------------------------------ *
 *  The arcade
 *
 *  Four cabinets — Snake, Breakout, Asteroids, Invaders — drawn with canvas 2D
 *  primitives. No engine, no sprite sheets, no extra dependency: the point of a
 *  page like this on an engineering shop's site is that it is obviously hand
 *  written, and a 40 kB game library would say the opposite.
 *
 *  It follows the site's look rather than the era's. The screen is dark because
 *  an arcade monitor is a dark room with light drawn on it, but everything on it
 *  is neon vector stroke in the brand palette — no pixel art, no chunky sprites,
 *  no CRT costume.
 *
 *  Why its own module: it shares nothing with the marketing pages but the
 *  stylesheet, and 900 lines of game loop inside App.tsx would bury the site in
 *  the file that describes it. Nothing here imports App.tsx, so the dependency
 *  only ever runs one way.
 *
 *  Why not simply arcade.tsx: `vite dev` resolves a bare request for /arcade
 *  against the project root before it reaches the SPA fallback, so a module of
 *  that name is served as JavaScript and the route never renders. The built site
 *  is unaffected — it has a real dist/arcade/index.html — which is exactly what
 *  makes the collision worth naming here rather than rediscovering.
 *
 *  Two rules keep the page cheap and predictable:
 *    - Nothing runs until you press Play. Arriving costs four idle canvases.
 *    - Only one cabinet runs at a time. They all read the same arrow keys, and
 *      two games fighting over them is not a feature.
 * ------------------------------------------------------------------ */

import React, { useEffect, useRef, useState } from 'react';

/** The playfield every game draws into: 4:3, the shape of the machines being copied. */
const W = 480;
const H = 360;

const PURPLE = '#5F2EEA';
const VIOLET = '#8B5CF6';
const LIME = '#A3F953';
const YELLOW = '#F5D324';
const RED = '#FF4B4B';
const WHITE = '#F8F8F8';

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

/* ---------- Input ------------------------------------------------- *
 *  Held as a live set rather than read as events, because a frame asks "is left
 *  down?", not "was left pressed?". The on-screen pad writes into the same set,
 *  so a thumb and a keyboard are the same thing to every game below.
 * ------------------------------------------------------------------ */

type KeySet = { current: Set<string> };

const GAME_KEYS = new Set([
    'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
    'KeyA', 'KeyD', 'KeyW', 'KeyS', 'Space',
]);

const useKeyboard = (active: boolean): KeySet => {
    const keys = useRef(new Set<string>());

    useEffect(() => {
        keys.current.clear();
        if (!active) return;

        const typing = (target: EventTarget | null) =>
            target instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName);

        const down = (e: KeyboardEvent) => {
            if (!GAME_KEYS.has(e.code) || typing(e.target)) return;
            // Arrows and space scroll the page. While a cabinet is running they belong to it.
            e.preventDefault();
            keys.current.add(e.code);
        };
        const up = (e: KeyboardEvent) => keys.current.delete(e.code);
        // Alt-tabbing away with a key held would otherwise leave it held forever.
        const drop = () => keys.current.clear();

        window.addEventListener('keydown', down, { passive: false });
        window.addEventListener('keyup', up);
        window.addEventListener('blur', drop);
        return () => {
            window.removeEventListener('keydown', down);
            window.removeEventListener('keyup', up);
            window.removeEventListener('blur', drop);
        };
    }, [active]);

    return keys;
};

const held = (keys: KeySet, ...codes: string[]) => codes.some(code => keys.current.has(code));

/* ---------- Frame loop -------------------------------------------- */

const useFrames = (running: boolean, step: (dt: number) => void) => {
    const latest = useRef(step);
    useEffect(() => { latest.current = step; });

    useEffect(() => {
        if (!running) return;
        let frame = 0;
        let previous = performance.now();
        const tick = (now: number) => {
            frame = requestAnimationFrame(tick);
            // A background tab stops firing rAF altogether. The clamp is what stops the
            // first frame back from advancing the world by however long you were away.
            const dt = Math.min((now - previous) / 1000, 0.05);
            previous = now;
            latest.current(dt);
        };
        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, [running]);
};

/* ---------- Stage -------------------------------------------------- *
 *  Games draw in W x H units and never think about pixels. The context is scaled
 *  once per resize so a phone and a desktop run the identical arithmetic.
 * ------------------------------------------------------------------- */

const useStage = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    // Bumped on every resize, so an idle cabinet knows to repaint its still frame.
    const [fitted, setFitted] = useState(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const fit = () => {
            const width = canvas.clientWidth;
            if (!width) return;
            // Two device pixels per CSS pixel is where the glow stops looking any
            // smoother and the fill rate starts to matter on a phone.
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const backing = Math.round(width * dpr);
            if (canvas.width === backing) return;
            canvas.width = backing;
            canvas.height = Math.round((backing * H) / W);
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            ctx.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0);
            ctxRef.current = ctx;
            setFitted(n => n + 1);
        };

        fit();
        const observer = new ResizeObserver(fit);
        observer.observe(canvas);
        return () => observer.disconnect();
    }, []);

    return { canvasRef, ctxRef, fitted };
};

/* ---------- Drawing ----------------------------------------------- */

const wipe = (ctx: CanvasRenderingContext2D) => ctx.clearRect(0, 0, W, H);

/** Neon is just a shape painted with its own colour as the shadow. */
const lit = (ctx: CanvasRenderingContext2D, colour: string, blur: number, paint: () => void) => {
    ctx.save();
    ctx.shadowColor = colour;
    ctx.shadowBlur = blur;
    ctx.fillStyle = colour;
    ctx.strokeStyle = colour;
    paint();
    ctx.restore();
};

const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
    const radius = Math.max(0, Math.min(r, w / 2, h / 2));
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
};

const disc = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number) => {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
};

/** The in-screen HUD: lives on the left, wave on the right, deliberately quiet. */
const hud = (ctx: CanvasRenderingContext2D, left: string, right: string) => {
    ctx.save();
    ctx.font = '700 11px Poppins, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.42)';
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    ctx.fillText(left, 12, 11);
    ctx.textAlign = 'right';
    ctx.fillText(right, W - 12, 11);
    ctx.restore();
};

/* ------------------------------------------------------------------ *
 *  1. Snake — Blockade, 1976
 * ------------------------------------------------------------------ */

const CELL = 20;
const COLS = W / CELL;
const ROWS = H / CELL;

type Cell = { x: number; y: number };

type SnakeState = {
    body: Cell[];
    dir: Cell;
    turns: Cell[];
    food: Cell;
    clock: number;
    rate: number;
    score: number;
    over: boolean;
};

const placeFood = (body: Cell[]): Cell => {
    // A 24x18 board never fills up enough for rejection sampling to be the slow way,
    // and the alternative — rebuilding the free list every meal — is the slow way.
    for (let attempt = 0; attempt < 400; attempt++) {
        const spot = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
        if (!body.some(part => part.x === spot.x && part.y === spot.y)) return spot;
    }
    return { x: 0, y: 0 };
};

const freshSnake = (): SnakeState => {
    const body = [{ x: 8, y: 9 }, { x: 7, y: 9 }, { x: 6, y: 9 }];
    return { body, dir: { x: 1, y: 0 }, turns: [], food: placeFood(body), clock: 0, rate: 7.5, score: 0, over: false };
};

const stepSnake = (s: SnakeState) => {
    const turn = s.turns.shift();
    if (turn) s.dir = turn;

    const head = { x: s.body[0].x + s.dir.x, y: s.body[0].y + s.dir.y };
    if (head.x < 0 || head.y < 0 || head.x >= COLS || head.y >= ROWS) { s.over = true; return; }
    // The last segment vacates its cell on this same step, so following your own tail is legal.
    if (s.body.some((part, i) => i < s.body.length - 1 && part.x === head.x && part.y === head.y)) {
        s.over = true;
        return;
    }

    s.body.unshift(head);
    if (head.x === s.food.x && head.y === s.food.y) {
        s.score += 10;
        s.rate = Math.min(15, s.rate + 0.35);
        s.food = placeFood(s.body);
    } else {
        s.body.pop();
    }
};

const Snake: React.FC<GameProps> = ({ running, runId, keys, onScore, onEnd }) => {
    const { canvasRef, ctxRef, fitted } = useStage();
    const game = useRef<SnakeState>(freshSnake());

    const draw = () => {
        const ctx = ctxRef.current;
        if (!ctx) return;
        const s = game.current;
        wipe(ctx);

        ctx.save();
        ctx.strokeStyle = 'rgba(255,255,255,0.045)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = CELL; x < W; x += CELL) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
        for (let y = CELL; y < H; y += CELL) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
        ctx.stroke();
        ctx.restore();

        lit(ctx, PURPLE, 20, () => {
            disc(ctx, s.food.x * CELL + CELL / 2, s.food.y * CELL + CELL / 2, CELL * 0.3);
            ctx.fill();
        });

        // Brightest at the head, thinning down the tail, so the direction of travel is
        // readable without watching it move.
        s.body.forEach((part, i) => {
            const back = i / Math.max(1, s.body.length - 1);
            const inset = 2 + back * 2;
            ctx.save();
            if (i === 0) { ctx.shadowColor = LIME; ctx.shadowBlur = 16; }
            ctx.fillStyle = i === 0 ? LIME : `rgba(163, 249, 83, ${0.9 - back * 0.55})`;
            roundRect(ctx, part.x * CELL + inset, part.y * CELL + inset, CELL - inset * 2, CELL - inset * 2, 5);
            ctx.fill();
            ctx.restore();
        });

        hud(ctx, `LENGTH ${s.body.length}`, `SPEED ${s.rate.toFixed(1)}`);
    };

    useEffect(() => { game.current = freshSnake(); draw(); }, [runId, fitted]);

    useFrames(running, dt => {
        const s = game.current;
        if (s.over) return;
        const was = s.score;

        // Turns are queued, not applied straight to `dir`: two keys inside one step would
        // otherwise let the snake reverse through its own neck.
        const facing = s.turns.length ? s.turns[s.turns.length - 1] : s.dir;
        const want =
            held(keys, 'ArrowLeft', 'KeyA') ? { x: -1, y: 0 } :
            held(keys, 'ArrowRight', 'KeyD') ? { x: 1, y: 0 } :
            held(keys, 'ArrowUp', 'KeyW') ? { x: 0, y: -1 } :
            held(keys, 'ArrowDown', 'KeyS') ? { x: 0, y: 1 } : null;
        const straightOn = want && want.x === facing.x && want.y === facing.y;
        const reversing = want && want.x === -facing.x && want.y === -facing.y;
        if (want && !straightOn && !reversing && s.turns.length < 2) s.turns.push(want);

        const interval = 1 / s.rate;
        s.clock += dt;
        while (s.clock >= interval && !s.over) {
            s.clock -= interval;
            stepSnake(s);
        }

        draw();
        if (s.score !== was) onScore(s.score);
        if (s.over) onEnd();
    });

    return <canvas ref={canvasRef} className="block w-full h-full touch-pan-y" />;
};

/* ------------------------------------------------------------------ *
 *  2. Breakout — Atari, 1976
 * ------------------------------------------------------------------ */

const PADDLE_W = 74;
const PADDLE_H = 9;
const PADDLE_Y = H - 28;
const BALL_R = 5;
const BRICK_ROWS = 5;
const BRICK_COLS = 9;
const BRICK_COLOURS = [RED, YELLOW, LIME, VIOLET, PURPLE];
const BRICK_POINTS = [50, 40, 30, 20, 10];

type Brick = { x: number; y: number; w: number; h: number; colour: string; points: number; alive: boolean };

type BreakState = {
    paddle: number;
    ball: { x: number; y: number; vx: number; vy: number };
    bricks: Brick[];
    serving: number;
    lives: number;
    level: number;
    score: number;
    over: boolean;
};

const buildBricks = (): Brick[] => {
    const margin = 26, gap = 6, top = 56, h = 14;
    const w = (W - margin * 2 - gap * (BRICK_COLS - 1)) / BRICK_COLS;
    const bricks: Brick[] = [];
    for (let row = 0; row < BRICK_ROWS; row++) {
        for (let col = 0; col < BRICK_COLS; col++) {
            bricks.push({
                x: margin + col * (w + gap),
                y: top + row * (h + gap),
                w, h,
                colour: BRICK_COLOURS[row],
                points: BRICK_POINTS[row],
                alive: true,
            });
        }
    }
    return bricks;
};

const freshBreak = (): BreakState => ({
    paddle: W / 2,
    ball: { x: W / 2, y: PADDLE_Y - BALL_R - 1, vx: 0, vy: 0 },
    bricks: buildBricks(),
    serving: 0.9,
    lives: 3,
    level: 1,
    score: 0,
    over: false,
});

/** One integration step. Called several times per frame so a fast ball cannot tunnel. */
const moveBall = (s: BreakState, dt: number) => {
    const ball = s.ball;
    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;

    if (ball.x < BALL_R) { ball.x = BALL_R; ball.vx = Math.abs(ball.vx); }
    if (ball.x > W - BALL_R) { ball.x = W - BALL_R; ball.vx = -Math.abs(ball.vx); }
    if (ball.y < BALL_R + 4) { ball.y = BALL_R + 4; ball.vy = Math.abs(ball.vy); }

    const onPaddle =
        ball.vy > 0 &&
        ball.y + BALL_R >= PADDLE_Y &&
        ball.y - BALL_R <= PADDLE_Y + PADDLE_H &&
        Math.abs(ball.x - s.paddle) <= PADDLE_W / 2 + BALL_R;
    if (onPaddle) {
        ball.y = PADDLE_Y - BALL_R;
        // Where it lands across the paddle chooses the angle. The whole game is this line:
        // the paddle is an aiming device, not a wall.
        const offset = clamp((ball.x - s.paddle) / (PADDLE_W / 2), -1, 1);
        const angle = -Math.PI / 2 + offset * 1.05;
        const speed = Math.hypot(ball.vx, ball.vy);
        ball.vx = Math.cos(angle) * speed;
        ball.vy = Math.sin(angle) * speed;
    }

    for (const brick of s.bricks) {
        if (!brick.alive) continue;
        if (ball.x + BALL_R < brick.x || ball.x - BALL_R > brick.x + brick.w) continue;
        if (ball.y + BALL_R < brick.y || ball.y - BALL_R > brick.y + brick.h) continue;
        brick.alive = false;
        s.score += brick.points;
        // Bounce off whichever face it was least far through.
        const throughX = Math.min(ball.x + BALL_R - brick.x, brick.x + brick.w - (ball.x - BALL_R));
        const throughY = Math.min(ball.y + BALL_R - brick.y, brick.y + brick.h - (ball.y - BALL_R));
        if (throughX < throughY) ball.vx = -ball.vx; else ball.vy = -ball.vy;
        break;
    }

    if (ball.y - BALL_R > H) {
        s.lives -= 1;
        if (s.lives <= 0) { s.over = true; return; }
        s.serving = 0.9;
        ball.vx = 0;
        ball.vy = 0;
    }
};

const Breakout: React.FC<GameProps> = ({ running, runId, keys, onScore, onEnd }) => {
    const { canvasRef, ctxRef, fitted } = useStage();
    const game = useRef<BreakState>(freshBreak());
    // Desktop gets the paddle under the mouse, which is how the machine worked.
    const pointer = useRef<number | null>(null);

    const draw = () => {
        const ctx = ctxRef.current;
        if (!ctx) return;
        const s = game.current;
        wipe(ctx);

        for (const brick of s.bricks) {
            if (!brick.alive) continue;
            ctx.save();
            ctx.shadowColor = brick.colour;
            ctx.shadowBlur = 10;
            ctx.fillStyle = brick.colour;
            roundRect(ctx, brick.x, brick.y, brick.w, brick.h, 4);
            ctx.fill();
            ctx.restore();
        }

        lit(ctx, VIOLET, 18, () => {
            roundRect(ctx, s.paddle - PADDLE_W / 2, PADDLE_Y, PADDLE_W, PADDLE_H, PADDLE_H / 2);
            ctx.fill();
        });

        lit(ctx, WHITE, 16, () => {
            disc(ctx, s.ball.x, s.ball.y, BALL_R);
            ctx.fill();
        });

        hud(ctx, `BALLS ${'●'.repeat(Math.max(0, s.lives))}`, `LEVEL ${s.level}`);
    };

    useEffect(() => { game.current = freshBreak(); draw(); }, [runId, fitted]);

    useFrames(running, dt => {
        const s = game.current;
        if (s.over) return;
        const was = s.score;

        if (pointer.current !== null) s.paddle = pointer.current;
        if (held(keys, 'ArrowLeft', 'KeyA')) s.paddle -= 340 * dt;
        if (held(keys, 'ArrowRight', 'KeyD')) s.paddle += 340 * dt;
        s.paddle = clamp(s.paddle, PADDLE_W / 2, W - PADDLE_W / 2);

        if (s.serving > 0) {
            s.serving -= dt;
            s.ball.x = s.paddle;
            s.ball.y = PADDLE_Y - BALL_R - 1;
            if (s.serving <= 0) {
                const speed = 205 + s.level * 16;
                const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.7;
                s.ball.vx = Math.cos(angle) * speed;
                s.ball.vy = Math.sin(angle) * speed;
            }
        } else {
            for (let i = 0; i < 3 && !s.over; i++) moveBall(s, dt / 3);
        }

        if (!s.over && s.bricks.every(brick => !brick.alive)) {
            s.level += 1;
            s.bricks = buildBricks();
            s.serving = 1.1;
            s.ball.vx = 0;
            s.ball.vy = 0;
        }

        draw();
        if (s.score !== was) onScore(s.score);
        if (s.over) onEnd();
    });

    const track = (e: React.PointerEvent<HTMLCanvasElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        pointer.current = ((e.clientX - rect.left) / rect.width) * W;
    };

    return (
        <canvas
            ref={canvasRef}
            className="block w-full h-full touch-pan-y"
            onPointerMove={track}
            onPointerLeave={() => { pointer.current = null; }}
        />
    );
};

/* ------------------------------------------------------------------ *
 *  3. Asteroids — Atari, 1979
 * ------------------------------------------------------------------ */

type Rock = { x: number; y: number; vx: number; vy: number; r: number; a: number; spin: number; shape: number[] };
type Shot = { x: number; y: number; vx: number; vy: number; life: number };

type RockState = {
    ship: { x: number; y: number; a: number; vx: number; vy: number };
    shots: Shot[];
    rocks: Rock[];
    cool: number;
    invuln: number;
    thrusting: boolean;
    lives: number;
    wave: number;
    score: number;
    over: boolean;
};

const makeRock = (x: number, y: number, r: number): Rock => {
    const shape = Array.from({ length: 11 }, () => 0.74 + Math.random() * 0.46);
    const heading = Math.random() * Math.PI * 2;
    // Smaller rocks travel faster, which is what turns the last two into the dangerous ones.
    const speed = 18 + Math.random() * 34 + (34 - r) * 1.6;
    return { x, y, vx: Math.cos(heading) * speed, vy: Math.sin(heading) * speed, r, a: Math.random() * Math.PI * 2, spin: (Math.random() - 0.5) * 1.5, shape };
};

const spawnWave = (s: RockState) => {
    s.rocks = [];
    for (let i = 0; i < 3 + s.wave; i++) {
        let x = 0, y = 0;
        // Never on top of the ship: waking up already dead is not a difficulty curve.
        do { x = Math.random() * W; y = Math.random() * H; } while (Math.hypot(x - W / 2, y - H / 2) < 110);
        s.rocks.push(makeRock(x, y, 32));
    }
};

const freshRocks = (): RockState => {
    const s: RockState = {
        ship: { x: W / 2, y: H / 2, a: -Math.PI / 2, vx: 0, vy: 0 },
        shots: [], rocks: [], cool: 0, invuln: 1.4, thrusting: false,
        lives: 3, wave: 1, score: 0, over: false,
    };
    spawnWave(s);
    return s;
};

const wrap = (thing: { x: number; y: number }, margin: number) => {
    if (thing.x < -margin) thing.x = W + margin; else if (thing.x > W + margin) thing.x = -margin;
    if (thing.y < -margin) thing.y = H + margin; else if (thing.y > H + margin) thing.y = -margin;
};

const Asteroids: React.FC<GameProps> = ({ running, runId, keys, onScore, onEnd }) => {
    const { canvasRef, ctxRef, fitted } = useStage();
    const game = useRef<RockState>(freshRocks());

    const draw = () => {
        const ctx = ctxRef.current;
        if (!ctx) return;
        const s = game.current;
        wipe(ctx);

        for (const rock of s.rocks) {
            ctx.save();
            ctx.translate(rock.x, rock.y);
            ctx.rotate(rock.a);
            ctx.strokeStyle = 'rgba(248,248,248,0.7)';
            ctx.fillStyle = 'rgba(140,140,190,0.12)';
            ctx.lineWidth = 1.6;
            ctx.shadowColor = 'rgba(200,200,255,0.5)';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            rock.shape.forEach((scale, i) => {
                const angle = (i / rock.shape.length) * Math.PI * 2;
                const px = Math.cos(angle) * rock.r * scale;
                const py = Math.sin(angle) * rock.r * scale;
                if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
            });
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        }

        for (const shot of s.shots) {
            lit(ctx, LIME, 12, () => { disc(ctx, shot.x, shot.y, 2.4); ctx.fill(); });
        }

        // Two frames on, two frames off while the shield is up.
        const showShip = s.invuln <= 0 || Math.floor(s.invuln * 8) % 2 === 0;
        if (showShip) {
            ctx.save();
            ctx.translate(s.ship.x, s.ship.y);
            ctx.rotate(s.ship.a);
            if (s.thrusting) {
                lit(ctx, YELLOW, 14, () => {
                    ctx.beginPath();
                    ctx.moveTo(-8, -4);
                    ctx.lineTo(-16 - Math.random() * 5, 0);
                    ctx.lineTo(-8, 4);
                    ctx.closePath();
                    ctx.fill();
                });
            }
            ctx.strokeStyle = VIOLET;
            ctx.fillStyle = 'rgba(95,46,234,0.22)';
            ctx.lineWidth = 2;
            ctx.shadowColor = PURPLE;
            ctx.shadowBlur = 16;
            ctx.beginPath();
            ctx.moveTo(14, 0);
            ctx.lineTo(-9, -8.5);
            ctx.lineTo(-5, 0);
            ctx.lineTo(-9, 8.5);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        }

        hud(ctx, `SHIPS ${'▲'.repeat(Math.max(0, s.lives))}`, `WAVE ${s.wave}`);
    };

    useEffect(() => { game.current = freshRocks(); draw(); }, [runId, fitted]);

    useFrames(running, dt => {
        const s = game.current;
        if (s.over) return;
        const was = s.score;

        if (held(keys, 'ArrowLeft', 'KeyA')) s.ship.a -= 3.5 * dt;
        if (held(keys, 'ArrowRight', 'KeyD')) s.ship.a += 3.5 * dt;
        s.thrusting = held(keys, 'ArrowUp', 'KeyW');
        if (s.thrusting) {
            s.ship.vx += Math.cos(s.ship.a) * 205 * dt;
            s.ship.vy += Math.sin(s.ship.a) * 205 * dt;
        }
        // Space has no drag. This does, because a ship you cannot stop is not a game.
        const drag = Math.pow(0.62, dt);
        s.ship.vx *= drag;
        s.ship.vy *= drag;
        s.ship.x += s.ship.vx * dt;
        s.ship.y += s.ship.vy * dt;
        wrap(s.ship, 12);

        s.cool -= dt;
        if (held(keys, 'Space', 'ArrowDown', 'KeyS') && s.cool <= 0 && s.shots.length < 5) {
            s.cool = 0.22;
            s.shots.push({
                x: s.ship.x + Math.cos(s.ship.a) * 13,
                y: s.ship.y + Math.sin(s.ship.a) * 13,
                vx: Math.cos(s.ship.a) * 330 + s.ship.vx,
                vy: Math.sin(s.ship.a) * 330 + s.ship.vy,
                life: 1.05,
            });
        }

        for (let i = s.shots.length - 1; i >= 0; i--) {
            const shot = s.shots[i];
            shot.x += shot.vx * dt;
            shot.y += shot.vy * dt;
            shot.life -= dt;
            wrap(shot, 2);
            if (shot.life <= 0) s.shots.splice(i, 1);
        }

        for (const rock of s.rocks) {
            rock.x += rock.vx * dt;
            rock.y += rock.vy * dt;
            rock.a += rock.spin * dt;
            wrap(rock, rock.r);
        }

        for (let i = s.shots.length - 1; i >= 0; i--) {
            for (let j = s.rocks.length - 1; j >= 0; j--) {
                const rock = s.rocks[j];
                if (Math.hypot(s.shots[i].x - rock.x, s.shots[i].y - rock.y) > rock.r) continue;
                s.shots.splice(i, 1);
                s.rocks.splice(j, 1);
                s.score += rock.r > 26 ? 20 : rock.r > 15 ? 50 : 100;
                if (rock.r > 15) {
                    const next = rock.r > 26 ? 19 : 11;
                    s.rocks.push(makeRock(rock.x, rock.y, next), makeRock(rock.x, rock.y, next));
                }
                break;
            }
        }

        if (s.invuln > 0) {
            s.invuln -= dt;
        } else {
            for (const rock of s.rocks) {
                if (Math.hypot(s.ship.x - rock.x, s.ship.y - rock.y) > rock.r + 8) continue;
                s.lives -= 1;
                if (s.lives <= 0) { s.over = true; break; }
                s.ship = { x: W / 2, y: H / 2, a: -Math.PI / 2, vx: 0, vy: 0 };
                s.invuln = 2.2;
                break;
            }
        }

        if (!s.over && !s.rocks.length) {
            s.wave += 1;
            spawnWave(s);
            s.invuln = Math.max(s.invuln, 1.2);
        }

        draw();
        if (s.score !== was) onScore(s.score);
        if (s.over) onEnd();
    });

    return <canvas ref={canvasRef} className="block w-full h-full touch-pan-y" />;
};

/* ------------------------------------------------------------------ *
 *  4. Invaders — Taito, 1978
 * ------------------------------------------------------------------ */

const INV_COLS = 9;
const INV_ROWS = 5;
const INV_GAP_X = 40;
const INV_GAP_Y = 27;
const INV_W = 24;
const INV_H = 16;
const INV_ROW_COLOURS = [RED, YELLOW, YELLOW, LIME, LIME];
const INV_ROW_POINTS = [30, 20, 20, 10, 10];
const SHIP_Y = H - 34;
const SHIP_W = 30;

type Alien = { col: number; row: number; alive: boolean };

type InvState = {
    aliens: Alien[];
    fx: number;
    fy: number;
    dir: number;
    march: number;
    frame: number;
    shot: Shot | null;
    bombs: Shot[];
    bombClock: number;
    ship: number;
    lives: number;
    wave: number;
    score: number;
    over: boolean;
};

const FLEET_W = (INV_COLS - 1) * INV_GAP_X + INV_W;

const buildFleet = (): Alien[] => {
    const aliens: Alien[] = [];
    for (let row = 0; row < INV_ROWS; row++) {
        for (let col = 0; col < INV_COLS; col++) aliens.push({ col, row, alive: true });
    }
    return aliens;
};

const freshInvaders = (): InvState => ({
    aliens: buildFleet(),
    fx: (W - FLEET_W) / 2,
    fy: 44,
    dir: 1,
    march: 0,
    frame: 0,
    shot: null,
    bombs: [],
    bombClock: 1.2,
    ship: W / 2,
    lives: 3,
    wave: 1,
    score: 0,
    over: false,
});

const alienAt = (s: InvState, alien: Alien) => ({
    x: s.fx + alien.col * INV_GAP_X,
    y: s.fy + alien.row * INV_GAP_Y,
});

const Invaders: React.FC<GameProps> = ({ running, runId, keys, onScore, onEnd }) => {
    const { canvasRef, ctxRef, fitted } = useStage();
    const game = useRef<InvState>(freshInvaders());

    const draw = () => {
        const ctx = ctxRef.current;
        if (!ctx) return;
        const s = game.current;
        wipe(ctx);

        for (const alien of s.aliens) {
            if (!alien.alive) continue;
            const { x, y } = alienAt(s, alien);
            const colour = INV_ROW_COLOURS[alien.row];
            ctx.save();
            ctx.shadowColor = colour;
            ctx.shadowBlur = 9;
            ctx.fillStyle = colour;
            // A rounded carapace with a pair of legs that swap on every march step. Drawn,
            // not stamped from a sprite — it is the same silhouette without the pixels.
            roundRect(ctx, x, y + 4, INV_W, INV_H - 4, 5);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x + INV_W / 2, y + 5, INV_W / 2.6, Math.PI, 0);
            ctx.fill();
            const kick = s.frame ? 1 : -1;
            roundRect(ctx, x + 2, y + INV_H, 4, 4, 1.5);
            ctx.fill();
            roundRect(ctx, x + INV_W - 6, y + INV_H, 4, 4, 1.5);
            ctx.fill();
            roundRect(ctx, x + INV_W / 2 - 2 + kick * 4, y + INV_H, 4, 3, 1.5);
            ctx.fill();
            ctx.restore();
            ctx.save();
            ctx.fillStyle = 'rgba(6,6,13,0.85)';
            disc(ctx, x + INV_W / 2 - 4.5, y + 7, 2);
            ctx.fill();
            disc(ctx, x + INV_W / 2 + 4.5, y + 7, 2);
            ctx.fill();
            ctx.restore();
        }

        if (s.shot) lit(ctx, LIME, 12, () => { roundRect(ctx, s.shot!.x - 1.5, s.shot!.y - 8, 3, 12, 1.5); ctx.fill(); });
        for (const bomb of s.bombs) {
            lit(ctx, RED, 12, () => { roundRect(ctx, bomb.x - 1.5, bomb.y - 4, 3, 11, 1.5); ctx.fill(); });
        }

        ctx.save();
        ctx.shadowColor = PURPLE;
        ctx.shadowBlur = 16;
        ctx.fillStyle = VIOLET;
        roundRect(ctx, s.ship - SHIP_W / 2, SHIP_Y + 6, SHIP_W, 9, 4);
        ctx.fill();
        roundRect(ctx, s.ship - 8, SHIP_Y, 16, 9, 4);
        ctx.fill();
        roundRect(ctx, s.ship - 2, SHIP_Y - 5, 4, 7, 2);
        ctx.fill();
        ctx.restore();

        hud(ctx, `SHIPS ${'▲'.repeat(Math.max(0, s.lives))}`, `WAVE ${s.wave}`);
    };

    useEffect(() => { game.current = freshInvaders(); draw(); }, [runId, fitted]);

    useFrames(running, dt => {
        const s = game.current;
        if (s.over) return;
        const was = s.score;
        const alive = s.aliens.filter(alien => alien.alive);

        if (held(keys, 'ArrowLeft', 'KeyA')) s.ship -= 215 * dt;
        if (held(keys, 'ArrowRight', 'KeyD')) s.ship += 215 * dt;
        s.ship = clamp(s.ship, SHIP_W / 2, W - SHIP_W / 2);

        // One shot in the air at a time, as the machine did. It is the whole reason the
        // game is about choosing a target rather than holding the button down.
        if (held(keys, 'Space', 'ArrowUp', 'KeyW') && !s.shot) {
            s.shot = { x: s.ship, y: SHIP_Y - 6, vx: 0, vy: -430, life: 4 };
        }
        if (s.shot) {
            s.shot.y += s.shot.vy * dt;
            if (s.shot.y < -12) s.shot = null;
        }

        // The fleet steps rather than slides, and steps faster the emptier it gets — the
        // original did this because it ran out of aliens to redraw, and it is still the
        // best difficulty curve anyone has written.
        s.march += dt;
        const interval = 0.055 + 0.5 * (alive.length / (INV_COLS * INV_ROWS));
        if (s.march >= interval) {
            s.march = 0;
            s.frame = s.frame ? 0 : 1;
            const lefts = alive.map(alien => alienAt(s, alien).x);
            const leftMost = Math.min(...lefts, W);
            const rightMost = Math.max(...lefts.map(x => x + INV_W), 0);
            if ((s.dir > 0 && rightMost + 7 > W - 14) || (s.dir < 0 && leftMost - 7 < 14)) {
                s.dir *= -1;
                s.fy += 13;
            } else {
                s.fx += s.dir * 7;
            }
        }

        // Bombs run on their own clock rather than the march clock. Tying them together
        // was faithful to nothing: the fleet marches faster the emptier it gets, so the
        // last survivor ended up dropping three bombs a second on its own.
        s.bombClock -= dt;
        if (s.bombClock <= 0 && alive.length) {
            s.bombClock = Math.max(0.34, 1.05 - s.wave * 0.09) * (0.6 + Math.random() * 0.8);
            const pick = alive[Math.floor(Math.random() * alive.length)];
            // Whoever is at the front of that column throws it, not whoever was picked.
            const front = alive
                .filter(alien => alien.col === pick.col)
                .reduce((low, alien) => (alien.row > low.row ? alien : low), pick);
            const spot = alienAt(s, front);
            s.bombs.push({ x: spot.x + INV_W / 2, y: spot.y + INV_H, vx: 0, vy: 132 + s.wave * 14, life: 9 });
        }

        for (let i = s.bombs.length - 1; i >= 0; i--) {
            const bomb = s.bombs[i];
            bomb.y += bomb.vy * dt;
            if (bomb.y > H + 10) { s.bombs.splice(i, 1); continue; }
            const hitShip = bomb.y > SHIP_Y - 6 && bomb.y < SHIP_Y + 16 && Math.abs(bomb.x - s.ship) < SHIP_W / 2;
            if (!hitShip) continue;
            s.bombs.splice(i, 1);
            s.lives -= 1;
            s.ship = W / 2;
            if (s.lives <= 0) s.over = true;
        }

        if (s.shot) {
            for (const alien of s.aliens) {
                if (!alien.alive) continue;
                const { x, y } = alienAt(s, alien);
                if (s.shot.x < x || s.shot.x > x + INV_W) continue;
                if (s.shot.y > y + INV_H + 2 || s.shot.y < y - 8) continue;
                alien.alive = false;
                s.score += INV_ROW_POINTS[alien.row];
                s.shot = null;
                break;
            }
        }

        // They only have to reach you once.
        const lowest = s.aliens.reduce((low, alien) => (alien.alive ? Math.max(low, alienAt(s, alien).y + INV_H) : low), 0);
        if (lowest > SHIP_Y - 4) s.over = true;

        if (!s.over && !s.aliens.some(alien => alien.alive)) {
            s.wave += 1;
            s.aliens = buildFleet();
            s.fx = (W - FLEET_W) / 2;
            s.fy = 44 + Math.min(s.wave - 1, 4) * 9;
            s.dir = 1;
            s.bombs = [];
            s.bombClock = 1.2;
            s.shot = null;
        }

        draw();
        if (s.score !== was) onScore(s.score);
        if (s.over) onEnd();
    });

    return <canvas ref={canvasRef} className="block w-full h-full touch-pan-y" />;
};

/* ------------------------------------------------------------------ *
 *  The cabinets
 * ------------------------------------------------------------------ */

type GameProps = {
    running: boolean;
    /** Bumped on every fresh game, which is the signal to reset the board. */
    runId: number;
    keys: KeySet;
    onScore: (score: number) => void;
    onEnd: () => void;
};

type PadKey = { code: string; icon: string; label: string };

type GameDef = {
    id: string;
    name: string;
    year: string;
    tag: string;
    accent: string;
    ink: string;
    icon: string;
    /** The attract-screen hint, one wording for keys and one for thumbs. */
    controls: string;
    touch: string;
    pad: PadKey[];
    Screen: React.FC<GameProps>;
};

const LEFT: PadKey = { code: 'ArrowLeft', icon: 'fas fa-caret-left', label: 'Left' };
const RIGHT: PadKey = { code: 'ArrowRight', icon: 'fas fa-caret-right', label: 'Right' };
const UP: PadKey = { code: 'ArrowUp', icon: 'fas fa-caret-up', label: 'Up' };
const DOWN: PadKey = { code: 'ArrowDown', icon: 'fas fa-caret-down', label: 'Down' };

const GAMES: GameDef[] = [
    {
        id: 'snake',
        name: 'Snake',
        year: '1976',
        tag: 'Eat, grow, run out of room',
        accent: LIME,
        ink: '#1A1A1A',
        icon: 'fas fa-worm',
        controls: 'Arrow keys to steer',
        touch: 'Steer with the pad below',
        pad: [LEFT, UP, DOWN, RIGHT],
        Screen: Snake,
    },
    {
        id: 'breakout',
        name: 'Breakout',
        year: '1976',
        tag: 'The paddle is an aiming device',
        accent: VIOLET,
        ink: '#FFFFFF',
        icon: 'fas fa-table-cells-large',
        controls: 'Arrow keys or the mouse',
        touch: 'Slide the paddle below',
        pad: [LEFT, RIGHT],
        Screen: Breakout,
    },
    {
        id: 'asteroids',
        name: 'Asteroids',
        year: '1979',
        tag: 'Momentum is the real enemy',
        accent: PURPLE,
        ink: '#FFFFFF',
        icon: 'fas fa-meteor',
        controls: 'Arrows to turn and thrust · space to fire',
        touch: 'Turn, thrust and fire below',
        pad: [LEFT, RIGHT, UP, { code: 'Space', icon: 'fas fa-circle-dot', label: 'Fire' }],
        Screen: Asteroids,
    },
    {
        id: 'invaders',
        name: 'Invaders',
        year: '1978',
        tag: 'One shot in the air at a time',
        accent: RED,
        ink: '#FFFFFF',
        icon: 'fas fa-satellite',
        controls: 'Arrows to move · space to fire',
        touch: 'Move and fire below',
        pad: [LEFT, RIGHT, { code: 'Space', icon: 'fas fa-circle-dot', label: 'Fire' }],
        Screen: Invaders,
    },
];

/** A pad button is a key: it writes the same code the keyboard would. */
const PadButton: React.FC<{ keys: KeySet; button: PadKey }> = ({ keys, button }) => {
    const press = (e: React.PointerEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        keys.current.add(button.code);
    };
    const release = () => keys.current.delete(button.code);

    return (
        <button
            type="button"
            aria-label={button.label}
            onPointerDown={press}
            onPointerUp={release}
            onPointerCancel={release}
            onLostPointerCapture={release}
            onContextMenu={e => e.preventDefault()}
            className="flex-1 h-12 rounded-xl border border-[var(--hair)] bg-[var(--panel-flat)] text-lg text-brand-black/70 dark:text-white/70 flex items-center justify-center touch-none select-none active:scale-95 active:text-brand-purple dark:active:text-brand-yellow transition-transform"
        >
            <i className={button.icon} aria-hidden="true"></i>
        </button>
    );
};

const Cabinet: React.FC<{
    game: GameDef;
    keys: KeySet;
    active: boolean;
    onStart: () => void;
    onStop: () => void;
}> = ({ game, keys, active, onStart, onStop }) => {
    const [phase, setPhase] = useState<'idle' | 'playing' | 'paused' | 'over'>('idle');
    const [score, setScore] = useState(0);
    const [best, setBest] = useState(0);
    const [runId, setRunId] = useState(0);

    const slot = `go.arcade.${game.id}`;

    useEffect(() => {
        // localStorage does not exist during the pre-render and throws outright in a
        // locked-down browser, so a best score is a bonus, never a dependency.
        try { setBest(Number(window.localStorage.getItem(slot)) || 0); } catch { /* no store, no records */ }
    }, [slot]);

    // Someone started another machine. Hold this one where it is rather than ending it.
    useEffect(() => {
        if (!active) setPhase(current => (current === 'playing' ? 'paused' : current));
    }, [active]);

    useEffect(() => {
        if (phase !== 'over' || score <= best) return;
        setBest(score);
        try { window.localStorage.setItem(slot, String(score)); } catch { /* nothing to do */ }
    }, [phase, score, best, slot]);

    const start = () => {
        setScore(0);
        setRunId(n => n + 1);
        setPhase('playing');
        onStart();
    };
    const resume = () => { setPhase('playing'); onStart(); };
    const finish = () => { setPhase('over'); onStop(); };
    const stop = () => { setPhase('idle'); setScore(0); setRunId(n => n + 1); onStop(); };

    const playing = active && phase === 'playing';

    // min-w-0 on the card: a grid item defaults to min-width:auto, and the nowrap strapline
    // in the header gives this one a 325px floor that overflowed the column on a phone.
    return (
        <div data-depth-in className="panel lift p-4 sm:p-5 flex flex-col gap-4 min-w-0">
            <div className="flex items-center gap-3.5">
                <div className="relative flex-shrink-0">
                    <div
                        className="absolute inset-0 rounded-2xl blur-lg opacity-45"
                        style={{ background: game.accent }}
                        aria-hidden="true"
                    />
                    <div
                        className="relative w-11 h-11 rounded-2xl flex items-center justify-center text-lg shadow-[0_12px_28px_-12px_rgba(20,18,40,.8)]"
                        style={{ background: game.accent, color: game.ink }}
                    >
                        <i className={game.icon} aria-hidden="true"></i>
                    </div>
                </div>
                <div className="flex-grow min-w-0">
                    <h3 className="text-lg font-black leading-tight text-brand-black dark:text-white">{game.name}</h3>
                    <p className="chip truncate">{game.year} · {game.tag}</p>
                </div>
                {playing && (
                    <button
                        type="button"
                        onClick={stop}
                        aria-label={`Stop ${game.name}`}
                        className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-brand-black/40 dark:text-white/40 hover:text-brand-red hover:bg-brand-red/10 transition-colors"
                    >
                        <i className="fas fa-stop text-sm" aria-hidden="true"></i>
                    </button>
                )}
            </div>

            <div className="arcade-screen">
                <game.Screen running={playing} runId={runId} keys={keys} onScore={setScore} onEnd={finish} />

                {phase !== 'playing' && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 px-6 text-center bg-[#05050b]/60">
                        {phase === 'over' && (
                            <>
                                <div className="chip text-white/50">Game over</div>
                                <div className="display font-black text-5xl text-white">{score}</div>
                            </>
                        )}
                        {phase === 'idle' && (
                            <div className="chip text-white/50">
                                <span className="arcade-keys">{game.controls}</span>
                                <span className="arcade-touch">{game.touch}</span>
                            </div>
                        )}
                        {phase === 'paused' && <div className="chip text-white/50">Paused · score {score}</div>}
                        <button
                            type="button"
                            onClick={phase === 'paused' ? resume : start}
                            className="px-7 py-3 rounded-2xl font-bold text-sm uppercase tracking-[0.18em] transition-transform duration-300 hover:-translate-y-0.5 active:translate-y-0"
                            style={{ background: game.accent, color: game.ink, boxShadow: `0 18px 40px -16px ${game.accent}` }}
                        >
                            {phase === 'idle' ? 'Play' : phase === 'paused' ? 'Resume' : 'Play again'}
                        </button>
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between gap-4 px-1">
                <div>
                    <div className="chip">Score</div>
                    <div className="font-black text-xl tabular-nums text-brand-black dark:text-white">{score}</div>
                </div>
                <div className="text-right">
                    <div className="chip">Best</div>
                    <div className="font-black text-xl tabular-nums" style={{ color: game.accent }}>{best}</div>
                </div>
            </div>

            <div className="arcade-pad gap-2">
                {game.pad.map(button => <PadButton key={button.code} keys={keys} button={button} />)}
            </div>
        </div>
    );
};

export const ArcadeCabinets: React.FC = () => {
    const [active, setActive] = useState<string | null>(null);
    const keys = useKeyboard(active !== null);

    return (
        <div className="grid gap-5 md:gap-6 lg:grid-cols-2">
            {GAMES.map(game => (
                <Cabinet
                    key={game.id}
                    game={game}
                    keys={keys}
                    active={active === game.id}
                    onStart={() => setActive(game.id)}
                    onStop={() => setActive(null)}
                />
            ))}
        </div>
    );
};
