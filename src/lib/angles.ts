/* THE SKINS.
 *
 * One quiz, many front doors. Each ad angle gets its own route with its own
 * headline, subheadline, hero and proof, and hands off to the same quiz with
 * the matching symptom ALREADY SELECTED — the woman who clicked the bloating
 * ad should not be asked whether she bloats.
 *
 * Adding an angle is adding an entry here. Nothing else changes.
 *
 * Copy rules apply to everything in this file: no contractions, no timeframes,
 * no quantified results, no invented percentages. 800,000 is books and
 * challenges only. 169 is the review count and sits beside 4.9, nowhere else.
 */
import type { SymptomId } from './logic';
import { IMG } from './content';

export interface Angle {
  /** URL slug. '' is the default landing page at `/`. */
  slug: string;
  /** Seeded into the quiz so she is not asked what the ad already told us. */
  preselect: SymptomId[];
  /** <title> and meta description for the ad's landing page. */
  title: string;
  description: string;
  kicker: string;
  /** `em` renders in plum. Use it on the phrase the ad promised. */
  headline: string;
  headlineEm?: string;
  sub: string;
  hero: string;
  heroAlt: string;
  bullets: string[];
  cta: string;
  /** Which of the three published reviews leads on this page. */
  review: number;
}

const COMMON_BULLETS = [
  'Twelve questions. It takes about two minutes.',
  'You get a read on which stage you are in, not a sales page.',
  'Built on what JJ has published, and on what her customers actually report.',
];

export const ANGLES: Angle[] = [
  {
    slug: '',
    preselect: [],
    title: 'The Hormone Check — Find out what is actually going on',
    description: 'A two-minute symptom check that tells you which stage you are in: hormonal imbalance, perimenopause or menopause. From JJ Smith.',
    kicker: 'The Hormone Check',
    headline: 'Nobody told you this would happen to your body.',
    headlineEm: 'this',
    sub: 'The weight, the sleep, the mood, the heat. Answer twelve questions and find out which stage you are actually in, and why nothing you have tried has worked.',
    hero: IMG.mood,
    heroAlt: '',
    bullets: COMMON_BULLETS,
    cta: 'Start the check',
    review: 0,
  },
  {
    slug: 'bloating',
    preselect: ['bloat'],
    title: 'Bloated most days? It may not be your food — The Hormone Check',
    description: 'If you are bloated most days and cutting foods out has not fixed it, the cause may be hormonal. Take the two-minute check.',
    kicker: 'Bloated most days',
    headline: 'You cut the foods out. You are still bloated.',
    headlineEm: 'still',
    sub: 'When bloating does not answer to your plate, it is usually not coming from your plate. Twelve questions to find out what is actually driving it.',
    hero: IMG.bloat,
    heroAlt: '',
    bullets: [
      'For women whose bloating tracks their cycle rather than their meals.',
      'Twelve questions. It takes about two minutes.',
      'You get a read on which stage you are in, not a sales page.',
    ],
    cta: 'Find out why',
    review: 0,
  },
  {
    slug: 'weight',
    preselect: ['weight'],
    title: 'Weight that will not shift? — The Hormone Check',
    description: 'Eating less and training harder stopped working. Find out whether your hormones are the reason. A two-minute check from JJ Smith.',
    kicker: 'Weight that will not shift',
    headline: 'You are doing everything you used to do. It is not working any more.',
    headlineEm: 'any more',
    sub: 'The same food, the same training, a different result. That change has a cause, and it is worth naming before you cut anything else out.',
    hero: IMG.weight,
    heroAlt: '',
    bullets: [
      'For women whose weight stopped answering to diet and exercise.',
      'Twelve questions. It takes about two minutes.',
      'You get a read on which stage you are in, not a sales page.',
    ],
    cta: 'Find out what changed',
    review: 0,
  },
  {
    slug: 'hot-flashes',
    preselect: ['sweats'],
    title: 'Hot flashes and night sweats — The Hormone Check',
    description: 'Hot flashes and night sweats can start years before your periods stop. Find out which stage you are in with a two-minute check.',
    kicker: 'Hot flashes and night sweats',
    headline: 'It starts years before anybody calls it menopause.',
    headlineEm: 'years before',
    sub: 'Hot flashes and night sweats are the signs most women recognise, and the ones they are told to wait out. Twelve questions to find out where you actually are.',
    hero: IMG.sweats,
    heroAlt: '',
    bullets: [
      'For women waking up hot, and being told it is nothing.',
      'Twelve questions. It takes about two minutes.',
      'You get a read on which stage you are in, not a sales page.',
    ],
    cta: 'Find out which stage',
    review: 1,
  },
  {
    slug: 'sleep',
    preselect: ['sleep'],
    title: 'Waking at 3am? — The Hormone Check',
    description: 'When fixing your bedtime does not fix your sleep, the cause is usually hormonal. Take the two-minute check.',
    kicker: 'Sleep that broke',
    headline: 'You fixed your bedtime. You are still awake at three.',
    headlineEm: 'still awake',
    sub: 'Sleep that does not answer to sleep hygiene is usually being driven by something else. Twelve questions to find out what.',
    hero: IMG.sleep,
    heroAlt: '',
    bullets: [
      'For women who did everything the sleep advice says, and still wake up.',
      'Twelve questions. It takes about two minutes.',
      'You get a read on which stage you are in, not a sales page.',
    ],
    cta: 'Find out why',
    review: 0,
  },
  {
    slug: 'mood',
    preselect: ['mood'],
    title: 'Snapping at people you love? — The Hormone Check',
    description: 'Mood swings and brain fog that are not like you. Find out whether your hormones are behind it with a two-minute check.',
    kicker: 'Mood swings and brain fog',
    headline: 'You do not feel like yourself, and you cannot say why.',
    headlineEm: 'yourself',
    sub: 'Snapping at people you love. Losing the word mid-sentence. Crying at nothing. It is not your personality, and it is not nothing.',
    hero: IMG.mood,
    heroAlt: '',
    bullets: [
      'For women who have been told it is just stress.',
      'Twelve questions. It takes about two minutes.',
      'You get a read on which stage you are in, not a sales page.',
    ],
    cta: 'Find out what is behind it',
    review: 0,
  },
  {
    slug: 'energy',
    preselect: ['energy'],
    title: 'Tired no matter how much you sleep — The Hormone Check',
    description: 'Low energy that sleep does not fix is worth looking at properly. Take the two-minute hormone check.',
    kicker: 'Low energy',
    headline: 'Tired in a way that sleeping does not touch.',
    headlineEm: 'does not touch',
    sub: 'When rest stops restoring you, the problem is not rest. Twelve questions to find out which stage you are in and what is driving it.',
    hero: IMG.energy,
    heroAlt: '',
    bullets: [
      'For women whose bloods came back fine and who still feel flattened.',
      'Twelve questions. It takes about two minutes.',
      'You get a read on which stage you are in, not a sales page.',
    ],
    cta: 'Find out why',
    review: 2,
  },
];

export const DEFAULT_ANGLE = ANGLES[0];

export function angleBySlug(slug: string | undefined): Angle {
  if (!slug) return DEFAULT_ANGLE;
  return ANGLES.find((a) => a.slug === slug) ?? DEFAULT_ANGLE;
}
