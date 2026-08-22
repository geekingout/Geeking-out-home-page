import React from 'react';
import { LOGO_SRC } from '../logo';
import { SITE, SOCIAL_LINKS } from '../content';
import { href } from '../router';
import { Icon } from '../ui';
import { NAV } from './HUD';

export const Footer: React.FC = () => (
    <footer className="relative z-10 mt-24 border-t border-line overflow-hidden">
        <div className="watermark absolute -bottom-6 left-1/2 -translate-x-1/2 text-[22vw] whitespace-nowrap" aria-hidden="true">Geeking Out</div>
        <div className="wrap relative py-16 md:py-20">
            <div className="grid gap-12 md:grid-cols-12">
                <div className="md:col-span-4">
                    <a href={href('/')} className="inline-flex items-center gap-3">
                        <img src={LOGO_SRC} alt="" width={40} height={40} className="w-10 h-10" />
                        <span className="display text-2xl tracking-[0.08em]">Geeking Out</span>
                    </a>
                    <p className="mt-5 text-ink-dim max-w-xs">{SITE.tagline} Scalable, agentic, beautiful software — built in {SITE.location}.</p>
                    <p className="hud-label mt-6 text-[0.6rem]">{SITE.legalName}</p>
                </div>

                <div className="md:col-span-3">
                    <h2 className="hud-label mb-5 text-brand-yellow">Comms</h2>
                    <ul className="space-y-3">
                        <li><a href={`mailto:${SITE.email}`} className="inline-flex items-center gap-3 hover:text-brand-yellow transition-colors"><Icon name="mail" size={16} className="text-ink-mute" />{SITE.email}</a></li>
                        <li><a href={SITE.phoneHref} className="inline-flex items-center gap-3 hover:text-brand-yellow transition-colors"><Icon name="phone" size={16} className="text-ink-mute" />{SITE.phoneDisplay}</a></li>
                        <li><a href={SITE.whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 hover:text-brand-yellow transition-colors"><Icon name="chat" size={16} className="text-ink-mute" />WhatsApp</a></li>
                        <li className="inline-flex items-center gap-3 text-ink-dim"><Icon name="globe" size={16} className="text-ink-mute" />{SITE.location}</li>
                    </ul>
                </div>

                <div className="md:col-span-2">
                    <h2 className="hud-label mb-5 text-brand-yellow">Navigate</h2>
                    <ul className="space-y-3">
                        {NAV.map(n => (
                            <li key={n.to}><a href={href(n.to)} className="inline-flex items-baseline gap-3 hover:text-brand-yellow transition-colors"><span className="numeral text-[0.6rem] text-ink-mute">{n.num}</span>{n.label}</a></li>
                        ))}
                        <li><a href={href('/contact')} className="inline-flex items-baseline gap-3 hover:text-brand-yellow transition-colors"><span className="numeral text-[0.6rem] text-ink-mute">06</span>Start Mission</a></li>
                    </ul>
                </div>

                <div className="md:col-span-3">
                    <h2 className="hud-label mb-5 text-brand-yellow">Channels</h2>
                    <ul className="grid grid-cols-2 gap-x-4 gap-y-3">
                        {SOCIAL_LINKS.map(s => (
                            <li key={s.label}><a href={s.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-brand-yellow transition-colors">{s.label}<Icon name="arrowUpRight" size={12} className="text-ink-mute" /></a></li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="rule mt-14 mb-6" aria-hidden="true" />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 hud-label text-[0.6rem]">
                <p>© {new Date().getFullYear()} {SITE.legalName}. All rights reserved.</p>
                <div className="flex items-center gap-6">
                    <a href={href('/terms')} className="hover:text-ink transition-colors">Terms</a>
                    <a href={href('/privacy')} className="hover:text-ink transition-colors">Privacy</a>
                    <span className="text-ink-mute">{SITE.build}</span>
                </div>
            </div>
        </div>
    </footer>
);
