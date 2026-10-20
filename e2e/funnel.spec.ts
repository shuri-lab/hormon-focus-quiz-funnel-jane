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

    /* RESULT PAGE 1. What her answers MAY POINT TO, said in one sentence.
       SOFTENED 7 OCTOBER 2026: the heading used to be the bare stage word
       ("Perimenopause") with the sentence under it in `.resLine`. The bare
       stage word is no longer printed at all, so the heading is the sentence
       and `.resLine` is gone. */
    await expect(page.locator('.resKicker')).toHaveText('Renee, your Hormone Check result');
    await expect(heading(page)).toHaveText(
      'Your answers may point to perimenopause, the years before your periods stop.',
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
    for (const banned of ['between two', 'closer fit', 'may be part of the picture', 'estrogen', '$']) {
      expect(resultText, banned).not.toContain(banned);
    }
    /* NO SENTENCE TELLS HER SHE HAS A STAGE, which is what the bare string
       'You have ' used to stand in for. The bridge close added on 19 October
       opens "You have already tried eating better and moving more", which is
       a statement about what she told the quiz and not a diagnosis, and the
       crude string could not tell the two apart. The rule it was protecting
       is written out instead, so it still fails on "You have perimenopause"
       and no longer fails on a sentence about her own answers. */
    for (const stage of ['perimenopause', 'menopause', 'a hormonal imbalance', 'early menopause']) {
      expect(resultText.toLowerCase(), `told she HAS ${stage}`)
        .not.toContain(`you have ${stage}`);
      expect(resultText.toLowerCase(), `told she IS in ${stage}`)
        .not.toContain(`you are in ${stage}`);
    }
    await expect(page.locator('a[href*="shop.jjsmithonline.com"]')).toHaveCount(0);

    /* THE BRIDGE CLOSE, 19 October. The result used to end on the fact above
       and hand her to a page that opened with a price. This names the reason
       before she gets there, and the offer page opens on the same thread. */
    await expect(page.locator('.resClose')).toHaveText(
      'You have already tried eating better and moving more. This is not about '
      + 'trying harder. It is about what is happening with your hormones. '
      + 'Let me show you where I would start.',
    );

    await expect(page.locator('.actionBar .cta')).toContainText('SHOW ME MY PLAN');
    await page.locator('.actionBar .cta').click();

    /* RESULT PAGE 2. REBUILT 16 OCTOBER 2026 for conversion. It opened on
       three free tips and reached the price at section six of fourteen; it
       now opens on the outcome she came for, with proof and a button, and
       the offer sits directly under the hero.

       The headline is hers: she said sleep bothers her most, and the eyebrow
       carries the stage from the result page she has just read. */
    await expect(heading(page)).toHaveText('Sleep through the night again.');
    await expect(page.locator('.kitHeroEyebrow')).toHaveText('Your perimenopause plan');
    await expect(page.locator('.kitHeroSub')).toContainText('Two capsules a day');

    /* THE FIRST SCREEN CARRIES THE OFFER, which is the entire point of the
       rebuild: a button, the risk taken off it, and two forms of proof. */
    await expect(page.locator('.kitHeroCta')).toHaveText(/START MY 60 DAYS/);
    await expect(page.locator('.kitHeroRisk'))
      .toHaveText('60-day money-back guarantee · Free shipping · Ships today');
    const fold = page.viewportSize()!.height;
    const ctaBox = (await page.locator('.kitHeroCta').boundingBox())!;
    expect(
      Math.round(ctaBox.y + ctaBox.height),
      'the hero button has to be on the first screen',
    ).toBeLessThanOrEqual(fold);

    await expect(page.getByText('You told us you have already tried changing how you eat and exercising more.')).toBeVisible();

    /* HER THREE THINGS ARE NOW THE PLAN IN ACTION, and they moved below the
       offer rather than above it: three free tips were the first thing a
       warm woman met, and they handed her the answer without the kit.
       Nothing personal was lost in the move. threeCards() maps onto the
       three steps exactly, so her two symptom cards are what step two is,
       and the tracker is step three.

       CHANGED 9 OCTOBER 2026: the third card is always the tracker. It used
       to be her third symptom (energy, here), which meant a woman who ticked
       three things never got the one action that works for every result. */
    await expect(page.locator('.kitPlan .kitH2')).toHaveText('Three simple things, every day.');
    await expect(page.locator('.planSteps > li')).toHaveCount(3);
    await expect(page.locator('.planSteps > li').nth(0)).toContainText('Take two capsules a day.');
    await expect(page.locator('.planSteps > li').nth(1)).toContainText('Follow the food and sleep cues');
    await expect(page.locator('.planSteps > li').nth(2)).toContainText('Mark the tracker.');
    await expect(page.getByText('Your first three things')).toHaveCount(0);
    const cards = page.locator('.priCard');
    await expect(cards).toHaveCount(3);
    await expect(cards.nth(0)).toContainText('Protect your sleep');
    await expect(cards.nth(1)).toContainText('Build meals that keep you full');
    await expect(cards.nth(2)).toContainText('Write it down for two weeks');
    /* Her third symptom is no longer a card of its own. */
    await expect(cards.nth(2)).not.toContainText('Build steadier energy');

    /* What she already tried is acknowledged inside the card it belongs to:
       eating differently on the weight card. She did not say she had worked
       on her sleep, so that card has no acknowledgement on it. */
    await expect(cards.nth(1)).toContainText("You've already changed how you eat");
    await expect(cards.nth(0)).not.toContainText('already worked on your sleep');

    /* AND SHE IS NO LONGER TOLD ANYTHING ABOUT THE EXERCISING.
       `cardAcks` is unchanged: the gym line goes on the energy card, or the
       weight card when energy is not shown and food has not already claimed
       it. She ticked food and gym, energy is no longer a card, and food owns
       the weight card, so the line has nowhere left to go. Asserted rather
       than left implicit, because it is a sentence she used to read. */
    await expect(page.getByText("More cardio won't work.")).toHaveCount(0);

    /* THE BRIDGE IS OFF THE PAGE. It read "These are the first three things
       I would work on ... this is why I built the Feel Like YOU Again Kit",
       which pointed from the tips to the kit. The kit is above the tips now,
       so the sentence pointed backwards. It is still exported from
       resultCopy.ts and still under the copy gate, just not rendered. */
    await expect(page.locator('.bridge')).toHaveCount(0);

    await expect(page.locator('.nextHowQ')).toHaveText('The 60-Day Feel Like YOU Again Kit');
    await expect(page.getByText('I put the Feel Like YOU Again Kit together', { exact: false })).toBeVisible();
    /* The opening is two paragraphs now, not one. */
    await expect(page.getByText('Hormones change slowly, and so do habits', { exact: false })).toBeVisible();

    /* Why sixty days, under its own heading, said about the concern she
       named. She said sleep. */
    await expect(page.locator('.why60T')).toHaveText('Why 60 days?');
    await expect(page.locator('.why60'))
      .toContainText('they start noticing better nights in the first month');
    await expect(page.locator('.why60')).toContainText('Many women tell me');

    /* "WHAT'S INSIDE" IS OFF THE PAGE, 16 October. Those four rows named the
       same four things the kit card's value stack already lists, with
       prices, under a photograph of all four: the offer said twice. The kit
       card is where she reads what is in it now. */
    await expect(page.locator('.kitPiecesT')).toHaveCount(0);
    await expect(page.locator('.kitRow')).toHaveCount(0);
    await expect(page.locator('.kitClaim')).toHaveCount(0);
    /* It is still said, where she is reading about the formula rather than
       about the box. */
    await expect(page.locator('.kitMg')).toContainText('Supports healthy estrogen metabolism.');
    /* THE FORMULA IS OFF THIS PAGE. It stays on the offer page below. */
    for (const ingredient of ['DIM', 'Calcium D-Glucarate', 'BioPerine']) {
      await expect(page.locator('.nextHow'), ingredient).not.toContainText(ingredient);
    }
    await expect(page.getByText('Not one more thing to try. Just one plan built around feeling like you again.')).toBeVisible();
    /* THE SIX OVERLAPPED FACES ARE GONE from the hero, and the rail under it
       shows all twelve of the same women at a size she can see. Same proof,
       once, in the place where height is not scarce. */
    await expect(page.locator('[data-proof="pre"] .pfFaces')).toHaveCount(0);
    /* Twelve photographs, doubled, which is what makes the loop seamless. */
    await expect(page.locator('[data-proof="rail"] .pfRailTrack img')).toHaveCount(24);
    await expect(page.locator('[data-proof="rail"] .pfPressTrack img')).toHaveCount(16);
    /* Each outlet named once: the second copy of the track is blank so a
       screen reader does not read the press list twice. */
    await expect(page.locator('[data-proof="rail"] .pfPressTrack img[alt="The New York Times"]'))
      .toHaveCount(1);
    /* And the Facebook comment sits under both rails, not in the review wall. */
    await expect(page.locator('[data-proof="rail"] .pfFb img'))
      .toHaveAttribute('alt', /Martinez Sullivan/);
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

    /* TWO CHOICES, NOT THREE, since 16 October 2026. The 30-day one-time
       bottle is off this page: it cost MORE than the subscription for the
       same bottle ($49.99 against $39.99), so it was the row nobody should
       pick, and it set her up to stop at day 30 before the plan finished.
       There is no radio group left, so the alternative is one link.

       THE PRODUCT IS NOT GONE, only this page's offer of it. /offer, /live
       and /plan still sell it, and offer.spec.ts still holds them to it. */
    const bottle = page.locator('.kitQuiet');
    await expect(bottle.locator('.kitOpt')).toHaveCount(0);
    await expect(bottle).toContainText('Prefer to start month to month?');
    await expect(bottle).not.toContainText('One-time purchase');
    await expect(bottle.locator('a.kitBtn')).toContainText('Subscribe & save · $39.99');
    await expect(bottle.locator('a.kitBtn'))
      .toHaveAttribute('href', /cart\/add\?id=54355951845487.*selling_plan=5529010287/);
    /* CHECKED AGAINST THE LIVE CART on 16 October: that variant on that plan
       produces a line whose Frequency reads "Deliver every month". The card
       said "Delivered every 30 days" before, which was never what Shopify
       tells her at the checkout. */
    await expect(bottle).toContainText('Delivered every month');
    /* The crossed price is the same bottle bought one at a time, which is why
       the one-time price is still a number on this page. */
    await expect(bottle.locator('.kitAltCost')).toContainText('$49.99');
    await expect(page.locator('a[href*="41200079175791"]'), 'the one-time cart link is off the page')
      .toHaveCount(0);

    /* Proof comes after the offer, in three places. She said sleep bothers
       her most, so the first review she reads is about sleep. */
    /* Four from JJ's page: the first stands alone above the offer, the other
       three sit under it. */
    await expect(page.locator('[data-proof="lead"] .kitRev')).toHaveCount(3);
    /* THE CONTRACT, NOT THE FALLBACK. "What women are saying" is live Okendo
       with the authored four behind it, and the wall moved up the page in the
       16 October rebuild, so whether the lazy fetch has fired by the time
       this runs is a race. Either real reviews render or the authored ones
       do; an empty section or an apology is the only failure. */
    await expect(page.locator('.okWall .okRev, [data-proof="more"] .kitRev').first())
      .toBeVisible();
    await expect(page.locator('[data-proof="closing"] .kitRev')).toHaveCount(1);
    await expect(page.locator("[data-proof=\"lead\"]").locator("xpath=..").locator(".pfFaces img")).toHaveCount(12);
    /* THE HERO'S RATING, which always renders. It used to read the first one
       inside a .kitSec, and the only one left there is the Okendo fallback's
       own badge: the wall moved up the page in the 16 October rebuild, so
       whether that fallback is what renders is now a race with the live
       fetch. The hero is not a race.

       TWO LINES SINCE 16 OCTOBER: the score, then who verified it. */
    const rating = page.locator('.kitHeroProof .pfRating');
    await expect(rating.locator('.pfRatingScore')).toContainText('4.9');
    await expect(rating.locator('.pfRatingScore')).toContainText('171 reviews');
    await expect(rating.locator('.pfRatingBy')).toContainText('Verified by');
    await expect(rating.locator('.pfRatingBy img')).toHaveAttribute('alt', 'Okendo');

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
    await expect(heading(page)).toHaveText('Your answers may point to menopause.');
    await expect(page.getByText('Many women describe the same changes after that point.')).toBeVisible();
    await expect(page.getByText('This is a normal stage, not an illness.', { exact: false })).toBeVisible();
    await expect(page.locator('.resKicker')).toHaveText('Your Hormone Check result');
    await expect(page.locator('.resFacts')).toContainText('Stopped 12 months or more');
    await expect(page.locator('.resPics figure')).toHaveCount(1);
    await expect(page.locator('.resPics figure')).not.toContainText('Bothers you most');
    /* Her wish is softened on the way back, so it cannot read as a promise. */
    await expect(page.getByText('To feel cooler and more comfortable.')).toBeVisible();
    await page.locator('.actionBar .cta').click();

    /* She ticked hot flashes and nothing else, so the hero names the one
       she came for. 'Start with these 3 for hot flashes' until 16 October. */
    await expect(heading(page)).toHaveText('Sleep cool through the night again.');
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
    ['when-you-notice-it', 'When do you notice these changes most'],
    ['what-you-have-tried', 'What have you already tried'],
    ['what-you-want', 'What do you want most right now'],
    ['your-result', 'Your Hormone Check is ready'],
    ['result', ''],
    /* The hero headline, with no answers behind it. It was
       'Start with these 3' until the 16 October rebuild. */
    ['kit', 'Feel like YOU again.'],
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

  /* ------------------------------------------- the 16 October rebuild -- */

  test('the offer is above the tips, which is the whole point of the rebuild',
    async ({ page }) => {
      /* THE ORDER IS THE CHANGE. The page opened on three free tips and
         reached the price at section six of fourteen, which handed a warm
         woman the answer for nothing and asked 60% of them to scroll for the
         offer. Asserted by document position rather than by eye, so a later
         edit that quietly moves the offer back down fails here. */
      await page.goto('/quiz/kit');
      const order = await page.evaluate(() => {
        const at = (sel: string) => document.querySelector(sel);
        const hero = at('.kitHero');
        const offer = at('#kit-offer');
        const plan = at('.kitPlan');
        if (!hero || !offer || !plan) return null;
        const follows = (a: Element, b: Element) =>
          Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
        return {
          offerAfterHero: follows(hero, offer),
          planAfterOffer: follows(offer, plan),
        };
      });
      expect(order, 'the hero, the offer or the plan is missing').not.toBeNull();
      expect(order!.offerAfterHero, 'the offer must follow the hero').toBe(true);
      expect(order!.planAfterOffer, 'the tips must follow the offer').toBe(true);
    });

  test('the guarantee answers the price directly, with nothing in between',
    async ({ page }) => {
      /* MOVED 16 OCTOBER at David's request. It sat five sections below,
         after the questions. The guarantee is the answer to the price, so it
         has to be the next thing she reads after it: asserted as the very
         next band rather than merely somewhere below, because "after the
         offer" was true of the old position too. */
      await page.goto('/quiz/kit');
      const bands = await page.locator('.kitBand').evaluateAll(
        (els) => els.map((e) => e.className),
      );
      expect(bands[0], 'the offer is the first band').toBe('kitBand');
      expect(bands[1], 'the guarantee is the one directly under it').toBe('kitBand teal');
      await expect(page.locator('.kitBand').nth(1).locator('.kitPromise'))
        .toContainText('60-Day Happiness Guarantee');
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

  test('the one-time bottle is off this page and still sold on the offer pages',
    async ({ page }) => {
      /* Removed from the PAGE, not from the product. Two places have to stay
         true at once or the removal has quietly become a delisting. */
      await page.goto('/quiz/kit');
      await expect(page.locator('a[href*="41200079175791"]')).toHaveCount(0);
      await expect(page.getByText('One-time purchase')).toHaveCount(0);

      await page.goto('/offer');
      await expect(page.locator('a[href*="41200079175791"]').first()).toBeAttached();
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
      expect(hrefs.length, 'the kit, the subscription and the closer').toBeGreaterThanOrEqual(3);

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

  test('why it works renders before the price, which is the point of the change',
    async ({ page }) => {
      /* THE CHANGE THIS PR MAKES. The reasoning sat at section five, after the
         offer and the guarantee, so she met $74.99 before she had been given
         any reason the product was the answer. Asserted by document position
         so a later edit that moves it back below the price fails here. */
      await page.goto('/quiz/kit');
      const where = await page.evaluate(() => {
        const mech = document.querySelector('.kitMech');
        const offer = document.querySelector('#kit-offer');
        if (!mech || !offer) return null;
        return {
          mechFirst: Boolean(mech.compareDocumentPosition(offer) & Node.DOCUMENT_POSITION_FOLLOWING),
          copies: document.querySelectorAll('.kitMech').length,
        };
      });
      expect(where, 'why-it-works or the offer is missing').not.toBeNull();
      expect(where!.mechFirst, 'why it works must come before the price').toBe(true);
      expect(where!.copies, 'the block was moved, not duplicated').toBe(1);

      /* And the two scroll targets still mean the price, not the reasoning. */
      await page.locator('.kitHeroCta').click();
      await page.waitForTimeout(1200);
      const offerTop = (await page.locator('.kitBand').first().boundingBox())!.y;
      const mechTop = (await page.locator('.kitMech').boundingBox())!.y;
      expect(Math.abs(offerTop), 'the hero CTA lands on the price').toBeLessThan(140);
      expect(mechTop, 'and has scrolled past why it works').toBeLessThan(-100);
    });

  test('the bridge says nothing she did not say', async ({ page }) => {
    /* The opening clause is a claim about her. A woman who ticked "Nothing
       yet" never told the quiz she had changed how she eats, so neither page
       may tell her she did. Deep-linked there are no answers at all, which is
       the same case with nothing behind it. */
    await page.goto('/quiz/kit');
    const mech = await page.locator('.kitMech').innerText();
    expect(mech, 'deep-linked, so she said nothing')
      .not.toContain('You have already tried');
    expect(mech, 'and the rest of the bridge still reads')
      .toContain('When the change is coming from your hormones');

    await page.goto('/quiz/result');
    await expect(page.locator('.resClose')).toHaveText(
      'This is not about trying harder. It is about what is happening with '
      + 'your hormones. Let me show you where I would start.',
    );
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

/* -------------------------------------- the result to offer handoff -- */

test.describe('the handoff from the result', () => {
  test('her ad tags cross to the offer and her answers do not', async ({ page }) => {
    /* TWO RULES AT ONCE, and they pull against each other. Every marketing
       parameter has to survive the step, and nothing about her body may ride
       with them: her answers travel in app state, never in the query. */
    const ad = 'utm_source=fb&utm_campaign=test&fbclid=abc&utm_medium=paid';
    await startQuiz(page, `/quiz/symptoms?${ad}`);

    await page.locator('.tile').nth(0).click();
    await page.locator('.tile').nth(1).click();
    await answerAndWait(page, pressPrimary(page), /Which one bothers you the most/);
    await answerAndWait(page, pickOption(page, 1), /How old are you/);
    await answerAndWait(page, pickOption(page, 2), /happening with your cycle/);
    await answerAndWait(page, pickOption(page, 1), /When do you notice these changes most/);
    await answerAndWait(page, pickOption(page, 2), /What have you already tried/);
    await page.locator('.opt').nth(0).click();
    await answerAndWait(page, pressPrimary(page), /want most right now/);
    await page.locator('.opt').nth(1).click();

    await expect(page.locator('#ef')).toBeVisible({ timeout: 10_000 });
    await page.fill('#nf', 'Renee');
    await page.fill('#ef', 'renee@example.com');
    await page.locator('#cf').check();
    await page.locator('.actionBar .cta').click();

    await expect(page.locator('.resClose')).toBeVisible({ timeout: 10_000 });
    for (const pair of ad.split('&')) {
      await expect(page, `${pair} was dropped before the result`).toHaveURL(
        new RegExp(pair.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
      );
    }

    /* The step this PR renamed, and the one the whole handoff turns on. */
    await page.locator('.actionBar .cta').click();
    await expect(page).toHaveURL(/\/quiz\/kit/);
    for (const pair of ad.split('&')) {
      await expect(page, `${pair} was dropped crossing to the offer`).toHaveURL(
        new RegExp(pair.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
      );
    }

    /* Nothing about her body is in the address bar. */
    const url = page.url().toLowerCase();
    for (const leak of ['sleep', 'weight', 'energy', 'perimenopause', 'menopause', 'outcome', 'symptom', 'renee', 'example.com']) {
      expect(url, `${leak} is in the URL`).not.toContain(leak);
    }

    /* And the tags are on the cart links she can press from here. */
    const hrefs = await page.locator('a[href*="shop.jjsmithonline.com"]').evaluateAll(
      (as) => as.map((a) => (a as HTMLAnchorElement).href),
    );
    expect(hrefs.length).toBeGreaterThanOrEqual(3);
    for (const href of hrefs) {
      for (const pair of ad.split('&')) {
        expect(href, `${pair} is missing from a cart link`).toContain(pair);
      }
      expect(href).not.toMatch(/outcome|perimenopause|symptom|renee/i);
    }
  });
});
