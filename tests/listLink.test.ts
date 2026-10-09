/* THE LINK FROM JJ'S OWN LIST.
 *
 * Two parameters that are independent on purpose, which is the thing most
 * likely to get quietly re-coupled by a later edit: skipping the email screen
 * must never come to depend on having a profile id, because skip_email=1 on
 * its own is how the whole path is tested without a real subscriber.
 */
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { captureListLink, readListLink } from '../src/lib/listLink';
import { createState, shouldSkip, nextId } from '../src/lib/logic';

const store = new Map<string, string>();

function visit(search: string) {
  const url = new URL(`https://example.com/quiz/symptoms${search}`);
  vi.stubGlobal('window', {
    location: { search: url.search, pathname: url.pathname, hash: '' },
    history: {
      state: null,
      replaceState: (_s: unknown, _t: string, next: string) => {
        const u = new URL(next, 'https://example.com');
        (window as unknown as { location: { search: string } }).location.search = u.search;
      },
    },
  });
}

beforeEach(() => {
  store.clear();
  vi.stubGlobal('sessionStorage', {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
  });
});
afterEach(() => vi.unstubAllGlobals());

describe('reading the link', () => {
  test('skip_email=1 skips, with no profile id anywhere near it', () => {
    visit('?skip_email=1');
    const link = captureListLink();
    expect(link.skipEmail).toBe(true);
    expect(link.profileId).toBeNull();
  });

  test('skip_email=1 and a profile id both survive', () => {
    visit('?skip_email=1&k_id=TfxMKk');
    expect(captureListLink()).toEqual({ skipEmail: true, profileId: 'TfxMKk' });
  });

  test('skip_email=true is accepted, anything else is not', () => {
    visit('?skip_email=true');
    expect(captureListLink().skipEmail).toBe(true);
    store.clear();
    visit('?skip_email=yes');
    expect(captureListLink().skipEmail).toBe(false);
  });

  test('no parameters means no skip, which is every ordinary visit', () => {
    visit('');
    expect(captureListLink()).toEqual({ skipEmail: false, profileId: null });
  });

  test('a profile id on its own changes nothing about the email screen', () => {
    visit('?k_id=TfxMKk');
    const link = captureListLink();
    expect(link.profileId).toBe('TfxMKk');
    expect(link.skipEmail, 'an id must not imply a skip').toBe(false);
  });

  test('a nonsense id is dropped rather than forwarded to Klaviyo', () => {
    visit('?skip_email=1&k_id=' + encodeURIComponent('<script>'));
    const link = captureListLink();
    expect(link.skipEmail, 'a bad id must not cost her the skip').toBe(true);
    expect(link.profileId).toBeNull();
  });
});

describe('what is left in the address bar', () => {
  test('both parameters are removed, and every utm_ is left alone', () => {
    visit('?utm_source=klaviyo&skip_email=1&utm_medium=email&k_id=TfxMKk&hf_presell=adv');
    captureListLink();
    const after = new URLSearchParams(window.location.search);
    expect(after.get('skip_email'), 'skip_email stayed in the URL').toBeNull();
    expect(after.get('k_id'), 'a profile id stayed in the URL').toBeNull();
    expect(after.get('utm_source')).toBe('klaviyo');
    expect(after.get('utm_medium')).toBe('email');
    expect(after.get('hf_presell')).toBe('adv');
  });

  test('a malformed id is stripped too, being just as much of a leak', () => {
    visit('?k_id=not%20a%20real%20id');
    captureListLink();
    expect(new URLSearchParams(window.location.search).get('k_id')).toBeNull();
  });
});

describe('across the session', () => {
  test('what was captured survives a page with no query at all', () => {
    visit('?skip_email=1&k_id=TfxMKk');
    captureListLink();
    visit('');
    expect(captureListLink()).toEqual({ skipEmail: true, profileId: 'TfxMKk' });
  });

  test('a second link cannot rename who she is', () => {
    visit('?skip_email=1&k_id=TfxMKk');
    captureListLink();
    visit('?k_id=SOMEONEELSE');
    expect(captureListLink().profileId).toBe('TfxMKk');
  });

  test('storage written by something else is not trusted', () => {
    store.set('hf_list_link', JSON.stringify({ skipEmail: true, profileId: '<script>' }));
    expect(readListLink()).toEqual({ skipEmail: true, profileId: null });
  });
});

describe('the quiz flow', () => {
  test('the email screen is skipped, and only when the flag is set', () => {
    const normal = createState();
    expect(shouldSkip(normal, 'gate')).toBe(false);
    expect(shouldSkip({ ...normal, skipEmail: true }, 'gate')).toBe(true);
  });

  test('the loader hands straight to the result, with no screen in between', () => {
    const S = {
      ...createState(), skipEmail: true,
      age: '45-49' as const, cycle: 'unpredictable' as const,
    };
    expect(nextId(S, 'load'), 'she should land on the result').not.toBe('gate');
  });

  test('skipping the email screen changes no other screen', () => {
    const S = createState();
    const skipped = { ...S, skipEmail: true };
    for (const id of ['q1', 'q2', 'q3', 'q4', 'q4b', 'q5', 'q6', 'q7', 'load', 'r1', 'r2', 'rDoc'] as const) {
      expect(shouldSkip(skipped, id), id).toBe(shouldSkip(S, id));
    }
  });
});

describe('the capture does not depend on the entry file', () => {
  /* THE BUG THIS GUARDS, 9 October 2026.
   *
   * captureListLink() was called only from src/main.tsx. That is the entry
   * for vite dev, vite build and every test here, so the feature was green
   * locally and dead in production: the deployed host builds this src/ behind
   * its own generated router and its own entry, and never loads index.html or
   * main.tsx at all. The deployed bundle carried readListLink and the
   * hf_list_link key, and contained the strings 'skip_email' and 'k_id' zero
   * times - the reader shipped, the capture did not.
   *
   * So importing the module every screen imports must be enough to capture
   * the session. If someone moves the bootstrap back into an entry file, this
   * fails.
   */
  test('importing analytics is enough to capture skip_email', async () => {
    visit('?skip_email=1&k_id=01GDDKASAP8TKDDA2GRZDSVP4H');
    expect(store.get('hf_list_link'), 'nothing captured yet').toBeUndefined();

    vi.resetModules();
    await import('../src/lib/analytics');

    expect(JSON.parse(store.get('hf_list_link') ?? 'null')).toEqual({
      skipEmail: true, profileId: '01GDDKASAP8TKDDA2GRZDSVP4H',
    });
  });

  test('and the quiz then steps over the gate on the strength of it', async () => {
    visit('?skip_email=1');
    vi.resetModules();
    await import('../src/lib/analytics');

    /* What QuizContext does on mount: read what the bootstrap captured. */
    const S = { ...createState(), skipEmail: readListLink().skipEmail };
    expect(S.skipEmail).toBe(true);
    expect(shouldSkip(S, 'gate')).toBe(true);
    expect(nextId(S, 'load')).not.toBe('gate');
  });
});
