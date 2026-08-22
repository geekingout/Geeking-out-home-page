import React, { useEffect, useRef, useState } from 'react';
import { FAQ, PROCESS, SITE } from '../content';
import { href } from '../router';
import { ACCENT_HEX, Button, Icon, PageTitle, Panel, Reveal, Typewriter } from '../ui';

/**
 * Campaign — the process page, framed as a campaign log. A vertical rail runs down the page; each
 * PROCESS phase is an act, each step a chapter, numbered continuously. Nodes fade in and light
 * their stretch of rail as they scroll into view. Every step name, phase title and field note is
 * rendered straight from content.ts.
 */

/* ─── Small formatting helpers ─────────────────────────────────────────────────────────── */
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
const roman = (n: number) => ROMAN[n - 1] ?? String(n);
const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
const words = (n: number) => WORDS[n] ?? String(n);
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const pad = (n: number) => String(n).padStart(2, '0');
const plural = (n: number, one: string, many: string) => (n === 1 ? one : many);

/* ─── Campaign structure, derived from PROCESS ─────────────────────────────────────────── */
const ACTS = PROCESS.length;
const TOTAL = PROCESS.reduce((sum, phase) => sum + phase.steps.length, 0);
/** Number of the first chapter in each act (1-based). */
const FIRST_CHAPTER = PROCESS.map((_, i) => PROCESS.slice(0, i).reduce((sum, phase) => sum + phase.steps.length, 0) + 1);
/** Acts plus chapters: every node on the rail, in order. Used to place each node on the gradient. */
const RAIL_NODES = ACTS + TOTAL;
/** Sequence index of a node on the rail: act headers count as nodes too. */
const railIndex = (act: number, chapter?: number) => (chapter === undefined ? act - 1 + FIRST_CHAPTER[act - 1] - 1 : act + chapter - 1);

/* ─── Rail gradient: gold at the start, purple through the middle, cyan at the end ─────── */
const mix = (a: string, b: string, t: number) => {
    const ch = (hex: string, i: number) => parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16);
    return `#${[0, 1, 2].map(i => Math.round(ch(a, i) + (ch(b, i) - ch(a, i)) * t).toString(16).padStart(2, '0')).join('')}`;
};
const RAIL_STOPS = [ACCENT_HEX.yellow, ACCENT_HEX.purple, ACCENT_HEX.cyan];
const railColor = (t: number) => {
    const clamped = Math.max(0, Math.min(1, t));
    const seg = Math.min(RAIL_STOPS.length - 2, Math.floor(clamped * (RAIL_STOPS.length - 1)));
    return mix(RAIL_STOPS[seg], RAIL_STOPS[seg + 1], clamped * (RAIL_STOPS.length - 1) - seg);
};
/** Gradient endpoints for the node at sequence index `i`. */
const railSpan = (i: number) => [railColor(i / RAIL_NODES), railColor((i + 1) / RAIL_NODES)] as const;

/* ─── Field notes: exact sentences lifted from FAQ answers ─────────────────────────────── */
const SENTENCE = /[^.!?]+[.!?]+(?=\s|$)/g;
const sentences = (text: string) => (text.match(SENTENCE) ?? []).map(s => s.trim());
/**
 * Finds the first FAQ sentence containing `key` and returns it with its codex entry. The keys are
 * lookup handles, not copy: what gets rendered is always the sentence as written in content.ts.
 */
const fieldNote = (key: string) => {
    for (let i = 0; i < FAQ.length; i++) {
        const hit = sentences(FAQ[i].answer).find(s => s.includes(key));
        if (hit) return { index: i, question: FAQ[i].question, text: hit };
    }
    return null;
};
const FIELD_NOTES = ['in writing', 'working slice', 'stays yours', 'swapped later']
    .map(fieldNote)
    .filter((note): note is NonNullable<typeof note> => note !== null)
    // one note per codex entry, so keys stay unique even if two keys ever land in the same answer
    .filter((note, i, all) => all.findIndex(other => other.index === note.index) === i);

/* ─── In-view hook: one-shot, same thresholds as <Reveal> ──────────────────────────────── */
function useInView<T extends HTMLElement>(): [React.RefObject<T | null>, boolean] {
    const ref = useRef<T>(null);
    const [inView, setInView] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el || !('IntersectionObserver' in window)) { setInView(true); return; }
        const io = new IntersectionObserver(entries => {
            if (entries.some(e => e.isIntersecting)) { setInView(true); io.disconnect(); }
        }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
        io.observe(el);
        return () => io.disconnect();
    }, []);
    return [ref, inView];
}

/* ─── Rail pieces ──────────────────────────────────────────────────────────────────────── */
/** Column geometry shared by every row: the rail sits in the centre of the first grid column. */
const ROW_GRID = 'relative grid grid-cols-[1.5rem_1fr] md:grid-cols-[3rem_1fr] gap-x-4 md:gap-x-6';
const RAIL_X = 'left-[calc(0.75rem-0.5px)] md:left-[calc(1.5rem-0.5px)]';

/** The lit stretch of rail behind one node. Grows downward once the node is in view. */
const LitRail: React.FC<{ from: string; to: string; lit: boolean; delay: number; top?: string; fade?: boolean }> = ({ from, to, lit, delay, top = '0', fade }) => (
    <span
        aria-hidden="true"
        className={`absolute bottom-0 ${RAIL_X} w-px origin-top transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)]`}
        style={{
            top,
            transform: lit ? 'scaleY(1)' : 'scaleY(0)',
            transitionDelay: `${delay + 120}ms`,
            background: `linear-gradient(180deg, ${from}, ${fade ? 'transparent' : to})`,
            boxShadow: `0 0 8px ${from}80`,
        }}
    />
);

/* ─── Act header ───────────────────────────────────────────────────────────────────────── */
const ActHeader: React.FC<{ act: number; title: string; first: number; last: number }> = ({ act, title, first, last }) => {
    const [ref, inView] = useInView<HTMLDivElement>();
    const [from, to] = railSpan(railIndex(act));
    const isFirst = act === 1;
    return (
        <div ref={ref} className={`reveal ${inView ? 'is-visible' : ''} ${ROW_GRID} ${isFirst ? '' : 'pt-12 md:pt-16'}`}>
            <LitRail from={from} to={to} lit={inView} delay={0} top={isFirst ? '0.75rem' : '0'} />
            {/* act node: a hollow diamond on the rail, level with the panel label */}
            <span
                aria-hidden="true"
                className={`relative justify-self-center self-start mt-[5px] w-3.5 h-3.5 rotate-45 border bg-bg transition-colors duration-700 ${inView ? 'border-brand-yellow shadow-[0_0_14px_rgba(245,211,36,0.7)]' : 'border-line-strong'}`}
            />
            <Panel label={`Act ${roman(act)}`} className="min-w-0">
                {/* watermark numeral, clipped inside the panel so the hairline border stays clean */}
                <span className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
                    <span className="watermark absolute -right-2 -bottom-4 text-[7rem] md:text-[11rem]">{roman(act)}</span>
                </span>
                <div className="relative flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
                    <div className="min-w-0">
                        <p className="hud-label mb-3">
                            <span className="numeral text-brand-cyan">{pad(first)}</span>
                            <span className="mx-2 text-ink-mute" aria-hidden="true">&ndash;</span>
                            <span className="sr-only">to</span>
                            <span className="numeral text-brand-cyan">{pad(last)}</span>
                            <span className="ml-3">{plural(last - first + 1, 'Chapter', 'Chapters')}</span>
                        </p>
                        <h2 id={`act-${act}`} className="display title-gradient text-4xl md:text-5xl break-words">{title}</h2>
                    </div>
                    <p className="hud-label text-[0.62rem] text-ink-mute">
                        Act <span className="numeral text-ink">{roman(act)}</span> of <span className="numeral text-ink">{roman(ACTS)}</span>
                    </p>
                </div>
            </Panel>
        </div>
    );
};

/* ─── Chapter node ─────────────────────────────────────────────────────────────────────── */
type ChapterProps = { n: number; name: string; act: number; actTitle: string; delay: number; current: boolean; last: boolean };

const Chapter: React.FC<ChapterProps> = ({ n, name, act, actTitle, delay, current, last }) => {
    const [ref, inView] = useInView<HTMLLIElement>();
    const [from, to] = railSpan(railIndex(act, n));
    return (
        <li ref={ref} className={`reveal ${inView ? 'is-visible' : ''} ${ROW_GRID} group py-5 md:py-7`} style={{ transitionDelay: `${delay}ms` }}>
            <LitRail from={from} to={to} lit={inView} delay={delay} fade={last} />
            {/* chapter node: a glowing square; the current chapter pulses gold */}
            <span
                aria-hidden="true"
                className={`dot relative justify-self-center self-start mt-[8px] md:mt-[11px] transition-colors duration-700 ${current ? 'text-brand-yellow animate-glow-pulse' : inView ? '' : 'text-ink-mute'}`}
                style={!current && inView ? { color: from } : undefined}
            />
            <div className="min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
                    <span className={`numeral text-sm transition-colors duration-300 ${current ? 'text-brand-yellow glow-text-gold' : 'text-ink-mute group-hover:text-brand-yellow'}`}>{pad(n)}</span>
                    <h3 className="display text-2xl md:text-3xl text-ink break-words">{name}</h3>
                    {current && (
                        <span className="tag tag--yellow animate-pulse-soft">
                            <span className="dot" aria-hidden="true" />
                            You are here
                        </span>
                    )}
                    <span className="numeral text-xs text-ink-mute hidden md:inline md:ml-auto">{pad(n)} / {pad(TOTAL)}</span>
                </div>
                <p className="hud-label mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span>Act {roman(act)}</span>
                    <span className="text-ink-mute" aria-hidden="true">/</span>
                    <span className="text-ink-mute">{actTitle}</span>
                    <span className="rule rule--left h-px w-0 group-hover:w-16 transition-[width] duration-300 hidden md:block" aria-hidden="true" />
                </p>
            </div>
        </li>
    );
};

/* ─── Page ─────────────────────────────────────────────────────────────────────────────── */
export const Campaign: React.FC = () => {
    const subtitle = `How a mission runs, from first call to maintenance. ${cap(words(ACTS))} ${plural(ACTS, 'act', 'acts')}, ${words(TOTAL)} ${plural(TOTAL, 'chapter', 'chapters')}.`;
    const firstAct = PROCESS[0];

    return (
        <section className="page wrap">
            <PageTitle chapter="04" eyebrow="Campaign" title="Campaign" subtitle={subtitle} />

            {/* Campaign log: a HUD strip with the structure at a glance */}
            <div className="animate-fade-up [animation-delay:240ms] mb-14 md:mb-20">
                <Panel padding="tight" className="md:px-7">
                    <div className="flex flex-col md:flex-row md:items-center gap-5 md:gap-10">
                        <div className="flex items-center gap-3 min-w-0">
                            <Icon name="map" size={16} className="text-brand-cyan" />
                            <Typewriter as="p" className="hud-label text-brand-cyan" text="Campaign log loaded" startDelay={500} />
                        </div>
                        <dl className="grid grid-cols-3 gap-3 md:gap-10 md:ml-auto">
                            <div className="min-w-0">
                                <dt className="hud-label text-[0.62rem]">Acts</dt>
                                <dd className="numeral text-2xl text-ink leading-none mt-1">{pad(ACTS)}</dd>
                            </div>
                            <div className="min-w-0">
                                <dt className="hud-label text-[0.62rem]">Chapters</dt>
                                <dd className="numeral text-2xl text-ink leading-none mt-1">{pad(TOTAL)}</dd>
                            </div>
                            <div className="min-w-0">
                                <dt className="hud-label text-[0.62rem]">Current</dt>
                                <dd className="numeral text-2xl text-brand-yellow glow-text-gold leading-none mt-1">{pad(1)}</dd>
                            </div>
                        </dl>
                    </div>
                    {/* chapter ticks: one per chapter, the current one lit */}
                    <div className="mt-5 flex gap-1" aria-hidden="true">
                        {Array.from({ length: TOTAL }, (_, i) => (
                            <span key={i} className={`h-0.5 flex-1 ${i === 0 ? 'bg-brand-yellow shadow-[0_0_8px_rgba(245,211,36,0.8)]' : 'bg-line-strong'}`} />
                        ))}
                    </div>
                </Panel>
            </div>

            {/* Timeline */}
            <section aria-labelledby="campaign-map">
            <div className="flex items-center justify-between gap-4 mb-8">
                <h2 id="campaign-map" className="hud-label text-ink">Campaign map</h2>
                <p className="hud-label text-[0.62rem] text-ink-mute hidden sm:block">Scroll to advance</p>
            </div>
            <div className="relative pb-12">
                {/* the dim rail: the path ahead. Lit stretches are drawn by each node as it arrives. */}
                <span
                    aria-hidden="true"
                    className={`absolute top-3 bottom-0 ${RAIL_X} w-px bg-line-strong`}
                    style={{ maskImage: 'linear-gradient(180deg, #000 calc(100% - 6rem), transparent)', WebkitMaskImage: 'linear-gradient(180deg, #000 calc(100% - 6rem), transparent)' }}
                />
                {PROCESS.map((phase, i) => {
                    const act = i + 1;
                    const first = FIRST_CHAPTER[i];
                    const last = first + phase.steps.length - 1;
                    return (
                        <section key={phase.phase} aria-labelledby={`act-${act}`}>
                            <ActHeader act={act} title={phase.title} first={first} last={last} />
                            <ol start={first} role="list" className="list-none m-0 p-0">
                                {phase.steps.map((step, si) => {
                                    const n = first + si;
                                    return (
                                        <Chapter
                                            key={step}
                                            n={n}
                                            name={step}
                                            act={act}
                                            actTitle={phase.title}
                                            delay={(si + 1) * 70}
                                            current={n === 1}
                                            last={n === TOTAL}
                                        />
                                    );
                                })}
                            </ol>
                        </section>
                    );
                })}
            </div>
            </section>

            {/* Field notes: exact sentences from the codex */}
            {FIELD_NOTES.length > 0 && (
                <Reveal className="mt-10 md:mt-16">
                    <Panel label="Field notes" corners padding="roomy">
                        <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3 mb-8 md:mb-10">
                            <h2 className="display title-gradient text-4xl md:text-5xl break-words">From the codex</h2>
                            <p className="hud-label text-[0.62rem] text-ink-mute">
                                <span className="numeral text-ink">{pad(FIELD_NOTES.length)}</span> entries, verbatim
                            </p>
                        </div>
                        <ul role="list" className="grid md:grid-cols-2 gap-x-10 gap-y-8 list-none m-0 p-0">
                            {FIELD_NOTES.map((note, i) => (
                                <Reveal as="li" key={note.index} delay={i * 80} className="min-w-0 border-l border-brand-yellow/60 pl-5 md:pl-6">
                                    <blockquote className="m-0">
                                        <p className="text-lg md:text-xl text-ink leading-relaxed break-words">&ldquo;{note.text}&rdquo;</p>
                                        <footer className="hud-label text-[0.62rem] mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                                            <span>Codex <span className="numeral text-brand-cyan">{pad(note.index + 1)}</span></span>
                                            <span className="text-ink-mute" aria-hidden="true">/</span>
                                            <span className="text-ink-mute normal-case tracking-normal font-body text-sm">{note.question}</span>
                                        </footer>
                                    </blockquote>
                                </Reveal>
                            ))}
                        </ul>
                        <div className="mt-8 md:mt-10 pt-6 border-t border-line flex">
                            <Button href={href('/codex')} variant="ghost">Read the codex</Button>
                        </div>
                    </Panel>
                </Reveal>
            )}

            {/* CTA */}
            <Reveal className="mt-10 md:mt-14">
                <Panel glow="yellow" corners padding="roomy">
                    <div className="flex flex-col md:flex-row md:items-center gap-8 md:gap-12">
                        <div className="min-w-0 flex-1">
                            <p className="hud-label text-brand-yellow mb-4 flex items-center gap-3">
                                <span className="dot animate-pulse-soft" aria-hidden="true" />
                                Next objective
                            </p>
                            <h2 className="display title-gold text-4xl sm:text-5xl md:text-6xl break-words">Begin Act {roman(1)}</h2>
                            <p className="mt-4 text-lg text-ink-dim leading-relaxed max-w-xl">
                                Chapter {pad(1)} opens with a briefing. First objective: <span className="text-ink">{firstAct.steps[0]}</span>.
                            </p>
                        </div>
                        <div className="flex flex-col items-start md:items-end gap-4 shrink-0">
                            <Button href={href('/contact')} variant="gold" size="lg" iconRight="arrowRight">Begin Act {roman(1)}</Button>
                            <p className="hud-label text-[0.62rem] text-ink-mute">
                                Comms <span className="mx-1" aria-hidden="true">/</span>{' '}
                                <a href={`mailto:${SITE.email}`} className="text-ink-dim hover:text-brand-yellow transition-colors normal-case tracking-normal">{SITE.email}</a>
                            </p>
                        </div>
                    </div>
                </Panel>
            </Reveal>
        </section>
    );
};
