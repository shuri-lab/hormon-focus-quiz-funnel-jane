import { test, expect } from '@playwright/test';
import { blockKlaviyo, heading, answerAndWait, pickOption, pressPrimary } from './helpers';

/* THE LINK FROM JJ'S OWN LIST, WALKED END TO END.
 *
 * `skip_email=1` had unit tests over the parsing in tests/listLink.test.ts and
 * nothing at all over the flow, which is the half that matters: parsing the
 * parameter correctly and still showing her the email screen is the exact bug
 * this file exists to catch. Everything here is asserted through the quiz as a
 * woman walks it, not against the module.
 *
 * The contract, in one line: IF skip_email=1 THEN the email screen never
 * appears, with or without k_id, before or after a refresh.
 */

/** The result she must land on, which is where submitting the gate also lands. */
const RESULT = 'Your answers may point to perimenopause, the years before your periods stop.';

/** The gate's own heading. It may never be seen in this file. */
const GATE = 'Your Hormone Check is ready.';

/**
 * Arrive the way she does: one navigation, with the query on it.
 *
 * NOT the shared startQuiz helper, which clears session storage between two
 * navigations. That is right for a cold walk and wrong here, because clearing
 * storage is precisely what must not happen between the parameter being read
 * and the gate reading it back.
 */
async function arrive(page: import('@playwright/test').Page, url: string) {
  await blockKlaviyo(page);
  await page.goto('/quiz');
  await page.evaluate(() => { sessionStorage.clear(); localStorage.clear(); });
  await page.goto(url);
  await expect(heading(page)).toContainText('What has been bothering you lately');
}

const stored = (page: import('@playwright/test').Page) =>
  page.evaluate(() => JSON.parse(sessionStorage.getItem('hf_list_link') || 'null'));

/** q1 through q7, the same answers the main walk uses, stopping after q7. */
async function answerAllSeven(page: import('@playwright/test').Page) {
  await page.locator('.tile').nth(0).click();
  await page.locator('.tile').nth(1).click();
  await page.locator('.tile').nth(2).click();
  await answerAndWait(page, pressPrimary(page), /Which one bothers you the most/);
  await answerAndWait(page, pickOption(page, 1), /How old are you/);
  await answerAndWait(page, pickOption(page, 2), /happening with your cycle/);
  await answerAndWait(page, pickOption(page, 1), /When do you notice these changes most/);
  await answerAndWait(page, pickOption(page, 2), /What have you already tried/);
  await page.locator('.opt').nth(0).click();
  await page.locator('.opt').nth(1).click();
  await answerAndWait(page, pressPrimary(page), /want most right now/);
  await page.locator('.opt').nth(1).click();
}

test.describe('skip_email', () => {
  test('?skip_email=1 alone: the email screen never appears', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));

    await arrive(page, '/quiz?skip_email=1');

    /* 1. Detected on the first load, and 2. written to storage. It is read in
       main.tsx before render, so by the time q1 is on screen it is already
       there - this assertion failing means the parameter was read too late. */
    expect(await stored(page), 'read on arrival').toEqual({ skipEmail: true, profileId: null });

    /* 2b. And gone from the address bar, so it cannot reach GA4 as
       page_location, Clarity as the recorded URL, or any Referer. */
    expect(new URL(page.url()).searchParams.has('skip_email'), 'stripped from the URL').toBe(false);

    await answerAllSeven(page);

    /* 3 and 4. The loader hands off straight to the result - the same screen
       a successful submission reaches - and never to the gate. */
    await expect(heading(page)).toHaveText(RESULT, { timeout: 15_000 });
    expect(new URL(page.url()).pathname).toBe('/quiz/result');

    /* 5. Nothing to validate, because there is nothing to fill in: no name
       field, no address field, no consent box, no disabled button. */
    await expect(page.locator('#ef')).toHaveCount(0);
    await expect(page.locator('#nf')).toHaveCount(0);
    await expect(page.locator('#cf')).toHaveCount(0);
    await expect(page.getByText(GATE)).toHaveCount(0);

    /* Her name came from the gate, so the result must not greet a blank. */
    await expect(page.locator('.resKicker')).toHaveText('Your Hormone Check result');

    /* 6. Nothing downstream cleared it. */
    expect(await stored(page), 'still set at the result').toEqual({ skipEmail: true, profileId: null });
    expect(errors, 'console errors').toEqual([]);
  });

  test('with k_id: the same skip, and the id kept out of the URL', async ({ page }) => {
    await arrive(page, '/quiz?skip_email=1&k_id=01GDDKASAP8TKDDA2GRZDSVP4H');

    /* 8. The id is held internally and is in neither the path nor the query. */
    expect(await stored(page)).toEqual({
      skipEmail: true, profileId: '01GDDKASAP8TKDDA2GRZDSVP4H',
    });
    expect(page.url(), 'a profile id may never sit in the URL').not.toContain('01GDDKA');

    await answerAllSeven(page);
    await expect(heading(page)).toHaveText(RESULT, { timeout: 15_000 });
    await expect(page.getByText(GATE)).toHaveCount(0);
    expect(await stored(page)).toEqual({
      skipEmail: true, profileId: '01GDDKASAP8TKDDA2GRZDSVP4H',
    });
  });

  test('the six-character list id David first sent is kept too, being well formed', async ({ page }) => {
    /* k_id=TfxMKk was in the original brief, where it was really the LIST id.
       The validator takes it on shape and cannot know better, so the quiz
       must still skip: a wrong id is not a reason to show her a wall. */
    await arrive(page, '/quiz?skip_email=1&k_id=TfxMKk');
    expect(await stored(page)).toEqual({ skipEmail: true, profileId: 'TfxMKk' });

    await answerAllSeven(page);
    await expect(heading(page)).toHaveText(RESULT, { timeout: 15_000 });
    await expect(page.getByText(GATE)).toHaveCount(0);
  });

  test('7. a refresh in the middle does not put the email screen back', async ({ page }) => {
    await arrive(page, '/quiz?skip_email=1');

    await page.locator('.tile').nth(0).click();
    await page.locator('.tile').nth(1).click();
    await page.locator('.tile').nth(2).click();
    await answerAndWait(page, pressPrimary(page), /Which one bothers you the most/);
    await answerAndWait(page, pickOption(page, 1), /How old are you/);
    await answerAndWait(page, pickOption(page, 2), /happening with your cycle/);

    /* Reload with no query at all: the parameter is long gone from the URL by
       now, so only storage can carry it. */
    const mid = page.url();
    expect(new URL(mid).searchParams.has('skip_email')).toBe(false);
    await page.reload();
    await expect(heading(page)).toContainText('happening with your cycle');
    expect(await stored(page), 'survived the reload').toEqual({ skipEmail: true, profileId: null });

    await answerAndWait(page, pickOption(page, 1), /When do you notice these changes most/);
    await answerAndWait(page, pickOption(page, 2), /What have you already tried/);
    await page.locator('.opt').nth(0).click();
    await page.locator('.opt').nth(1).click();
    await answerAndWait(page, pressPrimary(page), /want most right now/);
    await page.locator('.opt').nth(1).click();

    await expect(heading(page)).toHaveText(RESULT, { timeout: 15_000 });
    await expect(page.getByText(GATE)).toHaveCount(0);
  });

  test('entering at the cover, which is the link that actually goes in an email', async ({ page }) => {
    /* THE REPORTED URL. David tested https://<host>/?skip_email=1 - the cover,
       not /quiz - because that is what an email links to. She is two
       navigations away from the gate by the time it matters, and the
       parameter is stripped from the URL on the first of them, so only
       storage carries it to the quiz. */
    await blockKlaviyo(page);
    await page.goto('/');
    await page.evaluate(() => { sessionStorage.clear(); localStorage.clear(); });
    await page.goto('/?skip_email=1');
    await expect(page.locator('a.cta').first()).toContainText('Get my hormone check');

    expect(await stored(page), 'read on the cover').toEqual({ skipEmail: true, profileId: null });
    expect(new URL(page.url()).searchParams.has('skip_email'), 'stripped on the cover').toBe(false);

    await page.locator('a.cta').first().click();
    await expect(heading(page)).toContainText('What has been bothering you lately');

    await answerAllSeven(page);
    await expect(heading(page)).toHaveText(RESULT, { timeout: 15_000 });
    await expect(page.locator('#ef')).toHaveCount(0);
    await expect(page.getByText(GATE)).toHaveCount(0);
  });

  test('the gate still stands for everyone else', async ({ page }) => {
    /* The guard has to be a skip, not a removal. Without the parameter the
       email screen is exactly where it was, consent box and all. */
    await arrive(page, '/quiz');
    expect(await stored(page), 'nothing stored without the parameter').toBe(null);

    await answerAllSeven(page);
    await expect(heading(page)).toHaveText(GATE, { timeout: 15_000 });
    await expect(page.locator('#ef')).toBeVisible();
    await expect(page.locator('.actionBar .cta')).toBeDisabled();
  });

  test('typing the gate address with skip_email set does not show it either', async ({ page }) => {
    /* The flow is the URL, so the gate has an address a woman can reach by
       the back button, a shared link or a reload. Whatever brought her, the
       answer to "is the email screen allowed on screen" must be the same. */
    await arrive(page, '/quiz?skip_email=1');
    await page.goto('/quiz/your-result');
    await expect(page.locator('#ef')).toHaveCount(0);
    await expect(page.getByText(GATE)).toHaveCount(0);
  });
});
