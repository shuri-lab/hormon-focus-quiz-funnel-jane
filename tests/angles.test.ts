/* THIS REPOSITORY IS PUBLIC.
 *
 * Every string in `src/lib/angles.ts` is shipped to the browser and readable
 * by anyone who opens the bundle. The file used to carry a `note` field per
 * route holding our own ad-performance commentary — quality scores, sample
 * sizes, which creative themes were scoring worst. Nothing rendered it, so
 * nothing caught it.
 *
 * These tests are the thing that catches it next time. One fails if a new
 * field appears at all; the other fails if the commentary is pasted into a
 * field that already exists.
 */
import { test, expect } from 'vitest';
import { ANGLES, type Angle, type AngleOffer } from '../src/lib/angles';

/** Exactly the fields a route may carry. Adding one is a deliberate act. */
const ALLOWED_KEYS: (keyof Angle)[] = [
  'slug', 'preselect', 'label', 'chip1',
  'h1a', 'h1b', 'paren', 'lines', 'closer', 'description',
  /* Added with the offer pages. The route's hero at /offer/<slug>. */
  'offer',
];

/** And exactly the fields the offer block may carry. */
const ALLOWED_OFFER_KEYS: (keyof AngleOffer)[] = [
  'h1a', 'h1b', 'h1c', 'sub', 'close', 'title', 'description',
];

test('no route carries a field beyond the allowed set', () => {
  for (const a of ANGLES) {
    const keys = Object.keys(a).sort();
    const allowed = [...ALLOWED_KEYS].filter((k) => k !== 'offer' || a.offer).sort();
    expect(keys, `/${a.slug || ''} carries an unexpected field`).toEqual(allowed);

    if (!a.offer) continue;
    const offerKeys = Object.keys(a.offer).sort();
    for (const k of offerKeys) {
      expect(
        (ALLOWED_OFFER_KEYS as string[]).includes(k),
        `/${a.slug || ''} offer block carries an unexpected field: ${k}`,
      ).toBe(true);
    }
  }
});

/* The shapes internal commentary takes. These caught the real `note` values:
   "85.2 Quality Score, largest confirmed sample at n=12",
   "37% of 114 customer reviews",
   "our most-published, second-worst-scoring theme". */
const INTERNAL = [
  /quality score/i,
  /\bn\s*=\s*\d/i,
  /\bsample\b/i,
  /\bscoring\b/i,
  /\bCPA\b|\bROAS\b|\bCTR\b|\bCPM\b/i,
  /\b\d+(\.\d+)?%/,           // a bare percentage is a metric, not ad copy
  /\bimpressions?\b|\bspend\b|\bconversion rate\b/i,
];

/** Flattens a route to [field path, string] pairs, offer block included. */
function routeStrings(value: unknown, path: string, out: [string, string][] = []) {
  if (typeof value === 'string') { out.push([path, value]); return out; }
  if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      routeStrings(v, path === '' ? k : `${path}.${k}`, out);
    }
  }
  return out;
}

test('no route string reads as internal commentary', () => {
  for (const a of ANGLES) {
    for (const [field, value] of routeStrings(a, '')) {
      const strings = [value];
      for (const v of strings) {
        if (typeof v !== 'string') continue;
        for (const pattern of INTERNAL) {
          expect(
            pattern.test(v),
            `/${a.slug || ''} field "${field}" reads as internal data, and this repo is public: ${JSON.stringify(v)}`,
          ).toBe(false);
        }
      }
    }
  }
});

test('every route still carries the copy it needs to render', () => {
  const slugs = ANGLES.map((a) => a.slug);
  expect(new Set(slugs).size, 'slugs must be unique').toBe(slugs.length);
  for (const a of ANGLES) {
    expect(a.h1a.length, `/${a.slug || ''} headline`).toBeGreaterThan(0);
    expect(a.h1b.length, `/${a.slug || ''} headline`).toBeGreaterThan(0);
    expect(a.paren.length, `/${a.slug || ''} sub-line`).toBeGreaterThan(0);
    expect(a.closer.length, `/${a.slug || ''} closer`).toBeGreaterThan(0);
    expect(a.description.length, `/${a.slug || ''} meta description`).toBeGreaterThan(0);
    expect(a.lines.length, `/${a.slug || ''} recognition lines`).toBeGreaterThan(0);
  }
});

test('only /weight may carry the 5M lbs figure', () => {
  for (const a of ANGLES) {
    if (a.slug === 'weight') continue;
    expect(a.chip1, `/${a.slug || ''} must not carry a weight-loss figure`).not.toMatch(/5M|lbs/i);
  }
});
