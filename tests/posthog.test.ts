/* THE EVENT NAMES ARE A CONTRACT WITH A DASHBOARD.
 *
 * The "Hormone Focus: Quiz Funnel" dashboard and the "Quiz funnel: start to
 * purchase" insight in PostHog project 667442 are saved against these exact
 * hf_ strings. Renaming one does not break a build or a report column: it
 * silently empties a saved insight that somebody is reading as the answer to
 * whether the funnel works. So the names are asserted here, by hand, rather
 * than read back out of the module that produces them.
 */
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

const sent: Array<{ event: string; props: Record<string, unknown>; beacon: boolean }> = [];
const identified: Array<{ id: string; props: Record<string, unknown> }> = [];

/* phCaptureBeacon is mocked alongside phCapture and NOT folded into it: which
   of the two an event goes through is the thing the test below is about, and
   a mock that answered both the same way could not see the difference. */
vi.mock('../src/lib/posthog', () => ({
  initPostHog: () => {},
  phCapture: (event: string, props: Record<string, unknown> = {}) =>
    void sent.push({ event, props, beacon: false }),
  phCaptureBeacon: (event: string, props: Record<string, unknown> = {}) =>
    void sent.push({ event, props, beacon: true }),
  phIdentify: (id: string, props: Record<string, unknown> = {}) =>
    void identified.push({ id, props }),
}));

const store = new Map<string, string>();

beforeEach(() => {
  sent.length = 0;
  identified.length = 0;
  store.clear();
  vi.stubGlobal('window', {
    location: { search: '', pathname: '/quiz/symptoms', hash: '', href: 'https://x.test/quiz/symptoms' },
    history: { state: null, replaceState: () => {} },
  });
  vi.stubGlobal('sessionStorage', {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
  });
});
afterEach(() => vi.unstubAllGlobals());

const names = () => sent.map((e) => e.event);
const propsOf = (event: string) => sent.find((e) => e.event === event)?.props ?? {};

describe('the funnel speaks the names the dashboard listens for', () => {
  test('every step of the walk, in order', async () => {
    const { track } = await import('../src/lib/analytics');

    track.landingView('bloating');
    track.quizStart('bloating');
    track.quizStep('q3', 3, 7);
    track.quizComplete('perimenopause');
    track.lead('perimenopause', 'Jane@Example.com ');
    track.resultView('perimenopause');
    track.offerView('perimenopause');
    track.checkout('perimenopause', 74.99, 'protocol', 'kit-main');

    expect(names()).toEqual([
      'hf_landing_viewed',
      'hf_quiz_started',
      'hf_quiz_question_answered',
      'hf_quiz_completed',
      'hf_lead_captured',
      'hf_result_viewed',
      'hf_offer_viewed',
      'hf_cta_clicked',
    ]);
  });

  test('the segment rides from completion to the offer', async () => {
    const { track } = await import('../src/lib/analytics');

    track.quizComplete('menopause');
    track.resultView('menopause');
    track.offerView('menopause');

    expect(propsOf('hf_quiz_completed').quiz_segment).toBe('menopause');
    expect(propsOf('hf_result_viewed').quiz_segment).toBe('menopause');
    expect(propsOf('hf_offer_viewed').offer_variant).toBe('menopause');
  });
});

describe('the address is the distinct id, and nothing else', () => {
  test('identified once, trimmed and lower-cased', async () => {
    const { track } = await import('../src/lib/analytics');

    track.lead('perimenopause', '  Jane@Example.COM ');

    expect(identified).toEqual([
      { id: 'jane@example.com', props: { quiz_segment: 'perimenopause' } },
    ]);
  });

  /* The gate used to call track.lead with no address at all. A build that
     loses the argument again must not start identifying people as ''. */
  test('no address, no person', async () => {
    const { track } = await import('../src/lib/analytics');

    track.lead('perimenopause');

    expect(identified).toEqual([]);
    expect(names()).toEqual(['hf_lead_captured']);
  });

  /* Her address is for PostHog's person record. It is not an event property,
     because an event property is what ends up in an export anyone can read. */
  test('the address never becomes an event property', async () => {
    const { track } = await import('../src/lib/analytics');

    track.lead('perimenopause', 'jane@example.com');

    expect(JSON.stringify(propsOf('hf_lead_captured'))).not.toContain('jane');
  });
});

describe('what the click out to Shopify says it is selling', () => {
  test('three offers, three honest labels', async () => {
    const { track } = await import('../src/lib/analytics');

    track.checkout('menopause', 74.99, 'protocol', 'kit-main');
    track.checkout('menopause', 39.99, 'subscribe', 'kit-bottle');
    track.checkout('menopause', 49.99, 'single', 'kit-bottle');

    expect(sent.map((e) => e.props.offer_type)).toEqual(['kit', 'subscription', 'single']);
    expect(sent.map((e) => e.props.price)).toEqual([74.99, 39.99, 49.99]);
  });

  test('the button that was pressed is named, so a dead one is findable', async () => {
    const { track } = await import('../src/lib/analytics');

    track.checkout('menopause', 74.99, 'protocol', 'quiz-kit-close');

    expect(propsOf('hf_cta_clicked').cta_location).toBe('quiz-kit-close');
  });
});

describe('the event fired on the way out of the page', () => {
  /* THE ONE EVENT THAT IS NOT FOLLOWED BY HER STAYING HERE. The three buy
     links navigate to Shopify on the same tab, so the click handler runs and
     the page is gone. posthog-js 1.438.12 does drain its queue through
     sendBeacon on pagehide, events first, which normally carries it; this
     does not need pagehide to fire at all, which an Android webview handing
     the tab to another origin is the worst case for. */
  test('hf_cta_clicked is beaconed, and nothing else is', async () => {
    const { track } = await import('../src/lib/analytics');
    sent.length = 0;

    track.resultView('B');
    track.offerView('B');
    track.selectOption('subscribe', 39.99);
    track.checkout('B', 74.99, 'protocol', 'kit-main');
    track.doctorRoute('young');

    const beaconed = sent.filter((e) => e.beacon).map((e) => e.event);
    expect(beaconed, 'exactly the click-out, by name').toEqual(['hf_cta_clicked']);

    /* And every other event stays on the ordinary queue, which is what lets
       posthog-js batch them and beacon the backlog on pagehide. Sending each
       one alone would leave it nothing to drain. */
    for (const e of sent.filter((x) => x.event !== 'hf_cta_clicked')) {
      expect(e.beacon, `${e.event} does not need a beacon`).toBe(false);
    }
  });

  test('beaconing changed what carries it, not what it says', async () => {
    const { track } = await import('../src/lib/analytics');
    sent.length = 0;
    track.checkout('C', 39.99, 'subscribe', 'kit-bottle');

    const e = sent.find((x) => x.event === 'hf_cta_clicked');
    expect(e, 'the event still fires').toBeTruthy();
    expect(e!.props).toMatchObject({
      offer_type: 'subscription',
      plan: 'subscribe',
      price: 39.99,
      currency: 'USD',
      cta_location: 'kit-bottle',
      quiz_segment: 'C',
    });
  });
});
