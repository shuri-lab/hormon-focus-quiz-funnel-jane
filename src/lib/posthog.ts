/* PostHog, as a fourth sink behind lib/analytics.ts.
 *
 * NO SCREEN IMPORTS THIS FILE. analytics.ts is still the one place that
 * knows about tracking; this only gives it somewhere else to push to,
 * alongside dataLayer, the Meta pixel and Clarity. Same contract as those
 * three: if the script is blocked, the key is empty or init never ran,
 * every call here is a no-op and the funnel carries on.
 *
 * WHY POSTHOG AS WELL AS GA4. GA4 has the history, through the GTM
 * container in index.html, but it cannot show a session recording next to
 * the funnel step the woman dropped at, and that is the question this
 * funnel needs answered. The event names below are the ones the
 * "Hormone Focus: Quiz Funnel" dashboard is already built against
 * (project 667442), so renaming one breaks a saved insight rather than
 * just a report column.
 *
 * THE LIBRARY IS LOADED LAZILY, and that is not an optimisation. posthog-js
 * reads a bare `location` at module scope, so a static import here would
 * throw the moment anything imports analytics.ts outside a DOM - which
 * tests/listLink.test.ts does, deliberately, to prove the session capture
 * does not depend on the entry file. Importing it from inside initPostHog
 * keeps that test honest, and has the side benefit of keeping ~60kb off the
 * first paint of a funnel whose whole problem is that nobody buys.
 *
 * Events fired before the chunk lands are queued, not dropped: the first
 * $pageview happens on the same tick as init.
 */
import type { PostHog } from 'posthog-js';

/**
 * The publishable project key, committed for the same reason the Clarity
 * project and the GTM container are: it is a write-only client key, it is
 * readable in the page source of every site that runs PostHog, and
 * committing it is what makes the tag work in CI, in any deploy and on a
 * teammate's clone with no .env set up first.
 *
 * VITE_POSTHOG_KEY still wins where it is set, so a build can be pointed at
 * a throwaway project instead of ingesting into the real one.
 */
const KEY =
  (import.meta.env.VITE_POSTHOG_KEY as string | undefined)
  || 'phc_kTK9U4b4kAALQcgKJYM9rvRECAGa9hCrm7bn4BDmHdjB';

const API_HOST = 'https://us.i.posthog.com';
const UI_HOST = 'https://us.posthog.com';

/**
 * Hosts that must never ingest.
 *
 * The same three the PostHog project already filters on, kept here as well
 * so a development click costs nothing rather than being thrown away after
 * it arrives. Preview deploys of this repo are on vercel.app, which is NOT
 * in this list on purpose: a preview is where the QA walk is done, and
 * excluding it would make that walk invisible.
 */
const BLOCKED = /localhost|127\.0\.0\.1|lovable\.app/;

/** The library, once the chunk has landed. Null until then, and forever on
    a host we do not track. */
let ph: PostHog | null = null;
/** Set the moment init is asked for, so a second call cannot load it twice. */
let started = false;
/** What was fired while the chunk was still in flight. */
const pending: Array<(p: PostHog) => void> = [];

function queue(fn: (p: PostHog) => void) {
  try {
    if (ph) fn(ph);
    else if (started) pending.push(fn);
  } catch { /* tracking must never break the funnel */ }
}

export function initPostHog(): void {
  try {
    if (started || typeof window === 'undefined') return;
    if (!KEY || BLOCKED.test(window.location.hostname)) return;
    started = true;

    void import('posthog-js').then(({ default: posthog }) => {
      posthog.init(KEY, {
        api_host: API_HOST,
        ui_host: UI_HOST,
        /* This is a SPA. The container script runs once and React Router
           does the rest, so pageviews are sent by hand from analytics.ts on
           each route change. Leaving this on counts the first route only. */
        capture_pageview: false,
        /* A person profile is created at the email gate and not before, so
           the women who bounce off question one do not each become a billed
           person record. */
        person_profiles: 'identified_only',
        autocapture: true,
      });

      /* On EVERY event, which is what keeps this funnel separate from
         mycoach.jjsmithonline.com inside the same project. */
      posthog.register({ product: 'hormone_focus' });
      ph = posthog;
      for (const fn of pending.splice(0)) {
        try { fn(posthog); } catch { /* as below */ }
      }
    }).catch(() => { /* blocked, offline: the funnel carries on */ });
  } catch { /* tracking must never break the funnel */ }
}

export function phCapture(event: string, props: Record<string, unknown> = {}): void {
  queue((p) => p.capture(event, props));
}

/**
 * The same capture, handed straight to navigator.sendBeacon.
 *
 * FOR EVENTS FIRED IMMEDIATELY BEFORE LEAVING THE PAGE, which here is
 * hf_cta_clicked and nothing else: the three buy links navigate to Shopify on
 * the same tab, so the click handler runs and the page is gone.
 *
 * posthog-js ALREADY HAS A SAFETY NET and this is a second one, not a
 * replacement. Checked in the installed 1.438.12: on pagehide its request
 * queue drains through sendBeacon, event requests first
 *
 *     [...events, ...rest].map(t => this.fl({ ...t, callback: undefined }, 'sendBeacon'))
 *
 * so a queued click normally survives. What that depends on is pagehide
 * firing, and an Android webview handing the tab to another origin is exactly
 * where that is least dependable. Beaconing at click time does not need the
 * page to get a word in.
 *
 * THE CAST IS NOT A HACK AROUND AN UNSUPPORTED OPTION. CaptureOptions in this
 * version declares only timestamp, uuid, set and setOnce, but the runtime
 * reads options.transport: the library's own unload path calls
 * `this.capture($pageleave, null, { transport: 'sendBeacon' })`. The type is
 * narrower than the function. Re-check this on a posthog-js upgrade; if the
 * option is ever genuinely dropped, the cast silently becomes a normal
 * capture and the pagehide drain above is what still carries it.
 *
 * NOT request_batching: false, which looks like the obvious knob and is the
 * wrong one. With batching off a capture leaves as an immediate XHR that the
 * navigation can cancel, and nothing is left queued for the drain to beacon.
 */
export function phCaptureBeacon(event: string, props: Record<string, unknown> = {}): void {
  queue((p) => {
    p.capture(event, props, { transport: 'sendBeacon' } as Parameters<typeof p.capture>[2]);
  });
}

/**
 * Her address becomes the distinct id at the email gate.
 *
 * IT MUST BE THE SAME STRING THE ORDER CARRIES, or the purchase lands on an
 * anonymous person and the funnel ends at the click-out. analytics.ts
 * lower-cases and trims before calling; the guard here is only so a caller
 * that loses the argument cannot create a person with no name.
 */
export function phIdentify(email: string, props: Record<string, unknown> = {}): void {
  if (!email) return;
  queue((p) => p.identify(email, { email, ...props }));
}
