/**
 * The product showcase — the centrepiece of the home page and the whole of the
 * products page.
 *
 * A pinned visual on the left holds one panel per product, each a small live
 * vignette of the thing itself: an agent fleet, a school's site and app, a chat
 * that ships code, a waveform, a quiz, a feed, a dashboard. The steps on the
 * right scroll past it; whichever step spans the viewport centre drives which
 * panel is showing. Nothing is a screenshot, so nothing goes stale.
 *
 * The vignettes tick on a 1.4 s heartbeat while the section is on screen, and
 * hold still under prefers-reduced-motion.
 */

import React, { useEffect, useRef, useState } from 'react';
import { PRODUCTS } from './content';
import { Eyebrow, clamp01, reducedMotion, useOnScroll } from './nav';

const pad = (n: number) => String(n).padStart(2, '0');

type V = React.FC<{ f: number }>;

/* ---------- 01 Cafecito: agent fleet ---------- */
const AGENT_IDS = ['crm', 'slack', 'pg', 'stripe', 'gmail', 'sheets', 'hubspot', 'notion', 's3'];
const AGENT_STATES = ['independent', 'derived', 'independent', 're-deriving', 'independent', 'derived', 'independent', 'independent', 'derived'];

const Cafecito: V = ({ f }) => (
    <>
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-2.5 p-1.5">
            {AGENT_STATES.map((st, i) => {
                if (i === 4) return <div key={i} />;
                const hot = (f + i) % 9 === 0;
                const s = hot ? 're-deriving' : st;
                const dot = s === 'independent' ? '#2EB884' : s === 'derived' ? '#B8672A' : '#FF5A1F';
                return (
                    <div
                        key={i}
                        className="glass flex flex-col justify-between p-3 min-w-0 transition-colors duration-500"
                        style={hot ? { borderColor: dot, background: 'rgba(250,248,245,.1)' } : undefined}
                    >
                        <span className="font-mono text-[10px] text-bone truncate">agent-{AGENT_IDS[i]}</span>
                        <span className="flex items-center gap-1.5 font-mono text-[10px]" style={{ color: hot ? '#FAF8F5' : '#A9A3B3' }}>
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: dot, boxShadow: `0 0 10px ${dot}` }} />
                            {s}
                        </span>
                    </div>
                );
            })}
        </div>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-3.5 py-2.5 rounded-full whitespace-nowrap bg-[#B8672A] text-ink font-display uppercase font-bold text-[16px] tracking-[.04em] shadow-[0_20px_40px_-16px_rgba(184,103,42,.8)]">
            0 conflicts
        </div>
    </>
);

/* ---------- 02 Schoolz: one platform, three surfaces ---------- */
const CMS_MSGS = [
    'Ms. Rivera edited “Early dismissal Friday” · 8:01 AM',
    'Front office posted Spring enrollment page · 7:48 AM',
    'Lunch menu updated for next week · 7:30 AM',
];

const PhoneCard: React.FC<{ label: string; labelColor?: string; text: string }> = ({ label, labelColor = '#A9A3B3', text }) => (
    <div className="glass rounded-lg p-[7px] flex flex-col gap-[3px]">
        <span className="font-mono text-[8px]" style={{ color: labelColor }}>{label}</span>
        <span className="text-[9px] text-paper leading-[1.3]">{text}</span>
    </div>
);

const Schoolz: V = ({ f }) => (
    <div className="absolute inset-0 grid grid-cols-[minmax(0,1.25fr)_minmax(0,.75fr)] grid-rows-[minmax(0,1fr)_auto] gap-3">
        <div className="glass rounded-xl overflow-hidden flex flex-col min-w-0 min-h-0">
            <div className="flex items-center gap-2 px-2.5 py-2 border-b border-[rgba(250,248,245,.1)] font-mono text-[9px] text-ink-4">
                <span className="flex gap-1"><span className="w-1.5 h-1.5 rounded-full bg-ink-2" /><span className="w-1.5 h-1.5 rounded-full bg-ink-2" /></span>
                <span className="flex-1 text-center p-[3px] rounded bg-[rgba(250,248,245,.06)]">lincolnacademy.org</span>
            </div>
            <div className="flex-1 p-3.5 flex flex-col gap-2.5 min-h-0" style={{ background: 'linear-gradient(180deg,rgba(255,107,31,.18),transparent 60%)' }}>
                <div className="flex justify-between items-center">
                    <span className="font-display uppercase font-bold text-[13px] text-paper">Lincoln Academy</span>
                    <span className="flex gap-1.5">{[0, 1, 2].map(k => <span key={k} className="w-[22px] h-1 rounded-sm bg-[rgba(250,248,245,.3)]" />)}</span>
                </div>
                <div className="font-display uppercase font-bold text-[clamp(18px,2vw,26px)] leading-[.95] text-paper max-w-[80%]">Spring enrollment is open</div>
                <div className="inline-flex w-max px-[9px] py-[5px] rounded-md bg-[#FF6B1F] text-ink font-mono text-[9px]">Apply now</div>
                <div className="mt-auto grid grid-cols-3 gap-1.5">{[0, 1, 2].map(k => <span key={k} className="h-[26px] rounded-md bg-[rgba(250,248,245,.08)]" />)}</div>
            </div>
        </div>
        <div className="flex justify-center min-h-0">
            <div className="w-full max-w-[120px] rounded-[18px] border-2 border-[rgba(250,248,245,.25)] bg-night px-2 py-2.5 flex flex-col gap-[7px] overflow-hidden">
                <div className="flex justify-between font-mono text-[8px] text-ink-4"><span>Lincoln</span><span>9:41</span></div>
                <div className="font-display uppercase font-bold text-[12px] text-paper leading-none">Today</div>
                <PhoneCard label="Push · 8:02" labelColor="#FF6B1F" text="Early dismissal Fri 1pm" />
                <PhoneCard label="Calendar" text="Science fair · Gym" />
                <PhoneCard label="Lunch" text="Pizza Tuesday" />
                <div className="mt-auto flex justify-around pt-1 border-t border-[rgba(250,248,245,.1)]">
                    {[0, 1, 2, 3].map(k => <span key={k} className="w-2.5 h-2.5 rounded-[3px]" style={{ background: k === 0 ? '#FF6B1F' : 'rgba(250,248,245,.2)' }} />)}
                </div>
            </div>
        </div>
        <div className="col-span-full glass rounded-xl px-3 py-2.5 flex items-center gap-3 font-mono text-[10px] text-bone min-w-0">
            <span className="px-2 py-1 rounded-md bg-[#FF6B1F] text-ink whitespace-nowrap">CMS</span>
            <span className="truncate">{CMS_MSGS[f % CMS_MSGS.length]}</span>
            <span className="ml-auto whitespace-nowrap text-green">● published to web + app</span>
        </div>
    </div>
);

/* ---------- 03 Loomino: natural language → live code change ---------- */
const Loomino: V = ({ f }) => {
    const stage = f % 5; // 0 ask, 1 agent ack, 2 diff, 3 deploying, 4 live
    const headline = stage >= 2 ? 'Same-day emergency appointments' : 'Welcome to Harbor Dental';
    const chat = [
        { side: 'flex-start', bg: 'rgba(250,248,245,.1)', fg: '#FAF8F5', text: 'Can you change the homepage headline to “Same-day emergency appointments”? And make it live today.', op: 1 },
        { side: 'flex-end', bg: '#0E8C8C', fg: '#fff', text: stage >= 3 ? 'Done. Headline updated in hero.tsx, preview approved, deploying to production now.' : 'On it — editing hero.tsx and generating a preview.', op: stage >= 1 ? 1 : 0 },
        { side: 'flex-end', bg: '#0E8C8C', fg: '#fff', text: 'Live at harbordental.com · 41 seconds.', op: stage >= 4 ? 1 : 0 },
    ];
    const deploy = ['draft', 'editing', 'preview ready', 'deploying…', 'live'][stage];
    const deployBg = stage === 4 ? '#2EB884' : stage === 3 ? '#FF8A5C' : '#D8D2CB';
    const line = 'whitespace-nowrap overflow-hidden text-ellipsis';
    return (
        <div className="absolute inset-0 grid grid-cols-2 gap-3 min-h-0">
            <div className="glass p-3 flex flex-col gap-2 min-w-0 min-h-0 overflow-hidden">
                <div className="flex justify-between font-mono text-[9px] text-ink-4"><span>Loomino · client chat</span><span className="text-[#0E8C8C]">● agent online</span></div>
                <div className="flex-1 flex flex-col gap-2 justify-end min-h-0">
                    {chat.map((c, i) => (
                        <div key={i} className="flex" style={{ justifyContent: c.side }}>
                            <div className="max-w-[90%] px-2.5 py-2 rounded-xl text-[11px] leading-[1.4] transition-opacity duration-500" style={{ background: c.bg, color: c.fg, opacity: c.op }}>{c.text}</div>
                        </div>
                    ))}
                </div>
                <div className="flex items-center gap-2 px-2.5 py-2 rounded-[10px] bg-[rgba(250,248,245,.08)] font-mono text-[10px] text-ink-4">
                    <span className="flex-1 truncate">Type a request…</span>
                    <span className="w-5 h-5 rounded-md bg-[#0E8C8C] grid place-items-center text-white text-[10px]">↑</span>
                </div>
            </div>
            <div className="grid grid-rows-[minmax(0,1fr)_auto] gap-2 min-w-0 min-h-0">
                <div className="glass rounded-xl p-3 font-mono text-[10px] leading-[1.7] text-bone overflow-hidden min-h-0">
                    <div className="flex justify-between mb-1.5 text-ink-4"><span>hero.tsx</span><span style={{ color: stage >= 2 ? '#2EB884' : '#5E5A66' }}>{stage >= 2 ? '+1 −1' : 'no changes'}</span></div>
                    <div className={`${line} text-ink-3`}>&lt;section className="hero"&gt;</div>
                    <div className={`${line} bg-[rgba(224,67,122,.18)] text-[#FFB3C8] line-through`}>-&nbsp;&lt;h1&gt;Welcome to Harbor Dental&lt;/h1&gt;</div>
                    <div className={`${line} bg-[rgba(46,184,132,.18)] text-[#9FE8CD] transition-opacity duration-500`} style={{ opacity: stage >= 2 ? 1 : 0.15 }}>+&nbsp;&lt;h1&gt;{headline}&lt;/h1&gt;</div>
                    <div className={`${line} text-ink-3`}>&nbsp;&nbsp;&lt;Button&gt;Book a visit&lt;/Button&gt;</div>
                    <div className={`${line} text-ink-3`}>&lt;/section&gt;</div>
                </div>
                <div className="glass rounded-xl px-3 py-2.5 flex flex-col gap-1.5 min-w-0">
                    <div className="flex justify-between items-center font-mono text-[9px] text-ink-4">
                        <span>harbordental.com · preview</span>
                        <span className="px-1.5 py-0.5 rounded text-ink transition-colors duration-500" style={{ background: deployBg }}>{deploy}</span>
                    </div>
                    <div className="font-display uppercase font-bold text-[clamp(14px,1.5vw,20px)] leading-none text-paper truncate">{headline}</div>
                    <div className="inline-flex w-max px-2 py-1 rounded-[5px] bg-[#0E8C8C] text-white font-mono text-[8px]">Book a visit</div>
                </div>
            </div>
        </div>
    );
};

/* ---------- 04 Staffy: waveform ---------- */
const Staffy: V = ({ f }) => (
    <div className="absolute inset-0 flex flex-col justify-center gap-[18px]">
        <div className="flex items-center gap-[3px] h-[46%]">
            {Array.from({ length: 48 }, (_, i) => {
                const v = 0.25 + 0.75 * Math.abs(Math.sin(i * 0.55 + f * 0.9) * Math.cos(i * 0.17 + f * 0.3));
                return <div key={i} className="flex-1 rounded-[3px] transition-[height] duration-300" style={{ height: `${Math.round(v * 100)}%`, background: i < 18 + (f % 12) ? '#E0437A' : 'rgba(250,248,245,.22)' }} />;
            })}
        </div>
        <div className="flex items-center justify-between gap-3 font-mono text-[11px] text-bone">
            <span className="inline-flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-full bg-[#E0437A] grid place-items-center text-ink text-[12px]">▶</span>
                "warm lo-fi, 92 bpm, no vocals"
            </span>
            <span className="text-[#E0437A]">royalty-free · 2:48</span>
        </div>
    </div>
);

/* ---------- 05 Kabonzo: quiz arena ---------- */
const KB_QS: [string, string, string[], number][] = [
    ['What is 1 - 3/5?', 'Write 1 as 5/5. Then subtract the numerators.', ['2/5', '4/5', '1/5', '3/5'], 0],
    ['Which equals 2/4?', 'Divide top and bottom by the same number.', ['1/3', '1/2', '2/3', '3/4'], 1],
    ['What is 1/4 + 1/4?', 'Same denominators — add the numerators.', ['1/8', '2/8', '1/2', '1/4'], 2],
];
const KB_COLORS = ['#F26A5B', '#3B82F6', '#22C55E', '#F5A623'];

const Kabonzo: V = ({ f }) => {
    const q = KB_QS[Math.floor(f / 4) % KB_QS.length];
    const phase = f % 4;
    const secs = Math.max(1, 5 - phase);
    const clouds = 'radial-gradient(ellipse 18% 60% at 10% 100%,#fff 60%,transparent 61%),radial-gradient(ellipse 22% 70% at 30% 100%,#fff 60%,transparent 61%),radial-gradient(ellipse 16% 55% at 50% 100%,#fff 60%,transparent 61%),radial-gradient(ellipse 24% 75% at 72% 100%,#fff 60%,transparent 61%),radial-gradient(ellipse 18% 60% at 92% 100%,#fff 60%,transparent 61%)';
    return (
        <div className="absolute inset-0 rounded-2xl overflow-hidden text-[#2B2B33] font-sans flex flex-col" style={{ background: 'linear-gradient(180deg,#BFE3FA 0%,#DDF1FC 55%,#EAF6FD 100%)' }}>
            <div aria-hidden="true" className="absolute -left-[10%] -right-[10%] top-[38%] h-[28%] opacity-90" style={{ background: clouds }} />
            <div className="relative flex justify-between items-center px-3 py-2.5 gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-[5px] rounded-full bg-white border-2 border-[#2B2B33] text-[10px] font-semibold whitespace-nowrap">
                    <span className="w-3 h-3 rounded-full bg-[#F26A5B] border-2 border-[#2B2B33] flex-none" />Equivalent fractions · <strong>Quiz Arena</strong>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-[5px] rounded-full bg-white border-2 border-[#2B2B33] text-[10px] font-semibold">
                    <span className="w-2 h-2 rounded-full bg-[#F5A623]" />{120 + Math.floor(f / 4) * 40}
                </span>
            </div>
            <div className="relative flex-1 flex flex-col items-center justify-center gap-1.5 px-3.5 pb-1.5 min-h-0 overflow-hidden">
                <div className="w-[38px] h-[38px] rounded-full grid place-items-center" style={{ background: `conic-gradient(#F26A5B ${Math.round(secs / 5 * 100)}%,#CBD5E1 0)` }}>
                    <span className="w-[30px] h-[30px] rounded-full bg-[#EAF6FD] grid place-items-center font-bold text-[13px] text-[#F26A5B]">{secs}</span>
                </div>
                <span className="font-mono text-[8px] tracking-[.14em] uppercase text-[#5E6B7A]">Question {(Math.floor(f / 4) % 3) + 1} of 5</span>
                <div className="w-full max-w-[300px] px-3.5 py-3 rounded-[14px] bg-[#F7FAFF] border-2 border-[#2B2B33] shadow-[0_5px_0_#2B2B33] text-center">
                    <div className="font-bold text-[clamp(15px,1.6vw,19px)] tracking-[-0.01em]">{q[0]}</div>
                    <div className="mt-1.5 inline-block px-2 py-[3px] rounded-md bg-[#FFF4CC] border border-dashed border-[#E3C56A] text-[8px] text-[#7A6420]">Hint: {q[1]}</div>
                </div>
                <div className="w-full max-w-[300px] grid grid-cols-2 gap-2">
                    {q[2].map((v, i) => (
                        <div
                            key={i}
                            className="flex items-center gap-2 px-2.5 py-2 rounded-xl border-2 border-[#2B2B33] shadow-[0_4px_0_#2B2B33] text-white font-bold text-[12px] transition-transform duration-300"
                            style={{ background: KB_COLORS[i], transform: phase === 3 && i === q[3] ? 'translateY(3px) scale(1.04)' : 'none' }}
                        >
                            <span className="w-5 h-5 rounded-md bg-[rgba(255,255,255,.3)] grid place-items-center text-[10px]">{'ABCD'[i]}</span>{v}
                        </div>
                    ))}
                </div>
            </div>
            <div aria-hidden="true" className="relative h-[34px] flex-none" style={{ background: 'linear-gradient(180deg,#8FD37D 0 4px,#E39A7B 4px 12px,#7BB661 12px)' }} />
            <div aria-hidden="true" className="absolute left-3.5 bottom-6 w-[26px] h-[26px] bg-[#5ED0A6] border-2 border-[#2B2B33]" style={{ borderRadius: '50% 50% 45% 45%' }} />
        </div>
    );
};

/* ---------- 06 UESDAD: social feed ---------- */
const STORIES = [
    { in: '+', n: 'You', av: 'rgba(250,248,245,.15)', ring: 'rgba(250,248,245,.25)' },
    { in: 'M', n: 'Mike', av: '#FF5A1F', ring: 'linear-gradient(45deg,#FF5A1F,#2F6FE8)' },
    { in: 'D', n: 'Dan', av: '#2EB884', ring: 'linear-gradient(45deg,#FF5A1F,#2F6FE8)' },
    { in: 'R', n: 'Raj', av: '#2F6FE8', ring: 'linear-gradient(45deg,#FF5A1F,#2F6FE8)' },
    { in: 'J', n: 'Josh', av: '#FAF8F5', ring: 'rgba(250,248,245,.25)' },
];

const Uesdad: V = ({ f }) => {
    const posts = [
        { in: 'M', av: '#FF5A1F', name: 'Mike T.', meta: 'Carl Schurz Park · 12 min', text: "Playground meetup Saturday 9am — bringing coffee for the crew. Who's in?", img: true, likes: 24 + (f % 7), comments: 9, tag: '#UES', likeC: f % 2 ? '#E0437A' : '#A9A3B3' },
        { in: 'D', av: '#2EB884', name: 'Dan K.', meta: 'Perk · 1 hr', text: 'Two Boots is doing 20% off for UESDAD members tonight.', img: false, likes: 41, comments: 6, tag: 'Perk', likeC: '#A9A3B3' },
    ];
    return (
        <div className="absolute inset-0 flex justify-center items-end">
            <div className="w-[min(250px,84%)] h-full rounded-t-[28px] border-2 border-b-0 border-[rgba(250,248,245,.25)] bg-night pt-3.5 px-3 flex flex-col gap-2.5 overflow-hidden">
                <div className="flex justify-between items-center font-mono text-[10px] text-ink-4">
                    <span className="font-display uppercase font-bold text-[16px] text-paper tracking-[.02em]">UESDAD</span>
                    <span className="flex gap-1.5 items-center">
                        <span className="w-4 h-4 rounded-full bg-[rgba(250,248,245,.12)]" />
                        <span className="w-4 h-4 rounded-full bg-[#2F6FE8] text-white grid place-items-center text-[8px]">3</span>
                    </span>
                </div>
                <div className="flex gap-2 overflow-hidden flex-none">
                    {STORIES.map(s => (
                        <span key={s.n} className="flex-none flex flex-col items-center gap-[3px]">
                            <span className="w-9 h-9 rounded-full p-0.5" style={{ background: s.ring }}>
                                <span className="grid place-items-center w-full h-full rounded-full text-ink font-display uppercase font-bold text-[12px] border-2 border-night" style={{ background: s.av }}>{s.in}</span>
                            </span>
                            <span className="font-mono text-[7px] text-ink-4">{s.n}</span>
                        </span>
                    ))}
                </div>
                {posts.map(p => (
                    <div key={p.name} className="glass rounded-xl p-2.5 flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <span className="w-[26px] h-[26px] rounded-full grid place-items-center font-display uppercase font-bold text-[11px] text-ink flex-none" style={{ background: p.av }}>{p.in}</span>
                            <span className="flex flex-col min-w-0">
                                <span className="text-[11px] font-semibold text-paper truncate">{p.name} <span className="text-[#2F6FE8]">✓</span></span>
                                <span className="font-mono text-[8px] text-ink-4">{p.meta}</span>
                            </span>
                        </div>
                        <div className="text-[11px] leading-[1.4] text-bone">{p.text}</div>
                        {p.img && <div className="h-16 rounded-lg" style={{ background: 'linear-gradient(135deg,#2F6FE8,#7FB3FF 60%,#FFC9B0)' }} />}
                        <div className="flex gap-3.5 font-mono text-[9px] text-ink-4">
                            <span style={{ color: p.likeC }}>♥ {p.likes}</span><span>{p.comments} comments</span><span className="ml-auto text-[#2F6FE8]">{p.tag}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

/* ---------- 07 Dog Kitchen: intelligence dashboard ---------- */
const DK_SRC = [{ n: 'arXiv', c: '#FF5A1F', p: '38%' }, { n: 'Hugging Face', c: '#2F6FE8', p: '26%' }, { n: 'GitHub', c: '#2EB884', p: '18%' }, { n: 'News', c: '#E0437A', p: '11%' }];
const DK_TREND = [{ n: 'agent evals', d: '+140%' }, { n: 'MoE', d: '+62%' }, { n: 'tool use', d: '+48%' }, { n: 'RAG bench', d: '+31%' }];

const DogKitchen: V = ({ f }) => {
    const kpis = [
        { k: 'papers indexed', v: (48210 + f * 3).toLocaleString('en-US'), d: '+312 today', dc: '#2EB884' },
        { k: 'models tracked', v: (9840 + Math.floor(f / 2)).toLocaleString('en-US'), d: '+41 this week', dc: '#2EB884' },
        { k: 'open roles', v: '1,286', d: 'NYC · 38 new', dc: '#FF8A5C' },
        { k: 'datasets', v: '3,402', d: '+9 mirrored', dc: '#2EB884' },
    ];
    return (
        <div className="absolute inset-0 grid grid-cols-4 grid-rows-[auto_minmax(0,1fr)_auto] gap-2 min-h-0 min-w-0">
            {kpis.map(kp => (
                <div key={kp.k} className="glass rounded-[10px] px-3 py-2.5 flex flex-col gap-0.5 min-w-0">
                    <span className="font-mono text-[8px] tracking-[.1em] uppercase text-ink-4 truncate">{kp.k}</span>
                    <span className="font-display uppercase font-bold text-[clamp(18px,2vw,26px)] leading-none text-paper">{kp.v}</span>
                    <span className="font-mono text-[8px]" style={{ color: kp.dc }}>{kp.d}</span>
                </div>
            ))}
            <div className="col-span-3 glass rounded-xl p-3 flex flex-col gap-2 min-h-0 min-w-0">
                <div className="flex justify-between font-mono text-[9px] text-ink-4"><span>Model releases indexed · 30 days</span><span className="text-orange">▲ live</span></div>
                <div className="flex-1 flex items-end gap-[3px] min-h-0">
                    {Array.from({ length: 30 }, (_, i) => {
                        const v = 0.25 + 0.6 * Math.abs(Math.sin(i * 0.9 + 1.3)) * (0.7 + 0.3 * Math.sin(i * 0.3));
                        const live = i === 29;
                        const h = live ? 0.55 + 0.4 * ((f % 5) / 4) : v;
                        return <div key={i} className="flex-1 rounded-t-sm transition-[height] duration-500" style={{ height: `${Math.round(h * 100)}%`, background: live ? '#FF5A1F' : i > 22 ? 'rgba(255,90,31,.7)' : 'rgba(250,248,245,.3)' }} />;
                    })}
                </div>
                <div className="flex justify-between font-mono text-[8px] text-ink-3"><span>Sep 01</span><span>Sep 15</span><span>Sep 30</span></div>
            </div>
            <div className="glass rounded-xl p-3 flex flex-col gap-2 min-h-0 min-w-0">
                <span className="font-mono text-[9px] text-ink-4">Sources</span>
                <div className="relative w-16 h-16 my-0.5 mx-auto rounded-full" style={{ background: 'conic-gradient(#FF5A1F 0 38%,#2F6FE8 38% 64%,#2EB884 64% 82%,#E0437A 82% 93%,rgba(250,248,245,.25) 93%)' }}>
                    <span className="absolute inset-3.5 rounded-full bg-night-2 grid place-items-center font-display uppercase font-bold text-[13px] text-paper">61k</span>
                </div>
                {DK_SRC.map(s => (
                    <div key={s.n} className="flex items-center gap-1.5 font-mono text-[8px] text-bone min-w-0">
                        <span className="w-1.5 h-1.5 rounded-sm flex-none" style={{ background: s.c }} />
                        <span className="flex-1 min-w-0 truncate">{s.n}</span>
                        <span className="text-ink-4 flex-none">{s.p}</span>
                    </div>
                ))}
            </div>
            <div className="col-span-full glass rounded-xl px-3 py-2.5 flex flex-wrap items-center gap-2 font-mono text-[10px] text-bone min-w-0 overflow-hidden">
                <span className="px-[7px] py-[3px] rounded-[5px] bg-orange text-ink whitespace-nowrap">trending</span>
                {DK_TREND.map(t => (
                    <span key={t.n} className="whitespace-nowrap inline-flex items-center gap-[5px] px-2 py-[3px] rounded-full border border-[rgba(250,248,245,.14)]">{t.n}<span className="text-green">{t.d}</span></span>
                ))}
            </div>
        </div>
    );
};

const VIGNETTES: V[] = [Cafecito, Schoolz, Loomino, Staffy, Kabonzo, Uesdad, DogKitchen];

/* ------------------------------------------------------------------ *
 *  The showcase
 * ------------------------------------------------------------------ */

export const ProductShowcase: React.FC<{ heading?: 'h2' | 'none' }> = ({ heading = 'h2' }) => {
    const [active, setActive] = useState(0);
    const [frame, setFrame] = useState(0);
    // Set after mount so the pre-rendered markup and the first client render agree.
    const [still, setStill] = useState(false);
    const section = useRef<HTMLElement>(null);
    const progress = useRef<HTMLDivElement>(null);

    useEffect(() => { setStill(reducedMotion()); }, []);

    // Which step spans the viewport centre drives the visual.
    useOnScroll(() => {
        const root = section.current;
        if (!root) return;
        const vh = window.innerHeight;
        const mid = vh / 2;
        const steps = Array.from(root.querySelectorAll('[data-step]')) as HTMLElement[];
        let best = -1;
        steps.forEach(el => {
            const r = el.getBoundingClientRect();
            if (r.top <= mid && r.bottom >= mid) best = Number(el.dataset.step);
        });
        if (best < 0 && steps.length) {
            const first = steps[0].getBoundingClientRect();
            const last = steps[steps.length - 1].getBoundingClientRect();
            if (first.height === 0 || first.top > mid) best = 0;
            else if (last.bottom < mid) best = steps.length - 1;
        }
        if (best >= 0) setActive(a => (a === best ? a : best));
        if (progress.current) {
            const r = root.getBoundingClientRect();
            const sp = clamp01((-r.top + vh * 0.4) / (r.height - vh * 0.6));
            progress.current.style.transform = `scaleX(${sp})`;
        }
    });

    // The vignettes' heartbeat, only while the showcase is on screen.
    useEffect(() => {
        if (!section.current || reducedMotion()) return;
        let beat = 0;
        const io = new IntersectionObserver(entries => {
            window.clearInterval(beat);
            if (entries[0].isIntersecting) beat = window.setInterval(() => setFrame(f => f + 1), 1400);
        }, { threshold: 0 });
        io.observe(section.current);
        return () => { io.disconnect(); window.clearInterval(beat); };
    }, []);

    const count = PRODUCTS.length;

    return (
        <section ref={section} aria-labelledby={heading === 'h2' ? 'products-h' : undefined} className="relative max-w-site mx-auto px-6 pt-28 pb-10">
            {heading === 'h2' && (
                <div data-reveal="0" className="max-w-[720px] mb-14">
                    <Eyebrow>Shipped work · {count} products of our own</Eyebrow>
                    <h2 id="products-h" className="display m-0 mb-4 text-[clamp(44px,5.6vw,84px)]">Our Products</h2>
                    <p className="m-0 text-[18px] leading-normal text-ink-2 [text-wrap:pretty]">A showcase of excellence. We build scalable, agentic, and beautiful software that powers businesses.</p>
                </div>
            )}

            <div className="grid gap-14 items-start min-[901px]:grid-cols-[minmax(0,1.1fr)_minmax(0,.9fr)]">
                <div className="sticky top-24 h-[calc(100vh-128px)] min-h-[440px] max-h-[720px] max-[900px]:top-[72px] max-[900px]:h-[44vh] max-[900px]:min-h-[280px] max-[900px]:max-h-none max-[900px]:z-[2]">
                    <div className="relative h-full rounded-3xl overflow-hidden bg-night-2 shadow-[0_40px_80px_-40px_rgba(23,21,26,.5)]">
                        {PRODUCTS.map((p, i) => {
                            const on = i === active;
                            const Vignette = VIGNETTES[i];
                            return (
                                <div
                                    key={p.name}
                                    aria-hidden={!on}
                                    className="absolute inset-0 p-7 flex flex-col text-paper will-change-[opacity,transform]"
                                    style={{
                                        background: `radial-gradient(ellipse 70% 60% at 22% 12%, ${p.color}66, #17151A 70%)`,
                                        opacity: on ? 1 : 0,
                                        transform: still ? 'none' : on ? 'translateY(0) scale(1)' : i < active ? 'translateY(-24px) scale(1.02)' : 'translateY(28px) scale(.97)',
                                        transition: 'opacity .55s ease, transform .8s cubic-bezier(.2,.7,.2,1), background .6s ease',
                                    }}
                                >
                                    <div aria-hidden="true" className="absolute -right-2 -bottom-[30px] font-display uppercase font-bold text-[clamp(160px,22vw,300px)] leading-none outline-ghost pointer-events-none select-none">{pad(i + 1)}</div>
                                    <div className="relative flex items-center justify-between font-mono text-[12px] text-bone">
                                        <span className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[rgba(250,248,245,.08)] border border-[rgba(250,248,245,.14)]">
                                            <span className="w-[7px] h-[7px] rounded-full" style={{ background: p.color }} />{p.domain}
                                        </span>
                                        <span>{pad(i + 1)}</span>
                                    </div>
                                    <div className="flex-1 relative mt-5 mb-4 min-h-0">{on && <Vignette f={frame} />}</div>
                                    <div className="relative flex items-end justify-between gap-4">
                                        <div>
                                            <div className="font-mono text-[12px] text-peach mb-1.5">{p.category}</div>
                                            <div className="font-display uppercase text-[clamp(32px,3.2vw,48px)] font-bold leading-none">{p.name}</div>
                                        </div>
                                        <div className="font-mono text-[12px] text-bone text-right max-w-[200px] leading-[1.4] max-[900px]:hidden">{p.outcome}</div>
                                    </div>
                                </div>
                            );
                        })}
                        <div aria-hidden="true" className="absolute left-7 right-7 bottom-4 h-0.5 bg-[rgba(250,248,245,.15)] rounded-sm overflow-hidden">
                            <div ref={progress} className="h-full w-full bg-orange origin-left scale-x-0 will-change-transform" />
                        </div>
                    </div>
                </div>

                <div className="pt-2 max-[900px]:pt-6">
                    {PRODUCTS.map((p, i) => {
                        const on = i === active;
                        return (
                            <article
                                key={p.name}
                                data-step={i}
                                className="min-h-[72vh] max-[900px]:min-h-0 flex flex-col justify-center py-8 max-[900px]:py-10 border-b border-line transition-opacity duration-500"
                                style={{ opacity: still || on ? 1 : 0.42 }}
                            >
                                <div className="flex items-center gap-3.5 mb-[18px] font-mono text-[12px] text-ink-3">
                                    <span className="inline-block w-7 h-0.5 transition-colors duration-500" style={{ background: on ? p.color : '#D9D3CB' }} />
                                    {p.domain} <span className="text-[#B8B2AA]">{pad(i + 1)}</span>
                                </div>
                                <h3 className="display m-0 mb-2 text-[clamp(34px,3.6vw,52px)] leading-none tracking-normal">{p.name}</h3>
                                <p className="m-0 mb-4 font-mono text-[13px] text-orange-ink">{p.category}</p>
                                <p className="m-0 mb-6 text-[17px] leading-[1.55] text-ink-2 max-w-[520px] [text-wrap:pretty]">{p.desc}</p>
                                <div className="flex flex-wrap gap-2.5">
                                    {p.links.map(l => (
                                        <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="btn btn-ghost h-10 px-4 rounded-[10px] text-[14px] gap-2">
                                            {l.label} <span aria-hidden="true" className="text-[12px]">↗</span>
                                        </a>
                                    ))}
                                </div>
                            </article>
                        );
                    })}
                </div>
            </div>
            <p aria-live="polite" className="mt-7 font-mono text-[12px] text-ink-3">{pad(active + 1)} / {pad(count)} — {PRODUCTS[active].name}</p>
        </section>
    );
};
