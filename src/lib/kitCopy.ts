/* EVERY WORD THE KIT PAGE SAYS, at the end of the quiz.
 *
 * The page a woman scrolls after her result: what to do next, the kit, proof,
 * why sixty days, what Hormone Focus is, the guarantee, questions, and the
 * button again. One page, no more Continue buttons.
 *
 * THE OFFER BLOCK IS DAVID'S, from JJ's live offer page
 * (hormonefocus.jjsmithonline.com, read 2 October 2026): the same heading,
 * the same two cards, the same buttons. Jane's instruction: use what is
 * already working there and do not redesign it.
 *
 * The sections under it are named by the quiz rebuild brief but not written
 * by it. They are assembled here from lines already approved elsewhere in
 * this build, and marked PLACEHOLDER where final copy is still to come.
 *
 * tests/copy.test.ts holds this file to the same gate as offerCopy.ts: no
 * contractions, no claim the brand may not make.
 */
import { dailyPrice } from './offer';

/* ------------------------------------------------------- the offer block -- */

export const KIT_EYEBROW = 'Get started';
export const KIT_HEAD_PRE = 'Feel like you again for just ';
export const kitHeadPrice = (): string => `${dailyPrice()} a day`;
export const KIT_HEAD_SUB = 'Less than a coffee. Two capsules a day.';

export const KIT_BADGE = 'BESTSELLER';
export const KIT_CTA = 'Get the 60-Day Kit';
export const KIT_TOTAL_LABEL = 'Total value';
export const KIT_TODAY_LABEL = 'Today';
export const FREE_SHIPPING = 'FREE SHIPPING';

export const BOTTLE_NAME = '30-Day Supply';
export const BOTTLE_SUPPLY = 'One bottle of Hormone Focus. 60 capsules, two a day.';
export const ONCE_LABEL = 'One-time purchase';
export const ONCE_CADENCE = 'Delivered once';
export const SUB_LABEL = 'Subscribe & save';
export const SUB_PILL = '20% OFF';
export const SUB_CADENCE = 'Delivered every 30 days';
export const SUB_NOTE = 'Pause or cancel anytime';

export const TRUST_ITEMS: string[] = ['60-day money-back guarantee', 'In stock, ships today'];

/* -------------------------------------------------------------- the proof -- */

export const PROOF_EYEBROW = 'Real women';
/* JJ's page heading for the same wall of faces. */
export const PROOF_HEAD = 'Join the women who stopped fighting it, one symptom at a time';
export const PROOF_MORE_HEAD = 'What women are saying';
export const PROOF_NOTE =
  'Reviews, photos and a comment from verified buyers and JJ’s Facebook page. Individual results vary.';

/* PLACEHOLDER. */
export const WHY_EYEBROW = 'Why 60 days';
export const WHY_HEAD = 'Two bottles, one plan, start to finish';
export const WHY_BODY: string[] = [
  'The plan in The 60-Day Hormone Fix runs for 60 days, and one bottle of Hormone Focus is a 30-day supply. So the kit is two bottles: enough to follow the plan from start to finish.',
  'You mark the tracker as you go, so at the end you are judging it from your own notes. The guarantee covers both bottles.',
];

/* PLACEHOLDER. The claim line is the one already approved on the offer pages. */
export const HF_EYEBROW = 'Hormone Focus';
export const HF_HEAD = 'Three ingredients. Every milligram on the label.';
export const HF_BODY =
  'Hormone Focus is the supplement in the kit. Two capsules a day with a meal. It supports hormone balance for women in perimenopause and menopause.*';

/* ---------------------------------------------------------- the guarantee -- */

/* JJ's page, with the one contraction written out for the house style. */
export const PROMISE_EYEBROW = 'Our promise';
export const PROMISE_HEAD = '60-Day Happiness Guarantee';
export const PROMISE_BODY =
  'Try it for 60 days. If you are not satisfied, you get your money back.';
export const PROMISE_FINE = 'US orders only · Covers up to two bottles · Shipping not refunded';

/* -------------------------------------------------------------- questions -- */

export const KIT_FAQ_EYEBROW = 'Questions women ask';
export const KIT_FAQ_HEAD = 'Before you start';

/* PLACEHOLDER. The second, third and fourth answers are JJ's page, word for
   word but for contractions. Her page's longer FAQ is NOT used: it says the
   product promotes weight loss and relieves symptoms, which the claims list
   does not allow. */
export const KIT_FAQ: [string, string][] = [
  ['How do I take Hormone Focus?',
    'Two capsules a day with a meal and a glass of water.'],
  ['Who should not take it?',
    'Anybody with a history of heart disease or stroke, breast or uterine cancer, liver disease, or blood clots. Talk to your doctor first, and doubly so if you are pregnant, nursing or on medication.'],
  ['Is there a proprietary blend?',
    'No. Three ingredients, every milligram printed. What is on this page is what is in the bottle.'],
  ['What if it is not for me?',
    'The 60-day happiness guarantee refunds up to two bottles, after you have actually tried it. A subscription cancels any time.'],
  ['How do I get the ebooks and the tracker?',
    'They are digital. The 60-Day Hormone Fix, Hormone Healthy Recipes and the Daily Symptom Tracker arrive by email after your order.'],
];

/* ------------------------------------------------------------- the closer -- */

/* The button is the brief's. The heading is a PLACEHOLDER. */
export const CLOSE_HEAD = 'Your next 60 days can start today.';
export const CLOSE_CTA = 'START MY 60 DAYS';
