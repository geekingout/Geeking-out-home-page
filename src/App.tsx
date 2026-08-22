import React, { useEffect } from 'react';
import { SITE } from './content';
import { HUD } from './layout/HUD';
import { Footer } from './layout/Footer';
import { useRoute } from './router';
import { Atmosphere } from './ui';
import { Home } from './pages/Home';
import { Missions } from './pages/Missions';
import { Arsenal } from './pages/Arsenal';
import { Squad } from './pages/Squad';
import { Campaign } from './pages/Campaign';
import { Codex } from './pages/Codex';
import { Contact } from './pages/Contact';
import { Legal } from './pages/Legal';
import { NotFound } from './pages/NotFound';

type Page = { title: string; element: React.ReactNode };

const PAGES: Record<string, Page> = {
    '/': { title: `${SITE.name} | AI Automation, Agents & Custom Software. Based in NYC`, element: <Home /> },
    '/missions': { title: `Missions — Services | ${SITE.name}`, element: <Missions /> },
    '/arsenal': { title: `Arsenal — Products | ${SITE.name}`, element: <Arsenal /> },
    '/squad': { title: `Squad — Team | ${SITE.name}`, element: <Squad /> },
    '/campaign': { title: `Campaign — How We Work | ${SITE.name}`, element: <Campaign /> },
    '/codex': { title: `Codex — FAQ & Testimonials | ${SITE.name}`, element: <Codex /> },
    '/contact': { title: `Start Mission — Contact | ${SITE.name}`, element: <Contact /> },
    '/terms': { title: `Terms of Service | ${SITE.name}`, element: <Legal kind="terms" /> },
    '/privacy': { title: `Privacy | ${SITE.name}`, element: <Legal kind="privacy" /> },
};

export default function App() {
    const { path } = useRoute();
    const page = PAGES[path] ?? { title: `404 | ${SITE.name}`, element: <NotFound /> };

    // Every route change is a new screen: jump to the top and retitle the tab.
    useEffect(() => {
        document.title = page.title;
        window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    }, [path, page.title]);

    return (
        <div className="min-h-screen flex flex-col">
            <Atmosphere />
            <HUD />
            {/* key={path} remounts the page so its entrance animations replay on navigation;
                flex-1 keeps the footer at the bottom of short screens (404, legal) */}
            <main key={path} className="relative z-10 flex-1 animate-fade-in">
                {page.element}
            </main>
            <Footer />
        </div>
    );
}
