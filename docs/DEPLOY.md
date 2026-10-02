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

1. **Klaviyo list id.** Set `KLAVIYO_LIST_ID` in `src/lib/leads.ts` to the list
   the quiz should feed, and update the matching test in `tests/leads.test.ts`.
   Until then the flow can skip women as "not subscribed".
2. **Meta pixel.** Add it as a tag inside the Google Tag Manager container
   (`GTM-WT4MWLTH`, already in `index.html`), not as a script in this repo.
   `src/lib/analytics.ts` already fires the events.
3. **One tagged test order** from the kit button, read in Shopify.
4. **Check the post-quiz flow** sends to a new completer.

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
