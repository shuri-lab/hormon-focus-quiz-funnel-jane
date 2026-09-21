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

export async function startQuiz(page: Page, route = '/quiz') {
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
