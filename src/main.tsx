import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/global.css';
import App from './App';
import { captureAttribution } from './lib/analytics';

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
