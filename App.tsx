
import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';

// --- Configuration ---
// Explicitly type as string to avoid TS error when comparing with the placeholder string below
const GOOGLE_SHEETS_WEBHOOK_URL: string = "https://script.google.com/macros/s/AKfycbwXWaVr52KdOf0bQHL21kG2vFyNZyOrsYYRv5_Bj1wIMxWx5bs7e9UuqIx7nE6G6qEkjw/exec";

// The original brand mark, vendored here as a data URI instead of being hotlinked from a
// third-party host, so nobody else controls what renders as our logo and it costs no extra request.
// Downscaled from the 1500px source to 192px, which still covers the 56px header box at 3x DPR.
// index.html holds a 64px copy for the favicon — regenerate both if the mark ever changes.
const LOGO_SRC = "data:image/png;base64,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";

// Resolves to true when the POST left the browser without a network error. Because the request
// is sent no-cors the response is opaque, so this cannot confirm the Apps Script actually wrote
// the row — it only rules out the user being offline or the endpoint being unreachable.
const sendToGoogleSheets = async (data: any): Promise<boolean> => {
    // SANITIZATION FIX:
    // Create a clean object to ensure no circular references (like DOM Events) are passed to JSON.stringify
    const cleanPayload = {
        timestamp: new Date().toLocaleString(),
        source: typeof data.source === 'string' ? data.source : 'Unknown',
        name: typeof data.name === 'string' ? data.name : '',
        email: typeof data.email === 'string' ? data.email : '',
        // The form field is named projectDescription; mirror it into `description` so the sheet
        // gets the text whichever of the two column names the Apps Script reads.
        description: typeof data.projectDescription === 'string' && data.projectDescription
            ? data.projectDescription
            : typeof data.description === 'string' ? data.description : '',
        // Fallback for any other string properties, but ignore objects/functions
        ...Object.keys(data).reduce((acc, key) => {
            if (key !== 'source' && key !== 'name' && key !== 'email' && key !== 'description') {
                if (typeof data[key] === 'string' || typeof data[key] === 'number' || typeof data[key] === 'boolean') {
                    acc[key] = data[key];
                }
            }
            return acc;
        }, {} as any)
    };

    if (GOOGLE_SHEETS_WEBHOOK_URL === "INSERT_YOUR_GOOGLE_APPS_SCRIPT_URL_HERE") {
        console.log("⚠️ Google Sheets URL not set. Data would have been sent:", cleanPayload);
        return false;
    }

    try {
        // mode: 'no-cors' is necessary for Google Apps Script Web Apps. It also restricts
        // Content-Type to the safelisted values, so send text/plain — Apps Script reads the raw
        // body via e.postData.contents either way. Declaring application/json here gets dropped.
        await fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
            method: "POST",
            mode: "no-cors",
            headers: {
                "Content-Type": "text/plain;charset=utf-8",
            },
            body: JSON.stringify(cleanPayload),
        });
        console.log("✅ Data sent to Google Sheets");
        return true;
    } catch (error) {
        console.error("❌ Error sending to Google Sheets:", error);
        return false;
    }
};

// --- Data for Components ---
const servicesData = [
    { 
        icon: '🤖', 
        title: 'Automation & Agents', 
        description: 'Custom agents to streamline your workflows.', 
        color: 'bg-brand-purple', 
        graphic: 'fas fa-robot',
        explanation: "Imagine having a super-smart assistant for your computer. We build 'agents'—little software robots—that can do boring, repetitive tasks for you automatically. Things like sorting emails, filling out forms, or gathering data from websites. It's like putting your workflow on autopilot so you can focus on the important stuff."
    },
    {
        icon: '🧭',
        title: 'AI Audit & Strategy Sprint',
        description: 'Two to four weeks to find what is worth building.',
        color: 'bg-brand-red',
        graphic: 'fas fa-compass',
        explanation: "Most teams know they should be doing something with AI, but not what, or where it would actually pay off. Over two to four weeks we map how work really moves through your business, score each opportunity by effort against payoff, and hand you a ranked roadmap. It's a paid engagement and it stands on its own—the roadmap is yours to take to any developer, including one who isn't us."
    },
    { 
        icon: '📚', 
        title: 'RAG Systems', 
        description: 'AI grounded in your proprietary knowledge.', 
        color: 'bg-brand-lime', 
        graphic: 'fas fa-book',
        explanation: "This is like giving an AI an 'open book' test. Instead of trying to memorize everything, a RAG system can look up information from your private documents or database in real-time before answering a question. This ensures the AI gives you the most accurate, up-to-date answers based on *your* knowledge, not just what it learned from the internet."
    },
    { 
        icon: '💻', 
        title: 'Software Development', 
        description: 'Bespoke web apps and enterprise platforms.', 
        color: 'bg-brand-yellow', 
        graphic: 'fas fa-code',
        explanation: "This is about building custom tools from the ground up. Need a unique website, a mobile app for your customers, or a powerful internal dashboard for your team? We design and code software that is tailor-made to solve your specific problems and help your business run smoothly."
    },
    { 
        icon: '🎬', 
        title: 'Video Production', 
        description: 'Engaging, AI-enhanced video content.', 
        color: 'bg-brand-purple', 
        graphic: 'fas fa-video',
        explanation: "We create professional videos for your brand, but with an AI-powered twist. We can use AI to help with scriptwriting, generate realistic voiceovers, create animations, or even edit footage faster. The result is high-quality, engaging video content that captures your audience's attention, made more efficiently."
    },
    { 
        icon: '🚀', 
        title: 'AI Products', 
        description: 'Launch new AI-powered SaaS platforms.', 
        color: 'bg-brand-red', 
        graphic: 'fas fa-rocket',
        explanation: "Have a big idea for a new app or service that uses AI? We can help you build it from concept to launch. This is about creating a complete, market-ready product—like a new photo editing app with AI filters or a smart scheduling tool—that you can offer to your customers."
    },
];

const productsData = [
    {
        title: 'CAFECITO',
        subtitle: 'Agent Control Plane',
        description: "An integration control plane for AI agent fleets. Prove independence when you can. Re-derive when you can't. Never resolve a conflict.",
        icon: 'fas fa-mug-hot',
        accent: 'text-brand-lime',
        border: 'group-hover:border-brand-lime',
        glow: 'group-hover:shadow-[0_0_30px_-5px_#A3F953]',
        links: {
            website: 'https://cafeci.to/'
        }
    },
    {
        title: 'SCHOOLZ',
        subtitle: 'EdTech Platform',
        description: 'Comprehensive School Management Platform. Includes a smart feature for collecting and tracking student phones to create a distraction-free classroom experience.',
        icon: 'fas fa-school',
        accent: 'text-brand-red',
        border: 'group-hover:border-brand-red',
        glow: 'group-hover:shadow-[0_0_30px_-5px_#FF4B4B]',
        links: {
            website: 'https://schoolz.me/',
            webApp: 'https://admin.schoolz.me/login',
        }
    },
    {
        title: 'LOOMINO.AI',
        subtitle: 'Agentic Productivity',
        description: 'AI First Project Management software powered by agents to help you get stuff done.',
        icon: 'fas fa-list-check',
        accent: 'text-brand-lime',
        border: 'group-hover:border-brand-lime',
        glow: 'group-hover:shadow-[0_0_30px_-5px_#A3F953]',
        links: {
            webApp: 'https://loomino.ai/'
        }
    },
    {
        title: 'STAFFY.IO',
        subtitle: 'Generative Audio',
        description: 'AI Music Generator creating royalty-free soundscapes for creators.',
        icon: 'fas fa-music',
        accent: 'text-brand-purple',
        border: 'group-hover:border-brand-purple',
        glow: 'group-hover:shadow-[0_0_30px_-5px_#5F2EEA]',
        links: {
            website: 'https://staffy.io'
        }
    },
    {
        title: 'GAMEONCLASS',
        subtitle: 'Classroom Gamification',
        description: 'Turn any lesson into a game. Teachers create, students compete, and AI does the heavy lifting — the classroom arcade that makes every subject feel like recess.',
        icon: 'fas fa-gamepad',
        accent: 'text-brand-yellow',
        border: 'group-hover:border-brand-yellow',
        glow: 'group-hover:shadow-[0_0_30px_-5px_#F5D324]',
        links: {
            website: 'https://gameonclass.com/'
        }
    },
    {
        title: 'UESDAD',
        subtitle: 'NYC Community App',
        description: 'Connect, trade, and discover local perks with a vetted community of dads in your neighborhood. An exclusive mobile app curated for the modern New York family.',
        icon: 'fas fa-users',
        accent: 'text-brand-purple',
        border: 'group-hover:border-brand-purple',
        glow: 'group-hover:shadow-[0_0_30px_-5px_#5F2EEA]',
        links: {
            website: 'https://uesdad.nyc/',
            ios: 'https://apps.apple.com/us/app/uesdad/id6759264279'
        }
    },
    {
        title: 'DOG KITCHEN',
        subtitle: 'AI Infrastructure Layer',
        description: 'Building the infrastructure layer for AI development. A single platform that aggregates, curates, and surfaces the resources, data, and intelligence AI developers need to ship faster.',
        icon: 'fas fa-layer-group',
        accent: 'text-brand-red',
        border: 'group-hover:border-brand-red',
        glow: 'group-hover:shadow-[0_0_30px_-5px_#FF4B4B]',
        links: {
            website: 'https://dogkitchen.io/'
        }
    },
];

const teamData = [
    { name: 'Victor', role: 'Founder / AI Engineer', color: 'bg-brand-purple', text: 'text-white', icon: 'fas fa-user-astronaut', linkedin: 'http://www.linkedin.com/in/geekingout' },
    { name: 'Usama', role: 'AI Engineer', color: 'bg-brand-lime', text: 'text-brand-black', icon: 'fas fa-laptop-code' },
    { name: 'Nahuel', role: 'Software Developer', color: 'bg-brand-pink', text: 'text-brand-black', icon: 'fas fa-code' },
    { name: 'Miguel', role: 'Systems Engineer', color: 'bg-brand-yellow', text: 'text-brand-black', icon: 'fas fa-server' },
    { name: 'Lucia', role: 'Product Manager', color: 'bg-brand-red', text: 'text-white', icon: 'fas fa-clipboard-check' },
    { name: 'AQ', role: 'Mobile App Engineer', color: 'bg-brand-purple', text: 'text-white', icon: 'fas fa-mobile-screen' },
    { name: 'Patri', role: 'AI/Data Engineer', color: 'bg-brand-lime', text: 'text-brand-black', icon: 'fas fa-database' },
    { name: 'Olivia', role: 'Accounts Manager', color: 'bg-brand-pink', text: 'text-brand-black', icon: 'fas fa-file-invoice-dollar' },
];

const testimonialsData = [
    {
        name: "Aerial Best",
        role: "NYC DOE",
        text: "My principal loves this! She says it looks amazing!",
        color: "bg-brand-pink"
    },
    {
        name: "Principal Kayode Ayetiwa",
        role: "Humanities and Art HS",
        text: "I will certainly recommend your service to other schools as well as I am impressed with your business model.",
        color: "bg-brand-lime"
    },
    {
        name: "Mike Person, PMP®, SSM, ITIL",
        role: "IT Project Manager @ CACI International Inc",
        text: "I worked with Victor on several projects and can tell you that he is very astute at several technical roles including web developer, CRM developer, and in processes like data migration. Victor is extremely detail oriented, persevering, very reliable, has a great work ethic and a terrific sense of humor. I highly recommend Victor.",
        color: "bg-brand-purple"
    },
    {
        name: "Alexandria Dycus, RN, MSN, FNP",
        role: "Vanderbilt University Medical Center",
        text: "Victor is a highly skilled developer that made sure I understood the entire process and that all my options were clearly explained to me. Together we built a crm to manage leads and take them through our sales funnel. We are very happy with the application and recommend Victor for your next project.",
        color: "bg-brand-red"
    },
    {
        name: "Jason Lay",
        role: "Network Infrastructure Advisor",
        text: "Working with Victor was an enlightening experience. It's hard to find someone with knowledge and skills who also possesses an intrinsic ability to work seamlessly in a team setting. He brought value to every project we worked on, and a 'can do' attitude with every problem we encountered.",
        color: "bg-brand-lime"
    },
    {
        name: "Nahuel Gorosito",
        role: "Creative Technologist @ OUTFRONT Media",
        text: "Victor is highly skilled and efficient at what he does. I am very happy with my actor’s website that he created with his innovative site building platform, Geekingout. He is also a man of integrity who will go above and beyond the client’s needs.",
        color: "bg-brand-yellow"
    },
    {
        name: "John Vogel",
        role: "Helping Businesses with IT & Production Support",
        text: "Victor was an integral part of the Innovation team. He proposed, developed, and implemented our core software backbone, including a business-critical CRM. He respects a growing firm's budget and proposes clean, pragmatic solutions. He is so upfront, responsive, and responsible.",
        color: "bg-brand-purple"
    },
    {
        name: "Ralph Wilburn",
        role: "Founder Mobile Barber Ralph",
        text: "Working with Victor was a pleasure. The quality of his work is top notch and he is a great guy to work with. Very patient and great attention to detail. I highly recommend working with him.",
        color: "bg-brand-red"
    },
    {
        name: "Andrew Ayala",
        role: "Actor / Creative",
        text: "Geeking out is an awesome site, the display is great, anything I'd like added to the site is a breeze. Victor is as dedicated as they come, I highly recommend his services, continued success to Victor and Geeking out.",
        color: "bg-brand-lime"
    },
    {
        name: "Conor Briody",
        role: "CRM Technology Lead @ Jupiter AM",
        text: "Victor's ability to architect applications to make all aspects of the business run smoothly was astounding. Regardless of how complex a project was - Victor had a second to none ability to design innovative solutions in a short timeframe. Working with Victor has been an indescribable pleasure.",
        color: "bg-brand-yellow"
    }
];

const philosophyData = [
    { number: '01', icon: 'fas fa-bullseye', title: 'Solve the Right Problem', description: 'We dive deep, past the symptoms, to identify the core challenge.' },
    { number: '02', icon: 'fas fa-comments', title: 'Transparent & Jargon-Free', description: 'You\'ll get clear, direct updates and strategic advice.' },
    { number: '03', icon: 'fas fa-lightbulb', title: 'Obsessed with What\'s Next', description: 'We are constantly mastering new AI frameworks to keep you ahead of the curve.' },
];

const processData = [
  {
    phase: 'Phase A – Discovery & Strategy',
    steps: [
      { icon: 'fas fa-file-alt', text: 'Specifications & Planning' },
      { icon: 'fas fa-drafting-compass', text: 'Designs, Wireframe & Prototype' },
      { icon: 'fas fa-chart-line', text: 'Estimates & Timeline' },
    ],
  },
  {
    phase: 'Phase B – Development',
    steps: [
      { icon: 'fas fa-database', text: 'Data Collection & Preparation' },
      { icon: 'fas fa-vial', text: 'Experimentation & Modeling' },
      { icon: 'fas fa-desktop', text: 'Feature Development & Testing' },
      { icon: 'fas fa-rocket', text: 'Deployment & Integration' },
      { icon: 'fas fa-shield-alt', text: 'Maintain & Monitor' },
    ],
  },
];

const faqData = [
  { question: "What are 'Automation & Agents' and how can they help me?", answer: "Automation involves creating custom 'agents' that handle repetitive, complex tasks. This could be anything from processing invoices and customer support emails to analyzing market data, freeing up your team for high-value work." },
  { question: "Can you work with the tools we already use?", answer: "Usually yes, and that's the starting assumption. Most of what we build connects the systems you already pay for rather than replacing them: your CRM, inbox, Slack, spreadsheets, ticketing. If something genuinely can't be connected, we'll tell you early rather than bill you to find out." },
  { question: "What happens in an 'AI Audit & Strategy Sprint'?", answer: "Over two to four weeks we map how work actually moves through your business, then score each opportunity by the effort it takes against what it returns. You get a ranked roadmap of what to build and in what order. It's a paid engagement, and the roadmap is yours whether or not you build any of it with us." },
  { question: "How much does a project cost?", answer: "It depends on scope, so we quote per project rather than off a rate card. Most engagements share the same shape: a fixed build fee to design and ship the thing, then an optional monthly retainer if you want us to keep it running and improving as your business changes. You get the full number in writing before any work starts." },
  { question: "How long before we see something working?", answer: "For a focused automation or a single agent, usually weeks rather than months. We would rather put a working slice in front of you early than disappear for a quarter. Larger platforms take longer and get broken into milestones so you can see progress throughout. If the scope isn't clear yet, the Audit & Strategy Sprint is the fastest way to get a real timeline." },
  { question: "What happens to our data?", answer: "It stays yours. Wherever possible we build inside your own accounts and infrastructure, so your data doesn't take a detour through ours. For knowledge assistants we mirror the permissions you already have—if someone can't open a document today, the assistant won't surface it to them tomorrow. We'll walk you through where data lives and who can reach it before we build anything." },
  { question: "Which AI models do you use?", answer: "Whichever fits the job. We aren't tied to a single vendor, and we choose based on what your use case actually needs: accuracy, speed, cost, and whether your data is allowed to leave your environment. We also build so the model can be swapped later, because this field moves quickly and you shouldn't be locked into today's best option forever." },
  { question: "Is this going to replace our team?", answer: "That isn't what we build. These systems take on the repetitive part—the copying between systems, the same twenty support questions, the hunt for a document someone filed two years ago. The judgment calls stay with your people, and so does the final say." },
  { question: "Do you only work with big companies?", answer: "Nope! We love working with small and medium-sized businesses just as much as larger enterprises. Our services are scalable, meaning we can build a plan that fits your exact needs and budget." },
  { question: "What kind of 'AI Products' can you build?", answer: "We can help you conceptualize, design, and build entirely new software applications with AI at their core. This includes internal tools to boost productivity or new SaaS (Software as a Service) platforms you can sell to your customers." },
];

const termsContent = `
1. Terms
By accessing the website at https://geekingout.net/, you are agreeing to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws. If you do not agree with any of these terms, you are prohibited from using or accessing this site. The materials contained in this website are protected by applicable copyright and trademark law.

2. Use License
Permission is granted to temporarily download one copy of the materials (information or software) on Geeking Out, LLC’s website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
- modify or copy the materials;
- use the materials for any commercial purpose, or for any public display (commercial or non-commercial);
- attempt to decompile or reverse engineer any software contained on Geeking Out, LLC’s website;
- remove any copyright or other proprietary notations from the materials; or
- transfer the materials to another person or “mirror” the materials on any other server.
This license shall automatically terminate if you violate any of these restrictions and may be terminated by Geeking Out, LLC at any time. Upon terminating your viewing of these materials or upon the termination of this license, you must destroy any downloaded materials in your possession whether in electronic or printed format.

3. Disclaimer
The materials on Geeking Out, LLC’s website are provided on an ‘as is’ basis. Geeking Out, LLC makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
Further, Geeking Out, LLC does not warrant or make any representations concerning the accuracy, likely results, or reliability of the use of the materials on its website or otherwise relating to such materials or on any sites linked to this site.

4. Limitations
In no event shall Geeking Out, LLC or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Geeking Out, LLC’s website, even if Geeking Out, LLC or a Geeking Out, LLC authorized representative has been notified orally or in writing of the possibility of such damage. Because some jurisdictions do not allow limitations on implied warranties, or limitations of liability for consequential or incidental damages, these limitations may not apply to you.

5. Accuracy of materials
The materials appearing on Geeking Out, LLC’s website could include technical, typographical, or photographic errors. Geeking Out, LLC does not warrant that any of the materials on its website are accurate, complete or current. Geeking Out, LLC may make changes to the materials contained on its website at any time without notice. However Geeking Out, LLC does not make any commitment to update the materials.

6. Links
Geeking Out, LLC has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Geeking Out, LLC of the site. Use of any such linked website is at the user’s own risk.

7. Modifications
Geeking Out, LLC may revise these terms of service for its website at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service.

8. Governing Law
These terms and conditions are governed by and construed in accordance with the laws of New York City and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
`;

const privacyContent = `
Your privacy is important to us. It is Geeking Out, LLC’s policy to respect your privacy regarding any information we may collect from you across our website, https://geekingout.net/, and other sites we own and operate.

We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent. We also let you know why we’re collecting it and how it will be used.

We only retain collected information for as long as necessary to provide you with your requested service. What data we store, we’ll protect within commercially acceptable means to prevent loss and theft, as well as unauthorized access, disclosure, copying, use or modification.

We don’t share any personally identifying information publicly or with third-parties, except when required to by law.

Our website may link to external sites that are not operated by us. Please be aware that we have no control over the content and practices of these sites, and cannot accept responsibility or liability for their respective privacy policies. You are free to refuse our request for your personal information, with the understanding that we may be unable to provide you with some of your desired services.

Your continued use of our website will be regarded as acceptance of our practices around privacy and personal information. If you have any questions about how we handle user data and personal information, feel free to contact us.
`;

// --- Depth primitives ---
// The whole design rests on three ideas: surfaces sit on a shared vanishing point,
// they respond to where the pointer is, and they arrive from depth as you scroll.
// These four helpers are the only machinery behind that.

const reducedMotion = () =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// <html class="dark"> is toggled outside React — by the no-flash script in index.html and by
// the header switch — so anything that has to repaint in the other palette (the WebGL scenes)
// watches the attribute instead of taking a prop.
const useIsDark = () => {
    const [isDark, setIsDark] = useState(
        typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
    );
    useEffect(() => {
        const el = document.documentElement;
        const observer = new MutationObserver(() => setIsDark(el.classList.contains('dark')));
        observer.observe(el, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);
    return isDark;
};

// Pointer tilt. Writes CSS custom properties rather than React state, so moving the mouse
// across a card never triggers a render — the browser interpolates the transform on the
// compositor. --mx/--my drive the specular sheen defined in index.html.
function useTilt<T extends HTMLElement>(maxDeg = 9) {
    const ref = useRef<T>(null);

    const track = (e: React.PointerEvent) => {
        const el = ref.current;
        // Touch already moves the page; tilting under a finger fights the scroll.
        if (!el || e.pointerType === 'touch') return;
        const rect = el.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;
        el.style.setProperty('--ry', `${(px - 0.5) * 2 * maxDeg}deg`);
        el.style.setProperty('--rx', `${(0.5 - py) * 2 * maxDeg}deg`);
        el.style.setProperty('--mx', `${px * 100}%`);
        el.style.setProperty('--my', `${py * 100}%`);
    };

    const settle = () => {
        const el = ref.current;
        if (!el) return;
        el.style.setProperty('--rx', '0deg');
        el.style.setProperty('--ry', '0deg');
    };

    return { ref, onPointerMove: track, onPointerLeave: settle, onBlur: settle };
}

/* ------------------------------------------------------------------ *
 *  Routing
 *
 *  Hash routes rather than real paths. The site ships as a single
 *  dist/index.html dropped onto a static host, so there is no server to teach
 *  a rewrite rule to — #/services has to be a URL the browser resolves on its
 *  own. In exchange every page is still linkable, bookmarkable and Back-able,
 *  and the whole router costs one event listener.
 * ------------------------------------------------------------------ */

type PageDef = {
    key: string;
    path: string;
    nav?: string;    // present = appears in the header and menu
    doc: string;     // document.title while the page is open
};

const PAGES: PageDef[] = [
    { key: 'home', path: '/', doc: 'Geeking Out Agency | AI Automation, Agents & Custom Software. Based in NYC' },
    { key: 'services', path: '/services', nav: 'Services', doc: 'Services | Geeking Out Agency' },
    { key: 'products', path: '/products', nav: 'Products', doc: 'Products | Geeking Out Agency' },
    { key: 'philosophy', path: '/philosophy', nav: 'Philosophy', doc: 'Philosophy | Geeking Out Agency' },
    { key: 'team', path: '/team', nav: 'Team', doc: 'Team | Geeking Out Agency' },
    { key: 'process', path: '/process', nav: 'Process', doc: 'Process | Geeking Out Agency' },
    { key: 'faq', path: '/faq', nav: 'FAQ', doc: 'FAQ | Geeking Out Agency' },
    { key: 'contact', path: '/contact', doc: 'Start a Project | Geeking Out Agency' },
    { key: 'terms', path: '/terms', doc: 'Terms of Service | Geeking Out Agency' },
    { key: 'privacy', path: '/privacy', doc: 'Privacy Policy | Geeking Out Agency' },
];

const NAV_PAGES = PAGES.filter(p => p.nav);

// The order the pager walks. Contact and the legal pages sit outside it.
const CHAPTER_ORDER = ['home', 'services', 'products', 'philosophy', 'team', 'process', 'faq'];

// This used to be one page of anchors. Anything already linking to #services — an old
// email, a bookmark, the search index — lands on the page that content moved to.
const LEGACY_ANCHORS: Record<string, string> = {
    '#services': '/services',
    '#products': '/products',
    '#philosophy': '/philosophy',
    '#team': '/team',
    '#process': '/process',
    '#faqs': '/faq',
    '#contact': '/contact',
};

const readRoute = (): string => {
    const raw = typeof window === 'undefined' ? '' : window.location.hash;
    if (!raw || raw === '#') return '/';
    if (LEGACY_ANCHORS[raw]) return LEGACY_ANCHORS[raw];
    if (!raw.startsWith('#/')) return '/';
    return raw.slice(1).replace(/\/+$/, '') || '/';
};

const useRoute = () => {
    const [route, setRoute] = useState(readRoute);

    useEffect(() => {
        const onChange = () => setRoute(readRoute());
        window.addEventListener('hashchange', onChange);

        // Rewrite a legacy anchor in place so the address bar agrees with the page.
        const raw = window.location.hash;
        if (LEGACY_ANCHORS[raw]) {
            window.history.replaceState(null, '', `#${LEGACY_ANCHORS[raw]}`);
        }
        onChange();

        return () => window.removeEventListener('hashchange', onChange);
    }, []);

    return route;
};

const navigate = (path: string) => {
    // Re-selecting the page you are on fires no hashchange, so take the reader back
    // to the top by hand rather than appearing to do nothing.
    if (readRoute() === path) window.scrollTo({ top: 0, behavior: 'auto' });
    window.location.hash = path;
};

const RouteLink: React.FC<{
    to: string;
    className?: string;
    children: React.ReactNode;
    onClick?: () => void;
    onMouseEnter?: React.MouseEventHandler<HTMLAnchorElement>;
    'aria-label'?: string;
    'aria-current'?: boolean | 'page';
}> = ({ to, className, children, onClick, onMouseEnter, ...rest }) => (
    // A real anchor, so middle-click, cmd-click and "copy link" all behave.
    <a href={`#${to}`} className={className} onClick={onClick} onMouseEnter={onMouseEnter} {...rest}>
        {children}
    </a>
);

// Section heading. Small chapter label, then the display line — both animate in from depth.
const SectionHead: React.FC<{
    label: string;
    title: string;
    blurb?: string;
    light?: boolean;
    // Each page carries exactly one h1; sections inside a page use the default h2.
    level?: 1 | 2;
}> = ({ label, title, blurb, light, level = 1 }) => {
    const Heading = (level === 1 ? 'h1' : 'h2') as 'h1' | 'h2';
    return (
        <div className="text-center max-w-3xl mx-auto mb-16" data-depth-in>
            <div className={`chip mb-5 ${light ? 'text-white/45' : ''}`}>{label}</div>
            <Heading className={`display font-black text-5xl md:text-7xl mb-5 ${light ? 'text-white' : 'text-brand-black dark:text-white'}`}>
                {title}
            </Heading>
            {blurb && (
                <p className={`text-lg leading-relaxed ${light ? 'text-white/60' : 'text-brand-black/60 dark:text-gray-400'}`}>
                    {blurb}
                </p>
            )}
        </div>
    );
};

// --- Sub-Components ---

// The service list as a running banner pinned above everything, newsroom-style. It is
// decorative — the same words are said properly on the Services page — so it is hidden from
// assistive tech, and the header simply sits below it.
const AlertBanner: React.FC = () => {
    const items = [
        'Workflow Automation & AI Ops',
        'Support & Sales Agents',
        'Knowledge Assistants (RAG)',
        'AI Audit & Strategy Sprint',
        'Content & Marketing Systems',
    ];
    // The marquee animates to translateX(-50%), so the copy count must be even for the loop to be
    // seamless — at the halfway point the third copy has to land exactly where the first began.
    // Four rather than two also keeps the band full at the end of a cycle on very wide displays.
    const repeatedItems = [...items, ...items, ...items, ...items];

    return (
        <div
            className="fixed top-0 left-0 w-full h-8 z-[52] overflow-hidden flex items-center bg-gradient-to-r from-brand-purple via-[#7C4DFF] to-brand-purple"
            aria-hidden="true"
        >
            <div className="w-full inline-flex flex-nowrap">
                <div className="flex items-center animate-infinite-scroll space-x-8">
                    {repeatedItems.map((item, index) => (
                        <div key={index} className="flex items-center space-x-3 flex-shrink-0 text-white/90">
                            <span className="text-[11px] md:text-xs font-bold uppercase tracking-[0.18em] whitespace-nowrap">{item}</span>
                            <i className="fas fa-bolt text-[10px] text-brand-yellow"></i>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};


const Header: React.FC<{
    route: string;
    isMenuOpen: boolean;
    setIsMenuOpen: (isOpen: boolean) => void;
    toggleTheme: () => void;
    isDark: boolean;
}> = ({ route, isMenuOpen, setIsMenuOpen, toggleTheme, isDark }) => {
    const [hoverStyle, setHoverStyle] = useState({ left: 0, width: 0, opacity: 0 });
    const [scrolled, setScrolled] = useState(false);
    const navRef = useRef<HTMLDivElement>(null);

    const socialLinks = [
        { icon: 'fab fa-instagram', href: 'https://www.instagram.com/geekingoutnet/', label: 'Instagram' },
        { icon: 'fab fa-x-twitter', href: 'https://x.com/geekingoutnet', label: 'X (Twitter)' },
        { icon: 'fab fa-linkedin-in', href: 'https://www.linkedin.com/company/geeking-out', label: 'LinkedIn' },
    ];

    // The bar starts transparent over the hero and only materialises once content is
    // sliding underneath it, so nothing competes with the 3D statue on first paint.
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 24);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Transparent only works over the hero, which is light. Every other page opens on its
    // own section — two of them near-black — where dark-on-dark type disappears.
    const solid = scrolled || route !== '/';

    const closeMenu = () => setIsMenuOpen(false);

    const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
        const { offsetLeft, offsetWidth } = e.currentTarget;
        setHoverStyle({ left: offsetLeft, width: offsetWidth, opacity: 1 });
    };

    const handleMouseLeave = () => {
        setHoverStyle(prev => ({ ...prev, opacity: 0 }));
    };


    return (
    <>
        <header
            className={`fixed top-8 left-0 w-full z-50 px-4 py-3 transition-all duration-500 ${
                solid
                    ? 'backdrop-blur-xl bg-[var(--bar)] border-b border-[var(--hair)] shadow-[0_18px_40px_-30px_rgba(20,18,40,.6)]'
                    : 'bg-transparent border-b border-transparent'
            }`}
        >
            <div className="container mx-auto max-w-7xl flex justify-center md:justify-between items-center relative">
                <RouteLink to="/" className="flex items-center gap-4 group stage-near" aria-label="Geeking Out Agency Home">
                    <div className="relative tilt">
                        {/* The mark rides on a lit tile that pushes forward on hover rather than
                            sliding sideways — the same depth language as every other surface. */}
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-purple to-[#8B5CF6] flex items-center justify-center border border-white/20 shadow-[0_10px_24px_-8px_rgba(95,46,234,.75)] transition-transform duration-500 group-hover:scale-105 group-hover:-translate-y-0.5 overflow-hidden">
                            <img
                                src={LOGO_SRC}
                                alt="Geeking Out Logo"
                                className="w-10 h-10 object-contain brightness-0 invert"
                            />
                        </div>
                        <div className="absolute inset-0 rounded-2xl bg-brand-purple/50 blur-xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" aria-hidden="true"></div>
                    </div>
                    <div className="flex flex-col justify-center items-center">
                        <span className="font-black text-3xl leading-none tracking-tight text-brand-black dark:text-white group-hover:text-brand-purple dark:group-hover:text-brand-yellow transition-colors">
                            Geeking Out
                        </span>
                        <div className="flex items-center mt-1">
                            <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold tracking-wider uppercase text-brand-purple dark:text-brand-yellow bg-brand-purple/10 dark:bg-brand-yellow/10 border border-brand-purple/20 dark:border-brand-yellow/20">
                                &lt;Digital Agency/&gt;
                            </span>
                        </div>
                    </div>
                </RouteLink>

                {/* Desktop Nav */}
                <nav ref={navRef} onMouseLeave={handleMouseLeave} className="hidden lg:flex items-center gap-2 relative" aria-label="Desktop Navigation">
                    <div
                        className="absolute bg-brand-purple/10 dark:bg-brand-purple/30 backdrop-blur-sm border border-brand-purple/20 rounded-full transition-all duration-300 ease-out -z-10"
                        style={{ ...hoverStyle, height: '36px', top: '50%', transform: 'translateY(-50%)' }}
                    />
                    {NAV_PAGES.map(page => {
                        const active = page.path === route;
                        return (
                            <RouteLink
                                key={page.key}
                                to={page.path}
                                aria-current={active ? 'page' : undefined}
                                onClick={closeMenu}
                                onMouseEnter={handleMouseEnter}
                                className={`font-semibold transition-colors px-4 py-1 relative z-10 ${
                                    active
                                        ? 'text-brand-purple dark:text-brand-yellow'
                                        : 'text-brand-black/70 dark:text-gray-300 hover:text-brand-purple dark:hover:text-brand-yellow'
                                }`}
                            >
                                {page.nav}
                            </RouteLink>
                        );
                    })}
                </nav>

                {/* Right Controls: Absolute on mobile to prevent layout shift, static on desktop */}
                <div className="absolute right-0 md:static flex items-center gap-4">
                     <div className="hidden sm:flex items-center gap-4">
                        <button onClick={toggleTheme} className="text-xl text-brand-black/60 dark:text-white/60 hover:text-brand-purple dark:hover:text-brand-yellow transition-colors" aria-label="Toggle Dark Mode">
                            <i className={`fas ${isDark ? 'fa-sun' : 'fa-moon'}`}></i>
                        </button>
                        {socialLinks.map((link, index) => (
                             <a key={index} href={link.href} target="_blank" rel="noopener noreferrer" aria-label={link.label} className="text-xl text-brand-black/60 dark:text-white/60 hover:text-brand-purple dark:hover:text-brand-yellow transition-colors">
                                <i className={link.icon}></i>
                            </a>
                        ))}
                         <RouteLink
                            to="/contact"
                            onClick={closeMenu}
                            className="relative px-6 py-3 rounded-full font-bold text-white bg-brand-purple shadow-[0_10px_30px_-12px_rgba(95,46,234,.9)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_44px_-14px_rgba(95,46,234,1)]"
                         >
                            Get In Touch
                        </RouteLink>
                     </div>
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle Menu" className="lg:hidden md:block hidden text-2xl z-50 text-brand-black dark:text-white">
                        <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
                    </button>
                </div>
            </div>
        </header>

        {/* Mobile/Tablet Menu Overlay */}
        {isMenuOpen && (
            <div className="fixed inset-x-0 top-8 bottom-0 z-40 flex flex-col items-center justify-center animate-fade-in lg:hidden bg-[var(--veil)] backdrop-blur-2xl">
                <nav className="flex flex-col items-center gap-7 text-center" aria-label="Mobile Navigation">
                    <RouteLink
                        to="/"
                        onClick={closeMenu}
                        aria-current={route === '/' ? 'page' : undefined}
                        className={`font-bold text-3xl transition-colors ${route === '/' ? 'text-brand-purple dark:text-brand-yellow' : 'text-brand-black dark:text-white hover:text-brand-purple dark:hover:text-brand-yellow'}`}
                    >
                        Home
                    </RouteLink>
                    {NAV_PAGES.map(page => (
                        <RouteLink
                            key={page.key}
                            to={page.path}
                            onClick={closeMenu}
                            aria-current={page.path === route ? 'page' : undefined}
                            className={`font-bold text-3xl transition-colors ${page.path === route ? 'text-brand-purple dark:text-brand-yellow' : 'text-brand-black dark:text-white hover:text-brand-purple dark:hover:text-brand-yellow'}`}
                        >
                            {page.nav}
                        </RouteLink>
                    ))}
                </nav>
                <div className="flex items-center gap-6 mt-12">
                     <button onClick={toggleTheme} className="text-3xl text-brand-black/60 dark:text-white/60 hover:text-brand-purple dark:hover:text-brand-yellow transition-colors" aria-label="Toggle Dark Mode">
                            <i className={`fas ${isDark ? 'fa-sun' : 'fa-moon'}`}></i>
                     </button>
                     {socialLinks.map((link, index) => (
                        <a key={index} href={link.href} onClick={closeMenu} target="_blank" rel="noopener noreferrer" aria-label={link.label} className="text-3xl text-brand-black/60 dark:text-white/60 hover:text-brand-purple dark:hover:text-brand-yellow transition-colors">
                            <i className={link.icon}></i>
                        </a>
                    ))}
                </div>
                <RouteLink
                    to="/contact"
                    onClick={closeMenu}
                    className="mt-12 px-8 py-4 rounded-full font-bold text-white text-lg bg-brand-purple shadow-[0_16px_40px_-14px_rgba(95,46,234,.95)]"
                >
                    Get In Touch
                </RouteLink>
            </div>
        )}
    </>
    );
};

const MobileNavBar: React.FC<{ route: string; isMenuOpen: boolean; onMenuToggle: () => void; }> = ({ route, isMenuOpen, onMenuToggle }) => {
    const tab = (active: boolean) =>
        `flex flex-col items-center justify-center w-full h-full transition-colors group ${
            active ? 'text-brand-purple dark:text-brand-yellow' : 'text-brand-black/60 dark:text-white/60'
        }`;

    return (
        <nav className="fixed bottom-0 left-0 w-full z-[60] md:hidden pb-safe backdrop-blur-2xl bg-[var(--bar)] border-t border-[var(--hair)] shadow-[0_-16px_40px_-28px_rgba(20,18,40,.8)]" aria-label="Bottom Mobile Navigation">
            <div className="flex items-center justify-around h-16 px-2 relative">
                 <RouteLink to="/services" aria-current={route === '/services' ? 'page' : undefined} className={tab(route === '/services')}>
                    <i className="fas fa-layer-group text-xl mb-1 group-active:scale-90 transition-transform"></i>
                    <span className="text-[10px] font-bold">Services</span>
                 </RouteLink>

                 <RouteLink to="/products" aria-current={route === '/products' ? 'page' : undefined} className={tab(route === '/products')}>
                    <i className="fas fa-box-open text-xl mb-1 group-active:scale-90 transition-transform"></i>
                    <span className="text-[10px] font-bold">Products</span>
                 </RouteLink>

                 {/* Center Spacer for Button */}
                 <div className="w-full pointer-events-none"></div>

                 <RouteLink to="/contact" aria-current={route === '/contact' ? 'page' : undefined} className={tab(route === '/contact')}>
                    <i className="fas fa-paper-plane text-xl mb-1 group-active:scale-90 transition-transform"></i>
                    <span className="text-[10px] font-bold">Contact</span>
                 </RouteLink>

                 <button onClick={onMenuToggle} className={tab(false)}>
                    <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'} text-xl mb-1 group-active:scale-90 transition-transform`}></i>
                    <span className="text-[10px] font-bold">{isMenuOpen ? 'Close' : 'Menu'}</span>
                 </button>

                 {/* Floating Center Button */}
                 <RouteLink
                    to="/contact"
                    aria-label="Start a project"
                    className="absolute top-[-20px] left-1/2 -translate-x-1/2 w-14 h-14 bg-brand-purple text-white rounded-full shadow-[0_10px_26px_-6px_rgba(95,46,234,.9)] flex items-center justify-center border-4 border-[var(--bg-1)] text-2xl z-10 hover:scale-110 active:scale-95 transition-all duration-200"
                 >
                    <i className="fas fa-rocket"></i>
                 </RouteLink>
            </div>
        </nav>
    );
};

// A metal with nothing to reflect renders as a black blob, so the core needs an
// environment. Rather than pull in three's RoomEnvironment — which Vite pre-bundles as a
// second copy of three — this paints a 256x128 equirectangular sky by hand: a bright-above
// / dark-below gradient with three coloured lamps in it. PMREM prefilters that once into
// the mip chain MeshStandardMaterial samples, and the canvas is thrown away.
const makeStudioEnvironment = (renderer: THREE.WebGLRenderer) => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;

    const sky = ctx.createLinearGradient(0, 0, 0, 128);
    sky.addColorStop(0, '#ffffff');
    sky.addColorStop(0.45, '#9aa0c4');
    sky.addColorStop(1, '#141422');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, 256, 128);

    // These three become the coloured highlights sliding across the facets.
    ([['#b9a2ff', 46, 30, 40], ['#dcffb4', 186, 44, 30], ['#fff2b0', 120, 16, 24]] as const)
        .forEach(([color, x, y, r]) => {
            const lamp = ctx.createRadialGradient(x, y, 0, x, y, r);
            lamp.addColorStop(0, color);
            lamp.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = lamp;
            ctx.fillRect(x - r, y - r, r * 2, r * 2);
        });

    const texture = new THREE.CanvasTexture(canvas);
    texture.mapping = THREE.EquirectangularReflectionMapping;
    texture.colorSpace = THREE.SRGBColorSpace;

    const pmrem = new THREE.PMREMGenerator(renderer);
    const target = pmrem.fromEquirectangular(texture);
    pmrem.dispose();
    texture.dispose();
    return target;
};

/* ------------------------------------------------------------------ *
 *  Lady Liberty
 *
 *  Sculpted out of primitives rather than loaded from a model file: an extruded
 *  star fort, a lathed robe with drapery, oriented cylinders for the arms, seven
 *  tapered crown blades and a two-tone torch. That keeps her at a couple of
 *  thousand triangles and — more to the point — keeps the build a single
 *  self-contained dist/index.html, which a downloaded .glb inlined as a data URI
 *  would not.
 *
 *  She is stylised and faceted on purpose: flat shading is the same language as
 *  the rest of the page, and it reads as beaten, patinated copper rather than as
 *  a low-resolution attempt at a photograph. What the detail is spent on is the
 *  silhouette, because this one gets spun all the way round — hence a bun at the
 *  back of her head, rays all the way round the crown, and a foot breaking the
 *  hem on one side only.
 * ------------------------------------------------------------------ */
const buildLiberty = (isDark: boolean) => {
    const group = new THREE.Group();
    const geometries: THREE.BufferGeometry[] = [];
    const materials: THREE.Material[] = [];

    const track = <T extends THREE.BufferGeometry>(geo: T) => { geometries.push(geo); return geo; };

    // Oxidised copper. Barely metallic — patina is a mineral crust, so nearly all of the
    // colour has to come from the material rather than from reflections.
    const patina = new THREE.MeshStandardMaterial({
        color: isDark ? 0x4FAE92 : 0x6DBEA4,
        metalness: 0.3,
        roughness: 0.55,
        flatShading: true,
        envMapIntensity: isDark ? 0.8 : 1.05,
    });
    const stone = new THREE.MeshStandardMaterial({
        color: isDark ? 0x5A5A70 : 0x9C9CB2,
        metalness: 0.05,
        roughness: 0.9,
        flatShading: true,
    });
    // Two flames: a broad body and a hotter core inside it. One cone alone reads as a candle.
    const flameOuterMat = new THREE.MeshStandardMaterial({
        color: 0xF5D324, emissive: 0xF5D324, emissiveIntensity: 1.6,
        metalness: 0.15, roughness: 0.4, flatShading: true,
    });
    const flameCoreMat = new THREE.MeshStandardMaterial({
        color: 0xFFF6C8, emissive: 0xFFF3B0, emissiveIntensity: 3.4,
        metalness: 0, roughness: 0.5, flatShading: true,
    });
    materials.push(patina, stone, flameOuterMat, flameCoreMat);

    const add = (geo: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z = 0) => {
        const mesh = new THREE.Mesh(track(geo), mat);
        mesh.position.set(x, y, z);
        group.add(mesh);
        return mesh;
    };

    // A cylinder stretched between two points — every arm segment is described by its joint
    // positions instead of by a nest of rotations.
    const UP = new THREE.Vector3(0, 1, 0);
    const limb = (from: number[], to: number[], rTop: number, rBottom: number) => {
        const a = new THREE.Vector3(...(from as [number, number, number]));
        const b = new THREE.Vector3(...(to as [number, number, number]));
        const dir = new THREE.Vector3().subVectors(b, a);
        const mesh = new THREE.Mesh(track(new THREE.CylinderGeometry(rTop, rBottom, dir.length(), 7)), patina);
        mesh.position.copy(a).addScaledVector(dir, 0.5);
        mesh.quaternion.setFromUnitVectors(UP, dir.clone().normalize());
        group.add(mesh);
        return mesh;
    };

    // --- Fort Wood ---------------------------------------------------------------
    // The eleven-pointed star she actually stands on. It is the one part of the site
    // nobody draws, and it does more for the silhouette than another tier of plinth.
    const star = new THREE.Shape();
    const STAR_POINTS = 11;
    for (let i = 0; i < STAR_POINTS * 2; i++) {
        const a = (i / (STAR_POINTS * 2)) * Math.PI * 2 - Math.PI / 2;
        const r = i % 2 === 0 ? 1.5 : 0.98;
        const x = Math.cos(a) * r;
        const y = Math.sin(a) * r;
        if (i === 0) star.moveTo(x, y); else star.lineTo(x, y);
    }
    star.closePath();
    const starGeo = track(new THREE.ExtrudeGeometry(star, {
        depth: 0.36, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.06, bevelSegments: 1,
    }));
    starGeo.rotateX(-Math.PI / 2);   // the shape is drawn in XY; stand it up so it extrudes into +Y
    const fort = new THREE.Mesh(starGeo, stone);
    fort.position.y = -2.7;
    group.add(fort);

    // --- granite pedestal ---------------------------------------------------------
    // Four-sided cylinders: a square frustum in one primitive, and the taper is what makes
    // it read as masonry rather than as a stack of boxes.
    const square = (rTop: number, rBottom: number, h: number, y: number) => {
        const mesh = add(new THREE.CylinderGeometry(rTop, rBottom, h, 4), stone, 0, y);
        mesh.rotation.y = Math.PI / 4;
        return mesh;
    };
    square(1.02, 1.12, 0.16, -2.24);   // base course
    square(0.74, 0.98, 0.86, -1.75);   // shaft
    square(0.87, 0.80, 0.15, -1.255);  // cornice, overhanging

    // --- robe ---------------------------------------------------------------------
    const profile = [
        [0.001, -1.18], [0.8, -1.18], [0.78, -1.02], [0.68, -0.72], [0.6, -0.38],
        [0.53, -0.02], [0.47, 0.32], [0.41, 0.64], [0.35, 0.9], [0.31, 1.06], [0.29, 1.14],
    ].map(([x, y]) => new THREE.Vector2(x, y));
    const robeGeo = track(new THREE.LatheGeometry(profile, 18));

    // Drapery. A lathe alone gives a smooth cone, which reads as a bell rather than as
    // cloth, so every vertex is pushed in or out by a sine around the axis. Nine lobes
    // against eighteen segments means the ridges land between facets, not on them.
    const robeVerts = robeGeo.attributes.position;
    for (let i = 0; i < robeVerts.count; i++) {
        const x = robeVerts.getX(i);
        const z = robeVerts.getZ(i);
        const r = Math.hypot(x, z);
        if (r < 0.02) continue;
        const a = Math.atan2(z, x);
        const scale = 1 + Math.cos(a * 9) * 0.055;
        robeVerts.setX(i, Math.cos(a) * r * scale);
        robeVerts.setZ(i, Math.sin(a) * r * scale);
    }
    robeGeo.computeVertexNormals();
    group.add(new THREE.Mesh(robeGeo, patina));

    // The forward foot breaking the hem. Small, but it is the only thing telling you which
    // way she is facing once the torch has spun behind her.
    const foot = add(new THREE.BoxGeometry(0.24, 0.12, 0.34), patina, 0.1, -1.12, 0.66);
    foot.rotation.y = -0.18;

    // --- torso, shoulders, neck, head ----------------------------------------------
    add(new THREE.SphereGeometry(0.33, 10, 7), patina, 0, 1.15).scale.set(1.08, 0.78, 0.94);
    // Caps over the shoulder joints; without them the arms read as sticks pushed into a ball.
    const shoulderGeo = track(new THREE.SphereGeometry(0.155, 8, 6));
    [0.3, -0.3].forEach(x => {
        const cap = new THREE.Mesh(shoulderGeo, patina);
        cap.position.set(x, 1.17, 0.02);
        group.add(cap);
    });
    add(new THREE.CylinderGeometry(0.11, 0.15, 0.24, 7), patina, 0, 1.37);
    add(new THREE.SphereGeometry(0.2, 9, 7), patina, 0, 1.58).scale.set(0.92, 1.12, 0.95);

    // A face is four planes of shadow, not a portrait: a brow ridge and a nose are enough
    // for the head to stop reading as a sphere at this size.
    add(new THREE.BoxGeometry(0.21, 0.035, 0.07), patina, 0, 1.635, 0.15).rotation.x = -0.15;
    const nose = add(new THREE.ConeGeometry(0.038, 0.11, 4), patina, 0, 1.565, 0.175);
    nose.rotation.x = Math.PI / 2;
    // Hair gathered at the back — the silhouette cue that survives a full turn.
    add(new THREE.SphereGeometry(0.1, 8, 6), patina, 0, 1.49, -0.2).scale.set(1, 0.9, 0.85);

    // --- crown ---------------------------------------------------------------------
    add(new THREE.TorusGeometry(0.215, 0.032, 5, 14), patina, 0, 1.68).rotation.x = Math.PI / 2;

    // Seven rays, spaced right the way round rather than across the front half, and flattened
    // into blades — the real ones are tapered plates, and unflattened cones read as party hats.
    // Each ray hangs in its own frame rotated to face outward, so "thin" always means
    // tangential no matter which ray it is.
    const rayGeo = track(new THREE.ConeGeometry(0.09, 0.4, 4));
    const RAYS = 7;
    const rayTilt = 0.55;
    for (let i = 0; i < RAYS; i++) {
        const a = (i / RAYS) * Math.PI * 2;
        const holder = new THREE.Object3D();
        holder.rotation.y = -a;                       // inside this frame, outward is +X
        const ray = new THREE.Mesh(rayGeo, patina);
        ray.scale.set(1, 1, 0.3);                     // flatten tangentially into a blade
        ray.rotation.z = -rayTilt;                    // lean out from vertical
        ray.position.set(0.2 + Math.sin(rayTilt) * 0.2, 1.68 + Math.cos(rayTilt) * 0.2, 0);
        holder.add(ray);
        group.add(holder);
    }

    // --- raised arm and torch --------------------------------------------------------
    limb([0.28, 1.14, 0.02], [0.36, 1.32, 0], 0.115, 0.175);   // sleeve flare off the shoulder
    limb([0.32, 1.24, 0.02], [0.46, 1.78, -0.02], 0.085, 0.105);
    limb([0.46, 1.78, -0.02], [0.52, 2.31, 0], 0.072, 0.085);
    add(new THREE.SphereGeometry(0.085, 7, 6), patina, 0.52, 2.31);
    limb([0.52, 2.31, 0], [0.52, 2.55, 0], 0.055, 0.07);
    add(new THREE.CylinderGeometry(0.17, 0.085, 0.15, 9), patina, 0.52, 2.66);
    // The balcony rail around the flame — a real detail, and it stops the bowl looking like a cup.
    add(new THREE.TorusGeometry(0.185, 0.013, 4, 16), patina, 0.52, 2.745).rotation.x = Math.PI / 2;

    const flame = add(new THREE.ConeGeometry(0.2, 0.44, 6), flameOuterMat, 0.52, 2.95);
    const flameCore = add(new THREE.ConeGeometry(0.11, 0.3, 5), flameCoreMat, 0.52, 2.89);

    // The torch is a real light source, so it throws yellow up the arm and across the crown.
    // Short range, so it never washes out the rest of the scene.
    const flameLight = new THREE.PointLight(0xF5D324, 14, 6, 2);
    flameLight.position.set(0.52, 2.95, 0);
    group.add(flameLight);

    // --- tablet arm -------------------------------------------------------------------
    limb([-0.28, 1.12, 0.04], [-0.35, 1.3, 0.04], 0.11, 0.165);  // matching sleeve
    limb([-0.3, 1.2, 0.05], [-0.36, 0.45, 0.3], 0.075, 0.095);

    // A tabula ansata: keystone-shaped, not a rectangle, and bevelled so its edge catches light.
    const tabletShape = new THREE.Shape();
    tabletShape.moveTo(-0.21, -0.3);
    tabletShape.lineTo(0.21, -0.3);
    tabletShape.lineTo(0.16, 0.3);
    tabletShape.lineTo(-0.16, 0.3);
    tabletShape.closePath();
    const tabletGeo = track(new THREE.ExtrudeGeometry(tabletShape, {
        depth: 0.09, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.016, bevelSegments: 1,
    }));
    tabletGeo.center();
    const tablet = new THREE.Mesh(tabletGeo, patina);
    tablet.position.set(-0.44, 0.32, 0.32);
    tablet.rotation.set(-0.3, 0.25, 0.35);
    group.add(tablet);

    // Sit her so the whole figure turns about her own middle rather than about her feet.
    group.position.y = -0.28;

    return { group, geometries, materials, flame, flameCore, flameLight };
};

/* ------------------------------------------------------------------ *
 *  The hero — the one genuinely 3D object on the page.
 *
 *  Lady Liberty inside a counter-rotating cage, ringed by orbits and a shell of
 *  dust, her torch lighting her from above. Drag her (or press the arrow keys)
 *  to turn her a full 360°; let go and the momentum decays. The scene also
 *  answers to the pointer with a small camera parallax and recedes as the hero
 *  scrolls away.
 *
 *  Costs are kept deliberate: no shadow maps, no post-processing, one prefiltered
 *  environment map generated once for the metal, DPR capped at 2, and the render
 *  loop idles whenever the canvas is off-screen or the tab is hidden.
 * ------------------------------------------------------------------ */
const HeroCore: React.FC = () => {
    const mountRef = useRef<HTMLDivElement>(null);
    const isDark = useIsDark();
    const [engaged, setEngaged] = useState(false);
    const [failed, setFailed] = useState(false);
    const engagedRef = useRef(false);

    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return;

        const calm = reducedMotion();
        const PURPLE = 0x5F2EEA, LIME = 0xA3F953, YELLOW = 0xF5D324;

        let renderer: THREE.WebGLRenderer;
        try {
            renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
        } catch (err) {
            // No WebGL (old hardware, blocked context). The hero copy stands on its own.
            setFailed(true);
            return;
        }

        const width = () => mount.clientWidth || 1;
        const height = () => mount.clientHeight || 1;

        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(width(), height());
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.25;
        // Vertical drags have to keep scrolling the page; only horizontal is ours.
        renderer.domElement.style.touchAction = 'pan-y';
        renderer.domElement.style.display = 'block';
        mount.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(42, width() / height(), 0.1, 120);

        // She is tall and narrow, so fitting her to a bounding sphere would waste most of the
        // frame. Measure the two axes separately and take whichever is tighter; recomputed on
        // resize, so a narrow column pulls back instead of cropping her torch off.
        const FIT_HEIGHT = 3.3;
        const FIT_WIDTH = 2.5;
        const fitDistance = () => {
            const vFov = (camera.fov * Math.PI) / 180;
            const hFov = 2 * Math.atan(Math.tan(vFov / 2) * camera.aspect);
            return Math.max(FIT_HEIGHT / Math.tan(vFov / 2), FIT_WIDTH / Math.tan(hFov / 2)) * 1.02;
        };
        let baseZ = fitDistance();
        camera.position.set(0, 0, baseZ);

        const envRT = makeStudioEnvironment(renderer);
        scene.environment = envRT.texture;

        const core = new THREE.Group();
        scene.add(core);

        const liberty = buildLiberty(isDark);
        core.add(liberty.group);

        // Outer cage. It counter-rotates, and that difference in direction is most of what
        // sells the gap between the statue and the shell around her.
        const cageBase = new THREE.IcosahedronGeometry(2.45, 1);
        const cageGeo = new THREE.WireframeGeometry(cageBase);
        const cageMat = new THREE.LineBasicMaterial({
            color: isDark ? 0xffffff : 0x1A1A1A,
            transparent: true,
            opacity: isDark ? 0.12 : 0.09,
        });
        const cage = new THREE.LineSegments(cageGeo, cageMat);
        core.add(cage);

        // Haloes rather than orbits: three near-horizontal rings stacked up her height. Tilted
        // rings read as a skewer through a figure, where a sphere carried them fine.
        const ringGeos: THREE.TorusGeometry[] = [];
        const ringMats: THREE.MeshBasicMaterial[] = [];
        const rings: THREE.Mesh[] = [];
        // tilt is measured off flat. The middle ring gets a real one — sitting level with the
        // camera it would otherwise collapse into a line straight through her chest.
        const RING_SPECS = [
            { r: 2.35, y: -2.85, c: YELLOW, tilt: 0.04 },
            { r: 1.98, y: -2.1, c: PURPLE, tilt: 0.07 },
            { r: 1.5, y: -0.35, c: LIME, tilt: 0.36 },
        ];
        RING_SPECS.forEach(spec => {
            const g = new THREE.TorusGeometry(spec.r, 0.012, 6, 140);
            const m = new THREE.MeshBasicMaterial({ color: spec.c, transparent: true, opacity: 0.8 });
            const ring = new THREE.Mesh(g, m);
            ring.position.y = spec.y;
            ring.rotation.x = Math.PI / 2 + spec.tilt;
            core.add(ring);
            ringGeos.push(g); ringMats.push(m); rings.push(ring);
        });

        // Dust shell — sits outside the core group so it can drift on its own axis and give
        // the object something to be "inside of".
        const DUST = 1100;
        const dustPos = new Float32Array(DUST * 3);
        for (let i = 0; i < DUST; i++) {
            const radius = 3.3 + Math.random() * 4.4;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            dustPos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            dustPos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            dustPos[i * 3 + 2] = radius * Math.cos(phi);
        }
        const dustGeo = new THREE.BufferGeometry();
        dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
        const dustMat = new THREE.PointsMaterial({
            size: 0.038,
            color: isDark ? 0xffffff : PURPLE,
            transparent: true,
            opacity: isDark ? 0.55 : 0.4,
            sizeAttenuation: true,
            depthWrite: false,
        });
        const dust = new THREE.Points(dustGeo, dustMat);
        scene.add(dust);

        // Directional rather than point lights: the highlights then stay put no matter how
        // far the camera dollies on scroll.
        const ambient = new THREE.AmbientLight(0xffffff, isDark ? 0.35 : 0.8);
        const key = new THREE.DirectionalLight(PURPLE, 6.5); key.position.set(-4, 3, 5);
        const rim = new THREE.DirectionalLight(LIME, 3.4); rim.position.set(5, -2.5, 2);
        const back = new THREE.DirectionalLight(YELLOW, 2.6); back.position.set(1.5, 4, -5);
        scene.add(ambient, key, rim, back);

        // --- interaction -------------------------------------------------------
        const spin = { x: 0.06, y: 0.55 };  // where she is facing
        const vel = { x: 0, y: 0 };         // leftover momentum from the last drag
        const pointer = { x: 0, y: 0 };     // -1..1 across the canvas, drives camera parallax
        let dragging = false;
        let last = { x: 0, y: 0 };

        const canvas = renderer.domElement;

        const markEngaged = () => {
            if (engagedRef.current) return;
            engagedRef.current = true;
            setEngaged(true);
        };

        const onDown = (e: PointerEvent) => {
            dragging = true;
            last = { x: e.clientX, y: e.clientY };
            vel.x = 0; vel.y = 0;
            canvas.setPointerCapture(e.pointerId);
            markEngaged();
        };

        const onMove = (e: PointerEvent) => {
            const rect = canvas.getBoundingClientRect();
            pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            pointer.y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
            if (!dragging) return;
            const dx = e.clientX - last.x;
            const dy = e.clientY - last.y;
            last = { x: e.clientX, y: e.clientY };
            vel.y = dx * 0.006;
            vel.x = dy * 0.0022;
            spin.y += vel.y;
            spin.x += vel.x;
        };

        const onUp = (e: PointerEvent) => {
            dragging = false;
            if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
        };

        const onLeave = () => { pointer.x = 0; pointer.y = 0; };

        // Same 360° available without a pointer.
        const onKey = (e: KeyboardEvent) => {
            const step = 0.16;
            if (e.key === 'ArrowLeft') { vel.y = -step; markEngaged(); }
            else if (e.key === 'ArrowRight') { vel.y = step; markEngaged(); }
            else if (e.key === 'ArrowUp') { vel.x = -step * 0.25; markEngaged(); }
            else if (e.key === 'ArrowDown') { vel.x = step * 0.25; markEngaged(); }
            else return;
            e.preventDefault();
        };

        canvas.addEventListener('pointerdown', onDown);
        canvas.addEventListener('pointermove', onMove);
        canvas.addEventListener('pointerup', onUp);
        canvas.addEventListener('pointercancel', onUp);
        canvas.addEventListener('pointerleave', onLeave);
        mount.addEventListener('keydown', onKey);

        // --- render loop -------------------------------------------------------
        let visible = true;
        const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { threshold: 0 });
        io.observe(mount);

        const clock = new THREE.Clock();
        let frame = 0;

        const animate = () => {
            frame = requestAnimationFrame(animate);
            // Scrolled past, or the tab is in the background: keep the loop alive but do no work.
            if (!visible || document.hidden) return;

            const t = clock.getElapsedTime();

            if (!dragging) {
                spin.y += vel.y;
                spin.x += vel.x;
                vel.y *= 0.95;
                vel.x *= 0.95;
                if (!calm) spin.y += 0.0016;   // idle turn, so it reads as alive before it is touched
            }
            // A little tilt to look around her, but never far enough to lay her over.
            spin.x = Math.max(-0.32, Math.min(0.32, spin.x));
            core.rotation.y = spin.y;
            core.rotation.x = spin.x;

            if (!calm) {
                cage.rotation.y = -spin.y * 1.9;
                cage.rotation.x = t * 0.05;
                // The haloes wobble on their tilt instead of spinning: a circle turning about
                // its own axis is invisible, a circle rocking on it is not.
                rings.forEach((ring, i) => {
                    ring.rotation.x = Math.PI / 2 + RING_SPECS[i].tilt + Math.sin(t * 0.4 + i * 1.7) * 0.09;
                });
                dust.rotation.y = t * 0.018;
                dust.rotation.x = Math.sin(t * 0.1) * 0.05;
                // Two out-of-phase sines so the torch never settles into an obvious pulse, and
                // the core runs on a third so the two layers never breathe together.
                const flicker = 1 + Math.sin(t * 7.3) * 0.07 + Math.sin(t * 3.1) * 0.05;
                liberty.flameLight.intensity = 14 * flicker;
                liberty.flame.scale.set(1, flicker, 1);
                liberty.flameCore.scale.setScalar(1 + Math.sin(t * 5.2 + 1.1) * 0.09);
            }

            // The core sinks and pulls back as the hero leaves, handing the stage to the page.
            const progress = Math.min(1, window.scrollY / (window.innerHeight || 1));
            const targetZ = baseZ * (1 + progress * 0.45);
            const targetY = -progress * 1.4;

            camera.position.x += (pointer.x * 1.0 - camera.position.x) * 0.05;
            camera.position.y += (-pointer.y * 0.7 - camera.position.y) * 0.05;
            camera.position.z += (targetZ - camera.position.z) * 0.08;
            core.position.y += (targetY - core.position.y) * 0.08;
            camera.lookAt(0, core.position.y * 0.5 - 0.22, 0);

            renderer.render(scene, camera);
        };
        animate();

        const resize = () => {
            camera.aspect = width() / height();
            camera.updateProjectionMatrix();
            baseZ = fitDistance();
            renderer.setSize(width(), height());
        };
        const ro = new ResizeObserver(resize);
        ro.observe(mount);

        return () => {
            cancelAnimationFrame(frame);
            io.disconnect();
            ro.disconnect();
            canvas.removeEventListener('pointerdown', onDown);
            canvas.removeEventListener('pointermove', onMove);
            canvas.removeEventListener('pointerup', onUp);
            canvas.removeEventListener('pointercancel', onUp);
            canvas.removeEventListener('pointerleave', onLeave);
            mount.removeEventListener('keydown', onKey);
            if (canvas.parentNode === mount) mount.removeChild(canvas);
            liberty.geometries.forEach(g => g.dispose());
            liberty.materials.forEach(m => m.dispose());
            cageBase.dispose(); cageGeo.dispose(); cageMat.dispose();
            ringGeos.forEach(g => g.dispose());
            ringMats.forEach(m => m.dispose());
            dustGeo.dispose(); dustMat.dispose();
            envRT.dispose();
            renderer.dispose();
        };
    }, [isDark]);

    if (failed) return null;

    return (
        <div className="relative w-full h-[320px] sm:h-[420px] lg:h-[580px]">
            {/* Bloom behind the canvas: the glow has to live in the DOM because the scene
                deliberately runs without post-processing. */}
            <div
                className="absolute inset-[12%] rounded-full bg-brand-purple/25 dark:bg-brand-purple/35 blur-[70px] animate-orbit-pulse pointer-events-none"
                aria-hidden="true"
            />
            <div
                ref={mountRef}
                tabIndex={0}
                role="img"
                aria-label="Interactive 3D model of the Statue of Liberty. Drag it, or focus it and use the arrow keys, to turn her around."
                className="absolute inset-0 grab outline-none rounded-3xl focus-visible:ring-2 focus-visible:ring-brand-purple focus-visible:ring-offset-4 focus-visible:ring-offset-transparent"
            />
            <div
                className={`absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-full panel text-[11px] font-bold uppercase tracking-[0.18em] text-brand-black/60 dark:text-white/60 transition-all duration-700 pointer-events-none ${
                    engaged ? 'opacity-0 translate-y-2' : 'opacity-100'
                }`}
                aria-hidden="true"
            >
                <i className="fas fa-arrows-left-right"></i>
                Drag to spin
            </div>
        </div>
    );
};

const HeroSection: React.FC<{ onSubmit: (msg: string) => void }> = ({ onSubmit }) => {
    const [inputValue, setInputValue] = useState('');
    const [placeholderText, setPlaceholderText] = useState('What do you want to build or automate?');

    useEffect(() => {
        const updatePlaceholder = () => {
            if (window.innerWidth < 768) {
                setPlaceholderText('What do you want to build?');
            } else {
                setPlaceholderText('What do you want to build or automate?');
            }
        };

        updatePlaceholder();
        window.addEventListener('resize', updatePlaceholder);
        return () => window.removeEventListener('resize', updatePlaceholder);
    }, []);

    const handleSubmit = () => {
        if (inputValue.trim()) {
            onSubmit(inputValue);
            setInputValue('');
        }
    };

    return (
        <section className="relative w-full px-6 pt-32 pb-16 md:pt-40 md:pb-24 stage">
            <div className="container mx-auto max-w-7xl grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] gap-10 lg:gap-8 items-center">

                {/* Copy sits in front of the core on the z-axis, not beside it — on small screens
                    the model is above the text, on wide screens they share the stage. */}
                <div className="relative z-10 order-2 lg:order-1 text-center lg:text-left">
                    {/* Nineteen years of shipping is the strongest thing we can say before the
                        headline, so it goes above it rather than buried further down. */}
                    <div className="chip mb-5 flex items-center gap-3 justify-center lg:justify-start" data-hero-sub>
                        <span>Est. 2007</span>
                        <span className="w-8 h-px bg-current opacity-40" aria-hidden="true" />
                        <span>New York City</span>
                    </div>
                    {/* Each line stays `block` at every breakpoint so "Human-Engineered." is always on
                        its own row, and nowrap keeps it there in one piece: the entrance animation
                        splits these into per-character inline-block spans, which the browser would
                        otherwise treat as break opportunities and wrap mid-word. */}
                    {/* Sized so the longest nowrap line clears its column at every width: viewport-relative
                        below lg, then fixed to the text column once the model sits beside it. */}
                    <h1 className="display font-black text-[min(2.6rem,8.2vw)] sm:text-[min(3.7rem,8.2vw)] lg:text-[3.05rem] xl:text-[3.9rem] mb-6 dark:text-white">
                        <span className="block whitespace-nowrap" data-hero-word="AI-Powered.">AI-Powered. </span>
                        <span className="block whitespace-nowrap text-brand-purple dark:text-brand-yellow" data-hero-word="Human-Engineered.">Human-Engineered.</span>
                    </h1>

                    {/* The hero previously jumped straight from the headline to an input box, so a first-time
                        visitor never learned what we actually do. This one sentence is the fix. */}
                    <p className="max-w-2xl mx-auto lg:mx-0 text-lg md:text-xl text-brand-black/65 dark:text-gray-300 leading-relaxed" data-hero-sub>
                        We build automations, AI agents, and custom software for businesses in New York and beyond — connected to the tools your team already uses.
                    </p>

                    <div className="mt-10 max-w-2xl mx-auto lg:mx-0 w-full" data-hero-sub>
                        <label htmlFor="hero-project" className="chip block mb-3">
                            Start a project
                        </label>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1 group">
                                <input
                                    id="hero-project"
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                                    placeholder={placeholderText}
                                    className="panel w-full py-4 px-5 text-base md:text-lg bg-[var(--panel-solid)] dark:bg-white/[0.04] text-brand-black dark:text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-purple/60 placeholder:text-brand-black/40 dark:placeholder:text-white/40 transition-shadow duration-300"
                                />
                            </div>
                            <button
                                onClick={handleSubmit}
                                className="shrink-0 px-8 py-4 rounded-2xl font-bold text-lg text-white bg-brand-purple shadow-[0_16px_40px_-16px_rgba(95,46,234,1)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_26px_54px_-18px_rgba(95,46,234,1)] active:translate-y-0"
                            >
                                Let's Talk
                            </button>
                        </div>
                        <p className="mt-4 text-sm text-brand-black/50 dark:text-gray-400">
                            Prefer to browse first? <RouteLink to="/services" className="underline underline-offset-4 font-semibold hover:text-brand-purple dark:hover:text-brand-yellow">See what we do</RouteLink>.
                        </p>
                    </div>
                </div>

                <div className="order-1 lg:order-2 relative">
                    <HeroCore />
                </div>
            </div>
        </section>
    );
};

const ServicesSection: React.FC<{ onServiceClick: (service: any) => void }> = ({ onServiceClick }) => (
    <section id="services" className="relative pt-44 pb-20 px-6 stage">
        <div className="container mx-auto max-w-5xl">
            <SectionHead
                label="What we do"
                title="Our Services"
                blurb="Your one-stop-shop for everything AI & software. We concept, build, and scale your vision."
            />
            <div className="flex flex-col gap-5">
                {servicesData.map((service, index) => (
                    <ServiceRow key={index} service={service} index={index} onClick={() => onServiceClick(service)} />
                ))}
            </div>
        </div>
    </section>
);

const ServiceRow: React.FC<{ service: any; index: number; onClick: () => void }> = ({ service, index, onClick }) => {
    const tilt = useTilt<HTMLElement>(6);
    return (
        <article
            {...tilt}
            data-depth-in
            className="tilt panel sheen lift group p-6 md:p-7 flex items-center gap-6 cursor-pointer"
            onClick={onClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onClick()}
            aria-label={`Learn more about ${service.title}`}
        >
            {/* The plate floats off the panel surface; its glow stays behind on the surface,
                which is what makes the gap between them readable. */}
            <div className="relative flex-shrink-0" style={{ transformStyle: 'preserve-3d' }}>
                <div className={`absolute inset-0 ${service.color} rounded-2xl blur-xl opacity-40 group-hover:opacity-70 transition-opacity duration-500`} aria-hidden="true" />
                <div className={`pop-2 relative w-16 h-16 ${service.color} rounded-2xl flex items-center justify-center text-white text-3xl shadow-[0_12px_28px_-10px_rgba(20,18,40,.7)] transition-transform duration-500 group-hover:scale-105`}>
                    <i className={service.graphic}></i>
                </div>
            </div>
            <div className="flex-grow" style={{ transformStyle: 'preserve-3d' }}>
                <div className="pop-1">
                    <div className="chip mb-1">{String(index + 1).padStart(2, '0')}</div>
                    <h3 className="text-2xl md:text-3xl font-bold dark:text-white">{service.title}</h3>
                    <p className="mt-1 text-brand-black/60 dark:text-gray-400">{service.description}</p>
                </div>
            </div>
            <div className="pop-1 text-2xl text-brand-black/35 dark:text-white/35 group-hover:text-brand-purple dark:group-hover:text-brand-yellow transition-all duration-300 group-hover:translate-x-1">
                <i className="fas fa-arrow-right"></i>
            </div>
        </article>
    );
};

/* ------------------------------------------------------------------ *
 *  Product showcase
 *
 *  The centrepiece of the site: a ring of cards seen in perspective, each one an
 *  app window carrying the whole product — chrome bar with its real domain, icon,
 *  name, what it is, and the platforms it actually ships on. Drag, swipe, click a
 *  neighbour, use the arrow keys or the rail to bring another forward; left alone
 *  it advances itself until you take over. The section takes its colour from
 *  whichever product is in front.
 *
 *  Every card stays in the DOM and only ever loses opacity, so all eight products
 *  are still there for search and for screen readers.
 * ------------------------------------------------------------------ */

// The data carries Tailwind classes; the colour fields and the chrome need the raw value,
// so keep one lookup rather than scattering hexes through the markup.
const ACCENT_HEX: Record<string, string> = {
    'text-brand-purple': '#5F2EEA',
    'text-brand-lime': '#A3F953',
    'text-brand-yellow': '#F5D324',
    'text-brand-red': '#FF4B4B',
    'text-brand-pink': '#FCE7F3',
};

const LINK_META: Record<string, { icon: string; label: string; short: string }> = {
    website: { icon: 'fas fa-globe', label: 'Visit Website', short: 'Website' },
    webApp: { icon: 'fas fa-laptop', label: 'Open Web App', short: 'Web App' },
    ios: { icon: 'fab fa-app-store-ios', label: 'Download on iOS', short: 'iOS' },
    android: { icon: 'fab fa-google-play', label: 'Download on Android', short: 'Android' },
};

// The address in each card's chrome bar is the product's own domain, pulled off the link
// we already publish — nothing invented, and it does more to make a card feel like a real
// piece of software than any amount of decoration.
const hostOf = (url?: string) => {
    if (!url) return null;
    try {
        return new URL(url).hostname.replace(/^www\./, '');
    } catch {
        return null;
    }
};

const ProductShowcase: React.FC<{ level?: 1 | 2 }> = ({ level = 1 }) => {
    const count = productsData.length;
    const [active, setActive] = useState(0);
    const [manual, setManual] = useState(false);   // a visitor took the wheel: stop advancing
    const [paused, setPaused] = useState(false);   // pointer is resting on the section
    const drag = useRef({ x: 0, y: 0, down: false, moved: false });

    const product = productsData[active];
    const accent = ACCENT_HEX[product.accent] ?? '#5F2EEA';

    const go = (dir: number) => { setManual(true); setActive(a => (a + dir + count) % count); };
    const jump = (index: number) => { setManual(true); setActive(index); };

    // It advances on its own so the section is alive on arrival — then gets out of the way
    // permanently the moment someone steers it, rather than yanking the card they chose.
    useEffect(() => {
        if (manual || paused || reducedMotion()) return;
        const id = window.setInterval(() => setActive(a => (a + 1) % count), 6500);
        return () => window.clearInterval(id);
    }, [manual, paused, count]);

    const openProduct = (item: any) => {
        const firstLink = item.links && (Object.values(item.links)[0] as string);
        if (firstLink) window.open(firstLink, '_blank', 'noopener,noreferrer');
    };

    const onPointerDown = (e: React.PointerEvent) => {
        drag.current = { x: e.clientX, y: e.clientY, down: true, moved: false };
    };
    const onPointerMove = (e: React.PointerEvent) => {
        if (drag.current.down && Math.abs(e.clientX - drag.current.x) > 8) drag.current.moved = true;
    };
    const onPointerUp = (e: React.PointerEvent) => {
        if (!drag.current.down) return;
        const dx = e.clientX - drag.current.x;
        const dy = e.clientY - drag.current.y;
        drag.current.down = false;
        // Ignore anything that was mostly a vertical scroll gesture.
        if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
    };

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowLeft') { go(-1); e.preventDefault(); }
        else if (e.key === 'ArrowRight') { go(1); e.preventDefault(); }
    };

    return (
        <section
            id="products"
            className={`relative overflow-hidden bg-[#06060e] text-white ${
                // On the home page it rises over the hero, so give it shoulders. As its own
                // page it starts under the header and square is right.
                level === 2 ? 'rounded-t-[2rem] md:rounded-t-[3rem]' : ''
            }`}
            onPointerEnter={() => setPaused(true)}
            onPointerLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
        >
            {/* Purple is the brand everywhere else on the site, so it stays the ground here too
                and does not move. Letting each product repaint the whole section in its own
                accent inverted that hierarchy — a lime product turned the entire viewport green
                every 6.5 seconds. */}
            <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none"
                style={{
                    background:
                        'radial-gradient(65vw 55vh at 50% 24%, #5F2EEA2e, transparent 64%),' +
                        'radial-gradient(50vw 45vh at 8% 96%, #5F2EEA1a, transparent 62%)',
                }}
            />

            {/* The active product only tints that ground — a low, low inflection near the deck,
                cross-faded. Gradients cannot be interpolated, so the transition has to be
                opacity between stacked layers. */}
            {productsData.map((item, index) => {
                const hex = ACCENT_HEX[item.accent] ?? '#5F2EEA';
                return (
                    <div
                        key={item.title}
                        aria-hidden="true"
                        className="absolute inset-0 transition-opacity duration-[1200ms] ease-out pointer-events-none"
                        style={{
                            opacity: index === active ? 1 : 0,
                            background: `radial-gradient(42vw 34vh at 50% 68%, ${hex}16, transparent 62%)`,
                        }}
                    />
                );
            })}

            <div className="relative z-10 container mx-auto max-w-7xl px-6 pt-36 pb-24 md:pt-40">
                <SectionHead
                    level={level}
                    light
                    label="Shipped work"
                    title="Our Products"
                    blurb="A showcase of excellence. We build scalable, agentic, and beautiful software that powers businesses."
                />

                <div className="relative" data-depth-in>
                    {/* Pool of light on the floor, so the cards stand on something. */}
                    <div
                        className="absolute left-1/2 -translate-x-1/2 bottom-0 w-[60%] h-20 rounded-[50%] blur-3xl transition-colors duration-700 pointer-events-none"
                        style={{ background: `${accent}2b` }}
                        aria-hidden="true"
                    />

                    <div
                        className="deck relative h-[490px] sm:h-[470px] grab select-none"
                        onPointerDown={onPointerDown}
                        onPointerMove={onPointerMove}
                        onPointerUp={onPointerUp}
                        onPointerCancel={() => { drag.current.down = false; }}
                        onKeyDown={onKeyDown}
                        tabIndex={0}
                        role="group"
                        aria-roledescription="carousel"
                        aria-label="Product showcase. Use the left and right arrow keys to move through the products."
                    >
                        {productsData.map((item, index) => {
                            // Shortest way round the ring, so card 0 sits next to card 7.
                            let offset = index - active;
                            if (offset > count / 2) offset -= count;
                            if (offset < -count / 2) offset += count;
                            const depth = Math.abs(offset);
                            const isActive = depth === 0;
                            const buried = depth > 2;
                            const hex = ACCENT_HEX[item.accent] ?? '#5F2EEA';
                            const entries = Object.entries(item.links ?? {});
                            // Prefer the product's own domain over a store listing: NOTIFY's first
                            // link is the App Store, and "apps.apple.com" says nothing about NOTIFY.
                            const host = hostOf((item.links?.website ?? item.links?.webApp ?? entries[0]?.[1]) as string);

                            return (
                                <article
                                    key={item.title}
                                    aria-hidden={buried}
                                    onClick={() => {
                                        if (drag.current.moved) return;   // a drag is not a click
                                        if (!isActive) jump(index);
                                    }}
                                    className={`deck-card w-[min(88vw,400px)] h-full ${isActive ? '' : 'cursor-pointer'}`}
                                    style={{
                                        transform: `translate3d(calc(-50% + ${offset * 70}%), 0, ${-depth * 320}px) rotateY(${offset * -33}deg)`,
                                        opacity: buried ? 0 : 1 - depth * 0.3,
                                        filter: depth ? `blur(${Math.min(depth * 2.4, 5)}px)` : 'none',
                                        zIndex: 40 - depth,
                                        pointerEvents: buried ? 'none' : 'auto',
                                    }}
                                >
                                    <div
                                        className={`relative h-full w-full rounded-2xl flex flex-col overflow-hidden border transition-colors duration-500 ${
                                            isActive ? 'border-white/25' : 'border-white/10'
                                        }`}
                                        style={{
                                            // Opaque enough that the cards stacked behind it in z do not
                                            // print through the copy — glass here costs legibility.
                                            background: 'rgba(13,13,24,0.95)',
                                            boxShadow: isActive ? `0 50px 90px -50px ${hex}, 0 30px 60px -38px #000` : 'none',
                                        }}
                                    >
                                        {/* Window chrome. The address is the product's own. */}
                                        <div
                                            className="flex items-center gap-2 px-4 h-11 border-b border-white/10 flex-shrink-0"
                                            style={{ background: `linear-gradient(90deg, ${hex}1f, transparent)` }}
                                        >
                                            <span className="flex gap-1.5" aria-hidden="true">
                                                {[0.9, 0.55, 0.3].map(o => (
                                                    <span
                                                        key={o}
                                                        className="w-2.5 h-2.5 rounded-full"
                                                        style={{ background: hex, opacity: isActive ? o : o * 0.4 }}
                                                    />
                                                ))}
                                            </span>
                                            {host && (
                                                <span className="ml-2 flex-1 truncate rounded-md bg-black/40 border border-white/10 px-3 py-1 text-[11px] font-mono text-white/45">
                                                    {host}
                                                </span>
                                            )}
                                            <span className="text-[11px] font-mono text-white/25 tabular-nums">
                                                {String(index + 1).padStart(2, '0')}
                                            </span>
                                        </div>

                                        <div className="flex flex-col flex-grow p-7">
                                            <div className="relative w-14 h-14 mb-6">
                                                <div className={`absolute inset-0 rounded-2xl blur-lg ${item.accent.replace('text-', 'bg-')} opacity-50`} aria-hidden="true" />
                                                <div className={`relative w-14 h-14 rounded-2xl bg-black/50 border border-white/15 flex items-center justify-center text-2xl ${item.accent}`}>
                                                    <i className={item.icon}></i>
                                                </div>
                                            </div>

                                            <h4 className="text-3xl font-black uppercase tracking-tight leading-none mb-2">{item.title}</h4>
                                            <p className={`text-[11px] font-mono font-bold uppercase tracking-[0.2em] mb-5 ${item.accent}`}>
                                                {item.subtitle}
                                            </p>
                                            <p className="text-white/60 leading-relaxed text-[15px]">{item.description}</p>

                                            {/* Where it actually ships. Live links on the card in front, inert behind it. */}
                                            {entries.length > 0 && (
                                                <div className="mt-auto pt-6 flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
                                                    {entries.map(([key, url]) => {
                                                        const meta = LINK_META[key];
                                                        if (!meta) return null;
                                                        return (
                                                            <a
                                                                key={key}
                                                                href={url as string}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                aria-label={`${item.title} - ${meta.label}`}
                                                                tabIndex={isActive ? 0 : -1}
                                                                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3.5 py-2 text-xs font-bold text-white/70 hover:text-white hover:border-white/40 hover:bg-white/5 transition-colors"
                                                            >
                                                                <i className={meta.icon}></i>
                                                                {meta.short}
                                                            </a>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Light along the bottom edge, as if the window were lit from below. */}
                                        <span
                                            className="absolute inset-x-10 bottom-0 h-px"
                                            style={{ background: `linear-gradient(90deg, transparent, ${hex}, transparent)`, opacity: isActive ? 0.9 : 0.25 }}
                                            aria-hidden="true"
                                        />
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </div>

                {/* Controls sit outside the perspective container so they stay flat and hittable. */}
                <div className="flex items-center justify-center gap-5 mt-12">
                    <button
                        onClick={() => go(-1)}
                        aria-label="Previous product"
                        className="w-12 h-12 rounded-full border border-white/20 text-white/70 hover:text-white hover:border-white/50 hover:-translate-x-0.5 transition-all duration-300 flex items-center justify-center flex-shrink-0"
                    >
                        <i className="fas fa-arrow-left"></i>
                    </button>

                    <div className="flex items-center gap-1.5">
                        {productsData.map((item, index) => (
                            <button
                                key={item.title}
                                aria-current={index === active}
                                aria-label={item.title}
                                onClick={() => jump(index)}
                                className="h-[3px] rounded-full transition-all duration-500"
                                style={{
                                    width: index === active ? 40 : 16,
                                    background: index === active ? accent : 'rgba(255,255,255,0.22)',
                                }}
                            />
                        ))}
                    </div>

                    <button
                        onClick={() => go(1)}
                        aria-label="Next product"
                        className="w-12 h-12 rounded-full border border-white/20 text-white/70 hover:text-white hover:border-white/50 hover:translate-x-0.5 transition-all duration-300 flex items-center justify-center flex-shrink-0"
                    >
                        <i className="fas fa-arrow-right"></i>
                    </button>
                </div>

                <p className="text-center mt-5 chip text-white/40" aria-live="polite">
                    {String(active + 1).padStart(2, '0')} / {String(count).padStart(2, '0')} — {product.title}
                </p>
            </div>
        </section>
    );
};

/* ------------------------------------------------------------------ *
 *  Credentials
 *
 *  Victor's copy, verbatim. The track record is laid out as a spec sheet rather
 *  than a pitch — eight figures in a hairline grid — because the numbers are the
 *  argument here and a table is how engineers present numbers.
 *
 *  Two of the eight are computed rather than typed: the years since founding and
 *  the count of our own products. Those are the two that go stale, and computing
 *  them means the page can never contradict itself. The rest are Victor's
 *  figures for the business.
 * ------------------------------------------------------------------ */
const FOUNDED = 2007;

const EngineeringSection: React.FC = () => {
    const stats = [
        { value: String(FOUNDED), label: 'Founded in New York City' },
        { value: `${new Date().getFullYear() - FOUNDED}+`, unit: 'years', label: 'Building and supporting production software' },
        { value: '500+', label: 'Websites launched' },
        { value: '100+', label: 'Web applications built' },
        { value: '60+', label: 'Mobile apps shipped' },
        { value: String(productsData.length), label: 'Products of our own in the wild' },
        { value: '3M+', label: 'Active users across our apps' },
        { value: '20+', label: 'Industries served' },
    ];

    return (
        <section className="relative py-24 md:py-28 px-6 stage">
            <div className="container mx-auto max-w-6xl">
                <div className="grid lg:grid-cols-[1.12fr_0.88fr] gap-12 lg:gap-14 items-start">

                    <div data-depth-in>
                        <div className="chip mb-5">Since 2007</div>
                        <h2 className="display font-black text-4xl md:text-5xl xl:text-[3.4rem] mb-7 text-brand-black dark:text-white">
                            Let’s build something people love to use.
                        </h2>
                        <div className="space-y-5 text-lg leading-relaxed text-brand-black/65 dark:text-gray-300">
                            <p>
                                Since 2007, Geeking Out has helped businesses turn ambitious ideas into
                                reliable, scalable digital products.
                            </p>
                            <p>
                                Our in-house team brings strategy, design, engineering, data, and AI together
                                under one roof. Whether you need a high-performing website, a secure web
                                platform, a mobile app, or intelligent agents that streamline your operations,
                                you’ll work directly with the people building it.
                            </p>
                            <p>
                                From the first idea to launch—and every improvement that follows—we’re here to
                                help you move faster, reduce complexity, and create technology that delivers
                                real results.
                            </p>
                        </div>

                        {/* One button and two links, not three buttons: the copy separates these
                            with a "·", and only the first is the action worth shouting. Three
                            equal buttons also overflowed the column at lg. */}
                        <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
                            <RouteLink
                                to="/contact"
                                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl font-bold text-white bg-brand-purple shadow-[0_14px_36px_-16px_rgba(95,46,234,1)] hover:-translate-y-0.5 transition-transform"
                            >
                                Start a conversation
                                <i className="fas fa-arrow-right text-sm"></i>
                            </RouteLink>
                            <span className="flex items-center gap-3 font-semibold text-brand-black/70 dark:text-gray-300">
                                <RouteLink to="/products" className="underline underline-offset-4 decoration-brand-black/20 dark:decoration-white/25 hover:text-brand-purple dark:hover:text-brand-yellow hover:decoration-current transition-colors">
                                    See what we’ve built
                                </RouteLink>
                                <span className="opacity-35" aria-hidden="true">·</span>
                                <RouteLink to="/process" className="underline underline-offset-4 decoration-brand-black/20 dark:decoration-white/25 hover:text-brand-purple dark:hover:text-brand-yellow hover:decoration-current transition-colors">
                                    How we work
                                </RouteLink>
                            </span>
                        </div>
                    </div>

                    {/* Hairline grid: a one-pixel gap over a rule-coloured backing, with each cell
                        painted opaque. Cheaper and crisper than eight bordered boxes. */}
                    <div data-depth-in>
                        <div className="rounded-3xl overflow-hidden border border-[var(--hair)] shadow-[var(--amb)]">
                            <div className="grid grid-cols-2 gap-px bg-[var(--hair)]">
                                {stats.map(stat => (
                                    <div key={stat.label} className="bg-[var(--panel-solid)] p-5 md:p-6">
                                        <div className="display font-black text-3xl md:text-4xl text-brand-purple dark:text-brand-yellow leading-none mb-2.5">
                                            {stat.value}
                                            {stat.unit && (
                                                <span className="text-lg md:text-xl ml-1.5 tracking-normal">{stat.unit}</span>
                                            )}
                                        </div>
                                        <div className="text-sm leading-snug text-brand-black/60 dark:text-gray-400">
                                            {stat.label}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
};

const PhilosophySection: React.FC = () => (
    <section id="philosophy" className="relative pt-44 pb-20 px-6 stage">
        <div className="container mx-auto max-w-6xl">
            <SectionHead label="How we think" title="Our Philosophy" />
            <div className="grid md:grid-cols-3 gap-6">
                {philosophyData.map((item, index) => (
                    <PhilosophyCard key={index} item={item} />
                ))}
            </div>
        </div>
    </section>
);

const PhilosophyCard: React.FC<{ item: any }> = ({ item }) => {
    const tilt = useTilt<HTMLDivElement>(8);
    return (
        <div {...tilt} data-depth-in className="tilt panel sheen lift group p-8 pt-14 relative">
            {/* The numeral is a background plane, the icon a foreground one; the copy sits
                between them. Three planes is enough to feel like a stack. */}
            <span
                className="absolute top-2 right-5 font-black text-7xl text-brand-black/[0.06] dark:text-white/[0.07] select-none"
                aria-hidden="true"
                style={{ transform: 'translateZ(-20px)' }}
            >
                {item.number}
            </span>
            <div className="relative mb-6 w-16 h-16" style={{ transformStyle: 'preserve-3d' }}>
                <div className="absolute inset-0 rounded-2xl bg-brand-purple blur-xl opacity-40 group-hover:opacity-70 transition-opacity duration-500" aria-hidden="true" />
                <div className="pop-2 relative w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-purple to-[#8B5CF6] text-white flex items-center justify-center shadow-[0_14px_30px_-12px_rgba(95,46,234,.95)]">
                    <i className={`${item.icon} text-2xl`}></i>
                </div>
            </div>
            <div className="pop-1">
                <h3 className="text-2xl font-bold dark:text-white mb-2">{item.title}</h3>
                <p className="text-brand-black/60 dark:text-gray-400 leading-relaxed">{item.description}</p>
            </div>
        </div>
    );
};

const TeamSection: React.FC = () => (
    <section id="team" className="relative pt-44 pb-20 px-6 stage">
        <div className="container mx-auto max-w-7xl">
            <SectionHead
                label="Who you work with"
                title="Our Team"
                blurb="Friendly faces, expert minds. We're easy to work with."
            />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 md:gap-8">
                {teamData.map((member, index) => (
                    <TeamCard key={index} member={member} />
                ))}
            </div>
        </div>
    </section>
);

const TeamCard: React.FC<{ member: any }> = ({ member }) => {
    const tilt = useTilt<HTMLDivElement>(12);
    return (
        <div {...tilt} data-depth-in className="tilt panel sheen lift group p-6 flex flex-col items-center text-center">
            <div className="relative mb-5" style={{ transformStyle: 'preserve-3d' }}>
                <div className={`absolute inset-0 rounded-full ${member.color} blur-2xl opacity-45 group-hover:opacity-80 transition-opacity duration-500`} aria-hidden="true" />
                <div className={`pop-3 relative w-24 h-24 md:w-28 md:h-28 rounded-full ${member.color} flex items-center justify-center shadow-[0_18px_40px_-16px_rgba(20,18,40,.85)] transition-transform duration-500 group-hover:scale-105`}>
                    <i className={`${member.icon} text-4xl md:text-5xl ${member.text}`}></i>
                </div>
            </div>

            <div className="pop-1">
                <h3 className="text-xl font-black text-brand-black dark:text-white mb-1">{member.name}</h3>
                <p className="chip mb-3">{member.role}</p>

                {member.linkedin && (
                    <a
                        href={typeof member.linkedin === 'string' ? member.linkedin : "#"}
                        target={typeof member.linkedin === 'string' ? "_blank" : ""}
                        rel="noopener noreferrer"
                        aria-label={`${member.name}'s LinkedIn Profile`}
                        className="inline-block text-brand-purple dark:text-brand-yellow text-2xl hover:scale-125 transition-transform"
                    >
                        <i className="fab fa-linkedin"></i>
                    </a>
                )}
            </div>
        </div>
    );
};

const ProcessSection: React.FC = () => (
    <section id="process" className="relative pt-44 pb-20 px-6 stage">
        <div className="container mx-auto max-w-4xl">
            <SectionHead label="How it runs" title="Our Process" />
            <div className="relative pl-8 md:pl-12">
                {/* Spine. The lit half is scaled from 0 to 1 by ScrollTrigger, so the line
                    draws itself at exactly the rate you scroll. */}
                <div className="absolute left-2 md:left-4 top-2 bottom-2 w-px bg-[var(--hair)]" aria-hidden="true">
                    <div
                        data-process-line
                        className="absolute inset-x-0 top-0 h-full origin-top bg-gradient-to-b from-brand-purple via-brand-lime to-brand-yellow"
                    />
                </div>

                <div className="flex flex-col gap-14">
                    {processData.map((phaseData, index) => (
                        <div key={index}>
                            <div className="relative mb-8" data-depth-in>
                                <span
                                    className="absolute -left-[26px] md:-left-[38px] top-2 w-4 h-4 rounded-full bg-brand-purple shadow-[0_0_0_5px_var(--bg-0),0_0_22px_4px_rgba(95,46,234,.6)]"
                                    aria-hidden="true"
                                />
                                <div className="chip mb-2">Phase {index === 0 ? 'A' : 'B'}</div>
                                <h3 className="text-2xl md:text-3xl font-bold dark:text-white">{phaseData.phase}</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {phaseData.steps.map((step, stepIndex) => (
                                    <div
                                        key={stepIndex}
                                        data-depth-in
                                        className="panel lift flex items-center gap-4 p-4 rounded-2xl group"
                                    >
                                        <div className="w-11 h-11 rounded-xl bg-brand-lime/90 flex-shrink-0 flex items-center justify-center shadow-[0_10px_22px_-10px_rgba(163,249,83,.9)] transition-transform duration-500 group-hover:scale-110">
                                            <i className={`${step.icon} text-lg text-brand-black`}></i>
                                        </div>
                                        <span className="font-semibold dark:text-white">{step.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </section>
);

const FaqItem: React.FC<{ faq: { question: string, answer: string }, isOpen: boolean, onToggle: () => void }> = ({ faq, isOpen, onToggle }) => {
    const answerRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (answerRef.current) {
            answerRef.current.style.maxHeight = isOpen ? `${answerRef.current.scrollHeight}px` : '0px';
        }
    }, [isOpen]);

    return (
        <div className="border-b border-white/10 last:border-b-0 py-5 cursor-pointer group" onClick={onToggle} aria-expanded={isOpen}>
            <div className="flex justify-between items-center gap-4">
                <h3 className={`text-lg md:text-xl font-semibold transition-colors ${isOpen ? 'text-white' : 'text-white/75 group-hover:text-white'}`}>{faq.question}</h3>
                <div className="faq-icon text-xl text-brand-yellow flex-shrink-0" style={{ transform: isOpen ? 'rotate(45deg)' : 'rotate(0)' }}>
                   <i className="fas fa-plus"></i>
                </div>
            </div>
            <div ref={answerRef} className="faq-answer" aria-hidden={!isOpen}>
                <p className="pt-4 text-white/60 leading-relaxed max-w-3xl" dangerouslySetInnerHTML={{ __html: faq.answer }}></p>
            </div>
        </div>
    );
};

const FaqSection: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section id="faqs" className="relative pt-44 pb-20 px-6 overflow-hidden stage">
            <div className="absolute inset-0 bg-[#0a0a14] dark:bg-[#05050b]" aria-hidden="true" />
            <div
                className="absolute inset-0"
                aria-hidden="true"
                style={{ background: 'radial-gradient(60vw 50vh at 50% -10%, rgba(95,46,234,.4), transparent 65%)' }}
            />
            <div className="container mx-auto max-w-4xl relative z-10">
                <SectionHead label="Before you ask" title="Any Questions?" light />
                <div
                    data-depth-in
                    className="rounded-3xl border border-white/12 bg-white/[0.04] p-6 md:p-10 shadow-[0_50px_100px_-50px_rgba(0,0,0,1)]"
                    style={{ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
                >
                    {faqData.map((faq, index) => (
                        <FaqItem
                            key={index}
                            faq={faq}
                            isOpen={index === openIndex}
                            onToggle={() => setOpenIndex(openIndex === index ? null : index)}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

const TestimonialsSection: React.FC = () => {
    // Duplicated once so the -50% marquee loop lands seamlessly.
    const allTestimonials = [...testimonialsData, ...testimonialsData];

    return (
        <section className="relative py-24 overflow-hidden stage">
            <div className="container mx-auto max-w-7xl px-6">
                <SectionHead level={2} label="Receipts" title="What People Say" blurb="Don't just take our word for it." />
            </div>

            {/* The whole band is rotated on y, so cards farther along the belt are genuinely
                farther away. Hovering pauses it, since these are long quotes to read. */}
            <div
                className="flex overflow-hidden edge-fade py-6"
                style={{ perspective: '1400px' }}
            >
                <div
                    className="flex animate-infinite-scroll hover:[animation-play-state:paused] space-x-6 px-6 w-max"
                    style={{ transformStyle: 'preserve-3d' }}
                >
                    {allTestimonials.map((t, i) => (
                        <div
                            key={i}
                            className="w-[320px] md:w-[420px] flex-shrink-0 panel panel-solid p-6 flex flex-col"
                            style={{ transform: 'rotateY(-9deg)' }}
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className={`w-12 h-12 ${t.color} rounded-full flex items-center justify-center text-white font-bold text-xl shadow-[0_10px_24px_-10px_rgba(20,18,40,.8)] flex-shrink-0`}>
                                    {t.name.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm leading-tight dark:text-white">{t.name}</h4>
                                    <p className="text-xs text-brand-black/55 dark:text-gray-400 leading-tight mt-1 line-clamp-2">{t.role}</p>
                                </div>
                            </div>
                            <div className="relative flex-grow">
                                <i className="fas fa-quote-left text-brand-purple/20 dark:text-brand-purple/50 text-3xl absolute -top-1 -left-1" aria-hidden="true"></i>
                                <p className="text-sm relative z-10 pt-2 pl-2 italic font-medium text-brand-black/75 dark:text-gray-300 leading-relaxed">
                                    "{t.text}"
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const ContactCTA: React.FC = () => (
    <section id="contact" className="relative py-28 px-6 text-center stage overflow-hidden">
        <div className="container mx-auto max-w-3xl relative" data-depth-in>
            {/* A light source behind the copy rather than a panel around it — the section
                reads as an opening in the page instead of another card. */}
            <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] max-w-[120vw] rounded-full bg-brand-purple/25 dark:bg-brand-purple/35 blur-[90px] animate-orbit-pulse pointer-events-none"
                aria-hidden="true"
            />
            <div className="relative">
                <div className="chip mb-5">Next step</div>
                <h2 className="display font-black text-4xl md:text-6xl dark:text-white">Have a project in mind?</h2>
                <p className="mt-6 mb-9 text-lg text-brand-black/65 dark:text-gray-300 leading-relaxed">
                    Tell us what you’re working on. We’ll help you identify the smartest path
                    forward—whether you’re launching something new, modernizing an existing product, or
                    exploring what AI can do for your business.
                </p>
                <RouteLink
                    to="/contact"
                    className="inline-flex items-center gap-3 px-9 py-5 rounded-2xl font-bold text-lg md:text-xl text-white bg-brand-purple shadow-[0_20px_50px_-18px_rgba(95,46,234,1)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_32px_66px_-20px_rgba(95,46,234,1)] active:translate-y-0"
                >
                    Let’s talk about your project
                    <i className="fas fa-arrow-right text-base"></i>
                </RouteLink>
            </div>
        </div>
    </section>
);

/* ------------------------------------------------------------------ *
 *  Footer code field
 *
 *  Fragments of source drifting upward like a scrolling log, on three depth
 *  layers — smaller, dimmer and slower the further back they are. It replaces a
 *  field of abstract particles, which said nothing; this says the one thing the
 *  footer of an engineering shop should say.
 *
 *  Canvas 2D rather than WebGL: it is text, it is cheaper, and it means the page
 *  carries one GL context instead of two.
 * ------------------------------------------------------------------ */

// Deliberately generic — no third-party product is named, because I do not know which ones
// this team actually reaches for. The retrieval line is lifted from CAFECITO's own blurb.
const CODE_FRAGMENTS = [
    'const agent = await fleet.spawn({ tools })',
    'if (!ctx.canProve(claim)) return rederive(claim)',
    'export async function embed(docs: Doc[]) {',
    'await queue.drain({ concurrency: 8 })',
    'type Retrieval = { chunks: Chunk[]; score: number }',
    'router.post("/webhook", verifySignature, handler)',
    'SELECT id, updated_at FROM tenants WHERE active',
    'useEffect(() => subscribe(channel), [channel])',
    'return rows.map(toDomain).filter(Boolean)',
    'retry(fetchInvoice, { attempts: 3, backoff: "exp" })',
    'const [state, dispatch] = useReducer(reducer, init)',
    'async def rank(query: str) -> list[Hit]:',
    'guard let token = keychain.read(.session) else {',
    'for await (const event of stream) { yield parse(event) }',
    'git commit -m "ship it"',
    'assert response.status == 200',
];

const CODE_LAYERS = [
    { size: 10, alpha: 0.05, speed: 5 },
    { size: 12, alpha: 0.075, speed: 9 },
    { size: 13, alpha: 0.11, speed: 14 },
];

const FooterCodeField: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        const calm = reducedMotion();
        const parent = canvas.parentElement!;
        let width = 0;
        let height = 0;

        type Line = { text: string; x: number; y: number; layer: number };
        let lines: Line[] = [];

        const pick = <T,>(arr: readonly T[]) => arr[Math.floor(Math.random() * arr.length)];

        const populate = () => {
            // One line per ~34px of height, spread across three depths. Dense enough to read
            // as a wall of code, sparse enough that nothing collides into mush.
            const count = Math.max(12, Math.round((height / 34) * 1.5));
            lines = Array.from({ length: count }, () => ({
                text: pick(CODE_FRAGMENTS),
                x: Math.random() * (width + 260) - 200,
                y: Math.random() * height,
                layer: Math.floor(Math.random() * CODE_LAYERS.length),
            }));
        };

        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio, 2);
            width = parent.clientWidth || 1;
            height = parent.clientHeight || 1;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            populate();
        };

        const draw = () => {
            ctx.clearRect(0, 0, width, height);
            ctx.textBaseline = 'top';
            for (const line of lines) {
                const layer = CODE_LAYERS[line.layer];
                ctx.font = `${layer.size}px ui-monospace, SFMono-Regular, Menlo, monospace`;
                ctx.fillStyle = `rgba(163, 249, 83, ${layer.alpha})`;
                ctx.fillText(line.text, line.x, line.y);
            }
        };

        resize();
        draw();

        let frame = 0;
        let visible = true;
        const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { threshold: 0 });
        io.observe(parent);

        if (!calm) {
            let last = 0;
            const animate = (now: number) => {
                frame = requestAnimationFrame(animate);
                if (!visible || document.hidden) { last = now; return; }
                // Clamped so a backgrounded tab returning to focus does not teleport the field.
                const dt = Math.min((now - last) / 1000, 0.05);
                last = now;

                for (const line of lines) {
                    line.y -= CODE_LAYERS[line.layer].speed * dt;
                    if (line.y < -20) {
                        line.y = height + 20;
                        line.x = Math.random() * (width + 260) - 200;
                        line.text = pick(CODE_FRAGMENTS);
                    }
                }
                draw();
            };
            frame = requestAnimationFrame(animate);
        }

        const ro = new ResizeObserver(() => { resize(); draw(); });
        ro.observe(parent);

        return () => {
            cancelAnimationFrame(frame);
            io.disconnect();
            ro.disconnect();
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 z-0 pointer-events-none"
            aria-hidden="true"
            style={{
                // Half a pixel of blur keeps it reading as out-of-focus background rather than
                // as a second column of text competing with the footer copy.
                filter: 'blur(0.5px)',
                // Clear of the copy at the top and of the skyline at the bottom.
                WebkitMaskImage: 'linear-gradient(to bottom, transparent, #000 14%, #000 58%, transparent 88%)',
                maskImage: 'linear-gradient(to bottom, transparent, #000 14%, #000 58%, transparent 88%)',
            }}
        />
    );
};

/* ------------------------------------------------------------------ *
 *  Skyline
 *
 *  Drawn rather than randomised. The old version stacked bars of random height,
 *  which reads as a bar chart; a skyline is recognisable because of its tops —
 *  setbacks, spires, water towers, pitched roofs — and because a few buildings
 *  are ones you know. So three landmarks are authored by hand and the filler
 *  between them is generated from a fixed seed, giving the same silhouette on
 *  every render. Two layers at different depths, the far one paler and shorter.
 * ------------------------------------------------------------------ */

// Deterministic PRNG. A skyline that reshuffles on every re-render reads as a glitch.
const seededRandom = (seed: number) => () => {
    seed |= 0;
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

type Skyline = { silhouette: string; windows: string };

const drawSkyline = (seed: number, opts: { width: number; base: number; minH: number; maxH: number; detail: boolean }): Skyline => {
    const rand = seededRandom(seed);
    const box: string[] = [];
    const lights: string[] = [];
    const { width, base, minH, maxH, detail } = opts;

    const rect = (x: number, y: number, w: number, h: number) => box.push(`M${x} ${y}h${w}v${h}h${-w}z`);

    // Windows are punched in a loose grid and then thinned out, so the lit ones cluster the
    // way real ones do instead of forming a perfect lattice.
    const punchWindows = (x: number, top: number, w: number, h: number) => {
        if (!detail || w < 16) return;
        for (let wy = top + 8; wy < base - 8; wy += 11) {
            for (let wx = x + 5; wx < x + w - 6; wx += 9) {
                if (rand() > 0.62) lights.push(`M${wx} ${wy}h3v4h-3z`);
            }
        }
    };

    // Three buildings you might actually name, spaced across the run.
    const landmarks = detail
        ? [
            { at: 0.17, kind: 'setback' as const },
            { at: 0.52, kind: 'tapered' as const },
            { at: 0.79, kind: 'crowned' as const },
        ]
        : [];

    let x = -20;
    let next = 0;

    while (x < width) {
        const landmark = landmarks[next];
        if (landmark && x >= width * landmark.at) {
            next++;
            if (landmark.kind === 'setback') {
                // Stepped tower with a mast: three shrinking blocks and an antenna.
                const w = 74;
                const h = maxH * 0.78;
                rect(x, base - h, w, h);
                punchWindows(x, base - h, w, h);
                rect(x + 14, base - h - 46, w - 28, 46);
                rect(x + 26, base - h - 84, w - 52, 38);
                rect(x + 34, base - h - 118, 6, 34);
                rect(x + 36, base - h - 138, 2, 20);
                x += w + 16;
                continue;
            }
            if (landmark.kind === 'tapered') {
                // A tall shaft that narrows as it rises, topped by a long needle.
                const wBottom = 60;
                const wTop = 38;
                const h = maxH * 1.18;
                const top = base - h;
                box.push(`M${x} ${base}L${x + (wBottom - wTop) / 2} ${top}h${wTop}L${x + wBottom} ${base}z`);
                punchWindows(x + 8, top + 30, wBottom - 16, h);
                rect(x + wBottom / 2 - 1.5, top - 52, 3, 52);
                x += wBottom + 18;
                continue;
            }
            // Crowned: shrinking chevron tiers under a spire.
            const w = 64;
            const h = maxH * 0.82;
            const top = base - h;
            rect(x, top, w, h);
            punchWindows(x, top, w, h);
            for (let i = 0; i < 4; i++) {
                const inset = 6 + i * 7;
                const ty = top - 12 - i * 12;
                box.push(`M${x + inset} ${ty + 12}L${x + w / 2} ${ty}L${x + w - inset} ${ty + 12}z`);
            }
            rect(x + w / 2 - 1.5, top - 92, 3, 40);
            x += w + 16;
            continue;
        }

        const w = 26 + rand() * 46;
        const h = minH + rand() * (maxH - minH);
        const top = base - h;
        rect(x, top, w, h);
        punchWindows(x, top, w, h);

        if (detail) {
            const roof = rand();
            if (roof > 0.82) {
                // Water tower on legs — the most New York roofline there is.
                const tx = x + w / 2 - 6;
                rect(tx + 1, top - 5, 2, 5);
                rect(tx + 9, top - 5, 2, 5);
                rect(tx, top - 16, 12, 11);
                box.push(`M${tx - 1} ${top - 16}L${tx + 6} ${top - 24}L${tx + 13} ${top - 16}z`);
            } else if (roof > 0.68) {
                rect(x + w / 2 - 1, top - 26, 2, 26);       // antenna
            } else if (roof > 0.56) {
                box.push(`M${x} ${top}L${x + w / 2} ${top - 14}L${x + w} ${top}z`);   // pitched roof
            } else if (roof > 0.44) {
                rect(x + 5, top - 10, w - 10, 10);          // parapet
            }
        }

        x += w + 4 + rand() * 12;
    }

    return { silhouette: box.join(' '), windows: lights.join(' ') };
};

const NYCSkyline: React.FC = () => {
    const far = React.useMemo(() => drawSkyline(20240824, { width: 1600, base: 260, minH: 40, maxH: 118, detail: false }), []);
    const near = React.useMemo(() => drawSkyline(19860612, { width: 1600, base: 260, minH: 58, maxH: 168, detail: true }), []);

    return (
        <div className="absolute inset-x-0 bottom-0 h-64 pointer-events-none overflow-hidden" aria-hidden="true">
            <svg
                viewBox="0 0 1600 260"
                preserveAspectRatio="xMidYMax slice"
                className="w-full h-full"
                style={{
                    // Fade the towers out as they rise, so they sit behind the copy instead of
                    // fighting it.
                    WebkitMaskImage: 'linear-gradient(to top, #000 12%, rgba(0,0,0,0.45) 55%, transparent 90%)',
                    maskImage: 'linear-gradient(to top, #000 12%, rgba(0,0,0,0.45) 55%, transparent 90%)',
                }}
            >
                <path d={far.silhouette} fill="#ffffff" fillOpacity="0.05" />
                <path d={near.silhouette} fill="#ffffff" fillOpacity="0.085" />
                <path d={near.windows} fill="#F5D324" fillOpacity="0.2" />
            </svg>
        </div>
    );
};

const Footer: React.FC = () => {
    const socialLinks = [
        { icon: 'fab fa-whatsapp', href: 'https://wa.me/16468834335', label: 'WhatsApp' },
        { icon: 'fab fa-x-twitter', href: 'https://x.com/geekingoutnet', label: 'X (Twitter)' },
        { icon: 'fab fa-facebook', href: 'https://www.facebook.com/geekingout', label: 'Facebook' },
        { icon: 'fab fa-instagram', href: 'https://www.instagram.com/geekingoutnet/', label: 'Instagram' },
        { icon: 'fab fa-github', href: 'https://github.com/geekingout/', label: 'GitHub' },
        { icon: 'fab fa-linkedin', href: 'https://www.linkedin.com/company/geeking-out', label: 'LinkedIn' },
        { icon: 'fab fa-discord', href: 'https://discord.gg/qBzwhed3PB', label: 'Discord' },
        { icon: 'fab fa-paypal', href: 'https://www.paypal.me/geekingout', label: 'PayPal' },
        { icon: 'fab fa-youtube', href: 'https://www.youtube.com/channel/UCf3hpUGNU7ZFwTp6KW5L7dQ', label: 'YouTube' },
    ];

    const contactInfo = [
        { icon: 'fas fa-map-marker-alt', text: 'UES, NYC', href: null },
        { icon: 'fas fa-globe', text: 'GEEKINGOUT.NET', href: null }, // Removed href as per request
        { icon: 'fas fa-envelope', text: 'geek@geekingout.net', href: 'mailto:geek@geekingout.net' },
        { icon: 'fas fa-phone', text: '646-883-4335 (GEEK)', href: 'tel:+16468834335' },
        { icon: 'fab fa-whatsapp', text: 'Whatsapp: 646.883.4335', href: 'https://wa.me/16468834335', target: '_blank' },
    ];

    return (
        <footer className="relative bg-[#08080f] text-white overflow-hidden pt-24 pb-12 mb-20 md:mb-0">
            <FooterCodeField />
            <div
                className="absolute inset-0 z-0 pointer-events-none"
                aria-hidden="true"
                style={{ background: 'radial-gradient(60vw 40vh at 50% 0%, rgba(95,46,234,.28), transparent 60%)' }}
            />
            <NYCSkyline />

            <div className="container mx-auto max-w-6xl px-6 relative z-10">
                <div className="grid gap-12 md:gap-10 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr] mb-16">

                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-4 mb-5">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-purple to-[#8B5CF6] flex items-center justify-center border border-white/20 shadow-[0_10px_24px_-8px_rgba(95,46,234,.8)] overflow-hidden flex-shrink-0">
                                <img src={LOGO_SRC} alt="" className="w-8 h-8 object-contain brightness-0 invert" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black tracking-tighter leading-none">Geeking Out</h3>
                                <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-brand-yellow/80">
                                    &lt;Digital Agency/&gt; · Est. 2007
                                </span>
                            </div>
                        </div>
                        <ul className="space-y-3">
                            {contactInfo.map((item, index) => (
                                <li key={index} className="flex items-center gap-3 group">
                                    <i className={`${item.icon} w-5 text-center text-white/45 group-hover:text-brand-yellow transition-colors`}></i>
                                    {item.href ? (
                                        <a href={item.href} target={item.target || undefined} rel={item.target ? "noopener noreferrer" : undefined} className="text-white/70 hover:text-white transition-colors">{item.text}</a>
                                    ) : (
                                        <span className="text-white/70">{item.text}</span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Now that the site has pages, the footer can carry the whole map of it. */}
                    <nav aria-label="Footer navigation">
                        <h3 className="chip text-white/40 mb-5">Explore</h3>
                        <ul className="space-y-2.5">
                            {NAV_PAGES.map(page => (
                                <li key={page.key}>
                                    <RouteLink to={page.path} className="text-white/70 hover:text-brand-yellow transition-colors">
                                        {page.nav}
                                    </RouteLink>
                                </li>
                            ))}
                            <li>
                                <RouteLink to="/contact" className="text-white/70 hover:text-brand-yellow transition-colors">
                                    Start a Project
                                </RouteLink>
                            </li>
                        </ul>
                    </nav>

                    {/* Social */}
                    <div>
                        <h3 className="chip text-white/40 mb-5">Connect</h3>
                        <div className="grid grid-cols-5 gap-2.5 max-w-[280px]">
                            {socialLinks.map((link, index) => (
                                <a
                                    key={index}
                                    href={link.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={link.label}
                                    title={link.label}
                                    className="aspect-square rounded-xl bg-white/[0.06] border border-white/10 text-white/70 flex items-center justify-center text-lg hover:bg-brand-yellow hover:text-[#08080f] hover:border-brand-yellow hover:-translate-y-0.5 hover:shadow-[0_12px_26px_-12px_rgba(245,211,36,.9)] transition-all duration-300"
                                >
                                    <i className={link.icon}></i>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-7 flex flex-col md:flex-row justify-between items-center text-sm text-white/40 gap-4">
                    <div className="flex items-center gap-2">
                        <span>Made with</span>
                        <span className="text-brand-red">♥</span>
                        <span>in NYC</span>
                    </div>
                    <span className="order-last md:order-none">© Copyright Geeking Out, LLC</span>
                    <div className="flex gap-6">
                        <RouteLink to="/terms" className="hover:text-white transition-colors">Terms of Service</RouteLink>
                        <RouteLink to="/privacy" className="hover:text-white transition-colors">Privacy</RouteLink>
                    </div>
                </div>
            </div>
        </footer>
    );
};

// Every modal arrives on the same z-axis: the backdrop blurs the page away, the panel
// comes forward from -60px. One shell keeps that consistent.
const ModalShell: React.FC<{ onClose: () => void; children: React.ReactNode; className?: string }> =
    ({ onClose, children, className = 'max-w-lg' }) => {
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-[999] flex items-center justify-center p-4 animate-fade-in bg-[#05050b]/70 backdrop-blur-md"
            onClick={onClose}
        >
            <div
                role="dialog"
                aria-modal="true"
                className={`relative panel panel-solid p-8 w-full ${className} animate-scale-in shadow-[0_60px_120px_-50px_rgba(0,0,0,.9)]`}
                onClick={(e) => e.stopPropagation()}
            >
                {children}
            </div>
        </div>
    );
};

const ModalClose: React.FC<{ onClose: () => void }> = ({ onClose }) => (
    <button
        onClick={onClose}
        aria-label="Close Modal"
        className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center text-xl text-brand-black/40 dark:text-white/40 hover:text-brand-red hover:bg-brand-red/10 transition-colors"
    >
        <i className="fas fa-times"></i>
    </button>
);

// The project form. It was a modal when the whole site was one page; now that /contact is a
// page of its own the form lives there, unchanged in what it sends: same endpoint, same
// field names, same payload shape.
const ProjectForm: React.FC<{ initialDescription?: string }> = ({ initialDescription = '' }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        organization: '',
        projectDescription: initialDescription
    });
    const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (status === 'sending') return;

        setStatus('sending');
        const ok = await sendToGoogleSheets({
            source: 'Contact Form',
            ...formData
        });
        setStatus(ok ? 'sent' : 'error');
    };

    const field = "panel w-full p-3 rounded-xl bg-[var(--panel-solid)] dark:bg-white/[0.04] text-brand-black dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-purple/60";

    if (status === 'sent') {
        return (
            <div className="text-center py-6">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-3xl font-bold mb-2 dark:text-white">You're all set!</h2>
                <p className="text-brand-black/60 dark:text-gray-300 mb-8">
                    Thanks {formData.name.split(' ')[0] || 'for reaching out'} — we've got your project details and we'll be in touch shortly.
                </p>
                <RouteLink to="/" className="inline-block px-8 py-4 rounded-xl font-bold text-lg bg-brand-lime text-brand-black shadow-[0_16px_36px_-16px_rgba(163,249,83,.95)] hover:-translate-y-0.5 transition-transform">
                    Done
                </RouteLink>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="name" className="block font-semibold mb-1 text-left dark:text-white">Name</label>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className={field} />
            </div>
            <div>
                <label htmlFor="email" className="block font-semibold mb-1 text-left dark:text-white">Email</label>
                <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className={field} />
            </div>
             <div>
                <label htmlFor="organization" className="block font-semibold mb-1 text-left dark:text-white">Organization</label>
                <input type="text" id="organization" name="organization" value={formData.organization} onChange={handleChange} className={field} />
            </div>
            <div>
                <label htmlFor="projectDescription" className="block font-semibold mb-1 text-left dark:text-white">Describe your Project</label>
                <textarea id="projectDescription" name="projectDescription" placeholder="e.g., I want to build an AI chatbot for my e-commerce site..." value={formData.projectDescription} onChange={handleChange} required rows={5} className={`${field} resize-y`}></textarea>
            </div>
            {status === 'error' && (
                <p role="alert" className="text-brand-red font-semibold text-sm text-left">
                    <i className="fas fa-triangle-exclamation mr-2"></i>
                    Something went wrong sending that. Check your connection and try again, or email us at <a href="mailto:hello@geekingout.net" className="underline">hello@geekingout.net</a>.
                </p>
            )}
            <button
                type="submit"
                disabled={status === 'sending'}
                className="w-full px-8 py-4 rounded-xl font-bold text-lg text-white bg-brand-purple shadow-[0_16px_40px_-16px_rgba(95,46,234,1)] hover:-translate-y-0.5 transition-transform disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
                {status === 'sending' ? 'Sending…' : 'Launch Project'}
            </button>
        </form>
    );
};

type Service = {
    icon: string;
    title: string;
    description: string;
    color: string;
    graphic: string;
    explanation: string;
};

const ServiceModal: React.FC<{ service: Service; onClose: () => void; onDiscuss: () => void; }> = ({ service, onClose, onDiscuss }) => {
    return (
        <ModalShell onClose={onClose} className="max-w-2xl">
            <ModalClose onClose={onClose} />
            <div className="flex flex-col md:flex-row items-center gap-6 mb-6 text-center md:text-left">
                <div className="relative flex-shrink-0">
                    <div className={`absolute inset-0 ${service.color} rounded-2xl blur-xl opacity-50`} aria-hidden="true" />
                    <div className={`relative w-20 h-20 ${service.color} rounded-2xl flex items-center justify-center text-white text-4xl shadow-[0_16px_34px_-14px_rgba(20,18,40,.8)]`}>
                        <i className={service.graphic}></i>
                    </div>
                </div>
                <div>
                    <h2 className="text-3xl md:text-4xl font-bold dark:text-white">{service.title}</h2>
                    <p className="text-brand-black/60 dark:text-gray-300 text-lg">{service.description}</p>
                </div>
            </div>
            <div className="space-y-4 text-brand-black/80 dark:text-gray-300 text-lg mb-8 leading-relaxed">
               <p>{service.explanation}</p>
            </div>
             <button onClick={onDiscuss} className="w-full px-8 py-4 rounded-xl font-bold text-lg bg-brand-lime text-brand-black shadow-[0_16px_36px_-16px_rgba(163,249,83,.95)] hover:-translate-y-0.5 transition-transform">
                Discuss This Service
            </button>
        </ModalShell>
    );
};

const ScrollDepth: React.FC = () => {
    const barRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const horizon = reducedMotion() ? null : document.querySelector<HTMLElement>('.horizon');
        const onScroll = () => {
            const max = document.documentElement.scrollHeight - window.innerHeight;
            const progress = max > 0 ? Math.min(1, window.scrollY / max) : 0;
            if (barRef.current) barRef.current.style.transform = `scaleX(${progress})`;
            if (horizon) horizon.style.backgroundPositionY = `${window.scrollY * 0.22}px`;
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
        };
    }, []);

    return (
        // Sits on the header's top edge rather than the very top, where the banner now lives.
        <div className="fixed top-8 left-0 w-full h-[2px] z-[70] pointer-events-none" aria-hidden="true">
            <div
                ref={barRef}
                className="h-full w-full origin-left scale-x-0 bg-gradient-to-r from-brand-purple via-brand-lime to-brand-yellow"
            />
        </div>
    );
};

/* ------------------------------------------------------------------ *
 *  Pages
 * ------------------------------------------------------------------ */

// The home page is a menu as much as a landing page: one card per chapter, each opening
// the page that used to be a section of the same scroll.
const CHAPTERS = [
    { key: 'services', chip: 'What we do', title: 'Our Services', icon: 'fas fa-layer-group', color: 'bg-brand-purple', text: 'text-white' },
    { key: 'products', chip: 'Shipped work', title: 'Our Products', icon: 'fas fa-box-open', color: 'bg-brand-lime', text: 'text-brand-black' },
    { key: 'philosophy', chip: 'How we think', title: 'Our Philosophy', icon: 'fas fa-lightbulb', color: 'bg-brand-yellow', text: 'text-brand-black' },
    { key: 'team', chip: 'Who you work with', title: 'Our Team', icon: 'fas fa-users', color: 'bg-brand-red', text: 'text-white' },
    { key: 'process', chip: 'How it runs', title: 'Our Process', icon: 'fas fa-route', color: 'bg-brand-purple', text: 'text-white' },
    { key: 'faq', chip: 'Before you ask', title: 'Any Questions?', icon: 'fas fa-circle-question', color: 'bg-brand-lime', text: 'text-brand-black' },
];

const ChapterCard: React.FC<{ chapter: typeof CHAPTERS[number] }> = ({ chapter }) => {
    const tilt = useTilt<HTMLAnchorElement>(8);
    const page = PAGES.find(p => p.key === chapter.key)!;

    return (
        <div data-depth-in>
            <a
                {...tilt}
                href={`#${page.path}`}
                className="tilt panel sheen lift group p-7 flex items-center gap-5 h-full"
            >
                <div className="relative flex-shrink-0" style={{ transformStyle: 'preserve-3d' }}>
                    <div className={`absolute inset-0 ${chapter.color} rounded-2xl blur-xl opacity-40 group-hover:opacity-70 transition-opacity duration-500`} aria-hidden="true" />
                    <div className={`pop-2 relative w-14 h-14 ${chapter.color} ${chapter.text} rounded-2xl flex items-center justify-center text-2xl shadow-[0_12px_28px_-10px_rgba(20,18,40,.7)] transition-transform duration-500 group-hover:scale-105`}>
                        <i className={chapter.icon}></i>
                    </div>
                </div>
                <div className="flex-grow pop-1">
                    <div className="chip mb-1">{chapter.chip}</div>
                    <h3 className="text-2xl font-bold dark:text-white">{chapter.title}</h3>
                </div>
                <div className="pop-1 text-xl text-brand-black/35 dark:text-white/35 group-hover:text-brand-purple dark:group-hover:text-brand-yellow transition-all duration-300 group-hover:translate-x-1">
                    <i className="fas fa-arrow-right"></i>
                </div>
            </a>
        </div>
    );
};

const ChapterGrid: React.FC = () => (
    <section className="relative py-16 md:py-20 px-6 stage">
        <div className="container mx-auto max-w-5xl">
            <div className="grid md:grid-cols-2 gap-5">
                {CHAPTERS.map(chapter => <ChapterCard key={chapter.key} chapter={chapter} />)}
            </div>
        </div>
    </section>
);

// Reading order across the chapters, so a page is never a dead end.
//
// One bar rather than two cards: two half-width panels left ~80% of themselves empty and
// shouted at the same volume as the page content, when this is secondary navigation. The
// middle carries a rail of all seven chapters — it fills the gap with the one thing the
// header cannot tell you, which is where you are in the sequence, and it borrows the
// product deck's rail so the two read as the same idiom.
const Pager: React.FC<{ pageKey: string }> = ({ pageKey }) => {
    const index = CHAPTER_ORDER.indexOf(pageKey);
    if (index < 0) return null;

    const at = (i: number) => (i >= 0 && i < CHAPTER_ORDER.length ? PAGES.find(p => p.key === CHAPTER_ORDER[i]) : undefined);
    const prev = at(index - 1);
    const next = at(index + 1);
    const nameOf = (page: PageDef) => page.nav ?? 'Home';

    const step = "group flex items-center gap-3.5 rounded-xl px-4 py-2.5 transition-colors hover:bg-brand-black/[0.04] dark:hover:bg-white/[0.06]";
    const arrow = "text-brand-black/30 dark:text-white/30 group-hover:text-brand-purple dark:group-hover:text-brand-yellow transition-all duration-300";

    return (
        <nav className="px-6 pt-14 pb-4" aria-label="Chapter navigation">
            <div className="container mx-auto max-w-4xl rounded-2xl border border-[var(--hair)] bg-[var(--panel)] backdrop-blur-xl p-1.5 grid grid-cols-[1fr_auto_1fr] items-center gap-2">

                {prev ? (
                    <RouteLink to={prev.path} className={`${step} justify-self-start`}>
                        <i className={`fas fa-arrow-left ${arrow} group-hover:-translate-x-0.5`}></i>
                        <span className="text-left leading-tight">
                            <span className="chip block mb-0.5">Previous</span>
                            <span className="font-bold text-brand-black dark:text-white">{nameOf(prev)}</span>
                        </span>
                    </RouteLink>
                ) : <span />}

                {/* Every chapter, in order. Small enough to be a position indicator, live enough
                    to be a shortcut. */}
                <div className="hidden md:flex items-center gap-1.5 px-2">
                    {CHAPTER_ORDER.map((key, i) => {
                        const page = PAGES.find(p => p.key === key)!;
                        const here = i === index;
                        return (
                            <RouteLink
                                key={key}
                                to={page.path}
                                aria-label={nameOf(page)}
                                aria-current={here ? 'page' : undefined}
                                className={`h-1.5 rounded-full transition-all duration-500 ${
                                    here
                                        ? 'w-7 bg-brand-purple dark:bg-brand-yellow'
                                        : 'w-1.5 bg-brand-black/20 dark:bg-white/25 hover:bg-brand-black/45 dark:hover:bg-white/50'
                                }`}
                            />
                        );
                    })}
                </div>

                {next ? (
                    <RouteLink to={next.path} className={`${step} justify-self-end col-start-3`}>
                        <span className="text-right leading-tight">
                            <span className="chip block mb-0.5">Next</span>
                            <span className="font-bold text-brand-black dark:text-white">{nameOf(next)}</span>
                        </span>
                        <i className={`fas fa-arrow-right ${arrow} group-hover:translate-x-0.5`}></i>
                    </RouteLink>
                ) : <span className="col-start-3" />}
            </div>
        </nav>
    );
};

const HomePage: React.FC<{ onSubmit: (msg: string) => void }> = ({ onSubmit }) => (
    <>
        <HeroSection onSubmit={onSubmit} />
        {/* The work comes first, then the claim the work backs up. */}
        <ProductShowcase level={2} />
        <EngineeringSection />
        <ChapterGrid />
        <TestimonialsSection />
        <Pager pageKey="home" />
        <ContactCTA />
    </>
);

const ContactPage: React.FC<{ initialDescription: string }> = ({ initialDescription }) => (
    <section className="relative pt-44 pb-24 px-6 stage">
        <div className="container mx-auto max-w-2xl">
            <SectionHead
                level={1}
                label="Start a project"
                title="Start Your Project"
                blurb="Describe your idea, and we'll get in touch."
            />
            <div data-depth-in className="panel p-6 md:p-9">
                <ProjectForm initialDescription={initialDescription} />
            </div>
            <p className="text-center mt-8 text-brand-black/55 dark:text-gray-400">
                Or reach us directly at{' '}
                <a href="mailto:geek@geekingout.net" className="underline underline-offset-4 font-semibold hover:text-brand-purple dark:hover:text-brand-yellow">geek@geekingout.net</a>
                {' '}·{' '}
                <a href="tel:+16468834335" className="underline underline-offset-4 font-semibold hover:text-brand-purple dark:hover:text-brand-yellow">646-883-4335 (GEEK)</a>
            </p>
        </div>
    </section>
);

const LegalPage: React.FC<{ title: string; content: string }> = ({ title, content }) => (
    <section className="relative pt-44 pb-24 px-6 stage">
        <div className="container mx-auto max-w-4xl">
            <SectionHead level={1} label="Legal" title={title} />
            <div
                data-depth-in
                className="panel p-6 md:p-10 whitespace-pre-wrap leading-relaxed font-light text-brand-black/80 dark:text-gray-300"
            >
                {content}
            </div>
        </div>
    </section>
);

const NotFoundPage: React.FC = () => (
    <section className="relative pt-48 pb-28 px-6 text-center stage">
        <div className="container mx-auto max-w-xl" data-depth-in>
            <div className="chip mb-5">Error 404</div>
            <h1 className="display font-black text-5xl md:text-7xl mb-5 dark:text-white">Page not found</h1>
            <p className="text-lg text-brand-black/60 dark:text-gray-400 mb-9">
                That link doesn't lead anywhere on this site. Here's the way back.
            </p>
            <RouteLink
                to="/"
                className="inline-block px-8 py-4 rounded-2xl font-bold text-lg text-white bg-brand-purple shadow-[0_16px_40px_-16px_rgba(95,46,234,1)] hover:-translate-y-1 transition-transform"
            >
                Back to home
            </RouteLink>
        </div>
    </section>
);

// --- Main App Component ---

function App() {
     const route = useRoute();
     const page = PAGES.find(p => p.path === route);

     const [isMenuOpen, setIsMenuOpen] = useState(false);
     const [selectedService, setSelectedService] = useState<Service | null>(null);
     const [isDark, setIsDark] = useState(false);
     const mainRef = useRef<HTMLElement>(null);
     const firstRender = useRef(true);

     // Text piped into the contact form's project field (from the hero input or a service
     // card). It rides in React state rather than the URL so nobody's project description
     // ends up in a browser history entry.
     const [projectPrefill, setProjectPrefill] = useState('');

     // Theme toggle handler
     const toggleTheme = () => {
         if (document.documentElement.classList.contains('dark')) {
             document.documentElement.classList.remove('dark');
             localStorage.theme = 'light';
             setIsDark(false);
         } else {
             document.documentElement.classList.add('dark');
             localStorage.theme = 'dark';
             setIsDark(true);
         }
     };

     useEffect(() => {
         // Sync state with DOM on mount
         setIsDark(document.documentElement.classList.contains('dark'));
     }, []);

     // Arriving on a new page: name it, start at the top, and hand focus to the main
     // region so a screen reader announces the change instead of staying where it was.
     useEffect(() => {
        document.title = page ? page.doc : 'Page not found | Geeking Out Agency';
        setIsMenuOpen(false);
        setSelectedService(null);
        window.scrollTo({ top: 0, behavior: 'auto' });
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }
        mainRef.current?.focus({ preventScroll: true });
     }, [route, page]);

     const handleServiceClick = (service: Service) => {
        setSelectedService(service);
     };

     const handleCloseServiceModal = () => {
        setSelectedService(null);
     };

     const handleDiscussService = () => {
        if (selectedService) setProjectPrefill(`I'd like to talk about ${selectedService.title}. `);
        setSelectedService(null);
        navigate('/contact');
     }

     const handleHeroSubmit = (msg: string) => {
        setProjectPrefill(msg);
        navigate('/contact');
     };

     // --- Scroll choreography -------------------------------------------------
     // Everything marked [data-depth-in] arrives from behind the page: down, back in z, and
     // tipped slightly away, then settles flat. The tweens clear their inline transforms when
     // they finish, which hands each card back to its CSS hover and pointer-tilt rules.
     // Re-runs per page, because every route swaps the whole set of elements.
     useEffect(() => {
        const gsap = (window as any).gsap;
        const ScrollTrigger = (window as any).ScrollTrigger;
        // The CDN never arrived. Nothing has been hidden yet, so the page is simply static.
        if (!gsap || !ScrollTrigger) return;
        gsap.registerPlugin(ScrollTrigger);

        // Respect the OS "reduce motion" setting. These entrance animations start every section
        // (and the hero headline) at opacity 0 and fade them in, so skipping them means skipping
        // the whole setup — the markup is already in its final, visible state.
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        const ctx = gsap.context(() => {
            // Hero headline: each character hinges up from below its own baseline. Only the
            // home page has one; elsewhere the selector simply matches nothing.
            const heroWords = gsap.utils.toArray('[data-hero-word]');
            heroWords.forEach((word: any) => {
                const chars = (word as Element).textContent?.split('');
                (word as Element).innerHTML = '';
                if (chars) {
                    chars.forEach(char => {
                        const span = document.createElement('span');
                        span.textContent = char;
                        span.style.display = 'inline-block';
                        (word as Element).appendChild(span);
                    });
                }
            });
            gsap.from('[data-hero-word] span', {
                yPercent: 115,
                rotateX: -80,
                opacity: 0,
                transformPerspective: 600,
                transformOrigin: '50% 100% -12px',
                stagger: 0.035,
                duration: 1,
                ease: 'power4.out',
                delay: 0.35,
            });
            gsap.from('[data-hero-sub]', { opacity: 0, y: 26, duration: 1, delay: 1.1, stagger: 0.15 });

            const hidden = { opacity: 0, y: 46, z: -150, rotateX: -6, transformPerspective: 1200, transformOrigin: '50% 100%' };
            const shown = { opacity: 1, y: 0, z: 0, rotateX: 0, duration: 0.9, ease: 'power3.out', clearProps: 'all' };

            gsap.utils.toArray('[data-depth-in]').forEach((el: any, i: number) => {
                const alreadyPast = el.getBoundingClientRect().top < window.innerHeight * 0.92;
                gsap.set(el, hidden);
                if (alreadyPast) {
                    // Above the fold on load (or the page was refreshed part-way down): play now,
                    // otherwise a ScrollTrigger that starts behind the viewport never fires.
                    gsap.to(el, { ...shown, delay: 0.2 + Math.min(i, 6) * 0.07 });
                } else {
                    gsap.to(el, { ...shown, scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
                }
            });

            // The process spine draws itself at the rate you scroll through the phases.
            gsap.fromTo('[data-process-line]',
                { scaleY: 0 },
                {
                    scaleY: 1,
                    ease: 'none',
                    scrollTrigger: { trigger: '#process', start: 'top 65%', end: 'bottom 75%', scrub: 0.4 },
                }
            );
        });

        // Web fonts land after first paint and move everything down a few pixels.
        const refresh = () => ScrollTrigger.refresh();
        if ((document as any).fonts?.ready) (document as any).fonts.ready.then(refresh);
        const refreshTimer = window.setTimeout(refresh, 1200);

        return () => {
            window.clearTimeout(refreshTimer);
            ctx.revert();
        };
    }, [route]);

    const renderPage = () => {
        switch (route) {
            case '/':
                return <HomePage onSubmit={handleHeroSubmit} />;
            case '/services':
                return (
                    <>
                        <ServicesSection onServiceClick={handleServiceClick} />
                        <Pager pageKey="services" />
                        <ContactCTA />
                    </>
                );
            case '/products':
                return (
                    <>
                        <ProductShowcase level={1} />
                        <Pager pageKey="products" />
                        <ContactCTA />
                    </>
                );
            case '/philosophy':
                return (
                    <>
                        <PhilosophySection />
                        <Pager pageKey="philosophy" />
                        <ContactCTA />
                    </>
                );
            case '/team':
                return (
                    <>
                        <TeamSection />
                        <Pager pageKey="team" />
                        <ContactCTA />
                    </>
                );
            case '/process':
                return (
                    <>
                        <ProcessSection />
                        <Pager pageKey="process" />
                        <ContactCTA />
                    </>
                );
            case '/faq':
                return (
                    <>
                        <FaqSection />
                        <Pager pageKey="faq" />
                        <ContactCTA />
                    </>
                );
            case '/contact':
                return <ContactPage initialDescription={projectPrefill} />;
            case '/terms':
                return <LegalPage title="Terms of Service" content={termsContent} />;
            case '/privacy':
                return <LegalPage title="Privacy Policy" content={privacyContent} />;
            default:
                return <NotFoundPage />;
        }
    };

    return (
        <>
            <AlertBanner />
            <ScrollDepth />
            <Header
                route={route}
                isMenuOpen={isMenuOpen}
                setIsMenuOpen={setIsMenuOpen}
                toggleTheme={toggleTheme}
                isDark={isDark}
            />
            {/* key={route} throws the previous page away rather than reconciling into the next
                one, so the WebGL core is properly disposed and the choreography always finds a
                fresh set of nodes. */}
            <main key={route} ref={mainRef} tabIndex={-1} className="outline-none">
                {renderPage()}
            </main>
            <Footer />
            {selectedService && <ServiceModal service={selectedService} onClose={handleCloseServiceModal} onDiscuss={handleDiscussService} />}
            <MobileNavBar
                route={route}
                isMenuOpen={isMenuOpen}
                onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
            />
        </>
    );
}

export default App;
