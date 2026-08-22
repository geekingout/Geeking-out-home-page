import React from 'react';
import type { Accent } from '../content';

type Props = React.HTMLAttributes<HTMLElement> & {
    /** Small uppercase caption cut into the top border, HUD-style. */
    label?: React.ReactNode;
    labelSide?: 'left' | 'right';
    /** Draw the four thin corner brackets. */
    corners?: boolean;
    /** Tint the border and add a soft glow in a brand color. */
    glow?: Accent;
    /** Opaque fill instead of glass (use over busy backgrounds). */
    solid?: boolean;
    /** Lift + brighten on hover; for clickable cards. */
    hover?: boolean;
    padding?: 'none' | 'tight' | 'normal' | 'roomy';
    as?: keyof React.JSX.IntrinsicElements;
};

const PAD = { none: '', tight: 'p-4', normal: 'p-6 md:p-7', roomy: 'p-8 md:p-10' };

/** The glass panel every block of content sits in. */
export const Panel: React.FC<Props> = ({ label, labelSide = 'left', corners, glow, solid, hover, padding = 'normal', as = 'div', className = '', children, ...rest }) => {
    const Tag = as as React.ElementType;
    const cls = [
        'panel',
        corners ? 'corners' : '',
        glow ? `panel--${glow}` : '',
        solid ? 'panel--solid' : '',
        hover ? 'panel--hover' : '',
        PAD[padding],
        label ? 'mt-3' : '',
        className,
    ].filter(Boolean).join(' ');
    return (
        <Tag className={cls} {...rest}>
            {corners && <><span className="corner corner--tr" aria-hidden="true" /><span className="corner corner--bl" aria-hidden="true" /></>}
            {label && <span className={`panel-label ${labelSide === 'right' ? 'panel-label--right' : ''}`}>{label}</span>}
            {children}
        </Tag>
    );
};
