/* THE SKINS.
 *
 * One quiz, many front doors. Each ad angle gets its own route, and hands off
 * to the same quiz with the matching symptom ALREADY SELECTED — the woman who
 * clicked the bloating ad should not be asked whether she bloats.
 *
 * Adding an angle is adding an entry here. Nothing else changes.
 *
 * COPY SOURCE: every headline, recognition line and closer below is Jane's,
 * taken verbatim from the landing-page artifact. Nothing here is drafted by
 * the build. The copy rules still hold: no contractions, no timeframe on any
 * RESULT (the two minutes describes the check itself), no quantified outcome.
 */
import type { SymptomId } from './logic';

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
  /** Why this route exists. Internal, never rendered. */
  note: string;
}

export const ANGLES: Angle[] = [
  {
    slug: '',
    preselect: [],
    label: 'Default',
    chip1: '',
    h1a: 'Why nothing feels',
    h1b: 'the same any more',
    paren: 'and the one pattern nobody checks for',
    lines: [
      'Breakouts you have not had since your twenties.',
      'Clothes that fit last year and do not now.',
      'Heat that arrives out of nowhere.',
      'Awake at three, and staying awake.',
      'Snapping at people you love.',
    ],
    closer: 'Five separate problems, or one? That is what the check tells you.',
    description: 'A two-minute symptom check that tells you which stage you are in: hormonal imbalance, perimenopause or menopause. From JJ Smith.',
    note: 'Unparameterised and brand traffic. Names no single symptom, because it cannot know which one brought her.',
  },
  {
    slug: 'bloating',
    preselect: ['bloat'],
    label: 'Bloating',
    chip1: '',
    h1a: 'Why the bloating',
    h1b: 'keeps coming back',
    paren: 'and the one thing nobody checks',
    lines: [
      'Flat at breakfast, swollen by six.',
      'A waistband you undo in the car.',
      'Cutting out the obvious things changed nothing.',
    ],
    closer: 'A stage, or something else? That is what the check tells you.',
    description: 'If you are bloated most days and cutting foods out has not fixed it, the cause may be hormonal. Take the two-minute check.',
    note: 'Highest-scoring theme on the account at 85.2 Quality Score, largest confirmed sample at n=12.',
  },
  {
    slug: 'hot-flashes',
    preselect: ['sweats'],
    label: 'Hot flashes',
    chip1: '',
    h1a: 'Why the heat',
    h1b: 'comes out of nowhere',
    paren: 'and the one pattern behind it',
    lines: [
      'Heat that arrives out of nowhere.',
      'Your face goes and everybody notices.',
      'You dress in layers now, all year.',
    ],
    closer: 'A stage, or something else? That is what the check tells you.',
    description: 'Hot flashes can start years before your periods stop. Find out which stage you are in with a two-minute check.',
    note: '37% of 114 customer reviews. The single most-mentioned relief in the review set.',
  },
  {
    slug: 'night-sweats',
    preselect: ['sweats'],
    label: 'Night sweats',
    chip1: '',
    h1a: 'Why you are',
    h1b: 'soaked every night',
    paren: 'and the one thing nobody asks about',
    lines: [
      'You wake soaked and throw the covers off.',
      'Sheets you change more than you used to.',
      'Cool again by four, and wide awake.',
    ],
    closer: 'A stage, or something else? That is what the check tells you.',
    /* PENDING: this route is new and had no description in the repo. Carrying
       the default page's wording until Jane supplies one of its own. */
    description: 'A two-minute symptom check that tells you which stage you are in: hormonal imbalance, perimenopause or menopause. From JJ Smith.',
    note: '27% of reviews. Kept separate from hot flashes because the moment is different and so is the ad.',
  },
  {
    slug: 'sleep',
    preselect: ['sleep'],
    label: 'Sleep',
    chip1: '',
    h1a: 'Why you stopped',
    h1b: 'sleeping past 3am',
    paren: 'and the one question nobody asks',
    lines: [
      'Asleep by ten, awake at three.',
      'Nothing about your bedtime changed.',
      'Sleeping in does not fix it.',
    ],
    closer: 'A stage, or something else? That is what the check tells you.',
    description: 'When fixing your bedtime does not fix your sleep, the cause is usually hormonal. Take the two-minute check.',
    note: '27% of reviews. Distinct from night sweats: she is not hot, she simply cannot stay asleep.',
  },
  {
    slug: 'weight',
    preselect: ['weight'],
    label: 'Weight',
    /* The ONLY route that may carry the 5M lbs figure. */
    chip1: '5M+ lbs lost',
    h1a: 'Why losing weight after 40 feels',
    h1b: 'impossible',
    paren: 'and the one thing nobody checks for',
    lines: [
      'Clothes that fit last year and do not now.',
      'The same food, the same walking, a different body.',
      'It settled on your middle and stayed.',
    ],
    closer: 'A stage, or something else? That is what the check tells you.',
    description: 'Eating less and training harder stopped working. Find out whether your hormones are the reason. A two-minute check from JJ Smith.',
    note: 'The only route that may carry the 5M lbs figure. 35% of reviews, and our most-published, second-worst-scoring theme.',
  },
  {
    slug: 'mood',
    preselect: ['mood'],
    label: 'Mood and fog',
    chip1: '',
    h1a: 'Why you are',
    h1b: 'tired all the time',
    paren: 'and the one thing nobody connects it to',
    lines: [
      'Snapping at people you love.',
      'Anxious for no reason you can point to.',
      'Walking into a room and forgetting why.',
    ],
    closer: 'A stage, or something else? That is what the check tells you.',
    description: 'Mood swings and brain fog that are not like you. Find out whether your hormones are behind it with a two-minute check.',
    note: 'Jane set this headline. Note it reads as the energy angle rather than mood and fog - the recognition lines underneath are still mood and fog.',
  },
];

export const DEFAULT_ANGLE = ANGLES[0];

/** Built from the approved headline, so the tab never carries drafted words. */
export const angleTitle = (a: Angle) => `${a.h1a} ${a.h1b} — The Hormone Check`;

export function angleBySlug(slug: string | undefined): Angle {
  if (!slug) return DEFAULT_ANGLE;
  return ANGLES.find((a) => a.slug === slug) ?? DEFAULT_ANGLE;
}
