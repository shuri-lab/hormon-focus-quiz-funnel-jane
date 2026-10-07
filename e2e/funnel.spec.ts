import { test, expect } from '@playwright/test';
import {
  expectNoHorizontalOverflow, expectTapTargets, startQuiz, heading,
  answerAndWait, blockKlaviyo, pickOption, pressPrimary,
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
    await expect(page.locator('h1')).toContainText('Struggling with');
    await expect(page.locator('h1')).not.toContainText('Over 40');
    /* The wordmark sits in a bar of its own now, the way JJ's page has it,
       rather than floating above the copy. */
    await expect(page.locator('.masthead img')).toHaveAttribute('alt', 'JJ Smith');
    await expect(page.locator('.proofPill')).toContainText('Join 16,000+ women');
    await expect(page.locator('.coverSub'))
      .toHaveText("Find out what's really going on with your body. Take the free 1-minute quiz.");
    await expect(page.locator('a.cta')).toHaveCount(1);
    await expect(page.locator('a.cta')).toContainText('Get my hormone check');
    await expect(page.locator('.ctaNote')).toHaveText('Free · 1 minute');

    /* The alert bar and the social-proof row are David's additions. */
    await expect(page.locator('.alertBar')).toContainText('Take the 1-minute quiz');
    /* Four customer faces, because the claim beside them counts customers. */
    await expect(page.locator('.proofFaces i')).toHaveCount(4);

    /* Still nothing sold: no rating number, no review, no bottle, no price
       before she has a result. The faces are the one photograph allowed, and
       they carry a claim scoped to JJ's programmes rather than to Hormone
       Focus customers. */
    await expect(page.getByText('4.9')).toHaveCount(0);
    await expect(page.locator('.rev')).toHaveCount(0);
    await expect(page.getByText(/\$/)).toHaveCount(0);
    /* And the stage is the reveal, not the premise. */
    await expect(page.locator('h1')).not.toContainText(/menopause/i);
    await expect(page.locator('.coverSub')).not.toContainText(/menopause/i);
  });

  test('the ad angle seeds its symptom into the quiz', async ({ page }) => {
    await page.goto('/bloating');
    await page.evaluate(() => sessionStorage.clear());
    await page.goto('/bloating');
    await page.locator('.heroCta .cta').first().click();

    /* Every step has an address now, so the cover lands on the first one by
       name rather than on a bare /quiz that could be any screen. */
    await expect(page).toHaveURL(/\/bloating\/quiz\/symptoms$/);
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
    await answerAndWait(page, pressPrimary(page), /want most right now/);

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
    expect(await page.locator('#cf').evaluate((el) => getComputedStyle(el).backgroundColor),
      'the tick box is white').toBe('rgb(255, 255, 255)');
    await expect(page.locator('.actionBar .cta')).toBeDisabled();
    await page.locator('#cf').check();
    await expect(page.locator('.actionBar .cta')).toHaveText('SHOW ME MY RESULTS');
    await page.locator('.actionBar .cta').click();

    /* RESULT PAGE 1. What her answers POINT TO, said in one sentence.
       SOFTENED 7 OCTOBER 2026: the heading used to be the bare stage word
       ("Perimenopause") with the sentence under it in `.resLine`. The bare
       stage word is no longer printed at all, so the heading is the sentence
       and `.resLine` is gone. */
    await expect(page.locator('.resKicker')).toHaveText('Renee, your Hormone Check result');
    await expect(heading(page)).toHaveText(
      'Your answers point to perimenopause, the years before your periods stop.',
    );
    await expect(page.locator('.resLine')).toHaveCount(0);
    /* No heading on the result may be the bare stage word on its own. */
    await expect(heading(page)).not.toHaveText(/^(peri)?menopause$/i);

    /* What she told us, with the pictures she tapped, the one she named first. */
    const pics = page.locator('.resPics figure');
    await expect(pics).toHaveCount(3);
    await expect(pics.first()).toContainText('Bothers you most');
    await expect(pics.first()).toContainText('Poor sleep');
    await expect(pics.first().locator('img')).toHaveAttribute('src', /symptom-sleep/);
    await expect(page.locator('.resFacts')).toContainText('Most weeks');
    await expect(page.locator('.resFacts')).toContainText('Less predictable');
    /* WHAT THIS MEANS, 6 October 2026. The one generated sentence became
       Jane's block for her outcome, then the line for the symptom she said
       bothers her most, then the line for how often it hits her, then a fixed
       heading and paragraph for that symptom. She is perimenopause, her main
       concern is sleep, and she sees it most weeks. */
    await expect(page.getByText('Menopause is when your periods stop for good.', { exact: false })).toBeVisible();
    await expect(page.getByText("That's why your sleep changed, even though your bedtime didn't.")).toBeVisible();
    await expect(page.getByText('Most weeks is often enough to spot a pattern. Start writing it down.')).toBeVisible();
    /* THE SOFTENING, 7 OCTOBER. Every result reads this after the close line. */
    await expect(page.getByText('This is a normal stage, not an illness.', { exact: false })).toBeVisible();
    /* The doctor line belongs to early menopause only, and she is B. */
    await expect(page.getByText('take to your doctor soon', { exact: false })).toHaveCount(0);
    await expect(page.getByText('Why your sleep has changed')).toBeVisible();
    await expect(page.getByText('In this stage, sleep gets easier to break.', { exact: false })).toBeVisible();
    /* Sleep IS her main concern, so the extra sleep sentence is not appended. */
    await expect(page.getByText('Your sleep is poor too', { exact: false })).toHaveCount(0);
    await expect(page.getByText('To sleep through the night.')).toBeVisible();
    await expectNoHorizontalOverflow(page, 'r1 result');

    /* One fact about women at her stage, with its source, and no product yet. */
    await expect(page.locator('.resFact')).toContainText('Perimenopause usually starts in the mid-40s');
    await expect(page.locator('.resFact')).toContainText('Source: Cleveland Clinic');
    await expect(page.locator('.rise .kitRev')).toHaveCount(0);
    await expect(page.locator('.rise .pfFaces')).toHaveCount(0);

    /* It is one answer: no hedging between two, and still nothing to buy. */
    const resultText = await page.locator('.rise').innerText();
    for (const banned of ['between two', 'closer fit', 'may be part of the picture', 'You have ', 'estrogen', '$']) {
      expect(resultText, banned).not.toContain(banned);
    }
    await expect(page.locator('a[href*="shop.jjsmithonline.com"]')).toHaveCount(0);

    await expect(page.locator('.actionBar .cta')).toContainText('SHOW ME WHAT TO DO NEXT');
    await page.locator('.actionBar .cta').click();

    /* RESULT PAGE 2. Her 60 days, named for what she picked, then the how,
       answered by the kit, then women who did it, all before the price. */
    await expect(heading(page)).toHaveText('Your 60-day plan for better sleep');
    await expect(page.getByText('You told us you have already tried changing how you eat and exercising more.')).toBeVisible();

    /* HER FIRST THREE THINGS replaced the five generic steps. Sleep first
       because she named it, then the other two she ticked in tile order. */
    await expect(page.getByText('Your first three things')).toBeVisible();
    const cards = page.locator('.priCard');
    await expect(cards).toHaveCount(3);
    await expect(cards.nth(0)).toContainText('Protect your sleep');
    await expect(cards.nth(1)).toContainText('Build meals that keep you full');
    await expect(cards.nth(2)).toContainText('Build steadier energy');

    /* What she already tried is acknowledged inside the card it belongs to:
       eating differently on the weight card, exercising more on the energy
       card. She did not say she had worked on her sleep, so that card has no
       acknowledgement on it. */
    await expect(cards.nth(1)).toContainText("You've already changed how you eat");
    await expect(cards.nth(2)).toContainText("More cardio won't work.");
    await expect(cards.nth(0)).not.toContainText('already worked on your sleep');

    await expect(page.locator('.nextHowQ')).toContainText('This is why I made the 60-Day Kit');
    await expect(page.getByText('Knowing what to do is one thing.', { exact: false })).toBeVisible();
    await expect(page.locator('.nextPieces > div')).toHaveCount(4);
    await expect(page.locator('[data-proof="pre"] .pfFaces img')).toHaveCount(6);
    /* THE LEAD REVIEW IS NO LONGER PERSONALISED. It used to answer her main
       concern — a woman who said sleep met a woman who slept. David asked for
       the four from JJ's own "Join the women" section, which are the same for
       everyone, so this asserts those instead. LEAD_FOR is still exported, so
       putting the personalised set back is one line in reviews.ts. */
    await expect(page.locator('[data-proof="pre"] .kitRev').first())
      .toContainText('given me my life back');
    /* The proof comes before the offer on the page. */
    const order = await page.evaluate(() => {
      const pre = document.querySelector('[data-proof="pre"]');
      const offer = document.querySelector('#kit-offer');
      return pre && offer ? Boolean(pre.compareDocumentPosition(offer) & Node.DOCUMENT_POSITION_FOLLOWING) : false;
    });
    expect(order, 'proof sits above the offer').toBe(true);
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
    /* Four from JJ's page: the first stands alone above the offer, the other
       three sit under it. */
    await expect(page.locator('[data-proof="lead"] .kitRev')).toHaveCount(3);
    await expect(page.locator('[data-proof="more"] .kitRev')).toHaveCount(4);
    await expect(page.locator('[data-proof="closing"] .kitRev')).toHaveCount(1);
    await expect(page.locator("[data-proof=\"lead\"]").locator("xpath=..").locator(".pfFaces img")).toHaveCount(12);
    await expect(page.locator('.kitSec .pfRating').first()).toContainText('171 reviews');
    await expect(page.locator('.pfFb img')).toHaveAttribute('alt', /Martinez Sullivan/);

    /* The guarantee, the questions, and the button again. */
    await expect(page.locator('.kitPromise')).toContainText('60-Day Happiness Guarantee');
    /* JJ's own six questions now, at David's request. */
    await expect(page.locator('.kitFaq details')).toHaveCount(6);
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
    await answerAndWait(page, pressPrimary(page), /want most right now/);
    await page.locator('.opt').nth(3).click();                 // stop feeling hot

    await expect(page.locator('#ef')).toBeVisible({ timeout: 8_000 });
    await page.fill('#ef', 'dana@example.com');                // no name given
    await page.locator('#cf').check();
    await page.locator('.actionBar .cta').click();

    /* Menopause, and it is shown the kit like every result but the doctor's. */
    await expect(heading(page)).toHaveText('Your answers point to menopause.');
    await expect(page.getByText('Many women describe the same changes after that point.')).toBeVisible();
    await expect(page.getByText('This is a normal stage, not an illness.', { exact: false })).toBeVisible();
    await expect(page.locator('.resKicker')).toHaveText('Your Hormone Check result');
    await expect(page.locator('.resFacts')).toContainText('Stopped 12 months or more');
    await expect(page.locator('.resPics figure')).toHaveCount(1);
    await expect(page.locator('.resPics figure')).not.toContainText('Bothers you most');
    /* Her wish is softened on the way back, so it cannot read as a promise. */
    await expect(page.getByText('To feel cooler and more comfortable.')).toBeVisible();
    await page.locator('.actionBar .cta').click();

    await expect(heading(page)).toHaveText('Your 60-day plan for cooler days and nights');
    await expect(page.getByText('You told us you have already tried')).toHaveCount(0);
    await expect(page.locator('.kitLead .kitNow')).toHaveText('$74.99');
    /* Same four whatever she answered — see the note on the lead review above. */
    await expect(page.locator('[data-proof="pre"] .kitRev').first())
      .toContainText('given me my life back');
  });

  test('the loader is not re-entered by the back button', async ({ page }) => {
    await startQuiz(page);
    await page.locator('.tile').nth(1).click();
    await answerAndWait(page, pressPrimary(page), /How old are you/);
    await answerAndWait(page, pickOption(page, 1), /happening with your cycle/);
    await answerAndWait(page, pickOption(page, 0), /When do you notice/);
    await answerAndWait(page, pickOption(page, 4), /already tried/);
    await page.locator('.opt').nth(6).click();
    await answerAndWait(page, pressPrimary(page), /want most right now/);
    await page.locator('.opt').nth(5).click();

    await expect(page.locator('#ef')).toBeVisible({ timeout: 8_000 });
    await page.goBack();
    // must land back on a question, never inside the loader
    await expect(page.locator('.loadSpin')).toHaveCount(0);
    await expect(heading(page)).toHaveText(/want most right now/);
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
    await answerAndWait(page, pressPrimary(page), /want most right now/);
    await page.locator('.opt').nth(0).click();
    await expect(page.locator('#ef')).toBeVisible({ timeout: 8_000 });
    await page.fill('#ef', 'dana@example.com');
    await page.locator('#cf').check();
    await page.locator('.actionBar .cta').click();
    await expect(heading(page)).toHaveText(
      'Your answers point to perimenopause, the years before your periods stop.',
    );
    /* The result says plainly what it was read from. */
    await expect(page.getByText('this result comes from your age and your symptoms')).toBeVisible();
  });
});

/* ------------------------------------------------- every screen has a URL -- */

test.describe('the addresses', () => {
  /* The review build used to need a bar of jump buttons across the top to
     reach these, which ate two thirds of a phone screen and could not ship.
     A URL does the same job in production. */
  const STEPS = [
    ['symptoms', 'What has been bothering you lately'],
    ['what-bothers-you-most', 'Which one bothers you the most'],
    ['your-age', 'How old are you'],
    ['your-cycle', 'What has been happening with your cycle'],
    ['when-you-notice-it', 'When do you notice these changes most'],
    ['what-you-have-tried', 'What have you already tried'],
    ['what-you-want', 'What do you want most right now'],
    ['your-result', 'Your Hormone Check is ready'],
    ['result', ''],
    ['kit', 'Your 60-day plan'],
    ['speak-to-your-doctor', 'Talk to your healthcare professional'],
  ] as const;

  for (const [slug, heading] of STEPS) {
    test(`/quiz/${slug} opens that screen directly`, async ({ page }) => {
      await page.goto(`/quiz/${slug}`);
      await expect(page).toHaveURL(new RegExp(`/quiz/${slug}$`));
      if (heading) await expect(page.locator('body')).toContainText(heading);
      await expectNoHorizontalOverflow(page, `/quiz/${slug}`);
    });
  }

  test('a bare /quiz and a mistyped step both land on the first question', async ({ page }) => {
    await page.goto('/quiz');
    await expect(page).toHaveURL(/\/quiz\/symptoms$/);

    await page.goto('/quiz/not-a-step');
    await expect(page).toHaveURL(/\/quiz\/symptoms$/);

    await page.goto('/bloating/quiz/not-a-step');
    await expect(page).toHaveURL(/\/bloating\/quiz\/symptoms$/);
  });

  test('the ad parameters ride along in the address bar, step to step', async ({ page }) => {
    const ad = 'utm_source=instagram&utm_medium=dm&utm_campaign=hf-260924-sweats';
    await page.goto(`/quiz/symptoms?${ad}`);
    await page.evaluate(() => sessionStorage.clear());
    await page.goto(`/quiz/symptoms?${ad}`);

    await page.locator('.tile').first().click();
    await page.locator('.actionBar .cta').first().click();

    /* The step moved and the attribution came with it. */
    await expect(page).not.toHaveURL(/\/quiz\/symptoms/);
    for (const pair of ad.split('&')) {
      await expect(page).toHaveURL(new RegExp(pair.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    }
  });

  test('the review jump bar is gone', async ({ page }) => {
    await page.goto('/quiz/kit');
    await expect(page.locator('.reviewBar')).toHaveCount(0);
    await expect(page.getByRole('button', { name: /^Kit page$/ })).toHaveCount(0);
  });
});

/* ------------------------------------------------- the kit page, reworked -- */

test.describe('the kit page', () => {
  test('the proof block is the four from JJ\'s own page, in her order', async ({ page }) => {
    await page.goto('/quiz/kit');
    const names = await page.locator('[data-proof="pre"] .kitRev, [data-proof="lead"] .kitRev')
      .evaluateAll((els) => els.map((e) => e.textContent ?? ''));
    const joined = names.join(' ');
    for (const who of ['Anita F.', 'Katina S.', 'Adrienne', 'Roslind']) {
      expect(joined, `${who} is missing from the proof block`).toContain(who);
    }
  });

  test('"Before you start" asks JJ\'s own six questions', async ({ page }) => {
    await page.goto('/quiz/kit');
    const faq = page.locator('.kitFaq');
    await expect(faq).toBeVisible();
    for (const q of [
      'What are the benefits of Hormone Focus?',
      'Does Hormone Focus replace the other Focus supplements',
      'How should you take Hormone Focus?',
      'How long should you take Hormone Focus?',
      'How quickly does Hormone Focus work?',
      'What are the ingredients in Hormone Focus?',
    ]) {
      await expect(faq, q).toContainText(q);
    }
  });

  test('the sticky bar is actually on screen, not merely in the DOM', async ({ page }) => {
    /* THE BUG THIS EXISTS FOR. The screen wrapper .rise keeps a transform
       after its entrance animation — an identity matrix, but not `none` — and
       a transformed ancestor becomes the containing block for its fixed
       descendants. So position:fixed anchored to .rise instead of the
       viewport and this bar sat 8,694px down the page: present, visible,
       z-index 30, and never once on a screen. Counting it in the DOM said
       yes. Only its rectangle said no, so that is what this measures. */
    await page.goto('/quiz/kit');
    const h = await page.evaluate(() => document.body.scrollHeight);
    await page.evaluate((y) => window.scrollTo(0, y), Math.round(h * 0.5));
    await page.waitForTimeout(400);

    const bar = page.locator('.kitSticky');
    await expect(bar).toBeVisible();

    const box = (await bar.boundingBox())!;
    const vh = page.viewportSize()!.height;
    expect(
      box.y < vh && box.y + box.height > 0,
      `the sticky bar is off screen: it sits at ${Math.round(box.y)}px in a ${vh}px viewport`,
    ).toBe(true);
    /* And at the foot of the screen, which is the whole point of it. */
    expect(Math.round(box.y + box.height)).toBeGreaterThan(vh - 120);
  });

  test('the sticky bar takes her to the offer and then gets out of the way',
    async ({ page }) => {
      await page.goto('/quiz/kit');
      const h = await page.evaluate(() => document.body.scrollHeight);
      await page.evaluate((y) => window.scrollTo(0, y), Math.round(h * 0.6));
      await page.waitForTimeout(400);

      await page.locator('.kitSticky button').click();
      await page.waitForTimeout(1200);

      const offer = (await page.locator('.kitBand').first().boundingBox())!;
      expect(Math.abs(offer.y), 'she did not land on the offer').toBeLessThan(140);
      /* The offer is on screen, so the bar stands down. */
      await expect(page.locator('.kitSticky')).toHaveCount(0);
    });

  test('the top bar does not follow her down the kit page', async ({ page }) => {
    await page.goto('/quiz/kit');
    const pos = await page.locator('.appHeader')
      .evaluate((el) => getComputedStyle(el).position);
    expect(pos, 'the header is fixed on a page that already has a sticky bar').toBe('static');
  });

  test('"What women are saying" shows customers whether or not Okendo answers',
    async ({ page }) => {
      /* The live wall is a network call, so this asserts the contract rather
         than the content: either real reviews render, or the authored ones
         do. What must never happen is an empty section or an apology. */
      await page.goto('/quiz/kit');
      const wall = page.locator('.okWall');
      await expect(wall).toBeVisible();
      await wall.scrollIntoViewIfNeeded();
      await expect(wall.locator('.okRev, .kitRev').first()).toBeVisible({ timeout: 15000 });
    });
});

/* ------------------------------------- she arrived from JJ's list ------- */

/* THE 13 OCTOBER EMAIL. The Klaviyo button carries `e` and `fn`, so the women
 * on JJ's list are not asked for an address the list already holds. Two things
 * are being held here: she never meets the gate, and the address is out of the
 * URL before anything can read it.
 */
test.describe('a woman who arrives from the email', () => {
  /* These walk all seven questions, wait out the loader, and two of them then
     make a round trip to the gate. Alone that is about 30 seconds, which is
     inside the 45-second default until four workers are sharing one preview
     server and it is not. The budget is the journey being long, not a slow
     assertion: nothing here waits on anything it should not. */
  test.describe.configure({ timeout: 120_000 });

  const LINK = '/?e=test%40example.com&fn=Test';

  test('walks from the link to her result without ever seeing the gate', async ({ page }) => {
    /* Every request Klaviyo would have received, so the event can be read. */
    const posted: string[] = [];
    await page.route('**/a.klaviyo.com/**', (r) => {
      posted.push(r.request().url() + ' ' + (r.request().postData() ?? ''));
      return r.fulfill({ status: 202, body: '' });
    });

    await page.goto(LINK);
    await page.evaluate(() => sessionStorage.clear());
    await page.goto(LINK);
    await page.waitForTimeout(250);

    /* THE ADDRESS IS OUT OF THE URL, before the share button, the referrer,
       GA4, Clarity, GTM or the Meta pixel can read it. */
    const landed = new URL(page.url());
    expect(landed.searchParams.has('e'), 'the address is stripped on arrival').toBe(false);
    expect(landed.searchParams.has('fn')).toBe(false);
    expect(page.url()).not.toContain('test@example.com');
    expect(page.url()).not.toContain('test%40example.com');

    /* In through the cover, like the link actually sends her. */
    await page.locator('.heroCta .cta').first().click();
    await expect(heading(page)).toContainText('What has been bothering you lately');

    await page.locator('.tile').nth(0).click();                // weight
    await page.locator('.tile').nth(1).click();                // sleep
    await page.locator('.tile').nth(2).click();                // energy
    await answerAndWait(page, pressPrimary(page), /Which one bothers you the most/);
    await answerAndWait(page, pickOption(page, 1), /How old are you/);              // sleep
    await answerAndWait(page, pickOption(page, 2), /happening with your cycle/);    // 45-49
    await answerAndWait(page, pickOption(page, 1), /When do you notice these changes most/);
    await answerAndWait(page, pickOption(page, 2), /What have you already tried/);  // most weeks
    await page.locator('.opt').nth(0).click();
    await answerAndWait(page, pressPrimary(page), /want most right now/);
    await page.locator('.opt').nth(1).click();

    /* STRAIGHT TO HER RESULT. The loader hands off to r1, not to the gate. */
    await expect(page.locator('.resName')).toBeVisible({ timeout: 10_000 });
    await expect(heading(page)).toHaveText(
      'Your answers point to perimenopause, the years before your periods stop.',
    );
    await expect(page.locator('#ef'), 'she is never asked for an address').toHaveCount(0);
    await expect(page.locator('#cf')).toHaveCount(0);
    await expect(page.getByText('Your Hormone Check is ready.')).toHaveCount(0);

    /* The name from the link greets her, and gives her a way out of it. */
    await expect(page.locator('.resKicker')).toHaveText('Test, your Hormone Check result');
    await expect(page.locator('.resNotYou')).toHaveText('Not Test? Enter your email.');

    /* The event still fires, with the address the link carried, and no
       subscription is posted on her behalf. */
    await expect.poll(() => posted.length, { timeout: 10_000 }).toBeGreaterThan(0);
    const events = posted.filter((p) => p.includes('/client/events/'));
    expect(events.length, 'one event').toBe(1);
    expect(events[0]).toContain('test@example.com');
    expect(events[0]).toContain('HF Quiz Completed');
    expect(events[0]).toContain('perimenopause');
    expect(events[0], 'no consent is recorded on her behalf').not.toContain('consent_at');
    expect(
      posted.filter((p) => p.includes('/client/subscriptions/')).length,
      'she is already on the list',
    ).toBe(0);

    /* And her result is whole: the softening line is there like anyone else's. */
    await expect(page.getByText('This is a normal stage, not an illness.', { exact: false })).toBeVisible();
    await expectNoHorizontalOverflow(page, 'r1 from the email link');

    /* A RELOAD IS NOT ANOTHER RUN OF THE FLOW. The gate used to send this on a
       button press, which cannot happen twice; her result page can be
       reloaded all afternoon. */
    await page.reload();
    await expect(page.locator('.resName')).toBeVisible({ timeout: 10_000 });
    await page.waitForTimeout(500);
    expect(
      posted.filter((p) => p.includes('/client/events/')).length,
      'still one event after a reload',
    ).toBe(1);
  });

  test('"Not you?" puts the gate back, empty, with the box unticked', async ({ page }) => {
    await blockKlaviyo(page);
    await page.goto(LINK);
    await page.evaluate(() => sessionStorage.clear());
    await page.goto(`/quiz${LINK.slice(1)}`);
    await page.waitForTimeout(250);

    await page.locator('.tile').nth(1).click();                // sleep only
    await answerAndWait(page, pressPrimary(page), /How old are you/);
    await answerAndWait(page, pickOption(page, 2), /happening with your cycle/);
    await answerAndWait(page, pickOption(page, 1), /When do you notice these changes most/);
    await answerAndWait(page, pickOption(page, 2), /What have you already tried/);
    await page.locator('.opt').nth(0).click();
    await answerAndWait(page, pressPrimary(page), /want most right now/);
    await page.locator('.opt').nth(1).click();

    await expect(page.locator('.resNotYou button')).toBeVisible({ timeout: 10_000 });
    await page.locator('.resNotYou button').click();

    /* The ordinary gate, asked properly. Nothing is prefilled from the link:
       she is telling us who she is, and consenting for herself. */
    await expect(heading(page)).toHaveText('Your Hormone Check is ready.');
    await expect(page.locator('#ef')).toHaveValue('');
    await expect(page.locator('#nf')).toHaveValue('');
    await expect(page.locator('#cf')).not.toBeChecked();
    await expect(page.locator('.actionBar .cta')).toBeDisabled();
  });

  test('a woman with no identity in the link still meets the gate', async ({ page }) => {
    await startQuiz(page);
    await page.locator('.tile').nth(1).click();
    await answerAndWait(page, pressPrimary(page), /How old are you/);
    await answerAndWait(page, pickOption(page, 2), /happening with your cycle/);
    await answerAndWait(page, pickOption(page, 1), /When do you notice these changes most/);
    await answerAndWait(page, pickOption(page, 2), /What have you already tried/);
    await page.locator('.opt').nth(0).click();
    await answerAndWait(page, pressPrimary(page), /want most right now/);
    await page.locator('.opt').nth(1).click();

    await expect(page.locator('#ef')).toBeVisible({ timeout: 10_000 });
    await expect(heading(page)).toHaveText('Your Hormone Check is ready.');
    await expect(page.locator('.resNotYou')).toHaveCount(0);
  });
});
