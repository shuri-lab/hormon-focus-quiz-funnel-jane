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
 *  - She reads "The 60-Day Plan". The word Protocol is ours, not hers, and
 *    the gate fails the build if it reaches a string she can read.
 *  - Any string naming two weeks or sixty days carries "as customers report"
 *    or "women tell us" in the same breath. The gate checks that too.
 *
 * THIS REPOSITORY IS PUBLIC. Every string here ships to the browser.
 */
import { FDA_DISCLAIMER } from './content';
import { LIVE_DEADLINE, PLAN_SHORT } from './offer';
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
export const LIVE_STRIP_REST = ` ${PLAN_SHORT}, two bottles, free shipping.`;

/** The deadline JJ set out loud, when there is one. LIVE_DEADLINE null hides it. */
export const liveDeadlineLine = (): string | null =>
  LIVE_DEADLINE ? `Through ${LIVE_DEADLINE}.` : null;

export const LIVE_HERO: OfferHero = {
  h1a: 'The one I made ',
  h1b: 'for exactly this',
  h1c: '.',
  sub: 'Two capsules with a meal. Change nothing else. Two bottles, because it takes more than one month to know, and a guarantee that puts the risk on JJ rather than on you. The link you tapped is the one you heard tonight.',
  beat: 'And the scale finally moves, women tell us, once your body stops fighting you.',
  close: 'Two bottles, free shipping, and two months to decide.',
  lines: [
    'Awake at three, drenched.',
    'The belly that showed up though nothing else changed.',
    'Snapping at people you love.',
    'The word that goes missing mid-sentence.',
    'Wondering whether it is just you. It is not.',
  ],
  title: `Hormone Focus — ${PLAN_SHORT}`,
  description:
    'The two-bottle Plan from JJ’s Live. Hormone Focus supports hormone balance for women in perimenopause and menopause. Every milligram disclosed.',
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
    'Nothing to reorganise. Two capsules with a meal, every day.'],
  ['Every milligram on the label',
    'DIM 200mg, Calcium D-Glucarate 500mg, BioPerine 2.5mg. Nothing hidden in a blend.'],
  ['Made for this stage, not for everyone',
    'For women 40 plus, in perimenopause and menopause.'],
  ['Two bottles, because one month is not enough to know',
    'That is the length of the Plan, and it is why it is two rather than one.'],
  ['Free shipping on the Plan',
    'Two bottles, one delivery, nothing added at checkout.'],
  ['Two months to decide, on us',
    'Money back up to two bottles, empty or full.'],
];

export const STEPS_EYEBROW = 'How it works';
export const STEPS_HEADLINE = 'From the first capsule to feeling like yourself';

/** Benefit-led, never 'Step 1'. The number is decoration, not the heading. */
export const STEPS: [string, string][] = [
  ['Two capsules with a meal, every day',
    'Morning or evening, whichever one you will keep.'],
  ['The first change comes inside two weeks, as customers report',
    'Quieter nights are usually the first thing women name.'],
  ['The full stretch is sixty days, as customers report',
    'Which is why the Plan is two bottles rather than one.'],
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

/**
 * The guarantee, word for word from the store's own refund policy, because a
 * guarantee we paraphrase is a guarantee somebody has to argue about later.
 * It renders twice: above the fold and at the close.
 *
 * Rendered as three pieces so the policy itself is one tap away from the words
 * that name it.
 */
export const GUARANTEE_PRE = '60-Day ';
export const GUARANTEE_LINK_TEXT = 'Happiness Guarantee';
export const GUARANTEE_REST =
  '. Try it for two months. If you are not satisfied, we refund up to two bottles within 60 days.';
export const REFUND_POLICY_URL =
  'https://shop.jjsmithonline.com/policies/refund-policy';

export const DOCTOR_LINE =
  'Talk to your doctor first if you are on HRT or any medication, or have a history of heart disease or stroke, breast or uterine cancer, liver disease or blood clots. Not for pregnant or nursing women.';

export const SHIPPING_LINE =
  `Free shipping on ${PLAN_SHORT}. One delivery, nothing added at checkout.`;

/** What she gets, above the stack. */
export const STACK_HEADING = 'What is in it';

export const FAQ_EYEBROW = 'Questions';
export const FAQ_HEADLINE = 'What women ask before they start';

export const FAQ: [string, string][] = [
  ['What about the scale?',
    'Women tell us the scale finally moves once their body is no longer fighting them, and you can read that in their own words above. What Hormone Focus does is support a healthy weight as part of a healthy diet and regular exercise, by supporting hormone balance through this stage.'],
  ['How long until I notice something?',
    'Most women tell us the first change comes inside two weeks, and that the full stretch is sixty days. That is their experience rather than a promise, and it is why the Plan is two bottles.'],
  ['I am on HRT, or I decided against it.',
    'Talk to your doctor first if you are on any medication, HRT included. Some of the women above made a different choice for themselves; their words are their own, and your doctor is the one who knows your history.'],
  ['Who should not take it?',
    'Anyone with a history of heart disease or stroke, breast or uterine cancer, liver disease or blood clots should talk to a doctor first. Not for pregnant or nursing women.'],
];

/* ---------------------------------------------------------- the closer -- */

export const CLOSER_SUB =
  'Two capsules with a meal. Change nothing else. Two bottles, because one month is not enough to know.';

/** Near the button, when SHOW_BATCH_LINE is on. True, said once, no timer. */
export const batchLine = (count: string, next: string): string =>
  `This batch: ${count} bottles on the shelf. The next batch lands in ${next}.`;

/**
 * The legal footing at the bottom of the page.
 *
 * The doctor line is NOT repeated here. Every page that reaches this footer
 * has already carried it in the closer, where a woman deciding whether this
 * is for her will actually read it, and printing it twice in two paragraphs
 * reads as boilerplate rather than as a warning.
 */
export const OFFER_FINE_PRINT = `${FDA_DISCLAIMER} Individual results vary.`;

/** The whole of it, for any surface that does not show the doctor line above. */
export const FULL_FINE_PRINT = `${DOCTOR_LINE} ${OFFER_FINE_PRINT}`;

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
