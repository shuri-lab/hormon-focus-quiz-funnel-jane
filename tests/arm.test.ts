import { beforeEach, expect, test } from 'vitest';
import {
  ACTIVE_OFFERS, ARM_KEY, forceArm, getArm, pickArm, resetArmForTests, type OfferArm,
} from '../src/lib/arm';
import { shopUrl } from '../src/lib/analytics';
import { SHOP_BASE, createState, type QuizState } from '../src/lib/logic';
import { kitCode, kitToday } from '../src/lib/offer';
import { PLAN_BOTTLE_CTA, PLAN_BOTTLE_HEAD, PLAN_BOTTLE_TURN } from '../src/lib/resultCopy';

/* A tiny in-memory storage, since the tests run in node. */
function memStore() {
  const m = new Map<string, string>();
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => { m.set(k, v); }, m };
}
let local: ReturnType<typeof memStore>;
let session: ReturnType<typeof memStore>;
beforeEach(() => {
  local = memStore(); session = memStore();
  (globalThis as Record<string, unknown>).localStorage = local;
  (globalThis as Record<string, unknown>).sessionStorage = session;
  resetArmForTests();
});

test('this branch: one active offer, the $47 Kit, and everyone gets it', () => {
  expect(ACTIVE_OFFERS).toEqual(['kit47']);
  for (const r of [0, 0.3, 0.6, 0.9999]) expect(pickArm(['kit47'], () => r)).toBe('kit47');
  expect(getArm()).toBe('kit47');
});

test('after KIT47 is live: the $47 Kit and the 25% bottle split evenly', () => {
  const next: OfferArm[] = ['kit47', 'bottle25'];
  expect(pickArm(next, () => 0.2)).toBe('kit47');
  expect(pickArm(next, () => 0.7)).toBe('bottle25');
});

test('with two active offers the split is even, half and half', () => {
  const both: OfferArm[] = ['kit74', 'bottle25'];
  expect(pickArm(both, () => 0)).toBe('kit74');
  expect(pickArm(both, () => 0.49)).toBe('kit74');
  expect(pickArm(both, () => 0.5)).toBe('bottle25');
  expect(pickArm(both, () => 0.9999)).toBe('bottle25');
  let kit = 0;
  for (let i = 0; i < 1000; i++) if (pickArm(both, () => i / 1000) === 'kit74') kit++;
  expect(kit).toBe(500);
});

test('her arm is kept: saved to both storages and read back after a refresh', () => {
  const both: OfferArm[] = ['kit74', 'bottle25'];
  const first = getArm(both, () => 0.9);
  expect(first).toBe('bottle25');
  expect(local.m.get(ARM_KEY)).toBe('bottle25');
  expect(session.m.get(ARM_KEY)).toBe('bottle25');
  resetArmForTests(); // a refresh: memory gone, storage kept
  expect(getArm(both, () => 0)).toBe('bottle25');
  resetArmForTests(); local.m.clear(); // localStorage blocked or cleared
  expect(getArm(both, () => 0)).toBe('bottle25');
});

test('an arm that has been switched off is not kept', () => {
  local.m.set(ARM_KEY, 'kit47');
  expect(getArm(['kit74', 'bottle25'], () => 0)).toBe('kit74');
});

test('every cart link carries her arm as a cart attribute', () => {
  for (const arm of ['kit74', 'bottle25', 'kit47'] as OfferArm[]) {
    forceArm(arm);
    for (const kind of ['single', 'protocol'] as const) {
      const u = new URL(shopUrl(SHOP_BASE, 'B', '', kind));
      expect(u.searchParams.get('attributes[hf_offer]'), `${arm}/${kind}`).toBe(arm);
      expect(u.searchParams.get('storefront')).toBeNull();
    }
  }
});

test('the Kit price and code follow the arm: $74.99 with free shipping, or $47 with KIT47', () => {
  forceArm('kit74');
  expect(kitToday()).toBe(74.99);
  expect(kitCode()).toBe('HF60FREESHIP');
  expect(new URL(shopUrl(SHOP_BASE, 'B', '', 'protocol', kitCode())).searchParams.get('discount')).toBe('HF60FREESHIP');
  forceArm('kit47');
  expect(kitToday()).toBe(47);
  expect(kitCode()).toBe('KIT47');
});

test('the plan ending per arm: the one-bottle arm ends on Hormone Focus', () => {
  expect(PLAN_BOTTLE_HEAD).toBe('Start your plan with Hormone Focus.');
  expect(PLAN_BOTTLE_TURN).toBe('It does step 3 for you. Two capsules a day with a meal give your body steady support while your hormones change.');
  expect(PLAN_BOTTLE_CTA).toBe('Start my plan with Hormone Focus');
  const S: QuizState = createState();
  expect(S).toBeTruthy();
});
