/* Every word the quiz says, from the first question to the result.
 *
 * REBUILT 2 OCTOBER 2026 from the quiz rebuild brief. Where the brief gave
 * the words, they are used as written. Where it did not (the result pages for
 * three of the four outcomes, the cycle and pattern phrases), the lines here
 * are plain placeholders marked PLACEHOLDER, waiting on final copy.
 *
 * THE COPY RULES, which survive any rewrite:
 *  - The quiz does not diagnose. A result is "a pattern often seen during",
 *    never "you have" or "you are in".
 *  - No mechanism. Nothing about estrogen building up or not clearing.
 *  - Nothing is sold before the result. No product, review or rating appears
 *    on a question screen.
 *  - No contractions in user-facing copy. House style.
 *  - Every product claim is JJ's own published wording. No timeframes,
 *    no quantified results, no invented percentages.
 *  - 800,000 is scoped to books and challenges, NOT supplement buyers.
 */
import type {
  Age, Cycle, Outcome, Pattern, QuizState, SymptomId, TriedId, Twelve, WantId,
} from './logic';
import { TILES, docReason, mainConcern, masked, otherConcerns } from './logic';

export const IMG: Record<SymptomId, string> = {
  weight: '/img/symptom-weight.jpg',
  bloat: '/img/symptom-bloating.jpg',
  sleep: '/img/symptom-sleep.jpg',
  sweats: '/img/symptom-night-sweats.jpg',
  mood: '/img/symptom-mood.jpg',
  energy: '/img/symptom-energy.jpg',
};

export const BOTTLE = '/img/hormone-focus-bottle.jpg';
export const JJ = '/img/jj-smith.jpg';
/** JJ's wordmark, as her offer page carries it. 132 by 25. */
export const JJ_LOGO = '/img/jj-logo.webp';
export const CUSTOMERS = [1, 2, 3, 4, 5, 6].map((n) => `/img/customer-${n}.jpg`);

/* CHIP_PROGRAMS is the SCOPED form of the 800,000 figure: books and
   challenges, never a Hormone Focus customer count. Jane approved this
   wording on 15 September 2026. Do not revert it to the unscoped form. */
export const CHIP_PROGRAMS = "800K+ women in JJ's programs";

/** The share image for the cover. Not shown on the cover itself. */
export const HERO_IMG = '/img/symptom-sleep.jpg';

/* ------------------------------------------------------------ the cover -- */

/* The brief's words. The sub-line and the button are the same on every
   route; only the headline changes with the ad angle (angles.ts). */
export const COVER_SUB =
  "Find out what's really going on with your body. Take the free 1-minute quiz.";
export const COVER_CTA = 'Get my hormone check';

/** Under the button: what it costs and what it takes. */
export const COVER_CTA_NOTE = 'Free · 1 minute';

/** The bar above everything, as JJ's own page carries one. */
export const ALERT_BAR = 'Take the 1-minute quiz';

/** Beside the customer faces. See the note in copy.test.ts on the number. */
export const PROOF_EYEBROW = 'Join 16,000+ women';

/* -------------------------------------------------------- the questions -- */

const TILE_LABEL = Object.fromEntries(TILES) as Record<SymptomId, string>;

/** A tile label as it reads mid-sentence. */
export const symptomInline = (id: SymptomId): string => TILE_LABEL[id].toLowerCase();

/** "poor sleep, stubborn weight gain and low energy", for question five. */
export function mentioned(S: QuizState): string {
  const main = mainConcern(S);
  const ids = main ? [main, ...otherConcerns(S)] : [];
  const l = ids.map(symptomInline);
  if (!l.length) return '';
  if (l.length === 1) return l[0];
  if (l.length <= 3) return `${l.slice(0, -1).join(', ')} and ${l[l.length - 1]}`;
  return `${l.slice(0, 3).join(', ')} and ${l.length - 3} more`;
}

export const AGE_OPTIONS: [Age, string][] = [
  ['under-40', 'Under 40'],
  ['40-44', '40–44'],
  ['45-49', '45–49'],
  ['50-54', '50–54'],
  ['55-59', '55–59'],
  ['60-plus', '60+'],
];

export const CYCLE_OPTIONS: [Cycle, string][] = [
  ['same', 'It is about the same as usual'],
  ['unpredictable', 'It has become less predictable'],
  ['skipping', 'I have started skipping some'],
  ['stopped', 'It has stopped completely'],
  ['masked', 'Birth control, medication or surgery affects it'],
  ['unsure', 'I am not sure'],
];

export const TWELVE_OPTIONS: [Twelve, string][] = [
  ['yes', 'Yes'],
  ['no', 'No'],
  ['unsure', 'I am not sure'],
  ['medsurg', 'Medication or surgery may be the reason'],
];

export const PATTERN_OPTIONS: [Pattern, string][] = [
  ['monthly', 'Around the same time each month'],
  ['comego', 'They come and go without a clear pattern'],
  ['weekly', 'Most weeks'],
  ['daily', 'Almost every day'],
  ['untracked', 'I have not really tracked them yet'],
];

export const TRIED_OPTIONS: [TriedId, string][] = [
  ['food', 'Eating differently'],
  ['gym', 'Exercising more'],
  ['sleep', 'Working on my sleep'],
  ['supps', 'Supplements'],
  ['doctor', 'Talking to my doctor'],
  ['wait', 'Mostly waiting to see if it passes'],
  ['nothing', 'Nothing yet'],
];

export const WANT_OPTIONS: [WantId, string][] = [
  ['body', 'Feel comfortable in my body again'],
  ['sleep', 'Sleep through the night'],
  ['energy', 'Have my energy back'],
  ['cool', 'Stop feeling hot all the time'],
  ['clear', 'Feel clearer and more like myself'],
  ['understand', 'Understand what is happening to my body'],
];

/* ------------------------------------------- her answers, said back to her -- */

/* "You have already tried exercising more and changing how you eat." */
const TRIED_PHRASE: Record<Exclude<TriedId, 'nothing'>, string> = {
  food: 'changing how you eat',
  gym: 'exercising more',
  sleep: 'working on your sleep',
  supps: 'supplements',
  doctor: 'talking to your doctor',
  wait: 'waiting to see if it passes',
};

/** Acknowledges her effort. Never says it failed, or why. Empty when she tried nothing. */
export function triedLine(S: QuizState): string {
  const l = TRIED_OPTIONS
    .map(([id]) => id)
    .filter((id): id is Exclude<TriedId, 'nothing'> => id !== 'nothing' && S.tried.includes(id))
    .map((id) => TRIED_PHRASE[id]);
  if (!l.length) return '';
  const list = l.length === 1 ? l[0] : `${l.slice(0, -1).join(', ')} and ${l[l.length - 1]}`;
  return `You told us you have already tried ${list}.`;
}

/* "And what you want most is: To feel comfortable in your body again."
   'cool' is softened on the way back: said directly above a product,
   "to stop feeling hot" would read as a promise. */
export const WANT_PHRASE: Record<WantId, string> = {
  body: 'To feel comfortable in your body again.',
  sleep: 'To sleep through the night.',
  energy: 'To have your energy back.',
  cool: 'To feel cooler and more comfortable.',
  clear: 'To feel clearer and more like yourself.',
  understand: 'To understand what is happening to your body.',
};

/* ------------------------------------------------------------- the result -- */

/* ONE CLEAR ANSWER. She gets one of four named results, said once, in one
   sentence, with no "you may be between two" and no list of what she is
   not. It is never "you have" and never "you are in": the sentence says her
   answers POINT TO it. Jane, 2 October 2026, softened 7 October 2026.

   `name` is the bare stage word. It is NOT printed on the result screen any
   more (see reveal.tsx) and is kept because `result_route` in the Klaviyo
   contract is derived per outcome and the email flow branches on the stage.
   `line` is what she actually reads. */

export interface ResultCopy {
  /** The answer, big. */
  name: string;
  /** One sentence under it. */
  line: string;
  /** What it means, said with her own symptoms in it. */
  means: (symptoms: string, many: boolean) => string;
}

export const RESULT: Record<Exclude<Outcome, 'D'>, ResultCopy> = {
  A: {
    name: 'Hormonal imbalance',
    line: 'Your answers point to a hormonal imbalance.',
    means: (x) => `Your hormones rise and fall through every month. When they shift out of their usual rhythm, it can show up as ${x}.`,
  },
  B: {
    name: 'Perimenopause',
    line: 'Your answers point to perimenopause, the years before your periods stop.',
    means: (x, many) => `In the years before periods stop, hormones start to rise and fall unevenly. That is why ${x} can ${many ? 'all show up at the same time' : 'show up'}.`,
  },
  C: {
    name: 'Menopause',
    line: 'Your answers point to menopause.',
    means: (x) => `After your periods stop, your hormones settle at a new, lower level. That is why ${x} can keep showing up.`,
  },
  E: {
    name: 'Early menopause',
    line: 'Your answers point to early menopause, which starts before 45.',
    means: (x) => `Your hormones are settling at a new, lower level earlier than most women. That is why ${x} can show up. Ask your doctor to confirm it, so you know where you stand.`,
  },
};

/* How often, and her cycle, as two short lines under her pictures. */
export const PATTERN_SHORT: Record<Pattern, string> = {
  monthly: 'Around the same time each month',
  comego: 'They come and go',
  weekly: 'Most weeks',
  daily: 'Almost every day',
  untracked: 'Not tracked yet',
};

export function cycleShort(S: QuizState): string {
  if (masked(S)) return 'Affected by birth control, medication or surgery';
  switch (S.cycle) {
    case 'same': return 'About the same as usual';
    case 'unpredictable': return 'Less predictable';
    case 'skipping': return 'Skipping some';
    case 'unsure': return 'Not sure';
    case 'stopped':
      if (S.twelve === 'yes') return 'Stopped 12 months or more';
      if (S.twelve === 'no') return 'Stopped, less than 12 months';
      return 'Stopped';
    default: return '';
  }
}

/* "YOU ARE NOT THE ONLY ONE". One fact about women at her stage, then one
   line about what she is going through. No product here: that comes on the
   next page. Every figure is from the source named under it, checked
   3 October 2026. */
export interface StageFact { fact: string; line: string; source: string }

export const STAGE_FACT: Record<Exclude<Outcome, 'D'>, StageFact> = {
  A: {
    fact: 'More than 9 in 10 women get some symptoms around their period, and they can get stronger in the late 30s and 40s.',
    line: 'What you are feeling is common, and what you do every day can change how it feels.',
    source: 'US Office on Women’s Health',
  },
  B: {
    fact: 'Perimenopause usually starts in the mid-40s and lasts about four years. For some women it lasts up to eight.',
    line: 'What you are feeling has a name, it is common, and there is a lot you can do during these years.',
    source: 'Cleveland Clinic',
  },
  C: {
    fact: 'The average age of menopause in the US is 52.',
    line: 'Your body is still adjusting to lower hormone levels, and what you do every day still makes a difference.',
    source: 'US Office on Women’s Health',
  },
  E: {
    fact: 'About 1 in 20 women naturally go through menopause early, between 40 and 45.',
    line: 'You are not alone in this, and your body still responds to the care you give it.',
    source: 'US Office on Women’s Health',
  },
};

/** Said on the result when her cycle cannot tell us anything. */
export const MASKED_NOTE =
  'Birth control, medication or surgery is affecting your cycle, so this result comes from your age and your symptoms.';

/** What the check is not, said once, small. */
export const CANNOT_TELL =
  'This check is not a diagnosis. Talk to your doctor if anything worries you, or if you bleed after 12 months without a period.';

/* ---------------------------------------------------------- what to do next -- */

/* THE 60 DAYS, BUILT TO THE KIT. It names her biggest concern, gives her the
   five things to do, asks the question she is already asking (how?), and
   answers it with the kit, piece by piece. Jane, 3 October 2026.
   It is a plan for her, never a promised result by a date. */

/** What her 60 days are for, by the concern she named. */
export const PLAN_FOR: Record<SymptomId, string> = {
  weight: 'your weight',
  sleep: 'better sleep',
  energy: 'more energy',
  sweats: 'cooler days and nights',
  bloat: 'less bloating',
  mood: 'a calmer, clearer you',
};

export const NEXT_EYEBROW = 'Your next 60 days';
export const nextTitle = (main: SymptomId | ''): string =>
  main ? `Your 60-day plan for ${PLAN_FOR[main]}` : 'Your 60-day plan';

export const NEXT_LEAD = 'You do not have to fix everything at once.';
export const NEXT_INTRO = 'For the next 60 days, you focus on five things, every day:';
export const NEXT_STEPS: string[] = [
  'Eat for the body you have now',
  'Move your body and protect your muscle',
  'Support your hormones',
  'Track how you feel, not just the scale',
  'Stay consistent, one day at a time',
];

/* The question she is already asking. */
export const NEXT_HOW = 'The hard part is the how. What do you eat? How do you track it? How do you keep going for 60 days?';
export const NEXT_BRIDGE =
  'That is exactly why I created the 60-Day Feel Like YOU Again Kit. It gives you the how, all in one place:';

/** Each piece of the kit, and which part of the 60 days it answers. */
export const NEXT_HOW_PIECES: [string, string][] = [
  ['Hormone Healthy Recipes', 'What to eat, so you are not guessing'],
  ['The 60-Day Hormone Fix', 'JJ’s 5-step plan to follow for the 60 days'],
  ['The Daily Symptom Tracker', 'A minute a day to see what is changing'],
  ['Two bottles of Hormone Focus', 'Daily hormone support, two capsules with a meal*'],
];

/* ----------------------------------------------------------- doctor route -- */

export const DOC_TITLE = 'Talk to your healthcare professional first.';

export const DOC: Record<Exclude<ReturnType<typeof docReason>, ''>, { deck: string; say: string; look: string }> = {
  young: {
    deck: 'Periods stopping before forty has several possible causes, and most of them are worth knowing about rather than guessing at.',
    say: 'My periods have stopped and I am under forty. I would like it looked into.',
    look: 'A blood test is the usual next step. It can rule things in or out quickly, and several of the possible causes are very treatable once they are named.',
  },
  late: {
    deck: 'Periods that are still coming and going at sixty or over are uncommon, and it is the kind of thing worth having looked at rather than explained away.',
    say: 'I am sixty or over and I am still bleeding. I would like it looked into.',
    look: 'They will usually want to examine you and may arrange a scan. It is a short conversation and it is the right first step.',
  },
};

/* ------------------------------------------------------------ fine print -- */

/** The safety copy that has to appear on every screen that names the product. */
export const FDA_DISCLAIMER =
  'These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease.';

export const OFFER_DISCLAIMER =
  'Not for use if pregnant or nursing. Speak to your doctor first if you have a history of breast, uterine or ovarian cancer, liver disease, blood clots, heart disease or stroke, or if you take blood thinners or prescribed medication. ' +
  FDA_DISCLAIMER + ' Individual results vary.';

export const QUIZ_DISCLAIMER =
  'This check is not medical advice. It cannot diagnose anything and it is not a substitute for seeing a doctor. Individual results vary.';
