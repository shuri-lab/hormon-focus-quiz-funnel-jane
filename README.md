# The Hormone Check

A quiz sales funnel for Hormone Focus. One quiz, many front doors: each ad angle
gets its own landing page, and hands off to the same twelve questions with the
symptom that ad promised already selected.

Vite · React 19 · TypeScript · React Router 7. Static build, no server.

```bash
npm ci
npm run dev        # http://localhost:5173
```

---

## What this is, and what it came from

This is a production rebuild of [`JaneWangari/hormonefocus-quizfunnel`](https://github.com/JaneWangari/hormonefocus-quizfunnel).

**The routing was ported, not re-authored.** `src/lib/logic.ts` is a typed
transcription of Jane's `src/logic.js` — same branches, same order, same
comparisons. Jane's original `js/quiz.js` is kept at `reference/quiz.js` for one
reason: `tests/logic.test.ts` runs it in a sandbox and asserts both
implementations agree across **560 combinations** of age, cycle, cause,
regularity and symptom load. If this port had changed behaviour anywhere, that
test would fail.

Read [`docs/PORTING-original.md`](docs/PORTING-original.md) — Jane's note on why
each branch exists — before touching any of it. The short version is below.

---

## The part that must not change

`docs/routing-table.md` is the specification. If the code and the table ever
disagree, **the table wins**.

- **Cancer treatment routes to a doctor at every age.**
- **Surgery routes to a doctor under 50.** Whether her ovaries still work decides
  the answer, and the quiz never asks.
- **Bleeding at 60 or over routes to a doctor.**
- **Under 30 never returns Perimenopause.**
- **A coil or the pill means the bleed is suppressed**, so the verdict says the
  read came from symptoms rather than claiming a cycle we cannot see.

**The doctor route is an exit.** Outcome `D` sees the doctor screen and stops —
no offer, no price, no upsell, and its only outbound link is the brand site. It
must never link to the shop. This is asserted twice: once over the whole input
space in `tests/logic.test.ts`, and once by walking the real interface in
`e2e/funnel.spec.ts`.

---

## Layout

```
src/lib/logic.ts        routing and scoring. No DOM. The ported part.
src/lib/content.ts      every word the funnel says
src/lib/angles.ts       the ad angles. Adding a landing page is adding an entry here
src/lib/offer.ts        prices, and the three that are not confirmed yet
src/lib/analytics.ts    pixel and dataLayer events, attribution capture
src/lib/leads.ts        where the email goes
src/lib/usePageMeta.ts  per-route title, description, canonical, Open Graph

src/landing/Landing.tsx one component, skinned by the angle
src/quiz/               the runner, the state, and one file per group of screens
src/components/         tiles, options, the screen shell, icons
src/styles/             tokens.css, then global.css

reference/quiz.js       Jane's original. Kept only so the equivalence test can run
tests/                  15 tests, 560 routing combinations       (npm test)
e2e/                    65 tests across 5 viewport widths        (npm run e2e)
docs/                   the routing table, Jane's porting note, deployment
```

---

## The ad angles

| Route | Pre-selects | Angle |
|---|---|---|
| `/` | — | Nobody told you this would happen to your body |
| `/bloating` | Bloating | You cut the foods out. You are still bloated |
| `/weight` | Weight | You are doing everything you used to do |
| `/hot-flashes` | Hot flashes | It starts years before anybody calls it menopause |
| `/sleep` | Poor sleep | You fixed your bedtime. You are still awake at three |
| `/mood` | Mood and brain fog | You do not feel like yourself |
| `/energy` | Low energy | Tired in a way that sleeping does not touch |

Each hands off to `/<angle>/quiz`, which starts with that symptom already
chosen — the woman who clicked the bloating ad is not asked whether she bloats.

To add one, add an entry to `src/lib/angles.ts`. The route, the landing page and
the e2e coverage all come from that list.

---

## What changed from the prototype

**Rebuilt, because the prototype could not do these:**

- **Routes.** The whole point of the funnel is a landing page per ad angle. A
  single `index.html` cannot have seven.
- **The nested scroll frame is gone.** The prototype put a scrolling `div` inside
  a fixed-height device frame. On iOS Safari that fights the address bar, breaks
  momentum scrolling and can clip the last screen. The document scrolls now, with
  `100dvh` and safe-area insets.

**Fixed:**

- **Fluid type** from 320px up, rather than one fixed scale.
- **A sticky action bar** on every question that takes more than one tap, so
  Continue is never below six options.
- **Back moved into the header** where it is always reachable, at 44px.
- **Browser and Android back** now walk the funnel backwards instead of leaving
  it, because the screen lives in history state.
- **Answers survive a refresh** via `sessionStorage`.
- **A double tap on Continue** advances one screen, not two.
- **The back button cannot re-enter the analysing animation.**
- **Stretched images.** `width`/`height` are set on every image to reserve space,
  which silently stretched them until `height: auto` was set to match.
- **Focus management.** Each screen moves focus to its heading.
- **Real radio and checkbox semantics** instead of pressed buttons.
- **The confidence chip** was a white pill that read as a button labelled
  "Clear". It is a status tag now.
- **Email validation** is real, with an error message, and the field no longer
  says "Prototype only".

**Removed:**

- The Phone/Desktop and outcome-jump scaffolding.
- The `r3` "gap table" screen. It was fully written and styled in the prototype
  but was **not in `FLOW`**, so it never rendered. Jane's `PUBLISHED` and
  `NOWSIDE` copy tables existed only to feed it. Worth a decision: restore it, or
  delete the tables.
- `img/jj-smith.jpg` was unreferenced. It is used now, on every landing page.

**Moved out of sight, not deleted:** the offer screen's "open before this ships"
warning was rendering to customers, telling them the price was unconfirmed. It
now appears only in development or with `?debug=1`, so review still sees it.

---

## Before a single ad runs

Three things are wired but not filled in, and one is commercial.

1. **`VITE_LEAD_ENDPOINT` is unset.** The email gate collects an address and
   drops it. See `.env.example`.
2. **No pixel is committed.** `index.html` marks where the Meta and GA4 tags go.
   The events already fire; they no-op until a tag is present.
3. **Three offer claims are not true yet** — carried over from Jane's note and
   still open. They live in `src/lib/offer.ts`:
   - `$44.99` is derived from the 10% subscribe-and-save, not confirmed.
   - No 3 or 6-month bundle exists. The ladder shows one.
   - The Starter Guide does not exist. It is promised as step 1.

See [`docs/DEPLOY.md`](docs/DEPLOY.md).

---

## The copy rules, which survive any rewrite

**No contractions** in user-facing copy. House style.

Every product claim is JJ's own published wording. No timeframes, no quantified
results, no invented percentages.

Two proof numbers do different jobs and **must not be merged**:

- **800,000** is scoped to **books and challenges**, not supplement buyers.
  "Join 800,000 women" on a Hormone Focus button would read as 800,000 Hormone
  Focus customers, which is false.
- **169** is the Hormone Focus **review count**. It belongs beside 4.9, nowhere
  else.

Check claims by walking the funnel, not by reading the source. One line already
broke the second rule for two audits because it only appeared mid-animation.

---

## Commands

```bash
npm run dev         # dev server
npm run build       # typecheck and build to dist/
npm run preview     # serve the build
npm test            # routing: 15 tests, 560 combinations
npm run e2e         # interface: 65 tests across 5 widths
npm run typecheck   # strict, and it passes
npm run lint
```
