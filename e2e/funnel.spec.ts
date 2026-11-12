import { test, expect } from '@playwright/test';
import {
  expectNoHorizontalOverflow, expectTapTargets, startQuiz, heading, blockKlaviyo,
  answerAndWait, pickOption, pressPrimary, switchOffers, throughPlan,
} from './helpers';
import { COVER_SUB } from '../src/lib/content';
import { KIT_HERO_HEAD } from '../src/lib/kitCopy';
import {
  GATE_LINE, LOAD_CARDS, PLAN_BOTTLE_CTA, PLAN_BOTTLE_WHY, PLAN_TO_KIT_CTA, RESULT_CASE,
  RESULT_PILL, RESULT_TO_PLAN_V5, STAT_TITLE,
} from '../src/lib/resultCopy';

/* The statistic screen's headline, as a pattern for answerAndWait. */
const STAT_HEAD = new RegExp(STAT_TITLE.slice(0, 20));

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
    /* QUIZ V1, 12 November 2026: the line names the plan she leaves with. */
    await expect(page.locator('.coverSub')).toHaveText(COVER_SUB);
    await expect(page.locator('.coverSub'))
      .toHaveText('Take this 1-minute Hormone Check and get your personal 60-Day Feel Like You Again Plan.');
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
  test('five questions, the statistic, the email unlock, her result, her plan, then the one-bottle offer', async ({ page }) => {
    /* The whole walk, with a loader that now runs about 7.5 seconds on its
       own, ending on the heaviest page in the funnel. */
    test.slow();
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));

    await startQuiz(page);

    /* 1. What is bothering her. No product, rating or review on the screen.
       FIVE QUESTIONS SINCE QUIZ V1 (12 November 2026): "When do you notice
       these changes most" and "What do you want most right now" were cut. */
    await expect(heading(page)).toContainText('What has been bothering you lately');
    await expect(page.locator('.stepno')).toHaveText('1 of 5');
    await expect(page.locator('.footTrust')).toHaveCount(0);
    await expectTapTargets(page, 'q1');
    await page.locator('.tile').nth(0).click();                // weight
    await page.locator('.tile').nth(1).click();                // sleep
    await page.locator('.tile').nth(2).click();                // energy
    await answerAndWait(page, pressPrimary(page), /Which one bothers you the most/);

    /* 2. Only the three she ticked are offered. */
    await expect(page.locator('.stepno')).toHaveText('2 of 5');
    await expect(page.locator('.opt')).toHaveCount(3);
    await answerAndWait(page, pickOption(page, 1), /How old are you/);       // sleep

    /* 3. Six age bands. */
    await expect(page.locator('.stepno')).toHaveText('3 of 5');
    await expect(page.locator('.opt')).toHaveCount(6);
    await answerAndWait(page, pickOption(page, 2), /happening with your cycle/);   // 45–49

    /* 4. One cycle question. "Less predictable" needs no follow-up, and the
       next screen is what she has tried: the timing question is gone. */
    await expect(page.locator('.stepno')).toHaveText('4 of 5');
    await answerAndWait(page, pickOption(page, 1), /What have you already tried/);

    /* 5. What she tried, the last question. */
    await expect(page.locator('.stepno')).toHaveText('5 of 5');
    await page.locator('.opt').nth(0).click();                 // eating differently
    await page.locator('.opt').nth(1).click();                 // exercising more
    await answerAndWait(page, pressPrimary(page), STAT_HEAD);

    /* THE STATISTIC SCREEN, new in Quiz V1: why it has been hard to get
       help, before she is asked for anything more. It keeps question 5's
       number so the count never goes backwards. */
    await expect(page).toHaveURL(/\/quiz\/not-just-you$/);
    await expect(heading(page)).toHaveText(STAT_TITLE);
    await expect(page.locator('.stepno')).toHaveText('5 of 5');
    await expect(page.getByText(/\$/), 'nothing sold on the statistic').toHaveCount(0);
    await expectNoHorizontalOverflow(page, 'stat');
    await page.locator('.actionBar .cta').click();

    /* THE LOADER, about seven and a half seconds, three cards and no review,
       then it hands off on its own. */
    await expect(page).toHaveURL(/\/quiz\/reading-your-answers$/);
    await expect(page.locator('.loadList li')).toHaveCount(3);
    await expect(page.locator('.loadWrap .kitRev, .loadWrap .rev'), 'no review on the loader')
      .toHaveCount(0);
    await expect(page.locator('.nextPieces')).toContainText(LOAD_CARDS[0]);
    await expect(page.locator('#ef')).toBeVisible({ timeout: 15_000 });
    await expect(heading(page)).toHaveText('Your Hormone Check is ready.');
    await expect(page.locator('.rDeck')).toHaveText(GATE_LINE);
    await expect(page.getByText('Where should')).toHaveCount(0);
    await page.fill('#nf', 'Renee');
    await page.fill('#ef', 'renee@example.com');

    /* The opt-in starts unticked and white, and it no longer holds back her
       result: since the V3.5 fix a valid address opens it, and nothing is
       sent to the list unless she ticks. */
    await expect(page.locator('#cf')).not.toBeChecked();
    expect(await page.locator('#cf').evaluate((el) => getComputedStyle(el).backgroundColor),
      'the tick box is white').toBe('rgb(255, 255, 255)');
    await expect(page.locator('.actionBar .cta'), 'her result waits on her address only')
      .toBeEnabled();
    await page.locator('#cf').check();
    await expect(page.locator('.actionBar .cta')).toHaveText('SHOW ME MY RESULTS');
    await page.locator('.actionBar .cta').click();

    /* RESULT PAGE. What her answers MAY POINT TO, said in one sentence, the
       live headline. The bare stage word is never printed on its own. */
    await expect(page).toHaveURL(/\/quiz\/result$/);
    await expect(page.locator('.resKicker')).toHaveText('Renee, here is your result');
    await expect(heading(page)).toHaveText(
      'Your answers may point to perimenopause, the years before your periods stop.',
    );
    await expect(page.locator('.resLine')).toHaveCount(0);
    await expect(heading(page)).not.toHaveText(/^(peri)?menopause$/i);
    await expect(page.locator('.resReassure'))
      .toHaveText('A normal stage, and there is a lot you can do.');
    await expect(page.locator('.resHero .kitPriceSave')).toHaveText(RESULT_PILL);

    /* What she told us, with the pictures she tapped, the one she named first. */
    const pics = page.locator('.resPics figure');
    await expect(pics).toHaveCount(3);
    await expect(pics.first()).toContainText('Bothers you most');
    await expect(pics.first()).toContainText('Poor sleep');
    await expect(pics.first().locator('img')).toHaveAttribute('src', /symptom-sleep/);
    await expect(page.locator('.resFacts')).toContainText('Less predictable');
    /* The timing question is gone, so no "how often" fact is read back. */
    await expect(page.locator('.resFacts')).not.toContainText('Most weeks');

    /* ONE STAGE BLOCK, keyed to her: perimenopause, and the line that ties
       her two top symptoms together (sleep and weight). */
    await expect(page.locator('.resSec .blabel').nth(1)).toHaveText('What perimenopause is');
    await expect(page.locator('.rise'))
      .toContainText('Perimenopause is the time before your periods stop for good.');
    await expect(page.locator('.rise'))
      .toContainText('Short nights make you hungrier the next day');

    /* HER STAGE'S FACT, with the number pulled large. */
    await expect(page.locator('.resStat .blabel')).toHaveText('What to expect');
    await expect(page.locator('.resStatBig')).toHaveText('4 to 8 years');
    await expect(page.locator('.resStatBigLabel'))
      .toHaveText('is how long perimenopause usually lasts. It often starts in your 40s.');
    await expect(page.locator('.resStat')).toContainText('Source: Cleveland Clinic');
    await expect(page.locator('.resHandoff')).toHaveText(RESULT_CASE);
    await expectNoHorizontalOverflow(page, 'r1 result');

    /* It is one answer, and still nothing to buy. */
    const resultText = await page.locator('.rise').innerText();
    for (const banned of ['between two', 'closer fit', 'may be part of the picture', 'You have ', '$']) {
      expect(resultText, banned).not.toContain(banned);
    }
    await expect(page.locator('a[href*="shop.jjsmithonline.com"]')).toHaveCount(0);
    /* The doctor line belongs to early menopause only, and she is B. */
    await expect(page.getByText('take to your doctor soon', { exact: false })).toHaveCount(0);

    await expect(page.locator('.actionBar .cta')).toContainText(RESULT_TO_PLAN_V5);
    await page.locator('.actionBar .cta').click();

    /* HER PLAN, new in Quiz V1: titled for her own symptoms, four steps,
       step one keyed to the one she named, and what she tried read back.
       No price and no shop link: it ends on Hormone Focus and one button. */
    await expect(page).toHaveURL(/\/quiz\/your-plan$/);
    /* Plan v13 (Jane, 12 Nov): her name, "your personal 60-day plan", four
       timed steps, foods named, no product in the steps. */
    await expect(heading(page)).toHaveText(/personal 60-day plan for poor sleep and stubborn weight$/);
    const steps = page.locator('.nStep');
    await expect(steps).toHaveCount(4);
    await expect(steps.nth(0)).toContainText('Days 1 to 7');
    await expect(steps.nth(0)).toContainText('Set up your nights');
    await expect(steps.nth(1)).toContainText('Days 8 to 30');
    await expect(steps.nth(1)).toContainText('Eat more:');
    await expect(steps.nth(1)).toContainText('Cut back:');
    await expect(steps.nth(2)).toContainText('Support your changing hormones');
    await expect(steps.nth(2)).not.toContainText('Hormone Focus');
    await expect(steps.nth(3)).toContainText('Build on what works');
    await expect(steps.nth(3)).toContainText('talk to your doctor');
    await expect(page.locator('.planTease')).toHaveText('Your Hormone Check unlocked a special offer.');
    /* THE ACTIVE OFFER IS THE BOTTLE, so the plan turns to Hormone Focus and
       never shows her the Kit. */
    await expect(page.locator('.bridge', { hasText: PLAN_BOTTLE_WHY })).toHaveCount(1);
    await expect(page.locator('.kitHeroShot.isKit'), 'no Kit on the bottle arm').toHaveCount(0);
    await expect(page.locator('.rise')).not.toContainText('What is inside');
    const planText = await page.locator('.rise').innerText();
    expect(planText, 'no price on the plan').not.toContain('$');
    await expect(page.locator('a[href*="shop.jjsmithonline.com"]')).toHaveCount(0);
    await expect(page.locator('.actionBar .cta')).toContainText(PLAN_BOTTLE_CTA);
    await expectNoHorizontalOverflow(page, 'your-plan');
    await page.locator('.actionBar .cta').click();

    /* THE OFFER. The walk ends at /quiz/your-kit, which shows her arm's
       offer, and every visitor's arm is the one bottle at 25% off. */
    await expect(page).toHaveURL(/\/quiz\/your-kit$/);
    await expect(heading(page)).toHaveText('Hormone Focus, your daily support');
    await expect(page.locator('.kitHeroSub'))
      .toHaveText('Two capsules a day to help your body clear the extra estrogen, '
        + 'the first step to feeling like you again.');
    await expect(page.locator('.kitHeroShot'))
      .toHaveAttribute('src', /kit-one-bottle/);
    await expect(page.locator('.kitHeroEyebrow')).toHaveText('Your result · Perimenopause');

    /* THE PRICE IS THE BOTTLE'S OWN: $49.99 struck to the $37.50 she pays. */
    const price = page.locator('.kitHero .kitPrice');
    await expect(price).toContainText('Usually');
    await expect(price.locator('s')).toHaveText('$49.99');
    await expect(price.locator('.kitPriceToday b')).toHaveText('$37.50');
    await expect(price.locator('.kitPriceSave')).toHaveText('You save $12.49 today');
    await expect(price.locator('.kitWelcome')).toContainText('Welcome offer');
    await expect(price.locator('.kitWelcome')).toContainText('25% off your first order');
    await expect(price, 'no kit value on the bottle page').not.toContainText('$146.99');
    await expect(page.locator('.kitHeroCta')).toHaveText(/Get Hormone Focus/);
    await expect(page.locator('.kitHeroRisk'))
      .toHaveText('60-day money-back guarantee · Ships today');
    await expect(page.locator('.kitHero'), 'no free shipping above the fold')
      .not.toContainText('Free shipping');
    const fold = page.viewportSize()!.height;
    const ctaBox = (await page.locator('.kitHeroCta').boundingBox())!;
    expect(
      Math.round(ctaBox.y + ctaBox.height),
      'the hero button has to be on the first screen',
    ).toBeLessThanOrEqual(fold);

    const pageText = await page.locator('.rise').innerText();
    expect(pageText, 'the kit is not what this page sells')
      .not.toContain('The Feel Like YOU Again Kit');
    await expect(page.locator('.kitPlan'), 'the plan section').toHaveCount(1);
    await expect(page.locator('.kitPlan')).toContainText('Take two capsules a day, with a meal.');
    await expect(page.locator('.kitMech .kitBody').first())
      .toContainText('You told us your sleep breaks at night.');
    await expect(page.locator('.actionBar'), 'no Continue button once the offer begins').toHaveCount(0);
    await expectNoHorizontalOverflow(page, 'r2 offer page');
    await expectTapTargets(page, 'r2 offer page');

    /* THE DEAL, in the lead card: $37.50, one bottle, HORMONE25OFF. */
    const lead = page.locator('.kitLead');
    const deal = lead.locator('.kitDeal');
    await expect(deal.locator('.kitDealNum')).toHaveText('$37.50');
    await expect(deal.locator('.kitWas')).toHaveText('$49.99');
    await expect(deal.locator('.kitDealBadge')).toHaveText('Save 25%');
    await expect(deal).toContainText('25% off applied at checkout');
    await expect(deal.locator('a.kitBtn')).toContainText('Get Hormone Focus');
    await expect(deal.locator('a.kitBtn'))
      .toHaveAttribute('href', /cart\/41200079175791:1.*discount=HORMONE25OFF/);
    const deal2 = lead.locator('.kitDeal2');
    await expect(deal2.locator('.kitDeal2Num')).toHaveText('$39.99');
    const subHref = await deal2.locator('a.kitBtn').getAttribute('href');
    expect(subHref).toMatch(/cart\/add\?id=54355951845487.*selling_plan=5529010287/);
    expect(subHref, 'the code must not ride the subscription').not.toContain('HORMONE25OFF');
    await expect(lead.locator('.kitVs'), 'no kit stack on the bottle page').toHaveCount(0);
    await expect(lead.locator('.kitBottleSupply'))
      .toHaveText('One bottle of Hormone Focus. 60 capsules, two a day.');

    /* EVERY BOTTLE LINK, the lead card and the closer: the one-bottle
       variant, the 25% code, STRAIGHT TO CHECKOUT (no storefront=true since
       Quiz V1), and tagged with the quiz funnel and her offer arm. */
    const bottleLinks = await page.locator('a[href*="41200079175791"]').evaluateAll(
      (as) => as.map((a) => (a as HTMLAnchorElement).href),
    );
    expect(bottleLinks.length, 'the lead card and the closer').toBe(2);
    for (const h of bottleLinks) {
      const u = new URL(h);
      expect(u.pathname).toBe('/cart/41200079175791:1');
      expect(u.searchParams.get('discount'), 'a bottle link without the code').toBe('HORMONE25OFF');
      expect(u.searchParams.get('storefront'), 'the cart page first').toBe('true');
      expect(u.searchParams.get('hf_funnel')).toBe('quiz');
      expect(u.searchParams.get('attributes[hf_funnel]')).toBe('quiz');
      expect(u.searchParams.get('attributes[hf_offer]'), 'her arm on the order').toBe('bottle25');
    }
    await expect(page.locator('a[href*="54330638663791"]'), 'the kit cart link is off this page')
      .toHaveCount(0);

    /* Proof, the guarantee, the questions and the closer. */
    await expect(page.locator('[data-proof="lead"] .kitRev')).toHaveCount(4);
    await expect(page.locator('.kitPromise')).toContainText('60-Day Guarantee');
    await expect(page.locator('.kitFaq details')).toHaveCount(6);
    await expect(page.locator('a[data-close]')).toHaveText(/Get Hormone Focus/);
    await expect(page.locator('.kitClose .kitNote').first())
      .toContainText('$37.50 · 25% off applied at checkout · 60-day money-back guarantee');

    /* No health answer or result rides in any link out. */
    const out = await page.locator('a[href*="shop.jjsmithonline.com"]').evaluateAll(
      (as) => as.map((a) => a.getAttribute('href') ?? ''),
    );
    expect(out.length).toBe(3);
    for (const h of out) expect(h).not.toMatch(/outcome|perimenopause|sleep|symptom/i);

    /* And the offer view says which offer she saw. */
    const views = await page.evaluate(() => (window as unknown as {
      dataLayer?: { event?: string; offer_variant?: string }[];
    }).dataLayer?.filter((e) => e.event === 'view_offer') ?? []);
    expect(views.map((v) => v.offer_variant)).toEqual(['bottle']);

    expect(errors, 'javascript errors during the run').toEqual([]);
  });

  test('one symptom skips the ranking, and stopped periods ask the twelve-month question', async ({ page }) => {
    test.slow();
    await startQuiz(page);
    await page.locator('.tile').nth(3).click();                // hot flashes, one tick
    await answerAndWait(page, pressPrimary(page), /How old are you/);
    await expect(page.locator('.stepno')).toHaveText('3 of 5');
    await answerAndWait(page, pickOption(page, 3), /happening with your cycle/);   // 50–54
    await answerAndWait(page, pickOption(page, 3), /at least 12 months/);          // stopped
    await expect(page.locator('.stepno')).toHaveText('4 of 5');
    await expect(page.locator('.opt')).toHaveCount(4);
    await answerAndWait(page, pickOption(page, 0), /already tried/);               // yes

    /* "Nothing yet" is exclusive in both directions. */
    await page.locator('.opt').nth(0).click();
    await page.locator('.opt').nth(6).click();
    await expect(page.locator('.opt[aria-pressed="true"]')).toHaveCount(1);
    await expect(page.locator('.opt[aria-pressed="true"]')).toContainText('Nothing yet');
    await answerAndWait(page, pressPrimary(page), STAT_HEAD);
    await page.locator('.actionBar .cta').click();

    await expect(page.locator('#ef')).toBeVisible({ timeout: 15_000 });
    await page.fill('#ef', 'dana@example.com');                // no name given
    await page.locator('#cf').check();
    await page.locator('.actionBar .cta').click();

    /* Menopause, and it is shown the offer like every result but the doctor's. */
    await expect(heading(page)).toHaveText('Your answers may point to menopause.');
    await expect(page.locator('.resSec .blabel').nth(1)).toHaveText('What menopause is');
    await expect(page.locator('.resStatBig'), "menopause's own number").toHaveText('52');
    await expect(page.locator('.resKicker')).toHaveText('Here is your result');
    await expect(page.locator('.resFacts')).toContainText('Stopped 12 months or more');
    await expect(page.locator('.resPics figure')).toHaveCount(1);
    await expect(page.locator('.resPics figure')).not.toContainText('Bothers you most');
    await page.locator('.actionBar .cta').click();

    /* Her plan is for the one thing she named, and it says estrogen is
       lower now, never swinging. She tried nothing, so nothing is read back. */
    await expect(heading(page)).toHaveText(/personal 60-day plan for night sweats$/);
    await expect(page.locator('.nStep').first()).toContainText('In menopause, your body reacts faster to heat');
    await expect(page.locator('.nStep').nth(2)).toContainText('runs on less estrogen');
    await expect(page.locator('.nStep').first()).not.toContainText('swings');
    await expect(page.locator('.rise')).not.toContainText('already tried');
    await page.locator('.actionBar .cta').click();

    await expect(heading(page)).toHaveText('Hormone Focus, your daily support');
    await expect(page.getByText('You told us you have already tried')).toHaveCount(0);
    await expect(page.locator('.kitLead .kitDealNum')).toHaveText('$37.50');
    await expect(page.locator('[data-proof="lead"] .kitRev').first())
      .toContainText('given me my life back');
  });

  test('the loader is not re-entered by the back button', async ({ page }) => {
    await startQuiz(page);
    await page.locator('.tile').nth(1).click();
    await answerAndWait(page, pressPrimary(page), /How old are you/);
    await answerAndWait(page, pickOption(page, 1), /happening with your cycle/);
    await answerAndWait(page, pickOption(page, 0), /already tried/);
    await page.locator('.opt').nth(6).click();
    await answerAndWait(page, pressPrimary(page), STAT_HEAD);
    await page.locator('.actionBar .cta').click();

    await expect(page.locator('#ef')).toBeVisible({ timeout: 15_000 });
    await page.goBack();
    /* must land back on the screen before the loader, the statistic, and
       never inside the loader */
    await expect(page.locator('.loadSpin')).toHaveCount(0);
    await expect(heading(page)).toHaveText(STAT_TITLE);
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
    await answerAndWait(page, pickOption(page, 4), /already tried/);              // birth control, medication or surgery
    await page.locator('.opt').nth(4).click();
    await answerAndWait(page, pressPrimary(page), STAT_HEAD);
    await page.locator('.actionBar .cta').click();
    await expect(page.locator('#ef')).toBeVisible({ timeout: 15_000 });
    await page.fill('#ef', 'dana@example.com');
    await page.locator('#cf').check();
    await page.locator('.actionBar .cta').click();
    await expect(heading(page)).toHaveText(
      'Your answers may point to perimenopause, the years before your periods stop.',
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
    ['how-long-ago', 'Has it been at least 12 months'],
    ['what-you-have-tried', 'What have you already tried'],
    /* The statistic screen, new in Quiz V1. */
    ['not-just-you', STAT_TITLE],
    ['your-result', 'Your Hormone Check is ready'],
    ['result', ''],
    /* Her plan, new in Quiz V1. The default state names no symptom. */
    ['your-plan', '60-day plan'],
    /* The offer the walk ends on, which shows her arm's offer: the one
       bottle while ACTIVE_OFFERS is ['bottle25']. */
    ['your-kit', 'Hormone Focus, your daily support'],
    /* And the one-bottle page off the walk, at the old main address. */
    ['kit', 'Hormone Focus, your daily support'],
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

  /* CUT SCREENS, QUIZ V1. The timing question, the goal question and David's
     two middle screens are gone. A shared or stale link to one of them opens
     the screen that replaced it rather than a dead end or the first question. */
  const FORWARDED = [
    ['when-you-notice-it', 'What have you already tried'],
    ['whats-happening', '60-day plan'],
    ['meet-hormone-focus', '60-day plan'],
    ['offer-kit', 'Hormone Focus, your daily support'],
  ] as const;

  for (const [slug, replacement] of FORWARDED) {
    test(`the cut address /quiz/${slug} opens the screen that replaced it`, async ({ page }) => {
      await page.goto(`/quiz/${slug}`);
      await expect(heading(page)).toContainText(replacement);
      await expectNoHorizontalOverflow(page, `/quiz/${slug}`);
    });
  }

  test("the cut goal question's address opens the loader, which hands on to the email screen",
    async ({ page }) => {
      /* The loader runs about seven and a half seconds and then replaces
         itself with the email screen, so what is asserted is where she ends
         up: the email screen, at its own address, and never the first
         question. */
      await blockKlaviyo(page);
      await page.goto('/quiz/what-you-want');
      await expect(page.locator('#ef')).toBeVisible({ timeout: 20_000 });
      await expect(page).toHaveURL(/\/quiz\/your-result$/);
    });

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

      /* SCROLLED TO A POSITION DERIVED FROM THE OFFER, not to a fraction of
         the page. This used to scroll to 60% and that stopped meaning
         anything when the offer moved below the plan, the reason and the
         proof on 20 October: at 60% of a desktop page the offer is already
         on screen, the bar correctly stands down, and the test failed
         looking for a bar that was right to be absent.

         The bar shows while she is past the hero and the offer is not yet in
         view. That window is computed here, which also makes the assertion
         worth something: if the offer ever sits so close to the top that
         there is no window at all, the bar can never appear and this says
         so instead of silently passing. */
      const where = await page.evaluate(() => {
        const band = document.querySelector('.kitBand.offer')!.getBoundingClientRect();
        const offerTop = band.top + window.scrollY;
        const lo = window.innerHeight;
        const hi = offerTop - window.innerHeight * 0.85;
        return { lo: Math.round(lo), hi: Math.round(hi) };
      });
      expect(where.hi, 'the sticky bar has no window in which it can show')
        .toBeGreaterThan(where.lo);

      await page.evaluate((y) => window.scrollTo(0, y), Math.round((where.lo + where.hi) / 2));
      await page.waitForTimeout(400);

      await page.locator('.kitSticky button').click();
      await page.waitForTimeout(1200);

      const offer = (await page.locator('.kitBand.offer').boundingBox())!;
      expect(Math.abs(offer.y), 'she did not land on the offer').toBeLessThan(140);
      /* The offer is on screen, so the bar stands down. */
      await expect(page.locator('.kitSticky')).toHaveCount(0);
    });

  test('the top bar does not follow her down the kit page', async ({ page }) => {
    /* BOTH OFFER ADDRESSES, since Quiz V1. The walk now ends at
       /quiz/your-kit, and /quiz/kit (the old main offer address) shows the
       same one-bottle page off the walk. Both are the long page with its own
       sticky buy bar, so on neither may the top bar follow her down. */
    for (const route of ['/quiz/your-kit', '/quiz/kit']) {
      await page.goto(route);
      await expect(page.locator('.kitSticky, .kitHero').first()).toBeAttached();
      const pos = await page.locator('.appHeader')
        .evaluate((el) => getComputedStyle(el).position);
      expect(pos, `${route}: the header is fixed on a page that already has a sticky bar`)
        .toBe('static');
    }
  });

  /* ------------------------------------------- the 16 October rebuild -- */

  test('the page names the kit, proves it, explains it, then asks the price',
    async ({ page }) => {
      /* THE KIT ORDER, 29 October. The page sells the package now, and the
         brief's order is: the kit and its price in the hero, proof straight
         underneath, who JJ is, why it works, what she actually does, and
         only then the card.

         TWICE REVERSED BEFORE THIS ONE, so the comment is worth keeping:
         the offer sat directly under the hero until 20 October, and the
         tips sat above it before that. Asserted by document position, so an
         edit that quietly moves the price back up fails here.

         The rails are matched by data-proof rather than .kitStrip, there
         being three of those now: the photographs, the press and the wall. */
      await page.goto('/quiz/kit');
      const seen = await page.evaluate(() => {
        const want = [
          ['hero', '.kitHero'],
          ['the customer photos', '[data-proof="rail"]'],
          ['the review teaser', '.kitTeaser'],
          ['who JJ is', '.kitWho'],
          /* THE PLAN LEADS, 2 November. She arrives from the `plan` screen,
             so the page picks that thread up before explaining the
             mechanism again. */
          ['the plan', '.kitPlan'],
          ['why it works', '.kitMech'],
          ['the offer', '#kit-offer'],
          ['guarantee', '.kitPromise'],
          ['the review wall', '#all-reviews'],
          ['questions', '.kitFaq'],
          ['closer', '.kitClose'],
        ] as const;
        const out: { name: string; top: number }[] = [];
        for (const [name, sel] of want) {
          const el = document.querySelector(sel);
          if (!el) return { missing: name, order: [] };
          out.push({ name, top: Math.round(el.getBoundingClientRect().top + window.scrollY) });
        }
        return { missing: null as string | null, order: out };
      });

      expect(seen.missing, 'a section vanished in the re-order').toBeNull();
      const names = seen.order.map((o) => o.name);
      const sorted = [...seen.order].sort((a, b) => a.top - b.top).map((o) => o.name);
      expect(sorted, 'the sections are not in the order the page argues in').toEqual(names);
    });

  test('the guarantee answers the price directly, with nothing in between',
    async ({ page }) => {
      /* MOVED 16 OCTOBER at David's request. It sat five sections below,
         after the questions. The guarantee is the answer to the price, so it
         has to be the next thing she reads after it: asserted as the very
         next band rather than merely somewhere below, because "after the
         offer" was true of the old position too. */
      await page.goto('/quiz/kit');
      /* BY POSITION, NOT BY INDEX, since 29 October: the page bands most of
         its sections now, so "the first .kitBand" is the customer rail and
         counting them proves nothing. What has to stay true is that the
         guarantee is the band IMMEDIATELY after the offer. */
      const bands = await page.locator('.kitBand').evaluateAll(
        (els) => els.map((e) => e.className),
      );
      const offerAt = bands.findIndex((c) => c.includes('offer'));
      expect(offerAt, 'the offer band is missing').toBeGreaterThanOrEqual(0);
      expect(bands[offerAt + 1], 'the guarantee is the one directly under it')
        .toBe('kitBand teal');
      await expect(page.locator('.kitBand.teal').locator('.kitPromise'))
        .toContainText('60-Day Guarantee');
    });

  test('both rails loop seamlessly, which is arithmetic and not a judgement',
    async ({ page }) => {
      /* A doubled track slides -50% to loop, so it only lands exactly on the
         second copy if the track is precisely twice one copy. Spacing it with
         `gap` gives 2n-1 gaps rather than 2n, and the loop jumps by half a
         gap every time it comes round. Each image carries its own right
         margin instead, so this holds: the track is exactly twice the width
         of one copy of it. */
      await page.goto('/quiz/kit');
      const w = await page.evaluate(() => {
        const one = (sel: string) => {
          const track = document.querySelector(sel);
          if (!track) return null;
          const kids = Array.from(track.children) as HTMLElement[];
          const total = track.getBoundingClientRect().width;
          const first = kids.slice(0, kids.length / 2).reduce((n, el) => {
            const box = el.getBoundingClientRect().width;
            const gap = parseFloat(getComputedStyle(el).marginRight) || 0;
            return n + box + gap;
          }, 0);
          return { total: Math.round(total), half: Math.round(first) };
        };
        return { photos: one('.pfRailTrack'), press: one('.pfPressTrack') };
      });
      for (const [name, m] of Object.entries(w)) {
        expect(m, `${name} rail is missing`).not.toBeNull();
        expect(
          Math.abs(m!.total / 2 - m!.half),
          `the ${name} rail jumps ${Math.abs(m!.total / 2 - m!.half)}px every loop`,
        ).toBeLessThan(1);
      }
    });

  test('with the $47 Kit switched on, the kit page sells two bottles, and the cart ships two',
    async ({ page }) => {
      /* THE LONGEST-STANDING UNTRUTH ON THIS PAGE, closed 6 November. It
         called itself a 60-day kit and put ONE bottle in the cart, which is
         thirty days of it. It buys the two-bottle bundle now, so every
         "60-day" on the page is a fact about what arrives.

         ASSERTED AS THE VARIANT, not as the words: the words were right
         before and the cart was wrong.

         THE KIT IS OFF SINCE QUIZ V1 (ACTIVE_OFFERS is ['bottle25']), so it
         is switched on for this page load only, as the kit47 arm, and read at
         /quiz/your-kit, which is where the walk shows her arm's offer. */
      await switchOffers(page, ['kit47']);
      await page.goto('/quiz/your-kit');
      await expect(heading(page)).toHaveText(KIT_HERO_HEAD);

      const buy = page.locator('#kit-offer a[data-offer]').first();
      await expect(buy, 'the kit must buy the two-bottle bundle')
        .toHaveAttribute('href', /cart\/54330638663791:1/);
      await expect(buy, 'with its own code').toHaveAttribute('href', /discount=KIT47/);
      await expect(buy, 'and never the single bottle')
        .not.toHaveAttribute('href', /41200079175791/);
      const url = new URL((await buy.getAttribute('href'))!);
      expect(url.searchParams.get('storefront'), 'the cart page first').toBe('true');
      expect(url.searchParams.get('attributes[hf_offer]'), 'her arm on the order').toBe('kit47');

      /* The stack says two bottles and totals JJ's own $196.99. */
      await expect(page.locator('#kit-offer')).toContainText('2 bottles, 60-day supply');
      await expect(page.locator('.kitVsTotalV')).toHaveText('$196.99');
      await expect(page.locator('.kitHero .kitPrice')).toContainText('$47.00');
      await expect(page.locator('.kitHero .kitPrice')).toContainText('You save $149.99');

      /* AND NO ONE-BOTTLE COPY SURVIVES, apart from the anchor that exists
         to compare against one: "less than one bottle on its own". */
      const text = await page.locator('.rise').innerText();
      const leftovers = (text.match(/[^.\n]*(30-day supply|single bottle)[^.\n]*/gi) ?? []);
      expect(leftovers, 'one-bottle copy left on a two-bottle page').toEqual([]);

      /* THE THREE BONUSES ARE STILL A PROMISE THE CART DOES NOT KEEP. The
         bottles ship; the guide, the recipes and the tracker do not. That is
         a question for the store, and this says nobody has solved it yet. */
      await expect(page.locator('#kit-offer')).toContainText('The 60-Day Hormone Fix');
    });

  test('with the $74.99 Kit switched on, the cart carries free shipping and the live price',
    async ({ page }) => {
      /* THE OTHER KIT ARM. Shopify takes one discount parameter, so the Kit
         at its live price spends it on HF60FREESHIP rather than KIT47. */
      await switchOffers(page, ['kit74']);
      await page.goto('/quiz/your-kit');
      await expect(heading(page)).toHaveText(KIT_HERO_HEAD);

      const buy = page.locator('#kit-offer a[data-offer]').first();
      const url = new URL((await buy.getAttribute('href'))!);
      expect(url.pathname, 'the two-bottle bundle').toBe('/cart/54330638663791:1');
      expect(url.searchParams.get('discount')).toBe('HF60FREESHIP');
      expect(url.searchParams.get('storefront'), 'the cart page first').toBe('true');
      expect(url.searchParams.get('hf_funnel')).toBe('quiz');
      expect(url.searchParams.get('attributes[hf_offer]'), 'her arm on the order').toBe('kit74');
      await expect(page.locator('.kitHero .kitPrice')).toContainText('$74.99');
      await expect(page.locator('.kitHero .kitPrice'), 'not the $47 price').not.toContainText('$47.00');
    });

  test('both buy buttons still carry her ad tags, and never her answers',
    async ({ page }) => {
      /* THE CARRY-THROUGH, ON THE REBUILT PAGE. The offer block moved, the
         one-time row went, and the hero gained a button: all three are ways
         to lose attribution on the way to Shopify without anything looking
         broken. Read off the first paint, with no click and no scroll,
         because attribution is captured before render and the links are
         built during it. */
      const ad = {
        utm_source: 'meta', utm_medium: 'paid', utm_campaign: 'peri_q3',
        /* utm_term is DELIBERATELY not a body word. It was 'bloat_kw', which
           is a perfectly good ad keyword and tripped the leak check below on
           its own fixture: an advertiser's keyword is hers to carry, a quiz
           answer is not, and the assertion cannot tell them apart. */
        utm_content: 'vid_07', utm_term: 'kw_42', fbclid: 'FB1',
      };
      await page.goto(`/quiz/kit?${new URLSearchParams(ad)}`);

      const hrefs = await page.locator('a[href*="shop.jjsmithonline.com"]').evaluateAll(
        (as) => as.map((a) => (a as HTMLAnchorElement).href),
      );
      /* THREE SINCE 30 OCTOBER: the card's two deal boxes each carry their
         own button, plus the closer. It was two while one shared button
         followed a radio selection. Every one of them has to carry her
         tags, which is what the loop below is for. */
      expect(hrefs.length, 'both deal boxes and the closer').toBe(3);

      for (const href of hrefs) {
        const url = new URL(href);
        expect(url.origin).toBe('https://shop.jjsmithonline.com');
        for (const [k, v] of Object.entries(ad)) {
          /* The subscription is a /cart/add, which 302s to /cart and drops
             the query, so its tags ride in return_to instead. Either way the
             pair has to be somewhere in the link. */
          expect(href, `${k} is missing from ${url.pathname}`).toContain(`${k}=${v}`);
        }
        /* And nothing about her body goes with them, on any of the three. */
        expect(href).not.toMatch(/outcome|perimenopause|symptom|sleep|bloat|menopause/i);
      }
    });

  test('the in-app browsers get the product picture and the button',
    async ({ page }) => {
      /* THE BUG THIS EXISTS FOR, 20 October 2026. The hero shot was hidden
         outright under `@media (max-height: 720px)`, added to keep the button
         above the fold on a 320x568 phone. An in-app browser spends a third
         of the screen on its own chrome, so Facebook and Instagram hand this
         page roughly 560 to 600px of height and every one of them tripped
         that rule. Three quarters of this funnel's traffic is in-app, so
         three quarters of the women who reached the offer saw a hero with no
         product in it, and it read as a broken image.

         Both halves are asserted together on purpose: showing the picture is
         only right if the button is still reachable without scrolling, and
         hiding it was only ever a way of buying that. The headline is set to
         the longest of the six first, because the personalised one wraps
         where the deep-linked default does not. */
      const LONGEST = 'Feel comfortable in your own clothes again.';
      for (const [w, h] of [[390, 600], [390, 560], [360, 520], [320, 568], [320, 480]]) {
        await page.setViewportSize({ width: w, height: h });
        await page.goto('/quiz/kit');
        await page.waitForTimeout(250);
        await page.evaluate((t) => {
          const el = document.querySelector('.kitHeroH1');
          if (el) el.textContent = t;
        }, LONGEST);
        await page.waitForTimeout(200);

        const shot = page.locator('.kitHeroShot');
        await expect(shot, `${w}x${h}: the kit shot is in the DOM`).toHaveCount(1);
        const shown = await shot.evaluate((el) => {
          const cs = getComputedStyle(el);
          return {
            display: cs.display,
            height: Math.round(el.getBoundingClientRect().height),
            loaded: (el as HTMLImageElement).naturalWidth > 0,
          };
        });
        expect(shown.display, `${w}x${h}: the kit shot is hidden`).not.toBe('none');
        expect(shown.height, `${w}x${h}: the kit shot has no height`).toBeGreaterThan(30);
        expect(shown.loaded, `${w}x${h}: the kit shot did not load`).toBe(true);

        const cta = (await page.locator('.kitHeroCta').boundingBox())!;
        expect(
          Math.round(cta.y + cta.height),
          `${w}x${h}: the button fell below the fold`,
        ).toBeLessThanOrEqual(h);
      }
    });

  test('nothing on the offer page fails to load in an in-app browser',
    async ({ page }) => {
      /* Every image, at an in-app viewport, after a full scroll so the lazy
         ones are given their chance. naturalWidth is the only honest test:
         a broken <img> is present, visible and counted by everything else. */
      await page.setViewportSize({ width: 390, height: 600 });
      const http4xx: string[] = [];
      page.on('response', (r) => {
        if (r.status() >= 400 && /\.(webp|jpg|jpeg|png|svg|avif)/i.test(r.url())) {
          http4xx.push(`${r.status()} ${r.url().split('/').pop()}`);
        }
      });
      await page.goto('/quiz/kit');
      await page.evaluate(async () => {
        const h = document.body.scrollHeight;
        for (let y = 0; y < h; y += 500) {
          window.scrollTo(0, y);
          await new Promise((r) => { setTimeout(r, 60); });
        }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(2000);

      const broken = await page.evaluate(() => Array.from(document.querySelectorAll('img'))
        .filter((im) => im.complete && im.naturalWidth === 0)
        .map((im) => (im.currentSrc || im.src).split('/').pop() ?? '?'));
      expect(broken, 'images that failed to load').toEqual([]);
      expect(http4xx, 'image requests the server refused').toEqual([]);
    });

  test('the re-order moved every proof block and dropped none of them',
    async ({ page }) => {
      /* THE RISK IN A RE-ORDER IS SILENT LOSS. The proof used to be split
         across two sections either side of the price; it is one zone above
         the price now, and a block that failed to come along would look
         exactly like a page that simply scrolls shorter. So this counts
         them. Every number here is what the page carried before the move. */
      await page.goto('/quiz/kit');
      await page.evaluate(async () => {
        const h = document.body.scrollHeight;
        for (let y = 0; y < h; y += 500) {
          window.scrollTo(0, y);
          await new Promise((r) => { setTimeout(r, 60); });
        }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(2500);

      const n = async (sel: string) => page.locator(sel).count();
      expect(await n('.pfRailTrack img'), 'the customer photo rail').toBe(24);
      expect(await n('.pfPressTrack img'), 'the press logos').toBe(16);
      expect(await n('.okWall'), 'the Okendo wall').toBe(1);
      /* THE SEEABLE PROOF LEADS, 30 October: the women on camera, the
         photographs and the Facebook comment, and then every review read
         live from Okendo underneath them. It was the other way round, which
         put nine videos and twelve faces below a list of text. */
      const zone = await page.evaluate(() => {
        const at = (sel: string) => {
          const el = document.querySelector(sel);
          return el ? Math.round(el.getBoundingClientRect().top + window.scrollY) : -1;
        };
        return {
          videos: at('[data-proof="wall"] .vid'),
          facebook: at('[data-proof="wall"] .pfFb'),
          faces: at('[data-proof="wall"] .pfFaces'),
          wall: at('.okWall'),
        };
      });
      for (const [what, y] of Object.entries(zone)) {
        expect(y, `${what} is missing from the proof zone`).toBeGreaterThan(0);
      }
      expect(zone.videos, 'the videos come before the full reviews').toBeLessThan(zone.wall);
      expect(zone.facebook, 'the screenshot comes before them').toBeLessThan(zone.wall);
      expect(zone.faces, 'the faces come before them').toBeLessThan(zone.wall);
      expect(await n('.vid'), 'the nine women on camera').toBe(9);
      /* TWO SINCE 30 OCTOBER: the same screenshot runs directly above the
         price as well as in the proof zone, at David's request. */
      expect(await n('.pfFb img'), 'the Facebook comment, in both places').toBe(2);
      expect(await n('[data-proof="pre-offer"] .pfFb img'), 'the one above the offer').toBe(1);
      expect(await n('[data-proof="wall"] .pfFb img'), 'the one in the proof zone').toBe(1);
      expect(await n('.pfFaces img'), 'the faces').toBe(12);
      /* FOUR, NOT THREE. The hero's one review moved down to join the other
         three when the brief gave that space to the price line, so all four
         of JJ's named women are in the wall together. */
      expect(await n('[data-proof="lead"] .kitRev'), 'the four named testimonials').toBe(4);
      expect(await n('[data-proof="closing"] .kitRev'), 'the closing testimonial').toBe(1);
      expect(await n('.kitFaq details'), "JJ's six questions").toBe(6);
      expect(await n('.kitPromise'), 'the guarantee').toBe(1);
      expect(await n('.kitTeaser .kitRev'), 'the review teaser').toBe(2);
      /* THE PLAN IS BACK AND IT IS THE DOSAGE BLOCK. .kitHow held "how to
         take it" while the page sold a bottle alone; step one of the plan
         is that same instruction, so the section was replaced rather than
         added to. */
      expect(await n('.kitHow'), 'the dosage block became the plan').toBe(0);
      expect(await n('.kitPlan'), 'the plan section').toBe(1);
      expect(await n('.kitSteps li'), 'its three steps').toBe(3);
      /* The value stack, which the bottle-only page did not have. */
      /* The value stack moved to the kit's own page on 2 November: the main
         offer sells one bottle and has nothing to total. Its rows are
         asserted in the kit page's own test. */
      expect(await n('#kit-offer .kitVs'), 'no kit stack on the bottle offer').toBe(0);
      expect(await n('.kitMg > div'), 'the three ingredients').toBe(3);
      expect(await n('a[href*="shop.jjsmithonline.com"]'), 'the buy links').toBe(3);

      const broken = await page.evaluate(() => Array.from(document.querySelectorAll('img'))
        .filter((im) => im.complete && im.naturalWidth === 0).length);
      expect(broken, 'images that failed to load').toBe(0);
    });

  test('JJ is introduced to cold traffic and not to her own list', async ({ page }) => {
    /* A woman who arrived from JJ's own list is being introduced to someone
       she already follows, which reads as a page that has not noticed who it
       is talking to. Same flag the email screen is stepped over on. */
    await page.goto('/quiz/kit');
    /* The brief reworded the opener and also asked for "followed her to get
       themselves back", which would turn a count of followers into a result
       millions of women got. The second half is the approved claim. */
    await expect(page.locator('.kitTrustLead')).toHaveText(
      'New to JJ Smith? She is a New York Times bestselling '
      + 'author, and millions of women have followed her approach.',
    );

    await page.goto('/quiz/kit?skip_email=1');
    await expect(page.locator('.kitTrustLead'), 'she already knows JJ').toHaveCount(0);
    /* And the rest of the zone is unchanged for her. */
    await expect(page.locator('.pfRailTrack img')).toHaveCount(24);
  });
  test('the stars stay in a row under the reset the deployed host injects',

    async ({ page }) => {
      /* THE BUG THIS EXISTS FOR, 19 October 2026. Stars() returned a bare
         fragment of <svg> and borrowed its layout from whatever contained it.
         An <svg> is display:inline by default, so locally the five of them
         flowed along a line and every page looked right.
         The host that builds this src/ injects a CSS reset this repo does
         not, of the shape every modern one ships:
             img, svg, video, canvas { display: block; }
         Under it each star became a block and the five stacked vertically
         down the side of every live Okendo review. Local inline, live block,
         and nothing in the repo looked wrong.
         So the reset is applied here on purpose. Without the flex wrapper in
         Stars() this fails with the live y positions, 40/56/72/88/104. */
      await page.addInitScript(() => {
        addEventListener('DOMContentLoaded', () => {
          const s = document.createElement('style');
          s.textContent = 'img,svg,video,canvas,audio,iframe,embed,object{display:block}';
          document.head.appendChild(s);
        });
      });

      for (const route of ['/quiz/kit', '/offer']) {
        await page.goto(route);
        const wall = page.locator('.okWall');
        if (await wall.count()) {
          await wall.scrollIntoViewIfNeeded();
          /* Give the live reviews a chance to replace the fallback, because
             the live ones are the markup that broke. */
          await page.waitForTimeout(2500);
        }

        const rows = await page.locator('.starRow').evaluateAll((els) => els.map((row) => {
          const ys = Array.from(row.children).map((k) => Math.round(k.getBoundingClientRect().y));
          return { count: ys.length, lines: new Set(ys).size, parent: row.parentElement?.className ?? '?' };
        }));

        expect(rows.length, `${route} shows no stars at all`).toBeGreaterThan(0);
        for (const r of rows) {
          if (r.count < 2) continue;
          expect(
            r.lines,
            `${route}: ${r.count} stars in .${r.parent} fell onto ${r.lines} lines`,
          ).toBe(1);
        }
      }
    });

  test('"Read all reviews" lands on the reviews, not on the videos above them',
    async ({ page }) => {
      /* THE LINK PROMISES THE REVIEWS. Its anchor sat on the whole proof
         section, which was right while the Okendo wall opened that section.
         The 30 October re-order put the videos, the screenshot and the faces
         first, so the same link started landing her on a video: she asked to
         read 171 reviews and got a player. The id moved down with them.

         Asserted as "what is on screen afterwards", because an anchor that
         exists but scrolls to the wrong block passes every test that only
         checks the href. */
      await page.goto('/quiz/kit');
      await expect(page.locator('.kitAllRevs')).toContainText(/Read all \d+ reviews/);
      await page.locator('.kitAllRevs').click();
      await page.waitForTimeout(2000);           // the page scrolls smoothly

      const seen = await page.evaluate(() => {
        const box = (sel: string) => {
          const el = document.querySelector(sel);
          return el ? Math.round(el.getBoundingClientRect().top) : null;
        };
        return { head: box('.okHead'), wall: box('.okWall'), video: box('[data-proof="wall"] .vid') };
      });

      expect(seen.head, 'the reviews heading is not rendered').not.toBeNull();
      expect(seen.head!, '"What women are saying" is not on screen')
        .toBeGreaterThan(-40);
      expect(seen.head!, '"What women are saying" is below the fold')
        .toBeLessThan(page.viewportSize()!.height);
      /* And the block she was taken past is genuinely above her. */
      expect(seen.video!, 'she landed on the videos instead').toBeLessThan(0);
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
      /* AND IT SAYS WHO VERIFIED THEM, on the live wall through .okBy and on
         the authored fallback through the rating badge. Whichever answered,
         the mark is on the block. */
      await expect(wall.locator('.okBy, .pfRatingBy').first(), 'the Okendo mark')
        .toBeVisible();
    });
});

/* ------------------------------ what she did not say, on both pages -- */

test.describe('the result page says nothing she did not say', () => {
  test('"Nothing yet" is never read back as an attempt', async ({ page }) => {
    /* THE CONDITIONAL THAT MATTERS. Since Quiz V1 her plan reads back what
       she tried ("You have already tried ... This plan brings it together").
       A woman who ticked "Nothing yet" must never be told she has already
       tried anything: not on the result, not on her plan, not on the offer. */
    await startQuiz(page, '/quiz/symptoms?skip_email=1');
    await page.locator('.tile').nth(0).click();
    await answerAndWait(page, pressPrimary(page), /How old are you/);
    await answerAndWait(page, pickOption(page, 0), /happening with your cycle/);
    await answerAndWait(page, pickOption(page, 0), /What have you already tried/);
    await page.locator('.opt').nth(6).click();            // Nothing yet
    await answerAndWait(page, pressPrimary(page), STAT_HEAD);
    await page.locator('.actionBar .cta').click();

    /* She came from the list, so the loader hands straight to her result. */
    await expect(page).toHaveURL(/\/quiz\/result$/, { timeout: 15_000 });
    const result = await page.locator('.rise').innerText();
    expect(result, 'no attempt is claimed on the result').not.toContain('already tried');
    expect(result, 'and nothing is sold here').not.toContain('$');

    /* Her plan is where the line lives, and for her it must be absent. */
    await page.locator('.actionBar .cta').click();
    await throughPlan(page, 'Your 60-day plan for stubborn weight');
    await expect(page.locator('.kitPlan'), "the offer's plan section").toHaveCount(1);
    await expect(page.locator('.rise'), 'no attempt is read back on the offer')
      .not.toContainText('already tried');
  });
});

/* --------------------------------- the three screens before the price -- */

test.describe('the pre-offer screens', () => {
  test('the bar fills across all three, and back walks them in reverse',
    async ({ page }) => {
      /* THE PROGRESS BAR IS THE PROMISE THE QUIZ MADE HER. Since Quiz V1
         there is one screen between her result and the price, her plan, so
         the bar has three segments: the result, the plan and the offer.
         It was five while David's three middle screens were in the walk.

         The back button matters as much: the plan is the place a woman who
         is not ready goes back from, and the flow has to walk back to the
         result without falling through to the questions. */
      await page.goto('/quiz/result');

      /* toHaveCount, NOT count(). A bare count() returns whatever is in the
         DOM at that instant and does not wait. Every count here retries. */
      const filled = () => page.locator('.segbar i.on');
      await expect(page.locator('.segbar i'), 'three segments: result, plan, offer')
        .toHaveCount(3);
      await expect(filled(), 'the result is the first').toHaveCount(1);

      for (const [i, slug] of ['your-plan', 'your-kit'].entries()) {
        await page.locator('.actionBar .cta').first().click();
        await expect(page).toHaveURL(new RegExp(`/quiz/${slug}$`));
        await expect(filled(), `${slug} fills ${i + 2} of 3`).toHaveCount(i + 2);
      }

      /* And back, one screen at a time, in the order she came. */
      for (const slug of ['your-plan', 'result']) {
        await page.goBack();
        await expect(page, `back reaches ${slug}`).toHaveURL(new RegExp(`/quiz/${slug}$`));
      }
    });

  test('every picture on her plan loads, and each says what it is or is marked as decoration',
    async ({ page }) => {
      /* The plan's step icons sit beside step titles that already say what
         they are, so they carry alt="" and a screen reader skips them. What
         is not allowed is an image with no alt attribute at all, or a file
         that fails to load and leaves an empty box beside the copy. */
      await page.goto('/quiz/your-plan');
      await page.waitForTimeout(600);
      const imgs = await page.locator('main img').evaluateAll(
        (els) => els.map((e) => ({
          src: (e as HTMLImageElement).currentSrc.split('/').pop() ?? '?',
          loaded: (e as HTMLImageElement).naturalWidth > 0,
          alt: e.getAttribute('alt'),
        })),
      );
      expect(imgs.length, 'the plan has no pictures').toBeGreaterThan(3);
      for (const im of imgs) {
        expect(im.loaded, `your-plan: ${im.src} did not load`).toBe(true);
        expect(im.alt, `your-plan: ${im.src} has no alt attribute`).not.toBeNull();
      }
      await expectNoHorizontalOverflow(page, '/quiz/your-plan');
    });

  test('the doctor route never sees them', async ({ page }) => {
    /* A woman the quiz sends to her doctor must not be walked through "here
       is what to do about it" and a product introduction on the way to
       nothing. Same rule as the offer page, asserted the same way: she is
       sent to rDoc and the three addresses do not open for her either. */
    await startQuiz(page);
    await page.locator('.tile').first().click();
    await answerAndWait(page, pressPrimary(page), /How old are you/);
    await answerAndWait(page, pickOption(page, 0), /happening with your cycle/);   // under 40
    await answerAndWait(page, pickOption(page, 3), /at least 12 months/);          // stopped
    await answerAndWait(page, pickOption(page, 0), /Talk to your healthcare professional/);

    /* SHE STOPS HERE. There is no way forward out of rDoc: no action bar
       into the three screens, no offer, and no email gate behind her.

       TYPING ONE OF THE THREE ADDRESSES STILL OPENS IT, and that is not new
       or specific to them: /quiz/kit has always opened the same way for this
       state. An address is a way back into a screen she has already seen,
       and the quiz has never treated it as a gate. What the doctor route
       must never do is be WALKED into them, which is the flow, and
       tests/logic.test.ts holds every D state to exactly that. */
    await expect(page.locator('.actionBar .cta'), 'a way forward from rDoc')
      .toHaveCount(0);
    await expect(page.locator('#ef'), 'no email gate').toHaveCount(0);
    await expect(page.locator('a[href*="shop.jjsmithonline.com"]'), 'no buy link')
      .toHaveCount(0);
  });
});

/* ------------------------------------------- the offer A/B, 2 November -- */

test.describe('the two offers', () => {
  test('the walk ends on her arm\'s offer, the one bottle, and /quiz/kit shows the same bottle off the walk',
    async ({ page }) => {
      /* THE OFFER SWITCH, Quiz V1. The step after her plan, /quiz/your-kit,
         shows her arm's offer, and ACTIVE_OFFERS is ['bottle25'], so every
         visitor gets the one bottle at 25% off. /quiz/kit is the one-bottle
         page at the old main address, off the walk; /quiz/offer-kit, the old
         Kit address, now opens it too. */
      await page.goto('/quiz/your-plan');
      await page.locator('.actionBar .cta').click();
      await expect(page, 'the walk must end on her arm\'s offer').toHaveURL(/\/quiz\/your-kit$/);
      await expect(heading(page)).toHaveText('Hormone Focus, your daily support');
      await expect(page.locator('.segbar i.on'), 'the offer is the last step of the walk')
        .toHaveCount(3);

      /* And the off-walk address is not a step: no progress bar fills. */
      for (const slug of ['kit', 'offer-kit']) {
        await page.goto(`/quiz/${slug}`);
        await expect(heading(page)).toHaveText('Hormone Focus, your daily support');
        await expect(page.locator('.segbar i.on'), `/quiz/${slug} is not a step in the walk`)
          .toHaveCount(0);
      }
    });

  test('the one-bottle offer sends her to its own cart, at both addresses', async ({ page }) => {
    for (const slug of ['your-kit', 'kit']) {
      await page.goto(`/quiz/${slug}`);
      const links = await page.locator('#kit-offer a[href*="shop.jjsmithonline.com"]')
        .evaluateAll((as) => as.map((a) => ({
          offer: (a as HTMLAnchorElement).dataset.offer,
          href: (a as HTMLAnchorElement).href,
        })));

      expect(links.map((l) => l.offer), `${slug}: the bottle page offers both`)
        .toEqual(['single', 'subscribe']);
      expect(links[0].href, 'the bottle carries the welcome code')
        .toMatch(/cart\/41200079175791:1.*discount=HORMONE25OFF/);
      expect(new URL(links[0].href).searchParams.get('attributes[hf_offer]'))
        .toBe('bottle25');
      expect(links[1].href, 'the subscription carries its plan')
        .toMatch(/cart\/add\?id=54355951845487.*selling_plan=5529010287/);
      expect(links[1].href, 'no code may ride the subscription')
        .not.toMatch(/HORMONE25OFF|KIT47|HF60FREESHIP/);
    }
  });

  test('each Kit arm, switched on, sends her to the two-bottle cart with its own code',
    async ({ page }) => {
      /* THE KIT IS A ONE TIME BUY, since 6 November: one link, the bundle.
         Which code rides on it is the arm's: KIT47 at $47, HF60FREESHIP at
         the live $74.99. Each arm is switched on for its own page load. */
      for (const [arm, code] of [['kit47', 'KIT47'], ['kit74', 'HF60FREESHIP']] as const) {
        await page.unrouteAll({ behavior: 'wait' });
        await switchOffers(page, [arm]);
        await page.goto('/quiz/your-kit');
        await expect(heading(page)).toHaveText(KIT_HERO_HEAD);
        const links = await page.locator('#kit-offer a[href*="shop.jjsmithonline.com"]')
          .evaluateAll((as) => as.map((a) => ({
            offer: (a as HTMLAnchorElement).dataset.offer,
            href: (a as HTMLAnchorElement).href,
          })));
        expect(links.map((l) => l.offer), `${arm}: the kit offers one thing`)
          .toEqual(['protocol']);
        const u = new URL(links[0].href);
        expect(u.pathname, `${arm}: the bundle`).toBe('/cart/54330638663791:1');
        expect(u.searchParams.get('discount'), `${arm}: its own code`).toBe(code);
        expect(u.searchParams.get('attributes[hf_offer]'), `${arm}: on the order`).toBe(arm);
      }
    });

  test('the one-bottle offer reports itself as the bottle, at both addresses',
    async ({ page }) => {
      /* offer_variant names the offer she saw, which is the one property the
         A/B cannot be read without. The walk's address first, then the
         off-walk one, which renders the same one-bottle page. */
      for (const slug of ['your-kit', 'kit']) {
        await page.goto(`/quiz/${slug}`);
        await expect(heading(page)).toHaveText('Hormone Focus, your daily support');
        await page.waitForTimeout(400);
        const sent = await page.evaluate(() => (window as unknown as {
          dataLayer?: { event?: string; offer_variant?: string }[];
        }).dataLayer?.filter((e) => e.event === 'view_offer') ?? []);
        expect(sent.length, `${slug}: view_offer did not fire`).toBe(1);
        expect(sent[0].offer_variant, `/quiz/${slug} shows the bottle and must report it`)
          .toBe('bottle');
      }
    });

  test('a Kit arm, switched on, reports itself as the kit', async ({ page }) => {
    await switchOffers(page, ['kit47']);
    await page.goto('/quiz/your-kit');
    await expect(heading(page)).toHaveText(KIT_HERO_HEAD);
    await page.waitForTimeout(400);
    const sent = await page.evaluate(() => (window as unknown as {
      dataLayer?: { event?: string; offer_variant?: string }[];
    }).dataLayer?.filter((e) => e.event === 'view_offer') ?? []);
    expect(sent.map((e) => e.offer_variant)).toEqual(['kit']);
  });

  test('a Kit arm, switched on, ends her plan on the Kit instead of the bottle', async ({ page }) => {
    await switchOffers(page, ['kit47']);
    await page.goto('/quiz/your-plan');
    await expect(page.locator('.kitHeroShot.isKit'), 'the Kit is pictured').toHaveCount(1);
    await expect(page.locator('.rise')).toContainText('What is inside');
    await expect(page.locator('.rise')).not.toContainText(PLAN_BOTTLE_WHY);
    await expect(page.locator('.actionBar .cta')).toContainText(PLAN_TO_KIT_CTA);
  });

  test('the bottle offer promises nothing the cart does not ship', async ({ page }) => {
    /* THE REASON THE SPLIT EXISTS. The kit page prices three guides at $97 of
       its $146.99 and Shopify ships one bottle. The main offer must not carry
       any of that: no value total, no bonus rows, no guide names. */
    await page.goto('/quiz/kit');
    const card = page.locator('#kit-offer');
    await expect(card.locator('.kitVs'), 'the value stack').toHaveCount(0);
    await expect(card.locator('.kitVsBonus'), 'the bonus cards').toHaveCount(0);
    for (const promise of ['$146.99', 'Total value', 'The 60-Day Hormone Fix',
      'Hormone Healthy Recipes', 'The Daily Symptom Tracker']) {
      await expect(card, `"${promise}" is on the bottle offer`).not.toContainText(promise);
    }
    /* What it does say is what is in the box. */
    await expect(card).toContainText('One bottle of Hormone Focus. 60 capsules, two a day.');
    /* And the plan reads as things she does, not things she is handed. */
    await expect(page.locator('.kitPlanLead'))
      .toHaveText('Your bottle is step one. Here is the rest of the plan to do alongside it.');

    /* EVERY BUTTON AND EVERY LINE NAMES THE BOTTLE, not the kit. The batch
       line counts bottles here and kits on the kit page. */
    for (const sel of ['.kitHeroCta', '#kit-offer .kitDeal a.kitBtn', 'a[data-close]']) {
      await expect(page.locator(sel).first(), `${sel} offers the kit`)
        .not.toContainText(/Kit/);
    }
    await expect(page.locator('.kitBatch')).toContainText('bottles on the shelf');
  });
});

test.describe('the nurture artwork, reused on the offer page', () => {
  test('both offers show the same pictures she met two screens earlier',
    async ({ page }) => {
      /* DAVID, 2 November: use those assets on the offer page too. It is the
         right call twice over. She has already seen them on `plan` and
         `meet`, so they read as the same plan rather than as new
         information, and they are in her cache, so showing them again costs
         nothing.

         Asserted on BOTH variants, because the sections carrying them are
         shared markup and a variant that lost them would be a silent
         regression on one page only. */
      /* The walk's offer and the off-walk one-bottle page, since Quiz V1. */
      for (const slug of ['your-kit', 'kit']) {
        await page.goto(`/quiz/${slug}`);
        await page.evaluate(async () => {
          const h = document.body.scrollHeight;
          for (let y = 0; y < h; y += 400) {
            window.scrollTo(0, y);
            await new Promise((r) => { setTimeout(r, 60); });
          }
        });
        await page.waitForTimeout(1200);

        /* The three step icons, in order, on the plan. */
        const icons = await page.locator('.kitStepIcon').evaluateAll(
          (els) => els.map((e) => ({
            file: (e as HTMLImageElement).currentSrc.split('/').pop() ?? '',
            loaded: (e as HTMLImageElement).naturalWidth > 0,
            alt: (e as HTMLImageElement).alt,
          })),
        );
        expect(icons.map((i) => i.file), `${slug}: the three step icons`).toEqual([
          'nurture-step-1-clear.webp',
          'nurture-step-2-eat.webp',
          'nurture-step-3-track.webp',
        ]);
        for (const i of icons) {
          expect(i.loaded, `${slug}: ${i.file} did not load`).toBe(true);
          expect(i.alt.length, `${slug}: ${i.file} has no alt text`).toBeGreaterThan(3);
        }

        /* And the diagram from `meet`, under "it is your hormones". */
        const how = page.locator('.kitMechHow');
        await expect(how, `${slug}: the diagram`).toHaveAttribute('src', /nurture-how-it-works/);
        expect(
          await how.evaluate((e) => (e as HTMLImageElement).naturalWidth > 0),
          `${slug}: the diagram did not load`,
        ).toBe(true);

        /* The plan comes before the mechanism it illustrates. */
        const order = await page.evaluate(() => {
          const at = (sel: string) => {
            const el = document.querySelector(sel);
            return el ? Math.round(el.getBoundingClientRect().top + window.scrollY) : -1;
          };
          return { plan: at('.kitPlan'), mech: at('.kitMech') };
        });
        expect(order.plan, `${slug}: the plan is missing`).toBeGreaterThan(0);
        expect(order.plan, `${slug}: the plan no longer leads`).toBeLessThan(order.mech);
      }
    });
});

test('the steal is its own section, and carries no second price', async ({ page }) => {
  /* It was the last thing inside the hero, under the guarantee line, which
     is where small print goes. David, 6 November: make it a section and put
     the framing above the cards, because she was meeting two prices and
     working out what they were for afterwards.

     A KIT SECTION, so it is read with a Kit arm switched on: since Quiz V1
     the Kit shows only at /quiz/your-kit, and only for a Kit arm. */
  await switchOffers(page, ['kit47']);
  await page.goto('/quiz/your-kit');
  await expect(heading(page)).toHaveText(KIT_HERO_HEAD);

  const band = page.locator('.kitCmpBand');
  await expect(band, 'the comparison has no band of its own').toHaveCount(1);
  expect(await band.evaluate((el) => el.closest('.kitHero') !== null),
    'the comparison is still inside the hero').toBe(false);

  /* A tint of its own, and room around it: a band that looks like the one
     above it is not a section, whatever the markup says. */
  const look = await band.evaluate((el) => {
    const cs = getComputedStyle(el);
    return {
      bg: cs.backgroundColor,
      page: getComputedStyle(document.body).backgroundColor,
      padTop: parseFloat(cs.paddingTop),
      padBottom: parseFloat(cs.paddingBottom),
    };
  });
  expect(look.bg, 'the band is the same colour as the page').not.toBe(look.page);
  expect(look.padTop, 'no air above the section').toBeGreaterThanOrEqual(24);
  expect(look.padBottom, 'no air below the section').toBeGreaterThanOrEqual(24);

  /* The argument first, the evidence second. */
  const order = await page.evaluate(() => ({
    head: document.querySelector('.kitCmpTitle')!.getBoundingClientRect().top,
    cards: document.querySelector('.kitCmpCards')!.getBoundingClientRect().top,
    why: document.querySelector('.kitCmpWhy')!.getBoundingClientRect().top,
  }));
  expect(order.head, 'the framing is not above the cards').toBeLessThan(order.cards);
  expect(order.why, 'the small line is not under the cards').toBeGreaterThan(order.cards);

  /* NO ARTWORK WITH A PRICE PRINTED INTO IT. kit-2bottle-hero.webp carries a
     starburst reading "$74.99 VALUE / $196.99". Beside a card that says
     $47.00 that is three prices for one thing, and it is baked into the
     pixels where no test of the text would ever see it. */
  const shot = await page.locator('.kitCmp.isKit .kitCmpShot').getAttribute('src');
  expect(shot, 'the kit card shows the whole kit').toBe('/img/kit-full-thumb.webp');
  expect(shot, 'the card is using the composite with the price burst on it')
    .not.toContain('kit-2bottle-hero');

  /* And the kit page says nothing about a batch, as of 6 November. */
  await expect(page.locator('.kitBatch'), 'the kit batch line is back')
    .toHaveCount(0);
});

test('both deal boxes strike the old price the same way, and legibly',
  async ({ page }) => {
    /* The struck price lived in the main box's badge at 12.5px on a purple
       fill, so the smaller of the two boxes was the only place it could be
       read. They match now. Asserted as RENDERED SIZE rather than as a class,
       because "it is there" was true before and was not the problem. */
    /* The active arm (the bottle) and, switched on, a Kit arm, both at the
       walk's offer address. */
    for (const slug of ['bottle', 'kit']) {
      await page.unrouteAll({ behavior: 'wait' });
      if (slug === 'kit') await switchOffers(page, ['kit47']);
      await page.goto('/quiz/your-kit');
      await expect(heading(page)).toHaveText(slug === 'kit'
        ? KIT_HERO_HEAD : 'Hormone Focus, your daily support');
      const was = await page.locator('#kit-offer .kitWas').evaluateAll(
        (els) => els.map((e) => ({
          text: e.textContent,
          px: Math.round(parseFloat(getComputedStyle(e).fontSize)),
          /* The red diagonal is a pseudo-element, so its presence is the
             honest check that the strike is the deliberate one. */
          ruled: getComputedStyle(e, '::after').content !== 'none',
        })),
      );
      /* ONE BOX ON THE KIT PAGE, TWO ON THE BOTTLE PAGE, since 6 November:
         the kit dropped its subscription, so it has one price to strike. */
      expect(was.length, `${slug}: the wrong number of struck prices`)
        .toBe(slug === 'kit' ? 1 : 2);
      for (const w of was) {
        /* THE KIT STRIKES WHAT THE KIT IS WORTH, not one bottle and not two:
           the badge above it adds the three guides to the two bottles, so
           striking $99.99 beside a $196.99 badge was two numbers for the
           same thing. The bottle offer strikes one bottle. */
        expect(w.text, `${slug}: the old price`)
          .toBe(slug === 'kit' ? '$196.99' : '$49.99');
        expect(w.px, `${slug}: ${w.px}px is too small to read`).toBeGreaterThanOrEqual(20);
        expect(w.ruled, `${slug}: no rule through the old price`).toBe(true);
      }
      /* And it sits beside the price it is struck against, not above it. */
      const sameLine = await page.evaluate(() => {
        const row = document.querySelector('.kitDealNow')!;
        return row.querySelector('.kitWas') !== null && row.querySelector('.kitDealNum') !== null;
      });
      expect(sameLine, `${slug}: the old price is not in the price row`).toBe(true);
    }
  });

/* ------------------------------ the stage-aware nurture copy, 3 November -- */

test.describe('the mechanism is the one that is true for her', () => {
  /**
   * Seeds a state BEFORE the app boots.
   *
   * It used to navigate and then write sessionStorage, which races: the quiz
   * provider mounts with whatever was already there and writes its own state
   * back on the next change, so the seed could be overwritten before the
   * screen read it. addInitScript runs before any page script, so the app
   * has never seen anything else.
   */
  const walk = async (page: import('@playwright/test').Page, S: Record<string, unknown>) => {
    await page.addInitScript(
      (st) => sessionStorage.setItem('hf_quiz_state_v3', JSON.stringify(st)),
      { tried: ['food'], name: 'Dana', ...S },
    );
  };

  /* REWRITTEN FOR QUIZ V1. The cause and meet screens are cut; what she is
     told about her estrogen now lives in two places, the stage block on her
     result and step one of her plan. Both have to be the one that is true
     for her: hormones that swing in perimenopause, less of them once her
     periods have stopped. */
  test('perimenopause is told her hormones swing, on her result and in her plan',
    async ({ page }) => {
      await walk(page, { sym: ['sweats', 'mood'], main: 'sweats', age: '40-44', cycle: 'unpredictable' });

      await page.goto('/quiz/result');
      await expect(heading(page)).toContainText('perimenopause');
      await expect(page.locator('.resSec .blabel').nth(1)).toHaveText('What perimenopause is');
      await expect(page.locator('.nFig img')).toHaveAttribute('src', /hormones-wave\.svg/);
      await expect(page.locator('.nCap')).toContainText('go up and down');

      await page.goto('/quiz/your-plan');
      await expect(heading(page)).toHaveText(/personal 60-day plan for night sweats and mood swings$/);
      await expect(page.locator('.nStep').first()).toContainText('In perimenopause');
      await expect(page.locator('.nStep').nth(2)).toContainText('go up and down');
    });

  test('menopause is told she runs on less, and never that she has too much',
    async ({ page }) => {
      /* SHE RUNS ON LESS ESTROGEN. Before 3 November every woman read "the
         real problem is too much estrogen", which is the opposite of her
         situation. */
      await walk(page, { sym: ['sweats'], main: 'sweats', age: '50-54', cycle: 'stopped', twelve: 'yes' });

      await page.goto('/quiz/result');
      await expect(heading(page)).toHaveText('Your answers may point to menopause.');
      await expect(page.locator('.resSec .blabel').nth(1)).toHaveText('What menopause is');
      await expect(page.locator('.nFig img')).toHaveAttribute('src', /hormones-low\.svg/);
      await expect(page.locator('.rise')).toContainText('your body makes much less of them');

      await page.goto('/quiz/your-plan');
      const step1 = page.locator('.nStep').first();
      await expect(step1).toContainText('In menopause');
      await expect(page.locator('.nStep').nth(2)).toContainText('runs on less estrogen');
      await expect(page.locator('.nSteps'), 'not the swinging of perimenopause').not.toContainText('up and down');
    });

  test('early menopause reads the same as menopause', async ({ page }) => {
    /* E is menopause arriving sooner, so the stage block is the same one. It
       is asserted separately because it reaches that state by different
       answers and has its own outcome key. */
    await walk(page, { sym: ['mood'], main: 'mood', age: '40-44', cycle: 'stopped', twelve: 'yes' });
    await page.goto('/quiz/result');
    await expect(heading(page)).toHaveText('Your answers may point to early menopause, which starts before 45.');
    await expect(page.locator('.resSec .blabel').nth(1)).toHaveText('What menopause is');
    await expect(page.locator('.nFig img')).toHaveAttribute('src', /hormones-low\.svg/);

    await page.goto('/quiz/your-plan');
    await expect(page.locator('.nStep').first()).toContainText('In early menopause');
  });

  test('the result screen and the plan screen agree about her estrogen',
    async ({ page }) => {
      /* The result's button promises her plan, so the two screens either
         side of it must not contradict each other about the direction her
         hormones went. */
      await walk(page, { sym: ['sweats'], main: 'sweats', age: '50-54', cycle: 'stopped', twelve: 'yes' });

      await page.goto('/quiz/result');
      const result = await page.locator('.rise').innerText();
      expect(result, 'the result screen must never say she has too much')
        .not.toMatch(/too much estrogen|extra estrogen/i);

      await page.locator('.actionBar .cta').click();
      await expect(page).toHaveURL(/your-plan$/);
      const plan = await page.locator('.rise').innerText();
      expect(plan, 'and nor may the screen it hands into')
        .not.toMatch(/too much estrogen|extra estrogen/i);
    });

  test('the doctor route still never sees her plan', async ({ page }) => {
    await startQuiz(page);
    await page.locator('.tile').first().click();
    await answerAndWait(page, pressPrimary(page), /How old are you/);
    await answerAndWait(page, pickOption(page, 0), /happening with your cycle/);
    await answerAndWait(page, pickOption(page, 3), /at least 12 months/);
    await answerAndWait(page, pickOption(page, 0), /Talk to your healthcare professional/);
    await expect(page.locator('.actionBar .cta'), 'a way forward from rDoc').toHaveCount(0);
  });
});

test('the welcome offer says what it is, what it costs and why she has it',
  async ({ page }) => {
    /* THE OFFER IS THE STRONGEST THING ON THIS PAGE at 25%, so it is asserted
       as a whole: the name, both prices, the saving in money, and the reason
       she is seeing a price the website does not show. */
    await page.goto('/quiz/kit');
    const card = page.locator('.kitHero .kitPrice.isWelcome');

    await expect(card.locator('.kitWelcome')).toContainText('Welcome offer');
    await expect(card.locator('.kitWelcome')).toContainText('25% off your first order');
    await expect(card.locator('.kitWas.isBig')).toHaveText('$49.99');
    await expect(card.locator('.kitPriceToday b')).toHaveText('$37.50');
    await expect(card.locator('.kitPriceSave')).toHaveText('You save $12.49 today');
    /* WHY SHE IS SEEING IT lives on the offer card rather than in the hero:
       the hero block went back to its earlier shape on 5 November. The store
       sells this bottle at $49.99 without the code, so the sentence is a
       fact about the store rather than a flourish. */
    await expect(page.locator('.kitDealWhy'))
      .toContainText('Not available on the website');

    /* THE OLD PRICE HAS TO BE READABLE, which is the thing that was wrong at
       13px: asserted as rendered size and as a ruled line, not as markup. */
    const was = await card.locator('.kitWas.isBig').evaluate((e) => ({
      px: Math.round(parseFloat(getComputedStyle(e).fontSize)),
      ruled: getComputedStyle(e, '::after').content !== 'none',
    }));
    /* 20px, NOT 24. The complaint this test exists for was 13px grey type
       under a footnote; the floor is there to stop it sliding back to that,
       not to forbid the hero scaling type down a step on a short screen,
       which it does deliberately to keep the button above the fold. At
       320x568 it renders 23px, which failed an arbitrary 24 and reads
       perfectly well. */
    expect(was.px, `${was.px}px is back to being a footnote`)
      .toBeGreaterThanOrEqual(20);
    expect(was.ruled, 'no rule through the old price').toBe(true);

    /* AND THE LINK CARRIES THE CODE THAT MAKES THE NUMBER TRUE. Verified
       against the live cart on 5 November: HORMONE25OFF takes 49.99 to
       37.50, and no code at all leaves it at 49.99. */
    const href = await page.locator('#kit-offer a[data-offer="single"]').getAttribute('href');
    expect(href, 'the page promises 25% and the link must carry it')
      .toContain('discount=HORMONE25OFF');
    expect(href, 'the old ten percent code must be gone').not.toContain('JJTEN');
  });

test('the kit headline uses her name, and stands up without one', async ({ page }) => {
  /* SHE GAVE HER NAME AT THE EMAIL GATE, and a woman who arrived from JJ's
     own list never saw that screen. Both have to read as a sentence: the
     fallback is not a cosmetic nicety, it is most of JJ's list. */
  const seed = {
    sym: ['sleep'], main: 'sleep', age: '40-44', cycle: 'unpredictable',
    pattern: 'most', tried: ['food'], want: 'sleep',
  };
  /* The one-bottle offer, the active arm, keeps its own headline. Read
     first, before the Kit is switched on for the rest of this page. */
  await page.goto('/quiz/your-kit');
  await expect(heading(page)).toHaveText('Hormone Focus, your daily support');

  /* The Kit headline shows only for a Kit arm, so one is switched on. */
  await switchOffers(page, ['kit47']);

  for (const [name, expected] of [
    /* No timeframe in the headline since Quiz V1 (Jane, 11 November). */
    ['Dana', 'Dana, feel like you again.'],
    ['', KIT_HERO_HEAD],
    /* A name of only spaces is the one a real form produces, and it must not
       render as ", feel like you again". */
    ['   ', KIT_HERO_HEAD],
  ]) {
    await page.addInitScript(
      (st) => sessionStorage.setItem('hf_quiz_state_v3', JSON.stringify(st)),
      { ...seed, name },
    );
    await page.goto('/quiz/your-kit');
    await expect(heading(page), `name ${JSON.stringify(name)}`).toHaveText(expected);
  }
});
