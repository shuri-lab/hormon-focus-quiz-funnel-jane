import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/global.css';
import './styles/kit.css';
import App from './App';
import { captureAttribution, captureQuizLanding } from './lib/analytics';
import { captureListLink } from './lib/listLink';

/* THESE THREE NOW LIVE IN lib/analytics.ts, AT MODULE SCOPE, AND RUN FROM
 * THERE. They are repeated here only because this file is the entry for
 * `vite dev` and `vite build`, and a reader of the entry should be able to
 * see what the session does on first load. All three are first-wins, so
 * whichever runs second is a no-op.
 *
 * DO NOT MOVE THEM BACK HERE AND DELETE THEM THERE. The deployed host does
 * not use this file: it builds src/ behind its own generated router and its
 * own entry, so for a week ?skip_email=1 did nothing in production while
 * passing every test locally. tests/listLink.test.ts guards it now.
 */

/* BEFORE THE FIRST RENDER, not in an effect.
 *
 * The cart links are built during render from stored attribution. Capturing
 * in App's useEffect meant the first paint had already been built from the
 * fallbacks, so a woman who landed from an ad and pressed buy without
 * triggering a re-render arrived at Shopify tagged utm_source=quiz with her
 * fbclid dropped — the exact traffic the carry-through exists for. */
/* FIRST OF ALL. k_id identifies a person, so it comes out of the address bar
   before GA4, Clarity or the Meta pixel can read window.location. It removes
   only its own two parameters; every utm_* and hf_* is left where it is for
   the capture on the next line. */
captureListLink();

captureAttribution();

/* The door she came in by, read from the first path of the session and never
   rewritten. Must run on the first load, before any internal navigation can
   make /quiz/kit look like the page she arrived on. */
captureQuizLanding();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
