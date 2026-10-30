import { test, expect } from '@playwright/test';
import {
  expectNoHorizontalOverflow, expectTapTargets, startQuiz, heading,
  answerAndWait, pickOption, pressPrimary, throughNurture,
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
    await expect(page.locator('.resKicker')).toHaveText('Renee, here is your result');
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
    /* WHAT THIS MEANS, REBUILT LIGHTER 29 October 2026. It was Jane's whole
       block for her outcome, then the symptom line, then the pattern line,
       then a fixed heading and paragraph for that symptom, then the
       softening: about four hundred words, because this was the last screen
       before the price. Three screens explain the cause now, so the card is
       her stage in one line and her own symptom in the next.

       STILL KEYED TO HER. She is perimenopause with sleep as her main
       concern, and both lines say so. */
    await expect(page.locator('.resReassure'))
      .toHaveText('A normal stage, and there is a lot you can do.');
    await expect(page.locator('.resMeansLead'))
      .toHaveText('Your hormones are not as steady as they used to be.');
    await expect(page.locator('.resMeansSym'))
      .toContainText("That's why your sleep changed, even though your bedtime didn't.");
    /* Three symptoms, so the clause that ties them together is shown. */
    await expect(page.locator('.resMeansSym')).toContainText('It is one thing, not several.');

    /* AND WHAT NO LONGER RENDERS HERE. Each of these is still exported and
       still read by the copy gate; what changed is that this page stopped
       being the one that explains. */
    for (const gone of [
      'Menopause is when your periods stop for good.',
      'Most weeks is often enough to spot a pattern',
      'This is a normal stage, not an illness.',
      'Why your sleep has changed',
      'In this stage, sleep gets easier to break.',
    ]) {
      await expect(page.getByText(gone, { exact: false }), `"${gone}" is still on r1`)
        .toHaveCount(0);
    }
    /* The doctor line belongs to early menopause only, and she is B. */
    await expect(page.getByText('take to your doctor soon', { exact: false })).toHaveCount(0);
    await expect(page.getByText('To sleep through the night.')).toBeVisible();
    await expectNoHorizontalOverflow(page, 'r1 result');

    /* HER STAGE'S FACT, with the number pulled large and SAID. The card
       showed "You are not the only one" over a large "four years" until
       30 October, which counts no women and did not parse; the kicker and
       the caption are both the fact's own now, so each outcome reads
       correctly. The full sentence gives way to the caption where there is
       a number to pull, which is what the brief asked for. */
    await expect(page.locator('.resStat .blabel')).toHaveText('What to expect');
    await expect(page.locator('.resStatBig')).toHaveText('four years');
    await expect(page.locator('.resStatBigLabel'))
      .toHaveText('is how long perimenopause usually lasts');
    await expect(page.locator('.resStat')).toContainText('Source: Cleveland Clinic');
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
    const miss = page.locator('.resHook');
    await expect(miss).toHaveCount(1);
    await expect(miss).toContainText('The part most women miss');
    await expect(miss).toContainText('What changed is on the inside');
    /* missLine() is no longer rendered: it was a second line making a claim
       about what she had already tried, and the hook reads shorter without
       it. It points at the next screen instead. */
    await expect(miss).toContainText('That is exactly what I want to show you next.');
    await expect(miss, 'missLine is no longer rendered')
      .not.toContainText('already tried eating better');

    /* And the hand-off, which is the last thing she reads before the button. */
    await expect(page.locator('.resHandoff'))
      .toHaveText('Now let me show you what is actually going on, and the simple '
        + 'plan to feel like you again.');

    await expect(page.locator('.actionBar .cta')).toContainText('SHOW ME WHAT IS GOING ON');
    await page.locator('.actionBar .cta').click();

    /* THE THREE SCREENS THAT NOW EARN THE OFFER, 29 October: what is behind
       her result, what to do about it, and the product as step one. */
    await throughNurture(page);

    /* RESULT PAGE 2. REBUILT 16 OCTOBER 2026 for conversion. It opened on
       three free tips and reached the price at section six of fourteen; it
       now opens on the outcome she came for, with proof and a button, and
       the offer sits directly under the hero.

       The headline is hers: she said sleep bothers her most, and the eyebrow
       carries the stage from the result page she has just read. */
    /* THE HEADLINE SELLS THE PACKAGE, 29 October, where it used to be her
       own symptom read back ("Sleep through the night again."). She is
       still read back twice on this page: the eyebrow below is her stage,
       and "why it works" opens on the symptom she named. */
    /* THREE ELEMENTS, 29 October: the kit's name folded into the headline,
       where it had a plum line of its own between the eyebrow and the H1. */
    await expect(heading(page)).toHaveText('Not just a bottle. The Feel Like YOU Again Kit.');
    await expect(page.locator('.kitHeroSub'))
      .toHaveText('The supplement, the recipes, the plan, and a tracker. '
        + 'Everything you need to start.');
    await expect(page.locator('.kitHeroEyebrow')).toHaveText('Your result · Perimenopause');
    await expect(page.locator('.kitHeroLabel'), 'the kit-name line is folded into the H1')
      .toHaveCount(0);

    /* THE PRICE IS A BLOCK, not a sentence. It read "$146.99 value — today
       $45.00", which was vague and carried an em dash the house style has
       since ruled out. The saving is asserted because it is the one number
       on the page that is arithmetic rather than a constant. */
    const price = page.locator('.kitHero .kitPrice');
    await expect(price).toContainText('Total value');
    await expect(price.locator('s')).toHaveText('$146.99');
    await expect(price.locator('.kitPriceNow b')).toHaveText('$45.00');
    await expect(price.locator('.kitPriceSave')).toHaveText('You save $101.99');

    /* THE FIRST SCREEN CARRIES THE OFFER, which is the entire point of the
       rebuild: a button, the risk taken off it, and two forms of proof. */
    await expect(page.locator('.kitHeroCta')).toHaveText(/Get my Kit/);
    /* NO FREE-SHIPPING PROMISE, anywhere above the fold. It said so while the
       kit led this page and its link carried HF60FREESHIP; the bottle's link
       carries the 10% code instead and Shopify takes one of them. */
    /* THE 10% CAME OFF THIS LINE. It is still applied, and the card below
       still says so; what the hero promises now is the guarantee and the
       dispatch, which is what the brief asked the risk line to carry. */
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

    /* THE PLAN SECTION IS BACK, 29 October, because the page sells the
       guide, the recipes and the tracker again. It is three steps, and the
       first of them is the dose that .kitHow used to carry on its own.

       WHAT IS STILL NOT HERE is the homework: her two symptom cards and the
       old second step that told her to fix her own sleep and meals. On a
       page selling a supplement that read as the product conceding it is
       not the thing that helps. Step two points at the guide she is being
       sold, which is a different sentence. */
    await expect(page.locator('.kitPlan'), 'the plan section').toHaveCount(1);
    await expect(page.locator('.kitSteps li'), 'its three steps').toHaveCount(3);
    await expect(page.locator('.priCard'), 'her symptom cards').toHaveCount(0);

    const pageText = await page.locator('.rise').innerText();
    for (const gone of ['Why 60 days', 'the supplement in the kit', 'One simple plan']) {
      expect(pageText, `"${gone}" still on the page`).not.toContain(gone);
    }
    /* And the kit's own name IS here now, which is the reversal in one line. */
    /* RENAMED 30 October: the 60-Day wording came off the kit's name. What
       keeps its sixty days is the guarantee, which is a refund window, and
       The 60-Day Hormone Fix, which is the ebook's own title. */
    expect(pageText).toContain('The Feel Like YOU Again Kit');
    expect(pageText, 'the old name is gone').not.toContain('60-Day Feel Like YOU Again');

    /* Her symptom still keys the page, in the two places that are left. */
    await expect(page.locator('.kitMech .kitBody').first())
      .toContainText('You told us your sleep breaks at night.');
    await expect(page.locator('.kitMech .kitBody').first())
      .toContainText('In perimenopause your hormones get less steady');
    await expect(page.locator('.kitPlan')).toContainText('Take two capsules a day, with a meal.');


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
       putting the personalised set back is one line in reviews.ts.

       AND IT IS NO LONGER IN THE HERO. The brief gave that space to the
       price line on 29 October, so all four of the named women sit together
       in the wall rather than one above the fold and three a screen away. */
    await expect(page.locator('[data-proof="pre"] .kitRev'), 'the hero carries the rating alone')
      .toHaveCount(0);
    await expect(page.locator('[data-proof="lead"] .kitRev').first())
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

    /* TWO BOXES, EACH WITH ITS OWN BUTTON, since 30 October 2026. This was a
       radio group with one shared button, which David said did not read as an
       offer; Jane's own page puts each way to buy in a box she can say yes
       to, and this follows it. There is no selection to toggle any more, so
       what used to be asserted as "the label and the link follow the pick" is
       now asserted as "each box buys its own thing".

       THE DEAL SHE IS BEING OFFERED. */
    const deal = lead.locator('.kitDeal');
    await expect(deal.locator('.kitDealNum')).toHaveText('$45.00');
    await expect(deal.locator('.kitDealBadge')).toContainText('$49.99');
    await expect(deal).toContainText('$1.50 a day');
    await expect(deal).toContainText('10% off applied at checkout');
    await expect(deal.locator('a.kitBtn')).toContainText('Get my Kit');
    await expect(deal.locator('a.kitBtn'))
      .toHaveAttribute('href', /cart\/41200079175791:1.*discount=JJTEN/);

    /* AND THE ALTERNATIVE, which carries its own 20% in Shopify and must
       never also carry JJTEN: Shopify takes one discount parameter. */
    const deal2 = lead.locator('.kitDeal2');
    await expect(deal2.locator('.kitDeal2Num')).toHaveText('$39.99');
    await expect(deal2.locator('.kitDeal2Now s')).toHaveText('$49.99');
    await expect(deal2).toContainText(/best value/i);
    await expect(deal2).toContainText(/20% off/i);
    await expect(deal2).toContainText(/pause or cancel anytime/i);
    /* THE SHIPPING PILL IS BACK, 30 October: free shipping is this option's
       one advantage over the bottle and it was reading as small print. */
    await expect(deal2.locator('.kitShip')).toContainText(/free shipping/i);
    /* AND BOTH BUTTONS LOOK THE SAME. The subscription's was outlined, which
       read as the lesser of the two rather than as the other one. */
    await expect(deal2.locator('a.kitBtn'), 'no ghost button')
      .not.toHaveClass(/ghost/);
    const subHref = await deal2.locator('a.kitBtn').getAttribute('href');
    expect(subHref).toMatch(/cart\/add\?id=54355951845487.*selling_plan=5529010287/);
    expect(subHref, 'JJTEN must not ride the subscription').not.toContain('JJTEN');

    /* FREE SHIPPING IS THE SUBSCRIPTION'S AND NOT THE BOTTLE'S. The one-time
       link spends Shopify's single discount parameter on the 10% code, so it
       cannot also carry HF60FREESHIP, and the page must not say otherwise. */
    await expect(deal, 'the one-time bottle does not get free shipping')
      .not.toContainText(/free shipping/i);
    await expect(deal2, 'the subscription does').toContainText(/free shipping/i);

    /* THE VALUE STACK, REBUILT 30 October in the shape of Jane's own: the
       inclusions ticked, the three bonuses as cards carrying their artwork,
       and a struck total. The red diagonal on every value is the point of
       the block, so the markers are asserted rather than the styling. */
    const vs = lead.locator('.kitVs');
    await expect(vs.locator('.kitVsList li'), 'the bottle and the guarantee').toHaveCount(2);
    await expect(vs.locator('.kitVsBonus'), 'the three bonuses').toHaveCount(3);
    await expect(vs.locator('.kitVsBonus img'), 'each bonus shows what it is').toHaveCount(3);
    await expect(vs.locator('.kitVsTotalV')).toHaveText('$146.99');
    /* Every price in the stack is struck: it is what she is NOT paying. */
    await expect(vs.locator('.kitVsVal.struck, .kitVsTotalV.struck')).toHaveCount(5);

    /* The old radio group is gone, and so is the second card before it. */
    await expect(page.locator('.kitQuiet'), 'the second card').toHaveCount(0);
    await expect(lead.locator('.buyRow'), 'the radio rows are gone').toHaveCount(0);

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
    /* Four from JJ's page, and all four are in the wall together now: the
       first used to stand alone above the offer, where the price line is. */
    await expect(page.locator('[data-proof="lead"] .kitRev')).toHaveCount(4);
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
    await expect(page.locator('a[data-close]')).toHaveText(/Get my Kit/);
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
    /* THREE LINKS OUT since 30 October: each of the card's two deal boxes
       has its own button, plus the closer. */
    expect(out.length).toBe(3);
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
    /* THE C CARD, in its short form since 29 October. MEANS.C and STAGE_LINE
       are no longer rendered on this page; this is the one line that
       replaced them, and E reads the same one. */
    await expect(page.locator('.resMeansLead'))
      .toHaveText('After your periods stopped, your body runs on less estrogen.');
    await expect(page.locator('.resStatBig'), "menopause's own number").toHaveText('52');
    await expect(page.locator('.resKicker')).toHaveText('Here is your result');
    await expect(page.locator('.resFacts')).toContainText('Stopped 12 months or more');
    await expect(page.locator('.resPics figure')).toHaveCount(1);
    await expect(page.locator('.resPics figure')).not.toContainText('Bothers you most');
    /* ONE SYMPTOM, so the clause that ties several together stays off. */
    await expect(page.locator('.resMeansSym'), 'she named one thing')
      .not.toContainText('not several');
    /* Her wish is softened on the way back, so it cannot read as a promise. */
    await expect(page.getByText('To feel cooler and more comfortable.')).toBeVisible();
    await page.locator('.actionBar .cta').click();
    await throughNurture(page);

    /* She ticked hot flashes and nothing else, so the hero names the one
       she came for. 'Start with these 3 for hot flashes' until 16 October. */
    /* The kit's headline, as on every other entry to this page since
       29 October. It was her own symptom until then. */
    await expect(heading(page)).toHaveText('Not just a bottle. The Feel Like YOU Again Kit.');
    await expect(page.getByText('You told us you have already tried')).toHaveCount(0);
    await expect(page.locator('.kitLead .kitDealNum')).toHaveText('$45.00');
    /* Same four whatever she answered — see the note on the lead review above. */
    await expect(page.locator('[data-proof="lead"] .kitRev').first())
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
    /* The three that earn the offer, 29 October 2026. */
    ['whats-happening', 'The real problem is too much estrogen.'],
    ['your-plan', 'Three simple things. That is the whole plan.'],
    ['meet-hormone-focus', 'Meet Hormone Focus.'],
    /* The hero headline, with no answers behind it. It was
       'Start with these 3' until the 16 October rebuild and her own symptom
       until the kit took the hero on 29 October. */
    ['kit', 'Not just a bottle. The Feel Like YOU Again Kit.'],
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
    await page.goto('/quiz/kit');
    const pos = await page.locator('.appHeader')
      .evaluate((el) => getComputedStyle(el).position);
    expect(pos, 'the header is fixed on a page that already has a sticky bar').toBe('static');
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
          ['why it works', '.kitMech'],
          ['the plan', '.kitPlan'],
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

  test('the page sells the kit and still checks out as the bottle',
    async ({ page }) => {
      /* THE GAP THIS PAGE SHIPS WITH, 29 October, and it is deliberate.
         The page is the 60-Day Kit: the name, the three bonuses, a $146.99
         value stack. The kit has no Shopify variant yet, so every button
         still buys the single bottle, 41200079175791.

         ASSERTED RATHER THAN ONLY WRITTEN DOWN, because the day the kit
         does get a variant this test is the thing that says which links
         have to change, and until then it is the thing that stops someone
         "fixing" the page by pointing it at the two-bottle kit variant,
         which is a different offer at a different price.

         THE BONUSES ARE A FULFILMENT PROMISE THE CART DOES NOT KEEP. That
         is a question for the store, not for this file; what this file can
         do is make sure nobody thinks it is already solved. */
      await page.goto('/quiz/kit');
      /* SCOPED, because the price block is deliberately in two places since
         29 October: once under the hero and once in the card. */
      await expect(page.locator('#kit-offer').getByText('Total value'), "the kit's value stack")
        .toBeVisible();
      await expect(page.locator('.kitHero').getByText('Total value'), 'and under the hero')
        .toBeVisible();
      await expect(page.locator('#kit-offer').getByText('The 60-Day Hormone Fix'), 'the first bonus')
        .toBeVisible();
      await expect(page.locator('a[href*="54330638663791"]'), 'the two-bottle kit variant')
        .toHaveCount(0);
      await expect(page.locator('a[href*="41200079175791"]').first(), 'the bottle is the cart')
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
      /* The stack is the kit's own block since 30 October, not the shared
         ValueStack: two ticked inclusions and three bonus cards. */
      expect(await n('#kit-offer .kitVsList li'), 'the ticked inclusions').toBe(2);
      expect(await n('#kit-offer .kitVsBonus'), 'the bonus cards').toBe(3);
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

    /* THE HOOK NO LONGER CLAIMS ANYTHING ABOUT WHAT SHE TRIED. missLine()
       had three second sentences and she got the one that was true, which is
       what this test was built to police. The line came out on 29 October
       when the hook was trimmed to point at the next screen, so the
       conditional cannot be got wrong any more: there is no second sentence.
       Asserted as absent rather than deleted, because a line reappearing
       here is exactly the regression worth catching. */
    const miss = page.locator('.resHook');
    await expect(miss).toContainText('The part most women miss');
    await expect(miss, 'she tried nothing').not.toContainText('already tried');
    await expect(miss, 'and nothing was acknowledged').not.toContainText('doing what you can');
    await expect(miss, 'no attempt is read back at all')
      .not.toContainText('No one really tells you what shifted');

    const result = await page.locator('.rise').innerText();
    expect(result, 'no attempt is claimed anywhere').not.toContain('You have already tried');
    expect(result, 'and nothing is sold here').not.toContain('$');

    /* THE OFFER PAGE NO LONGER READS HER ATTEMPTS BACK AT ALL. The plan
       section that used to acknowledge them went with the kit on 22
       October, so there is nothing there to get wrong: asserted as absent
       rather than as correct. */
    await page.locator('.actionBar .cta').click();
    await throughNurture(page);
    await expect(page.locator('.kitMech')).toBeVisible();
    /* The plan section is back, and it is the one place it could go wrong:
       none of its three steps may read an attempt back to her. */
    await expect(page.locator('.kitPlan'), 'the plan section').toHaveCount(1);
    await expect(page.locator('.rise'), 'no attempt is read back here')
      .not.toContainText('You told us you have already tried');
  });
});

/* --------------------------------- the three screens before the price -- */

test.describe('the pre-offer screens', () => {
  test('the bar fills across all five, and back walks them in reverse',
    async ({ page }) => {
      /* THE PROGRESS BAR IS THE PROMISE THE QUIZ MADE HER. Three screens were
         inserted between her result and the price on 29 October; if they were
         not REVEAL steps the bar would stop filling at the result and she
         would be looking at three screens that the page had stopped counting.

         The back button matters as much: these are the three places a woman
         who is not ready can go back from, and the flow has to walk them in
         reverse without falling through to the questions. */
      await page.goto('/quiz/result');

      /* toHaveCount, NOT count(). A bare count() returns whatever is in the
         DOM at that instant and does not wait, so on a loaded machine this
         read zero segments before React had rendered and failed at 320px
         while passing at 390px. Every count here retries. */
      const filled = () => page.locator('.segbar i.on');
      await expect(page.locator('.segbar i'), 'five segments: result, three, offer')
        .toHaveCount(5);
      await expect(filled(), 'the result is the first').toHaveCount(1);

      for (const [i, slug] of ['whats-happening', 'your-plan', 'meet-hormone-focus', 'kit'].entries()) {
        await page.locator('.actionBar .cta, .kitHeroCta').first().click();
        await expect(page).toHaveURL(new RegExp(`/quiz/${slug}$`));
        if (slug !== 'kit') {
          await expect(filled(), `${slug} fills ${i + 2} of 5`).toHaveCount(i + 2);
        }
      }

      /* And back, one screen at a time, in the order she came. */
      for (const slug of ['meet-hormone-focus', 'your-plan', 'whats-happening', 'result']) {
        await page.goBack();
        await expect(page, `back reaches ${slug}`).toHaveURL(new RegExp(`/quiz/${slug}$`));
      }
    });

  test('every picture loads, and none of them carries the words', async ({ page }) => {
    /* The five graphics are text free on purpose and the page supplies every
       caption, step label and ingredient name. So each needs real alt text,
       and a missing file would otherwise be an empty box beside copy that
       reads as though something should be there. */
    for (const slug of ['whats-happening', 'your-plan', 'meet-hormone-focus']) {
      await page.goto(`/quiz/${slug}`);
      await page.waitForTimeout(600);
      const imgs = await page.locator('.screen img, main img').evaluateAll(
        (els) => els.map((e) => ({
          src: (e as HTMLImageElement).currentSrc.split('/').pop() ?? '?',
          loaded: (e as HTMLImageElement).naturalWidth > 0,
          alt: (e as HTMLImageElement).alt,
        })),
      );
      for (const im of imgs) {
        expect(im.loaded, `${slug}: ${im.src} did not load`).toBe(true);
        expect(im.alt.length, `${slug}: ${im.src} has no alt text`).toBeGreaterThan(3);
      }
      await expectNoHorizontalOverflow(page, `/quiz/${slug}`);
    }
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
