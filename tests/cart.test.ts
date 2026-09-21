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
  cartPath, optionFor, optionsFor, valueStackFor,
} from '../src/lib/offer';
import { shopUrl } from '../src/lib/analytics';
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
  expect(u.searchParams.get('id')).toBe(SINGLE_VARIANT_ID);
  expect(u.searchParams.get('quantity')).toBe('1');
  expect(u.searchParams.get('selling_plan')).toBe(SUBSCRIBE_SELLING_PLAN_ID);
  expect(SUBSCRIBE_SELLING_PLAN_ID).toBe('3665428591');
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

test('every row carries the ad parameters through, on all three shapes', () => {
  arrivedWith(AD);
  for (const kind of ['single', 'protocol', 'subscribe'] as const) {
    const u = new URL(shopUrl(SHOP_BASE, 'B', 'bloating', kind));
    for (const [k, v] of Object.entries(AD)) {
      expect(u.searchParams.get(k), `${kind} lost ${k}`).toBe(v);
    }
    expect(u.searchParams.get('hf_offer'), kind).toBe(kind);
  }
});

test('carrying the ad parameters does not cost the required ones', () => {
  arrivedWith(AD);
  expect(new URL(shopUrl(SHOP_BASE, 'B', '', 'protocol')).searchParams.get('storefront'))
    .toBe('true');
  expect(new URL(shopUrl(SHOP_BASE, 'B', '', 'subscribe')).searchParams.get('selling_plan'))
    .toBe(SUBSCRIBE_SELLING_PLAN_ID);
});

test('organic traffic falls back to the quiz own values, not to nothing', () => {
  const u = new URL(shopUrl(SHOP_BASE, 'B', 'weight', 'single'));
  expect(u.searchParams.get('utm_source')).toBe('quiz');
  expect(u.searchParams.get('utm_content')).toBe('offer_screen__B');
  expect(u.searchParams.get('utm_term')).toBe('weight');
  expect(u.searchParams.get('hf_outcome')).toBe('B');
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
  expect(optionFor('single').cta).toMatch(/one bottle/i);
  expect(valueStackFor('single')[0].what).toMatch(/one bottle/i);
  expect(optionFor('protocol').cta).toMatch(/two bottles/i);
  expect(valueStackFor('protocol')[0].what).toMatch(/two bottles/i);
});
