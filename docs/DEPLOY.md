# Deploying

## Where it is published

The public quiz is published from **Lovable**: https://focus-quiz-funnel.lovable.app

Lovable reads this repository's `main` branch. Pushing to `main` updates the
Lovable project, but **the public site only changes when someone signed in to
Lovable opens the project and presses Publish, then Update.**

After publishing, check the live cover reads "Take a 1-minute check".

## Build

```bash
npm ci
npm run build      # typecheck, then build to dist/
```

`dist/` is static. There is no server to run.

## Every route is served by index.html

| Route | What it is |
|---|---|
| `/` | the cover |
| `/bloating` `/hot-flashes` `/night-sweats` `/sleep` `/weight` `/mood` `/body-at-40` | the cover for one ad angle, with that symptom pre-selected |
| `/quiz`, `/<angle>/quiz` | the quiz |
| `/offer`, `/offer/<angle>`, `/live` | the standalone offer pages |
| `/plan/<archetype>` | the Starter Guide page |

A host that does not send unknown paths to `index.html` returns 404 for every
ad destination except `/`. Lovable handles this. For other hosts the config is
committed for Netlify (`public/_redirects`) and Vercel (`vercel.json`).

## Before ads run

1. ~~**Klaviyo list id.**~~ Done on 8 October: `KLAVIYO_LIST_ID` is `TfxMKk`,
   checked against the live API, which accepted it with a 202 (an id that does
   not exist comes back `400 List not found`, so this is a real answer and not
   an assumption).

   Setting it uncovered a second fault in the same call, fixed in the same
   commit: the payload carried a `subscriptions` consent object copied from
   Klaviyo's *server-side* bulk job, and this endpoint rejects that field with
   `400 'subscriptions' is not a valid field for the resource 'profile'`
   before it ever reads the list. So the id alone would have fixed nothing.

   **Addresses collected before 8 October are on profiles that were never
   added to any list.** They are in Klaviyo and the completion event fired, so
   they can be found by that event and back-filled, but no list-triggered flow
   ever reached them.

   One junk profile, `hf-quiz-list-check@example.invalid`, was created on the
   list by that check. The domain is reserved and can never receive mail.
   Delete it when convenient - it needs the private API key or the UI, neither
   of which this repo has.
2. **Meta pixel.** Add it as a tag inside the Google Tag Manager container
   (`GTM-WT4MWLTH`, already in `index.html`), not as a script in this repo.
   `src/lib/analytics.ts` already fires the events.
3. **One tagged test order** from the kit button, read in Shopify.
4. **Check the post-quiz flow** sends to a new completer.

## The link for JJ's own email list

A woman on JJ's list has already given her address, so asking for it again is
a wall with no purpose - and a second address makes a second profile. The
email step steps aside for these two parameters:

```
https://<host>/?skip_email=1
https://<host>/?skip_email=1&k_id=<her Klaviyo profile id>
```

`skip_email=1` is the whole feature and needs nothing else, so **the link
above can go in an email today.** `k_id` is optional: it names the profile the
completion event should attach to, so her answers land on the profile she
already has instead of an anonymous one.

Two things to get right in the email builder:

- **The merge tag is the account owner's to confirm.** It must resolve to the
  26-character profile id (a ULID, like `01GDDKASAP8TKDDA2GRZDSVP4H`), not to
  a list or segment id. A six-character value such as `TfxMKk` is a *list* id
  in the profile slot and is wrong - the quiz validator accepts it on shape,
  so it fails quietly. Send yourself a test and read the rendered link.
- **Keep the UTMs Klaviyo adds.** Both parameters above are independent of
  attribution; `src/lib/listLink.ts` removes only these two from the address
  bar and leaves every `utm_*` and `hf_*` exactly where it was.

Neither parameter stays in the URL. A profile id identifies a person, and left
in the query it would reach GA4 as `page_location`, Clarity as the recorded
URL, Meta as the event source, and the `Referer` of every third-party request
the page makes - including Shopify. Both are read once and stripped with
`history.replaceState` before the first render.

## Checking a build before it ships

```bash
npm test
npm run lint
npm run build
npx playwright test --project=phone-390
npx playwright test --project=desktop-1440
```

`npm run e2e` uses the Chrome installed on the machine. On a box without one,
run `npx playwright install chromium` and set `PLAYWRIGHT_CHROMIUM_FALLBACK=1`.

## The offer lives in one file

Prices, variant ids, the discount code and the subscription live in
`src/lib/offer.ts`. `shopUrl()` in `src/lib/analytics.ts` builds every cart
link from them and passes on the UTMs she arrived with. The kit link is variant
54330638663791 with `discount=HF60FREESHIP`, the same link JJ's offer page uses.
