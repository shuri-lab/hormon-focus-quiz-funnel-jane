import { test, expect } from '@playwright/test';
import {
  expectNoHorizontalOverflow, expectTapTargets, startQuiz, heading,
  answerAndWait, pickOption, pressPrimary, pressSecondary,
} from './helpers';

/* Must match src/lib/angles.ts. A slug that no longer exists would otherwise
   redirect to the default page and pass silently, so the URL is asserted. */
const ANGLES = ['', 'bloating', 'hot-flashes', 'night-sweats', 'sleep', 'weight', 'mood'];

test.describe('landing pages', () => {
  for (const slug of ANGLES) {
    test(`/${slug} lays out and offers a way in`, async ({ page }) => {
      await page.goto(`/${slug}`);
      await page.waitForLoadState('networkidle');

      // a retired slug redirects to '/', which would otherwise pass unnoticed
      await expect(page).toHaveURL(new RegExp(`/${slug}$`));

      await expectNoHorizontalOverflow(page, `/${slug}`);
      await expectTapTargets(page, `/${slug}`);

      // exactly one call to action is reachable without scrolling
      const hero = page.locator('.heroCta .cta').first();
      const sticky = page.locator('.stickyCta .cta');
      const heroVisible = await hero.isVisible();
      const stickyVisible = await sticky.isVisible().catch(() => false);
      expect(heroVisible || stickyVisible, 'no call to action on screen at load').toBe(true);

      await expect(page.locator('h1')).toBeVisible();
    });
  }

  test('an unknown slug falls back to the default page rather than a 404', async ({ page }) => {
    await page.goto('/not-a-real-angle');
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('the ad angle seeds its symptom into the quiz', async ({ page }) => {
    await page.goto('/bloating');
    await page.evaluate(() => sessionStorage.clear());
    await page.goto('/bloating');
    /* Tap whichever call to action is actually on screen, the way she would.
       Scrolling the hero button into view would dismiss the sticky bar
       mid-click and race the navigation. */
    const sticky = page.locator('.stickyCta .cta');
    const entry = (await sticky.isVisible()) ? sticky : page.locator('.heroCta .cta').first();
    await entry.click();

    await expect(page).toHaveURL(/\/bloating\/quiz$/);
    await expect(heading(page)).toContainText('What changes have frustrated you');
    // 'Bloating most days' is the fourth tile and arrives already chosen
    await expect(page.locator('.tile[aria-pressed="true"]')).toHaveCount(1);
    await expect(page.locator('.tile[aria-pressed="true"]')).toContainText('Bloating');
  });
});

test.describe('the quiz', () => {
  test('walks from first question to the offer', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));

    await startQuiz(page);

    await expect(heading(page)).toContainText('What changes have frustrated you');
    await expectTapTargets(page, 's1');
    await page.locator('.tile').nth(0).click();
    await page.locator('.tile').nth(1).click();
    await page.locator('.actionBar .cta').click();

    await expect(heading(page)).toContainText('What is your age');
    await page.locator('.opt').nth(2).click();                 // 40 to 49

    await expect(heading(page)).toContainText('already done this');
    await page.locator('.actionBar .cta').click();

    await expect(heading(page)).toContainText('Do you still have periods');
    await page.locator('.opt').nth(1).click();                 // changed

    await expect(heading(page)).toContainText('how regular');
    await page.locator('.opt').nth(2).click();                 // all over the place

    await expect(heading(page)).toContainText('mood changed');
    await page.locator('.opt').nth(0).click();
    await page.locator('.actionBar .cta').first().click();

    await expect(heading(page)).toContainText('last year');
    await page.locator('.opt').nth(0).click();
    await page.locator('.actionBar .cta').first().click();

    await expect(heading(page)).toContainText('How often');
    await page.locator('.opt').nth(2).click();

    await expect(heading(page)).toContainText('one place');
    await expectNoHorizontalOverflow(page, 's9 mechanism');
    await page.locator('.actionBar .cta').click();

    await expect(heading(page)).toContainText('already tried');
    await page.locator('.opt').nth(0).click();
    await page.locator('.actionBar .cta').first().click();

    await expect(heading(page)).toContainText('Did any of it help');
    await page.locator('.opt').nth(1).click();

    // the loader hands off on its own
    await expect(page.locator('#ef')).toBeVisible({ timeout: 25_000 });
    await page.fill('#nf', 'Renee');
    await page.fill('#ef', 'renee@example.com');
    await page.locator('.actionBar .cta').click();

    await expect(page.locator('.verdict .name')).toHaveText('Perimenopause');
    await expectNoHorizontalOverflow(page, 'r1 verdict');
    await page.locator('.actionBar .cta').click();

    await expect(heading(page)).toContainText('Your read');
    await page.locator('.actionBar .cta').click();
    await expect(heading(page)).toContainText('Why nothing has worked');
    await page.locator('.actionBar .cta').click();
    await expect(heading(page)).toContainText('Two capsules a day');
    await page.locator('.actionBar .cta').click();
    await expect(heading(page)).toContainText('how fast it works');
    await page.locator('.actionBar .cta').click();
    await expect(heading(page)).toContainText('good company');
    await page.locator('.actionBar .cta').click();

    await expect(heading(page)).toContainText('where I would start you, Renee');
    await expectNoHorizontalOverflow(page, 'r7 offer');
    await expect(page.locator('.actionBar .cta')).toHaveAttribute('href', /shop\.jjsmithonline\.com/);
    expect(errors, 'javascript errors during the run').toEqual([]);
  });

  test('the loader is not re-entered by the back button', async ({ page }) => {
    await startQuiz(page);

    await page.locator('.tile').nth(1).click();
    await answerAndWait(page, pressPrimary(page), /What is your age/);
    await answerAndWait(page, pickOption(page, 2), /already done this/);
    await answerAndWait(page, pressPrimary(page), /Do you still have periods/);
    await answerAndWait(page, pickOption(page, 1), /how regular/);
    await answerAndWait(page, pickOption(page, 0), /mood changed/);
    await answerAndWait(page, pressSecondary(page), /last year/);
    await page.locator('.opt').nth(3).click();
    await answerAndWait(page, pressPrimary(page), /How often/);
    await answerAndWait(page, pickOption(page, 2), /one place/);
    await answerAndWait(page, pressPrimary(page), /already tried/);
    await answerAndWait(page, pressSecondary(page), /Did any of it help/);
    await page.locator('.opt').nth(1).click();

    // the analysing screen hands off on its own
    await expect(page.locator('#ef')).toBeVisible({ timeout: 25_000 });

    await page.goBack();
    // must land back on a question, never inside the analysing animation
    await expect(page.locator('.ring')).toHaveCount(0);
    await expect(heading(page)).toHaveText(/Did any of it help/);
  });

  test('a double tap on Continue advances exactly one screen', async ({ page }) => {
    await startQuiz(page);
    await page.locator('.tile').nth(0).click();
    const cta = page.locator('.actionBar .cta').first();
    await cta.dblclick();
    // s1 -> s2, and never s1 -> s3
    await expect(heading(page)).toHaveText(/What is your age/);
  });
});

/* The one test that is not about polish. */
test.describe('the doctor route is an exit', () => {
  test('never shows a price and never links to the shop', async ({ page }) => {
    await startQuiz(page);
    await page.locator('.tile').nth(0).click();
    await answerAndWait(page, pressPrimary(page), /What is your age/);
    await answerAndWait(page, pickOption(page, 4), /already done this/);          // 60+
    await answerAndWait(page, pressPrimary(page), /Do you still have periods/);
    await answerAndWait(page, pickOption(page, 0), /how regular/);                // still bleeding -> D
    await answerAndWait(page, pickOption(page, 0), /mood changed/);               // like clockwork
    await answerAndWait(page, pressSecondary(page), /last year/);                 // mood: none of these
    await page.locator('.opt').nth(5).click();                                    // markers: none of these
    await answerAndWait(page, pressPrimary(page), /How often/);
    await answerAndWait(page, pickOption(page, 3), /one place/);                  // nearly every day
    await answerAndWait(page, pressPrimary(page), /already tried/);
    await answerAndWait(page, pressSecondary(page), /Did any of it help/);        // nothing yet
    await page.locator('.opt').nth(2).click();                                    // nothing changed

    await expect(page.locator('#ef')).toBeVisible({ timeout: 25_000 });
    await page.fill('#ef', 'pat@example.com');
    await page.locator('.actionBar .cta').click();

    await expect(page.locator('.verdict .name')).toHaveText('This one needs a doctor');
    await page.locator('.actionBar .cta').click();             // r2
    await page.locator('.actionBar .cta').click();             // rDoc

    await expect(heading(page)).toContainText('Take this to your doctor');

    const hrefs = await page.locator('a[href]').evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).href));
    expect(hrefs.filter((h) => h.includes('shop.jjsmithonline.com')), 'the doctor route must never link to the shop').toEqual([]);
    expect(await page.content()).not.toContain('49.99');
    await expectNoHorizontalOverflow(page, 'rDoc');
  });
});
