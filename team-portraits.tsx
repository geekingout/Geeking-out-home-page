/**
 * Team portraits.
 *
 * Head-and-shoulders illustrations drawn as inline SVG and framed like studio
 * headshots: each person sits against a seamless backdrop in their own accent
 * colour. A portrait is assembled from parts — skin, hair style and colour,
 * what they are wearing, glasses or headphones — so every card is distinct and
 * any one trait can be changed in the LOOKS table below without redrawing.
 *
 * These are illustrations, not likenesses. Until real headshots exist the
 * traits are assigned, not observed; a `photo` on the team member replaces the
 * drawing in the same frame.
 *
 * Inline SVG rather than image files: nothing to fetch, and the markup is in
 * the pre-rendered HTML.
 */

import React from 'react';

export type PortraitLook = 'crop' | 'curls' | 'beanie' | 'cap' | 'bob' | 'round' | 'bun' | 'long' | 'waves';

const INK = '#17151A';
const PAPER = '#FAF8F5';

/** [base, shadow, lip] */
const SKIN: [string, string, string][] = [
    ['#F3D6C0', '#DDB398', '#B5574B'],
    ['#E9BF9B', '#CC9A73', '#A64B3F'],
    ['#D29C70', '#B07B51', '#8C3D32'],
    ['#AB7450', '#8A5838', '#6E2E26'],
    ['#7D5137', '#5F3B26', '#4E211B'],
];

/** [base, highlight, brow] */
const HAIR = {
    black: ['#1D1715', '#4A3D37', '#1D1715'],
    espresso: ['#3A2518', '#6A4630', '#2A1A10'],
    brown: ['#6B4423', '#96693C', '#4A2E17'],
    auburn: ['#8E3B1C', '#C0623A', '#5E2712'],
    blonde: ['#D7A542', '#F0CD82', '#7A5524'],
} as const;

type Top = 'tee' | 'hoodie' | 'shirt' | 'blazer' | 'turtleneck';

type Spec = {
    skin: number;
    hair: keyof typeof HAIR;
    top: Top;
    topColor: string;
    glasses?: 'square' | 'round';
    headphones?: boolean;
    earrings?: boolean;
    beard?: boolean;
};

const LOOKS: Record<PortraitLook, Spec> = {
    crop: { skin: 1, hair: 'espresso', top: 'blazer', topColor: INK, glasses: 'square' },
    curls: { skin: 2, hair: 'black', top: 'hoodie', topColor: INK, headphones: true },
    beanie: { skin: 0, hair: 'brown', top: 'tee', topColor: PAPER, beard: true },
    cap: { skin: 3, hair: 'black', top: 'shirt', topColor: PAPER },
    bob: { skin: 1, hair: 'black', top: 'turtleneck', topColor: INK, earrings: true },
    round: { skin: 4, hair: 'black', top: 'tee', topColor: PAPER },
    bun: { skin: 0, hair: 'auburn', top: 'shirt', topColor: INK, glasses: 'round' },
    long: { skin: 2, hair: 'espresso', top: 'blazer', topColor: INK },
    waves: { skin: 1, hair: 'blonde', top: 'turtleneck', topColor: PAPER, earrings: true },
};

const shadeOf = (topColor: string) => (topColor === PAPER ? 'rgba(23,21,26,.12)' : 'rgba(250,248,245,.11)');
const detailOf = (topColor: string) => (topColor === PAPER ? 'rgba(23,21,26,.22)' : 'rgba(250,248,245,.3)');

/** Hair that sits behind the head. */
const backHair = (look: PortraitLook, base: string) => {
    switch (look) {
        case 'bob': return <path d="M34 58C29 18 91 18 86 58V70C86 79 77 81 73 75V50H47V75C43 81 34 79 34 70Z" fill={base} />;
        case 'round': return <circle cx="60" cy="41" r="27" fill={base} />;
        case 'bun': return <circle cx="60" cy="22" r="9.5" fill={base} />;
        case 'long': return <path d="M37 54C34 21 86 21 83 54L88 108H71L72 58H48L49 108H32Z" fill={base} />;
        case 'waves': return <path d="M36 56C31 21 60 14 72 19 90 23 90 50 86 60 90 68 85 75 88 85 84 91 75 89 73 83V56H47V83C45 89 36 91 32 85 35 75 30 68 36 56Z" fill={base} />;
        default: return null;
    }
};

/** Hair and hats that sit over the forehead, each with one stroke of highlight. */
const frontHair = (look: PortraitLook, base: string, light: string) => {
    const shine = (d: string) => <path d={d} fill="none" stroke={light} strokeWidth="2" strokeLinecap="round" opacity=".7" />;
    switch (look) {
        case 'crop':
            return <>
                <path d="M42 50C39 33 49 24 62 25 75 25 82 35 78 50 77 44 74 40 70 38 61 42 51 41 46 44 44 46 42.5 48 42 50Z" fill={base} />
                {shine('M50 31C56 27.5 66 27.5 72 31.5')}
            </>;
        case 'curls':
            return <>
                <g fill={base}>
                    <ellipse cx="60" cy="35" rx="17.5" ry="9" />
                    <circle cx="46" cy="37" r="8" /><circle cx="55" cy="29" r="9" /><circle cx="66" cy="29" r="9" />
                    <circle cx="75" cy="37" r="8" /><circle cx="42.5" cy="46" r="5.5" /><circle cx="77.5" cy="46" r="5.5" />
                </g>
                {shine('M50 27C52 24 57 23 59 26')}{shine('M63 25C66 22.5 71 24 72 28')}
            </>;
        case 'beanie':
            return <>
                <path d="M42.4 49C41.6 54 42.2 58 43.6 60.5L45.4 49Z" fill={base} /><path d="M77.6 49C78.4 54 77.8 58 76.4 60.5L74.6 49Z" fill={base} />
                <path d="M41.5 47C40 21 80 21 78.5 47Z" fill={INK} />
                <rect x="39.5" y="41.5" width="41" height="9" rx="3.5" fill="#2E2A33" />
                <g stroke="rgba(250,248,245,.16)" strokeWidth="1"><path d="M48 42v8M54 42v8M60 42v8M66 42v8M72 42v8" /></g>
            </>;
        case 'cap':
            return <>
                <path d="M43 46H46.2V57C44.2 55.5 43 52 43 46Z" fill={base} /><path d="M77 46H73.8V57C75.8 55.5 77 52 77 46Z" fill={base} />
                <path d="M42 43C41 20 79 20 78 43Z" fill={INK} />
                <path d="M40.5 42C46 40.4 74 40.4 79.5 42 79 45.6 70 47.8 60 47.8 50 47.8 41 45.6 40.5 42Z" fill="#2E2A33" />
                <path d="M42 43C48 41.6 72 41.6 78 43" fill="none" stroke="rgba(250,248,245,.22)" strokeWidth="1" />
                <circle cx="60" cy="31.5" r="3.2" fill="none" stroke="rgba(250,248,245,.3)" strokeWidth="1.2" />
            </>;
        case 'bob':
            return <>
                <path d="M42 51C41 20 79 20 78 51 70 43 50 43 42 51Z" fill={base} />
                {shine('M49 31C55 27 65 27 71 31')}
            </>;
        case 'round':
            return <>
                <path d="M43 47C43 22 77 22 77 47 72 38 66 35 60 35 54 35 48 38 43 47Z" fill={base} />
                {shine('M42 26C47 19 57 15.5 66 17')}
            </>;
        case 'bun':
            return <>
                <path d="M42 52C41 20 79 20 78 52 75 42 69 37 60 37 51 37 45 42 42 52Z" fill={base} />
                {shine('M50 30C56 26.5 64 26.5 70 30')}{shine('M55.5 17.5C58 15.5 62 15.5 64.5 17.5')}
            </>;
        case 'long':
            return <>
                <path d="M42 52C42 21 58 23 60 28.5 62 23 78 21 78 52 73 42 66 39 60 40 54 39 47 42 42 52Z" fill={base} />
                {shine('M46 34C49 29 54 27.5 57 28.5')}{shine('M66 29C70 28.5 73 31 74.5 35')}
            </>;
        case 'waves':
            return <>
                <path d="M42 52C42 20 74 18 78 48 70 39 56 39 42 52Z" fill={base} />
                {shine('M47 33C53 26.5 65 25 72 31')}{shine('M35.5 62C33.5 68 35 74 34.5 80')}
            </>;
    }
};

const clothes = (top: Top, color: string) => {
    const shade = shadeOf(color);
    const detail = detailOf(color);
    const torso = <>
        <path d="M14 120C16 99 32 90 49 87H71C88 90 104 99 106 120Z" fill={color} />
        {color === PAPER
            ? <path d="M71 87C88 90 104 99 106 120H86C86 106 81 95 71 87Z" fill={shade} />
            : <path d="M49 87C32 90 16 99 14 120H34C34 106 39 95 49 87Z" fill={shade} />}
    </>;
    switch (top) {
        case 'tee':
            return <>{torso}<path d="M49.5 87.5C52 97 68 97 70.5 87.5" fill="none" stroke={detail} strokeWidth="2.2" strokeLinecap="round" /></>;
        case 'hoodie':
            return <>
                <path d="M37 96C34 76 46 67 60 67 74 67 86 76 83 96Z" fill={color} /><path d="M50 69.5C41 73 35 82 37 96H46C44 86 45 77 50 69.5Z" fill={shade} />
                {torso}
                <path d="M49 88C52 98 68 98 71 88" fill="none" stroke={detail} strokeWidth="2.2" strokeLinecap="round" />
                <path d="M55.5 96.5V111M64.5 96.5V111" stroke={PAPER} strokeWidth="1.6" strokeLinecap="round" opacity=".85" />
            </>;
        case 'shirt':
            return <>
                {torso}
                <path d="M60 99V120" stroke={detail} strokeWidth="1.4" />
                <path d="M49.5 86.5L60 99 54.5 104.5 45.5 91Z" fill={color} stroke={detail} strokeWidth="1.2" strokeLinejoin="round" />
                <path d="M70.5 86.5L60 99 65.5 104.5 74.5 91Z" fill={color} stroke={detail} strokeWidth="1.2" strokeLinejoin="round" />
            </>;
        case 'blazer':
            return <>
                {torso}
                <path d="M50 87L60 108 70 87Z" fill={color === PAPER ? INK : PAPER} />
                <path d="M49.5 87L60 108 54 113.5 43.5 93Z" fill={color} stroke={detail} strokeWidth="1.2" strokeLinejoin="round" />
                <path d="M70.5 87L60 108 66 113.5 76.5 93Z" fill={color} stroke={detail} strokeWidth="1.2" strokeLinejoin="round" />
            </>;
        case 'turtleneck':
            return torso;
    }
};

export const Portrait: React.FC<{ look: PortraitLook; className?: string }> = ({ look, className }) => {
    const spec = LOOKS[look];
    const [skin, skinShade, lip] = SKIN[spec.skin];
    const [hair, hairLight, brow] = HAIR[spec.hair];
    const hatted = look === 'beanie' || look === 'cap';

    return (
        <svg viewBox="6 8 108 112" preserveAspectRatio="xMidYMax slice" aria-hidden="true" className={className}>
            {backHair(look, hair)}
            {clothes(spec.top, spec.topColor)}

            {/* neck, with the shadow the jaw casts on it */}
            <path d="M52 64H68V86C68 90.5 64.5 94 60 94 55.5 94 52 90.5 52 86Z" fill={skin} />
            <path d="M52 71C56 77.5 64 77.5 68 71V79C64 84.5 56 84.5 52 79Z" fill={skinShade} />
            {spec.top === 'turtleneck' && <>
                <path d="M50.5 73.5H69.5V92C66 96.5 54 96.5 50.5 92Z" fill={spec.topColor} />
                <path d="M50.5 78.5H69.5M50.5 83H69.5M50.5 87.5H69.5" stroke={detailOf(spec.topColor)} strokeWidth="1.1" />
            </>}

            {/* ears, head, and the side of the face away from the light */}
            <ellipse cx="42.8" cy="53" rx="3.1" ry="5" fill={skin} /><ellipse cx="77.2" cy="53" rx="3.1" ry="5" fill={skinShade} />
            <path d="M43 48C43 34 50 29 60 29 70 29 77 34 77 48V54C77 64.5 69 72 60 72 51 72 43 64.5 43 54Z" fill={skin} />
            <path d="M60 29C70 29 77 34 77 48V54C77 64.5 69 72 60 72 66.5 66.5 70 58.5 70 50 70 40 66.5 33 60 29Z" fill={skinShade} opacity=".42" />
            <ellipse cx="49.8" cy="58.4" rx="3.2" ry="2" fill={lip} opacity=".11" /><ellipse cx="70.2" cy="58.4" rx="3.2" ry="2" fill={lip} opacity=".11" />

            {spec.beard && <path d="M43.6 55C44 66.5 51.5 74 60 74 68.5 74 76 66.5 76.4 55 74.5 61 71 64.5 66.5 64.5 63.5 62.6 56.5 62.6 53.5 64.5 49 64.5 45.5 61 43.6 55Z" fill={hair} opacity=".92" />}

            {/* brows, eyes, nose, mouth */}
            <g fill="none" strokeLinecap="round">
                <path d="M49.4 46.4Q53 44.2 56.6 45.7M63.4 45.7Q67 44.2 70.6 46.4" stroke={brow} strokeWidth="1.7" />
                <path d="M60.6 53.2C59.6 56.4 58.6 58.4 60 59.4 61 60 62.4 59.8 63 59.2" stroke={skinShade} strokeWidth="1.3" />
                <path d="M54.6 63.4C57.4 66.6 62.6 66.6 65.4 63.4" stroke={spec.beard ? PAPER : lip} strokeWidth="1.7" />
            </g>
            <ellipse cx="53" cy="51.2" rx="1.75" ry="2.15" fill="#1D1715" /><ellipse cx="67" cy="51.2" rx="1.75" ry="2.15" fill="#1D1715" />
            <circle cx="53.6" cy="50.4" r=".6" fill="#fff" /><circle cx="67.6" cy="50.4" r=".6" fill="#fff" />

            {frontHair(look, hair, hairLight)}

            {spec.earrings && !hatted && <><circle cx="42.6" cy="59.6" r="1.7" fill="#F5C04A" /><circle cx="77.4" cy="59.6" r="1.7" fill="#F5C04A" /></>}

            {spec.glasses === 'square' && (
                <g stroke={INK} strokeWidth="1.6" fill="rgba(255,255,255,.14)">
                    <rect x="46.2" y="47" width="11.6" height="8.6" rx="2.8" /><rect x="62.2" y="47" width="11.6" height="8.6" rx="2.8" />
                    <path d="M57.8 50.6h4.4M46.2 50.2L43.4 49.4M73.8 50.2L76.6 49.4" fill="none" />
                </g>
            )}
            {spec.glasses === 'round' && (
                <g stroke={INK} strokeWidth="1.6" fill="rgba(255,255,255,.14)">
                    <circle cx="52.6" cy="51.4" r="5.6" /><circle cx="67.4" cy="51.4" r="5.6" />
                    <path d="M58.2 51h3.6M47 50.6L43.6 49.6M73 50.6L76.4 49.6" fill="none" />
                </g>
            )}
            {spec.headphones && <>
                <path d="M39.5 54C36 15 84 15 80.5 54" fill="none" stroke={PAPER} strokeWidth="3.2" strokeLinecap="round" />
                <rect x="35" y="47.5" width="8.5" height="16" rx="4.2" fill={PAPER} /><rect x="76.5" y="47.5" width="8.5" height="16" rx="4.2" fill={PAPER} />
                <rect x="37" y="51" width="2" height="9" rx="1" fill="rgba(23,21,26,.25)" /><rect x="81" y="51" width="2" height="9" rx="1" fill="rgba(23,21,26,.25)" />
            </>}
        </svg>
    );
};
