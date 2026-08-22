import React from 'react';
import { PRIVACY, TERMS } from '../content';
import { href } from '../router';
import { Button, PageTitle, Panel } from '../ui';

/** Terms and Privacy, rendered as a document in the codex. */
export const Legal: React.FC<{ kind: 'terms' | 'privacy' }> = ({ kind }) => {
    const isTerms = kind === 'terms';
    return (
        <section className="page wrap max-w-4xl">
            <PageTitle chapter="§" eyebrow="Legal document" title={isTerms ? 'Terms of Service' : 'Privacy'} subtitle={isTerms ? 'The agreement that governs use of this site.' : 'What we collect, and what we do with it.'} />
            <Panel label={isTerms ? 'Terms' : 'Privacy'} corners padding="roomy">
                <div className="whitespace-pre-line text-ink-dim leading-relaxed">{(isTerms ? TERMS : PRIVACY).trim()}</div>
            </Panel>
            <div className="mt-10 flex flex-wrap gap-4">
                <Button href={href('/')} variant="outline" icon="arrowLeft">Back to title</Button>
                <Button href={href(isTerms ? '/privacy' : '/terms')} variant="ghost">{isTerms ? 'Privacy policy' : 'Terms of service'}</Button>
            </div>
        </section>
    );
};
