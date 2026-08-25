/**
 * Compiled at build time rather than loaded from cdn.tailwindcss.com.
 *
 * The Play CDN generates its stylesheet by scanning the DOM after it parses,
 * which was fine while #root was empty on arrival. Now that each route ships
 * pre-rendered markup, the content would paint before those styles existed —
 * a visible flash of unstyled page on every first load. Compiling also drops a
 * third-party script from the runtime and silences the CDN's own
 * "should not be used in production" warning.
 *
 * The theme below is the inline config that used to live in index.html, moved
 * verbatim so nothing shifts.
 */
export default {
    content: ['./index.html', './index.tsx', './App.tsx', './arcade-cabinets.tsx', './routes.ts', './entry-server.tsx'],
    darkMode: 'class',
    // These are assembled at runtime — productsData carries `text-brand-lime` and the
    // showcase swaps the prefix to colour an icon's glow — so the scanner never sees the
    // literal string and would drop the rule.
    safelist: [
        'bg-brand-orange', 'bg-brand-yellow', 'bg-brand-lime', 'bg-brand-red', 'bg-brand-pink',
    ],
    theme: {
        extend: {
            colors: {
                // Tailwind's own orange scale, not a hand-mixed hex. Three steps, because
                // one orange cannot do all three jobs: at 4.5:1 a colour vivid enough to be
                // the brand cannot also be body text on white, and a colour that can is no
                // longer vivid. Radix Colors lands on the same solid (its orange-9 is
                // #f76b15) and splits the same way, which is the cross-check.
                'brand-orange': '#FF6900',      // orange-500 — the brand: fills, graphics, glow
                'brand-orange-ink': '#CA3500',  // orange-700 — orange as text on light surfaces
                'brand-orange-lit': '#FF8904',  // orange-400 — orange as text on dark surfaces
                'brand-yellow': '#F5D324',
                'brand-lime': '#A3F953',
                'brand-red': '#FF4B4B',
                'brand-off-white': '#F8F8F8',
                'brand-black': '#1A1A1A',
                'brand-pink': '#FCE7F3',
            },
            fontFamily: {
                sans: ['Poppins', 'sans-serif'],
            },
            animation: {
                'infinite-scroll': 'infinite-scroll 40s linear infinite',
                'fade-in': 'fade-in 0.3s ease-out forwards',
                'scale-in': 'scale-in 0.4s cubic-bezier(0.2,0.8,0.2,1) forwards',
                'blink': 'blink 1s step-end infinite',
                'float': 'float 7s ease-in-out infinite',
                'orbit-pulse': 'orbit-pulse 4s ease-in-out infinite',
            },
            keyframes: {
                'infinite-scroll': {
                    '0%': { transform: 'translateX(0)' },
                    '100%': { transform: 'translateX(-50%)' },
                },
                'fade-in': {
                    'from': { opacity: 0 },
                    'to': { opacity: 1 },
                },
                'scale-in': {
                    'from': { transform: 'perspective(1000px) translateZ(-60px) scale(0.96)', opacity: 0 },
                    'to': { transform: 'perspective(1000px) translateZ(0) scale(1)', opacity: 1 },
                },
                'blink': {
                    'from, to': { borderColor: 'transparent' },
                    '50%': { borderColor: 'currentColor' },
                },
                // Small idle drift on floating layers, so panels never look pinned flat.
                'float': {
                    '0%, 100%': { transform: 'translate3d(0,0,0)' },
                    '50%': { transform: 'translate3d(0,-10px,0)' },
                },
                'orbit-pulse': {
                    '0%, 100%': { opacity: 0.35, transform: 'scale(1)' },
                    '50%': { opacity: 0.75, transform: 'scale(1.06)' },
                },
            },
        },
    },
    plugins: [],
};
