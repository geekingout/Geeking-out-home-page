import React, { useEffect, useRef, useState } from 'react';

type Props = React.HTMLAttributes<HTMLDivElement> & {
    /** Stagger offset in ms. */
    delay?: number;
    as?: keyof React.JSX.IntrinsicElements;
};

/** Fades content up when it scrolls into view. Use for section-level cinematic entrances. */
export const Reveal: React.FC<Props> = ({ delay = 0, as = 'div', className = '', style, children, ...rest }) => {
    const ref = useRef<HTMLElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el || !('IntersectionObserver' in window)) { setVisible(true); return; }
        const io = new IntersectionObserver(entries => {
            if (entries.some(e => e.isIntersecting)) { setVisible(true); io.disconnect(); }
        }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
        io.observe(el);
        return () => io.disconnect();
    }, []);

    const Tag = as as React.ElementType;
    return (
        <Tag ref={ref} className={`reveal ${visible ? 'is-visible' : ''} ${className}`} style={{ transitionDelay: `${delay}ms`, ...style }} {...rest}>
            {children}
        </Tag>
    );
};
