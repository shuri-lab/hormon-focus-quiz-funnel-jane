/* One place that knows about tracking, so no screen has to.
 *
 * Nothing here assumes a pixel is present. If Meta or GA has not loaded —
 * an ad blocker, a consent banner, local development — every call is a
 * no-op and the funnel carries on.
 *
 * The Meta pixel and GA tag belong in index.html, added when the account
 * IDs are confirmed. This module only fires events at them.
 */

import { cartPath, type OfferKind } from './offer';

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    clarity?: (...args: unknown[]) => void;
  }
}

type Props = Record<string, unknown>;

function push(event: string, props: Props = {}) {
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event, ...props });
    window.gtag?.('event', event, props);
    clarity(event, props);
  } catch { /* tracking must never break the funnel */ }
}

/** Meta's own vocabulary. Standard events where one fits, custom otherwise. */
function meta(name: string, props: Props = {}, standard = false) {
  try {
    window.fbq?.(standard ? 'track' : 'trackCustom', name, props);
  } catch { /* as above */ }
}

/* -------------------------------------------------------- SPA pageviews -- */

/**
 * A virtual pageview for GTM.
 *
 * The container script in index.html runs once, on the first HTML document.
 * Every navigation after that is client-side — React Router swaps the tree
 * and the browser never requests a new document — so GTM's built-in Page View
 * trigger never fires again. This push is what makes the later routes visible.
 *
 * IN THE CONTAINER: trigger page tags on the Custom Event `page_view`, NOT on
 * the built-in Page View, or the first route counts twice: once from the
 * container loading and once from here.
 */
export function pageView(path: string, title: string): void {
  push('page_view', {
    page_path: path,
    page_location: window.location.href,
    page_title: title,
  });
}

/* ------------------------------------------------------------ clarity -- */

/**
 * The Clarity project. Committed rather than left to an env var, for the same
 * reason the GTM container ID is committed in index.html: a Clarity project
 * ID is not a secret — it is readable in the page source of every site that
 * runs Clarity — and committing it is what makes the tag work in CI, in any
 * deploy, and on a teammate's clone without a .env being set up first.
 *
 * VITE_CLARITY_ID still wins where it is set, so anyone can point a build at
 * a throwaway project instead of recording into the real one.
 */
const CLARITY_ID =
  (import.meta.env.VITE_CLARITY_ID as string | undefined) || 'yk2cnbfcxa';

/**
 * Microsoft Clarity. Injected once — the window.clarity guard is what makes a
 * second call a no-op, so this stays safe under StrictMode's double effects
 * and any future re-mount. Same contract as fbq everywhere else in this file:
 * if the script is blocked or absent, every call is a no-op and the funnel
 * carries on.
 *
 * Do NOT also paste Microsoft's raw snippet into index.html. This IS that
 * snippet; two copies would load the tag twice and record duplicate sessions.
 */
export function initClarity(): void {
  try {
    if (!CLARITY_ID || window.clarity) return;
    /* Microsoft's own snippet, as a function rather than an inline tag. */
    (function (c: Window, l: Document, a: string, r: string, i: string) {
      (c as unknown as Record<string, unknown>)[a] =
        (c as unknown as Record<string, unknown>)[a] ||
        function (...args: unknown[]) {
          (((c as unknown as Record<string, unknown>)[a] as { q?: unknown[] }).q ||=
            []).push(args);
        };
      const t = l.createElement(r) as HTMLScriptElement;
      t.async = true;
      t.src = 'https://www.clarity.ms/tag/' + i;
      const y = l.getElementsByTagName(r)[0];
      y.parentNode?.insertBefore(t, y);
    })(window, document, 'clarity', 'script', CLARITY_ID);
  } catch { /* tracking must never break the funnel */ }
}

/** A Clarity custom event. No-op when Clarity is absent. */
function clarity(name: string, props: Props = {}) {
  try {
    window.clarity?.('event', name);
    for (const [k, v] of Object.entries(props)) {
      window.clarity?.('set', k, String(v));
    }
  } catch { /* as above */ }
}

export const track = {
  landingView(slug: string) {
    push('landing_view', { angle: slug || 'default' });
    meta('ViewContent', { content_name: `landing:${slug || 'default'}` }, true);
  },

  quizStart(slug: string) {
    push('quiz_start', { angle: slug || 'default' });
    meta('QuizStart', { angle: slug || 'default' });
  },

  /** Fired once per question answered, so drop-off is visible per step. */
  quizStep(screen: string, index: number, total: number) {
    push('quiz_step', { screen, step: index, total });
    meta('QuizStep', { screen, step: index });
  },

  /** The email gate. This is the lead. */
  lead(outcome: string) {
    push('generate_lead', { outcome });
    meta('Lead', { content_name: `outcome:${outcome}` }, true);
  },

  resultView(outcome: string) {
    push('result_view', { outcome });
    meta('QuizResult', { outcome });
  },

  offerView(outcome: string) {
    push('view_offer', { outcome });
    meta('ViewContent', { content_name: 'offer', content_category: outcome }, true);
  },

  /** The Starter Guide page, by archetype. Her own plan, before any email. */
  planView(archetype: string) {
    push('view_plan', { archetype });
    meta('ViewContent', { content_name: 'plan', content_category: archetype }, true);
  },

  /** She changed which bottle count she is buying. Fired on change, not on load. */
  selectOption(offer: string, value: number) {
    push('select_option', { offer, value, currency: 'USD' });
    meta('SelectOption', { offer, value });
  },

  /** The click out to the shop. The doctor route never reaches this. */
  checkout(outcome: string, value: number) {
    push('begin_checkout', { outcome, value, currency: 'USD' });
    meta('InitiateCheckout', { value, currency: 'USD', content_name: 'Hormone Focus' }, true);
  },

  doctorRoute(reason: string) {
    push('doctor_route', { reason });
    meta('DoctorRoute', { reason });
  },
};

/* --------------------------------------------------------- attribution -- */

const AD_PARAMS = [
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
  'fbclid', 'gclid', 'ttclid', 'src',
  /* Funnel and variant, so a split test can be read on the Shopify side. */
  'hf_funnel', 'hf_variant',
];

const STORE_KEY = 'hf_attribution';

/** Capture the ad parameters on first load so they survive the whole funnel. */
export function captureAttribution(): void {
  try {
    const params = new URLSearchParams(window.location.search);
    const found: Record<string, string> = {};
    for (const key of AD_PARAMS) {
      const v = params.get(key);
      if (v) found[key] = v;
    }
    if (!Object.keys(found).length) return;
    sessionStorage.setItem(STORE_KEY, JSON.stringify({ ...readAttribution(), ...found }));
  } catch { /* private browsing */ }
}

export function readAttribution(): Record<string, string> {
  try {
    return JSON.parse(sessionStorage.getItem(STORE_KEY) ?? '{}');
  } catch {
    return {};
  }
}

/**
 * The cart link, carrying the quiz outcome and whatever the ad sent us.
 *
 * WHAT THE AD SENT WINS. If she arrived with a utm_content, that is the value
 * the ad account is reporting on and it is carried through untouched; the
 * quiz's own value is only a fallback for traffic that arrived with none.
 * The outcome is never lost either way, because hf_outcome always carries it.
 *
 * `base` supplies the STORE ORIGIN only. The path and the cart query come from
 * `cartPath()` in offer.ts, which is where the three modes live: one bottle,
 * two bottles by discount code, two bottles by variant. Passing the origin in
 * rather than repeating it keeps the store host named once, in logic.ts.
 *
 * `storefront=true` is set explicitly rather than inherited, so this cannot
 * silently become the direct-to-checkout link.
 */
export function shopUrl(
  base: string,
  outcome: string,
  angle: string,
  offer: OfferKind = 'single',
): string {
  const url = new URL(cartPath(offer), base);
  const ad = readAttribution();

  /* The cart, not the checkout. Asserted here, not assumed from the base. */
  url.searchParams.set('storefront', 'true');

  url.searchParams.set('src', 'quiz');
  url.searchParams.set('utm_source', ad.utm_source ?? 'quiz');
  url.searchParams.set('utm_medium', ad.utm_medium ?? 'owned');
  url.searchParams.set('utm_campaign', ad.utm_campaign ?? 'hormone_check');
  url.searchParams.set('utm_content', ad.utm_content ?? `offer_screen__${outcome}`);

  const term = ad.utm_term ?? angle;
  if (term) url.searchParams.set('utm_term', term);

  /* Pass-through, only when the ad actually set them. */
  for (const key of ['hf_funnel', 'hf_variant'] as const) {
    if (ad[key]) url.searchParams.set(key, ad[key]);
  }

  /* The quiz result, kept in its own param so carrying the ad's utm_content
     through does not cost us the outcome attribution. */
  url.searchParams.set('hf_outcome', outcome);

  /* Which of the three she chose, so the store side can read bundle mix
     without inferring it from the line items. */
  url.searchParams.set('hf_offer', offer);

  if (ad.fbclid) url.searchParams.set('fbclid', ad.fbclid);
  return url.toString();
}
