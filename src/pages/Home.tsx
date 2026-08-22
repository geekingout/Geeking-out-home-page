import React, { useEffect, useRef } from 'react';
import { FAQ, PHILOSOPHY, PROCESS, PRODUCTS, SERVICES, SITE, TEAM, TESTIMONIALS, TICKER_ITEMS } from '../content';
import { href, navigate } from '../router';
import { ACCENT_HEX, Button, Icon, Panel, Reveal, type IconName } from '../ui';

/* ─── Local helpers ───────────────────────────────────────────────────────────────────── */

const pad = (n: number) => String(n).padStart(2, '0');

/** A gold tabular number followed by its unit, e.g. "6 services". */
const Count: React.FC<{ n: number; unit: string }> = ({ n, unit }) => (
    <>
        <span className="numeral text-brand-yellow">{n}</span> {unit}
    </>
);

/** Section header: short rule + HUD eyebrow, the h2, and an optional aside (a link) on the right. */
const SectionHead: React.FC<{ id: string; eyebrow: string; title: string; aside?: React.ReactNode }> = ({ id, eyebrow, title, aside }) => (
    <Reveal className="mb-10 md:mb-14 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
            <p className="flex items-center gap-4 mb-4">
                <span className="rule rule--right w-10" aria-hidden="true" />
                <span className="hud-label">{eyebrow}</span>
            </p>
            <h2 id={id} className="display text-4xl md:text-5xl text-ink break-words">{title}</h2>
        </div>
        {aside && <div className="shrink-0">{aside}</div>}
    </Reveal>
);

/* ─── Data derived from content.ts (never retyped) ────────────────────────────────────── */

const CHAPTERS = PROCESS.reduce((n, phase) => n + phase.steps.length, 0);
const ACTS = PROCESS.length;

type Destination = { to: string; icon: IconName; name: string; contents: React.ReactNode };

const DESTINATIONS: Destination[] = [
    { to: '/missions', icon: 'cpu', name: 'Missions', contents: <Count n={SERVICES.length} unit="services" /> },
    { to: '/arsenal', icon: 'box', name: 'Arsenal', contents: <Count n={PRODUCTS.length} unit="products" /> },
    { to: '/squad', icon: 'users', name: 'Squad', contents: <Count n={TEAM.length} unit="operatives" /> },
    { to: '/campaign', icon: 'map', name: 'Campaign', contents: <><Count n={CHAPTERS} unit="chapters" /> in <Count n={ACTS} unit="acts" /></> },
    { to: '/codex', icon: 'book', name: 'Codex', contents: <><Count n={FAQ.length} unit="entries" /> · <Count n={TESTIMONIALS.length} unit="field reports" /></> },
];

const READOUTS: { label: string; value: React.ReactNode }[] = [
    { label: 'Status', value: <><span className="dot text-brand-lime animate-pulse-soft mr-2.5 align-middle" aria-hidden="true" />Accepting missions</> },
    { label: 'Base', value: SITE.location },
    { label: 'Response', value: SITE.responseTime },
    { label: 'Squad', value: <Count n={TEAM.length} unit="operatives" /> },
];

const REPORTS = [TESTIMONIALS[0], TESTIMONIALS[1], TESTIMONIALS[7]];

// Four copies: the track translates by 50%, so any even number of copies loops seamlessly,
// and four keeps the band full on ultra-wide viewports.
const TICKER = Array.from({ length: 4 }, () => TICKER_ITEMS).flat();

/* ─── Title screen ────────────────────────────────────────────────────────────────────── */

export const Home: React.FC = () => {
    const menuRef = useRef<HTMLElement>(null);

    // Title-screen affordance: Enter with nothing focused is "Press Start".
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key !== 'Enter' || e.defaultPrevented || e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
            if (document.activeElement !== document.body) return;
            navigate('/contact');
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    // Uses the document's scroll-behavior (smooth, or auto under prefers-reduced-motion).
    const scrollToMenu = () => menuRef.current?.scrollIntoView();

    return (
        <>
            {/* ── 1. Hero ──────────────────────────────────────────────────────────────── */}
            {/* min-h-svh (not 100vh): on mobile Safari the bottom strip must sit above the browser toolbar on load */}
            <section className="relative min-h-svh flex flex-col items-center justify-center pt-24 pb-32 overflow-hidden" aria-labelledby="wordmark">
                <div className="grid-bg absolute inset-0 pointer-events-none" aria-hidden="true" />
                <div className="scanline top-0" aria-hidden="true" />

                <div className="wrap relative w-full flex flex-col items-center text-center">
                    <p className="hud-label animate-fade-in">{SITE.location} · 2026</p>

                    {/* The purple aura lives on a wrapper: a filter on the same element as the
                        background-clip:text gradient breaks the clipping in Safari. Sizes are chosen
                        so "GEEKING OUT" stays on one line from 320px up (condensed caps ~0.5em each). */}
                    <div className="mt-6 w-full animate-fade-up [animation-delay:120ms] drop-shadow-[0_0_48px_rgba(155,125,255,0.28)]">
                        <h1
                            id="wordmark"
                            className="display title-gradient text-[length:clamp(3rem,15vw,6rem)] lg:text-9xl xl:text-[11rem] leading-none break-words"
                        >
                            {SITE.name}
                        </h1>
                    </div>

                    <div className="mt-8 md:mt-10 w-full max-w-2xl flex items-center gap-4 sm:gap-6 animate-fade-up [animation-delay:280ms]">
                        <span className="rule rule--right flex-1 min-w-4" aria-hidden="true" />
                        <p className="hud-label text-[0.72rem] sm:text-sm md:text-base tracking-[0.22em] sm:tracking-[0.32em] text-ink text-balance">{SITE.tagline}</p>
                        <span className="rule rule--left flex-1 min-w-4" aria-hidden="true" />
                    </div>

                    <div className="mt-10 md:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up [animation-delay:440ms]">
                        <Button href={href('/contact')} variant="gold" size="lg" kbd="ENTER">Press Start</Button>
                        <Button href={href('/missions')} variant="outline" size="lg" iconRight="arrowRight">Continue</Button>
                    </div>
                </div>

                {/* bottom strip: build stamp · scroll cue · start prompt */}
                <div className="absolute inset-x-0 bottom-0 animate-fade-in [animation-delay:900ms]">
                    <div className="wrap grid grid-cols-[1fr_auto_1fr] items-end pb-6 md:pb-8">
                        <span className="hud-label text-[0.6rem] hidden sm:block">{SITE.build}</span>
                        <button
                            type="button"
                            onClick={scrollToMenu}
                            className="col-start-2 flex flex-col items-center gap-2 hud-label text-[0.6rem] hover:text-brand-yellow transition-colors"
                        >
                            <span className="animate-float" style={{ animationDuration: '2.6s' }}><Icon name="chevronDown" size={18} /></span>
                            <span>Scroll<span className="sr-only"> to destinations</span></span>
                        </button>
                        <span className="hud-label text-[0.6rem] hidden sm:block text-right animate-pulse-soft">Press Start to begin</span>
                    </div>
                </div>
            </section>

            {/* ── 2. Status strip ──────────────────────────────────────────────────────── */}
            <section className="wrap pt-8 md:pt-12" aria-label="Status readouts">
                <Reveal>
                    <dl className="panel panel--solid grid grid-cols-2 lg:grid-cols-4">
                        {READOUTS.map((r, i) => (
                            <div key={r.label} className={`relative min-w-0 px-4 py-4 md:px-7 md:py-5 ${i >= 2 ? 'border-t border-line lg:border-t-0' : ''}`}>
                                {i > 0 && <span className={`rule-v absolute left-0 top-4 bottom-4 ${i % 2 === 1 ? '' : 'hidden lg:block'}`} aria-hidden="true" />}
                                <dt className="hud-label text-[0.62rem]">{r.label}</dt>
                                <dd className="mt-2 font-ui font-semibold text-base md:text-lg tracking-[0.06em] text-ink">{r.value}</dd>
                            </div>
                        ))}
                    </dl>
                </Reveal>
            </section>

            {/* ── 3. Marquee ───────────────────────────────────────────────────────────── */}
            <div className="mt-10 md:mt-14 border-y border-line">
                <div className="marquee py-3" aria-hidden="true">
                    <div className="marquee__track">
                        {TICKER.map((item, i) => (
                            <span key={i} className="hud-label inline-flex items-center gap-8 pr-8">
                                {item}
                                <Icon name="diamond" size={7} className="text-brand-yellow fill-current" />
                            </span>
                        ))}
                    </div>
                </div>
                <ul className="sr-only" aria-label="Mission types">
                    {TICKER_ITEMS.map(item => <li key={item}>{item}</li>)}
                </ul>
            </div>

            {/* ── 4. Select destination ────────────────────────────────────────────────── */}
            <section ref={menuRef} className="wrap py-20 md:py-28 scroll-mt-24" aria-labelledby="destinations">
                <SectionHead id="destinations" eyebrow="Main menu" title="Select destination" />
                <ul className="grid gap-4 md:gap-5 sm:grid-cols-2 lg:grid-cols-6">
                    {DESTINATIONS.map((d, i) => (
                        <Reveal
                            key={d.to}
                            as="li"
                            delay={i * 60}
                            className={`min-w-0 ${i < 3 ? 'lg:col-span-2' : 'lg:col-span-3'} ${i === 4 ? 'sm:col-span-2' : ''}`}
                        >
                            <a
                                href={href(d.to)}
                                className="group block h-full hover:[--corner-color:var(--color-brand-yellow)] focus-visible:[--corner-color:var(--color-brand-yellow)]"
                            >
                                <Panel hover corners className="h-full flex flex-col gap-8">
                                    <div className="flex items-center justify-between">
                                        <span className="numeral text-brand-yellow text-xs">{pad(i + 1)}</span>
                                        <Icon name={d.icon} size={22} className="text-ink-dim group-hover:text-brand-yellow transition-colors" />
                                    </div>
                                    <div className="mt-auto min-w-0">
                                        <h3 className="display text-2xl text-ink">{d.name}</h3>
                                        <p className="mt-2 text-sm text-ink-dim">{d.contents}</p>
                                    </div>
                                    <span className="flex items-center justify-between pt-4 border-t border-line hud-label text-[0.6rem] group-hover:text-ink transition-colors">
                                        Select
                                        <Icon name="arrowRight" size={14} className="transition-transform group-hover:translate-x-1" />
                                    </span>
                                </Panel>
                            </a>
                        </Reveal>
                    ))}
                </ul>
            </section>

            {/* ── 5. Directives ────────────────────────────────────────────────────────── */}
            <section className="wrap pb-20 md:pb-28" aria-labelledby="directives">
                <SectionHead id="directives" eyebrow="How we operate" title="Directives" />
                <ul className="grid gap-4 md:gap-5 md:grid-cols-3">
                    {PHILOSOPHY.map((p, i) => (
                        <Reveal key={p.number} as="li" delay={i * 80} className="min-w-0">
                            <Panel corners className="h-full">
                                <div className="flex items-center gap-4">
                                    <span className="numeral text-brand-yellow text-sm">{p.number}</span>
                                    <span className="rule rule--gold w-16" aria-hidden="true" />
                                </div>
                                <h3 className="display text-2xl text-ink mt-5">{p.title}</h3>
                                <p className="mt-3 text-ink-dim leading-relaxed">{p.description}</p>
                            </Panel>
                        </Reveal>
                    ))}
                </ul>
            </section>

            {/* ── 6. Field reports ─────────────────────────────────────────────────────── */}
            <section className="wrap pb-20 md:pb-28" aria-labelledby="field-reports">
                <SectionHead
                    id="field-reports"
                    eyebrow="From the Codex"
                    title="Field reports"
                    aside={<Button href={href('/codex')} variant="ghost">All field reports</Button>}
                />
                <ul className="grid gap-4 md:gap-5 md:grid-cols-3">
                    {REPORTS.map((t, i) => (
                        <Reveal key={t.name} as="li" delay={i * 80} className="min-w-0 flex">
                            <Panel label={`Report ${pad(i + 1)}`} corners className="flex-1 min-w-0 flex flex-col">
                                <figure className="flex-1 flex flex-col">
                                    <blockquote className="text-lg text-ink leading-relaxed">{t.text}</blockquote>
                                    <figcaption className="mt-auto pt-6">
                                        <div className="pt-4 border-t border-line flex items-start gap-3">
                                            <span className="dot mt-2" style={{ color: ACCENT_HEX[t.accent] }} aria-hidden="true" />
                                            <span className="min-w-0">
                                                <span className="block font-ui font-semibold text-ink">{t.name}</span>
                                                <span className="block mt-1 hud-label text-[0.6rem]">{t.role}</span>
                                            </span>
                                        </div>
                                    </figcaption>
                                </figure>
                            </Panel>
                        </Reveal>
                    ))}
                </ul>
            </section>

            {/* ── 7. Final CTA ─────────────────────────────────────────────────────────── */}
            <section className="wrap" aria-labelledby="start-mission">
                <Reveal>
                    <Panel glow="yellow" corners padding="roomy" className="text-center">
                        <div className="grid-bg absolute inset-0 pointer-events-none" aria-hidden="true" />
                        <div className="relative">
                            <p className="hud-label text-brand-yellow">Ready?</p>
                            <h2 id="start-mission" className="display text-4xl md:text-6xl text-ink mt-4 break-words">Start your mission</h2>
                            <p className="mt-5 text-lg text-ink-dim max-w-xl mx-auto">Reach out and we&apos;ll get back to you {SITE.responseTime}.</p>
                            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
                                <Button href={href('/contact')} variant="gold" size="lg" iconRight="arrowRight">Start mission</Button>
                                <Button href={`mailto:${SITE.email}`} variant="ghost" icon="mail" iconRight="arrowUpRight">{SITE.email}</Button>
                            </div>
                        </div>
                    </Panel>
                </Reveal>
            </section>
        </>
    );
};
