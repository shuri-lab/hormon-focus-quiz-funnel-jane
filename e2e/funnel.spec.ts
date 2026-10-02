import { test, expect } from '@playwright/test';
import {
  expectNoHorizontalOverflow, expectTapTargets, startQuiz, heading,
  answerAndWait, pickOption, pressPrimary,
} from './helpers';

/* Must match src/lib/angles.ts. A slug that no longer exists would otherwise
   redirect to the default page and pass silently, so the URL is asserted. */
const ANGLES = ['', 'bloating', 'hot-flashes', 'night-sweats', 'sleep', 'weight', 'mood'];

test.describe('the cover', () => {
  for (const slug of ANGLES) {
    test(`/${slug} lays out and offers a way in`, async ({ page }) => {
      await page.goto(`/${slug}`);
      await page.waitForLoadState('networkidle');

      // a retired slug redirects to '/', which would otherwise pass unnoticed
      await expect(page).toHaveURL(new RegExp(`/${slug}$`));

      await expectNoHorizontalOverflow(page, `/${slug}`);
      await expectTapTargets(page, `/${slug}`);

      /* One button, and she can reach it without scrolling. */
      const cta = page.locator('.heroCta .cta');
      await expect(cta).toHaveCount(1);
      await expect(cta).toBeInViewport();
      await expect(page.locator('h1')).toBeVisible();
    });
  }

  test('an unknown slug falls back to the default page rather than a 404', async ({ page }) => {
    await page.goto('/not-a-real-angle');
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('the cover is one screen: the headline, one line, one button, and nothing sold', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Over 40 and struggling with');
    await expect(page.locator('.coverSub')).toHaveText('Answer 7 quick questions. Find out why you feel this way and what to do next.');
    await expect(page.locator('a.cta')).toHaveCount(1);
    await expect(page.locator('a.cta')).toContainText('GET THE HORMONE CHECK');
    /* No rating, no review, no bottle, no price before she has a result. */
    await expect(page.getByText('4.9')).toHaveCount(0);
    await expect(page.locator('.rev')).toHaveCount(0);
    expect(await page.content()).not.toContain('customer-1.jpg');
    /* And the stage is the reveal, not the premise. */
    await expect(page.locator('h1')).not.toContainText(/menopause/i);
    await expect(page.locator('.coverSub')).not.toContainText(/menopause/i);
  });

  test('the ad angle seeds its symptom into the quiz', async ({ page }) => {
    await page.goto('/bloating');
    await page.evaluate(() => sessionStorage.clear());
    await page.goto('/bloating');
    await page.locator('.heroCta .cta').first().click();

    await expect(page).toHaveURL(/\/bloating\/quiz$/);
    await expect(heading(page)).toContainText('What has been bothering you lately');
    await expect(page.locator('.tile[aria-pressed="true"]')).toHaveCount(1);
    await expect(page.locator('.tile[aria-pressed="true"]')).toContainText('Bloating');
  });
});

/* Tiles, in order: weight, sleep, energy, hot flashes, bloating, mood. */

test.describe('the quiz', () => {
  test('seven questions, the email unlock, her result, then one kit page', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));

    await startQuiz(page);

    /* 1. What is bothering her. No product, rating or review on the screen. */
    await expect(heading(page)).toContainText('What has been bothering you lately');
    await expect(page.locator('.stepno')).toHaveText('1 of 7');
    await expect(page.locator('.footTrust')).toHaveCount(0);
    await expectTapTargets(page, 'q1');
    await page.locator('.tile').nth(0).click();                // weight
    await page.locator('.tile').nth(1).click();                // sleep
    await page.locator('.tile').nth(2).click();                // energy
    await answerAndWait(page, pressPrimary(page), /Which one bothers you the most/);

    /* 2. Only the three she ticked are offered. */
    await expect(page.locator('.stepno')).toHaveText('2 of 7');
    await expect(page.locator('.opt')).toHaveCount(3);
    await answerAndWait(page, pickOption(page, 1), /How old are you/);       // sleep

    /* 3. Six age bands. */
    await expect(page.locator('.opt')).toHaveCount(6);
    await answerAndWait(page, pickOption(page, 2), /happening with your cycle/);   // 45–49

    /* 4. One cycle question. "Less predictable" needs no follow-up. */
    await expect(page.locator('.stepno')).toHaveText('4 of 7');
    await answerAndWait(page, pickOption(page, 1), /When do you notice these changes most/);

    /* 5. Her own answers are said back to her, the one she named first. */
    await expect(page.locator('.stepno')).toHaveText('5 of 7');
    await expect(page.locator('.qlead'))
      .toHaveText('You mentioned poor sleep, stubborn weight gain and low energy.');
    await answerAndWait(page, pickOption(page, 2), /What have you already tried/);  // most weeks

    /* 6. What she tried. */
    await page.locator('.opt').nth(0).click();                 // eating differently
    await page.locator('.opt').nth(1).click();                 // exercising more
    await answerAndWait(page, pressPrimary(page), /If one thing could feel better again/);

    /* 7. What she wants. */
    await expect(page.locator('.stepno')).toHaveText('7 of 7');
    await page.locator('.opt').nth(1).click();                 // sleep through the night

    /* The loader is short and hands off on its own. */
    await expect(page.locator('#ef')).toBeVisible({ timeout: 8_000 });
    await expect(heading(page)).toHaveText('Your Hormone Check is ready.');
    await expect(page.getByText('Your results will appear immediately.')).toBeVisible();
    await expect(page.getByText('Where should')).toHaveCount(0);
    await page.fill('#nf', 'Renee');
    await page.fill('#ef', 'renee@example.com');

    /* A valid address is not enough: the opt-in is unticked and required. */
    await expect(page.locator('#cf')).not.toBeChecked();
    await expect(page.locator('.actionBar .cta')).toBeDisabled();
    await page.locator('#cf').check();
    await expect(page.locator('.actionBar .cta')).toHaveText('SHOW ME MY RESULTS');
    await page.locator('.actionBar .cta').click();

    /* RESULT PAGE 1. One named answer, said in one sentence. */
    await expect(page.locator('.resKicker')).toHaveText('Renee, your Hormone Check result');
    await expect(heading(page)).toHaveText('Perimenopause');
    await expect(page.locator('.resLine')).toHaveText(
      'Your answers match the pattern of perimenopause, the years before your periods stop.',
    );

    /* What she told us, with the pictures she tapped, the one she named first. */
    const pics = page.locator('.resPics figure');
    await expect(pics).toHaveCount(3);
    await expect(pics.first()).toContainText('Bothers you most');
    await expect(pics.first()).toContainText('Poor sleep');
    await expect(pics.first().locator('img')).toHaveAttribute('src', /symptom-sleep/);
    await expect(page.locator('.resFacts')).toContainText('Most weeks');
    await expect(page.locator('.resFacts')).toContainText('Less predictable');
    await expect(page.getByText('That is why poor sleep, stubborn weight gain and low energy can all show up at the same time.')).toBeVisible();
    await expect(page.getByText('To sleep through the night.')).toBeVisible();
    await expectNoHorizontalOverflow(page, 'r1 result');

    /* Women like her, before any price: faces, the 4.9, and a review that
       speaks to the concern she named. */
    await expect(page.locator('.resProof .pfFaces img')).toHaveCount(6);
    await expect(page.locator('.resProof .pfRating')).toContainText('4.9');
    await expect(page.locator('.resProof .kitRev').first()).toContainText('I sleep better');

    /* It is one answer: no hedging between two, and still nothing to buy. */
    const resultText = await page.locator('.rise').innerText();
    for (const banned of ['between two', 'closer fit', 'may be part of the picture', 'You have ', 'estrogen', '$']) {
      expect(resultText, banned).not.toContain(banned);
    }
    await expect(page.locator('a[href*="shop.jjsmithonline.com"]')).toHaveCount(0);

    await expect(page.locator('.actionBar .cta')).toContainText('SHOW ME WHAT TO DO NEXT');
    await page.locator('.actionBar .cta').click();

    /* RESULT PAGE 2. What to do, then the kit, on one page she scrolls. */
    await expect(heading(page)).toHaveText('So what do you do now?');
    await expect(page.getByText('You told us you have already tried changing how you eat and exercising more.')).toBeVisible();
    await expect(page.locator('.nextList li')).toHaveCount(5);
    await expect(page.getByText('This is exactly why I created the 60-Day Feel Like YOU Again Kit.')).toBeVisible();
    await expect(page.locator('.actionBar'), 'no Continue button once the offer begins').toHaveCount(0);
    await expectNoHorizontalOverflow(page, 'r2 kit page');
    await expectTapTargets(page, 'r2 kit page');

    /* The offer is the one on JJ's page: the kit first, one bottle under it. */
    const kit = page.locator('.kitLead');
    await expect(kit.locator('.kitVs li')).toHaveCount(4);
    await expect(kit).toContainText('$196.99');
    await expect(kit.locator('.kitNow')).toHaveText('$74.99');
    await expect(kit.locator('.kitDay')).toHaveText('$1.25 a day');
    await expect(kit.locator('a.kitBtn')).toContainText('Get the 60-Day Kit');
    await expect(kit.locator('a.kitBtn'))
      .toHaveAttribute('href', /shop\.jjsmithonline\.com\/cart\/54330638663791:1.*discount=HF60FREESHIP/);

    const bottle = page.locator('.kitQuiet');
    await expect(bottle.locator('a.kitBtn')).toContainText('Get 1 bottle · $49.99');
    await expect(bottle.locator('a.kitBtn')).toHaveAttribute('href', /cart\/41200079175791:1/);
    await bottle.locator('.kitOpt').nth(1).click();
    await expect(bottle.locator('a.kitBtn')).toContainText('Subscribe & save · $39.99');
    await expect(bottle.locator('a.kitBtn'))
      .toHaveAttribute('href', /cart\/add\?id=54355951845487.*selling_plan=5529010287/);

    /* Proof comes after the offer, in three places. She said sleep bothers
       her most, so the first review she reads is about sleep. */
    await expect(page.locator('[data-proof="lead"] .kitRev')).toHaveCount(3);
    await expect(page.locator('[data-proof="lead"] .kitRev').first()).toContainText('I sleep better');
    await expect(page.locator('[data-proof="more"] .kitRev')).toHaveCount(4);
    await expect(page.locator('[data-proof="closing"] .kitRev')).toHaveCount(1);
    await expect(page.locator('.kitSec .pfFaces img')).toHaveCount(12);
    await expect(page.locator('.kitSec .pfRating').first()).toContainText('171 reviews');
    await expect(page.locator('.pfFb img')).toHaveAttribute('alt', /Martinez Sullivan/);

    /* The guarantee, the questions, and the button again. */
    await expect(page.locator('.kitPromise')).toContainText('60-Day Happiness Guarantee');
    await expect(page.locator('.kitFaq details')).toHaveCount(5);
    await expect(page.locator('a[data-close]')).toHaveText(/START MY 60 DAYS/);
    await expect(page.locator('a[data-close]'))
      .toHaveAttribute('href', /54330638663791:1.*discount=HF60FREESHIP/);

    /* No health answer or result rides in any link out. */
    const out = await page.locator('a[href*="shop.jjsmithonline.com"]').evaluateAll(
      (as) => as.map((a) => a.getAttribute('href') ?? ''),
    );
    expect(out.length).toBeGreaterThanOrEqual(3);
    for (const h of out) expect(h).not.toMatch(/outcome|perimenopause|sleep|symptom/i);

    expect(errors, 'javascript errors during the run').toEqual([]);
  });

  test('one symptom skips the ranking, and stopped periods ask the twelve-month question', async ({ page }) => {
    await startQuiz(page);
    await page.locator('.tile').nth(3).click();                // hot flashes, one tick
    await answerAndWait(page, pressPrimary(page), /How old are you/);
    await expect(page.locator('.stepno')).toHaveText('3 of 7');
    await answerAndWait(page, pickOption(page, 3), /happening with your cycle/);   // 50–54
    await answerAndWait(page, pickOption(page, 3), /at least 12 months/);          // stopped
    await expect(page.locator('.stepno')).toHaveText('4 of 7');
    await expect(page.locator('.opt')).toHaveCount(4);
    await answerAndWait(page, pickOption(page, 0), /When do you notice/);          // yes
    await expect(page.locator('.qlead')).toHaveText('You mentioned hot flashes or night sweats.');
    await answerAndWait(page, pickOption(page, 3), /already tried/);

    /* "Nothing yet" is exclusive in both directions. */
    await page.locator('.opt').nth(0).click();
    await page.locator('.opt').nth(6).click();
    await expect(page.locator('.opt[aria-pressed="true"]')).toHaveCount(1);
    await expect(page.locator('.opt[aria-pressed="true"]')).toContainText('Nothing yet');
    await answerAndWait(page, pressPrimary(page), /If one thing could feel better/);
    await page.locator('.opt').nth(3).click();                 // stop feeling hot

    await expect(page.locator('#ef')).toBeVisible({ timeout: 8_000 });
    await page.fill('#ef', 'dana@example.com');                // no name given
    await page.locator('#cf').check();
    await page.locator('.actionBar .cta').click();

    /* Menopause, and it is shown the kit like every result but the doctor's. */
    await expect(heading(page)).toHaveText('Menopause');
    await expect(page.locator('.resKicker')).toHaveText('Your Hormone Check result');
    await expect(page.locator('.resFacts')).toContainText('Stopped 12 months or more');
    await expect(page.locator('.resPics figure')).toHaveCount(1);
    await expect(page.locator('.resPics figure')).not.toContainText('Bothers you most');
    /* Her wish is softened on the way back, so it cannot read as a promise. */
    await expect(page.getByText('To feel cooler and more comfortable.')).toBeVisible();
    await page.locator('.actionBar .cta').click();

    await expect(heading(page)).toHaveText('So what do you do now?');
    await expect(page.getByText('You told us you have already tried')).toHaveCount(0);
    await expect(page.locator('.kitLead .kitNow')).toHaveText('$74.99');
    await expect(page.locator('[data-proof="lead"] .kitRev').first()).toContainText('hot flashes');
  });

  test('the loader is not re-entered by the back button', async ({ page }) => {
    await startQuiz(page);
    await page.locator('.tile').nth(1).click();
    await answerAndWait(page, pressPrimary(page), /How old are you/);
    await answerAndWait(page, pickOption(page, 1), /happening with your cycle/);
    await answerAndWait(page, pickOption(page, 0), /When do you notice/);
    await answerAndWait(page, pickOption(page, 4), /already tried/);
    await page.locator('.opt').nth(6).click();
    await answerAndWait(page, pressPrimary(page), /If one thing could feel better/);
    await page.locator('.opt').nth(5).click();

    await expect(page.locator('#ef')).toBeVisible({ timeout: 8_000 });
    await page.goBack();
    // must land back on a question, never inside the loader
    await expect(page.locator('.loadSpin')).toHaveCount(0);
    await expect(heading(page)).toHaveText(/If one thing could feel better/);
  });

  test('a double tap on Continue advances exactly one screen', async ({ page }) => {
    await startQuiz(page);
    await page.locator('.tile').nth(0).click();
    await page.locator('.tile').nth(1).click();
    await page.locator('.actionBar .cta').first().dblclick();
    // q1 -> q2, and never q1 -> q3
    await expect(heading(page)).toHaveText(/Which one bothers you the most/);
  });
});

/* The one test that is not about polish. */
test.describe('the doctor route is an exit', () => {
  test('exits at the cycle question, shows no gate, no price and no shop link', async ({ page }) => {
    await startQuiz(page);
    await page.locator('.tile').nth(0).click();
    await answerAndWait(page, pressPrimary(page), /How old are you/);
    await answerAndWait(page, pickOption(page, 5), /happening with your cycle/);   // 60+

    /* Periods still coming and going at sixty or over. She goes straight to
       the doctor screen: no more questions, no name, and above all no email. */
    await answerAndWait(page, pickOption(page, 1), /Talk to your healthcare professional first/);

    await expect(page.locator('#ef'), 'the email gate must never appear on the doctor route')
      .toHaveCount(0);
    await expect(page.locator('#nf'), 'she is never asked her name either').toHaveCount(0);

    const hrefs = await page.locator('a[href]').evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).href));
    expect(hrefs.filter((h) => h.includes('shop.jjsmithonline.com')), 'the doctor route must never link to the shop').toEqual([]);
    expect(await page.content()).not.toContain('74.99');
    expect(await page.content()).not.toContain('49.99');
    await expectNoHorizontalOverflow(page, 'rDoc');
  });

  test('under forty with periods stopped waits for the follow-up, then exits', async ({ page }) => {
    await startQuiz(page);
    await page.locator('.tile').nth(1).click();
    await answerAndWait(page, pressPrimary(page), /How old are you/);
    await answerAndWait(page, pickOption(page, 0), /happening with your cycle/);   // under 40
    await answerAndWait(page, pickOption(page, 3), /at least 12 months/);          // stopped
    await answerAndWait(page, pickOption(page, 0), /Talk to your healthcare professional first/);
    await expect(page.locator('#ef')).toHaveCount(0);
  });

  test('medication or surgery is not a doctor exit: she gets her result', async ({ page }) => {
    await startQuiz(page);
    await page.locator('.tile').nth(1).click();
    await answerAndWait(page, pressPrimary(page), /How old are you/);
    await answerAndWait(page, pickOption(page, 1), /happening with your cycle/);   // 40–44
    await answerAndWait(page, pickOption(page, 4), /When do you notice/);          // birth control, medication or surgery
    await answerAndWait(page, pickOption(page, 1), /already tried/);
    await page.locator('.opt').nth(4).click();
    await answerAndWait(page, pressPrimary(page), /If one thing could feel better/);
    await page.locator('.opt').nth(0).click();
    await expect(page.locator('#ef')).toBeVisible({ timeout: 8_000 });
    await page.fill('#ef', 'dana@example.com');
    await page.locator('#cf').check();
    await page.locator('.actionBar .cta').click();
    await expect(heading(page)).toHaveText('Perimenopause');
    /* The result says plainly what it was read from. */
    await expect(page.getByText('this result comes from your age and your symptoms')).toBeVisible();
  });
});
