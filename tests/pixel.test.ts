/* TWO PIXELS, AND THE ORDER THEY ARE SPOKEN TO IN.
 *
 * Jane's pixel (4065719966895182) was added alongside JJ's dataset
 * (1614860232058835) so both receive the quiz's events. fbq('track', ...)
 * delivers to every pixel initialised AT THE MOMENT OF THE CALL, which makes
 * initialisation order a correctness property rather than a detail: an event
 * sent before our init is simply not in our dataset, and nothing anywhere
 * reports an error.
 *
 * That is the bug this file exists to catch. initMeta was reached only from
 * App.tsx's effect, React runs effects child-first, and so a screen's own
 * effect fired the session's first ViewContent while only JJ's pixel was
 * listening.
 *
 * Everything is asserted against the fbq call log, in order, the way Meta
 * sees it.
 */
import { afterEach, describe, expect, test, vi } from 'vitest';

type Call = unknown[];
let calls: Call[];

const OURS = '4065719966895182';
const JJS = '1614860232058835';

/* Mocked so importing analytics does not try to reach PostHog. */
vi.mock('../src/lib/posthog', () => ({
  initPostHog: () => {},
  phCapture: () => {},
  phCaptureBeacon: () => {},
  phIdentify: () => {},
}));

const store = new Map<string, string>();

/** A script element the snippet can insert next to, as in a real document. */
function fakeDocument() {
  const first = { parentNode: { insertBefore: () => {} } };
  return {
    querySelector: () => null,
    createElement: () => ({} as unknown),
    getElementsByTagName: () => [first],
  };
}

/**
 * A fresh module graph per test. window.__hfMeta makes initMeta idempotent
 * for the life of a page, so every scenario needs its own page.
 *
 * @param hostPixel whether a pixel is already on the page, as in production.
 */
async function load(hostPixel: boolean) {
  vi.resetModules();
  calls = [];
  store.clear();

  const win: Record<string, unknown> = {
    location: { search: '', pathname: '/', hash: '', href: 'https://x.test/' },
    history: { state: null, replaceState: () => {} },
  };
  /* The host's own fbq: a function, already there before our code runs. */
  if (hostPixel) win.fbq = (...args: unknown[]) => void calls.push(args);

  vi.stubGlobal('window', win);
  vi.stubGlobal('document', fakeDocument());
  vi.stubGlobal('sessionStorage', {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
  });

  /* NO RECORDER IN THE NO-HOST CASE, deliberately. initMeta decides which
     branch to take by asking whether window.fbq is already a function, so a
     recorder installed up front would itself look like the host pixel and
     the branch under test would never run. Meta's snippet installs its own
     queueing stub instead, and snippetQueue() below reads that. */
  return await import('../src/lib/analytics');
}

/**
 * The call log Meta's own snippet keeps when fbevents.js has not loaded —
 * which it never does here. Its stub pushes each call onto n.queue.
 */
function snippetQueue(): Call[] {
  const w = (globalThis as unknown as { window: { fbq?: { queue?: Call[] } } }).window;
  return w.fbq?.queue ?? [];
}

/** Every call of one fbq verb, e.g. inits('init') -> the pixel ids. */
const idsFor = (verb: string) =>
  calls.filter((c) => c[0] === verb).map((c) => String(c[1]));

/** Where a call sits in the log, or -1. */
const at = (pred: (c: Call) => boolean) => calls.findIndex(pred);

afterEach(() => vi.unstubAllGlobals());

describe('the second pixel', () => {
  test('ours is initialised, and exactly once', async () => {
    const a = await load(true);
    a.initMeta();
    a.initMeta();
    a.track.landingView('');
    a.track.offerView('peri');

    expect(idsFor('init').filter((id) => id === OURS)).toEqual([OURS]);
  });

  test('ITS INIT COMES BEFORE THE FIRST EVENT, in the order React runs effects', async () => {
    const a = await load(true);

    /* The production sequence, and the regression: the screen's effect
       (a child) fires before App's effect (the parent) reaches initMeta. */
    a.track.landingView('');
    a.initMeta();

    const ourInit = at((c) => c[0] === 'init' && c[1] === OURS);
    const firstEvent = at((c) => c[0] === 'track' || c[0] === 'trackCustom');

    expect(ourInit, 'our pixel was never initialised').toBeGreaterThanOrEqual(0);
    expect(firstEvent, 'no event was sent').toBeGreaterThanOrEqual(0);
    expect(ourInit, 'an event left before our pixel existed').toBeLessThan(firstEvent);
  });

  test('whichever screen is the entry point, the same holds', async () => {
    /* She can land on any of these first - a shared result link, an ad
       straight to the offer - and each one is some screen's first effect. */
    for (const entry of ['landingView', 'resultView', 'offerView', 'planView'] as const) {
      const a = await load(true);
      a.track[entry]('peri');

      const ourInit = at((c) => c[0] === 'init' && c[1] === OURS);
      const firstEvent = at((c) => c[0] === 'track' || c[0] === 'trackCustom');
      expect(ourInit, `${entry}: not initialised`).toBeGreaterThanOrEqual(0);
      expect(ourInit, `${entry}: event left too early`).toBeLessThan(firstEvent);
    }
  });

  test('a shared event reaches both pixels, so neither is addressed by id', async () => {
    const a = await load(true);
    a.initMeta();
    a.track.offerView('peri');
    a.track.checkout('peri', 45, 'single', 'offer');

    /* trackSingle names one pixel. Used for anything but the PageView it
       would mean the other dataset silently loses that event. */
    const single = calls.filter((c) => c[0] === 'trackSingle');
    expect(single.map((c) => c[2])).toEqual(['PageView']);
    expect(single.map((c) => c[1])).toEqual([OURS]);
  });
});

describe("JJ's pixel is left exactly as it was", () => {
  test('with a host pixel present: not re-initialised, and no second PageView', async () => {
    const a = await load(true);
    a.initMeta();

    /* The host's snippet already fired its own PageView. A shared
       track('PageView') here would be a second count of the same view. */
    expect(idsFor('init')).toEqual([OURS]);
    expect(calls.filter((c) => c[0] === 'track' && c[1] === 'PageView')).toEqual([]);
  });

  test('with no pixel on the page: the dataset is installed before ours', async () => {
    const a = await load(false);
    a.initMeta();
    calls = snippetQueue();

    const ids = idsFor('init');
    expect(ids).toEqual([JJS, OURS]);
    /* And its PageView is the shared one, fired once. */
    expect(calls.filter((c) => c[0] === 'track' && c[1] === 'PageView')).toHaveLength(1);
  });
});

describe('what must never be fired', () => {
  test('no Purchase, from any screen', async () => {
    /* Shopify owns the order and reports it through the same dataset and its
       Conversions API. A Purchase from this side is a sale counted twice. */
    const a = await load(true);
    a.initMeta();
    a.track.landingView('');
    a.track.quizStart('');
    a.track.quizComplete('peri');
    a.track.lead('peri', 'her@example.test');
    a.track.resultView('peri');
    a.track.offerView('peri');
    a.track.selectOption('single', 45);
    a.track.checkout('peri', 45, 'single', 'offer');

    expect(calls.map((c) => String(c[1]))).not.toContain('Purchase');
  });

  test('no health answer is handed to Meta as a parameter', async () => {
    const a = await load(true);
    a.initMeta();
    a.track.quizComplete('peri');
    a.track.offerView('peri');

    /* The outcome slug is the one profile word that travels, as
       content_category. Symptom and answer text may not. */
    const banned = /hot flash|night sweat|bloat|insomnia|libido|anxiet|weight|menopaus|perimenopaus/i;
    for (const c of calls) {
      const props = c[2];
      if (!props || typeof props !== 'object') continue;
      for (const [k, v] of Object.entries(props as Record<string, unknown>)) {
        if (k === 'content_category') continue;
        expect(String(v), `${String(c[1])}.${k}`).not.toMatch(banned);
      }
    }
  });
});
