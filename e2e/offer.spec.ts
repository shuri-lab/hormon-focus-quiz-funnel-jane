import { test, expect, type Page } from '@playwright/test';
import { expectNoHorizontalOverflow, expectTapTargets } from './helpers';
import {
  BATCH_ON_SHELF, LIVE_DEADLINE, PLAN_SHORT, PROTOCOL_DISCOUNT_CODE,
  PROTOCOL_VARIANT_ID, SHOW_BATCH_LINE, SHOW_DAILY_PRICE, SINGLE_VARIANT_ID,
  VALUE_STACK, cartPath, dailyPrice,
} from '../src/lib/offer';

/* The Starter Guide, with everything the quiz would have put on the link. */
const PLAN = '/plan/perimenopause?signs=4&freq=most%20weeks&name=Test';

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
    test(`${route} lays out, pre-selects the Plan and buys`, async ({ page }) => {
      await page.goto(route);
      await page.waitForLoadState('networkidle');

      /* An unknown slug redirects to /offer, which would otherwise pass here
         without anybody noticing the route had gone. */
      await expect(page).toHaveURL(new RegExp(`${route}$`));
      await expect(page.locator('h1')).toBeVisible();

      await expectNoHorizontalOverflow(page, route);
      await expectTapTargets(page, route);

      /* The Plan is the offer. It arrives chosen, on every route and at every
         width, and it is the only row that is. */
      const chosen = page.locator('.ofHeroBuy .buyRow[aria-checked="true"]');
      await expect(chosen).toHaveCount(1);
      await expect(chosen).toContainText(PLAN_SHORT);
      await expect(chosen).toContainText('Best Seller');

      /* The word we use among ourselves never reaches her. */
      expect(
        /protocol/i.test(await page.locator('body').innerText()),
        `${route} says Protocol to the customer`,
      ).toBe(false);
    });
  }

  test('/live is the only route that carries the strip', async ({ page }) => {
    await page.goto('/live');
    await expect(page.locator('.liveStrip')).toBeVisible();
    await expect(page.locator('.liveStrip')).toContainText(PLAN_SHORT);

    await page.goto('/offer');
    await expect(page.locator('.liveStrip')).toHaveCount(0);
  });

  /* LIVE_DEADLINE is the only deadline the page may carry, and it is the one
     JJ says out loud. Unset, it renders nothing at all rather than an empty
     'Through .' that somebody has to catch in a screenshot. */
  test('the Live deadline renders only where one is set', async ({ page }) => {
    await page.goto('/live');
    const strip = page.locator('.liveStrip');
    const under = page.locator('.ofHeroBuy .buyDeadline');

    if (LIVE_DEADLINE) {
      await expect(strip).toContainText(`Through ${LIVE_DEADLINE}.`);
      await expect(under).toHaveText(`Through ${LIVE_DEADLINE}.`);
    } else {
      await expect(strip).not.toContainText('Through');
      await expect(under).toHaveCount(0);
    }
  });

  test('there is no countdown, on any route', async ({ page }) => {
    for (const route of ROUTES) {
      await page.goto(route);
      const body = await page.locator('body').innerText();
      expect(
        /hurry|only \d+ left|ends in|expires in|last chance/i.test(body),
        `${route} manufactures urgency`,
      ).toBe(false);
    }
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

/* ------------------------------------------------- the stack and the lines -- */

test.describe('what she gets for the money', () => {
  test('the value stack is on the page, twice, with its bonuses named', async ({ page }) => {
    await page.goto('/offer');

    /* Once under the hero price and once at the close, both from the one
       array in offer.ts. */
    await expect(page.locator('.stack')).toHaveCount(2);

    const hero = page.locator('.ofHeroBuy .stack');
    for (const item of VALUE_STACK) {
      await expect(hero).toContainText(item.what.slice(0, 40));
      await expect(hero).toContainText(item.worth);
    }

    /* Two of the six are bonuses, and a bonus named is worth more than the
       same thing folded into the price. */
    await expect(hero.locator('.stackBonus')).toHaveCount(
      VALUE_STACK.filter((i) => i.bonus).length,
    );
    await expect(hero).toContainText('Starter Guide');
    await expect(hero).toContainText('Flat Belly Cheat Sheet for Women Over 40');
  });

  test('the daily price and the batch line say what the switches say', async ({ page }) => {
    await page.goto('/offer');

    const daily = page.locator('.ofHeroBuy .buyDaily');
    if (SHOW_DAILY_PRICE) {
      await expect(daily).toContainText(`${dailyPrice()} a day`);
      /* It is the Plan that sixty days divides, so the line goes when the
         single bottle is chosen. */
      await page.locator('.ofHeroBuy .buyRow').first().click();
      await expect(daily).toHaveCount(0);
    } else {
      await expect(daily).toHaveCount(0);
    }

    await page.goto('/offer');
    const batch = page.locator('.ofHeroBuy .buyBatch');
    if (SHOW_BATCH_LINE) {
      await expect(batch).toContainText(BATCH_ON_SHELF.toLocaleString('en-US'));
      await expect(batch).toContainText('The next batch lands in');

      /* Near the button, which is what makes it scarcity rather than trivia. */
      const btn = (await page.locator('.ofHeroBuy .buyBtn').boundingBox())!;
      const line = (await batch.boundingBox())!;
      expect(line.y - (btn.y + btn.height)).toBeLessThan(60);
    } else {
      await expect(batch).toHaveCount(0);
    }
  });

  test('the guarantee is on /offer twice, verbatim, with the policy behind it',
    async ({ page }) => {
      await page.goto('/offer');

      const guarantee = page.locator('.guar');
      await expect(guarantee).toHaveCount(2);

      for (let i = 0; i < 2; i += 1) {
        await expect(guarantee.nth(i).locator('p')).toHaveText(
          '60-Day Happiness Guarantee. Try it for two months. '
          + 'If you are not satisfied, we refund up to two bottles within 60 days.',
        );
        await expect(guarantee.nth(i).locator('a')).toHaveAttribute(
          'href', 'https://shop.jjsmithonline.com/policies/refund-policy',
        );
      }
    });
});

/* ------------------------------------------------------ the Starter Guide -- */

test.describe('the plan page', () => {
  test('reads back her result, her signs and her name', async ({ page }) => {
    await page.goto(PLAN);
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(/\/plan\/perimenopause/);
    await expectNoHorizontalOverflow(page, PLAN);
    await expectTapTargets(page, PLAN);

    /* What the link carried, read back to her in the first two lines. */
    await expect(page.locator('[data-plan-title]')).toContainText('Test');
    await expect(page.locator('[data-plan-result]')).toContainText('4 of 14 signs');
    await expect(page.locator('[data-plan-result]')).toContainText('most weeks');
    await expect(page.locator('[data-plan-result]')).toContainText('perimenopause');

    /* Every section of the spine, and no token left unfilled. */
    await expect(page.locator('.planSec')).toHaveCount(7);
    expect(await page.locator('body').innerText()).not.toMatch(/\{[a-z ]+\}/i);
  });

  test('carries the same buy block and the same stack as the offer page', async ({ page }) => {
    await page.goto(PLAN);

    await expect(page.locator('.buy')).toHaveCount(1);
    await expect(page.locator('.buyRow[aria-checked="true"]')).toContainText(PLAN_SHORT);
    await expect(page.locator('.stack')).toHaveCount(1);
    await expect(page.locator('.guar')).toHaveCount(1);

    const url = new URL((await page.locator('.buyBtn').getAttribute('href'))!);
    expect(url.origin).toBe('https://shop.jjsmithonline.com');
    expect(url.searchParams.get('hf_offer')).toBe('protocol');
    expect(url.searchParams.get('hf_outcome')).toBe('plan_perimenopause');
  });

  test('reads like something a person wrote when the link carried nothing',
    async ({ page }) => {
      await page.goto('/plan/menopause');
      await expect(page.locator('[data-plan-title]')).toHaveText('Your hormone plan is here');
      await expect(page.locator('[data-plan-result]')).toContainText('You said yes to several things');
      expect(await page.locator('body').innerText()).not.toMatch(/\{[a-z ]+\}/i);
    });

  test('an archetype we did not write a plan for goes to the front door',
    async ({ page }) => {
      await page.goto('/plan/not-a-real-result');
      await expect(page).toHaveURL(/\/$/);
      await expect(page.locator('h1')).toBeVisible();
    });

  test('every archetype we do write renders', async ({ page }) => {
    for (const a of ['imbalance', 'perimenopause', 'menopause', 'early-menopause']) {
      await page.goto(`/plan/${a}?signs=6&freq=most%20weeks&name=Renee`);
      await expect(page.locator('[data-plan-result]'), a).toContainText('6 of 14 signs');
      await expect(page.locator('.buyBtn'), a).toBeVisible();
    }
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
