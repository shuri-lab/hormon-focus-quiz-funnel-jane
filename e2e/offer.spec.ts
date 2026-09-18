import { test, expect, type Page } from '@playwright/test';
import { expectNoHorizontalOverflow, expectTapTargets } from './helpers';
import {
  PROTOCOL_DISCOUNT_CODE, PROTOCOL_VARIANT_ID, SINGLE_VARIANT_ID, cartPath,
} from '../src/lib/offer';

/* The three routes the offer lives on. /offer is the master angle, the slug
   route swaps the hero, and /live adds the strip. Everything below the hero is
   the same page, so asserting it three times is the point: a section that only
   renders on one of them is a bug. */
const ROUTES = ['/offer', '/offer/body-at-40', '/live'];

/**
 * The six things that have to be on screen before she scrolls.
 *
 * Sixty per cent of visitors never scroll past the fold, so on a phone these
 * six are the whole page. They are asserted fully visible — top and bottom
 * inside the viewport — rather than merely started, because half a guarantee
 * is not a guarantee.
 */
const ABOVE_THE_FOLD = ['proof', 'headline', 'sub', 'image', 'cta', 'guarantee'];

const phone390 = (page: Page) => page.viewportSize()?.width === 390;

test.describe('the offer pages', () => {
  for (const route of ROUTES) {
    test(`${route} lays out, pre-selects the Protocol and buys`, async ({ page }) => {
      await page.goto(route);
      await page.waitForLoadState('networkidle');

      /* An unknown slug redirects to /offer, which would otherwise pass here
         without anybody noticing the route had gone. */
      await expect(page).toHaveURL(new RegExp(`${route}$`));
      await expect(page.locator('h1')).toBeVisible();

      await expectNoHorizontalOverflow(page, route);
      await expectTapTargets(page, route);

      /* The Protocol is the offer. It arrives chosen, on every route and at
         every width, and it is the only row that is. */
      const chosen = page.locator('.ofHeroBuy .buyRow[aria-checked="true"]');
      await expect(chosen).toHaveCount(1);
      await expect(chosen).toContainText('60-Day Protocol');
      await expect(chosen).toContainText('Best Seller');
    });
  }

  test('/live is the only route that carries the strip', async ({ page }) => {
    await page.goto('/live');
    await expect(page.locator('.liveStrip')).toBeVisible();
    await expect(page.locator('.liveStrip')).toContainText('through Monday night');

    await page.goto('/offer');
    await expect(page.locator('.liveStrip')).toHaveCount(0);
  });

  test('an offer slug we do not sell against falls back to /offer', async ({ page }) => {
    await page.goto('/offer/not-a-real-angle');
    await expect(page).toHaveURL(/\/offer$/);
    await expect(page.locator('h1')).toBeVisible();
  });
});

/* ------------------------------------------------ above the fold, 390px -- */

test.describe('above the fold', () => {
  for (const route of ROUTES) {
    test(`${route} fits all six elements before the fold on a phone`, async ({ page }) => {
      test.skip(!phone390(page), 'the fold budget is written against the 390px phone');

      await page.goto(route);
      await page.waitForLoadState('networkidle');

      const height = page.viewportSize()!.height;

      for (const af of ABOVE_THE_FOLD) {
        const el = page.locator(`.ofHero [data-af="${af}"]`).first();
        await expect(el, `${af} is missing from ${route}`).toBeVisible();

        const box = (await el.boundingBox())!;
        expect(
          Math.round(box.y + box.height),
          `"${af}" runs past the fold on ${route}: it ends at `
          + `${Math.round(box.y + box.height)}px in a ${height}px viewport`,
        ).toBeLessThanOrEqual(height);
      }

      /* And nothing was scrolled to get there. */
      expect(await page.evaluate(() => window.scrollY)).toBe(0);
    });
  }
});

/* -------------------------------------------------------- the cart link -- */

/**
 * What the Protocol link should be RIGHT NOW.
 *
 * The expectation is derived from the same constants the page reads, so the
 * day PROTOCOL_VARIANT_ID is set this test follows the switch from mode 2 to
 * mode 3 instead of failing. What it pins is the shape of each mode.
 */
function expectedProtocolPath() {
  return PROTOCOL_VARIANT_ID
    ? `/cart/${PROTOCOL_VARIANT_ID}:1`
    : `/cart/${SINGLE_VARIANT_ID}:2`;
}

test.describe('the cart link', () => {
  test('the Protocol button opens the right cart for the current mode', async ({ page }) => {
    await page.goto('/offer');

    const buy = page.locator('.ofHeroBuy .buyBtn');
    const href = (await buy.getAttribute('href'))!;
    const url = new URL(href);

    expect(url.host).toBe('shop.jjsmithonline.com');
    expect(url.pathname).toBe(expectedProtocolPath());
    expect(url.searchParams.get('storefront')).toBe('true');
    expect(url.searchParams.get('hf_offer')).toBe('protocol');
    expect(url.searchParams.get('utm_source')).toBeTruthy();
    expect(url.searchParams.get('hf_outcome')).toBeTruthy();

    /* Mode 2 carries the code; mode 3 must not, because the variant already
       prices itself and a stacked code would discount it twice. */
    if (PROTOCOL_VARIANT_ID) {
      expect(url.searchParams.get('discount')).toBeNull();
    } else {
      expect(url.searchParams.get('discount')).toBe(PROTOCOL_DISCOUNT_CODE);
    }

    /* Same tab, and no rel: noreferrer would strip the Referer Shopify
       attributes the sale on. */
    expect(await buy.getAttribute('target')).toBeNull();
    expect(await buy.getAttribute('rel')).toBeNull();
  });

  test('choosing the single bottle switches the link to one bottle', async ({ page }) => {
    await page.goto('/offer');

    await page.locator('.ofHeroBuy .buyRow').first().click();
    await expect(page.locator('.ofHeroBuy .buyRow[aria-checked="true"]')).toContainText('1 bottle');

    const url = new URL((await page.locator('.ofHeroBuy .buyBtn').getAttribute('href'))!);
    expect(url.pathname).toBe(`/cart/${SINGLE_VARIANT_ID}:1`);
    expect(url.searchParams.get('discount')).toBeNull();
    expect(url.searchParams.get('hf_offer')).toBe('single');
    expect(url.searchParams.get('storefront')).toBe('true');

    await expect(page.locator('.ofHeroBuy .buyBtn')).toContainText('Get one bottle');
  });

  test('the closer block follows the choice made in the hero', async ({ page }) => {
    await page.goto('/offer');

    await page.locator('.ofHeroBuy .buyRow').first().click();

    /* One choice per page. A woman who picked the single bottle at the top
       must not find the Protocol re-selected at the bottom. */
    const closer = page.locator('.ofCloser .buyRow[aria-checked="true"]');
    await expect(closer).toContainText('1 bottle');

    const hrefs = await page.locator('.buyBtn').evaluateAll(
      (as) => as.map((a) => (a as HTMLAnchorElement).href),
    );
    expect(new Set(hrefs).size, 'every buy button on the page opens the same cart').toBe(1);
  });

  test('every buy button on every route lands on the shop with its tags', async ({ page }) => {
    for (const route of ROUTES) {
      await page.goto(route);
      const hrefs = await page.locator('.buyBtn').evaluateAll(
        (as) => as.map((a) => (a as HTMLAnchorElement).href),
      );
      expect(hrefs.length, `${route} has no buy button`).toBeGreaterThan(0);

      for (const href of hrefs) {
        const url = new URL(href);
        expect(url.origin, route).toBe('https://shop.jjsmithonline.com');
        expect(url.pathname.startsWith('/cart/'), `${route} ${href}`).toBe(true);
        expect(url.searchParams.get('utm_source'), route).toBeTruthy();
        expect(url.searchParams.get('hf_offer'), route).toBeTruthy();
      }
    }
  });

  test('the cart path helper answers for each mode', () => {
    expect(cartPath('single')).toBe(`/cart/${SINGLE_VARIANT_ID}:1?storefront=true`);
    expect(cartPath('protocol')).toBe(
      PROTOCOL_VARIANT_ID
        ? `/cart/${PROTOCOL_VARIANT_ID}:1?storefront=true`
        : `/cart/${SINGLE_VARIANT_ID}:2?storefront=true&discount=${PROTOCOL_DISCOUNT_CODE}`,
    );
  });
});

/* ---------------------------------------------------------- the content -- */

test.describe('the page says what it has to say', () => {
  test('the wall is a wall, and never a carousel', async ({ page }) => {
    await page.goto('/offer');

    const reviews = page.locator('.ofRev');
    await expect(reviews).toHaveCount(10);

    /* A carousel is a horizontally scrolling strip. This must not be one. */
    const scrolls = await page.locator('.ofWall').evaluate((el) => ({
      overflowX: getComputedStyle(el).overflowX,
      wider: el.scrollWidth > el.clientWidth + 1,
    }));
    expect(scrolls.wider, 'the wall scrolls sideways, which makes it a carousel').toBe(false);
    expect(['visible', 'clip'], 'the wall must not be a scroller').toContain(scrolls.overflowX);

    await expect(page.locator('.ofNote')).toContainText('Results vary');
  });

  test('the structure below the fold is all there', async ({ page }) => {
    await page.goto('/offer');

    await expect(page.locator('.ofRecog li')).toHaveCount(5);       // the pain point
    await expect(page.locator('.ofVp > div')).toHaveCount(6);       // six value props
    await expect(page.locator('.ofStep')).toHaveCount(3);           // three steps
    await expect(page.locator('.ofMg > div')).toHaveCount(3);       // every milligram
    await expect(page.locator('.ofFaq details')).toHaveCount(4);    // four drop-downs

    await expect(page.locator('.ofMg')).toContainText('200 mg');
    await expect(page.locator('.ofMg')).toContainText('500 mg');
    await expect(page.locator('.ofMg')).toContainText('2.5 mg');

    await expect(page.locator('.ofDoctor')).toContainText('Talk to your doctor first');
    await expect(page.locator('.ofFoot')).toContainText('Food and Drug Administration');
  });

  test('a FAQ drop-down opens', async ({ page }) => {
    await page.goto('/offer');
    const first = page.locator('.ofFaq details').first();
    await expect(first.locator('p')).toBeHidden();
    await first.locator('summary').click();
    await expect(first.locator('p')).toBeVisible();
  });

  test('the subscription stays unrendered while there is no plan behind it', async ({ page }) => {
    await page.goto('/offer');
    await expect(page.locator('.buyRow')).toHaveCount(4);           // two blocks, two rows each
    await expect(page.getByText('Subscription')).toHaveCount(0);
  });

  test('the sticky bar arrives on a phone once the hero button has gone', async ({ page }) => {
    test.skip(!phone390(page), 'the sticky bar is a phone behaviour');

    await page.goto('/offer');
    await expect(page.locator('.ofSticky')).toHaveCount(0);

    await page.locator('.ofFaq').scrollIntoViewIfNeeded();
    await expect(page.locator('.ofSticky')).toBeVisible();
    await expect(page.locator('.ofSticky .buyBtn')).toHaveAttribute(
      'href', /shop\.jjsmithonline\.com\/cart\//,
    );
    await expectNoHorizontalOverflow(page, '/offer with the sticky bar');
  });
});
