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
import { OFFER_UTM_CONTENT, QUIZ_UTM, shopUrl } from '../src/lib/analytics';
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
  /* The bundle is priced in Shopify now, so no code should be riding along. */
  expect(u.searchParams.get('discount')).toBeNull();
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

test('the quiz owns the utm_* on all three shapes', () => {
  arrivedWith(AD);
  for (const kind of ['single', 'protocol', 'subscribe'] as const) {
    const u = new URL(shopUrl(SHOP_BASE, 'B', 'bloating', kind));
    expect(u.searchParams.get('utm_source'), kind).toBe(QUIZ_UTM.source);
    expect(u.searchParams.get('utm_medium'), kind).toBe(QUIZ_UTM.medium);
    expect(u.searchParams.get('utm_campaign'), kind).toBe(QUIZ_UTM.campaign);
    expect(u.searchParams.get('utm_content'), kind).toBe(OFFER_UTM_CONTENT[kind]);
    expect(u.searchParams.get('hf_offer'), kind).toBe(kind);
  }
  /* One utm_content per offer, and no two the same, or the report cannot
     tell a bundle from a subscription. */
  expect(new Set(Object.values(OFFER_UTM_CONTENT)).size).toBe(3);
});

test('the ad attribution survives beside the quiz, not under it', () => {
  arrivedWith(AD);
  for (const kind of ['single', 'protocol', 'subscribe'] as const) {
    const u = new URL(shopUrl(SHOP_BASE, 'B', 'bloating', kind));
    /* Every original, moved one prefix across and unchanged. */
    expect(u.searchParams.get('hf_src'), kind).toBe(AD.utm_source);
    expect(u.searchParams.get('hf_medium'), kind).toBe(AD.utm_medium);
    expect(u.searchParams.get('hf_campaign'), kind).toBe(AD.utm_campaign);
    expect(u.searchParams.get('hf_content'), kind).toBe(AD.utm_content);
    expect(u.searchParams.get('hf_term'), kind).toBe(AD.utm_term);
    /* And the quiz's own, still there. */
    expect(u.searchParams.get('hf_funnel'), kind).toBe(AD.hf_funnel);
    expect(u.searchParams.get('hf_variant'), kind).toBe(AD.hf_variant);
  }
});

test('click ids keep their real names, because that is how they are read', () => {
  arrivedWith({ ...AD, fbclid: 'FB1', gclid: 'GC1', ttclid: 'TT1' });
  const u = new URL(shopUrl(SHOP_BASE, 'B', 'bloating', 'protocol'));
  expect(u.searchParams.get('fbclid')).toBe('FB1');
  /* gclid and ttclid were captured on arrival and then dropped here. */
  expect(u.searchParams.get('gclid')).toBe('GC1');
  expect(u.searchParams.get('ttclid')).toBe('TT1');
  for (const k of ['fbclid', 'gclid', 'ttclid']) {
    expect(u.searchParams.get(`hf_${k}`), `${k} must not be prefixed`).toBeNull();
  }
});

test('carrying the ad parameters does not cost the required ones', () => {
  arrivedWith(AD);
  expect(new URL(shopUrl(SHOP_BASE, 'B', '', 'protocol')).searchParams.get('storefront'))
    .toBe('true');
  expect(new URL(shopUrl(SHOP_BASE, 'B', '', 'subscribe')).searchParams.get('selling_plan'))
    .toBe(SUBSCRIBE_SELLING_PLAN_ID);
});

test('organic traffic sends the quiz attribution and no empty originals', () => {
  const u = new URL(shopUrl(SHOP_BASE, 'B', 'weight', 'single'));
  expect(u.searchParams.get('utm_source')).toBe(QUIZ_UTM.source);
  expect(u.searchParams.get('utm_content')).toBe('1bottle');
  expect(u.searchParams.get('utm_term')).toBe('weight');
  expect(u.searchParams.get('hf_outcome')).toBe('B');
  /* Nothing came in, so nothing is invented to stand in for it. */
  for (const k of ['hf_src', 'hf_medium', 'hf_campaign', 'hf_content', 'hf_term']) {
    expect(u.searchParams.get(k), k).toBeNull();
  }
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
  /* The Plan keeps its name. A redesign that renames the offer is a rewrite. */
  expect(offerCards()[1].kicker).toContain('The 60-Day Plan');
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

test('every row keeps both bonuses and the guarantee', () => {
  for (const k of ['single', 'protocol', 'subscribe'] as const) {
    const stack = valueStackFor(k);
    expect(stack.filter((i) => i.bonus), k).toHaveLength(2);
    expect(stack.at(-1)!.what, k).toBe('The 60-Day Happiness Guarantee');
  }
});

test('the button and the stack always name the same purchase', () => {
  /* One bottle in the button, one bottle at the top of the stack. */
  expect(optionFor('single').cta).toMatch(/1 bottle/i);
  expect(valueStackFor('single')[0].what).toMatch(/one bottle/i);
  expect(optionFor('protocol').cta).toMatch(/two bottles/i);
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
  expect(saving).toBe('14.99');
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

test('the Starter Guide rides on the plan, and only the plan', () => {
  const withBonus = offerCards().filter((c) => c.bonus);
  expect(withBonus).toHaveLength(1);
  expect(withBonus[0].kind).toBe('protocol');
  expect(withBonus[0].shotGuide, 'the bonus is pictured, not just named').toBeTruthy();
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
