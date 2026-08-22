import React from 'react';
import { href } from '../router';
import { Button, Icon, Panel, Typewriter } from '../ui';

export const NotFound: React.FC = () => (
    <section className="page wrap max-w-3xl text-center">
        <div className="flex justify-center mb-8 text-brand-red animate-pulse-soft"><Icon name="signal" size={48} label="No signal" /></div>
        <p className="hud-label mb-4">Error 404</p>
        <h1 className="display title-gradient text-6xl md:text-8xl mb-10">Signal lost</h1>
        <Panel glow="red" corners padding="roomy" className="text-left">
            <Typewriter text="No screen exists at this coordinate. The link you followed is broken, or the page has been decommissioned." className="text-lg text-ink-dim" />
        </Panel>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button href={href('/')} variant="gold" icon="arrowLeft">Return to title</Button>
            <Button href={href('/contact')} variant="outline">Start mission</Button>
        </div>
    </section>
);
