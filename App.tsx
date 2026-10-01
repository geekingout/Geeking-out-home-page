/**
 * The Geeking Out site.
 *
 * Twelve pages on real paths, pre-rendered to static HTML and hydrated on
 * arrival. Every browser API is reached from an effect or a handler: effects do
 * not run during renderToString, which is the only reason the tree renders in
 * Node at all.
 *
 * Copy lives in content.ts, routing and shared chrome in nav.tsx, the product
 * showcase in showcase.tsx, the hero's WebGL sky in hero-sky.ts and the arcade
 * in arcade-cabinets.tsx. This file is the pages.
 */

import React, { useEffect, useRef, useState } from 'react';
import { PAGES } from './routes';
import {
    Arrow, Cta, Eyebrow, Footer, Header, MobileBar, PageHero, Pager, RouteLink,
    applyHeadMeta, clamp01, navigate, reducedMotion, useOnScroll, useReveal, useRoute,
} from './nav';
import {
    EMAIL, FAQ, FOUNDED, HOME_SERVICES, PHILOSOPHY, PHONE_DISPLAY, PHONE_TEL, PRIVACY, PROCESS,
    PRODUCTS, QUOTES, SERVICES, TEAM, TERMS, type Service,
} from './content';
import { ProductShowcase } from './showcase';
import { mountSky, SKY_POINTS, type Sky } from './hero-sky';
import { ArcadeCabinets } from './arcade-cabinets';

// --- Contact form endpoint ---
const GOOGLE_SHEETS_WEBHOOK_URL: string = "https://script.google.com/macros/s/AKfycbwXWaVr52KdOf0bQHL21kG2vFyNZyOrsYYRv5_Bj1wIMxWx5bs7e9UuqIx7nE6G6qEkjw/exec";

// Resolves to true when the POST left the browser without a network error. The request is
// sent no-cors so the response is opaque: this cannot confirm the Apps Script wrote the row,
// only that the visitor was online and the endpoint reachable.
const sendToGoogleSheets = async (data: Record<string, unknown>): Promise<boolean> => {
    const str = (v: unknown) => (typeof v === 'string' ? v : '');
    const cleanPayload: Record<string, string | number | boolean> = {
        timestamp: new Date().toLocaleString(),
        source: str(data.source) || 'Unknown',
        name: str(data.name),
        email: str(data.email),
        // The field is named projectDescription; mirror it into `description` so the sheet
        // gets the text whichever column name the Apps Script reads.
        description: str(data.projectDescription) || str(data.description),
    };
    for (const [key, value] of Object.entries(data)) {
        if (key in cleanPayload) continue;
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') cleanPayload[key] = value;
    }

    try {
        // no-cors is required by Apps Script web apps and restricts Content-Type to the
        // safelisted values, so the body goes out as text/plain; the script reads
        // e.postData.contents regardless.
        await fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(cleanPayload),
        });
        return true;
    } catch (error) {
        console.error('Error sending to Google Sheets:', error);
        return false;
    }
};

const pad = (n: number) => String(n).padStart(2, '0');

/* ------------------------------------------------------------------ *
 *  Home
 * ------------------------------------------------------------------ */

const HERO_STATS = [
    { value: String(FOUNDED), label: 'founded, NYC' },
    { value: '500+', label: 'websites launched' },
    { value: '100+', label: 'web apps built' },
    { value: '60+', label: 'mobile apps shipped' },
    { value: '3M+', label: 'active users' },
];

const Hero: React.FC = () => {
    const section = useRef<HTMLElement>(null);
    const canvas = useRef<HTMLCanvasElement>(null);
    const text = useRef<HTMLDivElement>(null);
    const progress = useRef(0);
    const [label, setLabel] = useState('webgl');

    useEffect(() => {
        const cv = canvas.current;
        if (!cv) return;
        let sky: Sky | null = null;
        try {
            sky = mountSky(cv, { reduced: reducedMotion(), scroll: () => progress.current });
        } catch (e) {
            console.warn('hero sky', e);
        }
        if (!sky) {
            cv.style.display = 'none';
            setLabel('css fallback');
            return;
        }
        setLabel(`${SKY_POINTS} points`);
        const ro = new ResizeObserver(() => sky?.kick());
        ro.observe(cv);
        return () => { ro.disconnect(); sky?.destroy(); };
    }, []);

    useOnScroll(() => {
        const el = section.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const vh = window.innerHeight;
        const y = Math.max(0, -r.top);
        progress.current = clamp01(y / (r.height || vh));
        if (!text.current || reducedMotion()) return;
        const p = clamp01(y / (vh * 0.85));
        const opacity = Math.max(0, 1 - p * 1.1);
        text.current.style.transform = `translateY(${p * 70}px) scale(${1 - p * 0.04})`;
        text.current.style.opacity = String(opacity);
        // Once faded out the links inside must stop taking focus and clicks.
        text.current.style.visibility = opacity === 0 ? 'hidden' : '';
    });

    return (
        <section ref={section} data-dark className="relative overflow-hidden bg-night text-paper -mt-[68px]">
            <canvas ref={canvas} aria-hidden="true" className="absolute inset-0 w-full h-full block" />
            <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse 80% 60% at 70% 80%,rgba(255,90,31,.28),transparent 60%),linear-gradient(180deg,rgba(13,9,8,.55) 0%,rgba(13,9,8,0) 30%,rgba(13,9,8,0) 70%,rgba(13,9,8,.75) 100%)' }}
            />
            <div className="relative max-w-site mx-auto px-6 pt-[148px] min-h-[100svh] flex flex-col justify-between">
                <div ref={text} className="grid gap-x-14 gap-y-8 items-end min-[1101px]:grid-cols-[minmax(0,1fr)_minmax(0,380px)] will-change-[transform,opacity]">
                    <div className="col-span-full flex flex-wrap justify-between gap-x-6 gap-y-3 font-mono text-[12px] text-peach">
                        <span className="inline-flex items-center gap-2.5">
                            <span aria-hidden="true" className="pulse-dot w-2 h-2 rounded-full bg-orange-lit shadow-[0_0_12px_#FF8A5C]" />
                            Est. {FOUNDED} · UES, New York City
                        </span>
                        <span className="hidden min-[901px]:inline">upper east side · nyc skyline · {label}</span>
                    </div>
                    <h1 className="display m-0 text-[clamp(60px,9.6vw,156px)] leading-[.9] text-paper [text-shadow:0_2px_40px_rgba(13,9,8,.6)]">
                        AI-Powered.<br /><span className="outline-paper">Human-</span>Engineered.
                    </h1>
                    <div
                        className="relative flex flex-col gap-7 px-[22px] pt-5 pb-[22px] -mx-[22px] -mb-3 rounded-2xl"
                        style={{ background: 'radial-gradient(ellipse at 50% 50%,rgba(13,9,8,.78),rgba(13,9,8,.35) 70%,rgba(13,9,8,0))' }}
                    >
                        <p className="m-0 text-[clamp(17px,1.3vw,19px)] leading-normal text-bone [text-wrap:pretty]">
                            We build automations, AI agents, and custom software for businesses in New York and beyond — connected to the tools your team already uses.
                        </p>
                        <div className="flex flex-wrap gap-3 items-center">
                            <RouteLink to="/contact" className="btn btn-orange h-[52px] px-6 text-[16px] shadow-[0_0_40px_rgba(255,90,31,.45)]">
                                Start a project <Arrow />
                            </RouteLink>
                            <RouteLink to="/contact" className="btn btn-ghost-light h-[52px] px-[22px] text-[16px] backdrop-blur-sm">
                                Let's Talk
                            </RouteLink>
                        </div>
                        <p className="m-0 -mt-2 text-[14px] text-ink-4">
                            Prefer to browse first?{' '}
                            <RouteLink to="/services" className="text-bone underline underline-offset-4 decoration-orange-ink hover:text-white transition-colors">See what we do</RouteLink>.
                        </p>
                    </div>
                </div>
                <div className="mt-14 border-t border-[rgba(250,248,245,.14)] grid grid-cols-[repeat(auto-fit,minmax(min(100%,150px),1fr))]">
                    {HERO_STATS.map(s => (
                        <div key={s.label} className="pt-[22px] pr-5 pb-[26px] mr-5 flex flex-col gap-1.5 border-r border-[rgba(250,248,245,.1)]">
                            <span className="font-display uppercase font-bold text-[clamp(30px,2.8vw,40px)] leading-none text-paper">{s.value}</span>
                            <span className="font-mono text-[12px] text-ink-4">{s.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

/** The departures board: five lines, the one nearest the middle of the screen lit. */
const ServicesBoard: React.FC = () => {
    const root = useRef<HTMLElement>(null);
    const [activeRow, setActiveRow] = useState(-1);
    const [still, setStill] = useState(false);
    useEffect(() => { setStill(reducedMotion()); }, []);

    useOnScroll(() => {
        if (!root.current) return;
        const vh = window.innerHeight;
        const rows = Array.from(root.current.querySelectorAll('[data-svc]')) as HTMLElement[];
        if (!rows.length || rows[0].getBoundingClientRect().height === 0) return;
        let best = -1, bestD = Infinity;
        rows.forEach(el => {
            const r = el.getBoundingClientRect();
            const d = Math.abs((r.top + r.bottom) / 2 - vh * 0.5);
            if (r.bottom > vh * 0.2 && r.top < vh * 0.8 && d < bestD) { bestD = d; best = Number(el.dataset.svc); }
        });
        setActiveRow(a => (a === best ? a : best));
    });

    return (
        <section ref={root} data-dark aria-labelledby="svc-h" className="relative bg-night text-paper pt-[88px] pb-[104px] overflow-hidden scanlines">
            <div className="relative max-w-site mx-auto px-6">
                <div data-reveal="0" className="flex justify-between items-end flex-wrap gap-x-6 gap-y-4 mb-9">
                    <div>
                        <Eyebrow tone="paper">What we do · 01–{pad(HOME_SERVICES.length)}</Eyebrow>
                        <h2 id="svc-h" className="display m-0 text-[clamp(44px,5.6vw,84px)]">Now Boarding</h2>
                    </div>
                    <RouteLink to="/services" className="btn btn-ghost-light is-accent h-11 px-[18px] rounded-[10px] text-[14px]">
                        All services <Arrow />
                    </RouteLink>
                </div>
                <div className="flex flex-col border-b border-[rgba(250,248,245,.14)]">
                    {HOME_SERVICES.map((s, i) => {
                        const on = still || i === activeRow;
                        return (
                            <RouteLink
                                key={s.name}
                                to="/services"
                                data-svc={i}
                                data-on={on}
                                className="svc-row grid grid-cols-[56px_minmax(0,1fr)_auto] max-[900px]:grid-cols-[40px_minmax(0,1fr)] items-center gap-5 py-[26px] border-t border-[rgba(250,248,245,.14)] text-[rgba(250,248,245,.38)]"
                            >
                                <span className="svc-num font-mono text-[13px] transition-colors duration-500 text-[rgba(250,248,245,.38)]">{pad(i + 1)}</span>
                                <span className="font-display uppercase text-[clamp(30px,4.6vw,68px)] leading-[.95] font-bold">{s.name}</span>
                                <span className="svc-num max-[900px]:hidden inline-flex items-center gap-3 font-mono text-[12px] transition-colors duration-500 text-[rgba(250,248,245,.38)]">
                                    <span aria-hidden="true" className="svc-bar block w-0 h-0.5 bg-orange transition-[width] duration-500 ease-[cubic-bezier(.2,.7,.2,1)]" />
                                    {s.tag}
                                </span>
                            </RouteLink>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

/* ------------------------------------------------------------------ *
 *  Since 2007
 *
 *  Victor's copy, verbatim. Two of the eight figures are computed — the years
 *  since founding and the count of our own products — because those are the two
 *  that go stale.
 * ------------------------------------------------------------------ */

const EXPLORE = [
    { eyebrow: 'What we do', title: 'Our Services', key: 'services' },
    { eyebrow: 'Shipped work', title: 'Our Products', key: 'products' },
    { eyebrow: 'How we think', title: 'Our Philosophy', key: 'philosophy' },
    { eyebrow: 'Who you work with', title: 'Our Team', key: 'team' },
    { eyebrow: 'How it runs', title: 'Our Process', key: 'process' },
    { eyebrow: 'Before you ask', title: 'Any Questions?', key: 'faq' },
    { eyebrow: 'Off the clock', title: 'The Arcade', key: 'arcade' },
];

const useStats = () => {
    const years = new Date().getFullYear() - FOUNDED;
    return [
        { value: String(FOUNDED), n: FOUNDED, suffix: '', unit: '', label: 'Founded in New York City' },
        { value: `${years}+`, n: years, suffix: '+', unit: 'years', label: 'Building and supporting production software' },
        { value: '500+', n: 500, suffix: '+', unit: '', label: 'Websites launched' },
        { value: '100+', n: 100, suffix: '+', unit: '', label: 'Web applications built' },
        { value: '60+', n: 60, suffix: '+', unit: '', label: 'Mobile apps shipped' },
        { value: String(PRODUCTS.length), n: PRODUCTS.length, suffix: '', unit: '', label: 'Products of our own in the wild' },
        { value: '3M+', n: 3, suffix: 'M+', unit: '', label: 'Active users across our apps' },
        { value: '20+', n: 20, suffix: '+', unit: '', label: 'Industries served' },
    ];
};

const StatGrid: React.FC = () => {
    const stats = useStats();
    const wrap = useRef<HTMLDivElement>(null);
    const line = useRef<HTMLDivElement>(null);

    // Count up once, when the grid arrives.
    useEffect(() => {
        const root = wrap.current;
        if (!root || reducedMotion()) return;
        const els = Array.from(root.querySelectorAll('[data-count]')) as HTMLElement[];
        const io = new IntersectionObserver(entries => {
            if (!entries.some(e => e.isIntersecting)) return;
            io.disconnect();
            const t0 = performance.now();
            const step = (now: number) => {
                const t = clamp01((now - t0) / 1400);
                const e = 1 - Math.pow(1 - t, 3);
                els.forEach(el => {
                    const n = Number(el.dataset.count);
                    if (!n) return;
                    // Years since founding start near the year rather than at zero.
                    const shown = n >= 1000 ? Math.round(n - (n - 2000) * (1 - e)) : Math.round(n * e);
                    el.textContent = shown + (el.dataset.suffix || '');
                });
                if (t < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
        }, { threshold: 0.3 });
        io.observe(root);
        return () => io.disconnect();
    }, []);

    useOnScroll(() => {
        if (!wrap.current || !line.current) return;
        const r = wrap.current.getBoundingClientRect();
        const vh = window.innerHeight;
        line.current.style.transform = `scaleX(${reducedMotion() ? 1 : clamp01((vh * 0.9 - r.top) / (vh * 0.7))})`;
    });

    return (
        <div ref={wrap} className="relative pt-2">
            <div aria-hidden="true" className="h-0.5 bg-line rounded-sm overflow-hidden mb-2">
                <div ref={line} className="h-full bg-orange origin-left scale-x-0 will-change-transform" />
            </div>
            <div className="grid grid-cols-2">
                {stats.map((s, i) => (
                    <div key={s.label} data-reveal={i * 60} className="pt-[26px] pr-5 pb-[26px] border-b border-line">
                        <div className="flex items-baseline gap-0.5 font-display uppercase text-[clamp(36px,3.6vw,52px)] font-bold leading-none">
                            <span data-count={s.n} data-suffix={s.suffix}>{s.value}</span>
                            {s.unit && <span className="text-[14px] font-medium text-orange-ink ml-1.5 font-sans normal-case">{s.unit}</span>}
                        </div>
                        <div className="mt-2 text-[14px] leading-[1.4] text-ink-3">{s.label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const Story: React.FC = () => (
    <section aria-labelledby="story-h" className="relative max-w-site mx-auto px-6 pt-[120px] pb-24">
        <div className="grid gap-16 items-start min-[901px]:grid-cols-2">
            <div>
                <div data-reveal="0"><Eyebrow>Since {FOUNDED}</Eyebrow></div>
                <h2 id="story-h" data-reveal="60" className="display m-0 mb-7 text-[clamp(44px,5.6vw,84px)] [text-wrap:balance]">Let’s build something people love to use.</h2>
                <div data-reveal="120" className="flex flex-col gap-[18px] text-[17px] leading-relaxed text-ink-2 [text-wrap:pretty]">
                    <p className="m-0">Since 2007, Geeking Out has helped businesses turn ambitious ideas into reliable, scalable digital products.</p>
                    <p className="m-0">Our in-house team brings strategy, design, engineering, data, and AI together under one roof. Whether you need a high-performing website, a secure web platform, a mobile app, or intelligent agents that streamline your operations, you’ll work directly with the people building it.</p>
                    <p className="m-0">From the first idea to launch—and every improvement that follows—we’re here to help you move faster, reduce complexity, and create technology that delivers real results.</p>
                </div>
                <div data-reveal="180" className="flex flex-wrap items-center gap-x-4 gap-y-3 mt-8">
                    <RouteLink to="/contact" className="btn btn-ink h-12 px-5 text-[15px]">Start a conversation</RouteLink>
                    <RouteLink to="/products" className="link-ink">See what we’ve built</RouteLink>
                    <span aria-hidden="true" className="text-[#B8B2AA]">·</span>
                    <RouteLink to="/process" className="link-ink">How we work</RouteLink>
                </div>
            </div>
            <StatGrid />
        </div>

        <nav aria-label="Explore" className="mt-24 grid gap-3 grid-cols-[repeat(auto-fit,minmax(min(100%,170px),1fr))]">
            {EXPLORE.map((e, i) => {
                const page = PAGES.find(p => p.key === e.key)!;
                return (
                    <RouteLink
                        key={e.key}
                        to={page.path}
                        data-reveal={i * 50}
                        className="card-link flex flex-col gap-[22px] p-5 min-h-[140px] rounded-2xl border border-line bg-white text-ink"
                    >
                        <span className="font-mono text-[11px] tracking-[.08em] uppercase text-orange-ink">{e.eyebrow}</span>
                        <span className="mt-auto flex items-center justify-between font-display uppercase text-[22px] font-bold tracking-[.01em]">
                            {e.title}<span aria-hidden="true" className="text-[14px] text-ink-3">→</span>
                        </span>
                    </RouteLink>
                );
            })}
        </nav>
    </section>
);

/* ------------------------------------------------------------------ *
 *  Testimonials: two rows that slide against each other as you scroll.
 * ------------------------------------------------------------------ */

const QuoteCard: React.FC<{ q: (typeof QUOTES)[number] }> = ({ q }) => (
    <figure className="flex-none w-[min(380px,82vw)] m-0 px-[26px] pt-[22px] pb-[26px] rounded-[18px] bg-white border border-line flex flex-col gap-3.5">
        <span aria-hidden="true" className="font-display uppercase text-[56px] leading-[.6] font-bold text-orange h-7">“</span>
        <blockquote className="m-0 text-[16px] leading-[1.55] text-ink [text-wrap:pretty]">"{q.text}"</blockquote>
        <figcaption className="flex items-center gap-3 mt-auto">
            <span aria-hidden="true" className="w-10 h-10 rounded-full bg-orange-tint text-orange-deep grid place-items-center font-bold text-[15px]">{q.name[0]}</span>
            <span className="flex flex-col min-w-0">
                <span className="font-bold text-[14px] tracking-[-0.01em]">{q.name}</span>
                <span className="text-[12px] text-ink-3 font-mono">{q.org}</span>
            </span>
        </figcaption>
    </figure>
);

const Testimonials: React.FC<{ next?: { label: string; to: string } }> = ({ next }) => {
    const section = useRef<HTMLElement>(null);
    const row1 = useRef<HTMLDivElement>(null);
    const row2 = useRef<HTMLDivElement>(null);
    useOnScroll(() => {
        if (!section.current || !row1.current || !row2.current) return;
        if (reducedMotion()) { row2.current.style.transform = 'translateX(-160px)'; return; }
        const r = section.current.getBoundingClientRect();
        const vh = window.innerHeight;
        const t = clamp01((vh - r.top) / (vh + r.height));
        row1.current.style.transform = `translateX(${(0.5 - t) * 420}px)`;
        row2.current.style.transform = `translateX(${(t - 0.5) * 420 - 160}px)`;
    });
    const half = Math.ceil(QUOTES.length / 2);
    return (
        <section ref={section} aria-labelledby="testi-h" className="relative pt-24 pb-28 bg-paper-2 border-t border-b border-line overflow-hidden">
            <div className="max-w-site mx-auto px-6 pb-12">
                <div data-reveal="0"><Eyebrow>Receipts</Eyebrow></div>
                <h2 id="testi-h" data-reveal="60" className="display m-0 mb-3 text-[clamp(44px,5.6vw,84px)]">What People Say</h2>
                <p data-reveal="120" className="m-0 text-[18px] text-ink-2">Don't just take our word for it.</p>
            </div>
            <div className="flex flex-col gap-5">
                <div ref={row1} className="flex gap-5 px-6 will-change-transform">
                    {QUOTES.slice(0, half).map(q => <QuoteCard key={q.name} q={q} />)}
                </div>
                <div ref={row2} className="flex gap-5 px-6 will-change-transform">
                    {QUOTES.slice(half).map(q => <QuoteCard key={q.name} q={q} />)}
                </div>
            </div>
            {next && (
                <div className="max-w-site mx-auto mt-10 px-6 flex justify-end">
                    <RouteLink to={next.to} className="inline-flex items-center gap-2.5 font-medium text-ink hover:text-orange-ink transition-colors">
                        <span className="font-mono text-[12px] text-ink-3">Next</span> {next.label} <Arrow />
                    </RouteLink>
                </div>
            )}
        </section>
    );
};

const HomePage: React.FC = () => (
    <>
        <Hero />
        <ServicesBoard />
        <ProductShowcase />
        <Story />
        <Testimonials next={{ label: 'Services', to: '/services' }} />
        <Cta />
    </>
);

/* ------------------------------------------------------------------ *
 *  Services
 *
 *  The same board as the home page, on paper, with every service and its plain
 *  English explanation a click away. One row opens at a time.
 * ------------------------------------------------------------------ */

const ServiceRow: React.FC<{ service: Service; index: number; open: boolean; onToggle: () => void; onDiscuss: () => void }> = ({ service, index, open, onToggle, onDiscuss }) => {
    const id = `svc-${index}`;
    return (
        <article data-reveal={index * 40} className="border-t border-line last:border-b">
            <button
                type="button"
                onClick={onToggle}
                aria-expanded={open}
                aria-controls={id}
                className={`group w-full text-left grid grid-cols-[56px_minmax(0,1fr)_auto] max-[900px]:grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-5 py-[26px] transition-colors ${open ? 'text-ink' : 'text-ink-2 hover:text-ink'}`}
            >
                <span className={`font-mono text-[13px] transition-colors ${open ? 'text-orange-ink' : 'text-ink-4 group-hover:text-orange-ink'}`}>{pad(index + 1)}</span>
                <span className="min-w-0">
                    <span className="block font-display uppercase text-[clamp(30px,4.2vw,64px)] leading-[.95] font-bold">{service.title}</span>
                    <span className="block mt-2 text-[16px] text-ink-3">{service.description}</span>
                </span>
                <span className="inline-flex items-center gap-3 font-mono text-[12px] text-ink-4">
                    <span className="max-[900px]:hidden">{service.tag}</span>
                    <span aria-hidden="true" className={`w-9 h-9 rounded-[10px] border border-line-2 grid place-items-center text-[18px] text-ink transition-transform duration-300 ${open ? 'rotate-45 border-ink' : ''}`}>+</span>
                </span>
            </button>
            <div id={id} className="fold" data-open={open} aria-hidden={!open} inert={!open || undefined}>
                <div>
                    <div className="pb-8 grid gap-6 min-[901px]:grid-cols-[56px_minmax(0,1fr)]">
                        <span aria-hidden="true" />
                        <div className="max-w-[720px]">
                            <p className="m-0 text-[17px] leading-[1.6] text-ink-2 [text-wrap:pretty]">{service.explanation}</p>
                            <button type="button" onClick={onDiscuss} className="btn btn-ink h-11 px-5 mt-6 text-[14px]">
                                Discuss this service <Arrow />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </article>
    );
};

const ServicesPage: React.FC<{ onDiscuss: (title: string) => void }> = ({ onDiscuss }) => {
    const [open, setOpen] = useState<number | null>(0);
    return (
        <>
            <PageHero
                eyebrow={`What we do · 01–${pad(SERVICES.length)}`}
                title="Our Services"
                blurb="Your one-stop-shop for everything AI & software. We concept, build, and scale your vision."
                aside={<p className="m-0 font-mono text-[12px] text-ink-4">Tap a line for the plain-English version.</p>}
            />
            <section className="max-w-site mx-auto px-6 pt-16 pb-24">
                <div className="flex flex-col">
                    {SERVICES.map((s, i) => (
                        <ServiceRow
                            key={s.title}
                            service={s}
                            index={i}
                            open={open === i}
                            onToggle={() => setOpen(open === i ? null : i)}
                            onDiscuss={() => onDiscuss(s.title)}
                        />
                    ))}
                </div>
            </section>
        </>
    );
};

/* ------------------------------------------------------------------ *
 *  Products
 * ------------------------------------------------------------------ */

const ProductsPage: React.FC = () => (
    <>
        <PageHero
            eyebrow={`Shipped work · ${PRODUCTS.length} products of our own`}
            title="Our Products"
            blurb="A showcase of excellence. We build scalable, agentic, and beautiful software that powers businesses."
        />
        <ProductShowcase heading="none" />
    </>
);

/* ------------------------------------------------------------------ *
 *  Philosophy
 * ------------------------------------------------------------------ */

const PhilosophyPage: React.FC = () => (
    <>
        <PageHero eyebrow="How we think · 01–03" title="Our Philosophy" blurb="How we decide what to build, and how we work while we build it." />
        <section className="max-w-site mx-auto px-6 pt-16 pb-24">
            <div className="grid gap-5 min-[901px]:grid-cols-3">
                {PHILOSOPHY.map((item, i) => (
                    <article key={item.number} data-reveal={i * 80} className="relative overflow-hidden rounded-3xl border border-line bg-white p-8 pt-10 min-h-[320px] flex flex-col">
                        <span aria-hidden="true" className="absolute -right-3 -bottom-8 font-display uppercase font-bold text-[180px] leading-none outline-line select-none pointer-events-none">{item.number}</span>
                        <span className="font-mono text-[12px] text-orange-ink">{item.number}</span>
                        <h2 className="display m-0 mt-auto mb-3 text-[clamp(32px,3vw,44px)] [text-wrap:balance]">{item.title}</h2>
                        <p className="m-0 text-[17px] leading-relaxed text-ink-2 max-w-[360px] [text-wrap:pretty]">{item.description}</p>
                    </article>
                ))}
            </div>
        </section>
    </>
);

/* ------------------------------------------------------------------ *
 *  Team
 * ------------------------------------------------------------------ */

const TeamPage: React.FC = () => (
    <>
        <PageHero eyebrow={`Who you work with · ${TEAM.length} people`} title="Our Team" blurb="Friendly faces, expert minds. We're easy to work with." />
        <section className="max-w-site mx-auto px-6 pt-16 pb-24">
            <div className="grid gap-4 grid-cols-2 min-[901px]:grid-cols-4">
                {TEAM.map((m, i) => (
                    <article key={m.name} data-reveal={i * 50} className="rounded-2xl border border-line bg-white p-6 flex flex-col gap-6 min-h-[220px]">
                        <div className="flex items-start justify-between gap-3">
                            <span aria-hidden="true" className="w-16 h-16 rounded-2xl grid place-items-center font-display uppercase font-bold text-[26px]" style={{ background: m.color, color: m.ink }}>
                                {m.name.slice(0, 2)}
                            </span>
                            <span className="font-mono text-[12px] text-ink-4">{pad(i + 1)}</span>
                        </div>
                        <div className="mt-auto">
                            <h2 className="display m-0 text-[28px]">{m.name}</h2>
                            <p className="m-0 mt-1 font-mono text-[12px] text-orange-ink">{m.role}</p>
                            {m.linkedin && (
                                <a href={m.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${m.name}'s LinkedIn Profile`} className="inline-flex items-center gap-2 mt-3 text-[13px] font-medium text-ink hover:text-orange-ink transition-colors">
                                    LinkedIn <span aria-hidden="true" className="text-[11px]">↗</span>
                                </a>
                            )}
                        </div>
                    </article>
                ))}
            </div>
        </section>
    </>
);

/* ------------------------------------------------------------------ *
 *  Process: two phases, one line drawn at the rate you scroll.
 * ------------------------------------------------------------------ */

const ProcessPage: React.FC = () => {
    const root = useRef<HTMLDivElement>(null);
    const line = useRef<HTMLDivElement>(null);
    useOnScroll(() => {
        if (!root.current || !line.current) return;
        const r = root.current.getBoundingClientRect();
        const vh = window.innerHeight;
        line.current.style.transform = `scaleY(${reducedMotion() ? 1 : clamp01((vh * 0.75 - r.top) / r.height)})`;
    });
    return (
        <>
            <PageHero eyebrow="How it runs · Phase A → Phase B" title="Our Process" blurb="How a project runs, from the first conversation to the version that is still running years later." />
            <section className="max-w-site mx-auto px-6 pt-16 pb-24">
                <div ref={root} className="relative pl-8 min-[901px]:pl-12">
                    <div aria-hidden="true" className="absolute left-2 min-[901px]:left-4 top-2 bottom-2 w-0.5 bg-line rounded-sm overflow-hidden">
                        <div ref={line} className="h-full bg-orange origin-top scale-y-0 will-change-transform" />
                    </div>
                    <div className="flex flex-col gap-16">
                        {PROCESS.map((phase, pi) => (
                            <div key={phase.letter}>
                                <div data-reveal="0" className="relative mb-6">
                                    <span aria-hidden="true" className="absolute -left-[31px] min-[901px]:-left-[47px] top-3 w-4 h-4 rounded-full bg-orange shadow-[0_0_0_5px_#FAF8F5,0_0_22px_4px_rgba(255,90,31,.5)]" />
                                    <Eyebrow>Phase {phase.letter}</Eyebrow>
                                    <h2 className="display m-0 text-[clamp(32px,3.6vw,52px)]">{phase.phase}</h2>
                                </div>
                                <ol className="list-none m-0 p-0 grid gap-3 min-[701px]:grid-cols-2">
                                    {phase.steps.map((step, si) => (
                                        <li key={step} data-reveal={si * 60} className="flex items-center gap-4 p-4 rounded-2xl border border-line bg-white">
                                            <span className="w-11 h-11 rounded-xl bg-orange-tint text-orange-deep grid place-items-center font-mono text-[12px] flex-none">{phase.letter}{si + 1}</span>
                                            <span className="font-medium text-[16px]">{step}</span>
                                        </li>
                                    ))}
                                </ol>
                                {pi === 0 && <p className="m-0 mt-6 font-mono text-[12px] text-ink-4">then ↓</p>}
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
};

/* ------------------------------------------------------------------ *
 *  FAQ
 * ------------------------------------------------------------------ */

const FaqItem: React.FC<{ faq: { question: string; answer: string }; index: number; open: boolean; onToggle: () => void }> = ({ faq, index, open, onToggle }) => {
    const id = `faq-${index}`;
    return (
        <div data-reveal={index * 30} className="border-t border-line last:border-b">
            <button type="button" onClick={onToggle} aria-expanded={open} aria-controls={id} className="group w-full text-left flex items-center justify-between gap-5 py-5">
                <span className="flex items-baseline gap-4 min-w-0">
                    <span className="font-mono text-[12px] text-ink-4 flex-none">{pad(index + 1)}</span>
                    <span className={`text-[18px] min-[901px]:text-[21px] font-medium leading-snug transition-colors ${open ? 'text-ink' : 'text-ink-2 group-hover:text-ink'}`}>{faq.question}</span>
                </span>
                <span aria-hidden="true" className={`w-9 h-9 flex-none rounded-[10px] border border-line-2 grid place-items-center text-[18px] text-ink transition-transform duration-300 ${open ? 'rotate-45 border-ink' : ''}`}>+</span>
            </button>
            <div id={id} className="fold" data-open={open} aria-hidden={!open} inert={!open || undefined}>
                <div>
                    <p className="m-0 pb-6 pl-[calc(2ch+16px)] text-[16px] leading-relaxed text-ink-2 max-w-[760px] [text-wrap:pretty]">{faq.answer}</p>
                </div>
            </div>
        </div>
    );
};

const FaqPage: React.FC = () => {
    const [open, setOpen] = useState<number | null>(0);
    return (
        <>
            <PageHero eyebrow={`Before you ask · ${FAQ.length} answers`} title="Any Questions?" blurb="Answers to what we get asked most. If yours isn't here, ask us directly." />
            <section className="max-w-site mx-auto px-6 pt-16 pb-24">
                <div className="max-w-[880px] rounded-3xl border border-line bg-white px-6 min-[901px]:px-10">
                    {FAQ.map((f, i) => (
                        <FaqItem key={f.question} faq={f} index={i} open={open === i} onToggle={() => setOpen(open === i ? null : i)} />
                    ))}
                </div>
            </section>
        </>
    );
};

/* ------------------------------------------------------------------ *
 *  Arcade
 * ------------------------------------------------------------------ */

const ArcadePage: React.FC = () => (
    <>
        <PageHero
            eyebrow="Off the clock · 4 machines"
            title="The Arcade"
            blurb="Four classics, rebuilt here from nothing but canvas and arithmetic — no engine, no sprite sheets, nothing to install. Arrow keys at a desk, thumbs on a phone. One machine at a time."
        />
        <section className="max-w-site mx-auto px-6 pt-16 pb-24">
            <ArcadeCabinets />
        </section>
    </>
);

/* ------------------------------------------------------------------ *
 *  Contact
 * ------------------------------------------------------------------ */

const ProjectForm: React.FC<{ initialDescription?: string }> = ({ initialDescription = '' }) => {
    const [form, setForm] = useState({ name: '', email: '', organization: '', projectDescription: initialDescription });
    const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

    const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (status === 'sending') return;
        setStatus('sending');
        const ok = await sendToGoogleSheets({ source: 'Contact Form', ...form });
        setStatus(ok ? 'sent' : 'error');
    };

    const field = 'w-full h-12 px-4 rounded-xl border border-line-2 bg-white text-ink text-[16px] focus:outline-none focus:border-ink focus:ring-2 focus:ring-orange/40 transition-colors';
    const label = 'eyebrow block mb-2 text-ink-3';

    if (status === 'sent') {
        return (
            <div className="py-6 text-center">
                <Eyebrow className="text-center">Received</Eyebrow>
                <h2 className="display m-0 mb-3 text-[clamp(36px,4vw,56px)]">You're all set.</h2>
                <p className="m-0 mb-8 text-[17px] text-ink-2">
                    Thanks {form.name.split(' ')[0] || 'for reaching out'} — we've got your project details and we'll be in touch shortly.
                </p>
                <RouteLink to="/" className="btn btn-ink h-12 px-6 text-[15px]">Back to home</RouteLink>
            </div>
        );
    }

    return (
        <form onSubmit={onSubmit} className="grid gap-5">
            <div className="grid gap-5 min-[701px]:grid-cols-2">
                <div>
                    <label htmlFor="name" className={label}>Name</label>
                    <input type="text" id="name" name="name" value={form.name} onChange={onChange} required autoComplete="name" className={field} />
                </div>
                <div>
                    <label htmlFor="email" className={label}>Email</label>
                    <input type="email" id="email" name="email" value={form.email} onChange={onChange} required autoComplete="email" className={field} />
                </div>
            </div>
            <div>
                <label htmlFor="organization" className={label}>Organization</label>
                <input type="text" id="organization" name="organization" value={form.organization} onChange={onChange} autoComplete="organization" className={field} />
            </div>
            <div>
                <label htmlFor="projectDescription" className={label}>Describe your project</label>
                <textarea
                    id="projectDescription"
                    name="projectDescription"
                    placeholder="e.g., I want to build an AI chatbot for my e-commerce site..."
                    value={form.projectDescription}
                    onChange={onChange}
                    required
                    rows={6}
                    className={`${field} h-auto py-3 resize-y`}
                />
            </div>
            {status === 'error' && (
                <p role="alert" className="m-0 text-[14px] font-medium text-orange-ink">
                    Something went wrong sending that. Check your connection and try again, or email us at <a href={`mailto:${EMAIL}`} className="underline">{EMAIL}</a>.
                </p>
            )}
            <button type="submit" disabled={status === 'sending'} className="btn btn-orange h-14 px-7 text-[16px] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0">
                {status === 'sending' ? 'Sending…' : 'Launch project'} <Arrow />
            </button>
        </form>
    );
};

const ContactPage: React.FC<{ initialDescription: string }> = ({ initialDescription }) => (
    <>
        <PageHero
            eyebrow="Start a project"
            title="Start Your Project"
            blurb="Describe your idea, and we'll get in touch."
            aside={
                <p className="m-0 font-mono text-[12px] text-ink-4 leading-[1.8]">
                    <a href={`mailto:${EMAIL}`} className="text-bone hover:text-white transition-colors">{EMAIL}</a><br />
                    <a href={PHONE_TEL} className="text-bone hover:text-white transition-colors">{PHONE_DISPLAY}</a>
                </p>
            }
        />
        <section className="max-w-site mx-auto px-6 pt-16 pb-24">
            <div className="grid gap-10 items-start min-[901px]:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)]">
                <div data-reveal="0" className="max-w-[440px]">
                    <Eyebrow>What happens next</Eyebrow>
                    <ol className="list-none m-0 p-0 flex flex-col">
                        {[
                            ['We read it', 'A person, the same day.'],
                            ['We reply', 'With questions if we have them, a rough shape if we don\'t.'],
                            ['We talk', 'A short call to find the smartest path forward.'],
                        ].map(([t, d], i) => (
                            <li key={t} className="flex gap-4 py-4 border-t border-line last:border-b">
                                <span className="font-mono text-[12px] text-orange-ink pt-1">{pad(i + 1)}</span>
                                <span><span className="block font-display uppercase font-bold text-[22px]">{t}</span><span className="text-[15px] text-ink-3">{d}</span></span>
                            </li>
                        ))}
                    </ol>
                </div>
                <div data-reveal="80" className="rounded-3xl border border-line bg-white p-6 min-[901px]:p-9">
                    <ProjectForm initialDescription={initialDescription} />
                </div>
            </div>
        </section>
    </>
);

/* ------------------------------------------------------------------ *
 *  Legal, 404
 * ------------------------------------------------------------------ */

const LegalPage: React.FC<{ title: string; content: string }> = ({ title, content }) => (
    <>
        <PageHero eyebrow="Legal" title={title} />
        <section className="max-w-site mx-auto px-6 pt-16 pb-24">
            <div data-reveal="0" className="legal max-w-[820px] rounded-3xl border border-line bg-white p-6 min-[901px]:p-10 text-[16px] text-ink-2">{content}</div>
        </section>
    </>
);

const NotFoundPage: React.FC = () => (
    <>
        <PageHero eyebrow="Error 404" title="Page not found" blurb="That link doesn't lead anywhere on this site. Here's the way back." />
        <section className="max-w-site mx-auto px-6 pt-16 pb-24">
            <RouteLink to="/" className="btn btn-ink h-12 px-6 text-[15px]">Back to home <Arrow /></RouteLink>
        </section>
    </>
);

/* ------------------------------------------------------------------ *
 *  App
 * ------------------------------------------------------------------ */

function App({ initialRoute }: { initialRoute?: string } = {}) {
    const route = useRoute(initialRoute);
    const page = PAGES.find(p => p.path === route);
    const [menuOpen, setMenuOpen] = useState(false);
    const mainRef = useRef<HTMLElement>(null);
    const firstRender = useRef(true);

    // Text piped into the contact form from a service row. It rides in React state rather
    // than the URL so nobody's project description ends up in a history entry.
    const [projectPrefill, setProjectPrefill] = useState('');

    useEffect(() => {
        applyHeadMeta(page);
        setMenuOpen(false);
        window.scrollTo({ top: 0, behavior: 'auto' });
        if (firstRender.current) { firstRender.current = false; return; }
        mainRef.current?.focus({ preventScroll: true });
    }, [route, page]);

    useReveal(route);

    const discuss = (title: string) => {
        setProjectPrefill(`I'd like to talk about ${title}. `);
        navigate('/contact');
    };

    const renderPage = () => {
        switch (route) {
            case '/': return <HomePage />;
            case '/services': return <><ServicesPage onDiscuss={discuss} /><Pager pageKey="services" /><Cta /></>;
            case '/products': return <><ProductsPage /><Pager pageKey="products" /><Cta /></>;
            case '/philosophy': return <><PhilosophyPage /><Pager pageKey="philosophy" /><Cta /></>;
            case '/team': return <><TeamPage /><Pager pageKey="team" /><Cta /></>;
            case '/process': return <><ProcessPage /><Pager pageKey="process" /><Cta /></>;
            case '/faq': return <><FaqPage /><Pager pageKey="faq" /><Cta /></>;
            case '/arcade': return <><ArcadePage /><Pager pageKey="arcade" /><Cta /></>;
            case '/contact': return <ContactPage initialDescription={projectPrefill} />;
            case '/terms': return <LegalPage title="Terms of Service" content={TERMS} />;
            case '/privacy': return <LegalPage title="Privacy Policy" content={PRIVACY} />;
            default: return <NotFoundPage />;
        }
    };

    return (
        <div className="relative min-h-screen bg-paper text-ink [overflow-x:clip]">
            <Header route={route} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
            {/* key={route} throws the previous page away rather than reconciling into the next
                one, so the hero's WebGL context is disposed and every scroll hook re-measures. */}
            <main key={route} ref={mainRef} tabIndex={-1} className="outline-none">
                {renderPage()}
            </main>
            <Footer />
            <MobileBar />
        </div>
    );
}

export default App;
