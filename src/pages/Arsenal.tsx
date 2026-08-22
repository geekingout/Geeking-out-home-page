import React, { useEffect, useRef, useState } from 'react';
import { FAQ, PRODUCTS, SITE, type Accent, type Product } from '../content';
import { href, useRoute } from '../router';
import { ACCENT_HEX, Button, Icon, PageTitle, Panel, Reveal, type IconName } from '../ui';

/**
 * Arsenal — the products screen, laid out like a loadout menu. Every item is a card you can
 * inspect; the inspected item opens in a detail panel (a strip below the grid on small screens,
 * a sticky side panel from lg up). Product copy is rendered verbatim from content.ts; tiers,
 * classes and HUD captions are the game-UI framing on top.
 */

const PANEL_ID = 'arsenal-inspect';

/* ─── Framing: tiers, classes, link labels ─────────────────────────────────────────────── */

type Tier = 'Legendary' | 'Epic' | 'Rare';
/** Rarity is flavor only, assigned per item so the grid reads as a loadout rather than a list. */
const TIERS: Record<string, Tier> = {
    cafecito: 'Legendary',
    notify: 'Epic',
    dogkitchen: 'Legendary',
    schoolz: 'Epic',
    loomino: 'Rare',
    staffy: 'Rare',
    gameonclass: 'Epic',
    uesdad: 'Rare',
};
const tierOf = (p: Product): Tier => TIERS[p.id] ?? 'Rare';

type LinkKey = keyof Product['links'];
const LINK_ORDER: LinkKey[] = ['website', 'ios', 'android', 'webApp'];
const LINK_META: Record<LinkKey, { label: string; icon: IconName }> = {
    website: { label: 'Website', icon: 'globe' },
    ios: { label: 'App Store', icon: 'smartphone' },
    android: { label: 'Google Play', icon: 'smartphone' },
    webApp: { label: 'Web App', icon: 'monitor' },
};
type ItemLink = { key: LinkKey; href: string; label: string; icon: IconName };
const linksOf = (p: Product): ItemLink[] =>
    LINK_ORDER.flatMap(key => {
        const url = p.links[key];
        return url ? [{ key, href: url, ...LINK_META[key] }] : [];
    });

/** Item class: mobile if it ships on a store, web app if it has a signed-in app, else web. */
type ItemClass = { name: 'Mobile' | 'Web app' | 'Web'; icon: IconName };
const CLASSES: ItemClass[] = [
    { name: 'Mobile', icon: 'smartphone' },
    { name: 'Web app', icon: 'monitor' },
    { name: 'Web', icon: 'globe' },
];
const classOf = (p: Product): ItemClass =>
    p.links.ios || p.links.android ? CLASSES[0] : p.links.webApp ? CLASSES[1] : CLASSES[2];
const LEGEND = CLASSES.map(c => ({ ...c, count: PRODUCTS.filter(p => classOf(p).name === c.name).length }));

const ACCENT_TEXT: Record<Accent, string> = {
    purple: 'text-brand-purple-soft',
    yellow: 'text-brand-yellow',
    lime: 'text-brand-lime',
    red: 'text-brand-red',
    pink: 'text-brand-pink',
    cyan: 'text-brand-cyan',
};

const pad = (n: number) => String(n).padStart(2, '0');
const TOTAL = pad(PRODUCTS.length);
const isProductId = (id: string | null): id is string => id !== null && PRODUCTS.some(p => p.id === id);

/** Colors the panel's corner brackets (styles.css reads --corner-color). */
const cornerStyle = (accent: Accent): React.CSSProperties =>
    ({ ['--corner-color' as string]: ACCENT_HEX[accent] }) as React.CSSProperties;

// HUD captions composed from utilities so they can carry their own color and size.
const HUD_GOLD = 'font-ui font-semibold text-[0.72rem] tracking-[0.3em] uppercase text-brand-yellow';
const HUD_SM = 'font-ui font-semibold text-[0.6rem] tracking-[0.26em] uppercase text-ink-mute';

const PRODUCTS_FAQ = FAQ.find(f => f.question === "What kind of 'AI Products' can you build?");

/* ─── Decor ────────────────────────────────────────────────────────────────────────────── */

/** Rotating reticle drawn behind the inspected item's icon. */
const Sigil: React.FC<{ accent: Accent; icon: IconName }> = ({ accent, icon }) => {
    const hex = ACCENT_HEX[accent];
    return (
        <div className="relative w-32 h-32 shrink-0" aria-hidden="true">
            <svg viewBox="0 0 128 128" className="absolute inset-0 w-full h-full" fill="none" stroke={hex} strokeWidth="1">
                <g className="animate-spin-slow" style={{ transformOrigin: '64px 64px' }}>
                    <circle cx="64" cy="64" r="58" strokeDasharray="4 14" opacity="0.55" />
                </g>
                <circle cx="64" cy="64" r="46" opacity="0.22" />
                <path d="M64 2v10M64 116v10M2 64h10M116 64h10" opacity="0.8" />
                <rect x="38" y="38" width="52" height="52" fill="rgba(255,255,255,0.03)" opacity="0.55" />
                <path d="M38 50V38h12M78 38h12v12M90 78v12H78M50 90H38V78" strokeWidth="2" opacity="0.9" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center" style={{ color: hex, filter: `drop-shadow(0 0 12px ${hex})` }}>
                <Icon name={icon} size={36} strokeWidth={1.4} />
            </span>
        </div>
    );
};

/** Empty slot shown in the side panel before anything is inspected. */
const EmptySlot: React.FC = () => (
    <svg viewBox="0 0 128 128" className="w-28 h-28 text-ink-mute" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true">
        <rect x="20" y="20" width="88" height="88" strokeDasharray="6 8" opacity="0.6" />
        <path d="M64 44l20 20-20 20-20-20z" opacity="0.8" />
        <path d="M64 2v10M64 116v10M2 64h10M116 64h10" opacity="0.5" />
    </svg>
);

/* ─── Item card ────────────────────────────────────────────────────────────────────────── */

type CardProps = {
    product: Product;
    index: number;
    selected: boolean;
    onSelect: (id: string) => void;
    onToggle: (id: string) => void;
    registerTrigger: (id: string, el: HTMLButtonElement | null) => void;
};

const ItemCard: React.FC<CardProps> = ({ product, index, selected, onSelect, onToggle, registerTrigger }) => {
    const { accent } = product;
    const tier = tierOf(product);
    const cls = classOf(product);
    const links = linksOf(product);
    const headingId = `arsenal-item-${product.id}`;
    return (
        <Panel
            as="article"
            hover
            corners
            glow={selected ? accent : undefined}
            padding="none"
            className="h-full flex flex-col cursor-pointer"
            style={selected ? cornerStyle(accent) : undefined}
            aria-labelledby={headingId}
            aria-current={selected ? 'true' : undefined}
            onClick={e => {
                // Links and the Inspect button handle themselves; the rest of the card selects.
                if ((e.target as Element).closest('a, button')) return;
                onSelect(product.id);
            }}
        >
            <div className="flex-1 min-w-0 p-6 md:p-7">
                <div className="flex items-center justify-between gap-4 mb-6">
                    <span className="numeral text-xs text-ink-mute">
                        <span className={selected ? 'text-brand-yellow' : 'text-ink'}>{pad(index + 1)}</span> / {TOTAL}
                    </span>
                    <span className={`tag tag--${accent}`}><span className="dot" aria-hidden="true" />{tier}</span>
                </div>
                <div className="flex items-start gap-4">
                    <span className={`inline-flex items-center justify-center w-12 h-12 shrink-0 border border-line bg-bg/40 ${ACCENT_TEXT[accent]}`}>
                        <Icon name={cls.icon} size={24} strokeWidth={1.4} label={cls.name} />
                    </span>
                    <div className="min-w-0">
                        <h3 id={headingId} className="display text-2xl break-words">{product.title}</h3>
                        <p className="hud-label mt-1.5">{product.subtitle}</p>
                    </div>
                </div>
                <p className="mt-5 text-ink-dim leading-relaxed break-words">{product.description}</p>
            </div>
            <footer className="flex flex-wrap items-center gap-2 border-t border-line p-4">
                {links.map(l => (
                    <Button key={l.key} href={l.href} variant="outline" size="sm" icon={l.icon}>
                        {l.label}<span className="sr-only"> — {product.title}</span>
                    </Button>
                ))}
                <button
                    type="button"
                    ref={el => { registerTrigger(product.id, el); }}
                    className={`btn btn--sm ml-auto ${selected ? 'btn--gold' : 'btn--ghost'}`}
                    aria-expanded={selected}
                    aria-controls={PANEL_ID}
                    onClick={() => onToggle(product.id)}
                >
                    {selected && <Icon name="check" size={16} />}
                    <span>{selected ? 'Inspecting' : 'Inspect'}</span>
                    {!selected && <span className="btn__arrow"><Icon name="arrowRight" size={16} /></span>}
                </button>
            </footer>
        </Panel>
    );
};

/* ─── Inspect panel ────────────────────────────────────────────────────────────────────── */

type InspectBodyProps = { product: Product; index: number; onClose: () => void; onStep: (dir: 1 | -1) => void };

const InspectBody: React.FC<InspectBodyProps> = ({ product, index, onClose, onStep }) => {
    const { accent } = product;
    const tier = tierOf(product);
    const cls = classOf(product);
    const links = linksOf(product);
    return (
        <>
            {/* keyed so the entrance replays for each newly inspected item */}
            <div key={product.id} className="animate-fade-up p-6 md:p-7">
                <div className="flex items-center justify-between gap-4">
                    <span className="numeral text-xs text-ink-mute">
                        <span className="text-brand-yellow">{pad(index + 1)}</span> / {TOTAL}
                    </span>
                    <div className="flex items-center gap-3">
                        <span className={`tag tag--${accent}`}><span className="dot" aria-hidden="true" />{tier}</span>
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Close inspect panel"
                            className="inline-flex items-center justify-center w-8 h-8 border border-line text-ink-dim hover:text-ink hover:border-line-strong transition-colors"
                        >
                            <Icon name="close" size={14} />
                        </button>
                    </div>
                </div>

                <div className="mt-6 flex flex-col items-center text-center">
                    <Sigil accent={accent} icon={cls.icon} />
                    <h2 className="display title-gradient text-4xl md:text-5xl mt-6 max-w-full break-words">{product.title}</h2>
                    <p className="hud-label mt-3">{product.subtitle}</p>
                </div>

                <div className="rule mt-6" aria-hidden="true" />
                <p className="mt-6 text-lg text-ink-dim leading-relaxed break-words">{product.description}</p>

                <dl className="mt-6 grid grid-cols-3 gap-3 border-y border-line py-4">
                    <div className="min-w-0">
                        <dt className={HUD_SM}>Class</dt>
                        <dd className="mt-1.5 flex items-center gap-2 text-sm text-ink"><Icon name={cls.icon} size={14} className="text-ink-mute" />{cls.name}</dd>
                    </div>
                    <div className="min-w-0">
                        <dt className={HUD_SM}>Tier</dt>
                        <dd className={`mt-1.5 text-sm ${ACCENT_TEXT[accent]}`}>{tier}</dd>
                    </div>
                    <div className="min-w-0">
                        <dt className={HUD_SM}>Links</dt>
                        <dd className="mt-1.5 numeral text-sm text-ink">{pad(links.length)}</dd>
                    </div>
                </dl>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
                    {links.map(l => (
                        <Button key={l.key} href={l.href} variant="outline" icon={l.icon} iconRight="arrowUpRight" block>
                            {l.label}<span className="sr-only"> — {product.title}</span>
                        </Button>
                    ))}
                </div>
            </div>

            <nav className="flex items-center justify-between gap-2 border-t border-line px-3 py-2" aria-label="Browse items">
                <button type="button" className="btn btn--ghost btn--sm" onClick={() => onStep(-1)} aria-label="Previous item">
                    <Icon name="arrowLeft" size={16} /><span>Prev</span>
                </button>
                <span className={`hidden sm:inline ${HUD_SM}`}>Arrow keys</span>
                <button type="button" className="btn btn--ghost btn--sm" onClick={() => onStep(1)} aria-label="Next item">
                    <span>Next</span><span className="btn__arrow"><Icon name="arrowRight" size={16} /></span>
                </button>
            </nav>
        </>
    );
};

type InspectPanelProps = {
    product: Product | null;
    index: number;
    onClose: () => void;
    onStep: (dir: 1 | -1) => void;
    panelRef: React.RefObject<HTMLElement | null>;
};

const InspectPanel: React.FC<InspectPanelProps> = ({ product, index, onClose, onStep, panelRef }) => {
    const onKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
        if (!product) return;
        if (e.key === 'ArrowLeft') { e.preventDefault(); onStep(-1); }
        else if (e.key === 'ArrowRight') { e.preventDefault(); onStep(1); }
    };
    return (
        <aside
            id={PANEL_ID}
            ref={panelRef}
            aria-label="Inspect"
            tabIndex={-1}
            onKeyDown={onKeyDown}
            className={`${product ? '' : 'hidden lg:block'} mt-10 lg:mt-0 lg:sticky lg:top-28 lg:self-start scroll-mt-28 min-w-0`}
        >
            <Panel label="Inspect" corners glow={product?.accent} padding="none" style={product ? cornerStyle(product.accent) : undefined}>
                {product ? (
                    <InspectBody product={product} index={index} onClose={onClose} onStep={onStep} />
                ) : (
                    <div className="flex flex-col items-center text-center px-6 py-12">
                        <EmptySlot />
                        <p className="hud-label mt-6">No item selected</p>
                        <p className="mt-2 text-sm text-ink-mute">Select any item to inspect it.</p>
                    </div>
                )}
            </Panel>
        </aside>
    );
};

/* ─── Page ─────────────────────────────────────────────────────────────────────────────── */

export const Arsenal: React.FC = () => {
    const { params } = useRoute();
    const wantedItem = params.get('item');
    // Deep link: #/arsenal?item=notify opens that item on arrival.
    const [selectedId, setSelectedId] = useState<string | null>(() => (isProductId(wantedItem) ? wantedItem : null));
    const triggers = useRef(new Map<string, HTMLButtonElement>());
    const panelRef = useRef<HTMLElement>(null);
    const scrollPending = useRef(false);
    const refocusPending = useRef(false);

    const selectedIndex = PRODUCTS.findIndex(p => p.id === selectedId);
    const selected = selectedIndex >= 0 ? PRODUCTS[selectedIndex] : null;

    // The hash can change in place (App only remounts the page on a path change), so follow it.
    useEffect(() => {
        if (isProductId(wantedItem)) setSelectedId(wantedItem);
    }, [wantedItem]);

    const focusInPanel = () => !!panelRef.current && panelRef.current.contains(document.activeElement);

    const select = (id: string) => { scrollPending.current = true; setSelectedId(id); };
    const toggle = (id: string) => { scrollPending.current = true; setSelectedId(cur => (cur === id ? null : id)); };
    const close = () => {
        // Hand focus back to the originating trigger when closing would otherwise drop it (focus
        // is inside the panel that is about to unmount, or nowhere). Focus elsewhere stays put.
        const active = document.activeElement;
        if (selectedId && (focusInPanel() || !active || active === document.body)) triggers.current.get(selectedId)?.focus();
        setSelectedId(null);
    };
    const step = (dir: 1 | -1) => {
        if (selectedIndex < 0) return;
        refocusPending.current = focusInPanel();
        setSelectedId(PRODUCTS[(selectedIndex + dir + PRODUCTS.length) % PRODUCTS.length].id);
    };
    const registerTrigger = (id: string, el: HTMLButtonElement | null) => {
        if (el) triggers.current.set(id, el);
        else triggers.current.delete(id);
    };

    useEffect(() => {
        const scroll = scrollPending.current;
        const refocus = refocusPending.current;
        scrollPending.current = false;
        refocusPending.current = false;
        const panel = panelRef.current;
        if (!selectedId || !panel) return;
        // Stepping remounts the panel body; if that dropped focus (it was on Close or a link),
        // park it on the panel itself so arrow keys and Escape keep working.
        if (refocus && !panel.contains(document.activeElement)) panel.focus({ preventScroll: true });
        // Below lg the inspect strip sits under the grid: bring it into view after a user selection.
        if (!scroll || window.matchMedia('(min-width: 1024px)').matches) return;
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        panel.scrollIntoView({ block: 'nearest', behavior: reduced ? 'auto' : 'smooth' });
    }, [selectedId]);

    const onKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
        if (e.key === 'Escape' && selectedId) close();
    };

    return (
        <section className="page wrap relative" onKeyDown={onKeyDown}>
            <span className="watermark hidden md:block absolute right-0 top-20 text-[12rem] lg:text-[16rem]" aria-hidden="true">02</span>

            <PageTitle
                chapter="02"
                eyebrow="Arsenal"
                title="Arsenal"
                subtitle={`${PRODUCTS.length} products we've built. Inspect any item.`}
            />

            {/* Loadout readout: item count and the icon legend for item classes */}
            <Reveal className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3">
                <div className="flex items-center gap-4">
                    <h2 className={HUD_GOLD}>Loadout</h2>
                    <span className="rule-v h-4" aria-hidden="true" />
                    <p className="numeral text-sm"><span className="text-ink">{TOTAL}</span> <span className="text-ink-mute">items</span></p>
                </div>
                <ul className="flex flex-wrap items-center gap-x-6 gap-y-2" aria-label="Item classes">
                    {LEGEND.map(c => (
                        <li key={c.name} className="flex items-center gap-2 hud-label">
                            <Icon name={c.icon} size={14} className="text-ink-mute" />
                            {c.name}
                            <span className="numeral text-ink">{pad(c.count)}</span>
                        </li>
                    ))}
                </ul>
            </Reveal>
            <div className="ticks mt-4 mb-8 opacity-60" aria-hidden="true" />

            <p role="status" className="sr-only">{selected ? `Inspecting ${selected.title}` : ''}</p>

            <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] xl:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:gap-8 lg:items-start">
                <ul role="list" className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6 min-w-0" aria-label="Products">
                    {PRODUCTS.map((p, i) => (
                        <Reveal as="li" key={p.id} delay={i * 60} className="min-w-0">
                            <ItemCard
                                product={p}
                                index={i}
                                selected={p.id === selectedId}
                                onSelect={select}
                                onToggle={toggle}
                                registerTrigger={registerTrigger}
                            />
                        </Reveal>
                    ))}
                </ul>

                <InspectPanel product={selected} index={selectedIndex} onClose={close} onStep={step} panelRef={panelRef} />
            </div>

            {/* Closing CTA */}
            <Reveal className="mt-20 md:mt-28">
                <Panel corners glow="purple" padding="roomy" label="Next objective">
                    <div className="grid-bg absolute inset-0 pointer-events-none" aria-hidden="true" />
                    <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
                        <div className="max-w-2xl min-w-0">
                            <p className={HUD_GOLD}>Custom build</p>
                            <h2 className="display title-gradient text-4xl md:text-5xl mt-4 break-words">Need something like this built?</h2>
                            {PRODUCTS_FAQ && <p className="mt-4 text-lg text-ink-dim leading-relaxed">{PRODUCTS_FAQ.answer}</p>}
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                            <Button href={href('/contact')} variant="gold" size="lg" iconRight="arrowRight">Start Mission</Button>
                            <Button href={href('/missions')} variant="outline" size="lg">View Missions</Button>
                        </div>
                    </div>
                    <div className="relative rule mt-8" aria-hidden="true" />
                    <dl className="relative mt-5 flex flex-wrap gap-x-10 gap-y-3">
                        <div className="flex items-baseline gap-3">
                            <dt className={HUD_SM}>Comms</dt>
                            <dd><a href={`mailto:${SITE.email}`} className="text-sm text-ink hover:text-brand-yellow transition-colors">{SITE.email}</a></dd>
                        </div>
                        <div className="flex items-baseline gap-3">
                            <dt className={HUD_SM}>Response</dt>
                            <dd className="text-sm text-ink">{SITE.responseTime}</dd>
                        </div>
                        <div className="flex items-baseline gap-3">
                            <dt className={HUD_SM}>Base</dt>
                            <dd className="text-sm text-ink">{SITE.location}</dd>
                        </div>
                    </dl>
                </Panel>
            </Reveal>
        </section>
    );
};
