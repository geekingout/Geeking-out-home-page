
import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";

// --- Configuration ---
// Explicitly type as string to avoid TS error when comparing with the placeholder string below
const GOOGLE_SHEETS_WEBHOOK_URL: string = "https://script.google.com/macros/s/AKfycbwXWaVr52KdOf0bQHL21kG2vFyNZyOrsYYRv5_Bj1wIMxWx5bs7e9UuqIx7nE6G6qEkjw/exec";

const sendToGoogleSheets = async (data: any) => {
    // SANITIZATION FIX: 
    // Create a clean object to ensure no circular references (like DOM Events) are passed to JSON.stringify
    const cleanPayload = {
        timestamp: new Date().toLocaleString(),
        source: typeof data.source === 'string' ? data.source : 'Unknown',
        name: typeof data.name === 'string' ? data.name : '',
        email: typeof data.email === 'string' ? data.email : '',
        description: typeof data.description === 'string' ? data.description : '',
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
        return;
    }

    try {
        // mode: 'no-cors' is necessary for Google Apps Script Web Apps
        await fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
            method: "POST",
            mode: "no-cors", 
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(cleanPayload),
        });
        console.log("✅ Data sent to Google Sheets");
    } catch (error) {
        console.error("❌ Error sending to Google Sheets:", error);
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
        icon: '🎓', 
        title: 'Fine Tuning', 
        description: 'Specialized models trained on your data.', 
        color: 'bg-brand-red', 
        graphic: 'fas fa-graduation-cap',
        explanation: "Think of a general AI like a student who has read a ton of books on every subject. 'Fine-tuning' is like giving that student a specialized textbook for a specific class—like chemistry. We take a powerful AI and train it on *your* specific information, so it becomes an expert in *your* world, whether that's understanding your company's documents or your unique customer conversations."
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
        title: 'NOTIFY',
        subtitle: 'Property Management AI',
        description: 'A property management mobile app powered by AI agents tracking tenant requests.',
        icon: 'fas fa-building-user',
        accent: 'text-brand-purple',
        border: 'group-hover:border-brand-purple',
        glow: 'group-hover:shadow-[0_0_30px_-5px_#5F2EEA]',
        links: {
            ios: 'https://apps.apple.com/us/app/notify-tenant/id1541300268',
            android: 'https://play.google.com/store/apps/details?id=app.gdigic.ntofy&hl=en_US',
            webApp: 'https://admin.ntofy.com/'
        }
    },
    {
        title: 'DOG KITCHEN',
        subtitle: 'D2C Ecosystem',
        description: 'Direct to Consumer mobile app, CRM and payment gateway for premium pet nutrition.',
        icon: 'fas fa-bone',
        accent: 'text-brand-yellow',
        border: 'group-hover:border-brand-yellow',
        glow: 'group-hover:shadow-[0_0_30px_-5px_#F5D324]',
        links: {
            website: 'https://dogkitchen.io/',
            ios: 'https://apps.apple.com/us/app/dog-kitchen/id6503183760',
            android: 'https://play.google.com/store/apps/details?id=com.app.dogkitchen'
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
        accent: 'text-brand-pink',
        border: 'group-hover:border-brand-pink',
        glow: 'group-hover:shadow-[0_0_30px_-5px_#FCE7F3]',
        links: {
            website: 'https://staffy.io'
        }
    },
    {
        title: 'VICTORHUGO.AI',
        subtitle: 'Creative Studio',
        description: 'Creative Studio that creates marketing videos and documentaries using AI.',
        icon: 'fas fa-video',
        accent: 'text-brand-purple',
        border: 'group-hover:border-brand-purple',
        glow: 'group-hover:shadow-[0_0_30px_-5px_#5F2EEA]',
        links: {
            website: 'https://victorhugo.ai/'
        }
    },
];

const teamData = [
    { name: 'Victor', role: 'Founder', color: 'bg-brand-purple', text: 'text-white', icon: 'fas fa-user-astronaut', linkedin: 'http://www.linkedin.com/in/geekingout' },
    { name: 'Farooq', role: 'Software Engineer', color: 'bg-brand-yellow', text: 'text-brand-black', icon: 'fas fa-code' },
    { name: 'Usama', role: 'Software Engineer', color: 'bg-brand-lime', text: 'text-brand-black', icon: 'fas fa-laptop-code' },
    { name: 'Nahuel', role: 'Front-End Developer', color: 'bg-brand-pink', text: 'text-brand-black', icon: 'fas fa-paint-brush' },
    { name: 'Miguel', role: 'Senior Sys Admin', color: 'bg-brand-yellow', text: 'text-brand-black', icon: 'fas fa-server' },
    { name: 'Lucia', role: 'Product Manager', color: 'bg-brand-red', text: 'text-white', icon: 'fas fa-clipboard-check' },
    { name: 'AQ', role: 'Mobile App Engineer', color: 'bg-brand-purple', text: 'text-white', icon: 'fas fa-mobile-screen' },
    { name: 'Patri', role: 'AI/Data Engineer', color: 'bg-brand-lime', text: 'text-brand-black', icon: 'fas fa-database' },
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
  { question: "What's the difference between Fine Tuning and RAG?", answer: "Both are ways to customize AI. <strong>Fine Tuning</strong> retrains a model's 'brain' on your specific data, making it an expert in your domain. <strong>RAG</strong> gives a model access to your private documents, so it can answer questions based on your *current* knowledge without being retrained." },
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


// --- Sub-Components ---

const Header: React.FC<{ onContactClick: () => void; isMenuOpen: boolean; setIsMenuOpen: (isOpen: boolean) => void }> = ({ onContactClick, isMenuOpen, setIsMenuOpen }) => {
    const [hoverStyle, setHoverStyle] = useState({ left: 0, width: 0, opacity: 0 });
    const navRef = useRef<HTMLDivElement>(null);

    const navLinks = [
        { name: 'Services', href: '#services' },
        { name: 'Products', href: '#products' },
        { name: 'Philosophy', href: '#philosophy' },
        { name: 'Team', href: '#team' },
        { name: 'Process', href: '#process' },
        { name: 'FAQ', href: '#faqs' },
    ];

    const socialLinks = [
        { icon: 'fab fa-instagram', href: 'https://www.instagram.com/geekingoutnet/', label: 'Instagram' },
        { icon: 'fab fa-x-twitter', href: 'https://x.com/geekingoutnet', label: 'X (Twitter)' },
        { icon: 'fab fa-linkedin-in', href: 'https://www.linkedin.com/company/geeking-out', label: 'LinkedIn' },
    ];
    
    const closeMenu = () => setIsMenuOpen(false);

    const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
        const { offsetLeft, offsetWidth } = e.currentTarget;
        setHoverStyle({ left: offsetLeft, width: offsetWidth, opacity: 1 });
    };

    const handleMouseLeave = () => {
        setHoverStyle(prev => ({ ...prev, opacity: 0 }));
    };

    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        e.preventDefault();
        const targetId = href.replace('#', '');
        const element = document.getElementById(targetId);
        if (element) {
            const headerOffset = 100;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.scrollY - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
            closeMenu();
        }
    };

    return (
    <>
        <header className="fixed top-0 left-0 w-full z-50 p-4 backdrop-blur-sm bg-brand-off-white/80 transition-all duration-300">
            <div className="container mx-auto max-w-7xl flex justify-between items-center">
                <a href="#" className="flex items-center gap-4 group" aria-label="Geeking Out Agency Home">
                    <div className="relative">
                        <div className="w-14 h-14 bg-brand-purple rounded-xl flex items-center justify-center border-2 border-brand-black shadow-[4px_4px_0px_#1A1A1A] transition-all duration-200 group-hover:translate-x-[2px] group-hover:translate-y-[2px] group-hover:shadow-[2px_2px_0px_#1A1A1A]">
                            <i className="fas fa-robot text-brand-yellow text-3xl"></i>
                        </div>
                    </div>
                    <div className="flex flex-col justify-center items-center">
                        <span className="font-black text-3xl leading-none tracking-tight text-brand-black group-hover:text-brand-purple transition-colors">
                            Geeking Out
                        </span>
                        <div className="flex items-center mt-1">
                            <span className="bg-brand-purple text-white text-[10px] px-2 py-0.5 rounded font-mono font-bold tracking-wider uppercase">
                                &lt;Digital Agency/&gt;
                            </span>
                        </div>
                    </div>
                </a>

                {/* Desktop Nav */}
                <nav ref={navRef} onMouseLeave={handleMouseLeave} className="hidden lg:flex items-center gap-2 relative" aria-label="Desktop Navigation">
                    <div 
                        className="absolute bg-brand-purple/10 backdrop-blur-sm border border-brand-purple/20 rounded-full transition-all duration-300 ease-out -z-10"
                        style={{ ...hoverStyle, height: '36px', top: '50%', transform: 'translateY(-50%)' }}
                    />
                    {navLinks.map(link => (
                        <a 
                            key={link.name} 
                            href={link.href}
                            onClick={(e) => handleNavClick(e, link.href)}
                            onMouseEnter={handleMouseEnter}
                            className="font-semibold text-brand-black/70 hover:text-brand-purple transition-colors px-4 py-1 relative z-10"
                        >
                            {link.name}
                        </a>
                    ))}
                </nav>

                <div className="flex items-center gap-4">
                     <div className="hidden sm:flex items-center gap-4">
                        {socialLinks.map((link, index) => (
                             <a key={index} href={link.href} target="_blank" rel="noopener noreferrer" aria-label={link.label} className="text-xl text-brand-black/60 hover:text-brand-purple transition-colors">
                                <i className={link.icon}></i>
                            </a>
                        ))}
                         <button 
                            onClick={onContactClick}
                            className="bg-white text-brand-black px-6 py-3 rounded-full font-bold border-2 border-brand-black sticker-card sticker-hover"
                         >
                            Get In Touch
                        </button>
                     </div>
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle Menu" className="lg:hidden md:block hidden text-2xl z-50">
                        <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
                    </button>
                </div>
            </div>
        </header>

        {/* Mobile/Tablet Menu Overlay */}
        {isMenuOpen && (
            <div className="fixed inset-0 bg-brand-off-white z-40 flex flex-col items-center justify-center animate-fade-in lg:hidden">
                <nav className="flex flex-col items-center gap-8 text-center" aria-label="Mobile Navigation">
                    {navLinks.map(link => (
                        <a 
                            key={link.name} 
                            href={link.href} 
                            onClick={(e) => handleNavClick(e, link.href)} 
                            className="font-bold text-3xl text-brand-black hover:text-brand-purple transition-colors"
                        >
                            {link.name}
                        </a>
                    ))}
                </nav>
                <div className="flex items-center gap-6 mt-12">
                     {socialLinks.map((link, index) => (
                        <a key={index} href={link.href} onClick={closeMenu} target="_blank" rel="noopener noreferrer" aria-label={link.label} className="text-3xl text-brand-black/60 hover:text-brand-purple transition-colors">
                            <i className={link.icon}></i>
                        </a>
                    ))}
                </div>
                <button 
                    onClick={() => {
                        onContactClick();
                        closeMenu();
                    }}
                    className="mt-12 bg-white text-brand-black px-8 py-4 rounded-full font-bold border-2 border-brand-black sticker-card sticker-hover text-lg"
                >
                    Get In Touch
                </button>
            </div>
        )}
    </>
    );
};

const MobileNavBar: React.FC<{ onChatToggle: () => void; onContactClick: () => void; isMenuOpen: boolean; onMenuToggle: () => void; }> = ({ onChatToggle, onContactClick, isMenuOpen, onMenuToggle }) => {
    const scrollToSection = (id: string) => {
        const el = document.getElementById(id);
        if (el) {
            const offset = 80;
            const top = el.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    };

    return (
        <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 z-[60] md:hidden pb-safe shadow-[0_-2px_10px_rgba(0,0,0,0.05)]" aria-label="Bottom Mobile Navigation">
            <div className="flex items-center justify-around h-16 px-2 relative">
                 {/* Item 1: Services */}
                 <button onClick={() => scrollToSection('services')} className="flex flex-col items-center justify-center w-full h-full text-brand-black/60 focus:text-brand-purple active:text-brand-purple transition-colors group">
                    <i className="fas fa-layer-group text-xl mb-1 group-active:scale-90 transition-transform"></i>
                    <span className="text-[10px] font-bold">Services</span>
                 </button>

                 {/* Item 2: Products */}
                 <button onClick={() => scrollToSection('products')} className="flex flex-col items-center justify-center w-full h-full text-brand-black/60 focus:text-brand-purple active:text-brand-purple transition-colors group">
                    <i className="fas fa-box-open text-xl mb-1 group-active:scale-90 transition-transform"></i>
                    <span className="text-[10px] font-bold">Products</span>
                 </button>

                 {/* Center Spacer for Button */}
                 <div className="w-full pointer-events-none"></div>

                 {/* Item 4: Contact */}
                 <button onClick={onContactClick} className="flex flex-col items-center justify-center w-full h-full text-brand-black/60 focus:text-brand-purple active:text-brand-purple transition-colors group">
                    <i className="fas fa-paper-plane text-xl mb-1 group-active:scale-90 transition-transform"></i>
                    <span className="text-[10px] font-bold">Contact</span>
                 </button>

                 {/* Item 5: Menu Toggle */}
                 <button onClick={onMenuToggle} className="flex flex-col items-center justify-center w-full h-full text-brand-black/60 focus:text-brand-purple active:text-brand-purple transition-colors group">
                    <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'} text-xl mb-1 group-active:scale-90 transition-transform`}></i>
                    <span className="text-[10px] font-bold">{isMenuOpen ? 'Close' : 'Menu'}</span>
                 </button>

                 {/* Floating Center Button */}
                 <button
                    onClick={onChatToggle}
                    aria-label="Open AI Chat Assistant"
                    className="absolute top-[-20px] left-1/2 -translate-x-1/2 w-14 h-14 bg-brand-purple text-white rounded-full shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)] flex items-center justify-center border-4 border-brand-off-white text-2xl z-10 hover:scale-110 active:scale-95 transition-all duration-200"
                 >
                    <i className="fas fa-sparkles"></i>
                 </button>
            </div>
        </nav>
    );
};

const ThreeGridBackground: React.FC = () => {
    const mountRef = useRef<HTMLDivElement>(null);
    const frameIdRef = useRef<number>(0);
  
    useEffect(() => {
        if (!mountRef.current) return;
  
        const scene = new THREE.Scene();
        scene.background = new THREE.Color('#F8F8F8'); 
        scene.fog = new THREE.Fog('#F8F8F8', 10, 50);
  
        const camera = new THREE.PerspectiveCamera(70, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
        camera.position.set(0, 5, 10);
        camera.lookAt(0, 0, 0);
  
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        mountRef.current.appendChild(renderer.domElement);
  
        const geometry = new THREE.PlaneGeometry(100, 100, 60, 60);
        const material = new THREE.MeshBasicMaterial({ 
            color: 0x5F2EEA, 
            wireframe: true,
            transparent: true,
            opacity: 0.2 
        });
        
        const plane = new THREE.Mesh(geometry, material);
        plane.rotation.x = -Math.PI / 2;
        scene.add(plane);
  
        const originalPositions = Float32Array.from(geometry.attributes.position.array);
        const count = geometry.attributes.position.count;
        const clock = new THREE.Clock();
  
        const animate = () => {
            const time = clock.getElapsedTime();
            const positionAttribute = geometry.attributes.position;
            
            for (let i = 0; i < count; i++) {
                const x = originalPositions[i * 3];
                const y = originalPositions[i * 3 + 1];
                const waveHeight = 1.5;
                const z = Math.sin(x * 0.2 + time * 0.5) * Math.cos(y * 0.2 + time * 0.3) * waveHeight;
                positionAttribute.setZ(i, z);
            }
            positionAttribute.needsUpdate = true;
            plane.rotation.z = time * 0.05;
    
            renderer.render(scene, camera);
            frameIdRef.current = requestAnimationFrame(animate);
        };
  
        animate();
  
        const handleResize = () => {
            if (!mountRef.current) return;
            const width = mountRef.current.clientWidth;
            const height = mountRef.current.clientHeight;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        };
  
        window.addEventListener('resize', handleResize);
  
        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(frameIdRef.current);
            if (mountRef.current) {
                mountRef.current.removeChild(renderer.domElement);
            }
            geometry.dispose();
            material.dispose();
        };
    }, []);
  
    return <div ref={mountRef} className="absolute inset-0 w-full h-full -z-1 pointer-events-none" aria-hidden="true" />;
};

const HeroSection: React.FC<{ onSubmit: (msg: string) => void }> = ({ onSubmit }) => {
    const [inputValue, setInputValue] = useState('');
    const [placeholderText, setPlaceholderText] = useState('What will you create? The possibilities are endless.');

    useEffect(() => {
        const updatePlaceholder = () => {
            if (window.innerWidth < 768) {
                setPlaceholderText('What will you create?');
            } else {
                setPlaceholderText('What will you create? The possibilities are endless.');
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
        <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden p-6">
            <ThreeGridBackground />
            {/* Floating AI Agent 1 */}
            <div data-sticker="true" data-speed="0.5" className="hidden md:flex absolute top-40 left-[10%] w-24 h-24 bg-brand-yellow rounded-full items-center justify-center text-brand-black text-4xl shadow-lg z-10">
                <i className="fas fa-robot"></i>
            </div>
            {/* Floating AI Agent 2 */}
            <div data-sticker="true" data-speed="-0.3" className="hidden md:flex absolute bottom-24 right-[20%] w-32 h-32 bg-brand-lime rounded-2xl -rotate-12 items-center justify-center text-brand-black text-5xl shadow-lg z-10">
                <i className="fas fa-brain"></i>
            </div>
            {/* Floating AI Agent 3 */}
            <div data-sticker="true" data-speed="0.2" className="hidden md:flex absolute top-24 right-[15%] w-20 h-20 bg-brand-red rounded-lg rotate-12 items-center justify-center text-white text-3xl shadow-lg z-10">
                <i className="fas fa-code-branch"></i>
            </div>

            <div className="relative z-20 text-center max-w-4xl mx-auto">
                <h1 className="font-black text-4xl md:text-6xl lg:text-7xl leading-tight md:leading-none mb-8 md:mb-12">
                    <span className="block 2xl:inline" data-hero-word="AI-Powered.">AI-Powered. </span>
                    <span className="block text-brand-purple 2xl:inline" data-hero-word="Human-Engineered.">Human-Engineered.</span>
                </h1>
                
                <div className="mt-8 relative max-w-2xl mx-auto w-full group" data-hero-sub>
                    <div className="absolute inset-0 bg-brand-black rounded-xl translate-x-2 translate-y-2 transition-transform group-hover:translate-x-3 group-hover:translate-y-3"></div>
                    <input 
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                        placeholder={placeholderText}
                        aria-label="Ask the AI bot what you want to create"
                        className="relative w-full bg-white border-2 border-brand-black rounded-xl py-4 px-6 text-lg md:text-xl font-mono shadow-sm focus:outline-none focus:ring-0 placeholder:text-brand-black/40 text-center md:text-left"
                        autoFocus
                    />
                    <div className="hidden md:block absolute right-4 top-1/2 -translate-y-1/2 text-brand-black/30 pointer-events-none">
                        <i className="fas fa-level-down-alt rotate-90"></i>
                    </div>
                </div>

                <div className="mt-10" data-hero-sub>
                    <button onClick={handleSubmit} className="inline-block bg-brand-purple text-white px-10 py-4 rounded-xl font-bold border-2 border-brand-black text-xl sticker-card sticker-hover shadow-[4px_4px_0px_#1A1A1A]">
                        Submit
                    </button>
                </div>
            </div>
        </section>
    );
};

const ScrollingTicker: React.FC = () => {
    const items = ['OpenAI', 'Gemini', 'React', 'Python', 'AWS', 'Langchain', 'Next.js', 'Webflow'];
    const repeatedItems = [...items, ...items, ...items];
    return(
        <div className="py-6 bg-brand-yellow border-y-4 border-brand-black overflow-hidden headline-skew my-12" aria-hidden="true">
            <div className="w-full inline-flex flex-nowrap">
                <div className="flex items-center justify-center animate-infinite-scroll space-x-12">
                    {repeatedItems.map((item, index) => (
                        <div key={index} className="flex items-center space-x-4">
                            <span className="text-4xl font-extrabold">{item}</span>
                            <i className="fas fa-bolt text-3xl"></i>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const ServicesSection: React.FC<{ onServiceClick: (service: any) => void }> = ({ onServiceClick }) => (
    <section id="services" className="py-20 px-6">
        <div className="container mx-auto max-w-5xl">
            <h2 className="text-5xl md:text-7xl font-black text-center mb-4 headline-skew">Our Services</h2>
            <p className="text-center text-lg max-w-2xl mx-auto mb-16 text-brand-black/70">Your one-stop-shop for everything AI & software. We concept, build, and scale your vision.</p>
            <div className="flex flex-col gap-6">
                {servicesData.map((service, index) => (
                    <article 
                        key={index} 
                        className="group sticker-card sticker-hover p-6 rounded-2xl flex items-center gap-6 cursor-pointer"
                        onClick={() => onServiceClick(service)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && onServiceClick(service)}
                        aria-label={`Learn more about ${service.title}`}
                    >
                        <div className={`w-16 h-16 ${service.color} rounded-lg flex-shrink-0 flex items-center justify-center text-white text-3xl`}>
                           <i className={service.graphic}></i>
                        </div>
                        <div className="flex-grow">
                            <h3 className="text-3xl font-bold">{service.title}</h3>
                            <p className="mt-1 text-brand-black/70">{service.description}</p>
                        </div>
                         <div className="text-3xl text-brand-black/50 group-hover:text-brand-purple transition-transform duration-300 transform group-hover:translate-x-2">
                            <i className="fas fa-arrow-right"></i>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    </section>
);

const ProductsSection: React.FC = () => (
    <section id="products" className="py-24 px-6 bg-brand-black bg-radiant text-white overflow-hidden">
        <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-20">
                <h2 className="text-5xl md:text-7xl font-black headline-skew mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white to-brand-off-white/70">
                    Our Products
                </h2>
                <p className="text-xl text-white/60 max-w-2xl mx-auto">
                    A showcase of excellence. We build scalable, agentic, and beautiful software that powers businesses.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {productsData.map((product, index) => (
                    <article 
                        key={index}
                        className={`group relative bg-neutral-900 border-2 border-white/20 p-8 rounded-2xl transition-all duration-500 hover:-translate-y-2 ${product.border} ${product.glow} flex flex-col`}
                    >
                        {/* Top Icon & Title */}
                        <div className="flex items-start justify-between mb-6">
                            <div className={`w-16 h-16 rounded-xl bg-brand-black border border-white/10 flex items-center justify-center text-3xl ${product.accent} transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}>
                                <i className={product.icon}></i>
                            </div>
                            <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:bg-white group-hover:text-brand-black">
                                <i className="fas fa-arrow-right -rotate-45 group-hover:rotate-0 transition-transform duration-300"></i>
                            </div>
                        </div>

                        <h3 className="text-2xl font-black uppercase tracking-wide mb-2">{product.title}</h3>
                        <h4 className={`text-sm font-mono font-bold uppercase tracking-wider mb-4 ${product.accent} opacity-80`}>{product.subtitle}</h4>
                        <p className="text-white/60 leading-relaxed mb-6 flex-grow">{product.description}</p>
                        
                        {/* Links Footer */}
                        {product.links && (
                            <div className="mt-auto pt-6 border-t border-white/10 flex gap-4">
                                {Object.entries(product.links).map(([key, url]) => {
                                    let iconClass = '';
                                    let label = '';
                                    if (key === 'ios') { iconClass = 'fab fa-app-store-ios'; label = 'Download on iOS'; }
                                    else if (key === 'android') { iconClass = 'fab fa-google-play'; label = 'Download on Android'; }
                                    else if (key === 'webApp') { iconClass = 'fas fa-laptop'; label = 'Open Web App'; }
                                    else if (key === 'website') { iconClass = 'fas fa-globe'; label = 'Visit Website'; }
                                    
                                    return (
                                        <a key={key} href={url} target="_blank" rel="noopener noreferrer" aria-label={`${product.title} - ${label}`} className="text-white/40 hover:text-white transition-colors text-xl" title={label}>
                                            <i className={iconClass}></i>
                                        </a>
                                    );
                                })}
                            </div>
                        )}

                        {/* Decorative blurred background blob */}
                        <div className={`absolute -bottom-4 -right-4 w-32 h-32 bg-current opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-700 pointer-events-none ${product.accent.replace('text-', 'bg-')}`}></div>
                    </article>
                ))}
            </div>
        </div>
    </section>
);

const PhilosophySection: React.FC = () => (
    <section id="philosophy" className="py-20 px-6 bg-brand-pink bg-grid">
         <div className="container mx-auto max-w-5xl">
             <h2 className="text-5xl md:text-7xl font-black text-center mb-16 headline-skew">Our Philosophy</h2>
             <div className="relative flex flex-col items-center gap-8">
                {philosophyData.map((item, index) => (
                     <div key={index} className="flex items-center gap-8 w-full">
                        <div className="relative z-10 w-24 h-24 rounded-full bg-brand-purple text-white flex-shrink-0 flex items-center justify-center border-4 border-brand-black sticker-card">
                            <i className={`${item.icon} text-3xl`}></i>
                        </div>
                        <div className="sticker-card sticker-hover p-6 rounded-2xl w-full">
                             <h3 className="text-3xl font-bold">{item.title}</h3>
                            <p className="mt-1 text-brand-black/70">{item.description}</p>
                        </div>
                     </div>
                ))}
             </div>
         </div>
    </section>
);

const TeamSection: React.FC = () => (
    <section id="team" className="py-24 px-6 bg-white">
        <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-16">
                <h2 className="text-5xl md:text-7xl font-black headline-skew mb-4">Leadership Team</h2>
                <p className="text-lg text-brand-black/60">Friendly faces, expert minds. We're easy to work with.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
                {teamData.map((member, index) => (
                    <div key={index} className="flex flex-col items-center text-center group">
                        {/* Avatar Container */}
                        <div className="relative mb-6 cursor-pointer transform transition-transform duration-300 hover:scale-105 hover:-rotate-3">
                            <div className={`w-40 h-40 rounded-full ${member.color} flex items-center justify-center border-4 border-brand-black shadow-[6px_6px_0px_#1A1A1A] group-hover:shadow-[3px_3px_0px_#1A1A1A] transition-all duration-200`}>
                                <i className={`${member.icon} text-6xl ${member.text}`}></i>
                            </div>
                             {/* Decorative spark */}
                            <div className="absolute -top-2 -right-2 text-3xl text-brand-yellow opacity-0 group-hover:opacity-100 animate-bounce delay-75">✨</div>
                        </div>
                        
                        <h3 className="text-2xl font-black text-brand-black mb-1">{member.name}</h3>
                        <p className="text-xs font-bold uppercase tracking-widest text-brand-black/50 mb-3">{member.role}</p>
                        
                        {member.linkedin && (
                            <a 
                                href={typeof member.linkedin === 'string' ? member.linkedin : "#"} 
                                target={typeof member.linkedin === 'string' ? "_blank" : ""} 
                                rel="noopener noreferrer" 
                                aria-label={`${member.name}'s LinkedIn Profile`}
                                className="text-brand-purple text-2xl hover:scale-125 transition-transform"
                            >
                                <i className="fab fa-linkedin"></i>
                            </a>
                        )}
                    </div>
                ))}
            </div>
        </div>
    </section>
);

const ProcessSection: React.FC = () => (
    <section id="process" className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
            <h2 className="text-5xl md:text-7xl font-black text-center mb-16 headline-skew">Our Process</h2>
            <div className="flex flex-col gap-12">
                {processData.map((phaseData, index) => (
                    <div key={index}>
                        <h3 className="text-3xl font-bold mb-8 text-center md:text-left">{phaseData.phase}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {phaseData.steps.map((step, stepIndex) => (
                                <div key={stepIndex} className="flex items-center gap-4 p-4 rounded-full bg-white border-2 border-brand-black sticker-card sticker-hover">
                                    <div className="w-12 h-12 bg-brand-lime rounded-full flex-shrink-0 flex items-center justify-center">
                                        <i className={`${step.icon} text-xl text-brand-black`}></i>
                                    </div>
                                    <span className="font-semibold text-lg">{step.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
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
        <div className="border-b-2 border-brand-purple/20 last:border-b-0 py-4 cursor-pointer" onClick={onToggle} aria-expanded={isOpen}>
            <div className="flex justify-between items-center gap-4">
                <h3 className="text-xl font-semibold text-white">{faq.question}</h3>
                <div className="faq-icon text-2xl text-brand-yellow transform transition-transform duration-300" style={{ transform: isOpen ? 'rotate(45deg)' : 'rotate(0)' }}>
                   <i className="fas fa-plus"></i>
                </div>
            </div>
            <div ref={answerRef} className="faq-answer" aria-hidden={!isOpen}>
                <p className="pt-4 text-white/70" dangerouslySetInnerHTML={{ __html: faq.answer }}></p>
            </div>
        </div>
    );
};

const FaqSection: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section id="faqs" className="py-24 px-6 bg-wavy">
            <div className="container mx-auto max-w-4xl relative">
                 <div className="absolute -top-12 -left-12 w-32 h-32 text-8xl opacity-20">🤔</div>
                 <div className="absolute -bottom-12 -right-12 w-32 h-32 text-8xl opacity-20 rotate-12">💡</div>
                 
                 <div className="relative sticker-card bg-brand-purple p-8 md:p-12 rounded-2xl">
                    <h2 className="text-5xl md:text-7xl font-black text-center mb-8 text-white headline-skew">Any Questions?</h2>
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
    // Combine and duplicate the data for seamless single-row loop
    const allTestimonials = [...testimonialsData, ...testimonialsData];

    return (
        <section className="py-24 bg-brand-off-white overflow-hidden">
            <div className="container mx-auto max-w-7xl px-6 mb-12 text-center">
                <h2 className="text-5xl md:text-7xl font-black headline-skew mb-4">What People Say</h2>
                <p className="text-lg text-brand-black/60">Don't just take our word for it.</p>
            </div>

            {/* Single Row - Left to Right */}
            <div className="flex mb-8 overflow-hidden relative">
                <div className="flex animate-infinite-scroll hover:[animation-play-state:paused] space-x-8 px-8 w-max">
                    {allTestimonials.map((t, i) => (
                        <div key={i} className="w-[350px] md:w-[450px] flex-shrink-0 bg-white p-6 rounded-2xl border-3 border-brand-black shadow-[6px_6px_0px_#1A1A1A] flex flex-col">
                            <div className="flex items-center gap-4 mb-4">
                                <div className={`w-12 h-12 ${t.color} rounded-full border-2 border-brand-black flex items-center justify-center text-white font-bold text-xl shadow-[2px_2px_0px_#1A1A1A]`}>
                                    {t.name.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm leading-tight">{t.name}</h4>
                                    <p className="text-xs text-brand-black/60 leading-tight mt-1 line-clamp-2">{t.role}</p>
                                </div>
                            </div>
                            <div className="relative flex-grow">
                                <i className="fas fa-quote-left text-brand-purple/20 text-4xl absolute -top-2 -left-2"></i>
                                <p className="text-sm relative z-10 pt-2 pl-2 italic font-medium text-brand-black/80 leading-relaxed">
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

const ContactCTA: React.FC<{ onContactClick: () => void }> = ({ onContactClick }) => (
    <section id="contact" className="py-20 px-6 text-center bg-grid">
        <div className="container mx-auto max-w-2xl">
            <h2 className="text-5xl md:text-7xl font-black headline-skew">Have a Project?</h2>
            <p className="mt-4 mb-8 text-lg text-brand-black/70">Let's build something amazing together. Reach out and we'll get back to you within 24 hours.</p>
            <button onClick={onContactClick} className="inline-block bg-brand-purple text-white px-8 py-4 rounded-xl font-bold border-2 border-brand-black text-xl sticker-card sticker-hover">
                Get In Touch
            </button>
        </div>
    </section>
);

const FooterThreeBackground: React.FC = () => {
    const mountRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        if (!mountRef.current) return;
        
        const scene = new THREE.Scene();
        scene.background = new THREE.Color('#2a263d');
        
        const camera = new THREE.PerspectiveCamera(75, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
        camera.position.z = 5;
        
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        mountRef.current.appendChild(renderer.domElement);
        
        // Create particles
        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCount = 150; // subtle amount
        const posArray = new Float32Array(particlesCount * 3);
        
        for(let i = 0; i < particlesCount * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * 20;
        }
        
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        
        const material = new THREE.PointsMaterial({
            size: 0.05,
            color: 0xffffff,
            transparent: true,
            opacity: 0.6,
        });
        
        const particlesMesh = new THREE.Points(particlesGeometry, material);
        scene.add(particlesMesh);
        
        const animate = () => {
            requestAnimationFrame(animate);
            particlesMesh.rotation.y += 0.0005;
            particlesMesh.rotation.x += 0.0002;
            // Gentle rising effect
            particlesMesh.position.y += 0.001;
            if(particlesMesh.position.y > 2) particlesMesh.position.y = -2;

            renderer.render(scene, camera);
        };
        
        animate();
        
        const handleResize = () => {
            if (!mountRef.current) return;
            camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        };
        
        window.addEventListener('resize', handleResize);
        
        return () => {
            window.removeEventListener('resize', handleResize);
            if(mountRef.current) mountRef.current.removeChild(renderer.domElement);
            particlesGeometry.dispose();
            material.dispose();
        };
    }, []);
    
    return <div ref={mountRef} className="absolute inset-0 z-0 opacity-50 pointer-events-none" aria-hidden="true" />;
};

const NYCSkyline: React.FC = () => (
    <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center opacity-10 pointer-events-none overflow-hidden h-32 space-x-1 md:space-x-2 px-4 z-0" aria-hidden="true">
        {Array.from({length: 50}).map((_, i) => {
            const height = Math.max(20, Math.random() * 100);
            const width = Math.max(10, Math.random() * 40);
            return (
                <div 
                    key={i} 
                    className="bg-white rounded-t-sm" 
                    style={{
                        height: `${height}%`, 
                        width: `${width}px`,
                        opacity: Math.random() * 0.5 + 0.5
                    }} 
                />
            )
        })}
    </div>
);

const Footer: React.FC<{ onOpenTerms: () => void; onOpenPrivacy: () => void; }> = ({ onOpenTerms, onOpenPrivacy }) => {
    const footerLinks = [
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
        { icon: 'fas fa-map-marker-alt', text: 'New York City', href: null },
        { icon: 'fas fa-globe', text: 'GEEKINGOUT.NET', href: 'https://geekingout.net' },
        { icon: 'fas fa-envelope', text: 'geek@geekingout.net', href: 'mailto:geek@geekingout.net' },
        { icon: 'fas fa-phone', text: '646-883-4335 (GEEK)', href: 'tel:+16468834335' },
        { icon: 'fab fa-whatsapp', text: 'Whatsapp: 646.883.4335', href: 'https://wa.me/16468834335' },
    ];

    return (
        <footer className="relative bg-[#2a263d] text-white overflow-hidden pt-24 pb-8 mb-20 md:mb-0">
            <FooterThreeBackground />
            
            <div className="container mx-auto max-w-6xl px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-20">
                    
                    {/* Left Column: Contact Info */}
                    <div className="flex flex-col justify-center space-y-6">
                         <div className="mb-4">
                            <h3 className="text-3xl font-black tracking-tighter mb-2">Geeking Out</h3>
                            <div className="h-1 w-20 bg-brand-yellow rounded"></div>
                         </div>
                         {contactInfo.map((item, index) => (
                             <div key={index} className="flex items-center gap-4 group">
                                 <div className="w-10 text-center">
                                    <i className={`${item.icon} text-2xl text-white/80 group-hover:text-brand-yellow transition-colors`}></i>
                                 </div>
                                 {item.href ? (
                                     <a href={item.href} className="text-lg font-light tracking-wide hover:text-brand-yellow transition-colors">{item.text}</a>
                                 ) : (
                                     <span className="text-lg font-light tracking-wide">{item.text}</span>
                                 )}
                             </div>
                         ))}
                    </div>

                    {/* Right Column: Social Grid */}
                    <div className="flex flex-col justify-center">
                        <h3 className="text-2xl font-bold mb-8 md:text-center text-white/90">Connect With Us</h3>
                        <div className="grid grid-cols-3 sm:grid-cols-3 gap-6 max-w-md mx-auto md:mx-0 md:self-center">
                            {footerLinks.map((link, index) => (
                                <a 
                                    key={index} 
                                    href={link.href} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    aria-label={link.label}
                                    className="w-16 h-16 rounded-full bg-white text-[#2a263d] flex items-center justify-center text-3xl hover:bg-brand-yellow hover:scale-110 transition-all duration-300 shadow-lg"
                                >
                                    <i className={link.icon}></i>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer Bottom */}
                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-white/40 font-light tracking-wider gap-4">
                    <div className="flex items-center gap-2">
                        <span>Made with</span>
                        <span className="text-brand-red animate-pulse">♥</span>
                        <span>in NYC</span>
                    </div>
                    <div className="text-center md:text-right">
                        <span>© Copyright Geeking Out, LLC</span>
                    </div>
                    <div className="flex gap-6">
                        <button onClick={onOpenTerms} className="hover:text-white transition-colors cursor-pointer">Terms of Service</button>
                        <button onClick={onOpenPrivacy} className="hover:text-white transition-colors cursor-pointer">Privacy</button>
                    </div>
                </div>
            </div>

            <NYCSkyline />
        </footer>
    );
};

const AgentModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        organization: '',
        projectDescription: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Log to console/alert for feedback
        console.log("Form submitted:", formData);
        alert("Thank you! Your project details have been sent.");
        
        // Send to Google Sheets
        sendToGoogleSheets({
            source: 'Contact Form',
            ...formData
        });

        onClose();
    };

    return (
        <div className="fixed inset-0 bg-brand-black/60 z-[999] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="relative sticker-card bg-white p-8 rounded-2xl w-full max-w-lg animate-scale-in" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} aria-label="Close Modal" className="absolute top-4 right-4 text-3xl text-brand-black/40 hover:text-brand-red transition-colors">
                    <i className="fas fa-times-circle"></i>
                </button>
                <div className="text-center mb-6">
                    <div className="text-5xl mb-2 text-brand-purple"><i className="fas fa-magic-wand-sparkles"></i></div>
                    <h2 className="text-3xl font-bold">Start Your Project</h2>
                    <p className="text-brand-black/60">Describe your idea, and we'll get in touch.</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block font-semibold mb-1 text-left">Name</label>
                        <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="w-full p-3 border-2 border-brand-black rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple" />
                    </div>
                    <div>
                        <label htmlFor="email" className="block font-semibold mb-1 text-left">Email</label>
                        <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className="w-full p-3 border-2 border-brand-black rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple" />
                    </div>
                     <div>
                        <label htmlFor="organization" className="block font-semibold mb-1 text-left">Organization</label>
                        <input type="text" id="organization" name="organization" value={formData.organization} onChange={handleChange} className="w-full p-3 border-2 border-brand-black rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple" />
                    </div>
                    <div>
                        <label htmlFor="projectDescription" className="block font-semibold mb-1 text-left">Describe your Project</label>
                        <textarea id="projectDescription" name="projectDescription" placeholder="e.g., I want to build an AI chatbot for my e-commerce site..." value={formData.projectDescription} onChange={handleChange} required rows={4} className="w-full p-3 border-2 border-brand-black rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple resize-y"></textarea>
                    </div>
                    <button type="submit" className="w-full bg-brand-purple text-white px-8 py-4 rounded-xl font-bold border-2 border-brand-black text-lg sticker-card sticker-hover">
                        Launch Project
                    </button>
                </form>
            </div>
        </div>
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
        <div className="fixed inset-0 bg-brand-black/60 z-[999] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="relative sticker-card bg-white p-8 rounded-2xl w-full max-w-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} aria-label="Close Modal" className="absolute top-4 right-4 text-3xl text-brand-black/40 hover:text-brand-red transition-colors">
                    <i className="fas fa-times-circle"></i>
                </button>
                <div className="flex flex-col md:flex-row items-center gap-6 mb-6 text-center md:text-left">
                    <div className={`w-20 h-20 ${service.color} rounded-lg flex-shrink-0 flex items-center justify-center text-white text-4xl`}>
                        <i className={service.graphic}></i>
                    </div>
                    <div>
                        <h2 className="text-4xl font-bold">{service.title}</h2>
                        <p className="text-brand-black/60 text-lg">{service.description}</p>
                    </div>
                </div>
                <div className="space-y-4 text-brand-black/80 text-lg mb-8">
                   <p>{service.explanation}</p>
                </div>
                 <button onClick={onDiscuss} className="w-full bg-brand-lime text-brand-black px-8 py-4 rounded-xl font-bold border-2 border-brand-black text-lg sticker-card sticker-hover">
                    Discuss This Service
                </button>
            </div>
        </div>
    );
};

const LegalModal: React.FC<{ title: string; content: string; onClose: () => void }> = ({ title, content, onClose }) => {
    return (
        <div className="fixed inset-0 bg-brand-black/60 z-[999] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="relative sticker-card bg-white p-8 rounded-2xl w-full max-w-4xl h-[80vh] flex flex-col animate-scale-in" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} aria-label="Close Modal" className="absolute top-4 right-4 text-3xl text-brand-black/40 hover:text-brand-red transition-colors">
                    <i className="fas fa-times-circle"></i>
                </button>
                <div className="mb-6">
                    <h2 className="text-3xl font-bold border-b-4 border-brand-purple inline-block pb-1">{title}</h2>
                </div>
                <div className="flex-grow overflow-y-auto pr-4 text-brand-black/80 leading-relaxed whitespace-pre-wrap font-light">
                    {content}
                </div>
                <div className="mt-6 pt-4 border-t border-gray-200 text-right">
                    <button onClick={onClose} className="bg-brand-black text-white px-6 py-2 rounded-lg font-bold hover:bg-brand-purple transition-colors">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Chat Component ---
const ChatWidget: React.FC<{ 
    isOpen: boolean; 
    onToggle: (isOpen: boolean) => void; 
    externalMessage?: string;
    onMessageConsumed?: () => void;
}> = ({ isOpen, onToggle, externalMessage, onMessageConsumed }) => {
    const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([
        { role: 'model', text: 'Hi! I\'m the Geeking Out AI assistant. Ask me anything about our services or how we can help you build your next project!' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    const aiRef = useRef<GoogleGenAI | null>(null);
    const chatRef = useRef<any>(null);

    const systemInstruction = `
    You are the AI sales engineer for Geeking Out Agency.
    Agency Vibe: Innovative, 'Neo-Brutalist', Expert, Friendly, 'Geeking Out' on tech.
    Services:
    1. Automation & Agents: Custom agents for workflows.
    2. Fine Tuning: Specialized models on client data.
    3. RAG Systems: AI grounded in proprietary knowledge.
    4. Software Development: Bespoke web apps/platforms.
    5. Video Production: AI-enhanced content.
    6. AI Products: Launching new SaaS platforms.

    Your goal is to answer questions and capture leads.
    To capture a lead, you need: Name, Email, Project Description.
    Ask for these politely if the user seems interested in a project.
    Once you have all three, call the 'submitLead' tool.
    
    SPECIAL RESPONSE RULE:
    If the user asks about a "school website", "school site", or building a website for a school, you MUST respond with this exact message:
    "Great news—you’ve found the perfect partner for this! 👋

    We’ve been working with schools for over 10 years, and we’ve built our Schoolz platform specifically to make your life easier. We handle the heavy lifting: from hosting and domain setup to designing a beautiful site and launching your mobile apps (Apple & Android).

    We even come in to do staff photos and shoot a promo video for your homepage banner so the site looks professional from Day 1. Plus, we include unlimited maintenance, so your site is always up to date.

    Note: We are a fully approved DOE Vendor.

    What is the best email and phone number to reach you? I’ll send over a quote and a few links to our recent work so you can see what we do!"

    Keep your responses concise, friendly, and professional (unless using the special school response).
    `;

    const submitLeadTool: FunctionDeclaration = {
        name: "submitLead",
        description: "Submits a potential client's project lead to the sales team.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "Name of the person" },
            email: { type: Type.STRING, description: "Email address" },
            description: { type: Type.STRING, description: "Brief description of the project" }
          },
          required: ["name", "email", "description"]
        }
    };

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    useEffect(() => {
        aiRef.current = new GoogleGenAI({ apiKey: process.env.API_KEY });
        chatRef.current = aiRef.current.chats.create({
            model: 'gemini-2.5-flash-lite',
            config: {
                systemInstruction: systemInstruction,
                tools: [{ functionDeclarations: [submitLeadTool] }],
            }
        });
    }, []);

    const handleSend = async (text?: string) => {
        const msgToSend = text || inputValue;
        if (!msgToSend.trim() || !chatRef.current) return;
        
        setInputValue('');
        setMessages(prev => [...prev, { role: 'user', text: msgToSend }]);
        setIsLoading(true);

        try {
            const result = await chatRef.current.sendMessageStream({ message: msgToSend });
            
            let fullText = '';
            let functionCallsToProcess: any[] = [];

            setMessages(prev => [...prev, { role: 'model', text: '' }]);

            for await (const chunk of result) {
                const chunkText = chunk.text;
                if (chunkText) {
                    fullText += chunkText;
                    setMessages(prev => {
                        const newMessages = [...prev];
                        newMessages[newMessages.length - 1].text = fullText;
                        return newMessages;
                    });
                }
                // Check each chunk for function calls
                if (chunk.functionCalls && chunk.functionCalls.length > 0) {
                    functionCallsToProcess = chunk.functionCalls;
                }
            }

            if (functionCallsToProcess.length > 0) {
                 const call = functionCallsToProcess[0];
                 if (call.name === 'submitLead') {
                     // Simulate Tool Execution UI
                     setShowConfetti(true);
                     setTimeout(() => setShowConfetti(false), 5000);
                     
                     // Send Data to Google Sheets
                     sendToGoogleSheets({
                         source: 'AI Chat',
                         ...call.args
                     });

                     const toolResult = { result: "Lead submitted successfully. Inform the user we will be in touch shortly." };
                     
                     // Send Tool Response back to model
                     const nextResult = await chatRef.current.sendMessageStream({
                        message: [{
                            functionResponse: {
                                name: call.name,
                                id: call.id,
                                response: toolResult
                            }
                        }]
                     });
                     
                     let afterToolText = '';
                     for await (const chunk of nextResult) {
                        const text = chunk.text;
                        if(text) {
                            afterToolText += text;
                            setMessages(prev => {
                                const newMessages = [...prev];
                                newMessages[newMessages.length - 1].text = fullText + (fullText ? '\n' : '') + afterToolText;
                                return newMessages;
                            });
                        }
                     }
                 }
            }

        } catch (error) {
            console.error("Error sending message:", error);
            setMessages(prev => [...prev, { role: 'model', text: "Sorry, I'm having trouble connecting right now. Please try again later." }]);
        } finally {
            setIsLoading(false);
        }
    };

    // Effect to handle external message (e.g. from Hero Section)
    useEffect(() => {
        if (externalMessage && externalMessage.trim()) {
            if (!isOpen) onToggle(true);
            handleSend(externalMessage);
            if (onMessageConsumed) onMessageConsumed();
        }
    }, [externalMessage]);

    return (
        <>
            {/* Toggle Button - Hidden on Mobile now */}
            <button 
                onClick={() => onToggle(!isOpen)}
                aria-label="Toggle Chat Widget"
                className={`hidden md:flex fixed bottom-6 right-6 w-16 h-16 bg-brand-lime rounded-full border-4 border-brand-black items-center justify-center shadow-[4px_4px_0px_#1A1A1A] z-50 transition-transform hover:scale-110 hover:rotate-3 ${isOpen ? 'rotate-45 bg-brand-red text-white' : 'text-brand-black'}`}
            >
                <i className={`fas ${isOpen ? 'fa-plus' : 'fa-comment-alt'} text-2xl`}></i>
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-24 left-4 right-4 md:left-auto md:bottom-28 md:right-6 md:w-96 h-[60vh] md:h-[500px] bg-white border-4 border-brand-black rounded-2xl shadow-[8px_8px_0px_#1A1A1A] z-50 flex flex-col overflow-hidden animate-scale-in">
                    {/* Header */}
                    <div className="bg-brand-purple p-4 border-b-4 border-brand-black flex items-center gap-3 relative">
                        <div className="w-10 h-10 bg-brand-yellow rounded-full border-2 border-brand-black flex items-center justify-center">
                            <i className="fas fa-robot text-brand-black"></i>
                        </div>
                        <div>
                            <h3 className="font-black text-white text-lg leading-none">Geeking AI</h3>
                            <span className="text-xs font-mono text-brand-lime uppercase">Online • Flash-Lite</span>
                        </div>
                        {/* Close button for mobile only usually, but useful everywhere */}
                        <button onClick={() => onToggle(false)} aria-label="Close Chat" className="absolute right-4 text-white/70 hover:text-white">
                            <i className="fas fa-times"></i>
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-brand-off-white">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-3 rounded-xl border-2 border-brand-black text-sm font-medium ${msg.role === 'user' ? 'bg-brand-black text-white rounded-br-none' : 'bg-white text-brand-black rounded-bl-none'}`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                             <div className="flex justify-start">
                                <div className="bg-white p-3 rounded-xl border-2 border-brand-black rounded-bl-none flex gap-1">
                                    <span className="w-2 h-2 bg-brand-black rounded-full animate-bounce"></span>
                                    <span className="w-2 h-2 bg-brand-black rounded-full animate-bounce delay-100"></span>
                                    <span className="w-2 h-2 bg-brand-black rounded-full animate-bounce delay-200"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                        
                        {showConfetti && (
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10 overflow-hidden">
                                <div className="text-6xl animate-bounce">🎉</div>
                                <div className="absolute top-1/2 left-1/4 text-4xl animate-pulse delay-100">✨</div>
                                <div className="absolute top-1/3 right-1/4 text-5xl animate-pulse delay-75">🚀</div>
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <div className="p-3 bg-white border-t-4 border-brand-black flex gap-2">
                        <input 
                            type="text" 
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Type a message..."
                            className="flex-grow bg-brand-off-white border-2 border-brand-black rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-purple font-medium"
                        />
                        <button 
                            onClick={() => handleSend()}
                            disabled={isLoading}
                            aria-label="Send Message"
                            className="bg-brand-purple text-white px-4 rounded-lg border-2 border-brand-black hover:bg-brand-lime hover:text-brand-black transition-colors font-bold disabled:opacity-50"
                        >
                            <i className="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

// --- Main App Component ---

function App() {
     const [isMenuOpen, setIsMenuOpen] = useState(false);
     const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
     const [selectedService, setSelectedService] = useState<Service | null>(null);
     const [legalModal, setLegalModal] = useState<'terms' | 'privacy' | null>(null);
     
     // Chat state
     const [isChatOpen, setIsChatOpen] = useState(false);
     const [heroMessage, setHeroMessage] = useState('');

     const handleServiceClick = (service: Service) => {
        setSelectedService(service);
     };

     const handleCloseServiceModal = () => {
        setSelectedService(null);
     };
     
     const handleDiscussService = () => {
        setSelectedService(null);
        setIsAgentModalOpen(true);
     }

     const handleHeroSubmit = (msg: string) => {
        setHeroMessage(msg);
        setIsChatOpen(true);
     };

     useEffect(() => {
        const gsap = (window as any).gsap;
        const ScrollTrigger = (window as any).ScrollTrigger;
        gsap.registerPlugin(ScrollTrigger);
        
        // Custom Cursor
        const cursor = document.getElementById('custom-cursor');
        if(cursor) {
            window.addEventListener('mousemove', e => {
                gsap.to(cursor, {
                    x: e.clientX,
                    y: e.clientY,
                    duration: 0.2,
                    ease: 'power2.out'
                });
            });
        }
        
        // Robust animation context for cleanup
        let ctx = gsap.context(() => {
            // Hero Entrance
            const heroWords = gsap.utils.toArray('[data-hero-word]');
            heroWords.forEach(word => {
                const chars = (word as Element).textContent?.split('');
                (word as Element).innerHTML = '';
                if(chars) {
                    chars.forEach(char => {
                        const span = document.createElement('span');
                        span.textContent = char;
                        span.style.display = 'inline-block';
                        (word as Element).appendChild(span);
                    });
                }
            });
            gsap.from('[data-hero-word] span', {
                y: 100,
                opacity: 0,
                stagger: 0.05,
                duration: 1,
                ease: 'power4.out',
                delay: 0.5
            });
            gsap.from('[data-hero-sub]', { opacity: 0, y: 20, duration: 1, delay: 1.2, stagger: 0.2 });
            
            // Floating & Parallax AI Agents
            gsap.utils.toArray('[data-sticker]').forEach((sticker: any) => {
                // Continuous Floating Animation
                gsap.to(sticker, {
                    x: gsap.utils.random(-25, 25, 1),
                    y: gsap.utils.random(-25, 25, 1),
                    rotation: gsap.utils.random(-10, 10, 1),
                    ease: 'sine.inOut',
                    duration: gsap.utils.random(4, 6),
                    repeat: -1,
                    yoyo: true
                });

                // Parallax on Scroll
                const speed = sticker.dataset.speed || 1;
                gsap.to(sticker, {
                    y: (i: any, target: any) => ScrollTrigger.maxScroll(window) * 0.15 * parseFloat(speed as string),
                    ease: 'none',
                    scrollTrigger: {
                        scrub: 0.75,
                    }
                });
            });

            // Section Animations on Scroll
            const sections = gsap.utils.toArray('section, footer');
            sections.forEach((section: any) => {
                gsap.from(section, {
                    opacity: 0,
                    y: 50,
                    skewY: 3,
                    duration: 1,
                    ease: 'power4.out',
                    scrollTrigger: {
                        trigger: section,
                        start: 'top 85%',
                        toggleActions: 'play none none none',
                    }
                });
            });
        });

        // Cleanup function
        return () => ctx.revert();
    }, []);


    return (
        <>
            <Header 
                onContactClick={() => setIsAgentModalOpen(true)} 
                isMenuOpen={isMenuOpen}
                setIsMenuOpen={setIsMenuOpen}
            />
            <main>
                <HeroSection onSubmit={handleHeroSubmit} />
                <ScrollingTicker />
                <ServicesSection onServiceClick={handleServiceClick} />
                <ProductsSection />
                <PhilosophySection />
                <TeamSection />
                <ProcessSection />
                <FaqSection />
                <TestimonialsSection />
            </main>
            <ContactCTA onContactClick={() => setIsAgentModalOpen(true)} />
            <Footer 
                onOpenTerms={() => setLegalModal('terms')} 
                onOpenPrivacy={() => setLegalModal('privacy')} 
            />
            {isAgentModalOpen && <AgentModal onClose={() => setIsAgentModalOpen(false)} />}
            {selectedService && <ServiceModal service={selectedService} onClose={handleCloseServiceModal} onDiscuss={handleDiscussService} />}
            
            {legalModal === 'terms' && (
                <LegalModal 
                    title="Terms of Service" 
                    content={termsContent} 
                    onClose={() => setLegalModal(null)} 
                />
            )}
            {legalModal === 'privacy' && (
                <LegalModal 
                    title="Privacy Policy" 
                    content={privacyContent} 
                    onClose={() => setLegalModal(null)} 
                />
            )}
            <ChatWidget 
                isOpen={isChatOpen} 
                onToggle={setIsChatOpen} 
                externalMessage={heroMessage}
                onMessageConsumed={() => setHeroMessage('')}
            />
            <MobileNavBar 
                onChatToggle={() => setIsChatOpen(!isChatOpen)}
                onContactClick={() => setIsAgentModalOpen(true)}
                isMenuOpen={isMenuOpen}
                onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
            />
        </>
    );
}

export default App;
