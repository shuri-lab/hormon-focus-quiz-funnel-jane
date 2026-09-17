/* One place that knows about tracking, so no screen has to.
 *
 * Nothing here assumes a pixel is present. If Meta or GA has not loaded —
 * an ad blocker, a consent banner, local development — every call is a
 * no-op and the funnel carries on.
 *
 * The Meta pixel and GA tag belong in index.html, added when the account
 * IDs are confirmed. This module only fires events at them.
 */

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

const CLARITY_ID = import.meta.env.VITE_CLARITY_ID as string | undefined;

/**
 * Microsoft Clarity. Injected once, and only when VITE_CLARITY_ID is set, so
 * an unconfigured build ships no third-party script at all. Same contract as
 * fbq everywhere else in this file: if it is absent, every call is a no-op.
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

/** The shop link, carrying the quiz outcome and whatever the ad sent us. */
export function shopUrl(base: string, outcome: string, angle: string): string {
  const url = new URL(base);
  const attribution = readAttribution();
  url.searchParams.set('src', 'quiz');
  url.searchParams.set('utm_source', attribution.utm_source ?? 'quiz');
  url.searchParams.set('utm_medium', attribution.utm_medium ?? 'owned');
  url.searchParams.set('utm_campaign', attribution.utm_campaign ?? 'hormone_check');
  url.searchParams.set('utm_content', `offer_screen__${outcome}`);
  if (angle) url.searchParams.set('utm_term', angle);
  if (attribution.fbclid) url.searchParams.set('fbclid', attribution.fbclid);
  return url.toString();
}
