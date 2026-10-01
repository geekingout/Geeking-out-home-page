/**
 * Routing and the chrome every page shares: header, footer, the closing CTA
 * card, the chapter pager and the phone's bottom bar.
 *
 * Real paths, not hashes. A crawler treats /services as its own document; it
 * treats #/services as a fragment of the home page. The build writes an actual
 * index.html into every route directory, so a direct hit on /services/ serves a
 * real file with that page's title, description and canonical in the <head>.
 */

import React, { useEffect, useRef, useState } from 'react';
import { PAGES, CHAPTER_ORDER, LEGACY_ANCHORS, NOT_FOUND, SITE_ORIGIN, hrefFor, type PageDef } from './routes';
import { SOCIAL, EMAIL, PHONE_DISPLAY, PHONE_TEL, WHATSAPP, FOUNDED } from './content';

/* ------------------------------------------------------------------ *
 *  Routing
 * ------------------------------------------------------------------ */

export const NAV_PAGES = PAGES.filter(p => p.nav);

const normalisePath = (raw: string) => raw.replace(/\/+$/, '') || '/';

export const readRoute = (): string => {
    if (typeof window === 'undefined') return '/';
    return normalisePath(window.location.pathname);
};

/** Where an old hash URL should land, or null if this is not one. */
const legacyTarget = (hash: string): string | null => {
    if (!hash) return null;
    if (LEGACY_ANCHORS[hash]) return LEGACY_ANCHORS[hash];
    if (hash.startsWith('#/')) return normalisePath(hash.slice(1));
    return null;
};

export const useRoute = (initial?: string) => {
    // `initial` is only ever passed by the pre-render, which has no window to read.
    const [route, setRoute] = useState(() => initial ?? readRoute());

    useEffect(() => {
        const onChange = () => setRoute(readRoute());
        window.addEventListener('popstate', onChange);
        const target = legacyTarget(window.location.hash);
        if (target) {
            window.history.replaceState(null, '', target);
            setRoute(target);
        } else {
            onChange();
        }
        return () => window.removeEventListener('popstate', onChange);
    }, []);

    return route;
};

export const navigate = (path: string) => {
    if (readRoute() === path) {
        window.scrollTo({ top: 0, behavior: 'auto' });
        return;
    }
    window.history.pushState(null, '', hrefFor(path));
    window.dispatchEvent(new PopStateEvent('popstate'));
};

// The build bakes the right <head> into each route's file; this keeps it right after a
// client-side navigation, where the document is never re-fetched.
export const applyHeadMeta = (page: PageDef | undefined) => {
    const meta = page ?? NOT_FOUND;
    const url = `${SITE_ORIGIN}${hrefFor(meta.canonical ?? meta.path)}`;
    document.title = meta.doc;
    const set = (selector: string, attr: string, value: string) => {
        const el = document.head.querySelector(selector);
        if (el) el.setAttribute(attr, value);
    };
    set('link[rel="canonical"]', 'href', url);
    set('meta[name="description"]', 'content', meta.desc);
    set('meta[property="og:url"]', 'content', url);
    set('meta[property="og:title"]', 'content', meta.doc);
    set('meta[property="og:description"]', 'content', meta.desc);
    set('meta[property="twitter:url"]', 'content', url);
    set('meta[property="twitter:title"]', 'content', meta.doc);
    set('meta[property="twitter:description"]', 'content', meta.desc);
};

type RouteLinkProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
    to: string;
    ref?: React.Ref<HTMLAnchorElement>;
};

export const RouteLink: React.FC<RouteLinkProps> = ({ to, children, onClick, ref, ...rest }) => {
    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        onClick?.(e);
        // cmd/ctrl-click, shift-click and middle-click still load the real URL.
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        navigate(to);
    };
    return (
        <a ref={ref} href={hrefFor(to)} onClick={handleClick} {...rest}>
            {children}
        </a>
    );
};

/* ------------------------------------------------------------------ *
 *  Motion helpers
 * ------------------------------------------------------------------ */

export const reducedMotion = () =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/**
 * One scroll bus for the whole page. Every subscriber's callback runs in the
 * same animation frame after a scroll or resize, so the page does one round of
 * measuring per frame however many sections are listening. The listeners exist
 * only while something is subscribed.
 */
const scrollSubs = new Set<() => void>();
let scrollRaf = 0;
let scrollBound = false;

const runScrollSubs = () => { scrollRaf = 0; scrollSubs.forEach(cb => cb()); };
const scheduleScrollSubs = () => { if (!scrollRaf) scrollRaf = requestAnimationFrame(runScrollSubs); };

const subscribeScroll = (cb: () => void) => {
    scrollSubs.add(cb);
    if (!scrollBound) {
        scrollBound = true;
        window.addEventListener('scroll', scheduleScrollSubs, { passive: true });
        window.addEventListener('resize', scheduleScrollSubs);
    }
    return () => {
        scrollSubs.delete(cb);
        if (scrollSubs.size === 0 && scrollBound) {
            scrollBound = false;
            window.removeEventListener('scroll', scheduleScrollSubs);
            window.removeEventListener('resize', scheduleScrollSubs);
            cancelAnimationFrame(scrollRaf);
            scrollRaf = 0;
        }
    };
};

/**
 * Runs `cb` on scroll and resize (once per frame, shared with every other
 * subscriber), once on mount, and again at a few delays after mount so late
 * layout — fonts, images, the canvas sizing itself — is measured too.
 */
export const useOnScroll = (cb: () => void, deps: React.DependencyList = []) => {
    useEffect(() => {
        let live = true;
        const safe = () => { if (live) cb(); };
        const unsubscribe = subscribeScroll(safe);
        safe();
        const timers = [60, 400, 1200].map(ms => window.setTimeout(safe, ms));
        const fonts = (document as Document & { fonts?: { ready: Promise<unknown> } }).fonts;
        fonts?.ready.then(safe);
        return () => {
            live = false;
            unsubscribe();
            timers.forEach(clearTimeout);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);
};

/**
 * Everything marked [data-reveal] rises in as it enters the viewport. Hidden
 * only by JavaScript, so the content is simply there if scripts never run.
 */
export const useReveal = (route: string) => {
    useEffect(() => {
        const items = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
        if (!items.length || reducedMotion()) return;
        const ease = 'cubic-bezier(.2,.7,.2,1)';
        items.forEach(el => {
            if (el.getBoundingClientRect().top > window.innerHeight * 0.92) {
                el.style.opacity = '0';
                el.style.transform = 'translateY(28px)';
            }
            el.style.transition = `opacity .9s ${ease}, transform .9s ${ease}, border-color .25s, box-shadow .25s, color .25s`;
            el.style.transitionDelay = `${el.dataset.reveal || 0}ms`;
        });
        const io = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (!e.isIntersecting) return;
                const el = e.target as HTMLElement;
                el.style.opacity = '1';
                el.style.transform = 'none';
                io.unobserve(el);
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
        items.forEach(el => io.observe(el));
        const fallback = window.setTimeout(() => items.forEach(el => { el.style.opacity = '1'; el.style.transform = 'none'; }), 3500);
        return () => { io.disconnect(); window.clearTimeout(fallback); };
    }, [route]);
};

/* ------------------------------------------------------------------ *
 *  Small shared pieces
 * ------------------------------------------------------------------ */

export const Arrow: React.FC<{ className?: string }> = ({ className }) => (
    <span aria-hidden="true" className={className}>→</span>
);

export const Eyebrow: React.FC<{ children: React.ReactNode; tone?: 'ink' | 'paper'; className?: string }> = ({ children, tone = 'ink', className = '' }) => (
    <p className={`eyebrow m-0 mb-3.5 ${tone === 'paper' ? 'text-peach' : 'text-orange-ink'} ${className}`}>{children}</p>
);

const Mark: React.FC<{ className?: string }> = ({ className = '' }) => (
    <span
        aria-hidden="true"
        className={`w-[34px] h-[34px] rounded-[9px] grid place-items-center font-mono font-medium text-[13px] transition-colors duration-300 ${className}`}
    >
        g/
    </span>
);

/**
 * The dark band every inner page opens on. Marked data-dark so the header knows
 * to stay light-on-dark while it is underneath.
 */
export const PageHero: React.FC<{
    eyebrow: string;
    title: string;
    blurb?: string;
    aside?: React.ReactNode;
}> = ({ eyebrow, title, blurb, aside }) => (
    <section data-dark className="relative overflow-hidden bg-night text-paper -mt-[68px] pt-[148px] pb-16 md:pb-20 scanlines">
        <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 70% 50% at 80% 100%, rgba(255,90,31,.22), transparent 60%)' }}
        />
        <div className="relative max-w-site mx-auto px-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)] items-end">
            <div>
                <Eyebrow tone="paper">{eyebrow}</Eyebrow>
                <h1 className="display m-0 text-[clamp(52px,8vw,132px)] text-paper [text-shadow:0_2px_40px_rgba(13,9,8,.6)]">{title}</h1>
            </div>
            {(blurb || aside) && (
                <div className="flex flex-col gap-5">
                    {blurb && <p className="m-0 text-[clamp(17px,1.3vw,19px)] leading-normal text-bone [text-wrap:pretty]">{blurb}</p>}
                    {aside}
                </div>
            )}
        </div>
    </section>
);

/* ------------------------------------------------------------------ *
 *  Header
 * ------------------------------------------------------------------ */

export const Header: React.FC<{
    route: string;
    menuOpen: boolean;
    setMenuOpen: (open: boolean) => void;
}> = ({ route, menuOpen, setMenuOpen }) => {
    const ref = useRef<HTMLElement>(null);
    // Every page opens on a dark band, so the bar's first paint is the dark tone.
    const [tone, setTone] = useState<'dark' | 'light'>('dark');
    const [scrolled, setScrolled] = useState(false);

    // Dark while a [data-dark] section is under the bar, light otherwise.
    useOnScroll(() => {
        const y = window.scrollY;
        const probe = 40;
        const dark = Array.from(document.querySelectorAll<HTMLElement>('[data-dark]')).some(el => {
            const r = el.getBoundingClientRect();
            return r.height > 0 && r.top <= probe && r.bottom >= probe;
        });
        setTone(dark ? 'dark' : 'light');
        setScrolled(y > 24);
    }, [route]);

    const close = () => setMenuOpen(false);

    return (
        <header ref={ref} className="site-header sticky top-0 z-50" data-tone={tone} data-scrolled={scrolled}>
            <div className="max-w-site mx-auto px-6 h-[68px] flex items-center justify-between gap-6">
                <RouteLink to="/" onClick={close} className="flex items-center gap-3 text-[var(--fg)]" aria-label="Geeking Out Agency Home">
                    <Mark className="bg-[var(--mark)] text-[var(--markfg)]" />
                    <span className="flex flex-col leading-[1.05]">
                        <span className="font-display uppercase font-bold text-[20px] tracking-[.01em] whitespace-nowrap">Geeking Out</span>
                        <span className="font-mono text-[11px] text-[var(--acc)] whitespace-nowrap">&lt;Digital Agency/&gt;</span>
                    </span>
                </RouteLink>

                <nav aria-label="Primary" className="hidden min-[1121px]:flex items-center gap-1">
                    {NAV_PAGES.map(page => (
                        <RouteLink
                            key={page.key}
                            to={page.path}
                            aria-current={page.path === route ? 'page' : undefined}
                            className={`nav-link ${page.navNote ? 'flex flex-col leading-[1.1]' : ''}`}
                        >
                            {page.nav}
                            {page.navNote && <span className="font-mono text-[10px] text-orange-lit" aria-hidden="true">{page.navNote}</span>}
                        </RouteLink>
                    ))}
                </nav>

                <div className="flex items-center gap-2.5">
                    <a href="https://x.com/geekingoutnet" aria-label="X (Twitter)" title="X (Twitter)" className="nav-social hidden min-[901px]:grid" target="_blank" rel="noopener noreferrer">X</a>
                    <a href="https://www.linkedin.com/company/geeking-out" aria-label="LinkedIn" title="LinkedIn" className="nav-social hidden min-[901px]:grid" target="_blank" rel="noopener noreferrer">in</a>
                    <RouteLink to="/contact" onClick={close} className="nav-cta">Get In Touch</RouteLink>
                    <button
                        type="button"
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-expanded={menuOpen}
                        aria-label="Menu"
                        className="min-[1121px]:hidden inline-flex items-center justify-center w-10 h-10 rounded-[10px] border border-[var(--line-h)] bg-transparent text-[var(--fg)] font-mono text-[12px] cursor-pointer"
                    >
                        {menuOpen ? 'close' : 'menu'}
                    </button>
                </div>
            </div>

            {menuOpen && (
                <nav aria-label="Mobile" className="min-[1121px]:hidden border-t border-line bg-paper text-ink px-6 pt-3 pb-5 grid gap-0.5">
                    {NAV_PAGES.map((page, i) => (
                        <RouteLink
                            key={page.key}
                            to={page.path}
                            onClick={close}
                            aria-current={page.path === route ? 'page' : undefined}
                            className={`py-3 px-2 text-[18px] font-medium text-ink ${i < NAV_PAGES.length - 1 ? 'border-b border-[#EFEAE3]' : ''}`}
                        >
                            {page.nav}
                            {page.navNote && <span className="font-mono text-[12px] text-orange-ink ml-2" aria-hidden="true">{page.navNote}</span>}
                        </RouteLink>
                    ))}
                    <div className="flex gap-2.5 mt-3">
                        <a href="https://x.com/geekingoutnet" className="flex-1 text-center py-3 border border-line rounded-[10px] text-ink font-medium" target="_blank" rel="noopener noreferrer">X</a>
                        <a href="https://www.linkedin.com/company/geeking-out" className="flex-1 text-center py-3 border border-line rounded-[10px] text-ink font-medium" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                    </div>
                </nav>
            )}
        </header>
    );
};

/* ------------------------------------------------------------------ *
 *  Closing CTA, pager, footer, mobile bar
 * ------------------------------------------------------------------ */

export const Cta: React.FC = () => {
    const card = useRef<HTMLDivElement>(null);
    const glow = useRef<HTMLDivElement>(null);
    useOnScroll(() => {
        if (!card.current || !glow.current || reducedMotion()) return;
        const r = card.current.getBoundingClientRect();
        const g = (window.innerHeight / 2 - (r.top + r.height / 2)) / window.innerHeight;
        glow.current.style.transform = `translate(${g * 90}px, ${g * 160}px)`;
    });
    return (
        <section aria-labelledby="cta-h" className="max-w-site mx-auto px-6 pt-24 pb-[120px]">
            <div ref={card} data-reveal="0" className="relative overflow-hidden rounded-[28px] bg-night text-paper p-[clamp(40px,6vw,88px)] scanlines">
                <div
                    ref={glow}
                    aria-hidden="true"
                    className="absolute -right-[140px] -top-[160px] w-[560px] h-[560px] rounded-full pointer-events-none will-change-transform"
                    style={{ background: 'radial-gradient(circle, rgba(255,138,92,.55) 0%, rgba(255,138,92,0) 65%)' }}
                />
                <div className="relative grid gap-10 items-end min-[901px]:grid-cols-[minmax(0,1.2fr)_minmax(0,.8fr)]">
                    <div>
                        <Eyebrow tone="paper">Next step</Eyebrow>
                        <h2 id="cta-h" className="display m-0 mb-5 text-[clamp(44px,6vw,92px)] [text-wrap:balance]">Have a project in mind?</h2>
                        <p className="m-0 max-w-[600px] text-[17px] leading-[1.55] text-bone-2 [text-wrap:pretty]">
                            Tell us what you’re working on. We’ll help you identify the smartest path forward—whether you’re launching something new, modernizing an existing product, or exploring what AI can do for your business.
                        </p>
                    </div>
                    <div className="flex justify-start">
                        <RouteLink to="/contact" className="btn btn-paper h-14 px-[26px] rounded-[14px] text-[16px]">
                            Let’s talk about your project <Arrow />
                        </RouteLink>
                    </div>
                </div>
            </div>
        </section>
    );
};

/** Reading order across the chapters, so a page is never a dead end. */
export const Pager: React.FC<{ pageKey: string }> = ({ pageKey }) => {
    const index = CHAPTER_ORDER.indexOf(pageKey);
    if (index < 0) return null;
    const at = (i: number) => (i >= 0 && i < CHAPTER_ORDER.length ? PAGES.find(p => p.key === CHAPTER_ORDER[i]) : undefined);
    const prev = at(index - 1);
    const next = at(index + 1);
    const nameOf = (page: PageDef) => page.nav ?? 'Home';

    return (
        <nav aria-label="Chapter navigation" className="max-w-site mx-auto px-6">
            <div className="border-t border-b border-line py-6 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                {prev ? (
                    <RouteLink to={prev.path} className="group justify-self-start inline-flex items-center gap-3 text-ink font-medium hover:text-orange-ink transition-colors">
                        <span aria-hidden="true" className="transition-transform group-hover:-translate-x-0.5">←</span>
                        <span className="leading-tight"><span className="eyebrow block text-ink-3 text-[11px]">Previous</span>{nameOf(prev)}</span>
                    </RouteLink>
                ) : <span />}

                <div className="hidden md:flex items-center gap-1.5">
                    {CHAPTER_ORDER.map((key, i) => {
                        const page = PAGES.find(p => p.key === key)!;
                        const here = i === index;
                        return (
                            <RouteLink
                                key={key}
                                to={page.path}
                                aria-label={nameOf(page)}
                                aria-current={here ? 'page' : undefined}
                                className={`h-[3px] rounded-full transition-all duration-500 ${here ? 'w-10 bg-orange' : 'w-4 bg-line-2 hover:bg-ink-4'}`}
                            />
                        );
                    })}
                </div>

                {next ? (
                    <RouteLink to={next.path} className="group justify-self-end col-start-3 inline-flex items-center gap-3 text-right text-ink font-medium hover:text-orange-ink transition-colors">
                        <span className="leading-tight"><span className="eyebrow block text-ink-3 text-[11px]">Next</span>{nameOf(next)}</span>
                        <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">→</span>
                    </RouteLink>
                ) : <span className="col-start-3" />}
            </div>
        </nav>
    );
};

export const Footer: React.FC = () => (
    <footer className="border-t border-line bg-paper max-[900px]:pb-20">
        <div className="max-w-site mx-auto px-6 pt-16 pb-10">
            <div className="grid gap-10 min-[901px]:grid-cols-[1.4fr_1fr_1fr] min-[561px]:grid-cols-2">
                <div>
                    <div className="flex items-center gap-3 mb-3.5">
                        <Mark className="bg-ink text-paper" />
                        <h3 className="m-0 font-display uppercase text-[20px] font-bold tracking-[.01em]">Geeking Out</h3>
                    </div>
                    <p className="m-0 mb-5 font-mono text-[12px] text-orange-ink">&lt;Digital Agency/&gt; · Est. {FOUNDED}</p>
                    <ul className="list-none m-0 p-0 flex flex-col gap-2 text-[14px] text-ink-2">
                        <li>UES, NYC</li>
                        <li>GEEKINGOUT.NET</li>
                        <li><a href={`mailto:${EMAIL}`} className="text-ink-2 hover:text-orange-ink transition-colors">{EMAIL}</a></li>
                        <li><a href={PHONE_TEL} className="text-ink-2 hover:text-orange-ink transition-colors">{PHONE_DISPLAY}</a></li>
                        <li><a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="text-ink-2 hover:text-orange-ink transition-colors">Whatsapp: 646.883.4335</a></li>
                    </ul>
                </div>
                <nav aria-label="Footer navigation">
                    <h3 className="m-0 mb-4 eyebrow text-ink-3 font-medium">Explore</h3>
                    <ul className="list-none m-0 p-0 flex flex-col gap-[9px] text-[14px]">
                        {NAV_PAGES.map(page => (
                            <li key={page.key}><RouteLink to={page.path} className="text-ink hover:text-orange-ink transition-colors">{page.nav}</RouteLink></li>
                        ))}
                        <li><RouteLink to="/contact" className="text-ink hover:text-orange-ink transition-colors">Start a Project</RouteLink></li>
                    </ul>
                </nav>
                <div>
                    <h3 className="m-0 mb-4 eyebrow text-ink-3 font-medium">Connect</h3>
                    <ul className="list-none m-0 p-0 flex flex-wrap gap-2">
                        {SOCIAL.map(s => (
                            <li key={s.label}>
                                <a
                                    href={s.href}
                                    title={s.label}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center h-[34px] px-3 rounded-lg border border-line bg-white text-ink text-[13px] font-medium transition-colors hover:border-orange-ink hover:text-orange-ink"
                                >
                                    {s.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div aria-hidden="true" className="mt-16 overflow-hidden font-display uppercase font-bold text-[clamp(72px,15.5vw,236px)] leading-[1.2] tracking-[-0.01em] whitespace-nowrap select-none outline-line">
                Geeking Out
            </div>

            <div className="mt-8 pt-6 border-t border-line flex flex-wrap justify-between gap-x-6 gap-y-3 text-[13px] text-ink-3">
                <span>Made with <span aria-label="love" className="text-orange-ink">♥</span> in NYC</span>
                <span>© Copyright Geeking Out, LLC</span>
                <span className="flex gap-[18px]">
                    <RouteLink to="/terms" className="text-ink-3 hover:text-ink transition-colors">Terms of Service</RouteLink>
                    <RouteLink to="/privacy" className="text-ink-3 hover:text-ink transition-colors">Privacy</RouteLink>
                </span>
            </div>
        </div>
    </footer>
);

/** Two thumb-sized actions pinned to the bottom of a phone. */
export const MobileBar: React.FC = () => (
    <div className="hidden max-[900px]:flex fixed left-3 right-3 bottom-3 z-[60] gap-2.5 p-2 rounded-2xl bg-[rgba(23,21,26,.94)] backdrop-blur-md shadow-[0_20px_40px_-20px_rgba(23,21,26,.6)]">
        <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center h-11 rounded-[10px] text-paper font-medium text-[14px] border border-[rgba(250,248,245,.18)]">
            WhatsApp me
        </a>
        <RouteLink to="/contact" className="flex-1 flex items-center justify-center h-11 rounded-[10px] bg-orange text-ink font-medium text-[14px]">
            Start a project
        </RouteLink>
    </div>
);
