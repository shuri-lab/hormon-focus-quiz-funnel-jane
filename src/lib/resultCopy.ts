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
import { triedLine } from './content';

/* ---------------------------------------------------------------- gate -- */

export const GATE_LINE =
  'Enter your first name and email to see what your answers suggest, and the first three things to do.';

/** Under the button. What her answers are used for, and nothing more. */
export const GATE_PRIVACY =
  'We use your answers only to show your plan and send what you ask for.';

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

/* -------------------------------------------- the hero's reassurance ---- */

/**
 * One line under her result, before anything explains anything.
 *
 * STAGE_LINE said this at length further down the old page and is still
 * exported; this is the short form, in the one place she is most likely to
 * read it, which is directly under the sentence naming her stage.
 *
 * DRAFT FOR JANE.
 */
export const RESULT_REASSURE = 'A normal stage, and there is a lot you can do.';

/** The kicker over her result. The name is hers when she gave one. */
export const resultKicker = (name: string): string =>
  (name ? `${name}, here is your result` : 'Here is your result');

/* ------------------------------------ what it means, in one line --------- */

/**
 * ONE LINE WHERE THERE WERE SIX PARAGRAPHS, 29 October 2026.
 *
 * MEANS above is still exported and still gated; it simply stops rendering on
 * the result page, because `cause`, `plan` and `meet` now carry the
 * explanation and the result page's job is to name her result and hand over.
 *
 * E READS C, exactly as meansFor() has always done: early menopause is
 * menopause arriving sooner, and the sentence about running on less estrogen
 * is true of both. Use meansShortFor() rather than indexing this directly.
 *
 * DRAFT FOR JANE, all three.
 */
export const MEANS_SHORT: Record<'A' | 'B' | 'C', string> = {
  A: 'Your hormones rise and fall less evenly than they used to.',
  B: 'Your hormones are not as steady as they used to be.',
  C: 'After your periods stopped, your body runs on less estrogen.',
};

export function meansShortFor(outcome: Outcome): string {
  if (outcome === 'B') return MEANS_SHORT.B;
  if (outcome === 'C' || outcome === 'E') return MEANS_SHORT.C;
  return MEANS_SHORT.A;
}

/**
 * The clause that ties her symptoms together, after CLOSE[main].
 *
 * "NOT SEVERAL", WHERE THE BRIEF WROTE "not three". The brief guarded this on
 * `main`, which is set for everyone, so a woman who ticked ONE symptom was
 * told "it is one thing, not three" about the one thing she named. She can
 * tick anywhere from one to four, so no number is right for all of them, and
 * reveal.tsx now renders this only when she named more than one.
 *
 * DRAFT FOR JANE, and the word is hers to set. It is also the one line on the
 * card that makes a claim about her: that the things she ticked share a
 * cause. That is the argument the whole funnel rests on.
 */
export const UNIFY = ' It is one thing, not several.';

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

/* --------------------------------------- the part most women miss ------- */

/*
 * THE GAP, NAMED BEFORE THE PLAN IS OFFERED.
 *
 * It sits between "why your sleep has changed" and "what you want most", and
 * its whole job is to say that effort was never the missing piece. The offer
 * page then opens on the plan rather than on a price.
 *
 * NO PRODUCT, PRICE, REVIEW OR LINK, which is not a style note: the result
 * page is sell-free and the tests fail the build if that changes.
 *
 * !! PENDING JJ SIGN-OFF !! Drafted in her result voice, where contractions
 * are hers and deliberate (see the carve-out in copy.test.ts). The claim gate
 * still reads every line here.
 *
 * THE SECOND SENTENCE IS A CLAIM ABOUT HER, so there are three of them and
 * she gets the one that is true. A woman who ticked "Nothing yet" is never
 * told she has already tried anything, and a woman who only talked to her
 * doctor is not told she changed how she eats.
 */
export const MISS_TITLE = 'The part most women miss';

/* REWRITTEN 29 October 2026, and it now POINTS FORWARD. The result page used
   to carry the whole explanation because it was the last thing before the
   price; three screens explain the cause now, so this line stops explaining
   and starts handing over. missLine() below is no longer rendered with it:
   the second line used to be a claim about what she had already tried, and
   the hook reads shorter without it. Still exported, still gated. */
export const MISS_LEAD =
  'This is not about effort. What changed is on the inside, in how your body '
  + 'handles its hormones. That is exactly what I want to show you next.';

/** She ticked eating differently, exercising more, or both. */
export const MISS_TRIED =
  "You've already tried eating better and moving more. Those are good, and "
  + "they're not the missing piece, because they don't reach what actually "
  + 'shifted.';

/** She tried something, but not food and not the gym. */
export const MISS_OTHER =
  "You've been doing what you can. The piece most women miss is the one on "
  + 'the inside.';

/** "Nothing yet", and the deep-linked page with no answers behind it. */
export const MISS_NOTHING =
  'No one really tells you what shifted, so it is hard to know where to start.';

/* ------------------------------------------------- the hand-off --------- */

/*
 * The last line of "what you want most", which hands her to the plan.
 *
 * TWO OF THEM, because one answer makes the ordinary line read wrong. A woman
 * whose want is "understand what is happening to my body" has just spent a
 * page understanding it, and telling her there is a simple place to start
 * reads as though the page had not been listening. Hers pivots from
 * understanding to doing instead.
 */
/*
 * "THE PLAN I'D BUILD FOR YOU" CAME OFF, 22 October.
 *
 * The page she presses through to sells one bottle of Hormone Focus. It
 * stopped being a plan when the kit came off it, and a hand-off promising
 * one would have been the result page writing a cheque the offer page no
 * longer cashes.
 */
export const WANT_HANDOFF =
  'Now let me show you what is actually going on, and the simple plan to '
  + 'feel like you again.';

export const WANT_HANDOFF_UNDERSTAND =
  'You wanted to understand what is happening. Let me show you, and then the '
  + 'simple plan.';

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
 * Which of the three "part most women miss" lines is true of her.
 *
 * Read through the same `tried` helper the card acknowledgements below use,
 * so her result and the acknowledgement inside her weight card can never
 * disagree about what she said. 'wait' counts as having done something,
 * because she told us what she has been doing; only 'nothing' and an empty
 * answer fall to the last line.
 */
export function missLine(S: QuizState): string {
  if (tried(S, 'food') || tried(S, 'gym')) return MISS_TRIED;
  if (S.tried.some((id) => id !== 'nothing')) return MISS_OTHER;
  return MISS_NOTHING;
}

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
  + 'This is why I built the 60-Day Feel Like You Again Kit.';

export const KIT_TITLE = 'The 60-Day Feel Like You Again Kit';

/** Two paragraphs, so the screen can breathe between them. */
export const KIT_INTRO: string[] = [
  "I put the 60-Day Feel Like You Again Kit together so you don't have to piece all of "
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

/* ======================================================= DIRECTION 2 ======
 * 11 November 2026, local mock. The result page carries her 60-day plan: her
 * headline (Jane's line), her moment, the four parts of JJ's Kit each named
 * for the answer it serves, one honest line on why, the doctor line, and the
 * button to the Kit. The three screens that used to sit between the result
 * and the offer are cut; what they did is said here in a line each.
 */

/** Her symptom, as Jane's headline names it. */
const D2_HEAD: Record<SymptomId, string> = {
  weight: 'Weight that will not move',
  sleep: 'Waking at 3 AM',
  energy: 'Running out of steam by 2 PM',
  sweats: 'Night sweats',
  bloat: 'Bloating by dinner',
  mood: 'Snapping or losing your words',
};
const lower = (s: string): string => s.charAt(0).toLowerCase() + s.slice(1);

/** "[Her top two] are common in perimenopause." Jane, 11 Nov. */
export function d2Headline(S: QuizState, outcome: Outcome): string {
  const main = mainConcern(S);
  if (!main) return 'What you are feeling is common at your stage.';
  const second = otherConcerns(S)[0];
  const what = second ? `${D2_HEAD[main]} and ${lower(D2_HEAD[second])} are` : `${D2_HEAD[main]} is`;
  const where = outcome === 'C' || outcome === 'E' ? 'after periods stop' : 'in perimenopause';
  return outcome === 'A'
    ? `${what} common when hormones start to shift.`
    : `${what} common ${where}.`;
}

/** Her moment, under the headline. */
export const D2_MOMENT: Record<SymptomId, string> = {
  sweats: 'The room is cool. You are still waking up drenched.',
  sleep: 'You are tired all day. Then at 3 AM you are wide awake.',
  weight: 'You are not eating more. Your jeans still got tight.',
  energy: 'You slept all night. You still run out of steam by 2 PM.',
  bloat: 'Your food stayed the same. Your stomach did not.',
  mood: 'Nothing went wrong today. You still snapped, or lost the word.',
};

/** Why it all shows up at once. One line per stage. Never "too much estrogen". */
export const D2_WHY: Record<'A' | 'B' | 'C' | 'E', string> = {
  A: 'Your hormones rise and fall all month. When that rhythm shifts, sleep, mood, energy and appetite can all shift with it.',
  B: 'In the years before periods stop, hormones go up and down unevenly. Sleep, body heat, mood and weight all feel it at once.',
  C: 'After periods stop, the body makes less estrogen. Sleep, body heat, mood and weight all feel it at once.',
  E: 'When periods stop early, the body makes less estrogen sooner than most. Sleep, body heat, mood and weight all feel it at once.',
};

export const D2_DOCTOR: Record<'A' | 'B' | 'C' | 'E', string> = {
  A: 'Talk to your doctor if your periods get very heavy, come much closer together, or if anything worries you.',
  B: 'Talk to your doctor if your bleeding gets very heavy, comes between periods, or if anything worries you.',
  C: 'Talk to your doctor if you bleed after 12 months without a period, or if anything worries you.',
  E: 'Take this result to your doctor soon. A blood test can show where you stand.',
};

export type KitPart = 'hf' | 'recipes' | 'tracker' | 'guide';

export const KIT_PART_NAME: Record<KitPart, string> = {
  hf: 'Hormone Focus',
  recipes: 'Hormone Healthy Recipes',
  tracker: 'The Daily Symptom Tracker',
  guide: 'The 60-Day Hormone Fix guide',
};

/** What each part is, in one line, the same for everyone. */
const KIT_PART_WHAT: Record<KitPart, string> = {
  hf: 'Two capsules a day with a meal. DIM and calcium D-glucarate support healthy estrogen metabolism.*',
  recipes: 'Real meals, not eating less. Start with breakfast.',
  tracker: 'A few minutes a day, so you can see what changes.',
  guide: 'JJ’s five steps for 60 days, and what to do on Day 1.',
};

/** The part made for what she told us. Her worst symptom first; three or more things tried points to the tracker; nothing tried, with no clear lead, points to the guide. */
export function leadPart(S: QuizState): KitPart {
  const tried = S.tried.filter((t) => t !== 'nothing');
  if (tried.length >= 3) return 'tracker';
  const main = mainConcern(S);
  if (main === 'weight' || main === 'bloat') return 'recipes';
  if (main === 'sleep' || main === 'sweats' || main === 'mood') return 'hf';
  if (S.tried.includes('food')) return 'recipes';
  if (S.tried.includes('supps') || S.tried.includes('sleep')) return 'hf';
  return 'guide';
}

/** Which answer each part serves, said back to her. */
export function partFor(S: QuizState, part: KitPart): string {
  const tried = S.tried.filter((t) => t !== 'nothing');
  switch (part) {
    case 'hf':
      if (has(S, 'sweats')) return 'For the night sweats';
      if (has(S, 'sleep')) return 'For waking at 3 AM';
      if (has(S, 'mood')) return 'For the snapping and the lost words';
      return 'For the hormone side of what you feel';
    case 'recipes':
      if (S.tried.includes('food')) return 'You already changed how you eat. This is what to eat instead';
      if (has(S, 'weight')) return 'For the weight that will not move';
      if (has(S, 'bloat')) return 'For bloating by dinner';
      return 'For what you eat each day';
    case 'tracker':
      if (tried.length >= 3) return `You have tried ${tried.length} things. This shows what is working`;
      return 'To see what changes, day by day';
    case 'guide':
      if (S.tried.includes('nothing')) return 'For knowing where to start';
      return 'For putting it all together';
  }
}

export const KIT_ORDER: KitPart[] = ['hf', 'recipes', 'tracker', 'guide'];

export function planParts(S: QuizState): { part: KitPart; lead: boolean; name: string; for: string; what: string }[] {
  const first = leadPart(S);
  return [first, ...KIT_ORDER.filter((p) => p !== first)].map((part) => ({
    part, lead: part === first, name: KIT_PART_NAME[part], for: partFor(S, part), what: KIT_PART_WHAT[part],
  }));
}

/** "You told us you have already tried ..." or, when she tried nothing, the plan's own opening. */
export function planLead(S: QuizState): string {
  return triedLine(S) || 'Here is where to start, in the order that fits your answers.';
}

export const D2_PLAN_LABEL = 'Your 60-day plan';
export const D2_CTA = 'GET MY 60-DAY PLAN';

/* ------------------------------------------- Direction 2: transitions -- */

/** Which published review she meets, by the symptom that bothers her most. Verbatim, from reviews.ts. */
export const REVIEW_FOR: Record<SymptomId, string> = {
  sweats: 'Roslind',
  sleep: 'Katina S.',
  weight: 'Mara',
  bloat: 'Toya H.',
  mood: 'Lisa',
  energy: 'Shauna H.',
};

/* ------------------------------------- Direction 2: goal and time -------- */

/** "Your 60-day plan to ..." by what she wants back first. */
export const GOAL_PHRASE: Partial<Record<WantId, string>> = {
  sleep: 'sleep through the night',
  body: 'feel good in your jeans again',
  clear: 'feel calm again',
  energy: 'have energy all day',
  cool: 'sleep cool through the night',
};

/* Jane, 11 Nov: the plan is named for her symptoms, not a goal. */
const PLAN_FOR: Record<SymptomId, string> = {
  sweats: 'night sweats',
  sleep: 'poor sleep',
  weight: 'stubborn weight',
  bloat: 'bloating',
  mood: 'mood swings',
  energy: 'low energy',
};
export function planHeading(S: QuizState): string {
  const main = mainConcern(S);
  if (!main) return 'Your 60-day plan';
  const second = otherConcerns(S)[0];
  return `Your 60-day plan for ${PLAN_FOR[main]}${second ? ` and ${PLAN_FOR[second]}` : ''}`;
}

/** Her first day. One fixed set (Jane, 11 Nov). No promised result. */
export const DAY_ONE =
  "Day 1: two capsules with dinner, one breakfast from JJ's recipes and one line in your tracker.";

/** The bridge from her result to her plan. */
export const PLAN_BRIDGE = 'That is what your answers point to. Here is what to do about it.';

/* ------------------------------------------- Direction 2: the stat screen -- */
export const STAT_EYEBROW = 'You are not imagining it';
export const STAT_TITLE = 'Nearly 3 in 4 women who see a doctor for these symptoms are left untreated.';
export const STAT_BODY =
  'Most doctors get very little training on this stage. One quick answer for one problem is not enough.';
export const STAT_LINE = 'That is why your plan looks at all of it.';
export const STAT_SOURCE =
  'Sources: Yale review of insurance claims, reported by AARP; APGO survey of OB-GYN program directors, 2022.';

/* ---------------------- Direction 2: the result explains, it does not sell -- */

export const CHANGED_TITLE = 'What has changed';
export const NOW_TITLE = 'What you can do now';
export const RESULT_TO_PLAN = 'SHOW ME MY PLAN';

/** From V3.5. One line for her stage. */
const D2_STAGE_LINE: Record<'A' | 'B' | 'C' | 'E', string> = {
  A: 'Your hormones rise and fall all month. When that rhythm shifts, sleep, mood, energy and appetite can all shift with it.',
  B: 'In the years before periods stop, hormones go up and down unevenly. Sleep, body heat, mood and weight all feel it at once.',
  C: 'After periods stop, the body makes less estrogen. Estrogen helped steady sleep, body heat, mood and weight, so they all feel it at once.',
  E: 'When periods stop early, the body makes less estrogen sooner than most. Sleep, body heat, mood and weight all feel it at once.',
};
/** From V3.5. In place of the stage line when hot flashes are one of her top two. */
const D2_STAGE_LINE_SWEATS: Partial<Record<'A' | 'B' | 'C' | 'E', string>> = {
  B: 'As estrogen swings, the part of your brain that sets your body heat gets jumpy. A tiny rise in heat sets off a flush, even in a cool room.',
  C: 'With less estrogen, the part of your brain that sets your body heat gets jumpy. A tiny rise in heat sets off a flush, even in a cool room.',
  E: 'With less estrogen, the part of your brain that sets your body heat gets jumpy. A tiny rise in heat sets off a flush, even in a cool room.',
};
/** From V3.5. Why her top two go together, where one of them is sleep. */
const PAIR_WITH_SLEEP: Partial<Record<SymptomId, string>> = {
  sweats: 'Heat at night wakes you, which is why your sleep suffers too.',
  energy: 'A broken night turns into a low day, so the two feed each other.',
  mood: 'A short night makes mood swings and brain fog worse the next day.',
  weight: 'Short nights make you hungrier the next day, which makes weight harder to shift.',
};

export function whatChanged(S: QuizState, outcome: Outcome): string[] {
  const o: 'A' | 'B' | 'C' | 'E' = (outcome === 'B' || outcome === 'C' || outcome === 'E' ? outcome : 'A');
  const main = mainConcern(S);
  const two = main ? [main, ...otherConcerns(S).slice(0, 1)] : [];
  const out = [(two.includes('sweats') && D2_STAGE_LINE_SWEATS[o]) || D2_STAGE_LINE[o]];
  if (two.length === 2 && two.includes('sleep')) {
    const pair = PAIR_WITH_SLEEP[two[0] === 'sleep' ? two[1] : two[0]];
    if (pair) out.push(pair);
  }
  return out;
}

/** Three plain, free things, by what bothers her most. From V3.5's tonight lines, with Jane's examples. */
export const DO_NOW: Record<SymptomId, [string, string, string]> = {
  sweats: [
    'Keep your bedroom cool, with a fan by the bed.',
    'Sleep under light covers you can kick off.',
    'Skip caffeine after lunch and wine in the evening.',
  ],
  sleep: [
    'Go to bed and get up at the same time every day.',
    'Keep your bedroom cool and dark.',
    'Put your phone away 30 minutes before bed.',
  ],
  weight: [
    'Start the day with protein at breakfast.',
    'Take a 10 minute walk after a meal.',
    'Go to bed on time. Short nights make you hungrier.',
  ],
  energy: [
    'Eat protein at breakfast, so you are not running on empty.',
    'Take a 10 minute walk after lunch.',
    'Go to bed 30 minutes earlier than last night.',
  ],
  bloat: [
    'Eat slowly, and stop when you are just full.',
    'Take a 10 minute walk after a meal.',
    'Write down what you ate and when the bloating started.',
  ],
  mood: [
    'Take a 10 minute walk outside each day.',
    'Put your phone away 30 minutes before bed.',
    'Write down one thing that set you off today, and when.',
  ],
};

/* ================== Direction 2, result page v3 (Jane, 11 Nov): deeper ===== */

type D2Stage = 'A' | 'B' | 'C' | 'E';
const d2StageOf = (o: Outcome): D2Stage => (o === 'B' || o === 'C' || o === 'E' ? o : 'A');
const afterStop = (o: Outcome): boolean => o === 'C' || o === 'E';

export function whatItIs(o: Outcome): { title: string; body: string } {
  const s = d2StageOf(o);
  if (s === 'C' || s === 'E') return {
    title: 'What menopause is',
    body: 'Menopause is when your periods have stopped for 12 months. The changes can keep going for years after.',
  };
  if (s === 'A') return {
    title: 'What hormone shifts are',
    body: 'Your hormones rise and fall every month. Stress, sleep and age can shift that rhythm, and when it shifts, your body feels it. It is common, not a sickness.',
  };
  return {
    title: 'What perimenopause is',
    body: 'Perimenopause is the years before your periods stop for good. For most women it starts in their 40s and lasts about 4 to 8 years. It is a normal stage, not a sickness.',
  };
}

export const LOOK_TITLE = 'What it can look like';
export const SIGN_HERS = 'You told us';

/** Common signs, and which of her answers each one matches. */
export function signs(S: QuizState, o: Outcome): { text: string; hers: boolean }[] {
  const cycleHers = S.cycle === 'unpredictable' || S.cycle === 'skipping';
  return [
    { text: 'Hot flashes or night sweats', hers: has(S, 'sweats') },
    { text: 'Waking at 3 AM', hers: has(S, 'sleep') },
    { text: 'A softer middle, even when you eat the same', hers: has(S, 'weight') },
    { text: 'Mood swings or losing your words', hers: has(S, 'mood') },
    afterStop(o)
      ? { text: 'Periods that have stopped', hers: S.cycle === 'stopped' }
      : { text: 'Periods that come early or late', hers: cycleHers },
    { text: 'Feeling tired after a full night', hers: has(S, 'energy') },
    { text: 'Bloating by dinner', hers: has(S, 'bloat') },
  ];
}

export const NOT_ALONE_TITLE = 'You are not the only one';
export const NOT_ALONE: string[] = [
  'As many as 3 in 4 women get hot flashes.',
  'About half of women in this stage have trouble sleeping.',
];
export const NOT_ALONE_SOURCE =
  'Sources: The Menopause Society (70 to 80 percent of women have hot flashes or night sweats); Sleep Foundation and The Menopause Society (40 to 60 percent have trouble sleeping).';

export const WHY_TITLE = 'Why it happens';
export function whyItHappens(o: Outcome): string {
  if (afterStop(o)) return 'After periods stop, the body makes less estrogen. Estrogen helps run your body heat, your sleep and where your body stores fat. With less of it, you feel it: hot at night, awake at 3 AM, a softer middle, a shorter fuse.';
  return 'Two hormones, estrogen and progesterone, start to go up and down in an uneven way. Estrogen helps run your body heat, your sleep and where your body stores fat. When it swings, you feel it: hot at night, awake at 3 AM, a softer middle, a shorter fuse.';
}

const PAIR_LINE: Partial<Record<SymptomId, string>> = {
  sweats: 'Heat at night wakes you, which is why your sleep suffers too.',
  energy: 'A broken night turns into a low day, so the two feed each other.',
  mood: 'A short night makes mood swings and brain fog worse the next day.',
  weight: 'Short nights make you hungrier the next day, which makes weight harder to shift.',
};
/** The pair line, when sleep is one of her top two. */
export function pairLine(S: QuizState): string {
  const main = mainConcern(S);
  const two = main ? [main, ...otherConcerns(S).slice(0, 1)] : [];
  if (two.length < 2 || !two.includes('sleep')) return '';
  return PAIR_LINE[two[0] === 'sleep' ? two[1] : two[0]] ?? '';
}

export const FEEL_TITLE = 'How it can feel';
export const FEEL_BODY =
  'It can feel like your body is not yours anymore. These changes are not a sign that something is wrong with you. They are right on time for this stage.';

export const RESULT_CLOSE = 'Your body at this stage needs different support.';

/* ==================== Direction 2, plan page v3: what she needs ============ */

export type NeedPart = 'guide' | 'recipes' | 'hf' | 'tracker';
export const NEEDS: { part: NeedPart; title: string; body: string }[] = [
  { part: 'guide', title: 'A clear plan for this stage',
    body: 'JJ’s 60-Day Hormone Fix guide walks you through five steps: what to eat, how to move, what to change, how to rest and how to track. It tells you what to do on Day 1 and every day after, so you are not guessing.' },
  { part: 'recipes', title: 'Meals made for this stage',
    body: 'At this stage, eating less is not the answer. Your body needs protein at every meal, more fiber and real food that keeps you full. JJ’s Hormone Healthy Recipes gives you 31 recipes: breakfasts, lunches, dinners, snacks and smoothies.' },
  { part: 'hf', title: 'Support for your changing hormones',
    body: 'Because your hormones are changing, Hormone Focus has DIM and calcium D-glucarate to support healthy estrogen metabolism. Two capsules a day with a meal.*' },
  { part: 'tracker', title: 'A way to see what changes',
    body: 'A few minutes a day to note your sleep, energy, mood and cravings, with check-ins on Day 14, 28, 42 and 60. JJ’s Daily Symptom Tracker shows you what is working for you.' },
];

/** One short line tied to her answers, where one fits. */
export function needFor(S: QuizState, part: NeedPart): string {
  const tried = S.tried.filter((t) => t !== 'nothing');
  switch (part) {
    case 'guide':
      if (S.tried.includes('nothing')) return 'You told us you have not tried anything yet. This is where to start.';
      if (tried.length >= 3) return `You told us you have tried ${tried.length} things. This puts them in one plan.`;
      return '';
    case 'recipes':
      if (S.tried.includes('food')) return 'You told us you have tried eating differently.';
      if (has(S, 'weight')) return 'For the weight you told us about.';
      if (has(S, 'bloat')) return 'For the bloating you told us about.';
      return '';
    case 'hf':
      if (has(S, 'sweats')) return 'For the night sweats you told us about.';
      if (has(S, 'sleep')) return 'For the 3 AM waking you told us about.';
      if (has(S, 'mood')) return 'For the mood swings you told us about.';
      if (S.tried.includes('supps')) return 'You told us you have tried supplements.';
      return '';
    case 'tracker':
      if (tried.length >= 3) return 'With this many things tried, it shows you what is working.';
      if (has(S, 'energy')) return 'For the tired days you told us about.';
      return '';
  }
}

export const PLAN_BRIDGE_DIY =
  'You can put this together yourself: find a plan, plan your meals, choose a supplement and track every day. Or get it all ready made, in one box.';
export const KIT_READY_HEAD = 'Ready made: the 60-Day Feel Like You Again Kit by JJ Smith';

/* ============ Direction 2, plan page v5 (Jane's final wording, 11 Nov) =====
 * Four steps her body needs, with no product names; step 1 is keyed to what
 * bothers her most. The ready-made Kit comes only after the four steps.
 */
export const PLAN_EYEBROW_D2 = 'Built from your answers';
export const PLAN_INTRO_D2 = 'Here is what your body needs now.';



/* After periods stop (C, E) estrogen is lower, not swinging: these lines
   say so, so the plan never contradicts the result (Jane, 11 Nov). */

/* Steps 2 and 4 by what bothers her most (Jane, 11 Nov). */

/* Direction 2, plan v9 (Jane, 11 Nov): back to the four-step breakdown.
   The day-phase copy lives in outputs/copy for the phase emails. */
const STEP1: Record<SymptomId, [string, string]> = {
  sweats: ['Know what is behind your night sweats',
    'Night sweats start in the part of your brain that sets your body heat. As estrogen swings, it gets jumpy. Know what sets it off for you: a warm room, wine, spicy food or stress.'],
  sleep: ['Know what is behind your 3 AM wake-ups',
    'Waking at 3 AM is common when progesterone, your calming hormone, drops. Know what keeps you up: late caffeine, a warm room, screens in bed or worry.'],
  weight: ['Know what is behind your belly weight',
    'As estrogen drops, your body stores more fat around your middle, even when you eat the same. Know why, and what helps: protein, strength and sleep.'],
  bloat: ['Know what is behind your bloating',
    'Changing hormones can slow digestion and make you hold water. Know which foods and habits make it worse for you.'],
  energy: ['Know what is draining your energy',
    'Broken sleep and changing hormones wear you down. Know what drains you and what gives your energy back.'],
  mood: ['Know what is behind your mood swings',
    'Estrogen helps keep your mood steady. When it swings, so do you. Know your triggers so you can plan around them.'],
};
/* After periods stop (C, E) estrogen is lower, not swinging. */
const STEP1_AFTER: Partial<Record<SymptomId, [string, string]>> = {
  sweats: ['Know what is behind your night sweats',
    'Night sweats start in the part of your brain that sets your body heat. With less estrogen, it gets jumpy. Know what sets it off for you: a warm room, wine, spicy food or stress.'],
  mood: ['Know what is behind your mood swings',
    'Estrogen helps keep your mood steady. With less of it, your mood can dip and flare. Know your triggers so you can plan around them.'],
};
const STEP2: Record<SymptomId, string> = {
  sweats: 'Skip caffeine after lunch, and wine and spicy food in the evening. Build each meal around protein and fiber so your body is not riding a sugar rollercoaster at night.',
  sleep: 'Eat dinner earlier and lighter, with protein. No caffeine after lunch and no wine close to bed.',
  weight: 'Eating less backfires now. Start every day with protein, like eggs or Greek yogurt, and build meals around protein and fiber so you stay full.',
  bloat: 'Eat slowly, add fiber a little at a time, and notice which foods leave you bloated by dinner.',
  energy: 'Do not skip meals. Eat protein every 4 to 5 hours so your energy does not crash in the afternoon.',
  mood: 'Pair carbs with protein so your blood sugar, and your mood, do not crash.',
};
const STEP4: Record<SymptomId, string> = {
  sweats: 'Note each night sweat: the time, what you ate and drank, and how warm the room was. Your pattern starts to show.',
  sleep: 'Note when you wake, and what you ate, drank and did the evening before. Your pattern starts to show.',
  weight: 'Track your energy, your cravings and how your clothes fit, not just the scale.',
  bloat: 'Note what you ate and when the bloating starts, so your trigger foods stand out.',
  energy: 'Note your sleep and your energy each day to see what lifts you and what drains you.',
  mood: 'Note your mood, your sleep and where you are in your cycle, so your triggers become clear.',
};

export function planSteps(S: QuizState, outcome: Outcome = 'B'): { title: string; body: string; mine: string }[] {
  const main = mainConcern(S);
  const afterStop = outcome === 'C' || outcome === 'E';
  const [t1, b1] = main
    ? ((afterStop && STEP1_AFTER[main]) || STEP1[main])
    : ['Know what you are going through',
      'Learn what is behind your symptoms, what makes them worse, and what to change first.'];
  return [
    { title: t1, body: b1, mine: '' },
    { title: 'Eat for this stage',
      body: main ? STEP2[main] : 'Eating less is not the answer now. Eat protein at every meal, more fiber and real food that keeps you full.',
      mine: '' },
    { title: 'Support your changing hormones',
      body: 'Your hormones are changing, so your body needs steady daily support, not one quick answer.',
      mine: main ? `For the ${PLAN_FOR[main]} you told us about.` : '' },
    { title: 'Track how you feel',
      body: main
        ? (afterStop && main === 'mood'
          ? 'Note your mood and your sleep each day, so your triggers become clear.'
          : STEP4[main])
        : 'Note your sleep, energy, mood and cravings each day to see what is changing.',
      mine: '' },
  ];
}

export const PLAN_TURN_D2 =
  'You can do all four on your own. It means finding a plan you trust, working out your meals, choosing the right nutrients and tracking every day.';
export const PLAN_EASY_HEAD = 'Or let JJ do it for you.';
export const PLAN_TURN_JJ =
  'JJ went through this stage herself. She put everything you need for all four steps into one kit, so you can start today:';
export const PLAN_KIT_LIST: string[] = [
  'Step 1: JJ’s 60-Day Hormone Fix guide',
  'Step 2: Her Hormone Healthy Recipes',
  'Step 3: Hormone Focus, two bottles',
  'Step 4: Her Daily Symptom Tracker',
];
export const KIT_READY_HEAD_D2 = 'Get the 60-Day Feel Like You Again Kit. It gives you all of the above.';
export const RESULTS_VARY = 'Individual results vary.';

/* Direction 2: the three cards that follow her review on the load screen. */
export const LOAD_CARDS: string[] = [
  'Real meals, not eating less',
  'Support for your changing hormones',
  'A tracker to see what changes',
];

/* Direction 2: JJ's four phases, from her 60-Day Hormone Fix guide. */
export const PLAN_PHASES: string[] = [
  'Days 1 to 14: Build your base',
  'Days 15 to 30: Keep it going',
  'Days 31 to 45: Adjust what you need',
  'Days 46 to 60: Keep your momentum',
];

export const PLAN_TO_KIT_CTA = 'GET JJ’S KIT NOW';

/* Direction 2, plan page closing: the four Kit items as her four steps. */
export const KIT_STEPS_D2: string[] = [
  'Step 1: The 60-Day Hormone Fix guide',
  'Step 2: Hormone Healthy Recipes',
  'Step 3: Hormone Focus, two bottles',
  'Step 4: The Daily Symptom Tracker',
];

/* Direction 2, result page v4 (David, 11 Nov call: tighter, fewer boxes).
   ONE stage block: what this stage is and why, in two or three short lines. */
export function stageBlock(o: Outcome): { title: string; lines: string[]; img: string; caption: string } {
  if (o === 'C' || o === 'E') return {
    title: 'What menopause is',
    lines: [
      'Menopause is when your periods have stopped for a full year.',
      'Your body makes hormones that help run your sleep, mood, body heat and weight.',
      'After periods stop, your body makes much less of them. That is why so many things change at once.',
    ],
    img: '/img/hormones-low.svg',
    caption: 'An example: after periods stop, the body makes much less of them',
  };
  if (o === 'A') return {
    title: 'What is going on',
    lines: [
      'Your body makes hormones that help run your sleep, mood, body heat and weight.',
      'They rise and fall every month. When that rhythm shifts, many things can change at once.',
    ],
    img: '/img/hormones-wave.svg',
    caption: 'Your hormones rise and fall',
  };
  return {
    title: 'What perimenopause is',
    lines: [
      'Perimenopause is the time before your periods stop for good.',
      'Your body makes hormones that help run your sleep, mood, body heat and weight.',
      'In these years, those hormones go up and down like a wave. That is why so many things change at once.',
    ],
    img: '/img/hormones-wave.svg',
    caption: 'An example: hormones go up and down in these years',
  };
}

export const FEEL_SHORT =
  'It can feel like your body is not yours anymore. That is common at this stage, not a sign that something is wrong with you.';

/* Direction 2, result v5 (Jane, 11 Nov). */
export const RESULT_PILL = '\u2713 Your 60-day plan is ready';
export const RESULT_CASE =
  'It can feel like your body belongs to a stranger. That is common at this stage, and it does not mean something is wrong with you. Your body now needs different support, so we built your plan around it.';
export const RESULT_TO_PLAN_V5 = 'SEE MY PLAN';
export const RESULT_FINE =
  'This check is not a diagnosis. Talk to your doctor if your bleeding is very heavy, comes between periods, comes back after 12 months without a period, or if anything worries you.';
/** B's stat card (Cleveland Clinic). C and E keep their live facts. */
export const PERI_STAT = {
  big: '4 to 8 years',
  label: 'is how long perimenopause usually lasts. It often starts in your 40s.',
  source: 'Cleveland Clinic',
};

/* Direction 2, plan closing v5. JJ is not described as a nutritionist. */
export const PLAN_LOT =
  'Finding a plan you trust, making meals that support your hormones at this stage, and tracking how you feel every day is a lot to do on your own.';
export const PLAN_WHY_KIT = 'That is why JJ made the 60-Day Feel Like You Again Kit.';
export const PLAN_JJ_STORY =
  'JJ started perimenopause at 38. She researched it like her life depended on it, and put what she learned into one kit.';
export const PLAN_INSIDE = 'What is inside';
export const PLAN_INSIDE_ITEMS: [string, string][] = [
  ['The 60-Day Hormone Fix guide', 'what to do each day, for 60 days.'],
  ['Hormone Healthy Recipes', '31 easy meals for this stage.'],
  ['Hormone Focus, two bottles', 'JJ\u2019s daily supplement for this stage, made to support healthy estrogen metabolism. Two capsules a day with a meal.*'],
  ['Daily Symptom Tracker', 'see what changes, day by day.'],
];

/* Jane, 11 Nov: one line after "What is inside" to move her to the button,
   then a review from a woman with her main symptom for any doubt left. */
export const PLAN_PUSH =
  'Everything you need for the next 60 days, in one box, from a woman who has been where you are.';

/* ChatGPT review, 11 Nov (Jane: yes): use her "what have you tried" answer on her plan. */
export function planTriedLine(S: QuizState): string {
  /* "You have already tried X. This plan brings it together." triedLine
     itself is unchanged for any other screen that uses it. */
  const l = triedLine(S).replace(/^You told us you have already tried/, 'You have already tried');
  return l ? `${l} This plan brings it together.` : '';
}

/* The offer switch, one-bottle arm: the plan ends on Hormone Focus. */
export const PLAN_BOTTLE_HEAD = 'Start your plan with Hormone Focus.';
export const PLAN_BOTTLE_TURN =
  'It does step 3 for you. Two capsules a day with a meal give your body steady support while your hormones change.';
export const PLAN_BOTTLE_CTA = 'Start my plan with Hormone Focus';
