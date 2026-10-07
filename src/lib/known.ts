/* WHO SHE ALREADY IS.
 *
 * The 13 October email goes to women already on JJ's list. Asking them for an
 * address the list already holds is a wall with no purpose, and if she types a
 * different one it creates a second profile. So the email button carries her
 * identity in the link, and this module reads it once, on first load.
 *
 * WHAT THIS FILE IS CAREFUL ABOUT. An email address in a query string is an
 * address in the address bar, in the share sheet, in the referrer of every
 * third-party request the page makes, and in whatever GA4, Clarity, GTM and
 * the Meta pixel record as the page location. So the two parameters are
 * removed with history.replaceState the moment they are read, BEFORE anything
 * else in the application starts (see main.tsx), and the address is kept in
 * session storage from then on.
 *
 * Both parameters are stripped whether or not the address is valid: a
 * malformed one is just as much of a leak as a good one.
 *
 * Every utm_* and hf_* parameter is left exactly where it was. Attribution is
 * read from the same query a moment later, and this must not disturb it.
 */
import { isEmail } from './leads';
import type { KnownWoman } from './logic';

/** The two parameters Klaviyo adds to the button link. See the handover, B1. */
export const KNOWN_PARAMS = ['e', 'fn'] as const;

const STORE_KEY = 'hf_known';

/**
 * Set once the event has been sent for her, so a reload cannot send it twice.
 *
 * On the ordinary path the event is sent by a button: she presses SHOW ME MY
 * RESULTS once and that is that. A woman from the list presses nothing, so it
 * is sent when her result opens — and a result page can be reloaded, shared
 * with herself, or reached again with the back button. Without this, each of
 * those is another HF Quiz Completed and another run of the flow.
 */
const SENT_KEY = 'hf_known_event_sent';

function store(known: KnownWoman): void {
  try {
    sessionStorage.setItem(STORE_KEY, JSON.stringify(known));
  } catch { /* private browsing */ }
}

export function readKnown(): KnownWoman | null {
  try {
    const raw = sessionStorage.getItem(STORE_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as Partial<KnownWoman>;
    /* Stored by this module, but it arrives through storage that anything on
       the origin can write, so it is checked again rather than trusted. */
    if (!v || typeof v.email !== 'string' || !isEmail(v.email)) return null;
    return { email: v.email, name: typeof v.name === 'string' ? v.name : '' };
  } catch {
    return null;
  }
}

export function clearKnown(): void {
  try {
    sessionStorage.removeItem(STORE_KEY);
    sessionStorage.removeItem(SENT_KEY);
  } catch { /* private browsing */ }
}

/**
 * True the first time it is asked in a session, and false every time after.
 *
 * The caller may send the event exactly when this returns true. Where storage
 * is denied it returns true every time: a flow that does not fire is a woman
 * who never gets her email, which is worse than a duplicate Klaviyo can be
 * told to ignore.
 */
export function claimKnownEventSlot(): boolean {
  try {
    if (sessionStorage.getItem(SENT_KEY)) return false;
    sessionStorage.setItem(SENT_KEY, '1');
    return true;
  } catch {
    return true;
  }
}

/**
 * Read `e` and `fn` off the first load, strip them from the URL, and remember
 * her. Returns whoever we now know about, including from an earlier load in
 * the same session.
 *
 * CALL THIS BEFORE THE FIRST RENDER AND BEFORE ANY ANALYTICS. By the time it
 * returns, the address is out of the URL.
 */
export function captureKnown(): KnownWoman | null {
  try {
    const url = new URL(window.location.href);
    const present = KNOWN_PARAMS.some((k) => url.searchParams.has(k));
    if (!present) return readKnown();

    const e = url.searchParams.get('e');
    const fn = url.searchParams.get('fn');

    /* Strip first, and strip both, whatever they turned out to hold. */
    for (const k of KNOWN_PARAMS) url.searchParams.delete(k);
    window.history.replaceState(
      window.history.state,
      '',
      url.pathname + url.search + url.hash,
    );

    if (!e || !isEmail(e)) return readKnown();

    const known: KnownWoman = { email: e.trim(), name: (fn ?? '').trim() };
    store(known);
    return known;
  } catch {
    return null;
  }
}
