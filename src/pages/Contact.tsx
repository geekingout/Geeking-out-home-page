import React, { useEffect, useRef, useState } from 'react';
import { PROCESS, SITE } from '../content';
import { href, useRoute } from '../router';
import { sendToGoogleSheets } from '../sheets';
import { ACCENT_HEX, Bar, Button, Icon, PageTitle, Panel, Reveal, Typewriter, type IconName } from '../ui';

/* ─── Data ───────────────────────────────────────────────────────────────────────────────────
   Chapter 06 — the mission briefing. This is the only screen on the site that talks to a server:
   the form POSTs to the Google Sheets webhook in ../sheets. Everything factual (contact details,
   response time, process step names) is read from content.ts; the copy around it is framing. */

type Status = 'idle' | 'sending' | 'sent' | 'failed';
type Fields = { name: string; email: string; organization: string; project: string };

const QUEST_PREFIX = "I'd like to talk about: ";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const pad = (n: number) => String(n).padStart(2, '0');

const initialFields = (quest: string | null): Fields => ({
    name: '',
    email: '',
    organization: '',
    project: quest ? QUEST_PREFIX + quest : '',
});

/** The required inputs and what "filled in" means for each; drives the readiness meter. */
const REQUIRED: { key: keyof Fields; ok: (v: string) => boolean }[] = [
    { key: 'name', ok: v => v.trim().length > 0 },
    { key: 'email', ok: v => EMAIL_RE.test(v.trim()) },
    { key: 'project', ok: v => v.trim().length > 0 },
];

/** Direct lines. Every value comes straight from SITE; only the captions are ours. */
const COMMS: { icon: IconName; label: string; value: string; href?: string; external?: boolean }[] = [
    { icon: 'mail', label: 'Email', value: SITE.email, href: `mailto:${SITE.email}` },
    { icon: 'phone', label: 'Phone', value: SITE.phoneDisplay, href: SITE.phoneHref },
    { icon: 'chat', label: 'Messaging', value: 'WhatsApp', href: SITE.whatsapp, external: true },
    { icon: 'globe', label: 'Location', value: SITE.location },
    { icon: 'clock', label: 'Response time', value: SITE.responseTime },
];

/** What happens after the briefing lands: the first campaign phase, step names verbatim. */
const NEXT = PROCESS[0];

/* ─── Local pieces ───────────────────────────────────────────────────────────────────────── */

type FieldProps = {
    id: keyof Fields;
    label: string;
    value: string;
    onChange: (v: string) => void;
    /** Entrance stagger in ms. */
    delay: number;
    required?: boolean;
    placeholder?: string;
    type?: 'text' | 'email';
    autoComplete?: string;
    /** Render a textarea with this many rows instead of an input. */
    rows?: number;
    className?: string;
};

/** One labelled input. `.label` is a block, so the optional marker sits in a flex span inside it. */
const Field: React.FC<FieldProps> = ({ id, label, value, onChange, delay, required, placeholder, type = 'text', autoComplete, rows, className = '' }) => {
    const inputId = `briefing-${id}`;
    return (
        <div className={`min-w-0 animate-fade-up ${className}`} style={{ animationDelay: `${delay}ms` }}>
            <label htmlFor={inputId} className="label">
                <span className="flex items-baseline justify-between gap-4">
                    <span>{label}</span>
                    {!required && <span className="text-ink-mute tracking-[0.18em]">Optional</span>}
                </span>
            </label>
            {rows ? (
                <textarea
                    id={inputId}
                    name={id}
                    rows={rows}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    required={required}
                    placeholder={placeholder}
                    className="input resize-y"
                />
            ) : (
                <input
                    id={inputId}
                    name={id}
                    type={type}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    required={required}
                    placeholder={placeholder}
                    autoComplete={autoComplete}
                    className="input"
                />
            )}
        </div>
    );
};

/** Small square icon well used at the head of the outcome panels. */
const Badge: React.FC<{ icon: IconName; hex: string }> = ({ icon, hex }) => (
    <span
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center border"
        style={{ color: hex, borderColor: `${hex}80`, boxShadow: `0 0 18px -6px ${hex}` }}
        aria-hidden="true"
    >
        <Icon name={icon} size={16} />
    </span>
);

/* ─── Page ───────────────────────────────────────────────────────────────────────────────── */

export const Contact: React.FC = () => {
    const quest = useRoute().params.get('quest');
    const [fields, setFields] = useState<Fields>(() => initialFields(quest));
    const [status, setStatus] = useState<Status>('idle');
    const resultHeading = useRef<HTMLHeadingElement>(null);

    // Arriving with a different ?quest while already on this screen: refresh the prefill unless
    // the operator has started writing something of their own.
    useEffect(() => {
        if (!quest) return;
        const prefill = QUEST_PREFIX + quest;
        setFields(f => {
            if (f.project === prefill) return f;
            return (f.project.trim() === '' || f.project.startsWith(QUEST_PREFIX)) ? { ...f, project: prefill } : f;
        });
    }, [quest]);

    // Land keyboard and screen-reader users on the outcome once the form is replaced.
    useEffect(() => {
        if (status === 'sent' || status === 'failed') resultHeading.current?.focus({ preventScroll: true });
    }, [status]);

    const set = (key: keyof Fields) => (v: string) => setFields(f => ({ ...f, [key]: v }));
    const done = REQUIRED.filter(r => r.ok(fields[r.key])).length;
    const ready = done === REQUIRED.length;
    const sending = status === 'sending';
    const firstName = fields.name.trim().split(/\s+/)[0] || 'operator';

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (sending) return;
        setStatus('sending');
        // sendToGoogleSheets catches its own network errors, but guard anyway so nothing can leave
        // the button stuck on "Transmitting…".
        let ok = false;
        try {
            ok = await sendToGoogleSheets({
                source: 'Contact Form',
                name: fields.name.trim(),
                email: fields.email.trim(),
                organization: fields.organization.trim(),
                projectDescription: fields.project.trim(),
            });
        } catch {
            ok = false;
        }
        setStatus(ok ? 'sent' : 'failed');
    };

    const reset = () => { setFields(initialFields(quest)); setStatus('idle'); };

    return (
        <section className="page wrap">
            <PageTitle
                chapter="06"
                eyebrow="Mission briefing"
                title="Start Mission"
                subtitle={`Tell us what you're building. We'll get back to you ${SITE.responseTime}.`}
            />

            <div className="grid gap-10 lg:grid-cols-12 lg:gap-12 items-start">
                {/* ── Left: the briefing (form → success / failure) ─────────────────────────── */}
                <div className="min-w-0 lg:col-span-7">
                    <Reveal>
                        {status === 'sent' ? (
                            <Panel key="sent" glow="lime" corners padding="roomy" className="animate-fade-up" role="status" aria-live="polite">
                                <div className="flex items-center gap-4">
                                    <Badge icon="check" hex={ACCENT_HEX.lime} />
                                    <span className="hud-label" style={{ color: ACCENT_HEX.lime }}>Briefing received</span>
                                </div>
                                <h2 ref={resultHeading} tabIndex={-1} className="display title-gradient text-4xl md:text-5xl mt-6 break-words outline-none">
                                    Mission accepted
                                </h2>
                                <Typewriter
                                    text={`Thanks ${firstName} — we've got your project details and we'll be in touch ${SITE.responseTime}.`}
                                    startDelay={350}
                                    className="mt-5 text-lg text-ink-dim leading-relaxed max-w-xl min-h-[3.5rem] break-words"
                                />
                                <div className="rule rule--left mt-8" aria-hidden="true" />
                                <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4">
                                    <Button href={href('/')} variant="outline" icon="arrowLeft">Return to title</Button>
                                    <Button variant="ghost" onClick={reset}>Send another</Button>
                                </div>
                            </Panel>
                        ) : status === 'failed' ? (
                            <Panel key="failed" glow="red" corners padding="roomy" className="animate-shake" role="alert">
                                <div className="flex items-center gap-4">
                                    <Badge icon="alert" hex={ACCENT_HEX.red} />
                                    <span className="hud-label" style={{ color: ACCENT_HEX.red }}>Comms error</span>
                                </div>
                                <h2 ref={resultHeading} tabIndex={-1} className="display text-4xl md:text-5xl mt-6 break-words outline-none">
                                    Signal lost
                                </h2>
                                <p className="mt-5 text-lg text-ink-dim leading-relaxed max-w-xl break-words">
                                    Transmission failed. Email us directly at{' '}
                                    <a href={`mailto:${SITE.email}`} className="text-ink underline underline-offset-4 decoration-ink-mute hover:text-brand-yellow transition-colors">{SITE.email}</a>.
                                </p>
                                <div className="rule rule--left mt-8" aria-hidden="true" />
                                <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4">
                                    <Button variant="outline" icon="signal" onClick={() => setStatus('idle')}>Retry</Button>
                                    <Button href={`mailto:${SITE.email}`} variant="ghost" iconRight="arrowUpRight">Email instead</Button>
                                </div>
                            </Panel>
                        ) : (
                            <Panel key="form" corners label="Briefing">
                                {/* .panel's backdrop-filter makes it a stacking context, so -z-10 keeps this decor
                                    under the label, corner brackets and form without hiding it behind the panel. */}
                                <div className="grid-bg absolute inset-0 -z-10 pointer-events-none" aria-hidden="true" />
                                <form onSubmit={onSubmit} aria-label="Mission briefing" className="relative min-w-0">
                                    <h2 className="sr-only">Briefing form</h2>

                                    {quest && (
                                        <div className="mb-6 animate-fade-in">
                                            <span className="tag tag--yellow tag--fill max-w-full break-words">
                                                <span className="dot" aria-hidden="true" />
                                                Selected mission — {quest}
                                            </span>
                                        </div>
                                    )}

                                    {/* Readiness meter: fills as the required fields are completed, flips lime when it can be sent. */}
                                    <Bar
                                        label="Transmission readiness"
                                        value={done}
                                        max={REQUIRED.length}
                                        color={ready ? 'lime' : 'yellow'}
                                        readout={ready ? 'Ready to transmit' : true}
                                        className="mb-8 animate-fade-in"
                                    />

                                    <div className="grid gap-6 sm:grid-cols-2">
                                        <Field id="name" label="Operator name" value={fields.name} onChange={set('name')} delay={80} required placeholder="Your name" autoComplete="name" />
                                        <Field id="email" label="Comms channel" value={fields.email} onChange={set('email')} delay={160} required type="email" placeholder="you@company.com" autoComplete="email" />
                                        <Field id="organization" label="Organization" value={fields.organization} onChange={set('organization')} delay={240} autoComplete="organization" className="sm:col-span-2" />
                                        <Field id="project" label="Mission details" value={fields.project} onChange={set('project')} delay={320} required rows={6} placeholder="What are you trying to build or automate?" className="sm:col-span-2" />
                                    </div>

                                    <div className="rule rule--left mt-8" aria-hidden="true" />
                                    <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-5 animate-fade-up" style={{ animationDelay: '400ms' }}>
                                        <Button
                                            type="submit"
                                            variant="gold"
                                            size="lg"
                                            icon={sending ? undefined : 'send'}
                                            disabled={sending}
                                            aria-busy={sending}
                                            className="w-full sm:w-auto"
                                        >
                                            {sending ? (
                                                <span className="inline-flex items-center gap-3">
                                                    <Icon name="loader" size={16} className="animate-spin-slow" />
                                                    Transmitting…
                                                </span>
                                            ) : 'Send briefing'}
                                        </Button>
                                        <p className="hud-label text-[0.62rem] inline-flex items-center gap-2">
                                            <Icon name="clock" size={14} />
                                            <span>Reply {SITE.responseTime}</span>
                                        </p>
                                    </div>
                                </form>
                            </Panel>
                        )}
                    </Reveal>
                </div>

                {/* ── Right: comms + what happens next ──────────────────────────────────────── */}
                <aside className="min-w-0 lg:col-span-5 space-y-10" aria-label="Contact details and next steps">
                    <Reveal delay={120}>
                        <Panel label="Comms">
                            <h2 className="display text-2xl">Direct lines</h2>
                            <ul className="mt-4 divide-y divide-line">
                                {COMMS.map((c, i) => {
                                    const inner = (
                                        <>
                                            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center border border-line text-ink-dim transition-colors group-hover:border-brand-yellow/50 group-hover:text-brand-yellow">
                                                <Icon name={c.icon} size={18} />
                                            </span>
                                            <span className="min-w-0 flex-1">
                                                <span className="hud-label block text-[0.62rem]">{c.label}</span>
                                                <span className="block text-ink break-words mt-0.5 transition-colors group-hover:text-brand-yellow">{c.value}</span>
                                            </span>
                                            {c.href && (
                                                <Icon
                                                    name={c.external ? 'arrowUpRight' : 'arrowRight'}
                                                    size={14}
                                                    className="text-ink-mute transition-all group-hover:text-brand-yellow group-hover:translate-x-0.5"
                                                />
                                            )}
                                        </>
                                    );
                                    return (
                                        <li key={c.label} className="animate-fade-up" style={{ animationDelay: `${160 + i * 70}ms` }}>
                                            {c.href ? (
                                                <a
                                                    href={c.href}
                                                    className="group flex items-center gap-4 py-3.5 -mx-2 px-2 transition-colors hover:bg-white/5"
                                                    {...(c.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                                                >
                                                    {inner}
                                                    {c.external && <span className="sr-only">(opens in a new tab)</span>}
                                                </a>
                                            ) : (
                                                <div className="flex items-center gap-4 py-3.5 -mx-2 px-2">{inner}</div>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        </Panel>
                    </Reveal>

                    <Reveal delay={240}>
                        <Panel label="What happens next">
                            <div className="flex items-baseline justify-between gap-4">
                                <h2 className="display text-2xl min-w-0 break-words">{NEXT.title}</h2>
                                <span className="numeral shrink-0 text-[0.62rem] uppercase text-ink-mute">{NEXT.phase}</span>
                            </div>
                            <ol className="mt-6">
                                {NEXT.steps.map((step, i) => (
                                    <li key={step} className="relative flex gap-5 pb-7 last:pb-0 animate-fade-up" style={{ animationDelay: `${300 + i * 90}ms` }}>
                                        {i < NEXT.steps.length - 1 && <span className="absolute left-[2.5px] top-5 bottom-0 w-px bg-line" aria-hidden="true" />}
                                        <span className="dot relative mt-2 text-brand-yellow" aria-hidden="true" />
                                        <span className="min-w-0">
                                            <span className="numeral block text-[0.62rem] text-brand-yellow">{pad(i + 1)}</span>
                                            <span className="display block mt-1 text-xl sm:text-2xl text-ink break-words">{step}</span>
                                        </span>
                                    </li>
                                ))}
                            </ol>
                            <div className="rule rule--left mt-7" aria-hidden="true" />
                            <Button href={href('/campaign')} variant="ghost" size="sm" className="mt-4">View the full campaign</Button>
                        </Panel>
                    </Reveal>
                </aside>
            </div>
        </section>
    );
};
