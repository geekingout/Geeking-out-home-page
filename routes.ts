/**
 * The site's route table, shared by the app and the build.
 *
 * It lives in its own module for one reason: vite.config.ts writes a real HTML
 * file per route at build time, with that route's title, description and
 * canonical baked into the <head>. If the app and the build kept separate
 * copies of this list they would drift, and the drift would be invisible —
 * a page would quietly ship with the wrong canonical.
 */

export const SITE_ORIGIN = 'https://geekingout.net';

export type PageDef = {
    key: string;
    path: string;
    /** Present = appears in the header nav and the mobile menu. */
    nav?: string;
    /** <title> for the page. */
    doc: string;
    /** <meta name="description"> for the page. */
    desc: string;
    /** Kept out of the sitemap: thin pages search engines need not rank. */
    noIndex?: boolean;
    /** Overrides the self-canonical, for documents that should not claim one. */
    canonical?: string;
};

/**
 * The external URL for a route, always with a trailing slash.
 *
 * The build writes each route as <route>/index.html, and a trailing slash is what
 * makes every static host resolve that by directory index — nginx, S3, GitHub
 * Pages, Netlify, Vercel, all of them, with no rewrite rule to configure. Without
 * it, `/services` is just an unknown path: hosts that fall back to the root
 * index.html would serve the home page's title and canonical under every URL,
 * which is precisely the duplication this change exists to avoid.
 *
 * Internally routes are still keyed slash-less; readRoute() normalises.
 */
export const hrefFor = (path: string) => (path === '/' ? '/' : `${path}/`);

export const PAGES: PageDef[] = [
    {
        key: 'home',
        path: '/',
        doc: 'Geeking Out Agency | AI Automation, Agents & Custom Software. Based in NYC',
        desc: 'NYC-based Digital Agency specializing in AI Agents, Automation, RAG Systems, and Custom Mobile/Web App Development. An engineering team shipping production software since 2007.',
    },
    {
        key: 'services',
        path: '/services',
        nav: 'Services',
        doc: 'Services | Geeking Out Agency',
        desc: 'Your one-stop-shop for everything AI & software. Automation & Agents, AI Audit & Strategy Sprint, RAG Systems, Software Development, Video Production and AI Products.',
    },
    {
        key: 'products',
        path: '/products',
        nav: 'Products',
        doc: 'Products | Geeking Out Agency',
        desc: 'A showcase of excellence. We build scalable, agentic, and beautiful software that powers businesses — Cafecito, Schoolz, Loomino.ai, Staffy.io, GameOnClass, UESDAD and Dog Kitchen.',
    },
    {
        key: 'philosophy',
        path: '/philosophy',
        nav: 'Philosophy',
        doc: 'Philosophy | Geeking Out Agency',
        desc: 'How we decide what to build: solve the right problem, stay transparent and jargon-free, and keep pace with what is next.',
    },
    {
        key: 'team',
        path: '/team',
        nav: 'Team',
        doc: 'Team | Geeking Out Agency',
        desc: "Friendly faces, expert minds. We're easy to work with. Meet the in-house engineers, product and accounts team behind Geeking Out.",
    },
    {
        key: 'process',
        path: '/process',
        nav: 'Process',
        doc: 'Process | Geeking Out Agency',
        desc: 'How a project runs. Phase A – Discovery & Strategy: specifications, wireframes, estimates. Phase B – Development: data preparation, modelling, build, deployment and monitoring.',
    },
    {
        key: 'faq',
        path: '/faq',
        nav: 'FAQ',
        doc: 'FAQ | Geeking Out Agency',
        desc: 'Answers to what we get asked most: what agents and RAG systems actually do, what projects cost, how long they take, what happens to your data, and which AI models we use.',
    },
    {
        key: 'contact',
        path: '/contact',
        doc: 'Start a Project | Geeking Out Agency',
        desc: "Describe your idea, and we'll get in touch. Tell us what you're working on and we'll help you identify the smartest path forward.",
    },
    {
        key: 'terms',
        path: '/terms',
        doc: 'Terms of Service | Geeking Out Agency',
        desc: 'Terms of service for geekingout.net.',
        noIndex: true,
    },
    {
        key: 'privacy',
        path: '/privacy',
        doc: 'Privacy Policy | Geeking Out Agency',
        desc: 'Privacy policy for geekingout.net.',
        noIndex: true,
    },
];

export const NOT_FOUND: PageDef = {
    key: 'notFound',
    path: '/404',
    doc: 'Page not found | Geeking Out Agency',
    desc: 'That link does not lead anywhere on this site.',
    noIndex: true,
    // A not-found document should point at the site root rather than claim itself.
    canonical: '/',
};

/** The order the chapter pager walks. Contact and the legal pages sit outside it. */
export const CHAPTER_ORDER = ['home', 'services', 'products', 'philosophy', 'team', 'process', 'faq'];

/**
 * The site has been through two URL schemes. Anything still pointing at the
 * one-page anchors (#services) or at the hash router that replaced them
 * (#/services) is redirected to the real path on arrival, so old links, old
 * emails and anything already in a search index keep working.
 */
export const LEGACY_ANCHORS: Record<string, string> = {
    '#services': '/services',
    '#products': '/products',
    '#philosophy': '/philosophy',
    '#team': '/team',
    '#process': '/process',
    '#faqs': '/faq',
    '#contact': '/contact',
};
