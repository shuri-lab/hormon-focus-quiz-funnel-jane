/* WHERE THE MONEY GOES.
 *
 * Three rows, three Shopify destinations, and each one is a different shape:
 * a cart permalink, a second cart permalink for a different variant, and the
 * /cart/add form, which is the only way to attach a selling plan. Getting one
 * of them subtly wrong does not throw and does not fail a render test — she
 * simply arrives at the wrong thing, or at payment instead of the cart.
 *
 * So each destination is asserted whole, against the literal URL the store
 * was given, rather than by checking that a few parameters are present.
 */
import { afterEach, beforeEach, expect, test } from 'vitest';
import {
  PROTOCOL_VARIANT_ID, SINGLE_VARIANT_ID, SUBSCRIBE_SELLING_PLAN_ID,
  ONE_MONTH_PRICE, PROTOCOL_PRICE, SUBSCRIBE_PRICE, SUBSCRIBE_SAVING,
  SUBSCRIBE_VARIANT_ID,
  cartPath, offerCards, optionFor, optionsFor, perDay, valueStackFor,
} from '../src/lib/offer';
import { quizLandingFrom, shopUrl } from '../src/lib/analytics';
import { SHOP_BASE } from '../src/lib/logic';

/* shopUrl reads stored attribution. In a node environment there is no
   sessionStorage, so give it one and let each test decide what the ad sent. */
const store = new Map<string, string>();
beforeEach(() => {
  store.clear();
  (globalThis as unknown as { sessionStorage: Storage }).sessionStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
    key: () => null,
    length: 0,
  } as unknown as Storage;
});
afterEach(() => store.clear());

function arrivedWith(params: Record<string, string>) {
  store.set('hf_attribution', JSON.stringify(params));
}

/* ------------------------------------------------ the three destinations -- */

test('one bottle is the single variant, quantity 1, on the cart permalink', () => {
  const u = new URL(shopUrl(SHOP_BASE, 'B', 'bloating', 'single'));
  expect(u.origin + u.pathname).toBe(
    `https://shop.jjsmithonline.com/cart/${SINGLE_VARIANT_ID}:1`);
  expect(u.searchParams.get('storefront')).toBe('true');
});

test('the Plan is the two-bottle bundle variant, quantity 1, not two singles', () => {
  const u = new URL(shopUrl(SHOP_BASE, 'B', 'bloating', 'protocol'));
  expect(PROTOCOL_VARIANT_ID).toBe('54330638663791');
  expect(u.origin + u.pathname).toBe(
    `https://shop.jjsmithonline.com/cart/${PROTOCOL_VARIANT_ID}:1`);
  expect(u.searchParams.get('storefront')).toBe('true');
  /* The kit link is the one JJ's own page sends: the bundle variant plus the
     free-shipping code. One offer, from two doors. */
  expect(u.searchParams.get('discount')).toBe('HF60FREESHIP');
});

test('the subscription carries its selling plan through /cart/add', () => {
  const u = new URL(shopUrl(SHOP_BASE, 'B', 'bloating', 'subscribe'));
  expect(u.origin + u.pathname).toBe('https://shop.jjsmithonline.com/cart/add');
  /* Its own variant, not the one-off with a plan bolted on. */
  expect(u.searchParams.get('id')).toBe(SUBSCRIBE_VARIANT_ID);
  expect(SUBSCRIBE_VARIANT_ID).toBe('54355951845487');
  expect(SUBSCRIBE_VARIANT_ID).not.toBe(SINGLE_VARIANT_ID);
  expect(u.searchParams.get('quantity')).toBe('1');
  expect(u.searchParams.get('selling_plan')).toBe(SUBSCRIBE_SELLING_PLAN_ID);
  expect(SUBSCRIBE_SELLING_PLAN_ID).toBe('5529010287');
});

test('no row sends her to a product page', () => {
  for (const kind of ['single', 'protocol', 'subscribe'] as const) {
    expect(cartPath(kind), kind).not.toMatch(/\/products\//);
    expect(cartPath(kind), kind).toMatch(/^\/cart\//);
  }
});

test('the two permalinks say storefront=true, which is what keeps them carts', () => {
  /* Without it Shopify skips the cart and goes straight to payment. */
  for (const kind of ['single', 'protocol'] as const) {
    expect(new URL(shopUrl(SHOP_BASE, 'B', '', kind)).searchParams.get('storefront'))
      .toBe('true');
  }
});

/* ------------------------------------------------------------- tracking -- */

const AD = {
  utm_source: 'meta', utm_medium: 'paid', utm_campaign: 'peri_q3',
  utm_content: 'vid_07', utm_term: 'bloat_kw',
  hf_funnel: 'quiz_v2', hf_variant: 'b',
};

test('the acquisition reaches Shopify untouched, on all three shapes', () => {
  arrivedWith(AD);
  for (const kind of ['single', 'protocol', 'subscribe'] as const) {
    const u = new URL(shopUrl(SHOP_BASE, 'B', 'bloating', kind));
    for (const [k, v] of Object.entries(AD)) {
      if (!k.startsWith('utm_')) continue;
      expect(u.searchParams.get(k), `${kind} changed ${k}`).toBe(v);
    }
  }
});

test('the quiz does not rename the source it was given', () => {
  /* The bug this replaces: utm_source=bridge, utm_medium=quiz and a
     per-offer utm_content overwrote the acquisition, so a woman who arrived
     from an Instagram DM reached checkout looking like quiz traffic and the
     campaign that paid for her could never be credited. */
  arrivedWith(AD);
  const u = new URL(shopUrl(SHOP_BASE, 'B', 'bloating', 'protocol'));
  expect(u.searchParams.get('utm_source')).not.toBe('bridge');
  expect(u.searchParams.get('utm_medium')).not.toBe('quiz');
  expect(u.searchParams.get('utm_content')).not.toBe('2bottle');
});

test('no health answer, result or profile rides in the cart URL', () => {
  arrivedWith(AD);
  for (const kind of ['single', 'protocol', 'subscribe'] as const) {
    const u = new URL(shopUrl(SHOP_BASE, 'B', 'bloating', kind));
    /* hf_outcome carried the quiz RESULT, which is a health inference about
       her, and is gone. Which offer she chose is the variant in the path. */
    for (const banned of ['hf_outcome', 'hf_offer', 'outcome', 'result', 'angle']) {
      expect(u.searchParams.get(banned), `${kind} leaks ${banned}`).toBeNull();
    }
    for (const [, v] of u.searchParams) {
      expect(v, `${kind} leaks the angle`).not.toBe('bloating');
    }
  }
});

test('click ids keep their own names and survive', () => {
  arrivedWith({ ...AD, fbclid: 'FB1', gclid: 'GC1', ttclid: 'TT1' });
  const u = new URL(shopUrl(SHOP_BASE, 'B', 'bloating', 'protocol'));
  expect(u.searchParams.get('fbclid')).toBe('FB1');
  expect(u.searchParams.get('gclid')).toBe('GC1');
  expect(u.searchParams.get('ttclid')).toBe('TT1');
});

test('carrying the attribution does not cost the required parameters', () => {
  arrivedWith(AD);
  expect(new URL(shopUrl(SHOP_BASE, 'B', '', 'protocol')).searchParams.get('storefront'))
    .toBe('true');
  expect(new URL(shopUrl(SHOP_BASE, 'B', '', 'subscribe')).searchParams.get('selling_plan'))
    .toBe(SUBSCRIBE_SELLING_PLAN_ID);
});

test('traffic with no attribution gets a clean link, not invented values', () => {
  const u = new URL(shopUrl(SHOP_BASE, 'B', 'weight', 'single'));
  expect(u.pathname).toBe(`/cart/${SINGLE_VARIANT_ID}:1`);
  /* What Shopify needs, plus the funnel mark — and nothing standing in for
     an acquisition she did not arrive with. No empty utm_*. */
  /* What Shopify needs, the funnel mark and the door — and nothing standing
     in for an acquisition she did not arrive with. No empty utm_*. */
  expect([...u.searchParams.keys()].sort())
    .toEqual(['hf_funnel', 'hf_quiz_landing', 'storefront']);
  expect(u.searchParams.get('hf_funnel')).toBe('quiz');
});

/* --------------------------------------------------------------- rows -- */

test('all three rows are offered, and the Live still withholds the subscription', () => {
  expect(optionsFor(false).map((o) => o.kind)).toEqual(['single', 'protocol', 'subscribe']);
  expect(optionsFor(true).map((o) => o.kind)).toEqual(['single', 'protocol']);
});

/* ------------------------------------------------------- the value stack -- */

/* The stack sits directly under the price and argues for it. When it was one
   flat array it argued for two bottles no matter which row was selected —
   the bug these tests exist to keep fixed. */

test('every card is titled with the copy its own row already used', () => {
  for (const c of offerCards()) {
    expect(c.kicker, c.kind).toBe(optionFor(c.kind).title);
    expect(c.supply, c.kind).toBe(optionFor(c.kind).detail);
    expect(c.cta, c.kind).toBe(optionFor(c.kind).cta);
    expect(c.terms, c.kind).toBe(optionFor(c.kind).priceNote);
  }
  /* The kit keeps its name. A redesign that renames the offer is a rewrite. */
  expect(offerCards()[1].kicker).toContain('The 60-Day Kit');
});

test('the stack describes the row she is actually on', () => {
  const head = (k: Parameters<typeof valueStackFor>[0]) => valueStackFor(k)[0].what;
  expect(head('single')).toBe('One bottle of Hormone Focus, 30 days');
  expect(head('protocol')).toBe('Two bottles of Hormone Focus, 60 days');
  expect(head('subscribe')).toBe('One bottle of Hormone Focus, every 4 weeks');
});

test('only the Plan and the subscription claim free shipping', () => {
  const ships = (k: Parameters<typeof valueStackFor>[0]) =>
    valueStackFor(k).some((i) => /free shipping/i.test(i.what));
  /* The single row reads "plus shipping", so the stack must not contradict it. */
  expect(ships('single'), 'the single must not claim free shipping').toBe(false);
  expect(ships('protocol')).toBe(true);
  expect(ships('subscribe')).toBe(true);
});

test('no stack sells two bottles to somebody buying one', () => {
  for (const k of ['single', 'subscribe'] as const) {
    for (const item of valueStackFor(k)) {
      expect(item.what, `${k} stack mentions two bottles`).not.toMatch(/two bottles/i);
    }
  }
});

test('the headline worth matches what that row actually costs', () => {
  expect(valueStackFor('single')[0].worth).toBe('$49.99');
  expect(valueStackFor('protocol')[0].worth).toBe('$99.98 bought one at a time');
  expect(valueStackFor('subscribe')[0].worth).toBe('$49.99 bought one at a time');
});

test('the three digital pieces come with the kit and only the kit, and every row keeps the guarantee', () => {
  /* JJ's ebook, recipes and tracker are what make the kit a kit. A single
     bottle or a subscription does not include them, so their stacks must not
     say so. */
  expect(valueStackFor('protocol').filter((i) => i.bonus)).toHaveLength(3);
  expect(valueStackFor('single').filter((i) => i.bonus)).toHaveLength(0);
  expect(valueStackFor('subscribe').filter((i) => i.bonus)).toHaveLength(0);
  for (const k of ['single', 'protocol', 'subscribe'] as const) {
    expect(valueStackFor(k).at(-1)!.what, k).toBe('The 60-Day Happiness Guarantee');
  }
});

test('the button and the stack always name the same purchase', () => {
  /* One bottle in the button, one bottle at the top of the stack. */
  expect(optionFor('single').cta).toMatch(/1 bottle/i);
  expect(valueStackFor('single')[0].what).toMatch(/one bottle/i);
  /* The kit is more than its bottles, so the button names the kit; the
     stack still opens on the two bottles that are in it. */
  expect(optionFor('protocol').cta).toMatch(/kit/i);
  expect(valueStackFor('protocol')[0].what).toMatch(/two bottles/i);
});

/* ------------------------------------------------------- the offer cards -- */

/* The cards replaced a radio group. Every number on them is derived, so these
   tests are really asking one thing: does the card still agree with the price
   it is selling? A card that disagrees is worse than no card. */

test('there are three cards, in the order she reads them', () => {
  expect(offerCards().map((c) => c.kind)).toEqual(['single', 'protocol', 'subscribe']);
});

test('every card names the price its own row charges', () => {
  for (const card of offerCards()) {
    expect(card.now, card.kind).toBe(`$${optionFor(card.kind).price.toFixed(2)}`);
  }
});

test('the day rate divides the price by the days it actually buys', () => {
  /* 30, 60 and 28 — four weeks is not a month. */
  expect(perDay('single')).toBe(`$${(ONE_MONTH_PRICE / 30).toFixed(2)}`);
  expect(perDay('protocol')).toBe(`$${(PROTOCOL_PRICE / 60).toFixed(2)}`);
  expect(perDay('subscribe')).toBe(`$${(SUBSCRIBE_PRICE / 28).toFixed(2)}`);
});

test('a struck price is only shown where there is a real saving behind it', () => {
  const [single, plan, sub] = offerCards();
  /* Nothing is discounted off one bottle, so nothing is struck through. */
  expect(single.was).toBeUndefined();
  expect(plan.was).toBe('$99.98');
  expect(sub.was).toBe('$49.99');
});

test('the saving on the plan is the two singles minus the plan', () => {
  const plan = offerCards()[1];
  const saving = (ONE_MONTH_PRICE * 2 - PROTOCOL_PRICE).toFixed(2);
  expect(plan.saving).toBe(`$${saving}`);
  expect(saving).toBe('24.99');
  /* And only the Plan names one. */
  expect(offerCards().filter((c) => c.saving)).toHaveLength(1);
});

test('free shipping is claimed on exactly the two rows that have it', () => {
  const [single, plan, sub] = offerCards();
  /* The card's terms line IS the option's priceNote, so the card cannot
     disagree with the row it was built from. */
  expect(single.terms, 'the single is plus shipping').toMatch(/plus shipping/i);
  expect(single.terms).not.toMatch(/free shipping/i);
  expect(plan.terms).toMatch(/free shipping/i);
  expect(sub.terms).toMatch(/free shipping/i);
});

test('the digital pieces ride on the kit, and only the kit', () => {
  const withBonus = offerCards().filter((c) => c.bonus);
  expect(withBonus).toHaveLength(1);
  expect(withBonus[0].kind).toBe('protocol');
  /* Named in JJ's own titles. The retired Starter Guide is not one of them,
     and its picture does not ride along either. */
  expect(withBonus[0].bonus).toMatch(/60-Day Hormone Fix/);
  expect(withBonus[0].bonus).toMatch(/Hormone Healthy Recipes/);
  expect(withBonus[0].bonus).toMatch(/Daily Symptom Tracker/);
  expect(withBonus[0].bonus).not.toMatch(/Starter Guide|Cheat Sheet/i);
  expect(withBonus[0].shotGuide).toBeUndefined();
});

test('the badges are the ones the copy already carried', () => {
  /* Two, not one: "Best Seller" on the Plan and "Best value" on the
     subscription were both in OFFER_OPTIONS before the cards existed, and a
     redesign does not get to retire a label. */
  for (const c of offerCards()) expect(c.badge, c.kind).toBe(optionFor(c.kind).badge);
  expect(offerCards().filter((c) => c.badge).map((c) => c.kind))
    .toEqual(['protocol', 'subscribe']);
});

test('every card carries a product shot, which is why the screen needs none', () => {
  for (const card of offerCards()) expect(card.shot, card.kind).toMatch(/^\/img\/offer-/);
});

/* ------------------------------------------------- the saving and the price */

test('the advertised saving is the arithmetic of the price beside it', () => {
  /* These two have contradicted each other once already. A test is cheaper
     than noticing it on a live page. */
  const pct = Math.round((1 - SUBSCRIBE_PRICE / ONE_MONTH_PRICE) * 100);
  expect(`${pct}%`).toBe(SUBSCRIBE_SAVING);
  expect(SUBSCRIBE_PRICE).toBe(39.99);
});

test('the subscription card shows the price the plan charges', () => {
  expect(offerCards()[2].now).toBe('$39.99');
  expect(offerCards()[2].was).toBe('$49.99');
  expect(perDay('subscribe')).toBe('$1.43');
});

/* ------------------------------------------------------- the funnel mark -- */

test('every cart link says the quiz converted her, without touching the utm', () => {
  arrivedWith(AD);
  for (const kind of ['single', 'protocol', 'subscribe'] as const) {
    const u = new URL(shopUrl(SHOP_BASE, 'B', 'bloating', kind));
    /* Where she came from, untouched... */
    expect(u.searchParams.get('utm_source'), kind).toBe(AD.utm_source);
    expect(u.searchParams.get('utm_medium'), kind).toBe(AD.utm_medium);
    /* ...and which door converted her, said separately. */
    expect(u.searchParams.get('hf_funnel'), kind).toBe('quiz');
  }
});

test('hf_funnel is set even when she arrived with no attribution at all', () => {
  const u = new URL(shopUrl(SHOP_BASE, 'B', '', 'protocol'));
  expect(u.searchParams.get('hf_funnel')).toBe('quiz');
});

test('hf_presell survives the quiz into Shopify', () => {
  arrivedWith({ ...AD, hf_presell: 'advertorial-2' });
  const u = new URL(shopUrl(SHOP_BASE, 'B', 'bloating', 'protocol'));
  expect(u.searchParams.get('hf_presell')).toBe('advertorial-2');
});

test('the kit keeps its free shipping code and the single bottle does not', () => {
  const kit = new URL(shopUrl(SHOP_BASE, 'B', '', 'protocol'));
  expect(kit.searchParams.get('discount')).toBe('HF60FREESHIP');
  const one = new URL(shopUrl(SHOP_BASE, 'B', '', 'single'));
  expect(one.searchParams.get('discount')).toBeNull();
});

/* ------------------------------------------------- which door she came in -- */

test('every offer carries the door she entered by', () => {
  arrivedWith(AD);
  store.set('hf_quiz_landing', 'night-sweats');
  for (const kind of ['single', 'protocol', 'subscribe'] as const) {
    const u = new URL(shopUrl(SHOP_BASE, 'B', 'bloating', kind));
    expect(u.searchParams.get('hf_quiz_landing'), kind).toBe('night-sweats');
    expect(u.searchParams.get('hf_funnel'), kind).toBe('quiz');
  }
});

test('the door is a slug, and never an answer', () => {
  for (const [path, slug] of [
    ['/', 'main'],
    ['/night-sweats', 'night-sweats'],
    ['/bloating/quiz/symptoms', 'bloating'],
    ['/quiz/kit', 'direct'],
    ['/not-a-door', 'main'],
  ] as const) {
    expect(quizLandingFrom(path), path).toBe(slug);
  }
});

/* --------------------------------------------- the subscription redirect -- */

test('the subscription carries its attribution through Shopify\'s redirect', () => {
  /* THE BUG THIS EXISTS FOR, measured against the live store:
   *   /cart/add?...&utm_source=x   ->  302 /cart          every param dropped
   *   /cart/<variant>:1?utm_...    ->  302 /cart?utm_...  kept
   * The subscription is the only offer on /cart/add, so it was the only one
   * reaching checkout with no attribution. return_to is what survives. */
  arrivedWith(AD);
  store.set('hf_quiz_landing', 'night-sweats');
  const u = new URL(shopUrl(SHOP_BASE, 'B', 'bloating', 'subscribe'));

  const returnTo = u.searchParams.get('return_to');
  expect(returnTo, 'the subscription has no return_to').toBeTruthy();

  const landed = new URLSearchParams(returnTo!.split('?')[1]);
  /* The acquisition. hf_funnel is excluded here because the fixture carries
     one of its own and the quiz sets its own; it is asserted just below. */
  for (const [k, v] of Object.entries(AD)) {
    if (k.startsWith('hf_')) continue;
    expect(landed.get(k), `${k} would be lost at the redirect`).toBe(v);
  }
  expect(landed.get('hf_funnel')).toBe('quiz');
  expect(landed.get('hf_quiz_landing')).toBe('night-sweats');

  /* And the cart's own instructions stay on /cart/add, where Shopify reads
     them. A selling_plan inside return_to would do nothing. */
  expect(landed.get('id'), 'id does not belong in return_to').toBeNull();
  expect(landed.get('selling_plan'), 'selling_plan must stay on /cart/add').toBeNull();
  expect(u.searchParams.get('selling_plan')).toBe(SUBSCRIBE_SELLING_PLAN_ID);
  expect(u.searchParams.get('id')).toBe(SUBSCRIBE_VARIANT_ID);
  expect(u.searchParams.get('quantity')).toBe('1');
});

test('the two permalink offers need no return_to, because they keep their query', () => {
  arrivedWith(AD);
  for (const kind of ['single', 'protocol'] as const) {
    const u = new URL(shopUrl(SHOP_BASE, 'B', '', kind));
    expect(u.searchParams.get('return_to'), kind).toBeNull();
  }
});
