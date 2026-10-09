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

/**
 * The headline over her three things, by the concern she named.
 *
 * It replaces `nextTitle()` in content.ts ("Your 60-day plan for your weight"),
 * which promised a plan before she had read one. This says what the next
 * screen actually is: where to start. Jane's pack, 8 October 2026.
 */
export const START_TITLE: Record<SymptomId, string> = {
  weight: 'Start with these 3 for stubborn weight',
  sleep: 'Start with these 3 for poor sleep',
  energy: 'Start with these 3 for low energy',
  sweats: 'Start with these 3 for hot flashes',
  bloat: 'Start with these 3 for bloating',
  mood: 'Start with these 3 for mood and focus',
};

/* Kept as the export it was. START_TITLE is the headline the screen shows
   over her three cards now, so this label is no longer rendered. */
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
 * Her three cards: two about what she came for, then the tracker.
 *
 * ALWAYS EXACTLY THREE, AND `track` IS ALWAYS THE THIRD. Jane, 9 October 2026.
 * It used to return whatever it could fill, up to three, so a woman who
 * ticked three symptoms got three symptom cards and never the tracker, while
 * a woman who ticked one could end up with two cards. Writing it down is the
 * one action that works for every result, so it stops being the card that
 * only some women see.
 *
 * The first two, in order:
 *  1. the one that bothers her most;
 *  2. the next thing she ticked, in tile order; failing that what she wants
 *     most, when that is not already the first card; failing that sleep, or
 *     weight when sleep is the first card.
 *
 * `track` is never allowed into the first two, which is what stops
 * `want: 'understand'` putting the tracker in slot two and again in slot
 * three. No duplicates, and the result is three cards whatever she answered.
 */
export function threeCards(S: QuizState): CardId[] {
  const main = mainConcern(S);
  const out: CardId[] = [];

  /* Fills the first two slots only, and never with the tracker. */
  const add = (id: CardId | '') => {
    if (!id || id === 'track') return;
    if (out.indexOf(id) < 0 && out.length < 2) out.push(id);
  };

  add(main);
  for (const id of otherConcerns(S)) add(id);
  if (S.want) add(WANT_CARD[S.want]);
  /* Nothing of hers was left to show. Two cards she can act on regardless. */
  add(main === 'sleep' ? 'weight' : 'sleep');
  add('weight');

  out.push('track');
  return out;
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

/**
 * The paragraph between her three things and the Kit.
 *
 * It names the hard part before it names the thing that helps with it, which
 * is why it sits after the cards and not inside them, and it hands over to the
 * Kit by name.
 */
export const BRIDGE =
  "These are the first three things I'd work on. None of them are complicated, "
  + 'but doing them consistently when life gets busy is where it gets harder. '
  + 'This is why I built the Feel Like YOU Again Kit.';

export const KIT_TITLE = 'The 60-Day Feel Like YOU Again Kit';

/** Two paragraphs, so the screen can breathe between them. */
export const KIT_INTRO: string[] = [
  "I put the Feel Like YOU Again Kit together so you don't have to piece all of "
  + 'this together on your own. It gives you 60 days to stay with the same simple '
  + 'plan instead of changing things every few days.',
  'Hormones change slowly, and so do habits, so I want you looking at more than '
  + 'a few good days.',
];

export const WHY60_TITLE = 'Why 60 days?';

/**
 * Why the Kit runs sixty days, said about the thing she came for.
 *
 * Every line is attributed in its own sentence: "many women tell me" is what
 * the claims gate accepts, and a timeline is only ours to state if somebody
 * else stated it first. Approved as written, Jane, 8 October 2026.
 */
export const WHY60: Record<SymptomId, string> = {
  weight:
    'Many women tell me they notice the first signs in the first month, like '
    + 'their clothes fitting a little differently. The second month gives you '
    + 'more time to see if that change is actually holding.',
  sleep:
    'Many women tell me they start noticing better nights in the first month. '
    + 'The second month gives you more time to see if those better nights are '
    + 'becoming more consistent.',
  energy:
    'Many women tell me they start noticing better-energy days in the first '
    + 'month. The second month gives you more time to see if those days are '
    + 'happening more often.',
  sweats:
    'Many women tell me they start noticing fewer rough nights in the first '
    + 'month. The second month gives you more time to see if that keeps '
    + 'happening.',
  bloat:
    'Many women tell me they start noticing less bloating in the first month. '
    + 'The second month gives you more time to see if that change is holding.',
  mood:
    'Many women tell me they start noticing more good days in the first month. '
    + 'The second month gives you more time to see if those days are becoming '
    + 'more consistent.',
};

export const KIT_PIECES_TITLE = "What's inside";

/** The four pieces, one line each, in the order she reads them. */
export type KitPieceId = 'guide' | 'recipes' | 'tracker' | 'focus';

export const KIT_PIECE_IDS: KitPieceId[] = ['guide', 'recipes', 'tracker', 'focus'];

export const KIT_PIECES: Record<KitPieceId, string> = {
  guide: "The 60-Day Hormone Fix Guide. What's changing and what to focus on now.",
  recipes: 'Hormone Healthy Recipes. Simple meals you can actually make and keep eating.',
  tracker: "Daily Symptom Tracker. See what's changing instead of trying to remember.",
  focus: 'Hormone Focus. Two capsules with a meal every day, with two bottles for the full 60 days.',
};

/**
 * The one structure-function claim the bottle carries on this page, small and
 * under the dose line.
 *
 * THE CLAIM IS NEVER THE HEADLINE. The name comes first, then the picture,
 * then what she does with it, then this.
 *
 * The DIM, Calcium D-Glucarate and BioPerine sentences are NOT here. They were
 * on this page until 8 October and they now live only on the offer page, in
 * kitCopy.ts and offerCopy.ts, where she is reading about the product rather
 * than about what to do next.
 */
export const KIT_FOCUS_CLAIM = 'Hormone Focus supports healthy estrogen metabolism.';

export const KIT_CLOSE =
  'Not one more thing to try. Just one plan built around feeling like you again.';

/** Tile order, for any test that wants to walk every symptom. */
export const SYMPTOM_IDS: SymptomId[] = TILES.map(([id]) => id);
