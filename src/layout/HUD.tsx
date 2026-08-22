import React, { useEffect, useRef, useState } from 'react';
import { LOGO_SRC } from '../logo';
import { SITE } from '../content';
import { href, useRoute } from '../router';
import { Button, Icon } from '../ui';

export const NAV = [
    { to: '/', label: 'Title', num: '00' },
    { to: '/missions', label: 'Missions', num: '01' },
    { to: '/arsenal', label: 'Arsenal', num: '02' },
    { to: '/squad', label: 'Squad', num: '03' },
    { to: '/campaign', label: 'Campaign', num: '04' },
    { to: '/codex', label: 'Codex', num: '05' },
];

/** Fixed top bar: wordmark, section nav, primary CTA, and the full-screen menu on small screens. */
export const HUD: React.FC = () => {
    const { path } = useRoute();
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [progress, setProgress] = useState(0);
    const firstLink = useRef<HTMLAnchorElement>(null);
    const toggle = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const onScroll = () => {
            const max = document.documentElement.scrollHeight - window.innerHeight;
            setScrolled(window.scrollY > 24);
            setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, [path]);

    // Close the menu on navigation, lock scroll while open, Escape to close, manage focus.
    useEffect(() => { setOpen(false); }, [path]);
    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : '';
        if (open) firstLink.current?.focus();
        else if (document.activeElement === document.body) toggle.current?.focus();
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
        window.addEventListener('keydown', onKey);
        return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
    }, [open]);

    return (
        <>
            <header className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${scrolled ? 'backdrop-blur-md bg-bg/70 border-b border-line' : 'bg-gradient-to-b from-bg/90 to-transparent'}`}>
                {/* mission progress: how far down the current screen you are */}
                <div className="absolute left-0 top-0 h-px bg-brand-yellow shadow-[0_0_10px_rgba(245,211,36,0.8)] transition-[width] duration-150" style={{ width: `${progress * 100}%` }} aria-hidden="true" />
                <div className="wrap flex items-center justify-between gap-6 h-[4.5rem] md:h-20">
                    <a href={href('/')} className="flex items-center gap-3 group shrink-0" aria-label={`${SITE.name} — title screen`}>
                        <span className="relative">
                            <img src={LOGO_SRC} alt="" width={36} height={36} className="w-9 h-9 relative z-10" />
                            <span className="absolute inset-0 rounded-full bg-brand-purple/50 blur-md scale-110 opacity-70 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                        </span>
                        <span className="leading-none">
                            <span className="display block text-[1.35rem] tracking-[0.08em] text-ink">Geeking Out</span>
                            <span className="hud-label block text-[0.55rem] mt-1 tracking-[0.34em]">AI Agency · NYC</span>
                        </span>
                    </a>

                    <nav className="hidden lg:flex items-center gap-8" aria-label="Primary">
                        {NAV.map(n => (
                            <a key={n.to} href={href(n.to)} className="nav-link" aria-current={path === n.to ? 'page' : undefined}>
                                <span className="numeral text-[0.6rem] text-ink-mute">{n.num}</span>{n.label}
                            </a>
                        ))}
                    </nav>

                    <div className="flex items-center gap-3">
                        <Button href={href('/contact')} variant="gold" size="sm" className="hidden sm:inline-flex" iconRight="arrowRight">Start Mission</Button>
                        <button
                            ref={toggle}
                            type="button"
                            onClick={() => setOpen(o => !o)}
                            aria-expanded={open}
                            aria-controls="site-menu"
                            aria-label={open ? 'Close menu' : 'Open menu'}
                            className="lg:hidden inline-flex items-center gap-2 hud-label text-ink px-3 py-2 border border-line-strong hover:border-ink transition-colors"
                        >
                            <Icon name={open ? 'close' : 'menu'} size={16} /> <span className="hidden sm:inline">Menu</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Full-screen menu */}
            <div
                id="site-menu"
                role="dialog"
                aria-modal="true"
                aria-label="Site menu"
                className={`fixed inset-0 z-30 bg-bg/95 backdrop-blur-xl transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            >
                <div className="wrap pt-28 pb-10 h-full flex flex-col">
                    <p className="hud-label mb-6 animate-fade-in">Select destination</p>
                    <nav aria-label="Menu" className="flex-1">
                        {NAV.map((n, i) => (
                            <a
                                key={n.to}
                                ref={i === 0 ? firstLink : undefined}
                                href={href(n.to)}
                                className={`menu-row ${open ? 'animate-slide-right' : ''}`}
                                style={{ animationDelay: `${80 + i * 60}ms` }}
                                aria-current={path === n.to ? 'page' : undefined}
                                tabIndex={open ? 0 : -1}
                            >
                                <span className="menu-row__num numeral text-sm text-ink-mute w-8">{n.num}</span>
                                <span className="display text-4xl sm:text-5xl">{n.label}</span>
                            </a>
                        ))}
                    </nav>
                    <div className={`mt-8 flex flex-col sm:flex-row sm:items-center gap-4 ${open ? 'animate-fade-up' : ''}`} style={{ animationDelay: '480ms' }}>
                        <Button href={href('/contact')} variant="gold" size="lg" iconRight="arrowRight" tabIndex={open ? 0 : -1}>Start Mission</Button>
                        <a href={`mailto:${SITE.email}`} className="hud-label text-ink hover:text-brand-yellow transition-colors" tabIndex={open ? 0 : -1}>{SITE.email}</a>
                    </div>
                </div>
            </div>
        </>
    );
};
