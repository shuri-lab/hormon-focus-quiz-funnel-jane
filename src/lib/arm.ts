/* THE OFFER SWITCH. 11 November 2026.
 *
 * One quiz, three offers. Each visitor is put in one "arm" at random, among
 * the offers that are switched on, and keeps it: the arm is stored in
 * localStorage (so a refresh or a return visit keeps it) and sessionStorage
 * (so a browser that blocks one still keeps it for the visit).
 *
 *  - kit74     the Kit at its live price, $74.99 with free shipping
 *              (HF60FREESHIP on the two-bottle variant)
 *  - bottle25  one bottle at 25% off, $37.50 with HORMONE25OFF
 *  - kit47     David's Kit at $47 (KIT47), approved by TJ and JJ 12 Nov.
 *
 * TO CHANGE THE TEST, change ACTIVE_OFFERS and nothing else.
 *   Live now:             ['bottle25']
 *   Start the A/B test:   ['kit74', 'bottle25']
 *   After $47 approval:   ['kit47', 'bottle25']
 *
 * The arm rides on every cart link as attributes[hf_offer] and on every
 * analytics event as hf_offer, so each order and each event says which
 * offer she saw.
 */
import { REVIEW } from '../review/flag';

export type OfferArm = 'kit74' | 'bottle25' | 'kit47';

export const ALL_OFFERS: readonly OfferArm[] = ['kit74', 'bottle25', 'kit47'];

/** The offers the quiz splits between, evenly. One offer means no split:
 * every visitor gets it. 12 Nov: TJ and JJ approved David's $47 Kit, so the
 * quiz splits evenly between the $47 Kit and one bottle at 25% off. The $47
 * arm needs the KIT47 code live in Shopify (Kit $74.99 -> $47.00). */
export const ACTIVE_OFFERS: readonly OfferArm[] = ['kit47', 'bottle25'];

export const ARM_KEY = 'hf_offer_arm';

const isArm = (v: unknown): v is OfferArm =>
  typeof v === 'string' && (ALL_OFFERS as readonly string[]).includes(v);

/** An even random pick among the active offers. */
export function pickArm(
  active: readonly OfferArm[] = ACTIVE_OFFERS,
  rand: () => number = Math.random,
): OfferArm {
  const i = Math.min(active.length - 1, Math.floor(rand() * active.length));
  return active[Math.max(0, i)];
}

type Store = Pick<Storage, 'getItem' | 'setItem'>;
const stores = (): Store[] => {
  const out: Store[] = [];
  for (const name of ['localStorage', 'sessionStorage'] as const) {
    try {
      const s = (globalThis as Record<string, unknown>)[name] as Store | undefined;
      if (s) out.push(s);
    } catch { /* blocked storage */ }
  }
  return out;
};

function readStored(active: readonly OfferArm[]): OfferArm | null {
  for (const s of stores()) {
    try {
      const v = s.getItem(ARM_KEY);
      /* A stored arm that has since been switched off is not kept, except
         in the review build, where a reviewer may force any arm. */
      if (isArm(v) && (REVIEW || active.includes(v))) return v;
    } catch { /* ignore */ }
  }
  return null;
}

function save(arm: OfferArm): void {
  for (const s of stores()) {
    try { s.setItem(ARM_KEY, arm); } catch { /* ignore */ }
  }
}

let current: OfferArm | null = null;
/* Set only by forceArm (the review picker, and tests). */
let forced = false;
const listeners = new Set<() => void>();

/** Her arm: the one she already has, or a new even pick, saved. */
export function getArm(
  active: readonly OfferArm[] = ACTIVE_OFFERS,
  rand: () => number = Math.random,
): OfferArm {
  if (current && (forced || REVIEW || active.includes(current))) return current;
  current = readStored(active) ?? pickArm(active, rand);
  save(current);
  return current;
}

/** The review build's picker: show this arm. Never called by a normal build. */
export function forceArm(arm: OfferArm): void {
  current = arm;
  forced = true;
  save(arm);
  listeners.forEach((f) => f());
}

export function subscribeArm(f: () => void): () => void {
  listeners.add(f);
  return () => { listeners.delete(f); };
}

/** Tests only: forget the in-memory arm. */
export function resetArmForTests(): void {
  current = null;
  forced = false;
}
