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
    for (const banned of ['between two', 'closer fit', 'may be part of the picture', 'You have ', 'estrogen', '$']) {
      expect(resultText, banned).not.toContain(banned);
    }
    await expect(page.locator('a[href*="shop.jjsmithonline.com"]')).toHaveCount(0);

    /* THE PART MOST WOMEN MISS, 20 October: the gap named before the plan is
       offered, so the next page can open on the plan rather than on a price.
       She ticked eating differently and exercising more, so she gets the line
       that says so. */
    const miss = page.locator('.block').filter({ hasText: 'The part most women miss' });
    await expect(miss).toHaveCount(1);
    await expect(miss).toContainText('What changed is on the inside');
    await expect(miss).toContainText("You've already tried eating better and moving more");

    /* And the hand-off, which is the last thing she reads before the button. */
    await expect(page.locator('.resHandoff'))
      .toHaveText("There's a simple place to start. Let me show you where I'd start.");

    await expect(page.locator('.actionBar .cta')).toContainText('SHOW ME WHERE TO START');
    await page.locator('.actionBar .cta').click();

    /* RESULT PAGE 2. REBUILT 16 OCTOBER 2026 for conversion. It opened on
       three free tips and reached the price at section six of fourteen; it
       now opens on the outcome she came for, with proof and a button, and
       the offer sits directly under the hero.

       The headline is hers: she said sleep bothers her most, and the eyebrow
       carries the stage from the result page she has just read. */
    await expect(heading(page)).toHaveText('Sleep through the night again.');
    /* THE SUB IS WHAT THE PRODUCT IS, by her stage. It said "One simple plan
       for your hormones" while the kit was on this page; the kit is gone and
       so is the plan it described. */
    await expect(page.locator('.kitHeroSub'))
      .toHaveText('Hormone Focus is a daily supplement for women in perimenopause. Two capsules a day.');
    await expect(page.locator('.kitHeroEyebrow')).toHaveText('Your result · Perimenopause');

    /* THE FIRST SCREEN CARRIES THE OFFER, which is the entire point of the
       rebuild: a button, the risk taken off it, and two forms of proof. */
    await expect(page.locator('.kitHeroCta')).toHaveText(/Get Hormone Focus/);
    /* NO FREE-SHIPPING PROMISE, anywhere above the fold. It said so while the
       kit led this page and its link carried HF60FREESHIP; the bottle's link
       carries the 10% code instead and Shopify takes one of them. */
    await expect(page.locator('.kitHeroRisk'))
      .toHaveText('60-day money-back guarantee · 10% off your first bottle · Ships today');
    await expect(page.locator('.kitHero'), 'no free shipping above the fold')
      .not.toContainText('Free shipping');
    const fold = page.viewportSize()!.height;
    const ctaBox = (await page.locator('.kitHeroCta').boundingBox())!;
    expect(
      Math.round(ctaBox.y + ctaBox.height),
      'the hero button has to be on the first screen',
    ).toBeLessThanOrEqual(fold);

    /* THE PLAN SECTION IS GONE, 22 October, and with it every line that
       promised something one bottle does not deliver: the three steps, the
       tracker, "Why 60 days" and JJ's note about the Kit. What replaced it
       is her symptom read back, the stage it belongs to, and a dosage line.

       SHE IS NO LONGER TOLD TO FIX HER OWN SLEEP AND MEALS, which is the
       half that mattered: on a page selling a supplement, homework reads as
       the product conceding it is not the thing that helps. */
    await expect(page.locator('.kitPlan'), 'the plan section').toHaveCount(0);
    await expect(page.locator('.planSteps'), 'the three steps').toHaveCount(0);
    await expect(page.locator('.priCard'), 'her symptom cards').toHaveCount(0);

    const pageText = await page.locator('.rise').innerText();
    for (const gone of ['Mark the tracker', 'Why 60 days', 'the supplement in the kit',
      'Feel Like YOU Again Kit', 'One simple plan']) {
      expect(pageText, `"${gone}" still on the page`).not.toContain(gone);
    }

    /* Her symptom still keys the page, in the two places that are left. */
    await expect(page.locator('.kitMech .kitBody').first())
      .toContainText('You told us your sleep breaks at night.');
    await expect(page.locator('.kitMech .kitBody').first())
      .toContainText('In perimenopause your hormones get less steady');
    await expect(page.locator('.kitHow')).toContainText('Two capsules a day, with a meal');


    /* THE BRIDGE IS OFF THE PAGE. It read "These are the first three things
       I would work on ... this is why I built the Feel Like YOU Again Kit",
       which pointed from the tips to the kit. The kit is above the tips now,
       so the sentence pointed backwards. It is still exported from
       resultCopy.ts and still under the copy gate, just not rendered. */
    await expect(page.locator('.bridge')).toHaveCount(0);

    /* JJ'S NOTE ABOUT THE KIT AND "WHY 60 DAYS" WENT WITH THE PLAN SECTION.
       Both described a sixty-day kit, and this page sells a thirty-day
       bottle. The copy is still exported and still under the claim gate; it
       is simply not rendered here. */
    await expect(page.locator('.nextHowQ')).toHaveCount(0);
    await expect(page.locator('.why60')).toHaveCount(0);

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
    /* The three ingredients are where she reads about the formula. */
    for (const ingredient of ['DIM', 'Calcium D-Glucarate', 'BioPerine']) {
      await expect(page.locator('.kitMg'), ingredient).toContainText(ingredient);
    }
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
    /* AND THE FACEBOOK COMMENT MOVED INTO THE WALL, 22 October. The rails
       are their own section at the top now and the wall is the scroll target
       the review teaser's Read-all button points at; the comment belongs
       with the reviews rather than under the logos. */
    await expect(page.locator('[data-proof="wall"] .pfFb img'))
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
    /* THE LEAD CARD IS ONE BOTTLE, 22 October. It was the kit, with its
       value stack and its $196.99. David's call: a smaller first purchase in
       front of cold traffic. The kit is off this page and unchanged on
       /offer, which the test below holds.

       $45.00 AND NOT $44.99, which is the number that matters here. Ten
       percent of 49.99 is 4.999, Shopify rounds the DISCOUNT to $4.99, and
       she is charged $45.00. Verified at the live checkout on 22 October:
       Subtotal $49.99, order discount JJTEN -$4.99, total USD $45.00. If
       this assertion and the checkout ever disagree, the page is lying
       about a price and this is the thing that says so. */
    const lead = page.locator('.kitLead');
    const once = lead.locator('.kitOpt').nth(0);
    await expect(once, 'the one-time option is selected first').toHaveClass(/\bon\b/);
    await expect(once.locator('.kitOptCost')).toContainText('$45.00');
    await expect(once.locator('.kitOptCost')).toContainText('$49.99');
    await expect(once.locator('.kitOptCost')).toContainText('$1.50 a day');
    await expect(once).toContainText('10% off applied at checkout');
    await expect(lead.locator('a.kitBtn')).toContainText('Get Hormone Focus · $45.00');
    await expect(lead.locator('a.kitBtn'))
      .toHaveAttribute('href', /cart\/41200079175791:1.*discount=JJTEN/);

    /* AND THE TOGGLE MOVES BOTH THE LABEL AND THE LINK, so the button can
       never buy the option she did not pick. The subscription carries its
       own 20% in Shopify and must not also carry JJTEN. */
    await lead.locator('.kitOpt').nth(1).click();
    await expect(lead.locator('a.kitBtn')).toContainText('Subscribe & save · $39.99');
    const subHref = await lead.locator('a.kitBtn').getAttribute('href');
    expect(subHref).toMatch(/cart\/add\?id=54355951845487.*selling_plan=5529010287/);
    expect(subHref, 'JJTEN must not ride the subscription').not.toContain('JJTEN');
    await lead.locator('.kitOpt').nth(0).click();
    await expect(lead.locator('a.kitBtn')).toContainText('Get Hormone Focus · $45.00');
    /* FREE SHIPPING IS THE SUBSCRIPTION'S AND NOT THE BOTTLE'S. It is on the
       card, because the second option genuinely gets it; what must never
       carry it is the one-time row, whose link spends Shopify's single
       discount parameter on the 10% code and so cannot also carry
       HF60FREESHIP. */
    await expect(once, 'the one-time bottle does not get free shipping')
      .not.toContainText('FREE SHIPPING');
    await expect(lead.locator('.kitOpt').nth(1), 'the subscription does')
      .toContainText('FREE SHIPPING');
    await expect(page.locator('.kitLead .kitVs li'), 'the kit value stack went with the kit')
      .toHaveCount(0);

    /* TWO CHOICES, NOT THREE, since 16 October 2026. The 30-day one-time
       bottle is off this page: it cost MORE than the subscription for the
       same bottle ($49.99 against $39.99), so it was the row nobody should
       pick, and it set her up to stop at day 30 before the plan finished.
       There is no radio group left, so the alternative is one link.

       THE PRODUCT IS NOT GONE, only this page's offer of it. /offer, /live
       and /plan still sell it, and offer.spec.ts still holds them to it. */
    /* ONE CARD WITH TWO OPTIONS, 22 October, where there were two cards with
       a button each. .kitQuiet is gone with the second card; the
       subscription is the second row of the radio group now. */
    await expect(page.locator('.kitQuiet'), 'the second card').toHaveCount(0);
    await expect(lead.locator('.kitOpt'), 'two options, one button').toHaveCount(2);

    const subOpt = lead.locator('.kitOpt').nth(1);
    await expect(subOpt).toContainText('Subscribe & save');
    await expect(subOpt).toContainText('20% OFF');
    /* CHECKED AGAINST THE LIVE CART on 16 October: that variant on that plan
       produces a line whose Frequency reads "Deliver every month". The brief
       asked for "every 30 days"; the checkout says month, so the page does
       too. */
    await expect(subOpt).toContainText('Delivered every month');
    await expect(subOpt).toContainText('Pause or cancel anytime');
    /* The crossed price is the same bottle bought one at a time, on both
       rows, which is why $49.99 is still a number on this page. */
    await expect(subOpt.locator('.kitOptCost')).toContainText('$39.99');
    await expect(subOpt.locator('.kitOptCost')).toContainText('$49.99');
    /* REVERSED 22 October: the one-time bottle is what this page sells now,
       so its cart link is expected rather than forbidden. What must be
       absent is the kit's. Both links to the bottle, the lead card and the
       closer, carry the discount. */
    const bottleLinks = await page.locator('a[href*="41200079175791"]').evaluateAll(
      (as) => as.map((a) => (a as HTMLAnchorElement).href),
    );
    expect(bottleLinks.length, 'the lead card and the closer').toBe(2);
    for (const h of bottleLinks) {
      expect(h, 'a bottle link without the discount').toContain('discount=JJTEN');
    }
    await expect(page.locator('a[href*="54330638663791"]'), 'the kit cart link is off this page')
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
    /* The closer buys what the page leads with, which is the bottle now, so
       it carries the 10% code rather than the kit's free-shipping one. */
    await expect(page.locator('a[data-close]')).toHaveText(/Get Hormone Focus/);
    await expect(page.locator('a[data-close]'))
      .toHaveAttribute('href', /41200079175791:1.*discount=JJTEN/);
    /* And its note says the price she is charged, with no free shipping on
       it: $45.00, read off the live checkout. */
    await expect(page.locator('.kitClose .kitNote').first())
      .toContainText('$45.00 · 10% off applied at checkout · 60-day money-back guarantee');

    /* No health answer or result rides in any link out. */
    const out = await page.locator('a[href*="shop.jjsmithonline.com"]').evaluateAll(
      (as) => as.map((a) => a.getAttribute('href') ?? ''),
    );
    /* TWO LINKS OUT, not three: the offer card has one button that follows
       the option she picked, plus the closer. */
    expect(out.length).toBe(2);
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
    await expect(page.locator('.kitLead .kitOpt').first()).toContainText('$45.00');
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
        const band = document.querySelector('.kitBand')!.getBoundingClientRect();
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

  test('the page argues, then asks: rails, proof, reason, dosage, then the price',
    async ({ page }) => {
      /* REVERSED ON PURPOSE, 20 October. This used to assert the opposite:
         the offer directly under the hero and the tips below it, which was
         the right call when the page opened on three free tips and reached
         the price at section six of fourteen. The order now earns the price
         instead of leading with it: what she will do, why it works, who
         already did it, and then what it costs.
         Asserted by document position, as the old one was, so an edit that
         quietly moves the price back up fails here. */
      await page.goto('/quiz/kit');
      const seen = await page.evaluate(() => {
        const want = [
          ['hero', '.kitHero'],
          ['the rails', '.kitStrip'],
          ['review teaser', '.kitTeaser'],
          ['why it works', '.kitMech'],
          ['how to take it', '.kitHow'],
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

  test('the kit is off this page and still sold on the offer pages',
    async ({ page }) => {
      /* REVERSED 22 October. This used to assert the opposite: the one-time
         bottle off the quiz page and the kit leading it. The bottle leads
         now and the kit is the one that came off.

         Removed from the PAGE, not from the product. Both halves have to
         stay true at once or the removal has quietly become a delisting. */
      await page.goto('/quiz/kit');
      await expect(page.locator('a[href*="54330638663791"]'), 'the kit cart link')
        .toHaveCount(0);
      await expect(page.getByText('Total value'), "the kit's value stack")
        .toHaveCount(0);
      await expect(page.locator('a[href*="41200079175791"]').first(), 'the bottle leads')
        .toBeAttached();

      await page.goto('/offer');
      await expect(page.locator('a[href*="54330638663791"]').first(), 'the kit still sells there')
        .toBeAttached();
      /* And there it is still the full-price bottle: the 10% code is passed
         by the quiz page alone, which is what keeps these pages apart. */
      const offerHrefs = await page.locator('a[href*="41200079175791"]').evaluateAll(
        (as) => as.map((a) => (a as HTMLAnchorElement).href),
      );
      for (const h of offerHrefs) {
        expect(h, 'JJTEN leaked onto /offer').not.toContain('JJTEN');
      }
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
      /* TWO NOW, NOT THREE: one button on the offer card, which follows the
         option she picked, plus the closer. The card used to be two separate
         cards with a button each. */
      expect(hrefs.length, 'the offer button and the closer').toBe(2);

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
      expect(await n('.vid'), 'the nine women on camera').toBe(9);
      expect(await n('.pfFb img'), 'the Facebook comment').toBe(1);
      expect(await n('.pfFaces img'), 'the faces').toBe(12);
      expect(await n('[data-proof="lead"] .kitRev'), 'the three named testimonials').toBe(3);
      expect(await n('[data-proof="closing"] .kitRev'), 'the closing testimonial').toBe(1);
      expect(await n('.kitFaq details'), "JJ's six questions").toBe(6);
      expect(await n('.kitPromise'), 'the guarantee').toBe(1);
      expect(await n('.kitTeaser .kitRev'), 'the review teaser').toBe(2);
      expect(await n('.kitHow'), 'the dosage block').toBe(1);
      expect(await n('.kitPlan'), 'the plan section is gone').toBe(0);
      expect(await n('.kitMg > div'), 'the three ingredients').toBe(3);
      expect(await n('a[href*="shop.jjsmithonline.com"]'), 'the buy links').toBe(2);

      const broken = await page.evaluate(() => Array.from(document.querySelectorAll('img'))
        .filter((im) => im.complete && im.naturalWidth === 0).length);
      expect(broken, 'images that failed to load').toBe(0);
    });

  test('JJ is introduced to cold traffic and not to her own list', async ({ page }) => {
    /* A woman who arrived from JJ's own list is being introduced to someone
       she already follows, which reads as a page that has not noticed who it
       is talking to. Same flag the email screen is stepped over on. */
    await page.goto('/quiz/kit');
    await expect(page.locator('.kitTrustLead')).toHaveText(
      'You may not know JJ Smith yet. She is a New York Times bestselling '
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

/* ------------------------------ what she did not say, on both pages -- */

test.describe('the result page says nothing she did not say', () => {
  test('"Nothing yet" is never read back as an attempt', async ({ page }) => {
    /* THE CONDITIONAL THAT MATTERS. "The part most women miss" has three
       second sentences and she gets the one that is true. A woman who ticked
       "Nothing yet" must never be told she has already tried anything, on
       the result or in step two of the plan. */
    await startQuiz(page, '/quiz/symptoms?skip_email=1');
    await page.locator('.tile').nth(0).click();
    await answerAndWait(page, pressPrimary(page), /How old are you/);
    await answerAndWait(page, pickOption(page, 0), /happening with your cycle/);
    await answerAndWait(page, pickOption(page, 0), /When do you notice these changes most/);
    await answerAndWait(page, pickOption(page, 2), /What have you already tried/);
    await page.locator('.opt').nth(6).click();            // Nothing yet
    await answerAndWait(page, pressPrimary(page), /want most right now/);
    await page.locator('.opt').nth(0).click();

    const miss = page.locator('.block').filter({ hasText: 'The part most women miss' });
    await expect(miss).toContainText('No one really tells you what shifted');
    await expect(miss, 'she tried nothing').not.toContainText('already tried');
    await expect(miss, 'and nothing was acknowledged').not.toContainText('doing what you can');

    const result = await page.locator('.rise').innerText();
    expect(result, 'no attempt is claimed anywhere').not.toContain('You have already tried');
    expect(result, 'and nothing is sold here').not.toContain('$');

    /* THE OFFER PAGE NO LONGER READS HER ATTEMPTS BACK AT ALL. The plan
       section that used to acknowledge them went with the kit on 22
       October, so there is nothing there to get wrong: asserted as absent
       rather than as correct. */
    await page.locator('.actionBar .cta').click();
    await expect(page.locator('.kitMech')).toBeVisible();
    await expect(page.locator('.kitPlan'), 'the plan section is gone').toHaveCount(0);
    await expect(page.locator('.rise'), 'no attempt is read back here')
      .not.toContainText('You told us you have already tried');
  });
});
