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
import {
  BATCH_ON_SHELF, KIT_BUY_CTA, KIT_DISCOUNT_NOTE, NEXT_BATCH, PLAN_NAME,
  batchCount, dailyPrice,
} from './offer';
import { MG_HEADLINE } from './offerCopy';
import type { SymptomId } from './logic';

/* ------------------------------------------------------- the offer block -- */

export const KIT_EYEBROW = 'Get started';
export const KIT_HEAD_PRE = 'Feel like you again for just ';
export const kitHeadPrice = (): string => `${dailyPrice()} a day`;
export const KIT_HEAD_SUB = 'Less than a coffee. Two capsules a day.';

export const KIT_BADGE = 'BESTSELLER';
export const KIT_CTA = KIT_BUY_CTA;
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
/* BACK TO THE APPROVED LINE, 29 October. It read "Just 3 ingredients.
   Nothing hidden." for a day, which David called out as not meaning anything:
   "nothing hidden" is a claim about the label, and the label already has an
   approved sentence about itself. MG_HEADLINE is that sentence, and it is the
   one the offer pages have always used. */
export const HF_HEAD = MG_HEADLINE;
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
    + 'and progesterone are no longer in the balance they used to be, the stage '
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
export const CLOSE_HEAD = 'Your first bottle can be on its way today.';
export const CLOSE_CTA = KIT_CTA;

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
/*
 * THE PAGE SELLS ONE BOTTLE, SO IT STOPPED CALLING ITSELF A PLAN.
 * 22 October: the kit is off this page, and with it went the guide, the
 * recipes and the tracker. Every line that promised a plan went with them.
 * The eyebrow labels her result instead.
 */
export const HERO_EYEBROW: Record<'A' | 'B' | 'C' | 'E', string> = {
  A: 'Your result · Hormonal imbalance',
  B: 'Your result · Perimenopause',
  C: 'Your result · Menopause',
  E: 'Your result · Early menopause',
};

/**
 * What the product is, in one sentence, by the stage she is in.
 *
 * It replaces "One simple plan for your hormones", which described something
 * this page no longer sells. !! PENDING JJ SIGN-OFF !!
 */
export const HERO_SUB_BY_STAGE: Record<'A' | 'B' | 'C' | 'E', string> = {
  A: 'Hormone Focus is a daily supplement for women whose hormones are changing. Two capsules a day.',
  B: 'Hormone Focus is a daily supplement for women in perimenopause. Two capsules a day.',
  C: 'Hormone Focus is a daily supplement for women in menopause. Two capsules a day.',
  E: 'Hormone Focus is a daily supplement for women in early menopause. Two capsules a day.',
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
/*
 * TIGHTENED 20 October, when the plan moved directly under the hero.
 *
 * It used to carry the three things she would do, which was the right job
 * for a hero that had a price under it. The three steps are now the next
 * thing she reads, in full, so saying them here first was the same sentence
 * twice. What the hero keeps is the framing.
 */
export const HERO_SUB =
  'One simple plan for your hormones. Not one more thing to try.';

/** Over the logo rail. JJ's own press, and never the supplement's. */
export const PRESS_EYEBROW = 'As seen in';

/*
 * "60 DAYS" CAME OFF THE BUTTONS, 22 October.
 *
 * The kit was sixty days. What this page sells now is one bottle, which is
 * thirty, so a button reading START MY 60 DAYS promised a length the
 * purchase does not have. !! PENDING JJ SIGN-OFF !!
 */
export const HERO_CTA = KIT_CTA;

/**
 * Directly under the button, where it does the most good.
 *
 * "FREE SHIPPING" CAME OFF, 22 October, and it had to. This line sat under
 * the hero while the page led with the kit, whose link carries
 * HF60FREESHIP. The bottle's link carries the 10% code instead, Shopify
 * takes one discount parameter, and no free-shipping threshold is published
 * on the store. Leaving the words there would have promised something the
 * checkout does not give her.
 */
export const HERO_RISK = '60-day money-back guarantee \u00b7 Ships today';

/* ------------------------------------------------------------ the offer -- */

/*
 * THE OFFER BLOCK NOW LEADS WITH ONE BOTTLE, 22 October 2026.
 *
 * David's call: put a smaller, less committing first purchase in front of
 * cold traffic. The kit is off this page; /offer and /plan still sell it and
 * the product is untouched in the store.
 *
 * !! PENDING JJ SIGN-OFF !! for the three lines below that are new.
 *
 * THE HEADING CHANGED BECAUSE IT HAD TO. It read "Everything you need for
 * your 60 days, in one kit", and the kit is the one thing this block no
 * longer sells.
 */
export const OFFER_HEAD = 'Start with one bottle of Hormone Focus.';

/**
 * On the lead card, where KIT_BADGE used to say BESTSELLER.
 *
 * NOT "BESTSELLER" MOVED ACROSS. That word was earned by the kit, and
 * hanging it on the bottle would be a claim about sales nobody has checked.
 * This says what the card is for and asserts nothing.
 */
export const SINGLE_BADGE = 'START HERE';

export const SINGLE_NAME = '30-Day Supply';
export const SINGLE_ONCE = 'One-time purchase. No subscription.';

/**
 * The discount, said the way the checkout says it.
 *
 * VERIFIED 22 October: Subtotal $49.99, order discount JJTEN -$4.99, total
 * $45.00. The code is applied by the link, so she does not type anything,
 * and the page says "applied at checkout" rather than "use code JJTEN"
 * because there is nothing for her to use.
 *
 * NOTHING HERE SAYS FREE SHIPPING, and that is deliberate. Shopify takes one
 * discount parameter: the bottle carries the 10% code, so it cannot also
 * carry HF60FREESHIP, and no free-shipping threshold is published on the
 * store. Shipping is calculated at checkout and the page does not pretend
 * otherwise.
 */
export const SINGLE_DISCOUNT_NOTE = KIT_DISCOUNT_NOTE;

/** Over the struck price on the lead card, where the kit said "Total value". */
export const SINGLE_WAS_LABEL = 'Usually';
export const SINGLE_CTA = 'Get my first bottle';

/** The one alternative, kept quiet under the kit. */
export const SUB_ALT_LEAD = 'Or subscribe and save more:';
export const SUB_ALT_NAME = 'Hormone Focus subscription';

/* ----------------------------------------------------- who JJ is -------- */

/**
 * The lead-in to the proof, for a woman who has never heard of her.
 *
 * COLD TRAFFIC ONLY. A woman arriving from JJ's own list already knows who
 * she is, and being introduced to her would read as a page that has not
 * noticed who it is talking to. offer.tsx shows this only when skipEmail is
 * false, which is the same flag the email screen is stepped over on.
 *
 * !! PENDING JJ SIGN-OFF !! Both sentences are about her rather than about
 * the supplement, which is why they carry no claim: the bestseller is a
 * fact, and the following is attributed to her approach and not to a result
 * anybody got.
 */
/* THE BRIEF'S OPENER, THE APPROVED CLAIM. It asked for "millions of women
   have followed her to get themselves back", which turns a count of
   followers into an outcome millions of women got. That is the distinction
   the note above exists for, so the first sentence is the brief's and the
   second is the one already cleared. */
export const TRUST_LEAD =
  'New to JJ Smith? She is a New York Times bestselling author, '
  + 'and millions of women have followed her approach.';

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
export const MECH_HEAD = 'It is not willpower. It is your hormones.';

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
export const PLAN_STEP_1 = 'Take two capsules a day, with a meal.';
export const PLAN_STEP_1_BODY = 'With a glass of water. That is the whole dose.';
export const PLAN_STEP_2 = 'Follow the food and sleep cues in your plan.';
export const PLAN_STEP_2_BODY = 'Your guide and your recipes are where they are written down.';
export const PLAN_STEP_3 = 'Mark the tracker.';
/* "so you can see it working" was the brief's wording and is a result the
   brand would be promising in its own voice. Writing it down is the thing
   she does; what she then sees is hers to judge. */
export const PLAN_STEP_3_BODY = 'A minute a day, so you have it written down.';

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
export const STICKY_CTA = KIT_CTA;

/* ================================ THE SINGLE-BOTTLE PAGE, 22 October 2026 ==
 *
 * !! PENDING JJ SIGN-OFF !! for everything new below.
 *
 * THE KIT IS GONE FROM THIS PAGE and so is every word that depended on it:
 * the three-step plan, "Why 60 days", JJ's note about the Kit, "the
 * supplement in the kit", and the plan framing in the hero. What is left
 * describes one bottle of Hormone Focus and nothing else.
 *
 * "60-day money-back guarantee" STAYS, and that is not an oversight. It is
 * the store's guarantee, it is named in the brief's own sections, and it is
 * the one place sixty days is a fact about the refund window rather than a
 * claim about a plan she is not buying.
 */

/* -------------------------------------------------------- review teaser -- */

export const TEASER_HEAD = 'What women say about it';

/* ---------------------------------------------------------- why it works -- */

/** Her own words, said back, by the symptom she named. */
export const WHY_OPENER: Record<SymptomId, string> = {
  sleep: 'You told us your sleep breaks at night.',
  weight: 'You told us the weight is not shifting the way it used to.',
  energy: 'You told us your energy is low.',
  sweats: 'You told us the heat comes on, day and night.',
  bloat: 'You told us you feel bloated.',
  mood: 'You told us your mood and your focus are not what they were.',
};

/** Why that happens, by the stage her answers point to. */
export const WHY_STAGE: Record<'A' | 'B' | 'C' | 'E', string> = {
  A: 'When your hormones stop keeping their usual rhythm, changes like that show up in more than one place at once.',
  B: 'In perimenopause your hormones get less steady, which is why that happens even when nothing else changed.',
  C: 'After your periods stop your body runs on less estrogen, which is why that happens even when nothing else changed.',
  E: 'In early menopause your body runs on less estrogen sooner than most women, which is why that happens even when nothing else changed.',
};

/** The one thing the product is said to do. The asterisk is the disclaimer. */
export const WHY_PRODUCT =
  'Hormone Focus supports healthy hormone balance, so your body has the '
  + 'support it needs.*';

/* ---------------------------------------------------------- how to take -- */

/*
 * DOSAGE AND NOTHING ELSE.
 *
 * This replaced a three-step plan whose step two told her to fix her own
 * sleep and meals. On a page selling a supplement that reads as the product
 * admitting it is not the thing that helps, and she did not buy a diet.
 */
export const HOW_HEAD = 'How to take it';
export const HOW_BODY =
  'Two capsules a day, with a meal and a glass of water. That is the whole '
  + 'routine. Take it every day and give it time.';

/* ------------------------------------------------------- the offer card -- */

export const OFFER_CARD_HEAD = PLAN_NAME;
export const OFFER_CARD_SUB =
  'One bottle of Hormone Focus, 60 capsules, two a day, and three digital guides.';

/** Under the two options, where the risk comes off. */
export const OFFER_ONCE_NOTE = KIT_DISCOUNT_NOTE;


/* ------------------------------------------- the kit, on the quiz page -- */

/* THE PAGE SELLS THE PACKAGE, 29 OCTOBER 2026, David's brief.
 *
 * The bottle alone led this page for a week. It now leads as the kit: the
 * same bottle, the same cart link and the same price, named and priced
 * alongside the three digital pieces that come with it.
 *
 * WHAT IS STILL THE BOTTLE. Every button goes to SINGLE_VARIANT_ID, because
 * the kit has no Shopify variant yet. Nothing in this file can change that,
 * and nothing in it should pretend otherwise.
 */

/** The kit's name over the hero, from offer.ts so one file owns it. */
export const KIT_HERO_LABEL = PLAN_NAME;

export const KIT_HERO_HEAD = 'Not just a bottle. The Feel Like YOU Again Kit.';
export const KIT_HERO_SUB =
  'The supplement, the recipes, the plan, and a tracker. '
  + 'Everything you need to start.';

/* THE PRICE BLOCK, 29 October, replacing a sentence.
 *
 * It read "$146.99 value \u2014 today $45.00", which David called vague, and it
 * carried the em dash the house style has now ruled out. The same three facts
 * are a struck-through value, a large price and a badge saying what she keeps,
 * which is how the offer pages have always shown a price.
 *
 * The numbers are still derived rather than typed. The kit artwork has "$45
 * VALUE $146.99" printed into it, where no test can reach, so the least the
 * HTML can do is move when the constants do. */
export const KIT_SAVE_PREFIX = 'You save';

/* -- the value stack ----------------------------------------------------- */

export const KIT_STACK_HEAD = 'Everything in your Kit.';
/** The card's own small heading, over the rows. */
export const KIT_INCLUDED_HEAD = 'Everything included:';
/** Over the price in the main deal box. */
export const KIT_WAS_LABEL = 'Was';
export const KIT_NOW_LABEL = 'Now';
/** Under each price. */
export const KIT_ONCE_NOTE = 'One time, no subscription';
/* FREE SHIPPING CAME OUT OF THIS LINE, 30 October, and went back into the
   green pill it had before the rebuild: it is the subscription's one real
   advantage over the bottle and it was reading as ordinary small print. */
export const KIT_SUB_NOTE = 'Pause or cancel anytime';
export const KIT_SUB_PER = '/month';
/** Beside a struck-through price on each bonus row. */
export const KIT_FREE_LABEL = 'free';
export const KIT_TODAY_LINE = 'today';

/* -- the subscription, under the one-time row ---------------------------- */

export const SUB_OR = 'OR';
export const SUB_BEST_VALUE = 'Best value';

/* -- honest urgency ------------------------------------------------------ */

/**
 * The batch line, said once, with no timer.
 *
 * NOT SHOW_BATCH_LINE, which is the global switch and is off at David's
 * request. Flipping it would turn this on for /offer, /offer/:slug, /live
 * and /plan as well, which this brief does not ask for. It is rendered
 * locally instead, and says "kits" where offerCopy's batchLine says
 * "bottles", because that is what this page is selling.
 */
export const kitBatchLine = (): string =>
  `This batch: ${batchCount()} kits on the shelf. `
  + `The next batch lands in ${NEXT_BATCH}.`;

/** Guards the line against a count that would read as a going-out-of-stock. */
export const KIT_BATCH_SHOWN = BATCH_ON_SHELF > 0;

/* -- the ingredients, and the closer ------------------------------------- */

export const KIT_CLOSE_HEAD = 'Your kit can be on its way today.';

/**
 * The kit shot's alt text.
 *
 * The artwork has its name, its tagline and its price printed into it, so a
 * screen reader gets none of that from the file. It is named piece by piece
 * here instead, which is also what a woman on a slow connection reads while
 * it loads.
 */
export const KIT_SHOT_ALT =
  'The Feel Like YOU Again Kit: one bottle of Hormone Focus, '
  + 'The 60-Day Hormone Fix, Hormone Healthy Recipes and the Daily Symptom Tracker';
