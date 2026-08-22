import React from 'react';
import type { Accent } from '../content';

type Props = {
    label?: React.ReactNode;
    value: number;
    max?: number;
    color?: Accent;
    /** Show "value / max" (true) or a custom string on the right. */
    readout?: boolean | string;
    thick?: boolean;
    className?: string;
};

/** Thin luminous stat bar with optional label and readout. */
export const Bar: React.FC<Props> = ({ label, value, max = 100, color = 'purple', readout, thick, className = '' }) => {
    const pct = Math.max(0, Math.min(100, (value / max) * 100));
    const text = readout === true ? `${value} / ${max}` : readout || undefined;
    return (
        <div className={className}>
            {(label || text) && (
                <div className="flex items-baseline justify-between gap-4 mb-2">
                    {label && <span className="hud-label text-[0.62rem]">{label}</span>}
                    {text && <span className="numeral text-xs text-ink">{text}</span>}
                </div>
            )}
            <div
                className={`bar bar--${color} ${thick ? 'bar--thick' : ''}`}
                role="meter"
                aria-valuemin={0}
                aria-valuemax={max}
                aria-valuenow={value}
                aria-label={typeof label === 'string' ? label : undefined}
            >
                <div className="bar__fill" style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
};
