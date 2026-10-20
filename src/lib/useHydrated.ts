import { useEffect, useState } from 'react';

/**
 * False on the server and on the first client render, true immediately after.
 *
 * THE BUG THIS EXISTS FOR, 20 October 2026. The deployed host renders this
 * app on a server first. Every cart link is built during render by shopUrl(),
 * which reads her attribution out of sessionStorage - and on a server there
 * is no sessionStorage, so readAttribution() returns {} and readQuizLanding()
 * falls back to 'main'. React then hydrates that markup and, with no state
 * change to provoke a second render, the href stays exactly as it was served.
 *
 * The result was visible in the raw HTML of the live page: every cart link
 * carried hf_funnel and hf_quiz_landing=main and not one utm_*, fbclid or
 * gclid, no matter what the ad sent her with. Attribution was being captured
 * correctly into sessionStorage and then never read by the links that needed
 * it, so every purchase arrived at Shopify unattributable.
 *
 * Reading it in a component gives that second render. The first client render
 * still matches what the server sent, which is what keeps hydration quiet;
 * the effect then flips this and the links rebuild with her real parameters.
 */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { setHydrated(true); }, []);
  return hydrated;
}
