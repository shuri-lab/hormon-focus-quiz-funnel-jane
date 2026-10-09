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

/** The way down to every review, from the first block of proof. */
export const PROOF_ALL_LINK = 'Read all the reviews';
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

/* JJ'S OWN SIX QUESTIONS, and answers that stay inside the claims list.
 *
 * David asked for the same QUESTIONS as the landing page, which is what this
 * is. Her ANSWERS could not come over whole: three of them say the product
 * promotes weight loss, relieves symptoms of hormonal imbalance, and
 * rebalances estrogen "so these symptoms ease up". Those are treatment
 * claims, the claims list forbids them, and the gate in copy.test.ts fails
 * the build on them — which is the point of having it.
 *
 * So where her wording is already inside the list it is hers, word for word
 * but for contractions: the dosing answer and the how-long answer are
 * untouched. Where it is not, the same fact is stated without the claim —
 * what the formula contains, what it is for, and what customers report,
 * which is the attributed form the list allows.
 */
export const KIT_FAQ: [string, string][] = [
  ['What are the benefits of Hormone Focus?',
    'It is formulated to support healthy hormone levels in women whose estrogen '
    + 'and progesterone are no longer in the balance they used to be — the stage '
    + 'behind PMS and perimenopause. Customers report easier cycles, steadier '
    + 'moods and better sleep. Individual results vary.'],

  ['Does Hormone Focus replace the other Focus supplements '
   + '(Liver Focus, Blood Sugar Focus and Tummy Focus)?',
    'No, it does not replace any of the other Focus supplements. Hormone Focus '
    + 'works on hormone balance. The others each do something different: Tummy '
    + 'Focus is a digestive cleanse, Liver Focus is a liver cleanse, and Blood '
    + 'Sugar Focus is taken with meals. They are made to be taken together.'],

  ['How should you take Hormone Focus?',
    'For optimal results, take 2 capsules with a meal and a glass of water, or '
    + 'as directed by a healthcare professional. Some women find that taking it '
    + 'at night suits them better. It is important to consult a healthcare '
    + 'professional when making dosage adjustments.'],

  ['How long should you take Hormone Focus?',
    'Hormone Focus is not a stimulant and does not lead to dependency. It is '
    + 'safe to take until you achieve your desired results. The duration of use '
    + 'may vary based on individual needs and goals.'],

  ['How quickly does Hormone Focus work?',
    'That varies with your current hormonal balance and your overall health. '
    + 'Customers generally report noticing a difference after about 30 days of '
    + 'consistent use, and the 60-day guarantee is built around giving it that '
    + 'long. Individual results vary.'],

  ['What are the ingredients in Hormone Focus?',
    'Unlike brands which offer DIM only or Calcium D-Glucarate only, we combine '
    + 'both, in a compact 2-capsule serving. DIM, or Diindolylmethane, supports '
    + 'the way the body metabolises estrogen. Calcium D-Glucarate supports the '
    + 'body\'s own detoxification process. BioPerine improves the absorption and '
    + 'bioavailability of both. Three ingredients, every milligram printed.'],
];

/* ------------------------------------------------------------- the closer -- */

/* The button is the brief's. The heading is a PLACEHOLDER. */
export const CLOSE_HEAD = 'Your next 60 days can start today.';
export const CLOSE_CTA = 'START MY 60 DAYS';
