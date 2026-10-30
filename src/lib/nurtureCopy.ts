/* THE THREE SCREENS BETWEEN HER RESULT AND THE PRICE.
 *
 * She finishes the quiz problem-aware: she knows what her answers point to and
 * nothing more. The offer used to be the very next thing she saw, which asked
 * her to go from "so that is what is happening to me" to "here is $45" in one
 * step. These three screens are that step, broken into three:
 *
 *   cause  what is behind it            problem-aware  ->  solution-aware
 *   plan   what to do about it          solution-aware
 *   meet   what does the first part     solution-aware ->  product-aware
 *
 * WRITTEN TO THE SAME GATE AS EVERYTHING ELSE. Every string here is read by
 * tests/copy.test.ts: no contractions, no verb aimed at a symptom, no banned
 * word, and no duration tied to a change without saying whose change it is.
 *
 * AND NO DASHES, em or en, at David's instruction of 29 October. A period or
 * a comma does the same work and survives being read aloud.
 *
 * **BOLD IS MARKED IN THE COPY**, 30 October 2026. David asked for the key
 * phrases highlighted so these screens can be skimmed rather than read. The
 * marker is a pair of asterisks and `Rich` in nurture.tsx is what turns it
 * into <strong>; the gate reads the string with the markers in it, which
 * costs nothing because a claim is a claim either way, and a test keeps the
 * pairs balanced.
 *
 * All of it is draft for JJ's sign-off.
 */

import type { SymptomId } from './logic';

/* ------------------------------------------------- 1. what is going on -- */

export const CAUSE_EYEBROW = 'What is really going on';
export const CAUSE_HEAD = 'The real problem is too much estrogen.';
export const CAUSE_DECK = 'It is not you. And it is not willpower.';

/** Under the graphic. The picture is text free, so the caption carries it. */
export const CAUSE_IMG_CAP =
  'After 40, your body **cannot clear estrogen fast enough**. So it builds up.';

/**
 * HER SYMPTOMS, IN THIS SENTENCE, one phrase each.
 *
 * It read "the belly that will not budge, the nights you lie awake, and the
 * moods that come from nowhere" for everybody, which named three things a
 * woman who ticked hot flashes and bloating never said. David, 30 October:
 * call out what she actually gave us, the way the result page does.
 *
 * The voice is the original line's: a definite article and the moment she
 * notices it, never a verb aimed at the symptom. "From nowhere" belongs to
 * mood alone, so a woman who ticked both mood and hot flashes does not read
 * it twice.
 */
export const CAUSE_SYMPTOM: Record<SymptomId, string> = {
  weight: 'the weight that will not budge',
  sleep: 'the nights you lie awake',
  energy: 'the days you cannot get going',
  sweats: 'the heat that hits without warning',
  bloat: 'the belly that will not settle',
  mood: 'the moods that come from nowhere',
};

/** The fallback, for a state that reached this screen with no symptoms. */
export const CAUSE_BODY_1_DEFAULT =
  'That extra estrogen is behind **the weight that will not budge**, '
  + '**the nights you lie awake**, and **the moods that come from nowhere**.';

/**
 * The sentence, built from what she told us.
 *
 * THREE AT MOST, hers first. She can tick all six, and "behind A, B, C, D, E
 * and F" is a list rather than a sentence; the three she cares about most are
 * the ones she ranked. One symptom reads "behind X.", two read "behind X and
 * Y.", three read "behind X, Y, and Z." so the sentence is grammatical at
 * every length rather than at the one length it was written for.
 */
export function causeBody(ids: SymptomId[]): string {
  const phrases = ids.slice(0, 3).map((id) => `**${CAUSE_SYMPTOM[id]}**`);
  if (phrases.length === 0) return CAUSE_BODY_1_DEFAULT;

  const list = phrases.length === 1
    ? phrases[0]
    : `${phrases.slice(0, -1).join(', ')}${phrases.length > 2 ? ',' : ''} and ${phrases.at(-1)}`;
  return `That extra estrogen is behind ${list}.`;
}
export const CAUSE_BODY_2 =
  '**Help your body clear it**, and you give all of it a reason to settle.';

/**
 * THE FALLBACK ONLY. The chips are HER symptoms, read off her answers in
 * nurture.tsx, since 30 October: showing a woman who ticked hot flashes a row
 * reading "stubborn weight, broken sleep, mood swings" is the page telling
 * her about somebody else. These three are what renders if she somehow
 * arrived with no symptoms recorded, which a deep link can do.
 */
export const CAUSE_CHIPS: string[] = ['Stubborn weight', 'Broken sleep', 'Mood swings'];

export const CAUSE_CTA = 'OKAY, SO WHAT DO I DO?';

/* ------------------------------------------------------ 2. the plan ----- */

export const PLAN_EYEBROW = 'Where to start';
export const PLAN_HEAD = 'Three simple things. That is the whole plan.';

/** [what she does, what it takes]. The icons beside them carry no words. */
export const PLAN_STEPS: [string, string][] = [
  ['Help your body clear the extra estrogen.',
    'Once a day. **The piece most women are missing.**'],
  ['Eat in a way that works with your hormones.',
    '**Simple swaps**, not a diet.'],
  ['See how you feel as you go.',
    'A few seconds a day, so you know it is working.'],
];

/**
 * In the dashed note box under the steps.
 *
 * "60 days" passes the clock rule because nothing in the sentence is tied to
 * a change: it is how long the plan runs, not how long a result takes. Note
 * that "chance" is not "change", which is the word the rule looks for.
 */
export const PLAN_NOTE =
  'Do these for **60 days**, and give your body a real chance.';

export const PLAN_BODY =
  'You do not have to figure this out alone. **Step one is the piece your body '
  + 'cannot do on its own right now**, so that is where we start.';

export const PLAN_CTA = 'SHOW ME STEP ONE';

/* --------------------------------------------------- 3. the product ----- */

export const MEET_EYEBROW = 'The missing piece';
export const MEET_HEAD = 'Meet Hormone Focus.';
export const MEET_LEAD =
  'A daily supplement with **one job**: helping your body clear out the extra '
  + 'estrogen.';
export const MEET_BODY =
  'That is the part **your body cannot do fast enough on its own anymore**. '
  + 'Hormone Focus gives it a hand, with three ingredients that each do one '
  + 'thing:';

/** Over the ingredient rows, so the list is announced and not just reached. */
export const MEET_INGS_HEAD = 'What is inside';

/**
 * [dose, name, the plain line, the structure-function line].
 *
 * TWO LINES PER INGREDIENT, DELIBERATELY. The plain one is what she
 * understands; the official one is what the label is allowed to say. Showing
 * both means the plain language never has to carry the claim on its own.
 */
export const MEET_INGS: [string, string, string, string][] = [
  ['200 mg', 'DIM',
    'Helps break estrogen down.',
    'Supports healthy estrogen metabolism.'],
  ['500 mg', 'Calcium D-Glucarate',
    'Helps clear it out.',
    'Supports the body’s clearing of used hormones.'],
  ['2.5 mg', 'BioPerine',
    'Helps the first two work.',
    'Supports absorption of the other two.'],
];

export const MEET_CLOSE =
  '**No fillers. Nothing hidden.** Three ingredients, each with a job, made '
  + 'for exactly what is happening to you.';

export const MEET_CTA = 'SHOW ME MY PLAN';

/* ----------------------------------------------------------- the alts --- */

/** What each picture shows, for a screen reader and a slow connection. */
export const CAUSE_IMG_ALT = 'A glass overflowing, with drops running down the side';
export const PLAN_STEP_ALTS: string[] = [
  'A capsule',
  'A plate of vegetables, salad and grilled chicken',
  'An open notebook with three items ticked off, and a pen',
];
export const MEET_HOW_ALT =
  'Clustered estrogen breaking apart into smaller pieces, then leaving through an open door';
export const MEET_BOTTLE_ALT = 'A bottle of Hormone Focus';
