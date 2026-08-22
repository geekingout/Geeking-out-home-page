import React from 'react';

type Props = {
    /** Chapter/section number shown before the eyebrow, e.g. "02". */
    chapter?: string;
    eyebrow?: string;
    title: string;
    subtitle?: React.ReactNode;
    align?: 'left' | 'center';
    className?: string;
};

/** Page header: chapter numeral + eyebrow, the page's single h1, optional subtitle, a rule. */
export const PageTitle: React.FC<Props> = ({ chapter, eyebrow, title, subtitle, align = 'left', className = '' }) => {
    const center = align === 'center';
    return (
        <header className={`${center ? 'text-center' : ''} mb-12 md:mb-16 ${className}`}>
            {(chapter || eyebrow) && (
                <div className={`flex items-center gap-4 mb-5 animate-fade-in ${center ? 'justify-center' : ''}`}>
                    {chapter && <span className="numeral text-brand-yellow text-sm">{chapter}</span>}
                    {chapter && eyebrow && <span className="rule--left rule w-10 h-px" aria-hidden="true" />}
                    {eyebrow && <span className="hud-label">{eyebrow}</span>}
                </div>
            )}
            <h1 className="display title-gradient text-5xl sm:text-6xl md:text-7xl lg:text-8xl animate-fade-up break-words">{title}</h1>
            {subtitle && (
                <p className={`mt-5 text-lg md:text-xl text-ink-dim max-w-2xl animate-fade-up [animation-delay:120ms] ${center ? 'mx-auto' : ''}`}>{subtitle}</p>
            )}
            <div className={`rule mt-8 ${center ? '' : 'rule--left'}`} aria-hidden="true" />
        </header>
    );
};
