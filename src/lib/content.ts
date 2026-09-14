/* Every word the funnel says. Lifted verbatim from Jane's `js/quiz.js`.
 *
 * THE COPY RULES, which survive any rewrite:
 *  - No contractions in user-facing copy. House style.
 *  - Every product claim is JJ's own published wording. No timeframes,
 *    no quantified results, no invented percentages.
 *  - 800,000 is scoped to books and challenges, NOT supplement buyers.
 *  - 169 is the Hormone Focus review count. It belongs beside 4.9, nowhere else.
 */
import type { QuizState, SymptomId, TriedId, MarkerId, MoodId, Severity, Outcome } from './logic';
import { masked, docReason } from './logic';

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

export const SHORT: Record<SymptomId, string> = {
  weight: 'the weight', bloat: 'the bloating', sleep: 'the poor sleep',
  sweats: 'the hot flashes', mood: 'the mood swings', energy: 'the low energy',
};

export function symPhrase(S: QuizState): string {
  const l = S.sym.map((k) => SHORT[k]).filter(Boolean);
  if (!l.length) return 'everything you have told me so far';
  if (l.length === 1) return l[0];
  if (l.length === 2) return `${l[0]} and ${l[1]}`;
  return l.slice(0, 2).join(', ') + ' and ' + (l.length > 3 ? `${l.length - 2} more symptoms` : l[2]);
}

export const TRIED_LABELS: [TriedId, string][] = [
  ['food', 'Cutting foods out'],
  ['gym', 'Training harder'],
  ['sleep', 'Fixing my bedtime'],
  ['dim', 'A hormone supplement'],
  ['doctor', 'Asking my doctor'],
  ['bloods', 'Having bloods done'],
  ['wait', 'Waiting for it to pass'],
];

export const TRIED_WHY: Record<TriedId, [string, string]> = {
  food: ['You cut foods out.', 'It was never your plate.'],
  gym: ['You trained harder.', 'It was never calories.'],
  sleep: ['You fixed your bedtime.', 'It was never your routine.'],
  dim: ['You tried a hormone supplement.', 'It was doing half the job.'],
  doctor: ['You asked your doctor.', 'You were told it is normal. A true word, and a useless one.'],
  bloods: ['You had bloods done.', 'They came back fine. They usually do.'],
  wait: ['You waited for it to pass.', 'It does not pass on its own.'],
};

export const AGE_OPTIONS: [string, string][] = [
  ['u30', 'Under 30'], ['30s', '30 to 39'], ['40s', '40 to 49'],
  ['50s', '50 to 59'], ['60', '60+'],
];

export const PERIOD_OPTIONS: [string, string][] = [
  ['yes', 'Yes, I still have them'],
  ['changing', 'Yes, but they have changed'],
  ['stopped', 'No, they have stopped'],
];

export const CAUSE_OPTIONS: [string, string][] = [
  ['coil', 'A hormonal coil, implant or injection'],
  ['pill', 'Taking the pill without a break'],
  ['surgery', 'A hysterectomy or other surgery'],
  ['treatment', 'Cancer treatment or another medication'],
  ['none', 'No, nothing like that'],
];

export const REG_OPTIONS: [string, string][] = [
  ['clock', 'Like clockwork'],
  ['abit', 'A bit off, but roughly predictable'],
  ['allover', 'All over the place'],
];

export const SEV_OPTIONS: [string, string][] = [
  ['rare', 'Now and then'],
  ['monthly', 'Around my cycle each month'],
  ['weekly', 'Most weeks'],
  ['daily', 'Nearly every day'],
];

export const HELPED_OPTIONS: [string, string][] = [
  ['temp', 'Yes, for a while'],
  ['little', 'A little, but it never lasted'],
  ['none', 'No, nothing changed'],
  ['worse', 'No, it got worse'],
];

export const SEV_PHRASE: Record<Severity, string> = {
  rare: 'now and then', monthly: 'around your cycle',
  weekly: 'most weeks', daily: 'nearly every day',
};

export const REG_PHRASE: Record<string, string> = {
  clock: 'like clockwork', abit: 'a bit off', allover: 'all over the place',
};

export const REVIEWS = [
  { r: 5, b: 'I finally shed this hormonal weight gain! My energy and moods are so much better. Starting to feel like myself again.', n: 'Lisa' },
  { r: 5, b: 'It’s so AMAZING has given me my life back!', n: 'Anita F.' },
  { r: 5, b: 'I have only been taking it a few weeks but I have noticed some improvement! I will order again!', n: 'Angela S.' },
];

/* ------------------------------------------------------------ verdicts -- */

interface Verdict { name: string; sub: (S: QuizState) => string }

export const VERDICT: Record<Outcome, Verdict> = {
  A: {
    name: 'Hormonal imbalance',
    sub: (S) => masked(S)
      ? 'You are too young for this to be the change, and your symptoms line up with estrogen building up faster than your body clears it. Your coil or your pill is hiding your cycle, so this read comes from everything else you told me.'
      : 'Your cycle is still keeping time, and your symptoms are tracking it. That points to estrogen building up faster than your body clears it, rather than the change itself.',
  },
  B: {
    name: 'Perimenopause',
    sub: () => 'The years before your periods stop, when your hormones stop keeping time. It can begin in your late thirties and run for years. Most women are never told it exists.',
  },
  C: {
    name: 'Menopause',
    sub: (S) => masked(S)
      ? 'Your age and your symptoms both point here. The one sign that would confirm it is the one your coil or your pill is hiding, so take this as a read rather than a confirmation.'
      : 'Your periods have stopped. The symptoms did not stop with them, and nobody warned you about that part.',
  },
  E: {
    name: 'Early menopause',
    sub: () => 'Your periods have stopped in your forties, which is earlier than average. It is not rare, and it is worth having confirmed by your doctor so you know where you stand.',
  },
  D: {
    name: 'This one needs a doctor',
    sub: (S) => {
      const r = docReason(S);
      if (r === 'treatment') return 'Your periods have stopped while you are on treatment. That can be temporary or lasting, and the team looking after you is the right place to settle it. I am not going to read it from a quiz.';
      if (r === 'late') return 'You are sixty or over and still bleeding. That is uncommon enough to be worth having looked at properly before anybody talks to you about supplements. I am not going to read it from a quiz.';
      if (r === 'surgery') return 'Your periods have stopped after surgery. Whether your ovaries are still working is the part that decides this, and we did not ask you that. It is a question for the person who operated on you.';
      return 'Your periods have stopped and you are under forty. That is not menopause in the ordinary sense, and I am not going to guess at it. There are several possible reasons and most of them are worth knowing about properly.';
    },
  },
};

export const DOC: Record<string, { deck: string; say: string; look: string }> = {
  young: {
    deck: 'Periods stopping before forty has several possible causes, and most of them are worth knowing about rather than guessing at.',
    say: 'My periods have stopped and I am under forty. I would like it looked into.',
    look: 'A blood test is the usual next step. It can rule things in or out quickly, and several of the possible causes are very treatable once they are named.',
  },
  surgery: {
    deck: 'After surgery, whether your ovaries are still working is the part that decides everything else. That is not something a quiz can tell you.',
    say: 'My periods stopped after my surgery. I would like to know whether my ovaries are still working.',
    look: 'A blood test can show whether your ovaries are still producing. It changes what is worth doing next, so it is worth asking for by name.',
  },
  late: {
    deck: 'Bleeding at sixty or over is uncommon, and it is the kind of thing worth having looked at rather than explained away.',
    say: 'I am sixty or over and I am still bleeding. I would like it looked into.',
    look: 'They will usually want to examine you and may arrange a scan. It is a short conversation and it is the right first step.',
  },
  treatment: {
    deck: 'Treatment can stop your periods for a while or for good, and which one it is matters. The team already looking after you is the right place to settle it.',
    say: 'My periods have stopped since starting treatment. I would like to know whether this is temporary.',
    look: 'They will already have your history. Bring the list below so nothing gets left out of the conversation.',
  },
};

export const MOOD_LABELS: [MoodId, string][] = [
  ['irritable', 'Snapping at people, when I never used to'],
  ['anxious', 'Anxious in a way I did not used to be'],
  ['flat', 'Flat, or crying at nothing'],
  ['notme', 'I do not feel like myself any more'],
];

export const MARKER_LABELS: [MarkerId, string][] = [
  ['skipped', 'I have skipped a period'],
  ['heavier', 'My periods are heavier or longer'],
  ['closer', 'They come closer together, or further apart'],
  ['pms', 'My PMS is worse than it used to be'],
  ['tender', 'Breast tenderness before my period'],
  ['none', 'None of these'],
];

/** The safety copy that has to appear on every screen that names the product. */
export const FDA_DISCLAIMER =
  'These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure or prevent any disease.';

export const OFFER_DISCLAIMER =
  'Not for use if pregnant or nursing. Speak to your doctor first if you have a history of breast, uterine or ovarian cancer, liver disease, blood clots, heart disease or stroke, or if you take blood thinners or prescribed medication. ' +
  FDA_DISCLAIMER + ' Individual results vary.';

export const QUIZ_DISCLAIMER =
  'This check is based on what you told us and is not medical advice. It cannot diagnose anything and it is not a substitute for seeing a doctor.';
