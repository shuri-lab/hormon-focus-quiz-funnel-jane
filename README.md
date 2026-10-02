# The Hormone Check

The quiz funnel for Hormone Focus, JJ Smith's supplement. A woman answers seven
questions, gets one clear result, and is shown the 60-Day Feel Like YOU Again
Kit as the way to act on it.

Vite · React 19 · TypeScript · React Router 7. A static build with no server of
its own: the email goes to Klaviyo and the purchase to Shopify.

```bash
npm ci
npm run dev        # http://localhost:5173
```

---

## How it works

1. **Cover** (`/`, or `/<angle>` for an ad angle). JJ's logo, a headline, one
   line, one button. Nothing is sold here.
2. **Seven questions.** What is bothering her; which one most (only if she
   picked more than one); age; cycle, with a 12-month follow-up only if her
   periods have stopped; when she notices it; what she has tried; what she
   wants most.
3. **A short loader**, then **the email screen**, with a required consent box.
4. **Her result.** One named answer, said in one sentence. Her symptoms with
   the pictures she picked, what it means, what she wants most, and one sourced
   fact about women at her stage. No product yet.
5. **The kit page**, one scroll. Her 60-day plan named for her biggest concern,
   the five things to do, the "how" answered by the kit piece by piece,
   customer proof, then the offer, as it is on JJ's offer page.

**The five outcomes:** Hormonal imbalance, Perimenopause, Menopause, Early
menopause, and the doctor route. Every outcome but the doctor route sees the
kit. The doctor route is two cases and exits before the email screen. The
specification is [`docs/routing-table.md`](docs/routing-table.md); if the code
and the table disagree, the table wins.

---

## Where things are

```
src/lib/logic.ts        routing: outcomes, which screens show. No DOM
src/lib/content.ts      every word of the cover, questions and result
src/lib/kitCopy.ts      every word of the kit page
src/lib/offer.ts        prices, variant ids, cart links, the kit's contents
src/lib/reviews.ts      customer reviews (verbatim), faces, the rating
src/lib/leads.ts        the two Klaviyo calls: the event and the subscription
src/lib/analytics.ts    dataLayer and pixel events, attribution, cart links
src/lib/angles.ts       the ad angles: one entry is one landing route

src/landing/            the cover
src/quiz/screens/       questions.tsx, gate.tsx, reveal.tsx, offer.tsx
src/components/         KitOffer (the offer block), Proof, tiles, controls
src/offer/              the standalone offer pages: /offer, /offer/<angle>, /live
src/styles/             tokens.css, global.css, kit.css, offer*.css
src/review/             the review build only; never in the real build

tests/                  unit tests: routing, copy rules, cart links, Klaviyo
e2e/                    the interface, walked at five screen widths
docs/                   the routing table, deployment
```

---

## The rules that must not break

- **Claims.** Hormone Focus "supports" or "helps". It never treats, cures,
  stops or fixes anything, never promises weight loss, never gives a result by
  a date. `tests/copy.test.ts` fails the build on most breaks.
- **No contractions** in our own copy. Customer reviews are quoted exactly,
  from JJ's store or page, with "Individual results vary".
- **One clear result.** "Your answers match the pattern of …". Never "you
  have", never "you may be between two".
- **Facts carry their source.** The stage facts on the result page name it.
- **No test reaches Klaviyo.** `e2e/helpers.ts` blocks it.
- **Nothing about her health goes in a link or an ad pixel.** Her answers go
  to Klaviyo only, and only when she ticks the box.
- **The doctor route** never reaches the email screen, a price or a shop link.
- **800,000** is JJ's books and challenges, never a Hormone Focus customer
  count. **171** is the review count and travels with **4.9**.

---

## Klaviyo

`src/lib/leads.ts` makes two calls when she ticks the box:

1. **The event** `HF Quiz Completed` (`quiz: hf-v3`), which starts the
   post-quiz flow. It carries `outcome`, `selected_symptoms`,
   `primary_symptom`, `age_band`, `cycle_status`, `cycle_12_month_status`,
   `symptom_pattern`, `tried_actions`, `desired_outcome`, and her UTMs.
2. **The subscription**, which records her consent on a list. Klaviyo only
   sends marketing email to a profile that has agreed to it. This call runs
   once `KLAVIYO_LIST_ID` is set to the id of the list the quiz should feed.

The key in the file is Klaviyo's public key and belongs in browser code. No
private key is in this repository, and none is needed.

---

## Commands

```bash
npm run dev           # dev server
npm run build         # typecheck, then build to dist/
npm run preview       # serve the build
npm test              # unit tests
npm run e2e           # browser tests at 320, 390, 430, 768 and 1440 wide
npm run lint
npm run build:review  # a shareable review copy, into dist-review/
```

The browser suite is heavy. If it times out, run one width at a time:
`npx playwright test --project=phone-390`.

See [`docs/DEPLOY.md`](docs/DEPLOY.md) to publish.
