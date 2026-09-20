# Deploying

## The one rule about the host

Serve this from the **same origin as the rest of `hormonefocus.jjsmithonline.com`**.

The Meta pixel, the `_fbc` cookie and Meta's domain verification already work on
that host. Every route added there inherits all three for nothing. Put the funnel
on a different domain and you are re-verifying a domain, re-warming a pixel, and
losing click attribution on traffic you have already paid for.

## Build

```bash
npm ci
npm run build      # -> dist/
```

`dist/` is static. There is no server to run.

## The SPA fallback is not optional

Every route below is served by `index.html`. A host that does not rewrite
unknown paths will return 404 for every ad destination except `/`.

| Route | What it is |
|---|---|
| `/` | default landing page |
| `/bloating` `/weight` `/hot-flashes` `/sleep` `/mood` `/energy` | one landing page per ad angle |
| `/quiz` | the quiz, no angle |
| `/<angle>/quiz` | the quiz, with that angle's symptom pre-selected |
| `/offer` | the offer page, master angle |
| `/offer/<angle>` | the offer page with the hero swapped for that ad angle |
| `/live` | the offer page with the Live strip at the top |
| `/plan/<archetype>` | her Starter Guide, personalised from the quiz link |

Configuration is committed for two hosts and written out for the rest:

- **Netlify** — `public/_redirects`
- **Vercel** — `vercel.json`
- **nginx** — `location / { try_files $uri $uri/ /index.html; }`
- **Apache** — a `.htaccess` with `FallbackResource /index.html`
- **S3 + CloudFront** — set the error document to `index.html` and map 403/404 to `/index.html` with a 200

## Before a single ad runs

1. **Set `VITE_LEAD_ENDPOINT`.** Unset, the email gate collects an address and
   drops it. See `.env.example` and `src/lib/leads.ts`.
2. **Add the Meta pixel and GA4 tags** to `index.html`, where the comment block
   marks the spot. `src/lib/analytics.ts` already fires the events and no-ops
   until a tag is present.
3. **Settle the three open commercial items.** They are listed in
   `src/lib/offer.ts` and rendered on the offer screen with `?debug=1`.
4. **Create the two Shopify discounts the Protocol runs on.** The buy button
   sells two bottles at $84.99 with free shipping, and neither half of that
   exists in the store until somebody makes it:
   - a discount code `PROTOCOL`, $14.99 off, minimum quantity 2 of Hormone
     Focus, no expiry, set to combine with shipping discounts;
   - an automatic free-shipping discount for any cart holding two or more
     Hormone Focus.

   Until the code exists, the Protocol button opens a cart with two bottles at
   full price. The moment a dedicated two-bottle variant exists instead, set
   `PROTOCOL_VARIANT_ID` in `src/lib/offer.ts` and the link switches to it on
   the next deploy; the code then becomes the backup.

## Checking a build before it ships

```bash
npm test            # 15 tests, 560 routing combinations
npm run e2e         # 65 tests across 320px, 390px, 430px, 768px and 1440px
npm run build
npm run preview
```

`npm run e2e` uses the Chrome already installed on the machine. On a CI box
without one, run `npx playwright install chromium` and remove the `channel`
lines from `playwright.config.ts`.

## Three switches, and what turns them off

`src/lib/offer.ts` carries three lines that are true today and may not be true
next month. Each is a flag, and each renders one line or nothing:

| Flag | Renders | Turn it off when |
|---|---|---|
| `SHOW_DAILY_PRICE` | `$1.42 a day` under the price | never, unless Jane says so |
| `SHOW_BATCH_LINE` + `BATCH_ON_SHELF` + `NEXT_BATCH` | the stock line near the button | the count stops being true |
| `LIVE_DEADLINE` | `Through <deadline>.` on `/live` only | the morning after the deadline passes |

`LIVE_DEADLINE` is null by default and renders nothing at all. Set it to the
words JJ says out loud on the broadcast, and unset it when it has passed — a
deadline she is given and we do not keep costs more than it earns. There is no
countdown and no timer anywhere in this codebase, and `tests/copy.test.ts`
fails the build if one appears in the copy.

## The offer lives in one file

Prices, variant ids, the discount code and the subscription flag are all in
`src/lib/offer.ts`, and `shopUrl()` in `src/lib/analytics.ts` builds every cart
link from them. The offer pages and the screen at the end of the quiz render the
same `BuyOptions` component, so there is one offer in the code rather than two.
`tests/copy.test.ts` holds the authored copy to the claim rules and
`e2e/offer.spec.ts` holds the cart links and the fold.

She reads **The 60-Day Plan**. `Protocol` is the word the store, the discount
code and the analytics use, and it stays in constant names and comments; the
copy gate fails the build if it reaches a string she can read.

## Adding an ad angle

One entry in `src/lib/angles.ts`. Route, headline, subheadline, hero, bullets,
pre-selected symptom, and which review leads the page. Nothing else changes, and
`e2e/funnel.spec.ts` picks the new route up from the same list.
