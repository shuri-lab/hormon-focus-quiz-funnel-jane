/* THE RESULTS COPY, AS DATA.
 *
 * Every word here is Jane's, transcribed from the copy pack of 6 October 2026
 * (`(C)-2026-10-06-quiz-results-copy-pack.md`) and keyed by the ids that brief
 * uses. Nothing in this file is authored by the build.
 *
 * If Jane sends a polished pack later, REPLACE THE DATA AND NOT THE CODE. The
 * screens read these tables by id and know nothing about the sentences.
 *
 * ON CONTRACTIONS. The house style has had none since 1 September 2026, and
 * `tests/copy.test.ts` enforces that on every other authored module. This pack
 * overrides it in writing: "That is the voice: short, direct, no softening,
 * contractions fine (JJ's voice)." So this module is exempted from the
 * contraction rule there, and from nothing else. The claim gate — the words
 * the brand may never say, and verbs aimed at symptoms — still reads every
 * string below.
 */
import { TILES, has, mainConcern, otherConcerns } from './logic';
import type { Outcome, Pattern, QuizState, SymptomId, TriedId, WantId } from './logic';

/* ---------------------------------------------------------------- gate -- */

export const GATE_LINE =
  'Enter your first name and email to see what your answers suggest, and the first three things to do.';

/* ------------------------------------------------- what this means ------ */

/** A is hormonal imbalance, B perimenopause, C periods stopped. */
export type MeansKey = 'A' | 'B' | 'C';

export const MEANS: Record<MeansKey, string[]> = {
  A: [
    'Your hormones rise and fall every month. That rhythm keeps your sleep, energy, appetite and mood steady.',
    "When it slips, changes show up in more than one place at once. They're connected, so you can work on them together.",
  ],
  B: [
    'Menopause is when your periods stop for good. The hormone changes behind it start years earlier. That stage is perimenopause.',
    'Your hormones get less steady, so changes show up in your sleep, energy, body, temperature and mood at the same time.',
    'That is exactly what many women describe in those years.',
  ],
  C: [
    'After your periods stop, your body runs on less estrogen.',
    'Estrogen did more than run your cycle. So changes keep showing up in your sleep, energy, body, temperature and mood. One stage, not separate problems.',
    'Many women describe the same changes after that point.',
  ],
};

/** E is early menopause, and reads the same block as C. D never reaches r1. */
export function meansFor(outcome: Outcome): string[] {
  if (outcome === 'B') return MEANS.B;
  if (outcome === 'C' || outcome === 'E') return MEANS.C;
  return MEANS.A;
}

/* ---------------------------------------- the closing line, by main ------ */

export const CLOSE: Record<SymptomId, string> = {
  weight: "That's why the weight is sitting differently, even though you're not eating more.",
  sleep: "That's why your sleep changed, even though your bedtime didn't.",
  energy: "That's why your energy dropped, even on the days you do everything right.",
  sweats: "That's why you suddenly feel hot when the room hasn't changed.",
  bloat: "That's why the bloating keeps coming back, even when your food stays the same.",
  mood: "That's why your mood and focus don't feel like yours some days.",
};

/** Read after the close line on every result. Agreed with Jane, 7 Oct. */
export const STAGE_LINE =
  "This is a normal stage, not an illness. It's hard, and there's real support for it. Here is where I'd start.";

/** Early menopause only, read after STAGE_LINE. The one result where a blood test helps. */
export const EARLY_DOCTOR_LINE =
  "This is the one result I'd take to your doctor soon, because it's the one where a blood test helps.";

/* ------------------------------------------ the pattern line, by how often */

export const PAT: Record<Pattern, string> = {
  monthly: "It comes around the same time each month. Write that down. It's a clue.",
  comego: "It comes and goes with no clear pattern. That's why tracking matters.",
  weekly: 'Most weeks is often enough to spot a pattern. Start writing it down.',
  daily: 'Almost every day is a lot. Start with one or two changes, not everything.',
  untracked: "You haven't tracked it yet. Seeing the pattern is step one.",
};

/* ------------------------------- why it feels different now, by main ----- */

/* A FIXED heading per symptom. Never built from her tile label. */
export const HEAD: Record<SymptomId, string> = {
  weight: 'Why the weight feels different now',
  sleep: 'Why your sleep has changed',
  energy: 'Why your energy has dropped',
  sweats: 'Why you feel hot out of nowhere',
  bloat: 'Why the bloating keeps coming back',
  mood: "Why you don't feel like yourself",
};

export const SYM: Record<SymptomId, string> = {
  weight: "After 40, weight isn't just about food. Sleep, muscle, appetite and hormones all change at once. Eat less and do more cardio stops being the whole answer.",
  sleep: "In this stage, sleep gets easier to break. You fall asleep fine, then you're wide awake at 3 AM. A bad night follows you into the next day: less energy, more hunger.",
  energy: "Low energy is never one thing. Sleep, meals and movement all feed it, and all three change in this stage. Pushing harder won't change the pattern. Seeing it will.",
  sweats: "Your body's temperature control gets more sensitive in this stage. A small shift feels like a wave of heat. At night: covers off, waking up sweaty.",
  bloat: "Bloating moves with your food, your cycle and your stress. Cutting more foods isn't the first answer. Noticing when it happens is.",
  mood: "Mood swings and brain fog arrive with changes in sleep and energy in this stage. That's why they feel so unlike you.",
};

/** Appended only when she also ticked sleep and sleep is not her main. */
export const SYM_SLEEP: Partial<Record<SymptomId, string>> = {
  sweats: 'Your sleep is poor too, and the two are linked. Sometimes the heat wakes you. Sometimes you wake, then feel the heat.',
  energy: 'Your sleep is poor too. A bad night turns into a low day, every time.',
  mood: 'Your sleep is poor too. A short night makes a hard mood harder.',
};

/** The extra sentence, where there is one for this combination. */
export function symExtra(S: QuizState, main: SymptomId): string | '' {
  if (!has(S, 'sleep') || main === 'sleep') return '';
  return SYM_SLEEP[main] ?? '';
}

/* ------------------------------------------------ your first three ------- */

export const THREE_TITLE = 'Your first three things';

/** The six symptoms, plus the tracker card she gets when she wants to understand. */
export type CardId = SymptomId | 'track';

export const PRI: Record<CardId, { title: string; body: string }> = {
  weight: {
    title: 'Build meals that keep you full',
    body: 'Protein, vegetables, a fiber-rich carb, healthy fat. Full beats small.',
  },
  sleep: {
    title: 'Protect your sleep',
    body: 'Cool, dark room. Phone away 30 minutes before bed. Write down the rough nights.',
  },
  energy: {
    title: 'Build steadier energy',
    body: 'A decent night, meals that fill you up, a 10-minute walk after dinner.',
  },
  sweats: {
    title: 'Make nights easier',
    body: 'Cool room, a wind-down routine, less alcohol and caffeine late in the day. Track the hot nights.',
  },
  bloat: {
    title: 'Track the bloating',
    body: 'When it shows up, what you ate, where you are in your cycle. Two weeks shows the pattern.',
  },
  mood: {
    title: 'Guard the basics',
    body: 'Sleep, meals and movement shape your mood more than you think. Protect those three first.',
  },
  track: {
    title: 'Write it down for two weeks',
    body: 'Sleep, energy, mood, cravings, how your clothes fit. Two weeks on paper beats months of guessing.',
  },
};

/** What she wants most, where it does not come from a symptom she ticked. */
export const WANT_CARD: Record<WantId, CardId> = {
  body: 'weight',
  sleep: 'sleep',
  energy: 'energy',
  cool: 'sweats',
  clear: 'mood',
  understand: 'track',
};

/**
 * Her three cards.
 *
 * The one that bothers her most first, then everything else she ticked in
 * tile order, de-duplicated. If she ticked fewer than three things, what she
 * wants most fills a place. Never more than three.
 */
export function threeCards(S: QuizState): CardId[] {
  const main = mainConcern(S);
  const out: CardId[] = [];
  const add = (id: CardId) => { if (id && out.indexOf(id) < 0 && out.length < 3) out.push(id); };

  if (main) add(main);
  for (const id of otherConcerns(S)) add(id);
  if (out.length < 3 && S.want) add(WANT_CARD[S.want]);
  return out.slice(0, 3);
}

/* -------------------------------------------- you have already tried ----- */

export const ACK: Record<'food' | 'sleep' | 'gym' | 'supps' | 'doctor', string> = {
  food: "You've already changed how you eat, so don't eat less. Build each meal better.",
  sleep: "You've already worked on your sleep. Now track the nights instead of going to bed earlier.",
  gym: "More cardio won't work. Add strength training to build muscle, even a 10-minute walk a day.",
  supps: "Another bottle isn't the answer. A supplement only works inside a bigger plan.",
  doctor: "You've talked to your doctor. Good. Keep going, and bring your tracker next time.",
};

const tried = (S: QuizState, id: TriedId) => S.tried.indexOf(id) > -1;

/**
 * The acknowledgement that sits inside a card, keyed by the card it belongs to.
 *
 * food goes on the weight card, sleep on the sleep card or else the sweats
 * card, gym on the energy card or else the weight card. Each only where that
 * card is actually one of her three. wait and nothing say nothing at all.
 */
export function cardAcks(S: QuizState, cards: CardId[]): Partial<Record<CardId, string>> {
  const out: Partial<Record<CardId, string>> = {};
  const on = (id: CardId) => cards.indexOf(id) > -1;

  if (tried(S, 'food') && on('weight')) out.weight = ACK.food;
  if (tried(S, 'sleep')) {
    if (on('sleep')) out.sleep = ACK.sleep;
    else if (on('sweats')) out.sweats = ACK.sleep;
  }
  if (tried(S, 'gym')) {
    if (on('energy')) out.energy = ACK.gym;
    else if (on('weight') && !out.weight) out.weight = ACK.gym;
  }
  return out;
}

/** The acknowledgements that sit under the cards rather than inside one. */
export function underCardAcks(S: QuizState): string[] {
  const out: string[] = [];
  if (tried(S, 'supps')) out.push(ACK.supps);
  if (tried(S, 'doctor')) out.push(ACK.doctor);
  return out;
}

/* --------------------------------------------------------- the kit ------ */

export const KIT_TITLE = 'This is why I made the 60-Day Kit';

export const KIT_INTRO =
  'Knowing what to do is one thing. Doing it every day for 60 days is another. '
  + 'Why 60 days? Hormones change slowly, and so do habits. Many women tell me '
  + 'the first month is small things: a better night here, a steadier day there. '
  + 'They tell me the second month is when those add up to a pattern you can see. '
  + 'So everything '
  + 'in the Kit is built for the full 60. '
  + "That's why I made the Hormone Focus 60-Day Kit: one plan for the food, the "
  + 'sleep, the tracking and the hormone support.';

/* The four approved product lines, verbatim. */
export const KIT_PIECES: [string, string][] = [
  ['The 60-Day Hormone Fix guide', "what's changing and what to focus on now."],
  ['Hormone Healthy Recipes', '"eat better" turned into meals you can actually make.'],
  ['The Daily Symptom Tracker', 'one place to see your pattern instead of guessing.'],
  [
    'Hormone Focus',
    'supports healthy estrogen metabolism. DIM supports healthy estrogen metabolism. '
    + "Calcium D-Glucarate supports the body's natural processes involved in processing and "
    + 'eliminating certain substances. BioPerine is included to support absorption. '
    + 'Two bottles, so this piece sits inside the same 60-day routine.',
  ],
];

export const KIT_CLOSE =
  "Not one more thing to try. A simple plan for this stage: understand what's changing, know what to do next, track how your body responds, support it along the way.";

/** Tile order, for any test that wants to walk every symptom. */
export const SYMPTOM_IDS: SymptomId[] = TILES.map(([id]) => id);
