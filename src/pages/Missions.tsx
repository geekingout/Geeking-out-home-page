import React, { useCallback, useId, useRef, useState, useSyncExternalStore } from 'react';
import { SERVICES, SITE, type Accent, type Service } from '../content';
import { href } from '../router';
import { ACCENT_HEX, Button, Icon, PageTitle, Panel, Reveal, Typewriter, type IconName } from '../ui';

/* ─── Framing only. Every sentence about a service is rendered from SERVICES; nothing here is copy. ── */

const ICONS: Record<string, IconName> = {
    automation: 'cpu',
    audit: 'target',
    rag: 'book',
    software: 'terminal',
    video: 'play',
    products: 'sparkles',
};

/** Mission classes: flavor tags for the menu. All six are meant to read as valuable. */
const TIERS: Record<string, { label: string; accent?: Accent }> = {
    automation: { label: 'Flagship' },
    audit: { label: 'Start here', accent: 'yellow' },
    rag: { label: 'Intel' },
    software: { label: 'Build' },
    video: { label: 'Broadcast' },
    products: { label: 'Launch' },
};

const iconOf = (s: Service): IconName => ICONS[s.id] ?? 'diamond';
const tierOf = (s: Service) => ({ label: TIERS[s.id]?.label ?? 'Mission', accent: TIERS[s.id]?.accent ?? s.accent });
const pad = (n: number) => String(n).padStart(2, '0');
const WORDS = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];
const countWord = (n: number) => WORDS[n] ?? String(n);
const deployHref = (s: Service) => href('/contact?quest=' + encodeURIComponent(s.title));
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* The lg breakpoint (64rem) as a hook, so only one selector widget is mounted at a time and the
   accessibility tree never carries a hidden duplicate of the mission list. */
const LG = '(min-width: 64rem)';
const subscribeLg = (cb: () => void) => {
    const mq = window.matchMedia(LG);
    mq.addEventListener('change', cb);
    return () => mq.removeEventListener('change', cb);
};
const getLg = () => window.matchMedia(LG).matches;
const useIsLarge = () => useSyncExternalStore(subscribeLg, getLg, () => false);

/** ArrowUp/ArrowDown step through the list, Home/End jump; null for any other key. */
const stepIndex = (key: string, index: number, n: number): number | null => {
    switch (key) {
        case 'ArrowDown': return (index + 1) % n;
        case 'ArrowUp': return (index - 1 + n) % n;
        case 'Home': return 0;
        case 'End': return n - 1;
        default: return null;
    }
};

type Headers = { current: Record<string, HTMLButtonElement | null> };

/* ─── Small HUD pieces ─────────────────────────────────────────────────────────────────────── */

const Tag: React.FC<{ accent: Accent; dot?: boolean; className?: string; children: React.ReactNode }> = ({ accent, dot, className = '', children }) => (
    <span className={`tag tag--${accent} ${className}`}>
        {dot && <span className="dot" aria-hidden="true" />}
        {children}
    </span>
);

const Key: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <kbd className="inline-flex items-center justify-center min-w-[1.5rem] h-5 px-1 border border-line-strong font-ui text-[0.58rem] font-bold tracking-[0.12em] text-ink-dim">
        {children}
    </kbd>
);

/** "02 / 06" readout for the list header. */
const Counter: React.FC<{ index: number }> = ({ index }) => (
    <span className="numeral text-xs text-ink-mute">
        <span className="text-brand-yellow">{pad(index + 1)}</span> / {pad(SERVICES.length)}
    </span>
);

/** Six thin segments under the list; the selected one lights up in the mission's accent. */
const Segments: React.FC<{ index: number; accent: Accent }> = ({ index, accent }) => (
    <div className="mt-4 flex gap-1" aria-hidden="true">
        {SERVICES.map((s, i) => (
            <span
                key={s.id}
                className="h-[3px] flex-1 transition-all duration-500"
                style={i === index
                    ? { background: ACCENT_HEX[accent], boxShadow: `0 0 12px ${ACCENT_HEX[accent]}` }
                    : { background: 'rgba(237, 234, 247, 0.1)' }}
            />
        ))}
    </div>
);

/** The inside of a select-row: numeral, icon, title, tier. Shared by the tab list and the accordion. */
const RowBody: React.FC<{ service: Service; index: number; active: boolean; trailing: React.ReactNode }> = ({ service, index, active, trailing }) => {
    const tier = tierOf(service);
    return (
        <>
            <span className={`numeral text-xs w-6 shrink-0 transition-colors ${active ? 'text-brand-yellow' : 'text-ink-mute'}`}>{pad(index + 1)}</span>
            <span className="shrink-0 transition-colors" style={{ color: active ? ACCENT_HEX[service.accent] : undefined }}>
                <Icon name={iconOf(service)} size={18} />
            </span>
            <span className="min-w-0 flex-1 display text-xl md:text-2xl break-words">{service.title}</span>
            <Tag accent={tier.accent} className="hidden sm:inline-flex shrink-0">{tier.label}</Tag>
            {trailing}
        </>
    );
};

/** The briefing for one mission. `compact` omits the title row (the accordion header already has it). */
const MissionDetail: React.FC<{ service: Service; index: number; compact?: boolean }> = ({ service, index, compact }) => {
    const tier = tierOf(service);
    const hex = ACCENT_HEX[service.accent];
    const deploy = deployHref(service);
    return (
        <>
            {compact ? (
                <div className="sm:hidden mb-5">
                    <Tag accent={tier.accent} dot>{tier.label}</Tag>
                </div>
            ) : (
                <>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="hud-label">Mission {pad(index + 1)}</span>
                        <Tag accent={tier.accent} dot>{tier.label}</Tag>
                    </div>
                    <div className="mt-6 flex items-start gap-5">
                        <span
                            className="hidden sm:inline-flex items-center justify-center w-14 h-14 shrink-0 border"
                            style={{ color: hex, borderColor: `${hex}55`, boxShadow: `0 0 28px -8px ${hex}` }}
                            aria-hidden="true"
                        >
                            <Icon name={iconOf(service)} size={26} strokeWidth={1.4} />
                        </span>
                        <h2 className="display text-4xl md:text-5xl text-ink min-w-0 break-words">{service.title}</h2>
                    </div>
                </>
            )}

            <Typewriter
                text={service.blurb}
                speed={18}
                startDelay={compact ? 120 : 260}
                as="p"
                className={`font-ui text-xl md:text-2xl text-ink leading-snug ${compact ? '' : 'mt-6'}`}
            />
            <div className="rule rule--left my-6" aria-hidden="true" />
            <p className="text-base md:text-lg text-ink-dim leading-relaxed">{service.explanation}</p>

            <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
                <Button href={deploy} variant="gold" iconRight="arrowRight" kbd="ENTER">Deploy</Button>
                <Button href={deploy} variant="ghost">Ask about this mission</Button>
            </div>
            <div className="ticks mt-8 opacity-60" aria-hidden="true" />
        </>
    );
};

/* ─── lg+: vertical tab list on the left, sticky briefing panel on the right ───────────────── */

const MissionTabs: React.FC<{ selectedId: string; onSelect: (id: string) => void; headers: Headers }> = ({ selectedId, onSelect, headers }) => {
    const uid = useId();
    const index = Math.max(0, SERVICES.findIndex(s => s.id === selectedId));
    const service = SERVICES[index];
    const tabId = (id: string) => `${uid}-tab-${id}`;
    const panelId = `${uid}-panel`;

    const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        const next = stepIndex(e.key, index, SERVICES.length);
        if (next === null) return;
        e.preventDefault();
        const id = SERVICES[next].id;
        onSelect(id);
        headers.current[id]?.focus();
    };

    return (
        <div className="grid gap-8 xl:gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] items-start">
            <div className="min-w-0">
                <div className="flex items-center justify-between gap-4 mb-3">
                    <p className="hud-label flex items-center gap-3">
                        <span className="dot text-brand-yellow animate-pulse-soft" aria-hidden="true" />
                        Select a mission
                    </p>
                    <Counter index={index} />
                </div>

                <div
                    role="tablist"
                    aria-label="Missions"
                    aria-orientation="vertical"
                    onKeyDown={onKeyDown}
                    className="border-y border-line divide-y divide-line"
                >
                    {SERVICES.map((s, i) => {
                        const active = s.id === selectedId;
                        return (
                            <button
                                key={s.id}
                                ref={el => { headers.current[s.id] = el; }}
                                type="button"
                                role="tab"
                                id={tabId(s.id)}
                                aria-selected={active}
                                aria-controls={panelId}
                                tabIndex={active ? 0 : -1}
                                onClick={() => onSelect(s.id)}
                                className="select-row animate-slide-right"
                                style={{ animationDelay: `${160 + i * 70}ms` }}
                            >
                                <RowBody
                                    service={s}
                                    index={i}
                                    active={active}
                                    trailing={
                                        <Icon
                                            name="chevronRight"
                                            size={16}
                                            className={`transition-all duration-300 ${active ? 'opacity-100 translate-x-0 text-brand-yellow' : 'opacity-0 -translate-x-1'}`}
                                        />
                                    }
                                />
                            </button>
                        );
                    })}
                </div>

                <Segments index={index} accent={service.accent} />

                <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 hud-label text-[0.62rem]">
                    <span className="inline-flex gap-1" aria-hidden="true"><Key><Icon name="chevronUp" size={10} /></Key><Key><Icon name="chevronDown" size={10} /></Key></span>
                    <span><span className="sr-only">Arrow keys: </span>Navigate</span>
                    <span className="text-ink-mute" aria-hidden="true">/</span>
                    <span className="inline-flex gap-1"><Key>Home</Key><Key>End</Key></span>
                    <span>Jump</span>
                </p>
            </div>

            <div className="min-w-0 lg:sticky lg:top-28">
                <Panel
                    key={service.id}
                    id={panelId}
                    role="tabpanel"
                    aria-labelledby={tabId(service.id)}
                    label="Briefing"
                    labelSide="right"
                    corners
                    glow={service.accent}
                    padding="roomy"
                    className="animate-fade-up"
                >
                    <MissionDetail service={service} index={index} />
                </Panel>
            </div>
        </div>
    );
};

/* ─── Below lg: a stacked accordion with the same content ─────────────────────────────────── */

const MissionAccordion: React.FC<{ openId: string | null; onToggle: (id: string) => void; headers: Headers }> = ({ openId, onToggle, headers }) => {
    const uid = useId();

    // Arrow keys move between headers only; keys pressed inside an open briefing are left alone.
    const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        const current = SERVICES.findIndex(s => headers.current[s.id] === e.target);
        if (current < 0) return;
        const next = stepIndex(e.key, current, SERVICES.length);
        if (next === null) return;
        e.preventDefault();
        headers.current[SERVICES[next].id]?.focus();
    };

    return (
        <div className="min-w-0">
            <div className="flex items-center justify-between gap-4 mb-3">
                <p className="hud-label flex items-center gap-3">
                    <span className="dot text-brand-yellow animate-pulse-soft" aria-hidden="true" />
                    Select a mission
                </p>
                <span className="numeral text-xs text-ink-mute">{pad(SERVICES.length)} missions</span>
            </div>

            <div onKeyDown={onKeyDown} className="border-y border-line divide-y divide-line">
                {SERVICES.map((s, i) => {
                    const open = s.id === openId;
                    const headerId = `${uid}-h-${s.id}`;
                    const regionId = `${uid}-r-${s.id}`;
                    return (
                        <div key={s.id} className="animate-slide-right" style={{ animationDelay: `${160 + i * 70}ms` }}>
                            <h2>
                                <button
                                    ref={el => { headers.current[s.id] = el; }}
                                    type="button"
                                    id={headerId}
                                    aria-expanded={open}
                                    aria-controls={regionId}
                                    onClick={() => onToggle(s.id)}
                                    className={`select-row ${open ? 'is-selected' : ''}`}
                                >
                                    <RowBody
                                        service={s}
                                        index={i}
                                        active={open}
                                        trailing={
                                            <Icon
                                                name="chevronDown"
                                                size={16}
                                                className={`transition-transform duration-300 ${open ? 'rotate-180 text-brand-yellow' : 'text-ink-mute'}`}
                                            />
                                        }
                                    />
                                </button>
                            </h2>
                            <div id={regionId} role="region" aria-labelledby={headerId} hidden={!open}>
                                {open && (
                                    <div className="animate-fade-up px-4 pt-3 pb-8">
                                        <MissionDetail service={s} index={i} compact />
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

/* ─── Recommended sequence: labels only, no new claims ────────────────────────────────────── */

const Sequence: React.FC<{ onJump: (id: string) => void }> = ({ onJump }) => {
    const uid = useId();
    const audit = SERVICES.find(s => s.id === 'audit') ?? SERVICES[0];
    const tier = tierOf(audit);
    return (
        <Reveal as="section" aria-labelledby={`${uid}-seq`} className="mt-16 md:mt-24">
            <div className="flex items-center gap-4 mb-6">
                <Icon name="map" size={16} className="text-brand-yellow" />
                <h2 id={`${uid}-seq`} className="hud-label">Recommended sequence</h2>
                <span className="rule rule--right flex-1" aria-hidden="true" />
            </div>

            <ol className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <li className="flex-1 min-w-0">
                    <Panel
                        as="button"
                        hover
                        corners
                        padding="none"
                        onClick={() => onJump(audit.id)}
                        aria-label={`Select mission: ${audit.title}`}
                        className="group w-full h-full text-left flex items-center gap-4 p-5 md:p-6 cursor-pointer"
                    >
                        <span className="flex flex-col items-center shrink-0 w-10">
                            <span className="hud-label text-[0.55rem]">Step</span>
                            <span className="numeral text-lg text-brand-yellow">01</span>
                        </span>
                        <span className="min-w-0 flex-1">
                            <span className="block"><Tag accent={tier.accent} dot>{tier.label}</Tag></span>
                            <span className="mt-2 block display text-2xl text-ink break-words transition-colors group-hover:text-brand-yellow">{audit.title}</span>
                            <span className="mt-1.5 block text-sm text-ink-dim leading-snug break-words">{audit.blurb}</span>
                        </span>
                        <Icon name="chevronRight" size={16} className="shrink-0 text-ink-mute transition-colors group-hover:text-brand-yellow" />
                    </Panel>
                </li>
                <li className="flex-1 min-w-0 flex flex-col sm:flex-row items-center sm:items-stretch gap-3 sm:gap-4">
                    <span className="flex items-center text-ink-mute" aria-hidden="true">
                        <Icon name="arrowRight" size={18} className="rotate-90 sm:rotate-0" />
                    </span>
                    <Panel padding="none" className="w-full flex-1 min-w-0 flex items-center gap-4 p-5 md:p-6">
                        <span className="flex flex-col items-center shrink-0 w-10">
                            <span className="hud-label text-[0.55rem]">Step</span>
                            <span className="numeral text-lg text-ink-mute">02</span>
                        </span>
                        <span className="min-w-0 flex-1">
                            <span className="block"><Tag accent="cyan">Next</Tag></span>
                            <span className="mt-2 block display text-2xl text-ink-dim break-words">The mission it surfaces</span>
                        </span>
                    </Panel>
                </li>
            </ol>
        </Reveal>
    );
};

/* ─── Closing CTA ─────────────────────────────────────────────────────────────────────────── */

const CallToAction: React.FC = () => (
    <Reveal className="mt-16 md:mt-24">
        <Panel corners glow="yellow" padding="roomy" className="text-center">
            <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
                <span className="watermark absolute -bottom-6 -right-3 text-[6rem] sm:text-[9rem] md:text-[12rem]">Start</span>
            </div>
            <div className="relative">
                <p className="hud-label flex items-center justify-center gap-3">
                    <span className="dot text-brand-yellow animate-pulse-soft" aria-hidden="true" />
                    Ready when you are
                </p>
                <h2 className="display title-gradient text-4xl md:text-6xl mt-5 break-words">Start mission</h2>
                <p className="mt-4 mx-auto max-w-xl text-base md:text-lg text-ink-dim leading-relaxed">
                    Open the briefing and tell us which mission you have in mind.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
                    <Button href={href('/contact')} variant="gold" icon="send" iconRight="arrowRight">Start Mission</Button>
                    <a
                        href={`mailto:${SITE.email}`}
                        className="font-ui font-semibold text-[0.72rem] tracking-[0.3em] uppercase text-ink hover:text-brand-yellow transition-colors break-all"
                    >
                        {SITE.email}
                    </a>
                </div>
                <p className="mt-6 hud-label text-[0.62rem]">Comms · Response {SITE.responseTime}</p>
            </div>
        </Panel>
    </Reveal>
);

/* ─── Page ────────────────────────────────────────────────────────────────────────────────── */

export const Missions: React.FC = () => {
    const isLarge = useIsLarge();
    const [selectedId, setSelectedId] = useState(SERVICES[0].id);
    const [openId, setOpenId] = useState<string | null>(SERVICES[0].id);
    const selectorRef = useRef<HTMLDivElement>(null);
    const headers = useRef<Record<string, HTMLButtonElement | null>>({});

    /** Desktop tab selection. Mirrored into the accordion so a resize below lg lands on the same mission. */
    const select = useCallback((id: string) => {
        setSelectedId(id);
        setOpenId(id);
    }, []);

    /** Accordion header click: toggle the briefing, and keep the desktop selection in step. */
    const toggle = useCallback((id: string) => {
        setOpenId(prev => (prev === id ? null : id));
        setSelectedId(id);
    }, []);

    /** From the sequence strip: select the mission, bring the selector into view, move focus to it. */
    const jumpTo = useCallback((id: string) => {
        select(id);
        selectorRef.current?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' });
        window.requestAnimationFrame(() => headers.current[id]?.focus({ preventScroll: true }));
    }, [select]);

    return (
        <section className="page wrap">
            <PageTitle
                chapter="01"
                eyebrow="Mission select"
                title="Missions"
                subtitle={`${countWord(SERVICES.length)} ways we work with you. Select a mission for the full briefing.`}
            />

            <div ref={selectorRef} className="scroll-mt-28">
                {isLarge
                    ? <MissionTabs selectedId={selectedId} onSelect={select} headers={headers} />
                    : <MissionAccordion openId={openId} onToggle={toggle} headers={headers} />}
            </div>

            <Sequence onJump={jumpTo} />
            <CallToAction />
        </section>
    );
};
