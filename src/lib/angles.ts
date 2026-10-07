/* THE SKINS.
 *
 * One quiz, many front doors. Each ad angle gets its own route, and hands off
 * to the same quiz with the matching symptom ALREADY SELECTED — the woman who
 * clicked the bloating ad should not be asked whether she bloats.
 *
 * Adding an angle is adding an entry here. Nothing else changes.
 *
 * THIS REPOSITORY IS PUBLIC. Every string in this file ships to the browser
 * and is readable by anyone. It previously carried a `note` field per route
 * holding our own ad-performance commentary: quality scores, sample sizes,
 * which themes were scoring worst. Nothing rendered it, and it is gone.
 * Do not reintroduce internal metrics here. tests/angles.test.ts fails the
 * build if you do.
 *
 * COPY SOURCE: every headline, recognition line and closer below is Jane's,
 * taken verbatim from the landing-page artifact. Nothing here is drafted by
 * the build. The copy rules still hold: no contractions, no timeframe on any
 * RESULT (the two minutes describes the check itself), no quantified outcome.
 */
import type { SymptomId } from './logic';

/**
 * The offer page's hero, per angle.
 *
 * The landing page sells the check; the offer page sells the bottle, so the
 * same route needs a second headline written to a different job. Where h1a is
 * absent the offer page reuses the angle's landing headline, which is what the
 * build instructions call for on every angle but the two that carry their own.
 */
export interface AngleOffer {
  /** Optional headline override, in three parts. The middle renders in plum. */
  h1a?: string;
  h1b?: string;
  h1c?: string;
  /** How the headline is achieved, carrying the value props. */
  sub: string;
  /** The closer's mini headline. */
  close: string;
  /** Tab title and meta description for /offer/<slug>. */
  title: string;
  description: string;
}

export interface Angle {
  /** URL slug. '' is the default landing page at `/`. */
  slug: string;
  /** Seeded into the quiz so she is not asked what the ad already told us. */
  preselect: SymptomId[];
  /** Short label. Internal only. */
  label: string;
  /* The first chip. EMPTY on every route but /weight, which is the only one
     that may carry the 5M lbs figure. An empty string renders no chip, so
     every other route shows the single JJ programs chip alone. */
  chip1: string;
  /** Headline, split so the second half renders in plum. */
  h1a: string;
  h1b: string;
  /** The parenthetical sub-line. Rendered as `(…).` */
  paren: string;
  /** Recognition lines. Only the default names more than one symptom. */
  lines: string[];
  /** The question the list ends on, which the check answers. */
  closer: string;
  description: string;
  /** The offer page at /offer/<slug>. Absent means the route is not built. */
  offer?: AngleOffer;
}

export const ANGLES: Angle[] = [
  {
    slug: '',
    preselect: [],
    label: 'Default',
    chip1: '',
    /* The cover, from the quiz rebuild brief of 2 October 2026. */
    h1a: 'Struggling with',
    h1b: 'stubborn weight, poor sleep, low energy or hot flashes?',
    paren: 'and what your answers may point to',
    lines: [
      'Breakouts you have not had since your twenties.',
      'Clothes that fit last year and do not now.',
      'Heat that arrives out of nowhere.',
      'Awake at three, and staying awake.',
      'Snapping at people you love.',
    ],
    closer: 'The check looks at them together and tells you what your answers may point to.',
    description: 'Struggling with stubborn weight, poor sleep, low energy or hot flashes? Take a 1-minute check and find out why. From JJ Smith.',
    offer: {
      h1a: 'Feel like yourself again, ',
      h1b: 'in your own clothes',
      h1c: '.',
      sub: 'Two capsules with a meal. Change nothing else. Hormone Focus supports hormone balance for women in perimenopause and menopause, so the flashes ease, the nights get quiet, and the weight stops going to the middle. Most women notice the first change inside two weeks, as customers report; the full reset is sixty days.',
      close: 'Quieter nights start with two capsules.',
      title: 'Hormone Focus \u2014 the 60-Day Plan',
      description: 'Hormone Focus supports hormone balance for women in perimenopause and menopause. Every milligram disclosed. Two bottles, free shipping, and a 60-day money-back guarantee.',
    },
  },
  {
    slug: 'bloating',
    preselect: ['bloat'],
    label: 'Bloating',
    chip1: '',
    h1a: "Why you're bloated",
    h1b: 'even when you eat right',
    paren: 'and what your answers may point to',
    lines: [
      'Flat at breakfast, swollen by six.',
      'A waistband you undo in the car.',
      'Cutting out the obvious things changed nothing.',
    ],
    closer: 'The check tells you what your answers may point to, and where to start.',
    description: 'If you are bloated most days and cutting foods out has not fixed it, the cause may be hormonal. Take the free 1-minute quiz.',
    offer: {
      sub: 'Tired of being flat at breakfast and swollen by six, of a waistband you undo in the car, of cutting things out and nothing changing? Hormone Focus helps with occasional bloating and supports hormone balance for women in perimenopause and menopause. Every milligram disclosed. Two capsules a day with a meal.',
      close: 'Easier evenings start with two capsules.',
      title: 'Hormone Focus for occasional bloating \u2014 the 60-Day Plan',
      description: 'Bloated most days, and cutting foods out changed nothing. Hormone Focus helps with occasional bloating and supports hormone balance. Every milligram disclosed.',
    },
  },
  {
    slug: 'hot-flashes',
    preselect: ['sweats'],
    label: 'Hot flashes',
    chip1: '',
    h1a: 'Why the hot flashes',
    h1b: 'come out of nowhere',
    paren: 'and what your answers may point to',
    lines: [
      'Heat that arrives out of nowhere.',
      'Your face goes and everybody notices.',
      'You dress in layers now, all year.',
    ],
    closer: 'The check tells you what your answers may point to, and where to start.',
    description: 'Hot flashes can start years before your periods stop. Find out what your symptoms may point to with the free 1-minute quiz.',
    offer: {
      sub: 'Tired of heat that arrives out of nowhere, in a meeting, in the car, in front of everybody? Hormone Focus helps ease occasional hot flashes and supports hormone balance for women in perimenopause and menopause. Every milligram disclosed. Two capsules a day with a meal.',
      close: 'Cooler days start with two capsules.',
      title: 'Hormone Focus for occasional hot flashes \u2014 the 60-Day Plan',
      description: 'Hormone Focus helps ease occasional hot flashes and supports hormone balance for women in perimenopause and menopause. Every milligram disclosed.',
    },
  },
  {
    slug: 'night-sweats',
    preselect: ['sweats'],
    label: 'Night sweats',
    chip1: '',
    h1a: 'Why you wake up',
    h1b: 'soaked every night',
    paren: 'and what your answers may point to',
    lines: [
      'You wake soaked and throw the covers off.',
      'Sheets you change more than you used to.',
      'Cool again by four, and wide awake.',
    ],
    closer: 'The check tells you what your answers may point to, and where to start.',
    /* PENDING: this route is new and had no description in the repo. Carrying
       the default page's wording until Jane supplies one of its own. */
    description: 'Waking up soaked? Take a 1-minute check and find out why. From JJ Smith.',
    offer: {
      sub: 'Tired of waking soaked at three, throwing the covers off, and changing sheets you never used to change? Hormone Focus helps ease occasional night sweats and supports restful sleep through perimenopause and menopause. Every milligram disclosed. Two capsules a day with a meal.',
      close: 'Quieter nights start with two capsules.',
      title: 'Hormone Focus for occasional night sweats \u2014 the 60-Day Plan',
      description: 'Hormone Focus helps ease occasional night sweats and supports restful sleep. Every milligram disclosed. Two bottles, free shipping, and a 60-day guarantee.',
    },
  },
  {
    slug: 'sleep',
    preselect: ['sleep'],
    label: 'Sleep',
    chip1: '',
    h1a: 'Why you keep',
    h1b: 'waking up at 3am',
    paren: 'and what your answers may point to',
    lines: [
      'Asleep by ten, awake at three.',
      'Nothing about your bedtime changed.',
      'Sleeping in does not fix it.',
    ],
    closer: 'The check tells you what your answers may point to, and where to start.',
    description: 'When fixing your bedtime does not fix your sleep, the cause may be hormonal. Take the free 1-minute quiz.',
    offer: {
      sub: 'Tired of being asleep by ten and awake at three, with nothing about your bedtime changed? Hormone Focus supports restful sleep and supports hormone balance for women in perimenopause and menopause. Every milligram disclosed. Two capsules a day with a meal.',
      close: 'Sleeping through starts with two capsules.',
      title: 'Hormone Focus for restful sleep \u2014 the 60-Day Plan',
      description: 'Awake at three, and a better bedtime changed nothing. Hormone Focus supports restful sleep and hormone balance. Every milligram disclosed.',
    },
  },
  {
    slug: 'weight',
    preselect: ['weight'],
    label: 'Weight',
    /* The ONLY route that may carry the 5M lbs figure. */
    chip1: '5M+ lbs lost',
    h1a: "Why the scale won't move,",
    h1b: 'even when you do everything right',
    paren: 'and what your answers may point to',
    lines: [
      'Clothes that fit last year and do not now.',
      'The same food, the same walking, a different body.',
      'It settled on your middle and stayed.',
    ],
    closer: 'The check tells you what your answers may point to, and where to start.',
    description: 'Eating less and training harder stopped working. Find out whether your hormones are the reason. A free 1-minute quiz from JJ Smith.',
    offer: {
      sub: 'Tired of the same food, the same walking, and a different body that settled on your middle and stayed? Hormone Focus supports a healthy weight as part of a healthy diet and regular exercise, and supports hormone balance through this stage. Every milligram disclosed. Two capsules a day with a meal.',
      close: 'A body that works with you starts with two capsules.',
      title: 'Hormone Focus for this stage \u2014 the 60-Day Plan',
      description: 'Hormone Focus supports a healthy weight as part of a healthy diet and regular exercise, and supports hormone balance after 40. Every milligram disclosed.',
    },
  },
  {
    slug: 'mood',
    preselect: ['mood'],
    label: 'Mood and fog',
    chip1: '',
    h1a: 'Why little things',
    h1b: 'set you off lately',
    paren: 'and what your answers may point to',
    lines: [
      'Snapping at people you love.',
      'Anxious for no reason you can point to.',
      'Walking into a room and forgetting why.',
    ],
    closer: 'The check tells you what your answers may point to, and where to start.',
    description: 'Mood swings and brain fog that are not like you. Find out whether your hormones are behind it with the free 1-minute quiz.',
    offer: {
      sub: 'Tired of snapping at people you love, anxious for no reason you can point to, walking into a room and forgetting why? Hormone Focus helps support a calm mood and supports hormone balance for women in perimenopause and menopause. Every milligram disclosed. Two capsules a day with a meal.',
      close: 'Feeling like yourself starts with two capsules.',
      title: 'Hormone Focus for a calm mood \u2014 the 60-Day Plan',
      description: 'Mood swings and brain fog that are not like you. Hormone Focus helps support a calm mood and supports hormone balance. Every milligram disclosed.',
    },
  },
  {
    slug: 'body-at-40',
    preselect: ['weight'],
    label: 'Body at 40',
    chip1: '',
    h1a: 'Why your body changed',
    h1b: 'at 40, and you did not',
    paren: 'and what your answers may point to',
    lines: [
      'The belly that showed up though nothing else changed.',
      'The jeans that fit in March.',
      'The arms.',
      'Awake at three, drenched.',
      'The word that goes missing mid-sentence.',
    ],
    closer: 'The check looks at them together and tells you what your answers may point to.',
    description: 'The belly that arrived without you changing a thing. Find out whether your hormones are the reason, with the free 1-minute quiz from JJ Smith.',
    offer: {
      h1a: 'Your body does not store fat randomly after 40. ',
      h1b: 'It stores it differently now',
      h1c: '.',
      sub: 'The belly that arrived without you changing a thing. The jeans that fit in March. The arms. The 3 a.m. sweats. Hormone Focus supports hormone balance through this stage, so your body stops working against you. Every milligram disclosed.',
      close: 'Your body at 40 is not working against you. It is asking for something.',
      title: 'Your body at 40 \u2014 Hormone Focus, the 60-Day Plan',
      description: 'After 40 the body stores fat differently. Hormone Focus supports hormone balance through this stage. Every milligram disclosed. Two bottles, free shipping.',
    },
  },
];

export const DEFAULT_ANGLE = ANGLES[0];

/** Built from the approved headline, so the tab never carries drafted words. */
/* A vertical bar, not an em dash: the house rule is no em or en dashes, and
   this separator was the one place a dash survived in a <title>. */
export const angleTitle = (a: Angle) => `${a.h1a} ${a.h1b} | The Hormone Check`;

export function angleBySlug(slug: string | undefined): Angle {
  if (!slug) return DEFAULT_ANGLE;
  return ANGLES.find((a) => a.slug === slug) ?? DEFAULT_ANGLE;
}

/** Every angle with an offer page behind it, in the order the routes are built. */
export const OFFER_ANGLES = ANGLES.filter((a) => a.offer);

