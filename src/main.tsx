import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/global.css';
import './styles/kit.css';
import App from './App';
import { captureAttribution } from './lib/analytics';
import { captureKnown } from './lib/known';

/* FIRST OF ALL, AND BEFORE ANY ANALYTICS.
 *
 * A woman arriving from JJ's list carries her email in the query (`e`, `fn`).
 * This reads it and takes it straight back out of the URL, so the address bar,
 * the share sheet, the referrer, GA4, Clarity, GTM and the Meta pixel never
 * see it. Everything below runs on a URL with no address in it, which is why
 * this line is above them and not in an effect. */
captureKnown();

/* BEFORE THE FIRST RENDER, not in an effect.
 *
 * The cart links are built during render from stored attribution. Capturing
 * in App's useEffect meant the first paint had already been built from the
 * fallbacks, so a woman who landed from an ad and pressed buy without
 * triggering a re-render arrived at Shopify tagged utm_source=quiz with her
 * fbclid dropped — the exact traffic the carry-through exists for. */
captureAttribution();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
