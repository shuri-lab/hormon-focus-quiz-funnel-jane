/* THE EMAIL THAT ARRIVES IN A LINK.
 *
 * The 13 October email carries her identity so the list is not asked for an
 * address it already holds. That means an email address spends a moment in a
 * query string, and this file is about how short that moment is.
 *
 * The thing being held here is the LEAK, not the convenience: by the time
 * `captureKnown` returns, `e` and `fn` are out of the URL, and every utm_* and
 * hf_* parameter is exactly where attribution will look for it a moment later.
 */
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { captureKnown, claimKnownEventSlot, clearKnown, readKnown } from '../src/lib/known';

const ORIGIN = 'https://quiz.hormonefocus.jjsmithonline.com';

/** A window whose history.replaceState actually moves the address. */
function win(path: string) {
  const w = {
    location: { href: ORIGIN + path },
    history: {
      state: { idx: 3 },
      replaceState(state: unknown, _title: string, next: string) {
        w.history.state = state as { idx: number };
        w.location.href = new URL(next, ORIGIN).toString();
      },
    },
  };
  return w;
}

function session() {
  const store = new Map<string, string>();
  return {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => { store.set(k, v); },
    removeItem: (k: string) => { store.delete(k); },
    clear: () => store.clear(),
    key: () => null,
    length: store.size,
  };
}

let w: ReturnType<typeof win>;

function visit(path: string) {
  w = win(path);
  vi.stubGlobal('window', w);
  return w;
}

beforeEach(() => {
  vi.stubGlobal('sessionStorage', session());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

/* --------------------------------------------------------- reading her --- */

test('her name and address come off the link, and the ad parameters stay on it', () => {
  visit('/?e=jane%40example.com&fn=Jane&utm_campaign=x');

  expect(captureKnown()).toEqual({ email: 'jane@example.com', name: 'Jane' });

  const after = new URL(w.location.href);
  expect(after.searchParams.get('utm_campaign'), 'attribution must survive').toBe('x');
  expect(after.searchParams.has('e'), 'the address is out of the URL').toBe(false);
  expect(after.searchParams.has('fn')).toBe(false);
  expect(w.location.href).not.toContain('jane@example.com');
  expect(w.location.href).not.toContain('jane%40example.com');
});

test('the address never reaches the URL a pixel would read, even once', () => {
  visit('/bloating?e=jane%40example.com&fn=Jane&utm_source=klaviyo&hf_presell=a');
  captureKnown();

  const after = new URL(w.location.href);
  /* The path and every other parameter are untouched: this strips two names
     and does not rewrite where she is. */
  expect(after.pathname).toBe('/bloating');
  expect(after.searchParams.get('utm_source')).toBe('klaviyo');
  expect(after.searchParams.get('hf_presell')).toBe('a');
  expect(after.search).toBe('?utm_source=klaviyo&hf_presell=a');
});

test('an address that is not an address leaves nobody known', () => {
  visit('/?e=not-an-email&fn=Jane&utm_campaign=x');

  expect(captureKnown()).toBe(null);
  expect(readKnown()).toBe(null);

  /* But it is still stripped. A malformed address in the address bar is just
     as much of a leak as a good one. */
  const after = new URL(w.location.href);
  expect(after.searchParams.has('e')).toBe(false);
  expect(after.searchParams.has('fn')).toBe(false);
  expect(after.searchParams.get('utm_campaign')).toBe('x');
});

test('an empty first name is allowed, because Klaviyo sends one', () => {
  visit('/?e=jane%40example.com&fn=');
  expect(captureKnown()).toEqual({ email: 'jane@example.com', name: '' });
});

test('a link with no identity on it changes nothing', () => {
  visit('/?utm_campaign=x');
  expect(captureKnown()).toBe(null);
  expect(w.location.href).toBe(`${ORIGIN}/?utm_campaign=x`);
});

test('she stays known for the rest of the session, after the link is gone', () => {
  visit('/?e=jane%40example.com&fn=Jane');
  captureKnown();

  /* The second load has no parameters, which is what every step after the
     first one looks like once replaceState has run. */
  visit('/quiz/your-result');
  expect(captureKnown()).toEqual({ email: 'jane@example.com', name: 'Jane' });
  expect(readKnown()).toEqual({ email: 'jane@example.com', name: 'Jane' });
});

test('forgetting her forgets her', () => {
  visit('/?e=jane%40example.com&fn=Jane');
  captureKnown();
  clearKnown();
  expect(readKnown()).toBe(null);
});

test('a stored value that is not a valid address is not trusted', () => {
  visit('/');
  sessionStorage.setItem('hf_known', JSON.stringify({ email: 'nope', name: 'Jane' }));
  expect(readKnown()).toBe(null);
});

test('private browsing throws instead of returning, and nobody is known', () => {
  visit('/?e=jane%40example.com&fn=Jane');
  vi.stubGlobal('sessionStorage', {
    getItem() { throw new Error('denied'); },
    setItem() { throw new Error('denied'); },
    removeItem() { throw new Error('denied'); },
  });
  /* It must not throw into the first render. */
  expect(() => captureKnown()).not.toThrow();
  expect(() => clearKnown()).not.toThrow();
  expect(readKnown()).toBe(null);
});

/* ------------------------------------------- the event fires once only --- */

/* On the ordinary path the event is sent by a button press, which cannot
 * happen twice. A woman from the list presses nothing, so it is sent when her
 * result opens — and a result page can be reloaded, or come back under the
 * back button. Each of those must not be another run of the Klaviyo flow. */

test('the event may be sent once in a session, and not again', () => {
  visit('/?e=jane%40example.com&fn=Jane');
  captureKnown();

  expect(claimKnownEventSlot(), 'the first result view sends it').toBe(true);
  expect(claimKnownEventSlot(), 'a reload must not send it again').toBe(false);
  expect(claimKnownEventSlot()).toBe(false);
});

test('forgetting her lets the gate send its own event', () => {
  visit('/?e=jane%40example.com&fn=Jane');
  captureKnown();
  expect(claimKnownEventSlot()).toBe(true);

  /* She took the "Not you?" link, so she is about to tick the box herself and
     the ordinary path must not find the slot already taken. */
  clearKnown();
  expect(claimKnownEventSlot()).toBe(true);
});

test('with storage denied it sends rather than going silent', () => {
  visit('/');
  vi.stubGlobal('sessionStorage', {
    getItem() { throw new Error('denied'); },
    setItem() { throw new Error('denied'); },
    removeItem() { throw new Error('denied'); },
  });
  /* A flow that never fires is a woman who never gets her email. That is
     worse than a duplicate, which Klaviyo can be told to ignore. */
  expect(claimKnownEventSlot()).toBe(true);
});
