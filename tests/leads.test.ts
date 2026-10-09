/* THE ONE CALL THAT LEAVES THE BROWSER.
 *
 * Everything else in this funnel is a page. This is the only place an address
 * she typed reaches somebody else's server, so the two refusals matter more
 * than the happy path: no ticked box, no request; doctor route, no request.
 *
 * Nothing here touches the network. fetch is mocked, and no test may ever be
 * written in this file that reaches Klaviyo for real.
 */
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import {
  KLAVIYO_LIST_ID, KLAVIYO_METRIC, KLAVIYO_PUBLIC_KEY, KLAVIYO_SOURCE, submitLead, subscriptionBody,
} from '../src/lib/leads';
import { createState, type QuizState } from '../src/lib/logic';

const EVENTS_URL = `https://a.klaviyo.com/client/events/?company_id=${KLAVIYO_PUBLIC_KEY}`;

/** A finished quiz: all seven answers, consent given. */
function finished(over: Partial<QuizState> = {}): QuizState {
  return {
    ...createState(),
    sym: ['sweats', 'sleep'],
    main: 'sleep',
    age: '45-49',
    cycle: 'stopped',
    twelve: 'no',
    pattern: 'weekly',
    tried: ['food', 'gym'],
    want: 'sleep',
    name: '  Renee  ',
    email: '  renee@example.com  ',
    consent: true,
    ...over,
  };
}

/** sessionStorage as analytics.ts expects to find it, carrying the ad params. */
function session(attribution: Record<string, string> = {}) {
  const store = new Map<string, string>();
  if (Object.keys(attribution).length) {
    store.set('hf_attribution', JSON.stringify(attribution));
  }
  return {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => { store.set(k, v); },
    removeItem: (k: string) => { store.delete(k); },
    clear: () => store.clear(),
    key: () => null,
    length: store.size,
  };
}

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 202 });
  vi.stubGlobal('fetch', fetchMock);
  vi.stubGlobal('sessionStorage', session());
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

/** The body of the one request that was made. */
function sentBody() {
  expect(fetchMock, 'exactly one request').toHaveBeenCalledTimes(1);
  const [, init] = fetchMock.mock.calls[0];
  return JSON.parse(init.body).data.attributes;
}

/* ------------------------------------------------------- the refusals -- */

test('an unticked box sends nothing at all', async () => {
  const result = await submitLead(finished({ consent: false }), 'B', 'night-sweats');

  expect(fetchMock, 'no consent, no request').not.toHaveBeenCalled();
  expect(result).toEqual({ ok: false, delivered: false });
});

test('the doctor route never reaches Klaviyo', async () => {
  /* She is told to see somebody. She is shown no offer and no price, and she
     does not enter a flow that goes on to sell her a supplement. */
  const result = await submitLead(finished(), 'D', '');

  expect(fetchMock, 'outcome D must send nothing').not.toHaveBeenCalled();
  expect(result).toEqual({ ok: true, delivered: false });
});

/* ------------------------------------------------------ the happy path -- */

test('a completed quiz posts one event Klaviyo can trigger on', async () => {
  vi.stubGlobal('sessionStorage', session({
    utm_source: 'facebook',
    utm_campaign: 'hf_sept',
    /* utm_medium and utm_content were never set by the ad. */
  }));

  /* null: this test is about the event, so the subscription call is left
     out rather than counted around. */
  const result = await submitLead(finished(), 'B', 'night-sweats', null);

  expect(result).toEqual({ ok: true, delivered: true });
  expect(fetchMock).toHaveBeenCalledTimes(1);

  const [url, init] = fetchMock.mock.calls[0];
  expect(url).toBe(EVENTS_URL);
  expect(url).toContain('company_id=TSTCui');
  expect(init.method).toBe('POST');
  expect(init.headers.revision).toBe('2024-10-15');
  expect(init.headers['Content-Type']).toBe('application/json');
  expect(init.keepalive, 'must survive the navigation to her result').toBe(true);

  const attrs = sentBody();

  /* The metric name is what the flow triggers on. If this assertion ever has
     to change, the flow in Klaviyo has to change in the same hour. */
  expect(attrs.metric.data.attributes.name).toBe(KLAVIYO_METRIC);
  expect(attrs.metric.data.attributes.name).toBe('HF Quiz Completed');

  expect(attrs.profile.data.attributes.email).toBe('renee@example.com');
  expect(attrs.profile.data.attributes.first_name).toBe('Renee');

  expect(attrs.properties.outcome).toBe('perimenopause');
  expect(attrs.properties.outcome_code).toBe('B');
  expect(attrs.properties.result_route).toBe('perimenopause');
  expect(attrs.properties.quiz).toBe('hf-v3');
  expect(attrs.properties.angle).toBe('night-sweats');
  expect(attrs.properties.signs).toBe(2);

  /* Every answer the rebuild brief asks to be stored, under its own name. */
  expect(attrs.properties.selected_symptoms).toEqual(['sweats', 'sleep']);
  expect(attrs.properties.primary_symptom).toBe('sleep');
  expect(attrs.properties.main_concern).toBe('sleep');
  expect(attrs.properties.age_band).toBe('45-49');
  expect(attrs.properties.cycle_status).toBe('stopped');
  expect(attrs.properties.cycle_12_month_status).toBe('no');
  expect(attrs.properties.symptom_pattern).toBe('weekly');
  expect(attrs.properties.tried_actions).toEqual(['food', 'gym']);
  expect(attrs.properties.desired_outcome).toBe('sleep');
  expect(attrs.properties.consent_at).toMatch(/^\d{4}-\d{2}-\d{2}T[\d:.]+Z$/);
});

test('the ad parameters it has are carried, and the ones it lacks are absent', async () => {
  vi.stubGlobal('sessionStorage', session({
    utm_source: 'facebook',
    utm_campaign: 'hf_sept',
  }));

  await submitLead(finished(), 'A', '', null);
  const props = sentBody().properties;

  expect(props.utm_source).toBe('facebook');
  expect(props.utm_campaign).toBe('hf_sept');

  /* Omitted, not blank. An absent utm_medium and an empty one mean different
     things in a report, and only one of them is true. */
  expect('utm_medium' in props, 'an unset parameter must not be sent empty').toBe(false);
  expect('utm_content' in props).toBe(false);
});

test('the twelve-month answer is sent only when it was asked', async () => {
  await submitLead(finished({ cycle: 'unpredictable', twelve: '' }), 'B', '', null);
  const props = sentBody().properties;
  expect(props.cycle_status).toBe('unpredictable');
  expect('cycle_12_month_status' in props).toBe(false);
});

test('each outcome is named in the long form a person can read', async () => {
  const cases: [Parameters<typeof submitLead>[1], string][] = [
    ['A', 'hormonal-imbalance'],
    ['B', 'perimenopause'],
    ['C', 'menopause'],
    ['E', 'early-menopause'],
  ];

  for (const [code, name] of cases) {
    fetchMock.mockClear();
    await submitLead(finished(), code, '', null);
    const props = sentBody().properties;
    expect(props.outcome, code).toBe(name);
    expect(props.outcome_code, code).toBe(code);
  }
});

/* ------------------------------------------------- when it goes wrong -- */

test('a network error still lets her through to her result', async () => {
  fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

  const result = await submitLead(finished(), 'B', 'night-sweats');

  expect(result).toEqual({ ok: true, delivered: false });
});

test('a refusal from Klaviyo is recorded, not thrown', async () => {
  fetchMock.mockResolvedValue({ ok: false, status: 400 });

  const result = await submitLead(finished(), 'B', 'night-sweats');

  /* ok is about her, not about them: she was not blocked. delivered is about
     them, and it is false. */
  expect(result).toEqual({ ok: true, delivered: false });
});

/* ------------------------------------------------- the subscription -- */

const SUBS_URL = `https://a.klaviyo.com/client/subscriptions/?company_id=${KLAVIYO_PUBLIC_KEY}`;

test('the configured list is the one she is subscribed to', async () => {
  /* Until 8 October this was null, and the comment here asked whoever set it
     to update this test. The quiz was creating her profile and firing the
     event but recording consent nowhere, so Klaviyo skipped her as "not
     subscribed" and the flow never reached her. */
  expect(KLAVIYO_LIST_ID, 'the list id is no longer configured').toBe('TfxMKk');

  await submitLead(finished(), 'B', '');
  expect(fetchMock, 'the event and the subscription').toHaveBeenCalledTimes(2);

  const [url, init] = fetchMock.mock.calls[1];
  expect(String(url)).toContain('/client/subscriptions/');
  const body = JSON.parse(String(init?.body));
  const listId = body?.data?.relationships?.list?.data?.id
    ?? body?.data?.attributes?.list_id;
  expect(listId, 'she was subscribed to a different list').toBe(KLAVIYO_LIST_ID);
});

test('passing null still sends the event alone, which is what a test wants', async () => {
  await submitLead(finished(), 'B', '', null);
  expect(fetchMock).toHaveBeenCalledTimes(1);
});

test('with a list, her consent is recorded on it after the event', async () => {
  await submitLead(finished(), 'C', 'sleep', 'AbC123');

  expect(fetchMock).toHaveBeenCalledTimes(2);
  const [url, init] = fetchMock.mock.calls[1];
  expect(url).toBe(SUBS_URL);
  expect(init.method).toBe('POST');
  expect(init.headers.revision).toBe('2024-10-15');
  expect(JSON.parse(init.body)).toEqual(subscriptionBody('renee@example.com', 'AbC123'));

  const sub = JSON.parse(init.body).data;
  expect(sub.type).toBe('subscription');
  expect(sub.relationships.list.data).toEqual({ type: 'list', id: 'AbC123' });
  expect(sub.attributes.custom_source).toBe(KLAVIYO_SOURCE);
  expect(sub.attributes.profile.data.attributes.email).toBe('renee@example.com');
  /* THE FIELD MUST NOT BE THERE. This endpoint answers a profile carrying
     `subscriptions` with 400 "'subscriptions' is not a valid field for the
     resource 'profile'" before it even reads the list, so sending it meant
     nobody was ever subscribed. Asking this endpoint is itself the consent.
     Checked against the live API on revision 2024-10-15. */
  expect(sub.attributes.profile.data.attributes).toEqual({ email: 'renee@example.com' });
  expect(sub.attributes.profile.data.attributes.subscriptions, 'the live API rejects this field').toBeUndefined();
});

test('no box ticked, or the doctor route: no subscription either', async () => {
  await submitLead(finished({ consent: false }), 'B', '', 'AbC123');
  await submitLead(finished(), 'D', '', 'AbC123');
  expect(fetchMock).not.toHaveBeenCalled();
});

test('a failed subscription never blocks her result', async () => {
  fetchMock
    .mockResolvedValueOnce({ ok: true, status: 202 })
    .mockRejectedValueOnce(new TypeError('Failed to fetch'));
  const result = await submitLead(finished(), 'B', '', 'AbC123');
  expect(result).toEqual({ ok: true, delivered: true });
});
