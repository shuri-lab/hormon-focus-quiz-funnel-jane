# Porting this to React

The screens should be rebuilt. The routing should not.

This note is about the difference, and about one specific way this project has already gone wrong once.

## What happened last time

In September we rebuilt these screens inside a quiz-builder tool. The tool had eight element types, so every screen came out as the nearest thing the tool could express. The result was a worse version of work that had already been approved, and two days were lost getting back to where we started.

The rule that came out of it: **port, do not re-author.** Move the thing across; do not rewrite it in the new idiom and hope it comes out the same.

React does not force that compromise the way the builder did — you can reproduce any markup you like. The risk is different here: the routing is small enough to look re-writable, and it is not.

## The part that must not change

`src/logic.js`. No DOM, no imports, no framework. It is a mechanical extraction of the logic in `js/quiz.js` — same branches, same order, same comparisons — with the state passed in rather than read from a module global.

**Import it. Do not reimplement it.**

```js
import { createState, stateKey, score, nextId, path } from './logic.js'

const [S, setS] = useState(createState)
const outcome = stateKey(S)          // 'A' | 'B' | 'C' | 'D' | 'E'
```

It is plain ES modules, so it drops into Vite untouched.

## Why it is worth protecting

Every branch in `stateKey()` is there because of something that happened:

- **Cancer treatment routes to a doctor at every age.** She has a clinical team, and oestrogen metabolism is precisely where we do not sell.
- **Surgery routes to a doctor under 50.** Whether her ovaries still work decides the answer, and the quiz never asks.
- **Bleeding at 60 or over routes to a doctor.** Uncommon enough to be looked at rather than explained away.
- **Under 30 never returns Perimenopause.**
- **A coil or the pill means the bleed is suppressed**, so her cycle cannot tell us anything and the verdict copy says so rather than claiming a cycle we cannot see.

That last group exists because of a real bug Jane caught: periods stopped *plus any named cause* fell through to a score that gives +2 for age alone, so a woman in her fifties with a coil, or after a hysterectomy, was told **Perimenopause**. The fix was to route on *why* the periods stopped rather than just *that* they had.

`docs/routing-table.md` is the specification. If the code and the table ever disagree, **the table wins**.

## The test is the safety net

```bash
node --test
```

Fifteen tests over **560 combinations** of age, cycle, cause, cycle regularity and symptom load. Every outcome is exercised: A 152, B 152, C 80, D 160, E 16.

Two kinds:

1. **Equivalence.** It lifts the pure functions out of the original `js/quiz.js`, runs both implementations over the whole space, and asserts they agree. This one **skips itself** once `js/quiz.js` is deleted — which is expected once React lands.
2. **Conformance.** It asserts `src/logic.js` against the routing table directly, plus three structural guarantees. These are permanent.

The structural ones are worth knowing because they are easy to break when you rewire navigation:

- **The doctor route never reaches the offer, and the offer never reaches the doctor route.** `D` sees `rDoc` and stops. Nobody else sees `rDoc` at all.
- **The cycle questions go to exactly the right group.** Stopped is asked *why*; still cycling is asked about *regularity*. Never both, never neither.
- **Every state reaches a terminal screen and no screen repeats.**

Run the tests before you open a pull request. If the equivalence test fails, the port has changed behaviour.

## The screens

`SCREEN.*` in `js/quiz.js` — one function per screen, each returning an HTML string. Rebuild these as components freely. The copy is approved and should travel verbatim; the markup is a suggestion.

`AFTER.*` holds the things that run once a screen is in the DOM: the loader's interval, the vessel fill on the mechanism screen, the email gate's validation. In React these become effects.

The screen order lives in `FLOW`, and `shouldSkip` / `nextId` / `path` in `src/logic.js` already handle sequencing. You do not need to reimplement navigation either — give it the current screen and it tells you the next one.

## Two things to delete when you ship

Both are review scaffolding, in `index.html` under `<div class="tools">` and wired at the bottom of `js/quiz.js`:

- **Phone / Desktop** — switches the frame
- **Start / Imbalance / Perimenopause / Menopause** — jumps to a result without answering twenty questions

## The copy rules, which survive any rewrite

**No contractions** in user-facing copy. House style.

Every product claim is JJ's own published wording. No timeframes, no quantified results, no invented percentages.

Two proof numbers do different jobs and **must not be merged**:

- **800,000** is scoped to **books and challenges**, not supplement buyers. "Join 800,000 women" on a Hormone Focus button would read as 800,000 Hormone Focus customers, which is false.
- **169** is the Hormone Focus **review count**. It belongs beside 4.9 and nowhere else.

One line already broke that second rule: the loader said *"Matching it against 169 women"*, which turns a rating into a club size. It survived two copy audits because it only appears mid-animation, so nobody ever read it on screen. **Check claims by walking the funnel, not by reading the source.**

## Three things on the offer screen that are not true yet

The warning block on the offer screen says so on the screen itself. Keep it there until each is resolved:

- **$44.99** is derived from the 10% subscribe-and-save on the live product page. Not confirmed.
- **No 3 or 6-month bundle exists.** The ladder shows one.
- **The Starter Guide does not exist.** It is promised as step 1.

## Where it is going

The live site is `hormonefocus.jjsmithonline.com` — Vite, React 19, React Router, built in Lovable, server-rendered.

Symptom landing pages are planned as routes in that same app: `/bloating`, `/weight`, `/night-sweats`, `/sleep`, `/mood`. Each should hand off to the quiz with that symptom **already selected** — the woman who clicked the bloating ad should not be asked whether she bloats.

One domain for all of it matters: the Meta pixel, the `_fbc` cookie and domain verification already work on that host, and every new route inherits them for nothing.

Two things to fix while you are in there: every route currently returns `<title>Lovable App</title>`, and `img/jj-smith.jpg` in this repo is unreferenced — it belonged to a trust screen that was cut back to Lisa's review alone.
