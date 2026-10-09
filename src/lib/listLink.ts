/* THE LINK FROM JJ'S OWN LIST.
 *
 * A woman who arrives from an email JJ already sent her is already on the
 * list. Asking her for an address the list holds is a wall with no purpose,
 * and if she types a different one it creates a second profile.
 *
 * Two parameters, and they are independent of each other on purpose:
 *
 *   skip_email=1   step over the email screen. Nothing else.
 *   k_id=<id>      the Klaviyo profile this woman already is.
 *
 * SKIPPING DOES NOT REQUIRE AN ID. skip_email=1 on its own is the test mode:
 * the quiz runs end to end with no email screen and no Klaviyo recipient, so
 * the behaviour can be checked without a real subscriber. An id without a
 * skip is simply remembered and changes nothing.
 *
 * WHY k_id DOES NOT STAY IN THE ADDRESS BAR. It identifies a person. Left in
 * the query it would reach GA4 as page_location, Microsoft Clarity as the
 * recorded URL, the Meta pixel's event source, and the Referer header of
 * every third-party request the page makes — including the one to Shopify.
 * This project keeps personal data out of all of those, so both parameters
 * are removed with history.replaceState the moment they are read, before the
 * first render, and kept in session storage from then on.
 *
 * EVERY utm_* AND hf_* PARAMETER IS LEFT EXACTLY WHERE IT WAS. Attribution is
 * read from the same query a moment later and must not be disturbed.
 */

const STORE_KEY = 'hf_list_link';

/** Removed from the URL once read. Nothing else is touched. */
const OWN_PARAMS = ['skip_email', 'k_id'] as const;

export interface ListLink {
  /** True when the email screen should be stepped over. */
  skipEmail: boolean;
  /** The Klaviyo profile id, when the link carried one. */
  profileId: string | null;
}

const EMPTY: ListLink = { skipEmail: false, profileId: null };

/**
 * A Klaviyo profile id is short and alphanumeric. Anything else is somebody
 * playing with the query string, and is ignored rather than forwarded to
 * Klaviyo as if it were real.
 */
const looksLikeProfileId = (v: string): boolean => /^[A-Za-z0-9]{3,32}$/.test(v);

/** '1' is the canonical value. 'true' is accepted because people type it. */
const isOn = (v: string | null): boolean => v === '1' || v === 'true';

function store(link: ListLink): void {
  try {
    sessionStorage.setItem(STORE_KEY, JSON.stringify(link));
  } catch { /* private browsing */ }
}

export function readListLink(): ListLink {
  try {
    const raw = sessionStorage.getItem(STORE_KEY);
    if (!raw) return EMPTY;
    const v = JSON.parse(raw) as Partial<ListLink>;
    /* Written by this module, but session storage is writable by anything on
       the origin, so it is checked again rather than trusted. */
    const profileId = typeof v?.profileId === 'string' && looksLikeProfileId(v.profileId)
      ? v.profileId
      : null;
    return { skipEmail: v?.skipEmail === true, profileId };
  } catch {
    return EMPTY;
  }
}

/**
 * Read the two parameters once, on first load, and take them out of the URL.
 *
 * FIRST VALID VALUE WINS, as attribution does: a later navigation that has
 * lost the query must not clear a profile id captured on arrival, and a
 * second link cannot rename who she is mid-session.
 *
 * Called from main.tsx before the first render, because the quiz decides
 * whether to show the email screen during render and an effect is too late.
 */
export function captureListLink(): ListLink {
  const held = readListLink();

  let found = EMPTY;
  try {
    const q = new URLSearchParams(window.location.search);
    const id = q.get('k_id');
    found = {
      skipEmail: isOn(q.get('skip_email')),
      profileId: id && looksLikeProfileId(id) ? id : null,
    };

    /* Out of the address bar, whether or not either was valid: a malformed
       id is as much of a leak as a good one. Only these two are removed. */
    if (OWN_PARAMS.some((k) => q.has(k))) {
      OWN_PARAMS.forEach((k) => q.delete(k));
      const query = q.toString();
      window.history.replaceState(
        window.history.state,
        '',
        window.location.pathname + (query ? `?${query}` : '') + window.location.hash,
      );
    }
  } catch { /* no window, or a URL we cannot parse */ }

  const merged: ListLink = {
    skipEmail: held.skipEmail || found.skipEmail,
    profileId: held.profileId ?? found.profileId,
  };

  if (merged.skipEmail || merged.profileId) store(merged);
  return merged;
}
