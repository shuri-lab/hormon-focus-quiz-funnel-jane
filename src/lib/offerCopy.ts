/* EVERY WORD THE OFFER PAGES SAY, except the customers' own.
 *
 * Customer reviews live in reviews.ts, because they are quoted and these are
 * authored. The gate in tests/copy.test.ts holds this file and fails the build
 * on a contraction or on a claim the brand may not make.
 *
 * THE COPY RULES, which survive any rewrite:
 *  - No contractions. House style.
 *  - Every product claim is JJ's published wording, in structure-function
 *    language: supports, helps ease, helps with. Never treats, ends or cures.
 *  - No timeframe and no quantified outcome IN THE BRAND'S VOICE. Where a
 *    timeframe appears it is what customers report, and it says so.
 *  - 800,000 appears only as CHIP_PROGRAMS, scoped to JJ's programs. It is
 *    never a Hormone Focus customer count.
 *  - 170 is the review count. It sits beside 4.9 and nowhere else.
 *
 * THIS REPOSITORY IS PUBLIC. Every string here ships to the browser.
 */
import { FDA_DISCLAIMER } from './content';
import type { Angle } from './angles';

/* ---------------------------------------------------------------- hero -- */

export interface OfferHero {
  /** The headline, in three parts. The middle one renders in plum. */
  h1a: string;
  h1b: string;
  h1c: string;
  /** How the headline is achieved, carrying the value props. */
  sub: string;
  /** The second beat, under the sub-headline. */
  beat: string;
  /** The closer's mini headline, at the bottom of the page. */
  close: string;
  /** Recognition lines, where the angle changes them. */
  lines?: string[];
  /** The tab title and meta description for this route. */
  title: string;
  description: string;
}

/**
 * The strip at the top of /live.
 *
 * It is the only manufactured-looking deadline on the page and it is not
 * manufactured: it is the window JJ says out loud on the broadcast.
 */
export const LIVE_STRIP_LEAD = 'You came from JJ’s Live.';
export const LIVE_STRIP_REST =
  ' The two-bottle Protocol, free shipping, through Monday night.';

export const LIVE_HERO: OfferHero = {
  h1a: 'The one I made ',
  h1b: 'for exactly this',
  h1c: '.',
  sub: 'Two capsules a day with a meal. Two bottles, because it takes more than one month to know. A 60-day guarantee, so the risk sits with us and not with you. The link you tapped is the one you heard tonight.',
  beat: 'Through Monday night.',
  close: 'Two bottles, free shipping, through Monday night.',
  lines: [
    'Awake at three, drenched.',
    'The belly that showed up though nothing else changed.',
    'Snapping at people you love.',
    'The word that goes missing mid-sentence.',
    'Wondering whether it is just you. It is not.',
  ],
  title: 'Hormone Focus — the 60-Day Protocol',
  description:
    'The two-bottle Protocol from JJ’s Live. Hormone Focus supports hormone balance for women in perimenopause and menopause. Every milligram disclosed.',
};

/* ------------------------------------------------------- the sections -- */

export const PAIN_EYEBROW = 'Does this sound like you?';

/** Counts the recognition lines, so the headline is never wrong about them. */
const COUNT_WORD: Record<number, string> = {
  2: 'Two', 3: 'Three', 4: 'Four', 5: 'Five', 6: 'Six',
};

export const painHeadline = (lines: number): string =>
  COUNT_WORD[lines]
    ? `${COUNT_WORD[lines]} separate problems, or one?`
    : 'Separate problems, or one?';

export const PAIN_TURN =
  'For most women over 40 it is one thing: estrogen swinging and not clearing. That is what Hormone Focus supports.';

export const WALL_EYEBROW = 'In their words';
export const WALL_HEADLINE = 'Women who felt like themselves again';
export const WALL_NOTE =
  'Results vary. Every review is a customer’s own words, unedited.';

export const VALUE_EYEBROW = 'Why this one';
export const VALUE_HEADLINE = 'Made for this stage, not for everyone';

/** Six. Each headline carries the value on its own, read without the line under it. */
export const VALUE_PROPS: [string, string][] = [
  ['Two capsules, one meal, done',
    'No protocol to remember. Two capsules with a meal, every day.'],
  ['Every milligram on the label',
    'DIM 200mg, Calcium D-Glucarate 500mg, BioPerine 2.5mg. Nothing hidden in a blend.'],
  ['Made for this stage, not for everyone',
    'For women 40 plus, in perimenopause and menopause.'],
  ['Sixty days, because one month is not enough to know',
    'That is why the Protocol is two bottles rather than one.'],
  ['Free shipping on the Protocol',
    'Two bottles, one delivery, nothing added at checkout.'],
  ['Sixty days to decide, on us',
    'Money back up to two bottles, empty or full.'],
];

export const STEPS_EYEBROW = 'How it works';
export const STEPS_HEADLINE = 'From the first capsule to feeling like yourself';

/** Benefit-led, never 'Step 1'. The number is decoration, not the heading. */
export const STEPS: [string, string][] = [
  ['Two capsules with a meal, every day',
    'Morning or evening, whichever one you will keep.'],
  ['The first change most women notice comes inside two weeks',
    'As customers report it. Quieter nights are usually the first thing they name.'],
  ['The full reset is sixty days',
    'Which is why the Protocol is two bottles.'],
];

export const MG_EYEBROW = 'Every milligram disclosed';
export const MG_HEADLINE = 'Three ingredients. Every milligram on the label.';

/** Dose, name, and what it is for, in structure-function language. */
export const INGREDIENTS: [string, string, string][] = [
  ['200 mg', 'DIM', 'Supports healthy estrogen metabolism.'],
  ['500 mg', 'Calcium D-Glucarate', 'Supports the body’s clearing of used hormones.'],
  ['2.5 mg', 'BioPerine', 'Supports absorption of the other two.'],
];

/* ------------------------------------------------------------ the FUD -- */

export const GUARANTEE_LEAD = '60-day money-back guarantee';
export const GUARANTEE_REST =
  ', up to two bottles. If it is not for you, you are refunded.';

export const DOCTOR_LINE =
  'Talk to your doctor first if you are on HRT or any medication, or have a history of heart disease or stroke, breast or uterine cancer, liver disease or blood clots. Not for pregnant or nursing women.';

export const SHIPPING_LINE =
  'Free shipping on the Protocol. One delivery, nothing added at checkout.';

export const FAQ_EYEBROW = 'Questions';
export const FAQ_HEADLINE = 'What women ask before they start';

export const FAQ: [string, string][] = [
  ['What about the scale?',
    'Women tell us the scale finally moves once their body is no longer fighting them, and you can read that in their own words above. What Hormone Focus does is support a healthy weight as part of a healthy diet and regular exercise, by supporting hormone balance through this stage.'],
  ['How long until I notice something?',
    'Most women tell us the first change comes inside two weeks, and that the full reset is sixty days. That is their experience rather than a promise, and it is why the Protocol is two bottles.'],
  ['I am on HRT, or I decided against it.',
    'Talk to your doctor first if you are on any medication, HRT included. Some of the women above made a different choice for themselves; their words are their own, and your doctor is the one who knows your history.'],
  ['Who should not take it?',
    'Anyone with a history of heart disease or stroke, breast or uterine cancer, liver disease or blood clots should talk to a doctor first. Not for pregnant or nursing women.'],
];

/* ---------------------------------------------------------- the closer -- */

export const CLOSER_SUB =
  'Two capsules a day with a meal. Sixty days, because one month is not enough to know.';

/** Under the buy button, on both option blocks. */
export const CART_NOTE = 'Secure checkout on the JJ Smith store.';

/** The full legal footing, once, at the bottom. */
export const OFFER_FINE_PRINT = `${DOCTOR_LINE} ${FDA_DISCLAIMER} Individual results vary.`;

export const FOOTER_LINE = '© JJ Smith · Hormone Focus';

/* -------------------------------------------------- the hero, resolved -- */

/**
 * The hero for /offer and /offer/<slug>.
 *
 * Two angles carry their own headline. The rest reuse the landing headline
 * and supply only the sub-headline, the beat and the closer, which is what the
 * build instructions ask for: take h1a, h1b and the recognition lines from the
 * angle, and write one sub-headline each in the same shape.
 */
export function heroFor(angle: Angle): OfferHero | null {
  const o = angle.offer;
  if (!o) return null;
  return {
    h1a: o.h1a ?? `${angle.h1a} `,
    h1b: o.h1b ?? angle.h1b,
    h1c: o.h1c ?? '',
    sub: o.sub,
    beat: o.beat,
    close: o.close,
    lines: angle.lines,
    title: o.title,
    description: o.description,
  };
}
