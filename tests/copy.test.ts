/* THE COPY GATE.
 *
 * Hormone Focus is a dietary supplement. It may describe how it supports the
 * normal structure and function of the body, and it may quote what customers
 * say. It may not claim to treat, cure or prevent anything, and the brand's
 * own voice may not promise a result, a timeframe or a number.
 *
 * Those rules are easy to agree with and easy to break at four in the
 * afternoon with a deadline. This file is what stops a broken one shipping:
 * it reads the authored copy and fails the build.
 *
 * WHAT IT READS
 *  - src/lib/offer.ts       the prices, the option rows and the value stack
 *  - src/lib/angles.ts      every route's headline, and its offer block
 *  - src/lib/offerCopy.ts   every other word the offer pages say
 *  - src/lib/planCopy.ts    every word the Starter Guide page says
 *
 * WHAT IT DELIBERATELY DOES NOT READ
 *  - src/lib/reviews.ts. Those are customers' words, quoted verbatim. They
 *    use contractions and they say things the brand may not say, which is the
 *    whole reason they live in a file of their own. A separate test below
 *    checks that they are attributed and marked, which is what the rules
 *    actually require of a quote.
 */
import { test, expect } from 'vitest';
import { ANGLES } from '../src/lib/angles';
import { SCALE_QUOTE, WALL } from '../src/lib/reviews';
import { FDA_DISCLAIMER } from '../src/lib/content';
import * as offer from '../src/lib/offer';
import * as copy from '../src/lib/offerCopy';
import * as plan from '../src/lib/planCopy';

/* ------------------------------------------------- collecting the copy -- */

/** Every string reachable from a module's exports, with a path to find it by. */
function strings(value: unknown, path: string, out: [string, string][] = [], seen = new Set<unknown>()): [string, string][] {
  if (typeof value === 'string') {
    out.push([path, value]);
    return out;
  }
  if (typeof value === 'function' || value === null || typeof value !== 'object') return out;
  if (seen.has(value)) return out;
  seen.add(value);
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    strings(v, `${path}.${k}`, out, seen);
  }
  return out;
}

const AUTHORED: [string, string][] = [
  ...strings(offer, 'offer.ts'),
  ...strings(ANGLES, 'angles.ts'),
  ...strings(copy, 'offerCopy.ts'),
  ...strings(plan, 'planCopy.ts'),
];

/**
 * Strings that are identifiers rather than copy.
 *
 * A Shopify discount code, an analytics value and a URL path are read by
 * machines and never by her. They are exempted BY PATH rather than by value,
 * so exempting one cannot accidentally exempt the same word in a sentence.
 */
const IDENTIFIER_PATHS = [
  'offer.ts.PROTOCOL_DISCOUNT_CODE',   // the code Shopify holds
  'offer.ts.DEFAULT_OFFER',            // 'protocol', the analytics value
  'offer.ts.SUBSCRIBE_PATH',
  'offer.ts.SINGLE_VARIANT_ID',
  'offer.ts.PROTOCOL_VARIANT_ID',
  'offerCopy.ts.REFUND_POLICY_URL',
];

const isIdentifier = (path: string) =>
  IDENTIFIER_PATHS.includes(path)
  /* Every OFFER_OPTIONS[n].kind, which is the hf_offer parameter. */
  || path.endsWith('.kind')
  || path.startsWith('planCopy.ts.ARCHETYPE')
  || path === 'planCopy.ts.ARCHETYPES';

/** What she can actually read. Everything the gate below is really about. */
const CUSTOMER_FACING = AUTHORED.filter(([path]) => !isIdentifier(path));

test('there is authored copy to check, so a broken import cannot pass silently', () => {
  expect(AUTHORED.length).toBeGreaterThan(80);
});

/* -------------------------------------------------------- contractions -- */

/* House style since 1 September 2026: no contractions in authored copy.
   A possessive is not a contraction, so JJ's programs and a customer's own
   words both pass; it's, don't and you're do not. Both apostrophes are
   matched, because a smart quote is still a contraction. */
const CONTRACTIONS = [
  /\b\w+n['’]t\b/i,
  /\b(it|that|there|here|what|who|how|where|when|this|let)['’](s|re|ve|ll|d|m)\b/i,
  /\b(i|you|we|they|he|she|who|would|could|should|might|must|do|does|did|is|are|was|were|has|have|had|will|can)['’](s|re|ve|ll|d|m|t)\b/i,
];

test('no authored string uses a contraction', () => {
  for (const [where, value] of AUTHORED) {
    for (const pattern of CONTRACTIONS) {
      expect(
        pattern.test(value),
        `${where} uses a contraction, and the house style has none: ${JSON.stringify(value)}`,
      ).toBe(false);
    }
  }
});

/* -------------------------------------------------------- banned words -- */

/**
 * Signed-off copy that predates this gate.
 *
 * One string, Jane's headline for the weight route, states the difficulty a
 * woman is already living rather than promising her a result — but it is
 * shaped exactly like the promise the gate exists to catch, and no regular
 * expression can tell the two apart. It is listed here in full, so changing a
 * single character of it puts it back under the gate.
 */
const SIGNED_OFF = new Set([
  'Why losing weight after 40 feels',
]);

/**
 * Words the brand never says, in any context.
 *
 * 'Clinically proven' needs a study on this formula and there is none.
 * 'Natural HRT' and 'alternative to HRT' compare a supplement to a drug.
 * 'Balances your hormones' states as fact what may only be supported.
 * Cure, melt and burn have no innocent use in this category.
 */
const NEVER: [RegExp, string][] = [
  [/\bcure[sd]?\b/i, 'cure is a treatment claim'],
  [/\bproven\b/i, 'proven needs a study on this formula'],
  [/\bmelts?\b|\bmelting\b/i, 'melts fat is a forbidden weight claim'],
  [/\bburns?\b|\bburning\b/i, 'burns fat is a forbidden weight claim'],
  [/natural\s+HRT|alternative\s+to\s+HRT|instead\s+of\s+HRT|better\s+than\s+HRT/i,
    'the brand never compares itself to a drug'],
  [/balances?\s+your\s+hormones/i, 'hormone balance is supported, never stated as fact'],
  [/clinically\s+(proven|tested|shown)/i, 'no study on this formula exists'],
  [/\bguarantee[sd]?\s+results\b|\bguaranteed\s+to\b/i, 'no result is guaranteed'],
  [/\blose\s+\d|\b\d+\s*(lbs|pounds)\s+(in|off)\b/i, 'a quantified weight outcome'],
];

/**
 * Words that are only forbidden when they are aimed at a symptom.
 *
 * This is the distinction the claims list actually draws. 'Stops hot flashes'
 * is a treatment claim; 'a body that stopped listening' is a woman describing
 * her life, and JJ's own approved hero says it. So the gate fires when one of
 * these verbs is pointed at one of these nouns inside the same sentence, and
 * stays quiet otherwise.
 */
const CLAIM_VERB = 'fix\\w*|end|ends|ended|ending|stop|stops|stopped|stopping'
  + '|eliminat\\w*|revers\\w*|treat|treats|treated|heals?|healed|healing'
  + '|los(?:e|es|ing)|shed|sheds|shedding';

const SYMPTOM = 'hot flash\\w*|night sweat\\w*|flashes|sweats|bloating|insomnia'
  + '|menopause|perimenopause|hormone\\w*|imbalance\\w*|anxiety|depression'
  + '|weight|belly fat|fat|pounds|lbs|symptom\\w*|cravings|mood swings|brain fog';

/* Verb first, object within a short reach of it, and NO clause boundary in
   between. A treatment claim puts the symptom straight after the verb —
   "stops hot flashes", "fix your hormones". Reaching across a comma is how a
   gate catches "your periods stop, when your hormones stop keeping time",
   which is a woman's stage being described and not a promise about a pill. */
const AIMED_AT_A_SYMPTOM = new RegExp(
  `\\b(${CLAIM_VERB})\\b[^.?!,;:]{0,24}?\\b(${SYMPTOM})\\b`, 'i',
);

/**
 * The FDA disclaimer is prescribed wording, and the prescribed wording is the
 * one sentence on the page that has to contain 'treat, cure, or prevent'. It
 * is removed before the gate reads a string rather than exempting the whole
 * string, so anything wrapped around it is still checked.
 */
const withoutDisclaimer = (s: string) => s.split(FDA_DISCLAIMER).join(' ');

test('no authored string makes a claim the brand may not make', () => {
  for (const [where, raw] of AUTHORED) {
    if (SIGNED_OFF.has(raw)) continue;
    const value = withoutDisclaimer(raw);

    for (const [pattern, why] of NEVER) {
      expect(
        pattern.test(value),
        `${where}: ${why} — ${JSON.stringify(raw)}`,
      ).toBe(false);
    }

    const aimed = AIMED_AT_A_SYMPTOM.exec(value);
    expect(
      aimed,
      `${where}: "${aimed?.[0]}" reads as a treatment claim. Supports, helps ease `
      + `or helps with, or quote a customer saying it — ${JSON.stringify(raw)}`,
    ).toBe(null);
  }
});

/**
 * A gate that has quietly stopped firing is worse than no gate, because
 * everybody believes it. These are the strings it exists to catch and the
 * ones it must leave alone — the second list is the harder half, and every
 * line in it is copy that is actually on the pages.
 */
test('the gate fires on the claims it exists to catch', () => {
  const forbidden = [
    'Stops hot flashes.',
    'Ends night sweats for good.',
    'Fix your hormones in 30 days.',
    'Hormone Focus ends the bloating.',
    'It reverses hormone imbalance.',
    'Lose weight after 40.',
    'Treats menopause symptoms.',
  ];
  for (const s of forbidden) {
    expect(AIMED_AT_A_SYMPTOM.test(s), `the gate let this through: ${s}`).toBe(true);
  }

  const allowed = [
    'a body that stopped listening',
    'once your body stops fighting you',
    'supports a healthy weight as part of a healthy diet and regular exercise',
    'the stage where the old rules stopped working',
    'Helps ease occasional hot flashes',
    'Hot flashes can start years before your periods stop.',
    'the years before your periods stop, when your hormones stop keeping time',
    'your periods have stopped, and your body is running on less estrogen',
  ];
  for (const s of allowed) {
    expect(AIMED_AT_A_SYMPTOM.test(s), `the gate is too blunt and caught: ${s}`).toBe(false);
  }
});

test('the never-list fires, and a possessive is not a contraction', () => {
  expect(NEVER.some(([p]) => p.test('clinically proven formula'))).toBe(true);
  expect(NEVER.some(([p]) => p.test('a natural HRT'))).toBe(true);
  expect(NEVER.some(([p]) => p.test('it balances your hormones'))).toBe(true);
  expect(NEVER.some(([p]) => p.test('melts belly fat'))).toBe(true);

  expect(CONTRACTIONS.some((p) => p.test('it is not, and you do not'))).toBe(false);
  expect(CONTRACTIONS.some((p) => p.test("800K+ women in JJ's programs"))).toBe(false);
  expect(CONTRACTIONS.some((p) => p.test("the body’s clearing of used hormones"))).toBe(false);
  expect(CONTRACTIONS.some((p) => p.test("you don't"))).toBe(true);
  expect(CONTRACTIONS.some((p) => p.test("it's free"))).toBe(true);
  expect(CONTRACTIONS.some((p) => p.test("you’re done"))).toBe(true);
});

/* ------------------------------------------------------------ the name -- */

/**
 * She reads "The 60-Day Plan". Protocol is a delivery vehicle, which is a
 * thing you ship, not a thing anybody wants to buy — and it is the word we use
 * among ourselves. It stays in constant names, in comments and in the discount
 * code Shopify holds. It never reaches a string she can read.
 */
test('the customer never reads the word we use among ourselves', () => {
  for (const [where, value] of CUSTOMER_FACING) {
    expect(
      /protocol/i.test(value),
      `${where} says Protocol to the customer. She reads ${offer.PLAN_SHORT}: `
      + JSON.stringify(value),
    ).toBe(false);
  }
});

test('the Plan is named the same way everywhere she sees it', () => {
  expect(offer.PLAN_NAME).toBe('The 60-Day Plan for Women Over 40');
  expect(offer.PLAN_SHORT).toBe('The 60-Day Plan');
  expect(offer.optionFor('protocol').title).toContain(offer.PLAN_SHORT);
  expect(offer.optionFor('single').title).toBe('1 bottle \u00b7 30 days');
});

/* -------------------------------------------------------- the two clocks -- */

/**
 * A timeline is only ours to state if somebody else stated it first.
 *
 * "Most women notice the first change inside two weeks" is a fact about what
 * customers report, and the claims list allows it in exactly that form. The
 * same sentence with the attribution stripped is a promise about a supplement,
 * which is a health claim we cannot make and would not want to.
 *
 * So: any string naming one of the two clocks has to carry the attribution in
 * the same breath. Not in the paragraph next to it, where an edit can separate
 * them without anybody noticing — in the same string.
 */
const CLOCK = /\b(two weeks|sixty days)\b/i;
const ATTRIBUTED = /as customers report|customers report|women tell us|women report|women notice/i;

test('no timeline is stated without saying whose timeline it is', () => {
  for (const [where, value] of CUSTOMER_FACING) {
    if (!CLOCK.test(value)) continue;
    expect(
      ATTRIBUTED.test(value),
      `${where} names ${CLOCK.exec(value)?.[0]} as though it were a promise. `
      + 'Carry "as customers report" or "women tell us" in the same string: '
      + JSON.stringify(value),
    ).toBe(true);
  }
});

test('the clock gate fires on a bare promise and not on an attributed one', () => {
  const bare = 'You will feel the difference inside two weeks.';
  const attributed = 'Most women tell us the first change comes inside two weeks.';
  expect(CLOCK.test(bare) && !ATTRIBUTED.test(bare)).toBe(true);
  expect(CLOCK.test(attributed) && ATTRIBUTED.test(attributed)).toBe(true);
});

/* ------------------------------------------- the two numbers, unmerged -- */

test('800,000 appears only in its scoped form, and never as a customer count', () => {
  for (const [where, value] of AUTHORED) {
    if (!/800/.test(value)) continue;
    expect(
      value.includes("800K+ women in JJ's programs"),
      `${where} carries the 800,000 figure in a form that is not the approved one: ${JSON.stringify(value)}`,
    ).toBe(true);
  }
});

test('the review count travels with the rating and nowhere else', () => {
  for (const [where, value] of AUTHORED) {
    expect(
      /\b1(69|70)\s+(verified\s+)?reviews?\b/i.test(value) && !/4\.9/.test(value),
      `${where} names the review count away from the 4.9: ${JSON.stringify(value)}`,
    ).toBe(false);
  }
});

/* ---------------------------------------------------- quotes stay quotes -- */

test('every review on the wall is attributed, and marked where it was cut', () => {
  expect(WALL.length, 'the wall is a wall, not a handful').toBeGreaterThanOrEqual(8);

  for (const r of WALL) {
    expect(r.name.trim().length, 'a review with no name is not attributable').toBeGreaterThan(0);
    expect(r.body.trim().length).toBeGreaterThan(20);

    /* A cut is marked with an ellipsis at the edge it was cut from. A quote
       must never be stitched together across one. */
    const inner = r.body.slice(1, -1);
    expect(
      inner.includes('…'),
      `${r.name}: an ellipsis inside a quote means two pieces were joined. Quote one contiguous span.`,
    ).toBe(false);
  }
});

test('no review has been tidied into the house style', () => {
  /* If every review reads like us, somebody has rewritten them. At least one
     contraction across the wall is the cheap proof that they are theirs. */
  const anyContraction = WALL.some((r) => CONTRACTIONS.some((p) => p.test(r.body)));
  expect(anyContraction, 'the reviews read as authored copy rather than as quotes').toBe(true);
});

/* ------------------------------------------------- the plan, filled in -- */

test('the plan reads correctly whether or not the link carried her answers', () => {
  const v = plan.PLANS.perimenopause;

  const known = plan.fill(v.result, { name: 'Renee', signs: 4, frequency: 'most weeks' });
  expect(known).toContain('You said yes to 4 of 14 signs, most weeks.');
  expect(known).not.toContain('{');

  /* A link with nothing on it still has to read like something a person
     wrote, which is the whole reason every token has a neutral form. */
  const neutral = plan.fill(v.result, { name: '', signs: null, frequency: '' });
  expect(neutral).toContain('You said yes to several things.');
  expect(neutral).not.toContain('{');

  expect(plan.planTitle({ name: 'Renee', signs: 4, frequency: '' }))
    .toBe('Renee, your hormone plan is here');
  expect(plan.planTitle({ name: '', signs: null, frequency: '' }))
    .toBe('Your hormone plan is here');
});

test('every version fills every token, in every section', () => {
  const reader = { name: 'Renee', signs: 4, frequency: 'most weeks' };
  for (const [key, v] of Object.entries(plan.PLANS)) {
    const all = [v.result, v.week, v.howTo, v.expect, v.doctor, v.sixtyDays, ...v.going];
    for (const line of all) {
      expect(plan.fill(line, reader), `${key} leaves a token unfilled`).not.toMatch(/\{[a-z ]+\}/i);
      expect(line.length, `${key} has an empty section`).toBeGreaterThan(20);
    }
  }
});

test('the doctor route has no plan to open', () => {
  /* Outcome D is an exit. There is no archetype for it, and planHref returns
     null, which is what makes it impossible to render the link by accident. */
  expect(Object.keys(plan.ARCHETYPE_FOR).sort()).toEqual(['A', 'B', 'C', 'E']);
  expect(plan.isArchetype('doctor')).toBe(false);
  expect(plan.isArchetype('perimenopause')).toBe(true);
});

/* ---------------------------------------------------- the three switches -- */

test('each switch renders one line or nothing, and the maths is right', () => {
  /* $79.99 over sixty days. If the price moves, this line moves with it. */
  expect(offer.dailyPrice()).toBe('$1.33');
  expect(offer.batchCount()).toBe('2,280');
  expect(offer.batchCount()).toBe(offer.BATCH_ON_SHELF.toLocaleString('en-US'));

  /* Null is the off position and it renders nothing at all, rather than an
     empty "Through ." that somebody has to notice in a screenshot. */
  expect(copy.liveDeadlineLine()).toBe(offer.LIVE_DEADLINE ? `Through ${offer.LIVE_DEADLINE}.` : null);

  expect(copy.batchLine('2,280', 'December'))
    .toBe('This batch: 2,280 bottles on the shelf. The next batch lands in December.');
});

test('there is no countdown anywhere in the copy', () => {
  /* The page never invents a deadline. The only one it may carry is the one
     JJ says out loud, and it lives behind LIVE_DEADLINE. */
  for (const [where, value] of CUSTOMER_FACING) {
    expect(
      /\b(hurry|only \d+ left|ends in|expires in|countdown|last chance)\b/i.test(value),
      `${where} manufactures urgency: ${JSON.stringify(value)}`,
    ).toBe(false);
  }
});

test('the guarantee leads with the promise and backs it with the policy', () => {
  expect(copy.GUARANTEE_HEADLINE).toBe('See results in 60 days, or it is free.');

  const policy = copy.GUARANTEE_SUB_PRE + copy.GUARANTEE_LINK_TEXT + copy.GUARANTEE_SUB_REST;
  expect(policy).toBe('The 60-Day Happiness Guarantee: money back, up to two bottles.');

  /* The words that name the policy are the words that link to it. */
  expect(copy.GUARANTEE_LINK_TEXT).toBe('Happiness Guarantee');
  expect(copy.REFUND_POLICY_URL)
    .toBe('https://shop.jjsmithonline.com/policies/refund-policy');
});

/**
 * Jane's wording, signed off on 21 September, and it is a results guarantee:
 * the brand's own voice attaching an outcome to a date. It is allowed here
 * because she owns copy sign-off and because it is the refund term rather
 * than a claim about what the capsules do — the policy line sits directly
 * under it saying exactly what 'free' means.
 *
 * Listed in full, so nobody can widen it into a claim about results without
 * the build failing.
 */
test('the results guarantee is exactly the line that was signed off', () => {
  expect(copy.GUARANTEE_HEADLINE).toBe('See results in 60 days, or it is free.');
  expect(copy.LIVE_STRIP_REST).toBe(
    ' Two bottles, free shipping, and if you do not see results in 60 days, it is free.',
  );
});

test('the scale is quoted, never claimed', () => {
  /* The brand says who is speaking; the customer says what happened. */
  expect(copy.SCALE_LEAD).toBe('What most women on Hormone Focus tell us:');
  expect(SCALE_QUOTE.body).toBe('The scale finally moved.');
  expect(SCALE_QUOTE.name).toBe('Gigi');
  expect(SCALE_QUOTE.verified).toBe(true);

  /* And the beat that said it in the brand's own voice is gone from every
     hero. The FAQ still says it with 'Women tell us' in front, which is the
     attributed form and the one the claims list allows. */
  const REMOVED = 'And the scale finally moves, women tell us, once your body stops fighting you.';
  for (const [where, value] of CUSTOMER_FACING) {
    expect(
      value.includes(REMOVED),
      `${where} still carries the removed beat: ${JSON.stringify(value)}`,
    ).toBe(false);
  }
});

test('five value props, and the headline carries the section alone', () => {
  expect(copy.VALUE_PROPS).toHaveLength(5);
  expect(copy.VALUE_HEADLINE).toBe('Why this one');
  expect(
    copy.VALUE_PROPS.some(([head]) => /made for this stage/i.test(head)),
    'the removed value prop is still here',
  ).toBe(false);
});

test('the buttons name the bottles', () => {
  /* Jane's own wording on the Plan, from her nine notes, and untouched. */
  expect(offer.optionFor('protocol').cta).toBe('Get my two bottles');
  expect(offer.optionFor('protocol').ctaShort).toBe('Get my two bottles');

  /* The other two match the buttons on Jane's landing page word for word,
     at David's request, so the two surfaces stop reading as two products. */
  expect(offer.optionFor('single').cta).toBe('Get 1 bottle');
  expect(offer.optionFor('single').ctaShort).toBe('Get 1 bottle');
  expect(offer.optionFor('subscribe').cta).toBe('Subscribe & save');
  expect(offer.optionFor('subscribe').ctaShort).toBe('Subscribe & save');

  /* The row still names the Plan, even though the button does not. */
  expect(offer.optionFor('protocol').title).toBe(`2 bottles · ${offer.PLAN_SHORT}`);
});

test('the subscription never reaches the Live, whatever the flag says', () => {
  expect(offer.optionsFor(true).some((o) => o.kind === 'subscribe')).toBe(false);
  /* And off the Live it follows the flag, which is where the decision lives. */
  expect(offer.optionsFor(false).some((o) => o.kind === 'subscribe'))
    .toBe(offer.SUBSCRIPTION_LIVE);
});

/* ------------------------------------------------ the wall, cut not edited -- */

test('every excerpt on the wall is where the quote was cut, not what it was cut into', () => {
  for (const r of WALL) {
    if (!r.excerpt) continue;
    expect(
      r.body.startsWith(r.excerpt),
      `${r.name}: the excerpt is not a prefix of the review. It may be shortened, never reworded.`,
    ).toBe(true);
    expect(r.excerpt.length, `${r.name}: the excerpt is the whole review`).toBeLessThan(r.body.length);
    expect(r.excerpt.length, `${r.name}: the excerpt is too short to say anything`).toBeGreaterThan(40);
  }
});

test('the wall shows six, and half of them carry a face', () => {
  /* Six cards, alternating, so three faces. The component slices the first
     six; this is what stops somebody trimming reviews.ts below that. */
  expect(WALL.length).toBeGreaterThanOrEqual(6);
});
