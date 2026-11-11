/* Every screen in the quiz has an address.
 *
 * The screen used to live in history state, so the URL read /quiz from the
 * first question to the kit page. That made the funnel impossible to link
 * into, impossible to share a bug report about, and it is why the review
 * build needed a bar of jump buttons bolted across the top of the page —
 * a bar that ate two thirds of a phone screen and could never ship.
 *
 * With the step in the path, the bar is unnecessary: anyone can open any
 * screen by typing its URL, in production, on a phone, with no build flag.
 *
 * The slugs are words rather than ids. /quiz/q4b tells a marketer nothing
 * and tells an analytics report less; /quiz/when-it-started is legible in a
 * GA path report and in a shared link.
 */
import type { ScreenId } from '../lib/logic';

export const STEP_SLUG: Record<ScreenId, string> = {
  q1: 'symptoms',
  q2: 'what-bothers-you-most',
  q3: 'your-age',
  q4: 'your-cycle',
  q4b: 'how-long-ago',
  q5: 'when-you-notice-it',
  q6: 'what-you-have-tried',
  q7: 'what-you-want-back',
  stat: 'not-just-you',
  load: 'reading-your-answers',
  gate: 'your-result',
  r1: 'result',
  cause: 'whats-happening',
  plan: 'your-plan',
  meet: 'meet-hormone-focus',
  r2: 'your-kit',
  /* The kit offer, off the flow and at its own address. See ScreenId. */
  offerKit: 'kit',
  rDoc: 'speak-to-your-doctor',
};

const BY_SLUG = Object.fromEntries(
  Object.entries(STEP_SLUG).map(([id, slug]) => [slug, id as ScreenId]),
) as Record<string, ScreenId>;
/* The goal question's old address still opens it. */
BY_SLUG['what-you-want'] = 'q7';
/* The review screen was removed (Jane, 11 Nov). */
BY_SLUG['women-like-you'] = 'load';
/* The old off-flow address still opens the one-bottle page. */
BY_SLUG['offer-kit'] = 'offerKit';

/** The screen a path segment names, or null when it names nothing. */
/* DIRECTION 2: A CUT SCREEN'S ADDRESS GOES FORWARD. A shared or stale link
   to a screen that no longer exists lands on the screen that replaced it. */
const FORWARD: Partial<Record<ScreenId, ScreenId>> = {
  q5: 'q6', q7: 'load', cause: 'plan', meet: 'plan',
};

export const screenFromSlug = (slug: string | undefined): ScreenId | null => {
  const id = (slug && BY_SLUG[slug]) || null;
  return id ? FORWARD[id] ?? id : null;
};

/** The first screen, which is where an unaddressed /quiz lands. */
export const FIRST_STEP: ScreenId = 'q1';

/**
 * The path for a screen, under whichever angle she is in.
 *
 * `base` is '' for /quiz and '/bloating' for an angle, so the two shapes are
 * built in one place rather than concatenated at each call site.
 */
export const stepPath = (base: string, id: ScreenId): string =>
  `${base}/quiz/${STEP_SLUG[id]}`;
