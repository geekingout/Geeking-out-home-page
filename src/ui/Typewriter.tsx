import React, { useEffect, useRef, useState } from 'react';

type Props = {
    text: string;
    /** ms per character */
    speed?: number;
    startDelay?: number;
    onDone?: () => void;
    /** Keep a blinking cursor after the text is complete. */
    cursor?: boolean;
    className?: string;
    as?: keyof React.JSX.IntrinsicElements;
};

/**
 * Reveals text one character at a time. Click to skip to the end. Shows the full text at once
 * when the user prefers reduced motion. Screen readers get the complete text immediately via a
 * visually-hidden copy; the animated characters are hidden from them.
 */
export const Typewriter: React.FC<Props> = ({ text, speed = 22, startDelay = 0, onDone, cursor = false, className = '', as = 'p' }) => {
    const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const [count, setCount] = useState(reduced ? text.length : 0);
    const done = count >= text.length;
    const onDoneRef = useRef(onDone);
    onDoneRef.current = onDone;

    useEffect(() => {
        if (reduced) { onDoneRef.current?.(); return; }
        setCount(0);
        let timer = 0;
        let interval = 0;
        timer = window.setTimeout(() => {
            interval = window.setInterval(() => {
                setCount(c => {
                    if (c + 1 >= text.length) { window.clearInterval(interval); onDoneRef.current?.(); return text.length; }
                    return c + 1;
                });
            }, speed);
        }, startDelay);
        return () => { window.clearTimeout(timer); window.clearInterval(interval); };
    }, [text, speed, startDelay, reduced]);

    const Tag = as as React.ElementType;
    const showCursor = !done || cursor;
    return (
        <Tag
            className={`${className} ${showCursor ? 'typed-cursor' : ''}`}
            onClick={() => { if (!done) { setCount(text.length); onDoneRef.current?.(); } }}
        >
            <span className="sr-only">{text}</span>
            <span aria-hidden="true">{text.slice(0, count)}</span>
        </Tag>
    );
};
