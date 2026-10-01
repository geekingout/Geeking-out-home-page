/**
 * Every word the site says, in one place.
 *
 * Copy is Victor's and is reproduced verbatim. Structure is the only thing a
 * redesign is allowed to change, which is why the data lives apart from the
 * components that lay it out.
 */

export const FOUNDED = 2007;
export const PHONE_DISPLAY = '646-883-4335 (GEEK)';
export const PHONE_TEL = 'tel:+16468834335';
export const WHATSAPP = 'https://wa.me/16468834335';
export const EMAIL = 'geek@geekingout.net';

/** The five lines on the home page's "Now Boarding" board. */
export const HOME_SERVICES = [
    { name: 'Workflow Automation & AI Ops', tag: 'automate' },
    { name: 'Support & Sales Agents', tag: 'agents' },
    { name: 'Knowledge Assistants (RAG)', tag: 'rag' },
    { name: 'AI Audit & Strategy Sprint', tag: 'strategy' },
    { name: 'Content & Marketing Systems', tag: 'content' },
];

export type Service = {
    title: string;
    description: string;
    tag: string;
    explanation: string;
};

export const SERVICES: Service[] = [
    {
        title: 'Automation & Agents',
        description: 'Custom agents to streamline your workflows.',
        tag: 'agents',
        explanation: "Imagine having a super-smart assistant for your computer. We build 'agents'—little software robots—that can do boring, repetitive tasks for you automatically. Things like sorting emails, filling out forms, or gathering data from websites. It's like putting your workflow on autopilot so you can focus on the important stuff.",
    },
    {
        title: 'AI Audit & Strategy Sprint',
        description: 'Two to four weeks to find what is worth building.',
        tag: 'strategy',
        explanation: "Most teams know they should be doing something with AI, but not what, or where it would actually pay off. Over two to four weeks we map how work really moves through your business, score each opportunity by effort against payoff, and hand you a ranked roadmap. It's a paid engagement and it stands on its own—the roadmap is yours to take to any developer, including one who isn't us.",
    },
    {
        title: 'RAG Systems',
        description: 'AI grounded in your proprietary knowledge.',
        tag: 'rag',
        explanation: "This is like giving an AI an 'open book' test. Instead of trying to memorize everything, a RAG system can look up information from your private documents or database in real-time before answering a question. This ensures the AI gives you the most accurate, up-to-date answers based on *your* knowledge, not just what it learned from the internet.",
    },
    {
        title: 'Software Development',
        description: 'Bespoke web apps and enterprise platforms.',
        tag: 'build',
        explanation: 'This is about building custom tools from the ground up. Need a unique website, a mobile app for your customers, or a powerful internal dashboard for your team? We design and code software that is tailor-made to solve your specific problems and help your business run smoothly.',
    },
    {
        title: 'Video Production',
        description: 'Engaging, AI-enhanced video content.',
        tag: 'video',
        explanation: 'We create professional videos for your brand, but with an AI-powered twist. We can use AI to help with scriptwriting, generate realistic voiceovers, create animations, or even edit footage faster. The result is high-quality, engaging video content that captures your audience\'s attention, made more efficiently.',
    },
    {
        title: 'AI Products',
        description: 'Launch new AI-powered SaaS platforms.',
        tag: 'launch',
        explanation: 'Have a big idea for a new app or service that uses AI? We can help you build it from concept to launch. This is about creating a complete, market-ready product—like a new photo editing app with AI filters or a smart scheduling tool—that you can offer to your customers.',
    },
];

export type ProductLink = { label: string; href: string };
export type Product = {
    name: string;
    domain: string;
    category: string;
    /** The product's own accent, used for its chrome dot, the panel glow and the step bar. */
    color: string;
    desc: string;
    outcome: string;
    links: ProductLink[];
};

export const PRODUCTS: Product[] = [
    {
        name: 'CAFECITO', domain: 'cafeci.to', category: 'Agent Control Plane', color: '#B8672A',
        desc: "An integration control plane for AI agent fleets. Prove independence when you can. Re-derive when you can't. Never resolve a conflict.",
        outcome: 'Fleets of agents, one source of truth',
        links: [{ label: 'Website', href: 'https://cafeci.to/' }],
    },
    {
        name: 'SCHOOLZ', domain: 'schoolz.me', category: 'EdTech Platform', color: '#FF6B1F',
        desc: 'Your website, your own branded mobile app, and a CMS your office staff can actually run — one platform, fully managed for you. Stop settling for outdated portals.',
        outcome: 'Website, branded app, and CMS — one platform, fully managed',
        links: [{ label: 'Website', href: 'https://schoolz.me/' }, { label: 'Web App', href: 'https://admin.schoolz.me/login' }],
    },
    {
        name: 'LOOMINO.AI', domain: 'loomino.ai', category: 'Agentic CMS', color: '#0E8C8C',
        desc: 'Build, Edit, and Deploy with Natural Language. The AI-native CMS that turns client requests into instant code changes. No developer capacity bottleneck. No 3-day wait for a headline tweak.',
        outcome: 'Client asks in plain English, code ships the same day',
        links: [{ label: 'Web App', href: 'https://loomino.ai/' }],
    },
    {
        name: 'STAFFY.IO', domain: 'staffy.io', category: 'Generative Audio', color: '#E0437A',
        desc: 'AI Music Generator creating royalty-free soundscapes for creators.',
        outcome: 'Original soundtracks in seconds, cleared to use',
        links: [{ label: 'Website', href: 'https://staffy.io' }],
    },
    {
        name: 'KABONZO', domain: 'kabonzo.com', category: 'Classroom Gamification', color: '#2EB884',
        desc: 'Turn any lesson into a game. Teachers create, students compete, and AI does the heavy lifting — the classroom arcade that makes every subject feel like recess.',
        outcome: 'Any lesson, turned into a game teachers can run',
        links: [{ label: 'Website', href: 'https://kabonzo.com/' }],
    },
    {
        name: 'UESDAD', domain: 'uesdad.nyc', category: 'NYC Community App', color: '#2F6FE8',
        desc: 'Connect, trade, and discover local perks with a vetted community of dads in your neighborhood. An exclusive mobile app curated for the modern New York family.',
        outcome: 'A vetted neighborhood network in your pocket',
        links: [{ label: 'Website', href: 'https://uesdad.nyc/' }, { label: 'iOS', href: 'https://apps.apple.com/us/app/uesdad/id6759264279' }],
    },
    {
        name: 'DOG KITCHEN', domain: 'dogkitchen.io', category: 'AI Infrastructure Layer', color: '#17151A',
        desc: 'Building the infrastructure layer for AI development. A single platform that aggregates, curates, and surfaces the resources, data, and intelligence AI developers need to ship faster.',
        outcome: 'Everything AI builders need, one surface',
        links: [{ label: 'Website', href: 'https://dogkitchen.io/' }],
    },
];

export type TeamMember = { name: string; role: string; color: string; ink: string; linkedin?: string };

// Accents are the product palette above, so the team reads as part of the same system.
export const TEAM: TeamMember[] = [
    { name: 'Victor', role: 'Founder / AI Engineer', color: '#FF5A1F', ink: '#17151A', linkedin: 'http://www.linkedin.com/in/geekingout' },
    { name: 'Omar', role: 'AI Engineer', color: '#0E8C8C', ink: '#FAF8F5' },
    { name: 'Nahuel', role: 'Software Developer', color: '#E0437A', ink: '#FAF8F5' },
    { name: 'Miguel', role: 'Systems Engineer', color: '#2EB884', ink: '#17151A' },
    { name: 'Lucia', role: 'Product Manager', color: '#2F6FE8', ink: '#FAF8F5' },
    { name: 'Alex', role: 'Mobile App Engineer', color: '#B8672A', ink: '#FAF8F5' },
    { name: 'Patri', role: 'AI/Data Engineer', color: '#FF8A5C', ink: '#17151A' },
    { name: 'Olivia', role: 'Accounts Manager', color: '#17151A', ink: '#FAF8F5' },
    { name: 'Sofia', role: 'Marketing Manager', color: '#FFB899', ink: '#17151A' },
];

export type Quote = { name: string; org: string; text: string };

export const QUOTES: Quote[] = [
    { name: 'Aerial Best', org: 'NYC DOE', text: 'My principal loves this! She says it looks amazing!' },
    { name: 'Principal Kayode Ayetiwa', org: 'Humanities and Art HS', text: 'I will certainly recommend your service to other schools as well as I am impressed with your business model.' },
    { name: 'Mike Person, PMP®, SSM, ITIL', org: 'IT Project Manager @ CACI International Inc', text: 'I worked with Victor on several projects and can tell you that he is very astute at several technical roles including web developer, CRM developer, and in processes like data migration. Victor is extremely detail oriented, persevering, very reliable, has a great work ethic and a terrific sense of humor. I highly recommend Victor.' },
    { name: 'Alexandria Dycus, RN, MSN, FNP', org: 'Vanderbilt University Medical Center', text: 'Victor is a highly skilled developer that made sure I understood the entire process and that all my options were clearly explained to me. Together we built a crm to manage leads and take them through our sales funnel. We are very happy with the application and recommend Victor for your next project.' },
    { name: 'Jason Lay', org: 'Network Infrastructure Advisor', text: "Working with Victor was an enlightening experience. It's hard to find someone with knowledge and skills who also possesses an intrinsic ability to work seamlessly in a team setting. He brought value to every project we worked on, and a 'can do' attitude with every problem we encountered." },
    { name: 'Nahuel Gorosito', org: 'Creative Technologist @ OUTFRONT Media', text: 'Victor is highly skilled and efficient at what he does. I am very happy with my actor’s website that he created with his innovative site building platform, Geekingout. He is also a man of integrity who will go above and beyond the client’s needs.' },
    { name: 'John Vogel', org: 'Helping Businesses with IT & Production Support', text: "Victor was an integral part of the Innovation team. He proposed, developed, and implemented our core software backbone, including a business-critical CRM. He respects a growing firm's budget and proposes clean, pragmatic solutions. He is so upfront, responsive, and responsible." },
    { name: 'Ralph Wilburn', org: 'Founder Mobile Barber Ralph', text: 'Working with Victor was a pleasure. The quality of his work is top notch and he is a great guy to work with. Very patient and great attention to detail. I highly recommend working with him.' },
    { name: 'Andrew Ayala', org: 'Actor / Creative', text: "Geeking out is an awesome site, the display is great, anything I'd like added to the site is a breeze. Victor is as dedicated as they come, I highly recommend his services, continued success to Victor and Geeking out." },
    { name: 'Conor Briody', org: 'CRM Technology Lead @ Jupiter AM', text: "Victor's ability to architect applications to make all aspects of the business run smoothly was astounding. Regardless of how complex a project was - Victor had a second to none ability to design innovative solutions in a short timeframe. Working with Victor has been an indescribable pleasure." },
];

export const PHILOSOPHY = [
    { number: '01', title: 'Solve the Right Problem', description: 'We dive deep, past the symptoms, to identify the core challenge.' },
    { number: '02', title: 'Transparent & Jargon-Free', description: "You'll get clear, direct updates and strategic advice." },
    { number: '03', title: "Obsessed with What's Next", description: 'We are constantly mastering new AI frameworks to keep you ahead of the curve.' },
];

export const PROCESS = [
    {
        letter: 'A',
        phase: 'Phase A – Discovery & Strategy',
        steps: ['Specifications & Planning', 'Designs, Wireframe & Prototype', 'Estimates & Timeline'],
    },
    {
        letter: 'B',
        phase: 'Phase B – Development',
        steps: ['Data Collection & Preparation', 'Experimentation & Modeling', 'Feature Development & Testing', 'Deployment & Integration', 'Maintain & Monitor'],
    },
];

export const FAQ = [
    { question: "What are 'Automation & Agents' and how can they help me?", answer: "Automation involves creating custom 'agents' that handle repetitive, complex tasks. This could be anything from processing invoices and customer support emails to analyzing market data, freeing up your team for high-value work." },
    { question: 'Can you work with the tools we already use?', answer: "Usually yes, and that's the starting assumption. Most of what we build connects the systems you already pay for rather than replacing them: your CRM, inbox, Slack, spreadsheets, ticketing. If something genuinely can't be connected, we'll tell you early rather than bill you to find out." },
    { question: "What happens in an 'AI Audit & Strategy Sprint'?", answer: "Over two to four weeks we map how work actually moves through your business, then score each opportunity by the effort it takes against what it returns. You get a ranked roadmap of what to build and in what order. It's a paid engagement, and the roadmap is yours whether or not you build any of it with us." },
    { question: 'How much does a project cost?', answer: 'It depends on scope, so we quote per project rather than off a rate card. Most engagements share the same shape: a fixed build fee to design and ship the thing, then an optional monthly retainer if you want us to keep it running and improving as your business changes. You get the full number in writing before any work starts.' },
    { question: 'How long before we see something working?', answer: "For a focused automation or a single agent, usually weeks rather than months. We would rather put a working slice in front of you early than disappear for a quarter. Larger platforms take longer and get broken into milestones so you can see progress throughout. If the scope isn't clear yet, the Audit & Strategy Sprint is the fastest way to get a real timeline." },
    { question: 'What happens to our data?', answer: "It stays yours. Wherever possible we build inside your own accounts and infrastructure, so your data doesn't take a detour through ours. For knowledge assistants we mirror the permissions you already have—if someone can't open a document today, the assistant won't surface it to them tomorrow. We'll walk you through where data lives and who can reach it before we build anything." },
    { question: 'Which AI models do you use?', answer: "Whichever fits the job. We aren't tied to a single vendor, and we choose based on what your use case actually needs: accuracy, speed, cost, and whether your data is allowed to leave your environment. We also build so the model can be swapped later, because this field moves quickly and you shouldn't be locked into today's best option forever." },
    { question: 'Is this going to replace our team?', answer: "That isn't what we build. These systems take on the repetitive part—the copying between systems, the same twenty support questions, the hunt for a document someone filed two years ago. The judgment calls stay with your people, and so does the final say." },
    { question: 'Do you only work with big companies?', answer: 'Nope! We love working with small and medium-sized businesses just as much as larger enterprises. Our services are scalable, meaning we can build a plan that fits your exact needs and budget.' },
    { question: "What kind of 'AI Products' can you build?", answer: 'We can help you conceptualize, design, and build entirely new software applications with AI at their core. This includes internal tools to boost productivity or new SaaS (Software as a Service) platforms you can sell to your customers.' },
];

export const SOCIAL = [
    { label: 'WhatsApp', href: WHATSAPP },
    { label: 'X (Twitter)', href: 'https://x.com/geekingoutnet' },
    { label: 'Facebook', href: 'https://www.facebook.com/geekingout' },
    { label: 'GitHub', href: 'https://github.com/geekingout/' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/company/geeking-out' },
    { label: 'Discord', href: 'https://discord.gg/qBzwhed3PB' },
    { label: 'PayPal', href: 'https://www.paypal.me/geekingout' },
    { label: 'YouTube', href: 'https://www.youtube.com/channel/UCf3hpUGNU7ZFwTp6KW5L7dQ' },
];

export const TERMS = `1. Terms
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
These terms and conditions are governed by and construed in accordance with the laws of New York City and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.`;

export const PRIVACY = `Your privacy is important to us. It is Geeking Out, LLC’s policy to respect your privacy regarding any information we may collect from you across our website, https://geekingout.net/, and other sites we own and operate.

We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent. We also let you know why we’re collecting it and how it will be used.

We only retain collected information for as long as necessary to provide you with your requested service. What data we store, we’ll protect within commercially acceptable means to prevent loss and theft, as well as unauthorized access, disclosure, copying, use or modification.

We don’t share any personally identifying information publicly or with third-parties, except when required to by law.

Our website may link to external sites that are not operated by us. Please be aware that we have no control over the content and practices of these sites, and cannot accept responsibility or liability for their respective privacy policies. You are free to refuse our request for your personal information, with the understanding that we may be unable to provide you with some of your desired services.

Your continued use of our website will be regarded as acceptance of our practices around privacy and personal information. If you have any questions about how we handle user data and personal information, feel free to contact us.`;
