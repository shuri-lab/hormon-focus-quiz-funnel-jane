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
export const CUSTOMERS = [1, 2, 3, 4, 5, 6].map((n) => `/img/customer-${n}.jpg`);

/* CHIP_PROGRAMS is the SCOPED form of the 800,000 figure: books and
   challenges, never a Hormone Focus customer count. Jane approved this
   wording on 15 September 2026. Do not revert it to the unscoped form. */
export const CHIP_PROGRAMS = "800K+ women in JJ's programs";

/** The share image for the cover. Not shown on the cover itself. */
export const HERO_IMG = '/img/symptom-sleep.jpg';

/** Attribution under any block of reviews. */
export const REVIEW_SOURCE =
  'Reviews from verified buyers on JJSmithOnline.com. Individual results vary.';

/* ------------------------------------------------------------ the cover -- */

/* The brief's words. The sub-line and the button are the same on every
   route; only the headline changes with the ad angle (angles.ts). */
export const COVER_SUB =
  'Take this 2-Minute Hormone Check and find out the pattern behind your symptoms.';
export const COVER_CTA = 'GET THE HORMONE CHECK';

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

/* "Your pattern: These changes are showing up most weeks, and your cycle has
   become less predictable." The first half comes from question five. */
const PATTERN_PHRASE: Record<Pattern, string> = {
  monthly: 'These changes show up around the same time each month',
  comego: 'These changes come and go without a clear pattern',
  weekly: 'These changes are showing up most weeks',
  daily: 'These changes are showing up almost every day',
  untracked: 'You have not tracked these changes yet',
};

/* The second half comes from the cycle question and its follow-up. */
function cyclePhrase(S: QuizState): string {
  if (masked(S)) return 'birth control, medication or surgery is affecting your cycle';
  switch (S.cycle) {
    case 'same': return 'your cycle is about the same as usual';
    case 'unpredictable': return 'your cycle has become less predictable';
    case 'skipping': return 'you have started skipping periods';
    case 'unsure': return 'you are not sure what your cycle is doing';
    case 'stopped':
      if (S.twelve === 'yes') return 'your periods stopped 12 months ago or more';
      if (S.twelve === 'no') return 'your periods have stopped in the last 12 months';
      return 'your periods have stopped';
    default: return '';
  }
}

export function patternLine(S: QuizState): string {
  const a = S.pattern ? PATTERN_PHRASE[S.pattern] : '';
  const b = cyclePhrase(S);
  if (a && b) return `${a}, and ${b}.`;
  if (a) return `${a}.`;
  return b ? `${b.charAt(0).toUpperCase()}${b.slice(1)}.` : '';
}

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

export interface ResultCopy {
  /** The headline. A pattern, never a diagnosis. */
  headline: string;
  /** "Here is what that means", in plain paragraphs. */
  means: string[];
}

/* B is the brief's own wording. A, C and E are PLACEHOLDER lines in the same
   shape, waiting on final copy. */
export const RESULT: Record<Exclude<Outcome, 'D'>, ResultCopy> = {
  A: {
    headline: 'Hormone changes may be part of the picture.',
    means: [
      'Your answers do not point clearly to perimenopause or menopause yet. Your hormones still shift from month to month, and those shifts can show up in more than one part of your body.',
      'That is why changes in sleep, energy, mood, bloating and the way your body carries weight can sometimes start showing up around the same time.',
    ],
  },
  B: {
    headline: 'Your answers show a pattern often seen during the perimenopause years.',
    means: [
      'Perimenopause is the transition before menopause, when your hormones begin changing in ways that can affect more than one part of your body.',
      'That is why changes in sleep, energy, hot flashes, mood, concentration, bloating, and the way your body carries weight can sometimes start showing up around the same time.',
    ],
  },
  C: {
    headline: 'Your answers show a pattern often seen around menopause.',
    means: [
      'Menopause is the point when your periods have stopped for 12 months. Your hormones settle at a new level after that, and the changes do not always stop when your periods do.',
      'That is why sleep, energy, hot flashes, mood, concentration, bloating, and the way your body carries weight can still be changing now.',
    ],
  },
  E: {
    headline: 'Your answers show a pattern often seen when menopause comes early.',
    means: [
      'Your periods stopped 12 months ago or more, and you are under 45. That is earlier than average. It is not rare, and it is worth having confirmed by your doctor so you know where you stand.',
      'The changes that come with menopause can show up in sleep, energy, hot flashes, mood, concentration, bloating, and the way your body carries weight.',
    ],
  },
};

/** Said on the result when her cycle cannot tell us anything. */
export const MASKED_NOTE =
  'Birth control, medication or surgery is affecting your cycle, so your cycle cannot tell us much. This result comes from your age and the changes you are noticing.';

/** What the check cannot do, said once on the result. */
export const CANNOT_TELL =
  'This check cannot measure your hormones, and it cannot rule anything out. If your periods changed suddenly, if you are under 45, or if anything here worries you, talk to your doctor. Any bleeding after 12 months without a period is a reason to see your doctor.';

/* ---------------------------------------------------------- what to do next -- */

/* The brief's words, opening the kit page. */
export const NEXT_TITLE = 'So what do you do now?';
export const NEXT_LEAD = 'You do not need to try to fix everything at once.';
export const NEXT_INTRO = 'For the next 60 days, focus on a few things consistently:';
export const NEXT_STEPS: string[] = [
  'Eat to support the body you have now',
  'Move your body and protect your muscle',
  'Pay attention to sleep and stress',
  'Support your hormones',
  'Track how you feel instead of relying only on the scale',
];
export const NEXT_BRIDGE =
  'This is exactly why I created the 60-Day Feel Like YOU Again Kit.';

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
