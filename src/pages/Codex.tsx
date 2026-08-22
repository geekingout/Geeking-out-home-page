import React, { useId, useRef, useState, useSyncExternalStore } from 'react';
import { FAQ, PHILOSOPHY, SITE, TESTIMONIALS } from '../content';
import { href } from '../router';
import { ACCENT_HEX, Button, Icon, PageTitle, Panel, Reveal, Typewriter } from '../ui';

/*
 * Codex — chapter 05. Two screens in one: the FAQ as "entries" you browse like a game's codex
 * (a selectable list on the left, the decoded entry on the right), then the testimonials as
 * "field reports". Every answer, quote, name and role is rendered verbatim from content.ts;
 * this file only adds the menu chrome around them.
 */

const pad = (n: number) => String(n).padStart(2, '0');

const ENTRIES_ID = 'codex-entries';
const REPORTS_ID = 'codex-reports';

/* ─── Section header: numbered eyebrow, the h2, a right-hand readout, a rule ───────────── */
const SectionHead: React.FC<{ id: string; num: string; eyebrow: string; title: string; readout?: React.ReactNode }> = ({ id, num, eyebrow, title, readout }) => (
    <div className="mb-8 md:mb-10">
        <div className="flex items-end justify-between gap-6">
            <div className="min-w-0">
                <p className="flex items-center gap-3 mb-4">
                    <span className="numeral text-brand-yellow text-xs">{num}</span>
                    <span className="rule rule--left w-8 h-px" aria-hidden="true" />
                    <span className="hud-label">{eyebrow}</span>
                </p>
                <h2 id={id} tabIndex={-1} className="display title-gradient text-4xl md:text-5xl break-words">{title}</h2>
            </div>
            {readout && <p className="hud-label shrink-0 text-right hidden sm:block">{readout}</p>}
        </div>
        <div className="rule rule--left mt-6" aria-hidden="true" />
    </div>
);

/* ─── Sub-menu under the title: jump to a section (no hash links — the router owns the hash) ── */
const SECTIONS = [
    { id: ENTRIES_ID, num: '05.1', label: 'Entries', count: FAQ.length },
    { id: REPORTS_ID, num: '05.2', label: 'Field reports', count: TESTIMONIALS.length },
];

// Scroll the section into view, then hand focus to its heading so keyboard and screen-reader
// users land where the page just scrolled (the heading carries tabIndex -1 for this).
const jump = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ block: 'start' });
    document.getElementById(`${id}-title`)?.focus({ preventScroll: true });
};

// Tailwind's `lg` breakpoint. Only one of the two "Entries" widgets is mounted at a time, so the
// other one is not running a typewriter and re-rendering behind display:none on phones.
const LG = '(min-width: 64rem)';
const subscribeLg = (onChange: () => void) => {
    const mq = window.matchMedia(LG);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
};
const getLg = () => window.matchMedia(LG).matches;
const useIsLg = () => useSyncExternalStore(subscribeLg, getLg, () => false);

const SubNav: React.FC = () => (
    <nav aria-label="Codex sections" className="-mt-4 mb-16 md:-mt-6 md:mb-24 flex flex-wrap gap-x-10 gap-y-3 animate-fade-in [animation-delay:240ms]">
        {SECTIONS.map(s => (
            <button key={s.id} type="button" onClick={() => jump(s.id)} className="group inline-flex items-center gap-3 hud-label text-ink-dim hover:text-ink transition-colors">
                <span className="numeral text-brand-yellow text-[0.6rem]">{s.num}</span>
                <span>{s.label}</span>
                <span className="numeral text-ink-mute">{pad(s.count)}</span>
                <Icon name="chevronDown" size={12} className="text-ink-mute transition-transform group-hover:translate-y-0.5" />
            </button>
        ))}
    </nav>
);

/* ─── Keycap hint ──────────────────────────────────────────────────────────────────────── */
const Key: React.FC<{ icon: 'chevronUp' | 'chevronDown' }> = ({ icon }) => (
    <span className="inline-flex items-center justify-center w-5 h-5 border border-line-strong text-ink-dim" aria-hidden="true">
        <Icon name={icon} size={10} />
    </span>
);

/* ─── Entries, lg and up: tab list on the left, decoded entry in a sticky panel on the right ── */
const EntriesDesk: React.FC = () => {
    const baseId = useId();
    const [selected, setSelected] = useState(0);
    const [decrypted, setDecrypted] = useState(false);
    const tabs = useRef<(HTMLButtonElement | null)[]>([]);
    const panelId = `${baseId}-panel`;
    const tabId = (i: number) => `${baseId}-tab-${i}`;
    const entry = FAQ[selected];

    const select = (i: number) => {
        if (i === selected) return;
        setSelected(i);
        setDecrypted(false);
    };

    // Arrow keys move the selection and the focus together, like a menu cursor.
    const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        const last = FAQ.length - 1;
        let next: number;
        switch (e.key) {
            case 'ArrowDown': next = selected === last ? 0 : selected + 1; break;
            case 'ArrowUp': next = selected === 0 ? last : selected - 1; break;
            case 'Home': next = 0; break;
            case 'End': next = last; break;
            default: return;
        }
        e.preventDefault();
        select(next);
        tabs.current[next]?.focus();
    };

    // No `items-start` here: the right-hand column must stretch to the row's full height, or the
    // sticky panel inside it has no room to travel and never sticks.
    return (
        <div className="hidden lg:grid lg:grid-cols-12 lg:gap-10 xl:gap-14">
            <div className="lg:col-span-5 min-w-0">
                <div className="ticks mb-3 opacity-60" aria-hidden="true" />
                <div
                    role="tablist"
                    aria-orientation="vertical"
                    aria-label="Codex entries"
                    onKeyDown={onKeyDown}
                    className="border-y border-line divide-y divide-line"
                >
                    {FAQ.map((f, i) => {
                        const sel = i === selected;
                        return (
                            <button
                                key={f.question}
                                ref={el => { tabs.current[i] = el; }}
                                type="button"
                                role="tab"
                                id={tabId(i)}
                                aria-selected={sel}
                                aria-controls={panelId}
                                tabIndex={sel ? 0 : -1}
                                onClick={() => select(i)}
                                className="select-row"
                            >
                                <span className={`numeral text-xs w-7 shrink-0 transition-colors ${sel ? 'text-brand-yellow' : 'text-ink-mute'}`}>{pad(i + 1)}</span>
                                <span className="flex-1 min-w-0 font-ui font-semibold text-[0.95rem] leading-snug">{f.question}</span>
                                <Icon name="chevronRight" size={14} className={`transition-all duration-300 ${sel ? 'opacity-100 translate-x-0 text-brand-yellow' : 'opacity-0 -translate-x-2'}`} />
                            </button>
                        );
                    })}
                </div>
                <p className="hud-label text-[0.6rem] text-ink-mute mt-4 flex items-center gap-1.5">
                    <Key icon="chevronUp" />
                    <Key icon="chevronDown" />
                    <span className="ml-1.5">Browse entries</span>
                </p>
            </div>

            <div className="lg:col-span-7 min-w-0">
                <div className="lg:sticky lg:top-28">
                    <Panel corners padding="roomy" role="tabpanel" id={panelId} aria-labelledby={tabId(selected)} className="flex flex-col lg:min-h-[26rem]">
                        <div className="flex items-center justify-between gap-4 mb-6">
                            <p className="hud-label">
                                <span className="numeral text-brand-yellow">Entry {pad(selected + 1)}</span>
                                <span className="text-ink-mute"> / {pad(FAQ.length)}</span>
                            </p>
                            <p className="hud-label text-[0.6rem] inline-flex items-center gap-2" aria-hidden="true">
                                <span className={`dot ${decrypted ? 'text-brand-lime' : 'text-brand-cyan animate-pulse-soft'}`} />
                                {decrypted ? 'Decrypted' : 'Decrypting'}
                            </p>
                        </div>
                        <h3 key={`q-${selected}`} className="display text-3xl break-words text-ink animate-fade-in">{entry.question}</h3>
                        <div className="rule rule--left my-6" aria-hidden="true" />
                        {/* The full answer is in the DOM for assistive tech; the typed copy is presentation only
                            (Typewriter exposes its text via aria-label on a <p>, which screen readers ignore). */}
                        <p className="sr-only">{entry.answer}</p>
                        <div aria-hidden="true">
                            <Typewriter
                                key={`a-${selected}`}
                                text={entry.answer}
                                speed={8}
                                className="text-lg text-ink-dim leading-relaxed"
                                onDone={() => setDecrypted(true)}
                            />
                        </div>
                        <div className="mt-auto pt-8">
                            <Button href={href('/contact')} variant="ghost">Ask something else</Button>
                        </div>
                    </Panel>
                </div>
            </div>
        </div>
    );
};

/* ─── Entries below lg: an accordion, first entry open ──────────────────────────────────── */
const EntriesAccordion: React.FC = () => {
    const baseId = useId();
    const [open, setOpen] = useState<number | null>(0);

    return (
        <div className="lg:hidden border-y border-line divide-y divide-line">
            {FAQ.map((f, i) => {
                const isOpen = open === i;
                const btnId = `${baseId}-q-${i}`;
                const regionId = `${baseId}-a-${i}`;
                return (
                    <div key={f.question}>
                        <h3 className="m-0">
                            <button
                                type="button"
                                id={btnId}
                                aria-expanded={isOpen}
                                aria-controls={regionId}
                                onClick={() => setOpen(isOpen ? null : i)}
                                className={`select-row py-4 ${isOpen ? 'is-selected' : ''}`}
                            >
                                <span className={`numeral text-xs w-7 shrink-0 ${isOpen ? 'text-brand-yellow' : 'text-ink-mute'}`}>{pad(i + 1)}</span>
                                <span className="flex-1 min-w-0 font-ui font-semibold normal-case tracking-normal text-base leading-snug">{f.question}</span>
                                <Icon name={isOpen ? 'minus' : 'plus'} size={16} className={isOpen ? 'text-brand-yellow' : 'text-ink-mute'} />
                            </button>
                        </h3>
                        <div
                            id={regionId}
                            role="region"
                            aria-labelledby={btnId}
                            aria-hidden={!isOpen}
                            inert={!isOpen}
                            className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? '[grid-template-rows:1fr]' : '[grid-template-rows:0fr]'}`}
                        >
                            <div className="overflow-hidden min-h-0">
                                <p className="pl-4 pr-4 pb-6 sm:pl-[3.75rem] text-ink-dim leading-relaxed">{f.answer}</p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

/* ─── Field reports: every testimonial as a card ────────────────────────────────────────── */
const FieldReports: React.FC = () => (
    <div className="columns-1 md:columns-2 gap-6">
        {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 60} className="break-inside-avoid mb-6">
                <Panel hover as="figure" padding="normal" className="m-0">
                    <div className="flex items-center justify-between gap-4 mb-5">
                        <span className={`tag tag--${t.accent}`}>Report {pad(i + 1)}</span>
                        <span className="inline-flex items-center" style={{ color: ACCENT_HEX[t.accent] }} aria-hidden="true">
                            <Icon name="signal" size={14} />
                        </span>
                    </div>
                    <blockquote className="m-0">
                        <p className="text-lg text-ink leading-relaxed">{t.text}</p>
                    </blockquote>
                    <figcaption className="mt-6 pt-5 border-t border-line">
                        <p className="display text-xl text-ink break-words">{t.name}</p>
                        <p className="hud-label mt-2 text-[0.62rem] break-words">{t.role}</p>
                    </figcaption>
                </Panel>
            </Reveal>
        ))}
    </div>
);

/* ─── Page ─────────────────────────────────────────────────────────────────────────────── */
export const Codex: React.FC = () => {
    const isLg = useIsLg();
    return (
        <section className="page wrap">
            <PageTitle chapter="05" eyebrow="Codex" title="Codex" subtitle="Intel on how we work, and reports from the people who've worked with us." />
            <SubNav />

            <section id={ENTRIES_ID} aria-labelledby={`${ENTRIES_ID}-title`} className="scroll-mt-28 mb-24 md:mb-32">
                <Reveal>
                    <SectionHead
                        id={`${ENTRIES_ID}-title`}
                        num="05.1"
                        eyebrow="Intel"
                        title="Entries"
                        readout={<><span className="numeral text-ink">{pad(FAQ.length)}</span> entries on file</>}
                    />
                </Reveal>
                <Reveal delay={80}>
                    {isLg ? <EntriesDesk /> : <EntriesAccordion />}
                </Reveal>
            </section>

            <section id={REPORTS_ID} aria-labelledby={`${REPORTS_ID}-title`} className="relative isolate scroll-mt-28 mb-24 md:mb-32">
                <div className="grid-bg absolute -inset-x-4 -inset-y-10 -z-10 pointer-events-none" aria-hidden="true" />
                <Reveal>
                    <SectionHead
                        id={`${REPORTS_ID}-title`}
                        num="05.2"
                        eyebrow="Debrief"
                        title="Field reports"
                        readout={<><span className="numeral text-ink">{pad(TESTIMONIALS.length)}</span> reports logged</>}
                    />
                </Reveal>
                <FieldReports />
            </section>

            <Reveal>
                <Panel corners glow="yellow" padding="roomy" className="text-center">
                    <p className="hud-label text-brand-yellow mb-4">No matching entry?</p>
                    <h2 className="display title-gradient text-4xl md:text-5xl break-words">Ask us directly</h2>
                    <p className="mt-4 text-lg text-ink-dim max-w-xl mx-auto">{PHILOSOPHY[1].description}</p>
                    <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
                        <Button href={href('/contact')} variant="gold" iconRight="arrowRight">Start Mission</Button>
                        <a href={`mailto:${SITE.email}`} className="hud-label text-ink hover:text-brand-yellow transition-colors break-all">{SITE.email}</a>
                    </div>
                    <p className="hud-label text-[0.6rem] text-ink-mute mt-8">
                        Response time <span className="text-ink ml-2">{SITE.responseTime}</span>
                    </p>
                </Panel>
            </Reveal>
        </section>
    );
};
