/* THE STARTER GUIDE, word for word from the spec.
 *
 * She finished the quiz, so this is the one page on the funnel that already
 * knows who she is. It is a page rather than a PDF for one reason: a page can
 * be corrected in an hour and a PDF is wrong forever. The email that delivers
 * it carries the same words and a button back to here.
 *
 * ONE SPINE, FOUR VERSIONS. The seven sections are identical; the words that
 * name her stage, her first two weeks and her checkpoints change. Version E is
 * version C with one added line and the doctor line moved up, which is exactly
 * how the spec describes it.
 *
 * Outcome D — see a doctor — has no version here on purpose. That route never
 * reaches this page and never sees the offer.
 *
 * THE CLAIM RULE, which is why every expectation paragraph reads the way it
 * does: no timeline is ours. Each one carries "as customers report" or "women
 * tell us" in the same breath, and tests/copy.test.ts fails the build if one
 * loses it.
 */
import type { Outcome } from './logic';

/** The archetypes /plan answers to. Anything else is not a plan we wrote. */
export type Archetype = 'imbalance' | 'perimenopause' | 'menopause' | 'early-menopause';

export const ARCHETYPES: Archetype[] = [
  'imbalance', 'perimenopause', 'menopause', 'early-menopause',
];

export const isArchetype = (v: string | undefined): v is Archetype =>
  !!v && (ARCHETYPES as string[]).includes(v);

/** The quiz outcome she was given, as a route. D is absent, and stays absent. */
export const ARCHETYPE_FOR: Record<Exclude<Outcome, 'D'>, Archetype> = {
  A: 'imbalance',
  B: 'perimenopause',
  C: 'menopause',
  E: 'early-menopause',
};

/* ---------------------------------------------------------- the pieces -- */

export interface PlanVersion {
  /** The stage, named the way the email names it. */
  stage: string;
  /** 1. Your result, in one line. */
  result: string;
  /** 2. What is going on. Three sentences. */
  going: string[];
  /** 3. This week, three things to change. */
  week: string;
  /** 4. How to take Hormone Focus. */
  howTo: string;
  /** 5. What to expect, and when. */
  expect: string;
  /** 6. When to talk to a doctor. */
  doctor: string;
  /** 7. Where you are in 60 days. */
  sixtyDays: string;
  /** True where the doctor line moves up, as version E requires. */
  doctorFirst?: boolean;
}

const DOCTOR_FULL =
  'Talk to your doctor first if you are on any medication or HRT, or have a history of breast, uterine or ovarian cancer, liver disease, blood clots, heart disease or stroke. Not for use if pregnant or nursing.';

const DOCTOR_SHORT =
  'Talk to your doctor first if you are on any medication or HRT, or have a history of breast, uterine or ovarian cancer, liver disease, blood clots, heart disease or stroke.';

const HOW_TO_BREAKFAST =
  'Two capsules of Hormone Focus with breakfast. Same meal, same time. Change nothing else for two weeks, and women tell us that is the whole of it.';

/* ------------------------------------------------------------ headings -- */

export const PLAN_HEADINGS = {
  result: 'Your result',
  going: 'What is going on',
  week: 'This week, three things',
  howTo: 'How to take it',
  expect: 'What to expect, and when',
  doctor: 'When to talk to a doctor',
  sixtyDays: 'Where you are in 60 days',
};

/** The page heading, which is the subject line of the email that carries it. */
export const PLAN_TITLE = '{first name}, your hormone plan is here';
export const PLAN_TITLE_NEUTRAL = 'Your hormone plan is here';

export const PLAN_EYEBROW = 'Your plan';

/** Under the plan, before the buy block. */
export const PLAN_BUY_HEADING = 'The two bottles the plan is built on';
export const PLAN_BUY_SUB =
  'Two capsules with a meal. Change nothing else. The plan above is yours either way.';

/* ------------------------------------------------------- the versions -- */

const MENOPAUSE_GOING = [
  'With less estrogen, the heat comes out of nowhere, sleep breaks, and the body stores in the middle and holds on.',
  'This is not something you did.',
  'It is the stage, and support for it looks different from the diets you were handed at 35.',
];

export const PLANS: Record<Archetype, PlanVersion> = {
  imbalance: {
    stage: 'a hormonal imbalance',
    result: 'Your answers point to a hormonal imbalance: your cycle is still keeping time, and your body is not clearing what it makes each month. You said yes to {count}. They are not {signs} separate problems.',
    going: [
      'Every month your body makes estrogen and then has to clear it.',
      'When the clearing falls behind, the part that stays builds up: the bloating before your period, the mood that turns, the weight that goes to the middle.',
      'It is one thing, and it has a name.',
    ],
    week: 'Eat the same breakfast with protein every day, so the capsules have a meal to ride with. Walk after your biggest meal, ten minutes, every day. Write down the day of your cycle when the worst symptom hits; the pattern is the point.',
    howTo: 'Two capsules of Hormone Focus with that breakfast. Same time, same meal. Change nothing else for two weeks, and women tell us that is the whole of it.',
    expect: 'Most women tell us the first change comes inside two weeks: often the bloat and the mood around the cycle. By four weeks, women report the next cycle was easier than the last. The full stretch is sixty days, which is why the plan is two bottles. Results vary; this is what customers report.',
    doctor: DOCTOR_FULL,
    sixtyDays: 'The cycle that stopped running you. Your clothes fitting the way they did in spring. Feeling like yourself again, which is the phrase the women who wrote to us use most.',
  },

  perimenopause: {
    stage: 'perimenopause',
    result: 'Your answers point to perimenopause: the years before your periods stop, when your hormones stop keeping time. You said yes to {count}. Most women are never told this stage exists, and you have just named it.',
    going: [
      'Estrogen is swinging, high one month and low the next, and your body is not clearing it evenly.',
      'That swing is the 3 a.m. sweat, the mood you do not recognise, the weight that stores in the middle no matter what you eat.',
      'What worked at 35 does nothing now because it was built for a body that kept time.',
    ],
    week: 'Protein at breakfast, every day, before coffee. A cool room and the phone out of the bedroom, because the sweats are worse in a warm room. One note each morning: how you slept, out of five. That number is your first checkpoint.',
    howTo: HOW_TO_BREAKFAST,
    expect: 'Most women tell us the first change comes inside two weeks, and for this stage it is usually the nights: quieter, and waking less. By four weeks, women report the mood settling and the day less of a fight. The full stretch is sixty days, two bottles, because a swinging cycle needs two cycles to show you. Results vary; this is what customers report.',
    doctor: DOCTOR_FULL,
    sixtyDays: 'Sleeping through. The word that comes back mid-sentence. The scale that finally moves, women tell us, once your body stops fighting you.',
  },

  menopause: {
    stage: 'menopause',
    result: 'Your answers point to menopause: your periods have stopped, and your body is running on less estrogen than it did. You said yes to {count}. They are one stage, not {signs} problems.',
    going: MENOPAUSE_GOING,
    week: 'Protein at every meal, not just breakfast, because muscle is what keeps the weight off now. Ten minutes of walking after dinner, every day. Layers you can take off, and a fan by the bed, because the flash passes faster when you stop fighting it.',
    howTo: HOW_TO_BREAKFAST,
    expect: 'Most women tell us the first change comes inside two weeks: fewer hot flashes, and the night sweats easing. By four weeks, women report the energy coming back in the afternoon. The full stretch is sixty days, which is why the plan is two bottles. Results vary; this is what customers report.',
    doctor: DOCTOR_SHORT,
    sixtyDays: 'The sweater that stays on. The afternoon you do not need to survive. Comfortable in your own clothes again, which is what the women who wrote to us wanted more than any number.',
  },

  /* Version C's guide, with the added line and the doctor line moved up. */
  'early-menopause': {
    stage: 'early menopause',
    result: 'Your answers point to menopause earlier than most: your periods have stopped, and your body is running on less estrogen than it did. You said yes to {count}. They are one stage, not {signs} problems.',
    going: [
      MENOPAUSE_GOING[0],
      'Because this has come earlier than most, it is worth a conversation with your doctor about what else is worth checking, alongside the support here.',
      MENOPAUSE_GOING[2],
    ],
    week: 'Protein at every meal, not just breakfast, because muscle is what keeps the weight off now. Ten minutes of walking after dinner, every day. Layers you can take off, and a fan by the bed, because the flash passes faster when you stop fighting it.',
    howTo: HOW_TO_BREAKFAST,
    expect: 'Most women tell us the first change comes inside two weeks: fewer hot flashes, and the night sweats easing. By four weeks, women report the energy coming back in the afternoon. The full stretch is sixty days, which is why the plan is two bottles. Results vary; this is what customers report.',
    doctor: DOCTOR_SHORT,
    sixtyDays: 'The sweater that stays on. The afternoon you do not need to survive. Comfortable in your own clothes again, which is what the women who wrote to us wanted more than any number.',
    doctorFirst: true,
  },
};

/* ---------------------------------------------------- filling the gaps -- */

export interface PlanReader {
  /** Her first name, where the link carried one. */
  name: string;
  /** How many of the 14 signs she said yes to. */
  signs: number | null;
  /** How often it hits, in the quiz's own words. */
  frequency: string;
}

/**
 * Substitutes what the link told us, and falls back to wording that is true
 * when it told us nothing.
 *
 * A page that greets her as {first name} is worse than a page that does not
 * greet her at all, so every token has a neutral form and the neutral form is
 * a sentence somebody would actually write.
 */
export function fill(text: string, reader: PlanReader): string {
  const count = reader.signs === null
    ? 'several things'
    : `${reader.signs} of 14 signs${reader.frequency ? `, ${reader.frequency}` : ''}`;

  const signs = reader.signs === null ? 'several' : String(reader.signs);

  return text
    .split('{count}').join(count)
    .split('{signs}').join(signs)
    .split('{frequency}').join(reader.frequency || 'most weeks')
    .split('{first name}').join(reader.name);
}

export const planTitle = (reader: PlanReader): string =>
  reader.name ? fill(PLAN_TITLE, reader) : PLAN_TITLE_NEUTRAL;

export const planDescription = (v: PlanVersion): string =>
  `Your hormone plan: what to change this week, how to take Hormone Focus, and what customers report at two weeks, four, and sixty. Your result is ${v.stage}.`;

/* ------------------------------------------------- who links to this page -- */

/**
 * NOTHING IN THIS APPLICATION LINKS HERE, and that is the design.
 *
 * The Starter Guide is one of the two bonuses in the value stack. A bonus she
 * can open before she buys is not a bonus, it is a free page that happens to
 * be listed on the receipt — so the quiz names it and does not hand it over.
 *
 * She reaches it in exactly two places, both after the order:
 *   1. the store's order confirmation page, and
 *   2. the first post-purchase email, from the Klaviyo flow.
 *
 * Both build the URL below from the profile properties the quiz already
 * writes: hf_quiz_archetype, hf_quiz_signs and hf_quiz_frequency, plus her
 * first name. ARCHETYPE_FOR is the mapping from the quiz outcome, and it is
 * exported so whoever wires that flow can read it rather than guess it.
 *
 *   https://hormonefocus.jjsmithonline.com/plan/{archetype}
 *     ?signs={n}&freq={frequency}&name={first name}
 *
 * Every parameter is optional and the page reads correctly without any of
 * them, so a flow that cannot supply one is not a broken link.
 *
 * The route carries noindex, and robots.txt disallows /plan/, because a page
 * holding her first name has no business in a search index.
 */
export const PLAN_URL_PATH = '/plan/{archetype}?signs={n}&freq={frequency}&name={first name}';
