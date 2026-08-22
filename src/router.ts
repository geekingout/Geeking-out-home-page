import { useSyncExternalStore } from 'react';

// Hash-based routing. The site ships as a single static index.html, so every URL has to resolve
// to that one file — "#/quests" works on any host with zero server config, "/quests" would not.
export type Route = { path: string; params: URLSearchParams };

export function parseHash(hash: string = window.location.hash): Route {
    const raw = hash.replace(/^#/, '') || '/';
    const [pathPart, query = ''] = raw.split('?');
    let path = pathPart.startsWith('/') ? pathPart : `/${pathPart}`;
    if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
    return { path: decodeURIComponent(path), params: new URLSearchParams(query) };
}

const subscribe = (onChange: () => void) => {
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
};
const getSnapshot = () => window.location.hash;

export function useRoute(): Route {
    const hash = useSyncExternalStore(subscribe, getSnapshot, () => '');
    return parseHash(hash);
}

// `to` is an app path like "/contact" or "/contact?quest=RAG". Returns the href for an <a>.
export const href = (to: string) => `#${to.startsWith('/') ? to : `/${to}`}`;

export function navigate(to: string) {
    window.location.hash = href(to);
}
