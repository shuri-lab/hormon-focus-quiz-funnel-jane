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
import * as offer from '../src/lib/offer';
import * as copy from '../src/lib/offerCopy';
import * as plan from '../src/lib/planCopy';
import * as kit from '../src/lib/kitCopy';
import * as quiz from '../src/lib/content';
import * as result from '../src/lib/resultCopy';
/* The claim patterns and the export walker moved to tests/claimRules.ts on
   7 October 2026, unchanged, so the results tests can hold one string to the
   same gate. This file is still what reads every authored string. */
import { AIMED_AT_A_SYMPTOM, NEVER, strings, withoutDisclaimer } from './claimRules';

/* ------------------------------------------------- collecting the copy -- */

const AUTHORED: [string, string][] = [
  ...strings(offer, 'offer.ts'),
  ...strings(ANGLES, 'angles.ts'),
  ...strings(copy, 'offerCopy.ts'),
  ...strings(plan, 'planCopy.ts'),
  /* The rebuilt quiz, 2 October 2026: every question, the result pages and
     the kit page at the end are held to the same gate as the offer pages. */
  ...strings(kit, 'kitCopy.ts'),
  ...strings(quiz, 'content.ts'),
  /* The results update, 6 October 2026: what this means, her first three
     things, and why JJ made the Kit. */
  ...strings(result, 'resultCopy.ts'),
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

/**
 * resultCopy.ts is exempt from THIS rule and no other.
 *
 * The house style has had no contractions since 1 September 2026. The results
 * copy pack of 6 October overrides it in writing, in Jane's own note on the
 * brief: "That is the voice: short, direct, no softening, contractions fine
 * (JJ's voice)." Her text is used word for word, so the words arrive with
 * contractions in them.
 *
 * The claim gate below still reads every string in that module. This carve-out
 * is about house style, never about what the brand may say.
 */
const CONTRACTIONS_EXEMPT = (path: string) => path.startsWith('resultCopy.ts');

test('no authored string uses a contraction', () => {
  for (const [where, value] of AUTHORED) {
    if (CONTRACTIONS_EXEMPT(where)) continue;
    /* A string signed off by name is signed off for this gate too. It was
       only consulted by the claim gate below, so a dictated contraction had
       nowhere to be recorded except by exempting its whole module — which
       would have waved through every future one in the same file. */
    if (SIGNED_OFF.has(value)) continue;
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

  /* THE 7 OCTOBER DOOR COPY. David specified these three word for word, so
     the contractions are his and deliberate, not drift. Listed in full
     rather than exempting a whole module, so a fourth contraction appearing
     anywhere in angles.ts or content.ts still fails the build.
     The claim gate below still reads every one of them. */
  "Why you're bloated",
  "Why the scale won't move,",
  "Find out what's really going on with your body. Take the free 1-minute quiz.",
]);

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
  /* JJ's own name for it, as it reads on her page. */
  expect(offer.PLAN_NAME).toBe('The 60-Day Feel Like YOU Again Kit');
  expect(offer.PLAN_SHORT).toBe('The 60-Day Kit');
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
/* WIDENED 8 OCTOBER 2026. It used to read only the two clocks spelled out in
   words, `two weeks` and `sixty days`. A new Kit paragraph said "The second
   month is when those add up to a pattern you can see" and the gate never saw
   it: the duration was in digits, and "month" was not a word it knew. Both are
   now read. */
const CLOCK =
  /\b(two weeks|sixty days|thirty days|\d+\s*(?:days|weeks|months)|first month|second month|two months)\b/i;

/**
 * A DURATION IS NOT A PROMISE ON ITS OWN, and this is why the rule needs two
 * halves rather than one.
 *
 * "1 bottle, 30 days" is a pack size. "Delivered every 30 days" is a delivery
 * cadence. "START MY 60 DAYS" is a button. "Your next 60 days" is a heading.
 * Widening the clock above to digits made the gate read all nineteen of them,
 * and a gate that fails on nineteen strings nobody is worried about is a gate
 * somebody switches off.
 *
 * What the claims list actually forbids is a duration tied to a CHANGE: how
 * long before she notices, sees, feels or gets a result. So the rule fires
 * when a duration and an outcome are in the same string, and stays quiet when
 * a duration is just counting days.
 */
const OUTCOME =
  /\b(notic\w*|see|seeing|saw|feel\w*|felt|chang\w*|difference|results?|add up|adds up|improv\w*)\b/i;

/* `women tell me` and `they tell me` added 8 October: JJ writes in the first
   person, so her attribution reads "many women tell me", not "tell us".
   `customers generally report` is the kit FAQ's own wording, which the old
   pattern did not recognise because the clock never read `30 days` before. */
const ATTRIBUTED =
  /as customers report|customers (?:generally )?report|women tell us|women tell me|they tell me|women report|women notice/i;

const CLOCK_EXEMPT = new Set([
  'Write it down for two weeks',
  'When it shows up, what you ate, where you are in your cycle. Two weeks shows the pattern.',
  'Sleep, energy, mood, cravings, how your clothes fit. Two weeks on paper beats months of guessing.',

  /* THE REFUND WINDOW, not a timeline. "If you do not see results in 60 days,
     it is free" is a condition for getting her money back, and it promises the
     opposite of a result. Both are approved offer copy that predates the
     widening above, and both are listed in full so an edit re-gates them. */
  'See results in 60 days, or it is free.',
  ' Two bottles, free shipping, and if you do not see results in 60 days, it is free.',
]);

test('no timeline is stated without saying whose timeline it is', () => {
  for (const [where, value] of CUSTOMER_FACING) {
    if (!CLOCK.test(value)) continue;
    /* A duration that is not tied to a change is counting days, not promising
       one. See the note on OUTCOME above. */
    if (!OUTCOME.test(value)) continue;
    if (CLOCK_EXEMPT.has(value)) continue;
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

/** Does a string get past the whole rule, exactly as the loop above runs it? */
const clockPasses = (v: string) =>
  !CLOCK.test(v) || !OUTCOME.test(v) || CLOCK_EXEMPT.has(v) || ATTRIBUTED.test(v);

test('the sentence that slipped through on 7 October would not slip through now', () => {
  /* Written in digits and in months, so the old pattern never read it, and
     stated in the brand's own voice. This is the regression. */
  const slipped = 'The second month is when those add up to a pattern you can see.';
  expect(clockPasses(slipped), 'a bare month-and-change promise must be caught').toBe(false);

  /* Jane's rewrite, which carries the attribution in the same breath. */
  const fixed = 'They tell me the second month is when those add up to a pattern you can see.';
  expect(clockPasses(fixed), 'the attributed form is allowed').toBe(true);

  /* And the digit form of the other clock, which also used to be invisible. */
  expect(clockPasses('You will see a difference in 60 days.')).toBe(false);
  expect(clockPasses('Women tell me they see a difference in 60 days.')).toBe(true);
});

test('counting days is not promising one', () => {
  /* Every one of these is a pack size, a cadence, a button or a heading. The
     widened clock reads them; the rule must still let them through. */
  for (const v of [
    '1 bottle · 30 days',
    'Delivered every 30 days',
    'START MY 60 DAYS',
    'Your next 60 days',
    'Where you are in 60 days',
    'Two months to decide, on us',
    'Two bottles of Hormone Focus, 60 days',
  ]) {
    expect(clockPasses(v), `the gate must not fire on: ${v}`).toBe(true);
  }
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
  /* $74.99 over sixty days, the same $1.25 a day JJ's page shows. */
  expect(offer.PROTOCOL_PRICE).toBe(74.99);
  expect(offer.dailyPrice()).toBe('$1.25');
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

test('the buttons name what she is buying', () => {
  /* The kit is bottles, an ebook, recipes and a tracker, so its button names
     the kit. */
  expect(offer.optionFor('protocol').cta).toBe('Get my kit');
  expect(offer.optionFor('protocol').ctaShort).toBe('Get my kit');

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
