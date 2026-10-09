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
import { captureListLink } from './listLink';

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    clarity?: (...args: unknown[]) => void;
    _fbq?: unknown;
    /* Set once, so a re-mount cannot install a second pixel. */
    __hfMeta?: boolean;
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

/* --------------------------------------------------------------- meta -- */

/**
 * The Hormone Focus dataset. The same one the landing page uses and the same
 * one Shopify's Facebook integration posts to, so the ad click, the quiz and
 * the order all land in one place rather than three.
 */
export const META_DATASET_ID = '1614860232058835';

/**
 * Microsoft's pixel, with Jane's host guard.
 *
 * THE GUARD IS THE POINT. If a pixel is already on the page — a host, a tag
 * manager, a Shopify theme — initialising a second one doubles every
 * PageView and every report built on it. So we only install and init when
 * nothing else has, and the events below fire once either way.
 *
 * NO PURCHASE IS EVER FIRED HERE. The quiz hands her to Shopify and Shopify
 * owns the order, through the same dataset and its Conversions API. A
 * Purchase from this side would be a second count of a sale we did not see.
 */
export function initMeta(): void {
  try {
    if (window.__hfMeta) return;
    window.__hfMeta = true;

    const hostPixel = typeof window.fbq === 'function'
      || !!document.querySelector('script[src*="connect.facebook.net"]');

    if (!hostPixel) {
      /* Meta's own snippet, as a function rather than an inline tag. */
      (function (f: Record<string, unknown>, b: Document, e: string, v: string) {
        if (f.fbq) return;
        const n = function (...args: unknown[]) {
          const self = n as unknown as { callMethod?: (...a: unknown[]) => void; queue: unknown[] };
          if (self.callMethod) self.callMethod(...args);
          else self.queue.push(args);
        } as unknown as Record<string, unknown> & ((...a: unknown[]) => void);
        f.fbq = n;
        if (!f._fbq) f._fbq = n;
        n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
        const first = b.getElementsByTagName(e)[0];
        const t = b.createElement(e) as HTMLScriptElement;
        t.async = true; t.src = v;
        first?.parentNode?.insertBefore(t, first);
      })(window as unknown as Record<string, unknown>, document, 'script',
         'https://connect.facebook.net/en_US/fbevents.js');

      window.fbq?.('init', META_DATASET_ID);
      window.fbq?.('track', 'PageView');
    }

    /* Fires whether or not we own the pixel: one ViewContent for the quiz. */
    window.fbq?.('track', 'ViewContent', {
      content_name: 'Hormone Focus quiz',
      content_ids: ['hormone-focus'],
      content_type: 'product',
    });
  } catch { /* tracking must never break the funnel */ }
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

  /** The last question answered. Fired before the email gate, so the gap
      between this and generate_lead is the gate's own drop-off. */
  quizComplete(outcome: string) {
    push('quiz_complete', { outcome });
    meta('QuizComplete', { outcome });
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
  /* Which advertorial sent her, carried like any other attribution. Same
     name and same treatment as the landing page, so one Shopify report
     reads both doors. */
  'hf_presell',
  /* Kept for parity with the landing page's list. Harmless, still useful. */
  'utm_id',
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
    /* FIRST WINS. What is already stored is the acquisition, and it is not
       for a later page load to overwrite: a second landing with a partial
       or absent query, or an internal link someone tags by accident, must
       not be able to rename where she actually came from. */
    sessionStorage.setItem(STORE_KEY, JSON.stringify({ ...found, ...readAttribution() }));
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
/* ------------------------------------------------ which door she came in -- */

/**
 * The quiz landing page she ORIGINALLY entered through.
 *
 * Not the page she is on. Captured once, from the first path this session
 * sees, and never rewritten — so a woman who entered at /night-sweats and is
 * now reading /quiz/kit still reports night-sweats, which is the question
 * worth answering.
 *
 * A slug only. No answer, symptom or result ever becomes this value: it is
 * the door, and a door is not health information.
 */
const LANDING_KEY = 'hf_quiz_landing';

/** Every door, as its route spells it. '' is the generic cover. */
const DOORS = ['bloating', 'hot-flashes', 'night-sweats', 'sleep', 'weight', 'mood'];

/** The generic cover, and a direct arrival at the quiz with no cover at all. */
const MAIN = 'main';
const DIRECT = 'direct';

export function quizLandingFrom(pathname: string): string {
  const first = pathname.replace(/^\/+/, '').split('/')[0] ?? '';
  if (DOORS.includes(first)) return first;
  /* /quiz/... with no door in front of it: she arrived at the quiz itself. */
  if (first === 'quiz') return DIRECT;
  return MAIN;
}

/**
 * Read once, on the first load of the session, and kept.
 *
 * FIRST WINS, like the rest of attribution. An incoming hf_quiz_landing is
 * honoured above the path, so a link that already names the door keeps it.
 */
export function captureQuizLanding(): string {
  try {
    const held = sessionStorage.getItem(LANDING_KEY);
    if (held) return held;

    const fromQuery = new URLSearchParams(window.location.search).get(LANDING_KEY);
    const value = fromQuery && /^[a-z0-9-]{1,32}$/.test(fromQuery)
      ? fromQuery
      : quizLandingFrom(window.location.pathname);

    sessionStorage.setItem(LANDING_KEY, value);
    return value;
  } catch {
    return MAIN;
  }
}

export function readQuizLanding(): string {
  try { return sessionStorage.getItem(LANDING_KEY) ?? MAIN; } catch { return MAIN; }
}

/**
 * What is carried to Shopify, and nothing else.
 *
 * THE UTMs ARE HERS, NOT OURS. An earlier version of this function set
 * utm_source=bridge, utm_medium=quiz and utm_content per offer, which
 * overwrote the acquisition: a woman who arrived from an Instagram DM
 * reached checkout looking like quiz traffic, and the campaign that actually
 * paid for her could never be credited. The quiz adds nothing to these five
 * now — it passes on what it was given.
 *
 * Which offer she chose is not encoded here either. The variant in the cart
 * path already says it, so a parameter saying it again is redundant, and one
 * carrying her quiz RESULT would put a health inference in an ad URL.
 */
/** The value hf_funnel carries on every cart link the quiz builds. */
export const QUIZ_FUNNEL = 'quiz';

const PASS_THROUGH = [
  /* The acquisition, exactly as it arrived. */
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
  /* Click ids keep their own names: the platforms that issued them read
     them by exact name, so a prefix would break them. */
  'fbclid', 'gclid', 'ttclid',
  /* The advertorial she came through, and the campaign id where one was set. */
  'hf_presell', 'utm_id',
] as const;

/**
 * The cart link for an offer, carrying the attribution she arrived with.
 *
 * Built with URL and URLSearchParams throughout, so the query is assembled
 * rather than concatenated and the subscription's existing ?id=&quantity=
 * &selling_plan= cannot gain a second "?".
 *
 * Nothing is invented. A visitor with no attribution gets a clean cart link
 * and no empty parameters standing in for the ones she did not have.
 */
export function shopUrl(
  base: string,
  _outcome: string,
  _angle: string,
  offer: OfferKind = 'single',
): string {
  const url = new URL(cartPath(offer), base);
  const ad = readAttribution();

  /* The cart, not the checkout. Asserted rather than assumed from the base,
     because losing it sends her straight to payment. */
  if (url.pathname.includes(':')) url.searchParams.set('storefront', 'true');

  for (const key of PASS_THROUGH) {
    const value = ad[key];
    if (value) url.searchParams.set(key, value);
  }

  /* WHICH DOOR SHE CAME THROUGH, which is not the same question as where she
     came from. The utm_* above say Instagram or Klaviyo and are left exactly
     as they arrived; this says the quiz converted her rather than the
     landing page. Shopify then answers both from one order. */
  url.searchParams.set('hf_funnel', QUIZ_FUNNEL);

  /* And which of the quiz's own doors she entered by. A slug, never an
     answer: the door is not health information. */
  url.searchParams.set('hf_quiz_landing', readQuizLanding());

  /* THE SUBSCRIPTION NEEDS ONE MORE THING, and this is the bug it fixes.
   *
   * A cart permalink keeps its query across Shopify's redirect:
   *   /cart/<variant>:1?utm_source=x  ->  /cart?cart_link_id=..&utm_source=x
   * /cart/add does not:
   *   /cart/add?...&utm_source=x      ->  /cart
   * Every marketing parameter is dropped, so the subscription reached
   * checkout with no attribution at all while the other two were fine.
   *
   * The permalink shape cannot be used instead: /cart/<variant>:1 with a
   * selling_plan query does NOT attach the plan. Measured against the live
   * store, it adds the bottle at $49.99 as a one-off, which is a worse bug
   * than the one it would fix.
   *
   * So /cart/add stays, and return_to carries the attribution through the
   * redirect, which is where it survives. Verified against the live store:
   * plan 5529010287, "Deliver every month", $39.99. */
  if (url.pathname.endsWith('/cart/add')) {
    const carried = new URLSearchParams();
    for (const [k, v] of url.searchParams) {
      /* The cart's own instructions stay on /cart/add; only the marketing
         parameters need to survive to the cart page. */
      if (k === 'id' || k === 'quantity' || k === 'selling_plan') continue;
      carried.set(k, v);
    }
    url.searchParams.set('return_to', `/cart?${carried.toString()}`);
  }

  return url.toString();
}


/* ------------------------------------------------- the session bootstrap -- */

/**
 * CAPTURE THE SESSION HERE, NOT IN THE ENTRY FILE.
 *
 * All three of these used to be called only from src/main.tsx. That is the
 * entry for `vite dev`, `vite build` and every test in this repo, so it was
 * green everywhere and still did nothing on the deployed site: the host
 * builds this `src/` behind its own generated router and its own entry, and
 * never loads index.html or main.tsx at all. The symptom was
 * ?skip_email=1 being ignored in production while passing seven end-to-end
 * tests locally - the capture was simply never reached.
 *
 * So it hangs off a module instead of an entry. Every screen imports this
 * file (Landing, QuizContext, OfferPage, PlanPage, the buy buttons), so it
 * is in the first-load graph of every route whichever entry boots the app,
 * and module evaluation happens before that route renders - which is what
 * these three need, because a client-side navigation to /quiz/symptoms drops
 * the query and there is nothing left to read by the time the quiz mounts.
 *
 * ORDER MATTERS. captureListLink strips k_id and skip_email from the address
 * bar first, so a profile id cannot reach GA4 as page_location, Clarity as
 * the recorded URL, or the Referer of any third-party request. It leaves
 * every utm_* and hf_* alone for the two calls after it.
 *
 * ALL THREE ARE FIRST-WINS AND SAFE TO CALL TWICE, so main.tsx still calls
 * them and the second call is a no-op. Guarded on `window` because the host
 * renders this on a server first, where there is no address bar to read.
 */
if (typeof window !== 'undefined') {
  captureListLink();
  captureAttribution();
  captureQuizLanding();
}
