import React from 'react';

/** Thin-line icon set, 24-unit grid, stroke follows currentColor. */
const PATHS: Record<string, React.ReactNode> = {
    arrowRight: <><path d="M4 12h15" /><path d="M13 6l6 6-6 6" /></>,
    arrowUpRight: <><path d="M7 17L17 7" /><path d="M8 7h9v9" /></>,
    arrowLeft: <><path d="M20 12H5" /><path d="M11 6l-6 6 6 6" /></>,
    chevronDown: <path d="M6 9l6 6 6-6" />,
    chevronRight: <path d="M9 6l6 6-6 6" />,
    chevronUp: <path d="M6 15l6-6 6 6" />,
    diamond: <path d="M12 3l9 9-9 9-9-9z" />,
    check: <path d="M5 12l4.5 4.5L19 7" />,
    plus: <><path d="M12 5v14" /><path d="M5 12h14" /></>,
    minus: <path d="M5 12h14" />,
    close: <><path d="M6 6l12 12" /><path d="M18 6L6 18" /></>,
    menu: <><path d="M3 7h18" /><path d="M3 12h18" /><path d="M3 17h18" /></>,
    mail: <><rect x="3" y="5" width="18" height="14" /><path d="M3 7l9 6 9-6" /></>,
    phone: <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />,
    chat: <path d="M4 5h16v11H9l-5 4z" />,
    play: <path d="M7 4l13 8-13 8z" />,
    target: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /></>,
    box: <><path d="M3 7l9-4 9 4-9 4z" /><path d="M3 7v10l9 4 9-4V7" /><path d="M12 11v10" /></>,
    users: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><circle cx="17" cy="9" r="2.5" /><path d="M16 15.5a5 5 0 0 1 5.5 4.5" /></>,
    map: <><path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z" /><path d="M9 4v14M15 6v14" /></>,
    book: <><path d="M4 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4z" /><path d="M20 4h-7a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h8z" /></>,
    terminal: <><path d="M4 6l6 6-6 6" /><path d="M12 18h8" /></>,
    cpu: <><rect x="6" y="6" width="12" height="12" /><rect x="10" y="10" width="4" height="4" /><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4" /></>,
    sparkles: <><path d="M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" /><path d="M19 15l1 2 2 1-2 1-1 2-1-2-2-1 2-1z" /></>,
    shield: <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />,
    globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></>,
    smartphone: <><rect x="7" y="2" width="10" height="20" /><path d="M11 18h2" /></>,
    monitor: <><rect x="3" y="4" width="18" height="12" /><path d="M8 20h8M12 16v4" /></>,
    zap: <path d="M13 2L4 14h7l-1 8 9-12h-7z" />,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    lock: <><rect x="5" y="11" width="14" height="10" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></>,
    send: <><path d="M21 3L10 14" /><path d="M21 3l-7 18-4-7-7-4z" /></>,
    signal: <><path d="M2 20h.01M7 20v-4M12 20v-8M17 20V8M22 20V4" /></>,
    info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>,
    alert: <><path d="M12 3l10 18H2z" /><path d="M12 10v4M12 17h.01" /></>,
    loader: <path d="M12 3a9 9 0 1 0 9 9" />,
    linkedin: <><rect x="3" y="3" width="18" height="18" /><path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7" /></>,
};

export type IconName = keyof typeof PATHS;
export const ICON_NAMES = Object.keys(PATHS) as IconName[];

type Props = { name: IconName; size?: number; className?: string; strokeWidth?: number; label?: string };

export const Icon: React.FC<Props> = ({ name, size = 18, className = '', strokeWidth = 1.6, label }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`shrink-0 ${className}`}
        role={label ? 'img' : undefined}
        aria-label={label}
        aria-hidden={label ? undefined : true}
    >
        {PATHS[name]}
    </svg>
);
