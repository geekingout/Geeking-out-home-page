/**
 * Server entry, used only by the pre-render step.
 *
 * Every browser API in the app is reached from an effect or an event handler,
 * and effects do not run during renderToString — so the tree renders in Node
 * untouched. The single exception is the router, which normally reads
 * window.location; it takes the route as a prop here instead.
 */
import React from 'react';
import { renderToString } from 'react-dom/server';
import App from './App';
import { PAGES, NOT_FOUND, type PageDef } from './routes';

export const routes: PageDef[] = [...PAGES, NOT_FOUND];

export const render = (route: string) =>
    renderToString(
        <React.StrictMode>
            <App initialRoute={route} />
        </React.StrictMode>
    );
