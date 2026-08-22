import React, { useEffect, useRef, useState } from 'react';
import { SITE, TEAM, type Accent, type TeamMember } from '../content';
import { href } from '../router';
import { ACCENT_HEX, Bar, Button, Icon, PageTitle, Panel, Reveal, Typewriter, type IconName } from '../ui';

/* ─── Game-layer framing ───────────────────────────────────────────────────────────────────
   Names, roles and contact details render verbatim from content.ts. Everything below is
   in-world flavor (classes, unit numbers, simulated stats) and never makes a business claim. */

/** In-world class per role. Unknown roles fall back to a neutral label. */
const CLASS_BY_ROLE: Record<string, string> = {
    'Founder / AI Engineer': 'Commander',
    'AI Engineer': 'Architect',
    'Software Developer': 'Engineer',
    'Systems Engineer': 'Operator',
    'Product Manager': 'Strategist',
    'Mobile App Engineer': 'Ranger',
    'AI/Data Engineer': 'Analyst',
};
const classOf = (m: TeamMember) => CLASS_BY_ROLE[m.role] ?? 'Operative';

/** Playful, clearly non-factual stats: deterministic per member (djb2 hash), always 80–99. */
const STATS = [
    { key: 'signal', label: 'Signal' },
    { key: 'focus', label: 'Focus' },
    { key: 'coffee', label: 'Coffee' },
] as const;
const hash = (s: string) => {
    let h = 5381;
    for (const c of s) h = ((h << 5) + h + c.charCodeAt(0)) >>> 0;
    return h;
};
const stat = (id: string, key: string) => 80 + (hash(`${id}:${key}`) % 20);

const pad = (n: number) => String(n).padStart(2, '0');

/** "Victor" → "V", "AQ" → "AQ", "Ada Lovelace" → "AL". */
const initials = (name: string) => {
    const words = name.trim().split(/\s+/);
    if (words.length > 1) return words.slice(0, 2).map(w => w[0]).join('').toUpperCase();
    return (name.length <= 2 ? name : name[0]).toUpperCase();
};

/**
 * True once the element has scrolled into view (plus an optional delay), so stat bars fill as
 * their card reveals. Resolves immediately when the user prefers reduced motion.
 */
function useInView<T extends Element>(delay = 0): [React.RefObject<T | null>, boolean] {
    const ref = useRef<T>(null);
    const [inView, setInView] = useState(false);
    useEffect(() => {
        const el = ref.current;
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!el || reduced || !('IntersectionObserver' in window)) { setInView(true); return; }
        let timer = 0;
        const io = new IntersectionObserver(entries => {
            if (entries.some(e => e.isIntersecting)) {
                io.disconnect();
                timer = window.setTimeout(() => setInView(true), delay);
            }
        }, { threshold: 0.2 });
        io.observe(el);
        return () => { io.disconnect(); window.clearTimeout(timer); };
    }, [delay]);
    return [ref, inView];
}

/* ─── Portrait: initials inside a hex frame with a soft glow ───────────────────────────── */

const HEX_OUTER = '60,6 106.8,33 106.8,87 60,114 13.2,87 13.2,33';
const HEX_INNER = '60,16 98.1,38 98.1,82 60,104 21.9,82 21.9,38';

const Portrait: React.FC<{ member: TeamMember; className?: string }> = ({ member, className = '' }) => {
    const stroke = ACCENT_HEX[member.accent];
    const text = initials(member.name);
    const glowId = `hex-glow-${member.id}`;
    return (
        <svg viewBox="0 0 120 120" className={`block text-ink ${className}`} aria-hidden="true" focusable="false">
            <defs>
                <filter id={glowId} x="-25%" y="-25%" width="150%" height="150%">
                    <feGaussianBlur stdDeviation="3" />
                </filter>
            </defs>
            {/* soft glow: a blurred copy of the frame that brightens when the card is hovered */}
            <polygon
                points={HEX_OUTER}
                fill="none"
                stroke={stroke}
                strokeWidth="4"
                filter={`url(#${glowId})`}
                className="opacity-35 transition-opacity duration-500 group-hover:opacity-80"
            />
            {/* the frame */}
            <polygon points={HEX_OUTER} fill="rgba(255,255,255,0.03)" stroke={stroke} strokeWidth="1.5" strokeLinejoin="miter" />
            {/* targeting ring: faint dashed inner hex that expands slightly on hover */}
            <polygon
                points={HEX_INNER}
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeDasharray="6 5"
                className="opacity-20 origin-center transition-all duration-700 group-hover:opacity-50 group-hover:scale-105"
            />
            {/* edge ticks */}
            <path d="M13.2 60H5M106.8 60H115" stroke={stroke} strokeWidth="1.5" opacity="0.8" />
            <text
                x="60"
                y="61"
                textAnchor="middle"
                dominantBaseline="central"
                fill="currentColor"
                className="display"
                fontSize={text.length > 1 ? 40 : 54}
                style={{ letterSpacing: text.length > 1 ? '0.04em' : '0' }}
            >
                {text}
            </text>
        </svg>
    );
};

/* ─── Operative card ───────────────────────────────────────────────────────────────────── */

type CardProps = { member: TeamMember; index: number; featured?: boolean };

const OperativeCard: React.FC<CardProps> = ({ member, index, featured }) => {
    const [statsRef, live] = useInView<HTMLDivElement>(320);
    const headingId = `op-${member.id}`;
    const unit = `OP-${pad(index + 1)}`;
    const stats = STATS.map(s => ({ ...s, value: stat(member.id, s.key) }));

    const header = (
        <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="numeral text-[0.62rem] text-ink-mute">{unit}</span>
            <span className={`tag tag--${member.accent}`}>
                <span className="dot" aria-hidden="true" />
                {classOf(member)}
            </span>
        </div>
    );
    const bars = stats.map(s => (
        <Bar key={s.key} label={s.label} value={live ? s.value : 0} color={member.accent} readout={String(s.value)} thick={featured} />
    ));
    const linkedin = member.linkedin ? (
        <Button
            href={member.linkedin}
            variant="outline"
            size="sm"
            icon="linkedin"
            aria-label={`${member.name} on LinkedIn (opens in a new tab)`}
        >
            LinkedIn
        </Button>
    ) : null;

    if (featured) {
        return (
            <Panel as="article" corners glow={member.accent} label="Squad lead" padding="none" className="group h-full mt-0! p-6 sm:p-8 md:p-10 flex flex-col" aria-labelledby={headingId}>
                {/* outlined unit number as a watermark; clipped inside the panel so the corner brackets stay intact */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
                    <span className="watermark absolute -right-3 -bottom-8 text-[9rem] sm:text-[12rem]">{pad(index + 1)}</span>
                </div>
                <div className="relative flex-1 flex flex-col">
                    {header}
                    <div className="mt-6 sm:flex sm:items-center sm:gap-8 md:gap-10">
                        <Portrait member={member} className="w-32 h-32 sm:w-40 sm:h-40 md:w-44 md:h-44 shrink-0" />
                        <div className="mt-5 sm:mt-0 min-w-0">
                            <h3 id={headingId} className="display title-gradient text-4xl md:text-5xl lg:text-6xl break-words">{member.name}</h3>
                            <p className="hud-label mt-3">{member.role}</p>
                            {linkedin && <div className="mt-5">{linkedin}</div>}
                        </div>
                    </div>
                    <div className="mt-auto pt-6">
                        <div className="rule rule--left mb-6" aria-hidden="true" />
                        <div ref={statsRef} role="group" aria-label="Simulated field stats" className="grid gap-4 sm:grid-cols-3 sm:gap-6">
                            {bars}
                        </div>
                    </div>
                </div>
            </Panel>
        );
    }

    return (
        <Panel as="article" corners glow={member.accent} className="group h-full flex flex-col" aria-labelledby={headingId}>
            {header}
            <Portrait member={member} className="mt-6 w-28 h-28" />
            <h3 id={headingId} className="display text-3xl mt-5 break-words">{member.name}</h3>
            <p className="hud-label mt-2">{member.role}</p>
            <div className="mt-auto pt-5">
                <div className="rule rule--left mb-5" aria-hidden="true" />
                <div ref={statsRef} role="group" aria-label="Simulated field stats" className="space-y-3">
                    {bars}
                </div>
                {linkedin && <div className="mt-6">{linkedin}</div>}
            </div>
        </Panel>
    );
};

/* ─── Formation readout cell ───────────────────────────────────────────────────────────── */

const Readout: React.FC<{ icon: IconName; value: string; label: string; accent?: Accent }> = ({ icon, value, label, accent }) => (
    // A valid <dl> group: dt precedes dd in the DOM; flex `order` puts the value above its label.
    <div className="flex flex-col p-5 md:p-6 min-w-0">
        <dt className="order-2 mt-1 pl-[38px] hud-label">{label}</dt>
        <dd className="order-1 flex items-center gap-4 min-w-0">
            <span className="shrink-0 text-ink-dim" aria-hidden="true"><Icon name={icon} size={22} /></span>
            <span className="display text-3xl md:text-4xl tabular-nums break-words min-w-0" style={accent ? { color: ACCENT_HEX[accent] } : undefined}>{value}</span>
        </dd>
    </div>
);

/* ─── Page ─────────────────────────────────────────────────────────────────────────────── */

export const Squad: React.FC = () => (
    <section className="page wrap">
        {/* subtitle: the team-section line carried over verbatim from the previous site */}
        <PageTitle chapter="03" eyebrow="Squad" title="Squad" subtitle={SITE.teamTagline} />

        {/* Roster header */}
        <Reveal className="mb-8 md:mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-baseline gap-4">
                <span className="numeral text-brand-yellow text-sm">03.1</span>
                <h2 className="display text-4xl md:text-5xl">Roster</h2>
            </div>
            <p className="hud-label min-h-[1.3em]" style={{ color: ACCENT_HEX.cyan }}>
                <Typewriter as="span" text={`Roster loaded — ${pad(TEAM.length)} operatives`} startDelay={500} speed={18} />
            </p>
        </Reveal>

        {/* Operatives: the first member is featured and spans two columns */}
        <ul role="list" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {TEAM.map((m, i) => (
                <Reveal key={m.id} as="li" delay={i * 70} className={`min-w-0 ${i === 0 ? 'sm:col-span-2' : ''}`}>
                    <OperativeCard member={m} index={i} featured={i === 0} />
                </Reveal>
            ))}
        </ul>
        <p className="hud-label mt-4 text-right">Field stats: simulated</p>

        {/* Formation readout */}
        <Reveal className="mt-12 md:mt-16">
            <h2 className="sr-only">Formation</h2>
            {/* the visible caption repeats the sr-only heading, so it is hidden from assistive tech */}
            <Panel solid label={<span aria-hidden="true">Formation</span>} padding="none">
                <div className="ticks opacity-50" aria-hidden="true" />
                {/* every value is data from content.ts: head count, response time, location */}
                <dl className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-line">
                    <Readout icon="users" value={pad(TEAM.length)} label="operatives" accent="yellow" />
                    <Readout icon="clock" value={SITE.responseTime} label="response" />
                    <Readout icon="map" value={SITE.location} label="location" />
                </dl>
            </Panel>
        </Reveal>

        {/* Next objective */}
        <Reveal className="mt-6 md:mt-8">
            <Panel corners glow="yellow" padding="none" className="p-6 sm:p-8 md:p-10 text-center">
                <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
                    <div className="absolute inset-0 grid-bg" />
                </div>
                <div className="relative">
                    <p className="hud-label" style={{ color: ACCENT_HEX.yellow }}>Next objective</p>
                    <h2 className="display title-gradient text-4xl sm:text-5xl md:text-6xl mt-3 break-words">Recruit the squad</h2>
                    <p className="mt-4 text-lg text-ink-dim leading-relaxed max-w-xl mx-auto">
                        Send a briefing and the squad answers {SITE.responseTime}.
                    </p>
                    <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button href={href('/contact')} variant="gold" size="lg" iconRight="arrowRight" className="w-full sm:w-auto">Start Mission</Button>
                        <Button href={href('/codex')} variant="outline" size="lg" icon="book" className="w-full sm:w-auto">Field reports</Button>
                    </div>
                    <p className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 font-ui font-semibold text-xs tracking-[0.2em] uppercase text-ink-mute">
                        <span>Comms</span>
                        <span className="rule-v h-3" aria-hidden="true" />
                        <a href={`mailto:${SITE.email}`} className="normal-case hover:text-ink transition-colors">{SITE.email}</a>
                        <span className="rule-v h-3" aria-hidden="true" />
                        <a href={SITE.phoneHref} className="hover:text-ink transition-colors">{SITE.phoneDisplay}</a>
                    </p>
                </div>
            </Panel>
        </Reveal>
    </section>
);
