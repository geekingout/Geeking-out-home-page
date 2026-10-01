/**
 * Compiled at build time rather than loaded from cdn.tailwindcss.com: each route
 * ships pre-rendered markup, which would paint unstyled before a CDN stylesheet
 * existed.
 *
 * The theme is the 2026 mockup's palette and type, named so the markup can say
 * `text-ink-3` or `bg-night` instead of repeating a hex.
 */
export default {
    content: [
        './index.html', './index.tsx', './App.tsx', './nav.tsx', './showcase.tsx',
        './content.ts', './team-portraits.tsx', './arcade-cabinets.tsx', './routes.ts', './entry-server.tsx',
    ],
    theme: {
        extend: {
            colors: {
                paper: '#FAF8F5',
                'paper-2': '#F4F1EC',
                ink: '#17151A',
                'ink-2': '#3A3742',
                'ink-3': '#5E5A66',
                'ink-4': '#A9A3B3',
                line: '#E6E1DA',
                'line-2': '#D9D3CB',
                'line-3': '#C9C4BE',
                night: '#0D0908',
                'night-2': '#17151A',
                bone: '#D8D2CB',
                'bone-2': '#C9C4BE',
                orange: '#FF5A1F',
                'orange-lit': '#FF8A5C',
                'orange-ink': '#C93F0A',
                'orange-deep': '#A83206',
                peach: '#FFB899',
                'peach-2': '#FFC9B0',
                'orange-tint': '#FFF0E8',
                green: '#2EB884',
                // The arcade module was written against the previous token names.
                'brand-black': '#17151A',
                'brand-orange': '#FF5A1F',
                'brand-orange-ink': '#C93F0A',
                'brand-orange-lit': '#FF8A5C',
                'brand-red': '#E0437A',
            },
            fontFamily: {
                sans: ['Barlow', 'system-ui', 'sans-serif'],
                display: ['"Barlow Condensed"', 'sans-serif'],
                mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
            },
            maxWidth: {
                site: '1280px',
            },
        },
    },
    plugins: [],
};
