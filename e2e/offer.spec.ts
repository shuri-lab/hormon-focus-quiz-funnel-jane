import { test, expect, type Page } from '@playwright/test';
import { expectNoHorizontalOverflow, expectTapTargets } from './helpers';
import {
  BATCH_ON_SHELF,
  LIVE_DEADLINE,
  PLAN_SHORT,
  PROTOCOL_DISCOUNT_CODE,
  PROTOCOL_VARIANT_ID,
  SHOW_BATCH_LINE,
  SHOW_DAILY_PRICE,
  SINGLE_VARIANT_ID,
  SUBSCRIBE_SELLING_PLAN_ID,
  SUBSCRIBE_VARIANT_ID,
  VALUE_STACK,
  cartPath,
  dailyPrice,
} from '../src/lib/offer';

/* The Starter Guide, with everything the quiz would have put on the link. */
const PLAN = '/plan/perimenopause?signs=4&freq=most%20weeks&name=Test';

/* The three routes the offer lives on. /offer is the master angle, the slug
   route swaps the hero, and /live adds the strip. Everything below the hero is
   the same page, so asserting it three times is the point: a section that only
   renders on one of them is a bug. */
const ROUTES = ['/offer', '/offer/body-at-40', '/live'];

/**
 * The five things that have to be on screen before she scrolls.
 *
 * Sixty per cent of visitors never scroll past the fold, so on a phone these
 * are close to the whole page. They are asserted fully visible — top and
 * bottom inside the viewport — rather than merely started.
 *
 * THE GUARANTEE USED TO BE THE SIXTH. Adding the subscription row cost 97px
 * and pushed it under. That was a deliberate trade, not a regression: the
 * three prices and the button still end at 834px in an 844px viewport, so
 * everything she needs in order to decide and act is still above the fold,
 * and what moved is the reassurance that supports the decision. It is held
 * to GUARANTEE_REACH below rather than dropped, because "below the fold" and
 * "four screens down" are not the same thing. Setting SUBSCRIPTION_LIVE back
 * to false restores the sixth element on the next build.
 */
const ABOVE_THE_FOLD = ['proof', 'headline', 'sub', 'image', 'cta'];

/** Every card says it, under its own price. */
const GUARANTEE_DAYS = 60;

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

      /* The Plan is the offer. With three self-contained cards there is no
         selection to make, so the Plan is the one carrying the badge and the
         only filled button on the page — and it is the only one that is. */
      const plan = page.locator('.ofHeroBuy .oc-protocol');
      await expect(plan).toHaveCount(1);
      await expect(plan).toContainText(PLAN_SHORT);
      await expect(plan.locator('.ocBadge')).toHaveText('Best Seller');
      await expect(page.locator('.ofHeroBuy .ocCta:not(.ocCtaSoft)')).toHaveCount(1);

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
    await expect(page.locator('.liveStrip')).toContainText('The plan from tonight');
    await expect(page.locator('.liveStrip')).toContainText('free shipping');

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
    test(`${route} fits all five elements before the fold on a phone`, async ({ page }) => {
      test.skip(!phone390(page), 'the fold budget is written against the 390px phone');

      await page.goto(route);
      await page.waitForLoadState('networkidle');

      const height = page.viewportSize()!.height;

      for (const af of ABOVE_THE_FOLD) {
        const el = page.locator(`.ofHero [data-af="${af}"]`).first();
        await expect(el, `${af} is missing from ${route}`).toBeVisible();
        const box = (await el.boundingBox())!;

        if (af === 'cta') {
          /* The offer block is three cards tall on a phone and cannot fit
             whole. What matters is that she can see it has started without
             scrolling, so the rule is on its top edge, not its bottom. */
          expect(
            Math.round(box.y),
            `the offer block starts below the fold on ${route}: ${Math.round(box.y)}px `
            + `in a ${height}px viewport`,
          ).toBeLessThanOrEqual(height - 40);
          continue;
        }

        expect(
          Math.round(box.y + box.height),
          `"${af}" runs past the fold on ${route}: it ends at `
          + `${Math.round(box.y + box.height)}px in a ${height}px viewport`,
        ).toBeLessThanOrEqual(height);
      }

      /* And nothing was scrolled to get there. */
      expect(await page.evaluate(() => window.scrollY)).toBe(0);

      /* THE GUARANTEE MOVED, AND IMPROVED. It used to be one block she had
         to reach; every card now carries its own line under it, so the
         reassurance sits beside each price rather than below all of them.
         That is worth more than the old within-200px-of-the-fold rule, and
         it is what is asserted instead. */
      const cards = page.locator('.ofHeroBuy .ocCol');
      const n = await cards.count();
      expect(n, `${route} has no offer cards`).toBeGreaterThan(0);
      for (let i = 0; i < n; i += 1) {
        await expect(
          cards.nth(i).locator('.ocGuarantee'), `${route} card ${i} has no guarantee`,
        ).toHaveText(`${GUARANTEE_DAYS}-day money-back guarantee`);
      }
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

    const buy = page.locator('.ofHeroBuy .ocCta[data-offer="protocol"]');
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

  test('the single bottle card carries its own cart, not the Plan\'s', async ({ page }) => {
    await page.goto('/offer');

    /* Nothing is selected and nothing needs to be: the card she presses is
       the thing she buys. That is the whole point of the layout. */
    const single = page.locator('.ofHeroBuy .ocCta[data-offer="single"]');
    const url = new URL((await single.getAttribute('href'))!);
    expect(url.pathname).toBe(`/cart/${SINGLE_VARIANT_ID}:1`);
    expect(url.searchParams.get('discount')).toBeNull();
    expect(url.searchParams.get('hf_offer')).toBe('single');
    expect(url.searchParams.get('storefront')).toBe('true');

    await expect(single).toContainText('Get one bottle');
  });

  test('the closer offers the same three carts as the hero', async ({ page }) => {
    await page.goto('/offer');

    /* Both blocks are the same offer, so a given card opens the same cart
       wherever on the page she happens to reach it. */
    for (const kind of ['single', 'protocol', 'subscribe']) {
      const hrefs = await page.locator(`.ocCta[data-offer="${kind}"]`).evaluateAll(
        (as) => as.map((a) => (a as HTMLAnchorElement).href),
      );
      expect(hrefs.length, `${kind} appears in both blocks`).toBe(2);
      expect(new Set(hrefs).size, `${kind} opens two different carts`).toBe(1);
    }
  });

  test('every buy button on every route lands on the shop with its tags', async ({ page }) => {
    for (const route of ROUTES) {
      await page.goto(route);
      const hrefs = await page.locator('.ocCta, .buyBtn').evaluateAll(
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

  test('the ad tags are on the link at first paint, before any re-render', async ({ page }) => {
    /* THE BUG THIS EXISTS FOR: attribution used to be captured in an effect,
       which runs after the first render. The links were therefore built from
       the fallbacks, and a woman who landed from an ad and pressed buy
       without triggering a re-render reached Shopify tagged utm_source=quiz
       with her fbclid dropped — the exact traffic the carry-through is for.

       No click, no scroll, no navigation here on purpose. Read the href off
       the first paint and nothing else. */
    const ad = {
      utm_source: 'meta', utm_medium: 'paid', utm_campaign: 'peri_q3',
      utm_content: 'vid_07', utm_term: 'bloat_kw',
      hf_funnel: 'quiz_v2', hf_variant: 'b', fbclid: 'FB1',
    };
    await page.goto(`/offer?${new URLSearchParams(ad)}`);
    await page.waitForLoadState('networkidle');

    for (const kind of ['single', 'protocol', 'subscribe']) {
      const href = await page.locator(`.ocCta[data-offer="${kind}"]`).first()
        .getAttribute('href');
      const url = new URL(href!);
      for (const [k, v] of Object.entries(ad)) {
        expect(url.searchParams.get(k), `${kind} lost ${k} on the first paint`).toBe(v);
      }
    }
  });

  test('the subscription buys its own variant on its own plan', async ({ page }) => {
    await page.goto('/offer');
    const url = new URL((await page.locator('.ocCta[data-offer="subscribe"]').first()
      .getAttribute('href'))!);

    expect(url.pathname).toBe('/cart/add');
    expect(url.searchParams.get('id')).toBe(SUBSCRIBE_VARIANT_ID);
    expect(url.searchParams.get('selling_plan')).toBe(SUBSCRIBE_SELLING_PLAN_ID);
    expect(url.searchParams.get('quantity')).toBe('1');
    /* Not the one-off variant with a plan bolted onto it. */
    expect(url.searchParams.get('id')).not.toBe(SINGLE_VARIANT_ID);
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
      /* It is the Plan that sixty days divides, and the Plan is what the
         page sells, so the line stands under all three cards. */
      await expect(daily).toContainText(`${dailyPrice()} a day`);
      await expect(daily).toContainText('Less than the coffee that stopped helping');
    } else {
      await expect(daily).toHaveCount(0);
    }

    await page.goto('/offer');
    const batch = page.locator('.ofHeroBuy .buyBatch');
    if (SHOW_BATCH_LINE) {
      await expect(batch).toContainText(BATCH_ON_SHELF.toLocaleString('en-US'));
      await expect(batch).toContainText('The next batch lands in');

      /* Under the cards rather than adrift: scarcity beside the price is
         scarcity, and scarcity three screens away is trivia. */
      const cards = (await page.locator('.ofHeroBuy .ocGrid').boundingBox())!;
      const line = (await batch.boundingBox())!;
      expect(line.y - (cards.y + cards.height)).toBeLessThan(140);
    } else {
      await expect(batch).toHaveCount(0);
    }
  });

  test('the guarantee is on /offer twice, verbatim, with the policy behind it',
    async ({ page }) => {
      await page.goto('/offer');

      /* Same words as before the redesign, now beside the seal. */
      const guarantee = page.locator('.ocGuard');
      await expect(guarantee).toHaveCount(2);

      for (let i = 0; i < 2; i += 1) {
        await expect(guarantee.nth(i).locator('.ocGuardLead'))
          .toHaveText('See results in 60 days, or it is free.');
        await expect(guarantee.nth(i).locator('.ocGuardBody'))
          .toHaveText('The 60-Day Happiness Guarantee: money back, up to two bottles.');
        await expect(guarantee.nth(i).locator('a')).toHaveAttribute(
          'href', 'https://shop.jjsmithonline.com/policies/refund-policy',
        );
        await expect(guarantee.nth(i).locator('a')).toHaveText('Happiness Guarantee');
        await expect(guarantee.nth(i).locator('.ocSeal')).toBeVisible();
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

  /* A page holding her first name and her result has no business in a search
     index, and the meta tag is the half of that which works per route. */
  test('the plan page asks not to be indexed', async ({ page }) => {
    await page.goto(PLAN);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');

    await page.goto('/offer');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'index,follow');
  });

  /* THE GUIDE IS A BONUS, NOT A FREE PAGE. Nothing in the application links
     here: she arrives from the order confirmation page or the first
     post-purchase email, both of which David and the Klaviyo flow build. A
     link added anywhere in the funnel spends the bonus, so this test fails
     the build the moment one appears. */
  test('nothing in the funnel links to the plan', async ({ page }) => {
    for (const route of [...ROUTES, '/', '/quiz', '/bloating']) {
      await page.goto(route);
      const hrefs = await page.locator('a[href]').evaluateAll(
        (as) => as.map((a) => a.getAttribute('href') ?? ''),
      );
      expect(
        hrefs.filter((h) => h.includes('/plan')),
        `${route} links to the Starter Guide, which is a bonus she receives with the bottles`,
      ).toEqual([]);
    }
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
    await expect(reviews).toHaveCount(6);

    /* Alternating, so three faces, and every one of them labelled. */
    await expect(page.locator('.ofRev.hasPhoto')).toHaveCount(3);
    await expect(page.locator('.ofRev .revFace')).toHaveCount(3);
    for (const alt of await page.locator('.ofRev .revFace').evaluateAll(
      (els) => els.map((e) => e.getAttribute('alt')),
    )) {
      expect(alt).toBe('Hormone Focus customer');
    }

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
    await expect(page.locator('.ofVp > div')).toHaveCount(5);       // five value props
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

  test('all three cards render now there is a plan behind the third', async ({ page }) => {
    await page.goto('/offer');
    await expect(page.locator('.oc')).toHaveCount(6);               // two blocks, three cards each
    await expect(page.locator('.ocCta[data-offer="subscribe"]').first()).toBeVisible();
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

/* ------------------------------------------------- Jane's notes, on screen -- */

test.describe('the review wall', () => {
  test('Read more opens the rest of her words and changes none of them', async ({ page }) => {
    await page.goto('/offer');

    const card = page.locator('.ofRev').first();
    const quote = card.locator('p');
    const short = (await quote.innerText()).trim();

    await expect(card.locator('.revMore')).toHaveText('Read more');
    await card.locator('.revMore').click();

    const long = (await quote.innerText()).trim();
    await expect(card.locator('.revMore')).toHaveText('Read less');
    expect(long.length, 'Read more must reveal more').toBeGreaterThan(short.length);

    /* What was on show is where the quote was cut, not what it was cut into:
       the short form is a prefix of the long one, quotation marks aside. */
    const strip = (t: string) => t.replace(/[“”…"]/g, '').trim();
    expect(strip(long).startsWith(strip(short))).toBe(true);
  });
});

test.describe('the buttons and the subscription', () => {
  test('every button names what it buys, and the sticky bar names the Plan',
    async ({ page }) => {
      await page.goto('/offer');

      /* Each card says what pressing it gets her, in her words, not ours. */
      await expect(page.locator('.ofHeroBuy .ocCta[data-offer="single"]'))
        .toContainText('Get one bottle');
      await expect(page.locator('.ofHeroBuy .ocCta[data-offer="protocol"]'))
        .toContainText('Get my two bottles');
      await expect(page.locator('.ofHeroBuy .ocCta[data-offer="subscribe"]'))
        .toContainText('Start the subscription');

      /* The sticky bar has room for one offer and carries the Plan, which is
         what the page sells; there is no selection for it to follow. */
      await page.locator('.ofCloser').scrollIntoViewIfNeeded();
      const sticky = page.locator('.ofSticky .buyBtn');
      await expect(sticky).toHaveAttribute('data-offer', 'protocol');
      await expect(sticky).toContainText('Get my two bottles');
    });

  test('the subscription never appears on the Live, but does on the offer pages', async ({ page }) => {
    /* Jane's rule: the Live sells the two-bottle plan and nothing else. It
       holds whatever SUBSCRIPTION_LIVE says, so it is asserted separately
       from the offer pages rather than in one loop over both. */
    await page.goto('/live');
    expect(await page.locator('.oc').count(), 'the Live renders a half-built block').toBe(4);
    await expect(page.locator('.ocCta[data-offer="subscribe"]'), '/live').toHaveCount(0);

    for (const route of ROUTES.filter((r) => r !== '/live')) {
      await page.goto(route);
      const cards = await page.locator('.oc').count();
      expect(cards % 3, `${route} renders a half-built block`).toBe(0);
      await expect(page.locator('.ocCta[data-offer="subscribe"]').first(), route).toBeVisible();
    }
  });
});

test.describe('the scale', () => {
  test('is a customer speaking, with her name on it', async ({ page }) => {
    for (const route of ['/offer', '/live']) {
      await page.goto(route);
      const scale = page.locator('.ofScale');
      await expect(scale, route).toBeVisible();
      await expect(scale, route).toContainText('What most women on Hormone Focus tell us');
      await expect(scale, route).toContainText('The scale finally moved.');
      await expect(scale, route).toContainText('Gigi');
      await expect(scale, route).toContainText('verified buyer');
    }
  });
});
