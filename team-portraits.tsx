/**
 * Team portraits.
 *
 * Nine head-and-shoulders illustrations drawn as inline SVG, one look per
 * person. They are deliberately not likenesses — nobody's real face, skin or
 * features are guessed at. Each is the same three inks on the night ground:
 * bone for the figure, paper for the shirt, and the person's own accent for
 * hair or hat, so the grid reads as one set and every card is still unique.
 *
 * Inline SVG rather than image files: nothing to fetch, nothing to go stale,
 * and the markup is in the pre-rendered HTML.
 */

import React from 'react';

export type PortraitLook = 'crop' | 'curls' | 'beanie' | 'cap' | 'bob' | 'round' | 'bun' | 'long' | 'waves';

const BONE = '#EFE7DD';
const SHADE = '#CDBFAF';
const PAPER = '#FAF8F5';
const INK = '#17151A';

type Layers = { back?: React.ReactNode; front?: React.ReactNode; extra?: React.ReactNode };

/** Hair, hats and accessories. Coordinates share the figure's 120-unit box. */
const layers = (look: PortraitLook, c: string): Layers => {
    switch (look) {
        case 'crop':
            return {
                front: <path d="M42 52C39 34 50 27 62 28 74 28 81 37 78 52 77 45 73 41 68 40 60 43 51 42 46 45 43 47 42 50 42 52Z" fill={c} />,
                extra: (
                    <g fill="none" stroke={INK} strokeWidth="1.7">
                        <rect x="46" y="49.5" width="11" height="8" rx="3" />
                        <rect x="63" y="49.5" width="11" height="8" rx="3" />
                        <path d="M57 53h6" />
                    </g>
                ),
            };
        case 'curls':
            return {
                front: (
                    <g fill={c}>
                        <circle cx="47" cy="37" r="8" /><circle cx="56" cy="31" r="9" /><circle cx="66" cy="31" r="9" />
                        <circle cx="74" cy="37" r="8" /><circle cx="43" cy="46" r="6" /><circle cx="78" cy="46" r="6" />
                    </g>
                ),
                extra: (
                    <g>
                        <path d="M40 55C37 19 83 19 80 55" fill="none" stroke={PAPER} strokeWidth="3" strokeLinecap="round" />
                        <rect x="35.5" y="49" width="8" height="15" rx="4" fill={PAPER} />
                        <rect x="76.5" y="49" width="8" height="15" rx="4" fill={PAPER} />
                    </g>
                ),
            };
        case 'beanie':
            return {
                front: (
                    <g>
                        <path d="M41 47C40 24 80 24 79 47Z" fill={c} />
                        <rect x="39.5" y="42.5" width="41" height="8.5" rx="3.5" fill={c} />
                        <rect x="39.5" y="42.5" width="41" height="8.5" rx="3.5" fill={PAPER} opacity=".28" />
                    </g>
                ),
            };
        case 'cap':
            return {
                front: (
                    <g>
                        <path d="M42 46C41 26 79 26 78 46Z" fill={c} />
                        <path d="M40 43.5H88C91.5 43.5 91.5 49.5 87 49.5H40Z" fill={c} />
                        <path d="M40 46.5H89.5C89.5 48.5 88.5 49.5 87 49.5H40Z" fill={INK} opacity=".22" />
                    </g>
                ),
            };
        case 'bob':
            return {
                back: <path d="M34 58C29 20 91 20 86 58V70C86 79 77 81 73 75V50H47V75C43 81 34 79 34 70Z" fill={c} />,
                front: <path d="M42 51C41 22 79 22 78 51 70 44 50 44 42 51Z" fill={c} />,
            };
        case 'round':
            return { back: <circle cx="60" cy="45" r="27" fill={c} /> };
        case 'bun':
            return {
                back: <circle cx="60" cy="25" r="9" fill={c} />,
                front: <path d="M42 53C41 22 79 22 78 53 75 43 69 38 60 38 51 38 45 43 42 53Z" fill={c} />,
                extra: (
                    <g fill="none" stroke={INK} strokeWidth="1.7">
                        <circle cx="51.5" cy="54" r="5.5" /><circle cx="68.5" cy="54" r="5.5" /><path d="M57 54h6" />
                    </g>
                ),
            };
        case 'long':
            return {
                back: <path d="M37 54C34 23 86 23 83 54L88 106H71L72 58H48L49 106H32Z" fill={c} />,
                front: <path d="M42 52C42 24 58 26 60 31 62 26 78 24 78 52 73 43 66 40 60 41 54 40 47 43 42 52Z" fill={c} />,
            };
        case 'waves':
            return {
                back: <path d="M33 60C26 24 60 16 72 22 92 26 92 52 87 62 92 70 90 82 82 84 76 85 72 80 73 72V56H47V72C48 80 44 85 38 84 30 82 28 70 33 60Z" fill={c} />,
                front: <path d="M42 52C42 22 74 20 78 48 70 40 56 40 42 52Z" fill={c} />,
            };
    }
};

export const Portrait: React.FC<{ look: PortraitLook; color: string; className?: string }> = ({ look, color, className }) => {
    const { back, front, extra } = layers(look, color);
    return (
        <svg viewBox="0 0 160 120" preserveAspectRatio="xMidYMax meet" aria-hidden="true" className={className}>
            <g transform="translate(20 4)">
                {back}
                {/* shirt, with the side away from the light a shade darker */}
                <path d="M16 120C18 98 33 88 50 85H70C87 88 102 98 104 120Z" fill={PAPER} />
                <path d="M60 85H70C87 88 102 98 104 120H60Z" fill={INK} opacity=".07" />
                {/* neck and collar */}
                <path d="M53 64H67V85L60 96 53 85Z" fill={BONE} />
                <path d="M53 71C56 77 64 77 67 71V76C64 82 56 82 53 76Z" fill={SHADE} />
                {/* head, lit from the upper left like the panel behind it */}
                <ellipse cx="60" cy="52" rx="17" ry="20" fill={BONE} />
                <path d="M60 32A17 20 0 0 1 60 72 8 20 0 0 0 60 32Z" fill={SHADE} opacity=".6" />
                {front}
                {extra}
            </g>
        </svg>
    );
};
