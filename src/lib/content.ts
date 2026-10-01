/* Every word the funnel says. Lifted verbatim from Jane's `js/quiz.js`.
 *
 * THE COPY RULES, which survive any rewrite:
 *  - No contractions in user-facing copy. House style.
 *  - Every product claim is JJ's own published wording. No timeframes,
 *    no quantified results, no invented percentages.
 *  - 800,000 is scoped to books and challenges, NOT supplement buyers.
 *  - The Hormone Focus review count lives in reviews.ts, and belongs beside
 *    the 4.9 and nowhere else.
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

/* ---- ABOVE-THE-FOLD AND PROOF STRINGS ----
 *
 * CHIP_PROGRAMS is the SCOPED form of the 800,000 figure. The artifact's own
 * review flagged the unscoped "800K+ women helped" as unshippable: under a
 * lockup reading Hormone Focus it is read as 800,000 Hormone Focus customers,
 * which merges the two numbers the copy rules keep apart. This is the wording
 * that review proposed as the fix, and Jane approved it on 15 September 2026.
 * It is the wording that ships. Do not revert it to the unscoped form.
 *
 * The other half of the pair, "5M+ lbs lost", is per route and lives in
 * angles.ts, where only /weight carries it. */
export const CHIP_PROGRAMS = "800K+ women in JJ's programs";

/* The hero photograph. The SAME on every route: the brief is explicit that only
   the headline, the sub-line and the symptom list change between routes.
   The brief names these /img/selfie-1.jpg .. selfie-6.jpg on the live site;
   in this repo the same photographs are customer-1..6.jpg. */
export const HERO_IMG = '/img/customer-1.jpg';
export const HERO_ALT = 'A customer holding Hormone Focus';

/** Attribution under the proof grid. */
export const REVIEW_SOURCE =
  'Reviews and photos from verified buyers on JJSmithOnline.com. Individual results vary.';

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

/* What she tried, acknowledged. NOT a verdict that it failed: the check does
   not know why something did or did not work, and food, movement and sleep
   are three of the five steps in JJ's own plan. Each line names the effort
   and says what to do with it now. */
export const TRIED_NOTE: Record<TriedId, [string, string]> = {
  food: ['You changed what you eat.', 'Keep what feels good. Eating is the first step in JJ’s plan.'],
  gym: ['You trained harder.', 'That effort counts. Training is the second step in JJ’s plan.'],
  sleep: ['You worked on your bedtime.', 'Keep it. Protecting your sleep is one of JJ’s five steps.'],
  dim: ['You tried a hormone supplement.', 'It is worth knowing what was in it and how long you took it.'],
  doctor: ['You asked your doctor.', 'That was the right place to ask, and it is worth going back if things change.'],
  bloods: ['You had bloods done.', 'Keep the results to hand for your next appointment.'],
  wait: ['You waited for it to pass.', 'That was reasonable. Now you have something to go on.'],
};

/* What "Did any of it help?" changes on the result. */
export const HELPED_NOTE: Record<string, string> = {
  still: 'Something is helping. Keep doing it, and add the step below to it.',
  temp: 'It helped for a while. That tells you your body responds, so the step below is worth a fair try.',
  little: 'It helped a little. Build on that with the step below.',
  none: 'Nothing changed. That is useful to know, and it is why the step below starts somewhere different.',
  worse: 'It got worse. If that is still true, tell your doctor, and start gently with the step below.',
};

/* ONE first step, by the concern she said bothers her most. Each is JJ's own
   advice from her Live of 29 September 2026 and her 60-Day Hormone Fix. No
   outcome is promised and no timeframe is given: she is told what to do and
   what to write down, and she is the judge of whether it helps. */
export const NEXT_STEP: Record<SymptomId, { step: string; why: string }> = {
  weight: {
    step: 'Walk for ten minutes after each meal.',
    why: 'It is the simplest thing JJ teaches for this stage, and you can start today.',
  },
  bloat: {
    step: 'Build each plate around protein and fiber first.',
    why: 'It is the first step in JJ’s plan, and it does not ask you to cut anything out.',
  },
  sleep: {
    step: 'Keep the bedroom cool and dark, and put your phone away thirty minutes before bed.',
    why: 'It is how JJ protects her own sleep.',
  },
  sweats: {
    step: 'Keep the bedroom cool, and write down when the heat comes.',
    why: 'The pattern is worth having, for you and for your doctor.',
  },
  mood: {
    step: 'Write down when it happens: the day, how you slept, where you are in your cycle.',
    why: 'A pattern you can see is easier to act on than a feeling you cannot explain.',
  },
  energy: {
    step: 'Put protein and fiber first on your plate, and walk for ten minutes after you eat.',
    why: 'These are the first two things JJ teaches for this stage.',
  },
};

export const NEXT_WATCH =
  'Write down what you notice each day. You are the judge of whether it is helping.';

export const AGE_OPTIONS: [string, string][] = [
  ['u30', 'Under 30'], ['30s', '30 to 39'], ['40s', '40 to 49'],
  ['50s', '50 to 59'], ['60', '60+'],
];

/** Her own answers, said back to her on the result. */
export const AGE_PHRASE: Record<string, string> = {
  u30: 'under 30', '30s': '30 to 39', '40s': '40 to 49', '50s': '50 to 59', '60': '60 or over',
};

export const PERIOD_PHRASE: Record<string, string> = {
  yes: 'You still have periods',
  changing: 'Your periods have changed',
  stopped: 'Your periods have stopped',
};

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
  ['still', 'Yes, and it is still helping'],
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

/** What the check cannot do, said once on the result. */
export const CANNOT_TELL =
  'This check cannot measure your hormones, and it cannot rule anything out. If your periods changed suddenly, if you are under 45, or if anything here worries you, talk to your doctor.';

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
      ? 'Your age makes perimenopause less likely, and your symptoms can still come from hormone shifts. Your coil or your pill is hiding your cycle, so this read comes from everything else you told me.'
      : 'Your cycle is still keeping time, and your symptoms follow it. That fits hormone shifts across your cycle more than perimenopause itself.',
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
  'These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease.';

export const OFFER_DISCLAIMER =
  'Not for use if pregnant or nursing. Speak to your doctor first if you have a history of breast, uterine or ovarian cancer, liver disease, blood clots, heart disease or stroke, or if you take blood thinners or prescribed medication. ' +
  FDA_DISCLAIMER + ' Individual results vary.';

export const QUIZ_DISCLAIMER =
  'This check is not medical advice. It cannot diagnose anything and it is not a substitute for seeing a doctor. Individual results vary.';
