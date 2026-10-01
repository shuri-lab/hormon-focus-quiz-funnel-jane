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

    /* Two ticks, so she is asked which one bothers her most, and offered only
       the two she ticked. */
    await expect(heading(page)).toContainText('bothering you most');
    await expect(page.locator('.opt')).toHaveCount(2);
    await page.locator('.opt').nth(1).click();                 // the weight

    await expect(heading(page)).toContainText('What is your age');
    await page.locator('.opt').nth(2).click();                 // 40 to 49

    /* Reassurance, with no product review before she has a result. */
    await expect(heading(page)).toContainText('not the only one');
    await expect(page.locator('.rev')).toHaveCount(0);
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

    await expect(heading(page)).toContainText('have in common');
    await expect(page.getByText('This check cannot tell you the cause')).toBeVisible();
    await expectNoHorizontalOverflow(page, 's9 explanation');
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

    /* A valid address is not enough: the opt-in is unticked and required, so
       the button stays disabled until she agrees to be emailed. */
    await expect(page.locator('#cf')).not.toBeChecked();
    await expect(page.locator('.actionBar .cta')).toBeDisabled();
    await page.locator('#cf').check();
    await expect(page.locator('.actionBar .cta')).toBeEnabled();

    await page.locator('.actionBar .cta').click();

    await expect(page.locator('.verdict .name')).toHaveText('Perimenopause');
    await expectNoHorizontalOverflow(page, 'r1 verdict');

    /* The first reveal sells nothing: she gave an address for a result. */
    await expect(page.locator('.guideCard')).toHaveCount(0);
    await page.locator('.actionBar .cta').click();

    /* Why: her own answers, what the check cannot tell her, and no score. */
    await expect(heading(page)).toContainText('What you told me');
    await expect(page.locator('.scoreCard')).toHaveCount(0);
    await expect(page.locator('.gauge')).toHaveCount(0);
    await expect(page.getByText('What this check cannot tell you')).toBeVisible();
    await page.locator('.actionBar .cta').click();

    /* One first step, for the concern she named, before any product. */
    await expect(heading(page)).toContainText('Where to start');
    await expect(page.getByText('One thing to start with, for the weight')).toBeVisible();
    await expect(page.getByText('It was never')).toHaveCount(0);
    await page.locator('.actionBar .cta').click();

    await expect(heading(page)).toContainText('Feel Like YOU Again Kit');
    await expect(page.getByText('No diet changes')).toHaveCount(0);
    await page.locator('.actionBar .cta').click();
    await expect(heading(page)).toContainText('asks of you');
    await page.locator('.actionBar .cta').click();
    await expect(heading(page)).toContainText('good company');
    await page.locator('.actionBar .cta').click();

    await expect(heading(page)).toContainText('where I would start you, Renee');
    await expectNoHorizontalOverflow(page, 'r7 offer');
    /* Three complete offers, each ending in its own cart link, rather than
       three rows feeding one button. */
    await expect(page.locator('.ocCta')).toHaveCount(3);
    for (const kind of ['single', 'protocol', 'subscribe']) {
      await expect(
        page.locator(`.ocCta[data-offer="${kind}"]`), kind,
      ).toHaveAttribute('href', /shop\.jjsmithonline\.com/);
    }

    /* One product photograph per card and none above them: a fourth picture
       of the same bottle was the biggest thing on the screen. */
    await expect(page.locator('.shot')).toHaveCount(0);

    /* The kit's three digital pieces are named inside the kit card, in JJ's
       own titles, and the kit is priced as it is on her page. */
    await expect(page.locator('.ocBonus')).toBeVisible();
    await expect(page.locator('.ocBonus')).toContainText('60-Day Hormone Fix');
    await expect(page.locator('.ocBonus')).not.toContainText('Starter Guide');
    await expect(page.locator('.ocBonus a')).toHaveCount(0);
    await expect(page.locator('.oc-protocol .ocNow')).toHaveText('$74.99');
    await expect(page.locator('.ocCta[data-offer="protocol"]'))
      .toHaveAttribute('href', /54330638663791:1.*discount=HF60FREESHIP/);

    /* The guarantee is said once, under all three, with the seal beside it. */
    await expect(page.locator('.ocGuard')).toBeVisible();
    await expect(page.locator('.ocSeal')).toBeVisible();

    /* THE VALUE STACK IS DELIBERATELY ABSENT HERE. By this screen the cards
       have already named the price, the bonus and the guarantee, and she has
       read the whole reveal to get here. It stays on the offer pages, where
       she may have arrived cold from an ad. */
    await expect(page.locator('.stack')).toHaveCount(0);
    await expect(page.getByText('What is in it')).toHaveCount(0);
    const quizHrefs = await page.locator('a[href]').evaluateAll(
      (as) => as.map((a) => a.getAttribute('href') ?? ''),
    );
    expect(quizHrefs.filter((h) => h.includes('/plan')), 'the quiz must not link to the plan')
      .toEqual([]);
    expect(errors, 'javascript errors during the run').toEqual([]);
  });

  test('a menopause result gets her read and a first step, and is not sold to', async ({ page }) => {
    await startQuiz(page);
    await page.locator('.tile').nth(2).click();                // poor sleep, one tick
    await page.locator('.actionBar .cta').click();

    /* One tick, so nothing to rank: straight to her age. */
    await expect(heading(page)).toContainText('What is your age');
    await page.locator('.opt').nth(3).click();                 // 50 to 59
    await expect(heading(page)).toContainText('not the only one');
    await page.locator('.actionBar .cta').click();
    await expect(heading(page)).toContainText('Do you still have periods');
    await page.locator('.opt').nth(2).click();                 // stopped
    await expect(heading(page)).toContainText('anything else');
    await page.locator('.opt').nth(4).click();                 // nothing like that
    await expect(heading(page)).toContainText('mood changed');
    await page.locator('.actionBar .cta.ghost').click();       // none of these
    await expect(heading(page)).toContainText('last year');
    await page.locator('.opt').nth(5).click();                 // none of these
    await page.locator('.actionBar .cta').first().click();
    await expect(heading(page)).toContainText('How often');
    await page.locator('.opt').nth(2).click();
    await expect(heading(page)).toContainText('have in common');
    await page.locator('.actionBar .cta').click();
    await expect(heading(page)).toContainText('already tried');
    await page.locator('.actionBar .cta.ghost').click();       // nothing yet

    /* Nothing tried, so "did any of it help" is not asked. */
    await expect(page.locator('#ef')).toBeVisible({ timeout: 25_000 });
    await page.fill('#nf', 'Dana');
    await page.fill('#ef', 'dana@example.com');
    await page.locator('#cf').check();
    await page.locator('.actionBar .cta').click();

    await expect(page.locator('.verdict .name')).toHaveText('Menopause');
    await page.locator('.actionBar .cta').click();
    await expect(heading(page)).toContainText('What you told me');
    await page.locator('.actionBar .cta').click();

    /* Her first step is the last screen. No price, no kit, no shop link. */
    await expect(heading(page)).toContainText('Where to start');
    await expect(page.getByText('One thing to start with, for the poor sleep')).toBeVisible();
    await expect(page.locator('.actionBar')).toHaveCount(0);
    await expect(page.locator('.ocCta')).toHaveCount(0);
    const hrefs = await page.locator('a[href]').evaluateAll(
      (as) => as.map((a) => a.getAttribute('href') ?? ''),
    );
    expect(hrefs.filter((h) => h.includes('shop.jjsmithonline.com')), 'no shop link').toEqual([]);
    await expect(page.getByText('$')).toHaveCount(0);
  });

  test('the loader is not re-entered by the back button', async ({ page }) => {
    await startQuiz(page);

    await page.locator('.tile').nth(1).click();
    await answerAndWait(page, pressPrimary(page), /What is your age/);
    await answerAndWait(page, pickOption(page, 2), /not the only one/);
    await answerAndWait(page, pressPrimary(page), /Do you still have periods/);
    await answerAndWait(page, pickOption(page, 1), /how regular/);
    await answerAndWait(page, pickOption(page, 0), /mood changed/);
    await answerAndWait(page, pressSecondary(page), /last year/);
    await page.locator('.opt').nth(3).click();
    await answerAndWait(page, pressPrimary(page), /How often/);
    await answerAndWait(page, pickOption(page, 2), /have in common/);
    await answerAndWait(page, pressPrimary(page), /already tried/);
    /* She has to have tried something, or the next question is skipped. */
    await page.locator('.opt').nth(0).click();
    await answerAndWait(page, pressPrimary(page), /Did any of it help/);
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
  test('exits at s4b, shows no gate, no price and no shop link', async ({ page }) => {
    await startQuiz(page);
    await page.locator('.tile').nth(0).click();
    await answerAndWait(page, pressPrimary(page), /What is your age/);
    await answerAndWait(page, pickOption(page, 4), /not the only one/);          // 60+
    await answerAndWait(page, pressPrimary(page), /Do you still have periods/);

    /* Still bleeding at sixty is D, and docReason is settled right here. She
       goes straight to rDoc: no regularity question, no name, and above all
       no email gate. Before the exit she walked nine more screens and handed
       over an address, and was then refused. */
    await answerAndWait(page, pickOption(page, 0), /Take this to your doctor/);

    await expect(page.locator('#ef'), 'the email gate must never appear on the doctor route')
      .toHaveCount(0);
    await expect(page.locator('#nf'), 'she is never asked her name either').toHaveCount(0);

    const hrefs = await page.locator('a[href]').evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).href));
    expect(hrefs.filter((h) => h.includes('shop.jjsmithonline.com')), 'the doctor route must never link to the shop').toEqual([]);
    expect(await page.content()).not.toContain('49.99');
    await expectNoHorizontalOverflow(page, 'rDoc');
  });
});
