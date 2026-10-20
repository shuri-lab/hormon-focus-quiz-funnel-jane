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
import type { SymptomId } from './logic';

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
/*
 * CHECKED AGAINST THE LIVE CART, 16 October 2026. Adding variant
 * 54355951845487 on selling plan 5529010287 produces a line whose Frequency
 * option reads "Deliver every month", so that is what this says. It read
 * "Delivered every 30 days" before, which was close enough to pass unnoticed
 * and still not what Shopify tells her at the checkout.
 *
 * NOT FIXED HERE, because it is not this page: offer.ts still describes the
 * same plan as "One bottle every 4 weeks" with SUPPLY_DAYS.subscribe = 28,
 * which is wrong twice over and renders on /offer and /plan. Flagged for
 * David rather than changed outside the brief.
 */
export const SUB_CADENCE = 'Delivered every month';
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

/* ============================================================ THE REBUILD ==
 *
 * 16 October 2026, to David's conversion brief. The page used to open with
 * three free tips and reach the price at section six of fourteen. It now
 * opens with the outcome she came for, proof and a button, and the offer sits
 * directly under it. The tips are not gone: they come back lower as the plan
 * in action, which argues the plan is simple instead of handing it over.
 *
 * !! PENDING JJ SIGN-OFF !!
 * Every string in this block is a DRAFT in her voice and none of it has been
 * approved. The already-approved copy around it is untouched and reused where
 * it exists, which is why this block is as short as it is: the mechanism
 * section borrows her result-page sentences rather than restating them, and
 * the kit, the guarantee, the questions, the reviews and the closer are all
 * the words that were already on the page.
 *
 * Held to the same gate as the rest of this file: no contraction, no claim
 * the brand may not make. "Feel like YOU again in 60 days" is the one shape
 * worth a second look at sign-off, because sixty days is a timeframe and the
 * rules say the brand's own voice does not promise one. It is said here the
 * way the kit, the guarantee and the closer already say it ("Your next 60
 * days can start today"), which is why it is drafted and not quietly shipped.
 */

/* ------------------------------------------------------------- the hero -- */

/** Her stage, carried over from the result page she just read. */
export const HERO_EYEBROW: Record<'A' | 'B' | 'C' | 'E', string> = {
  A: 'Your 60-day plan',
  B: 'Your perimenopause plan',
  C: 'Your menopause plan',
  E: 'Your early menopause plan',
};

/**
 * The dream outcome, named for the thing she said bothers her most.
 *
 * Deliberately not a symptom-reduction line. "Less bloating" aimed at the
 * symptom would be a treatment claim, so each of these names how she wants to
 * feel rather than what the product would do to a symptom.
 *
 * AND DELIBERATELY WITHOUT "IN 60 DAYS", which the brief drafted on all six.
 * The clock gate in tests/copy.test.ts refused three of them: a duration in
 * the same sentence as feel, see, notice or change is a promise about how
 * long a result takes, and the brand's own voice may not make one. It passed
 * the other three only because "get" and "sleep" are not in its outcome list,
 * which is a gap in the pattern and not permission: "Get your body back in 60
 * days" is the same promise as "Feel steady again in 60 days", and shipping
 * one while the gate refuses the other would be incoherent. So the timeframe
 * came off all six rather than the gate being widened to wave three through.
 *
 * The sixty days is not lost. It is in the eyebrow above this line, in the
 * offer heading under it, on the button, and in the guarantee: everywhere it
 * is a plan length, which is a fact, and nowhere it is a date by which she
 * will feel better, which is a promise.
 */
export const HERO_HEAD: Record<SymptomId, string> = {
  weight: 'Feel at home in your own body again.',
  sleep: 'Sleep through the night again.',
  energy: 'Get your energy back.',
  sweats: 'Sleep cool through the night again.',
  bloat: 'Feel comfortable in your own clothes again.',
  mood: 'Feel steady and clear again.',
};

/** When she named nothing, which is every woman who opens this page cold. */
export const HERO_HEAD_DEFAULT = 'Feel like YOU again.';

/**
 * How it works, and how little it asks of her.
 *
 * REWRITTEN 16 October at David's request. The first draft read "One simple
 * plan for your hormones: the right support, the right food, and a tracker so
 * you can see what changes", which listed three abstractions before it said
 * anything she could picture. This one leads with the two capsules, because
 * that is the whole of what she actually has to do, and closes on JJ's own
 * line from the bottom of the page.
 */
export const HERO_SUB =
  'Two capsules a day, meals that keep you full, and a tracker that shows you '
  + 'what is changing. One plan for your hormones, not one more thing to try.';

/** Over the logo rail. JJ's own press, and never the supplement's. */
export const PRESS_EYEBROW = 'As seen in';

export const HERO_CTA = 'START MY 60 DAYS';

/** Directly under the button, where it does the most good. */
export const HERO_RISK = '60-day money-back guarantee · Free shipping · Ships today';

/* ------------------------------------------------------------ the offer -- */

/** The benefit, rather than the word "pricing". */
export const OFFER_HEAD = 'Everything you need for your 60 days, in one kit.';

/** The one alternative, kept quiet under the kit. */
export const SUB_ALT_LEAD = 'Prefer to start month to month?';
export const SUB_ALT_NAME = 'Hormone Focus subscription';

/* -------------------------------------------------------- the mechanism -- */

/**
 * Why it works when trying harder has not.
 *
 * The HEADING is the only new sentence. The two below it are her own result
 * page, read back: the stage sentence for her outcome and the closing line
 * for the symptom she named. Both are already approved, both are already
 * personal to her, and reusing them means this section introduces no claim
 * that was not already cleared.
 */
export const MECH_EYEBROW = 'Why it works';
export const MECH_HEAD = 'This is not about willpower. It is about your hormones.';

/*
 * THE SECOND HALF OF THE ARGUMENT THE RESULT PAGE STARTS.
 *
 * She reads "This is not about trying harder. It is about what is happening
 * with your hormones" on her result, presses the button, and this is the
 * first thing under the headline on the other side. The two pages are one
 * argument rather than a warm result that turns into a pitch.
 *
 * It sits ABOVE THE PRICE on purpose, which is the point of the change: the
 * reason the product is the answer has to be read before the number, not five
 * sections after it.
 *
 * SPLIT LIKE THE RESULT PAGE'S CLOSE, and for the same reason. The first
 * sentence is a claim about her and is only true if she said it, so it is
 * rendered only for a woman who told the quiz she had already changed how she
 * eats or moved more. The rest stands alone.
 *
 * NO DOSE HERE. HF_BODY says "Two capsules a day with a meal" a few lines
 * below and saying it twice in one block reads as padding.
 */
export const MECH_TRIED = 'You have already tried eating better and moving more.';
export const MECH_BRIDGE =
  'When the change is coming from your hormones, trying harder is not the '
  + 'missing piece. What shifts in these years is how your body processes and '
  + 'clears used hormones. Hormone Focus is built to support that.';

/* ------------------------------------------------------------- the plan -- */

/**
 * The old three tips, reframed as the plan in action.
 *
 * Step two is where her own two cards go, so nothing personal is lost by
 * moving them down the page: threeCards() returns two symptom cards and the
 * tracker, and they land on steps two and three respectively. Step one is the
 * bottle, which is the only one of the three she is buying.
 */
export const PLAN_EYEBROW = 'On the plan';
export const PLAN_HEAD = 'Three simple things, every day.';
export const PLAN_STEP_1 = 'Take two capsules a day.';
export const PLAN_STEP_1_BODY = 'With a meal and a glass of water. That is the whole dose.';
export const PLAN_STEP_2 = 'Follow the food and sleep cues in the plan.';
export const PLAN_STEP_3 = 'Mark the tracker.';

/* ----------------------------------------------------------- the sticky -- */

/**
 * The bar label, and why it is four words.
 *
 * The brief asks for "Feel like you again, from $1.25 a day" here. It does
 * not fit: this bar holds one line beside a button at 320px, there is a test
 * on its height for exactly that reason, and the long version wraps to three
 * lines and makes the bar taller than the button it exists to serve. The day
 * rate is the half that does the work, so the day rate is what stays.
 */
export const STICKY_CTA = 'Start my 60 days';
