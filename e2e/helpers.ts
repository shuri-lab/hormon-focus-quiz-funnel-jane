import { expect, type Page } from '@playwright/test';

/** Nothing may ever stick out sideways. This is the whole mobile contract. */
export async function expectNoHorizontalOverflow(page: Page, where: string) {
  const offenders = await page.evaluate(() => {
    const doc = document.documentElement;
    const over = doc.scrollWidth - doc.clientWidth;
    if (over <= 1) return [];
    const out: string[] = [];
    for (const el of Array.from(document.querySelectorAll('*'))) {
      const b = el.getBoundingClientRect();
      if (b.width > 0 && (b.right > doc.clientWidth + 1 || b.left < -1)) {
        out.push(`${el.tagName.toLowerCase()}.${(el.className || '').toString().slice(0, 40)}`);
      }
    }
    return out.slice(0, 5);
  });
  expect(offenders, `horizontal overflow on ${where}`).toEqual([]);
}

/**
 * Anything you tap has to be big enough to tap.
 *
 * Inline links in prose are exempt, and so is anything marked data-inline: a
 * control that sits inside a sentence, like the Read more inside a customer's
 * quote, is prose with a button's semantics. It is built as a button because
 * that is what a screen reader needs, not because it is a call to action.
 */
export async function expectTapTargets(page: Page, where: string) {
  const small = await page.evaluate(() => {
    const out: string[] = [];
    for (const el of Array.from(document.querySelectorAll('button, a.cta, input'))) {
      const b = el.getBoundingClientRect();
      if (b.width === 0 || b.height === 0 || el.hasAttribute('hidden')) continue;
      if (el.hasAttribute('data-inline')) continue;
      if (b.height < 44 || b.width < 44) {
        out.push(`${el.tagName.toLowerCase()} ${Math.round(b.width)}x${Math.round(b.height)} "${(el.textContent || '').trim().slice(0, 24)}"`);
      }
    }
    return out;
  });
  expect(small, `tap targets under 44px on ${where}`).toEqual([]);
}

/**
 * No test may reach Klaviyo.
 *
 * The walks tick the consent box and submit the gate, and the gate posts a
 * real event to JJ's account with the public key. Left alone, every run adds
 * example.com profiles to the quiz flow and to whatever report counts it.
 * The request is answered here instead, with the 202 Klaviyo would give.
 */
export async function blockKlaviyo(page: Page) {
  await page.route('**/a.klaviyo.com/**', (r) => r.fulfill({ status: 202, body: '' }));
}

export async function startQuiz(page: Page, route = '/quiz') {
  await blockKlaviyo(page);
  await page.goto(route);
  await page.evaluate(() => sessionStorage.clear());
  await page.goto(route);
  await page.waitForTimeout(250);
}

export const heading = (page: Page) => page.locator('[data-screen-heading]');

/**
 * Click something, then wait for the screen to actually change before doing
 * anything else. Single-choice answers advance on a timer, so a test that
 * clicks straight through races the funnel and fails for the wrong reason.
 */
export async function answerAndWait(page: Page, click: () => Promise<void>, nextHeading: RegExp) {
  await click();
  await expect(heading(page)).toHaveText(nextHeading, { timeout: 15_000 });
}

export const pickOption = (page: Page, i: number) => () => page.locator('.opt').nth(i).click();
export const pressPrimary = (page: Page) => () => page.locator('.actionBar .cta').first().click();
export const pressSecondary = (page: Page) => () => page.locator('.actionBar .cta').nth(1).click();

/**
 * Her plan, walked: the one screen between her result and the offer.
 *
 * REPLACED 12 November 2026 (Quiz V1). Until then three screens sat between
 * the result and the price (whats-happening, your-plan, meet-hormone-focus)
 * and this helper was throughNurture. Two of them were cut and their
 * addresses forward to the plan, so the walk is one screen now: the plan
 * page, titled for her own symptoms, with four steps, then the offer.
 *
 * It starts on `plan`, which is where the result page's button leaves her,
 * and it leaves her on the offer. The heading is asserted on the way
 * through, so a plan that silently stops rendering fails here rather than
 * surfacing as a confusing timeout on the offer page.
 */
export async function throughPlan(page: Page, title: string) {
  /* Plan v13: "Dana, your personal 60-day plan for ...". Callers pass the
     old "Your 60-day plan for ..." form; match the part that is hers. */
  await expect(heading(page), `the plan page reading "${title}"`)
    .toContainText(title.replace(/^Your /, ''));
  await expect(page.locator('.nStep'), 'the plan has four steps').toHaveCount(4);
  await page.locator('.actionBar .cta').click();
}

/**
 * Switch the offer, the way arm.ts says to: ACTIVE_OFFERS and nothing else.
 *
 * THE KIT ARMS ARE BUILT AND OFF. arm.ts lives with ['bottle25'], so in the
 * build these tests run against every visitor gets the one bottle, and a
 * stored arm that is switched off is ignored. The review build can force an
 * arm, but it routes in memory and has no addresses to test.
 *
 * So this rewrites the one literal in the served bundle, ACTIVE_OFFERS, to
 * the arms given, before the app boots. It is the same edit Jane makes to
 * switch the Kit on, applied to this page load only, and everything after it
 * (the pick, the stored arm, the page, the cart link) is the real build. It
 * fails loudly if the literal cannot be found, so a change to how the switch
 * is written breaks here rather than silently testing the bottle.
 */
export async function switchOffers(page: Page, arms: string[]) {
  await page.route(/\/assets\/index-[^/]*\.js$/, async (route) => {
    const res = await route.fetch();
    const src = await res.text();
    const re = /\[(["'`])bottle25\1\](?=,\w+=(["'`])hf_offer_arm\2)/;
    if (!re.test(src)) {
      throw new Error('switchOffers: ACTIVE_OFFERS not found in the bundle');
    }
    const out = src.replace(re, `[${arms.map((a) => `"${a}"`).join(',')}]`);
    await route.fulfill({ response: res, body: out });
  });
}
