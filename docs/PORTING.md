# The port is done. Here is what it protects.

Jane's original note is kept verbatim at [`PORTING-original.md`](PORTING-original.md)
because it records *why* each routing branch exists, and those reasons have not
changed. This file records what the rebuild did with it.

## What was ported

`src/logic.js` became `src/lib/logic.ts`. Typed, same branches, same order, same
comparisons. `FLOW`, `shouldSkip`, `nextId` and `path` came across unchanged, and
`prevId` was added for the back button.

**The screens were rebuilt. The routing was not.** That was the rule Jane set
after a quiz-builder tool forced a re-author and cost two days, and it held.

## How we know the port did not change behaviour

`reference/quiz.js` is Jane's original vanilla implementation. It is kept in this
repository for exactly one purpose: `tests/logic.test.ts` lifts the pure
functions out of it, runs both implementations over 560 combinations of age,
cycle, cause, regularity and symptom load, and asserts they agree on `stateKey`
and `periScore` everywhere.

```bash
npm test
```

That test skips itself if `reference/quiz.js` is deleted. The conformance tests
against `docs/routing-table.md` are permanent and do not depend on it.

Delete `reference/quiz.js` when you are ready to give up the equivalence check.
There is no other reason to keep it, and no application code imports it.

## The structural guarantees, now checked twice

Jane's three structural tests are still here, over the whole input space:

- The doctor route never reaches the offer, and the offer never reaches the
  doctor route.
- The cycle questions go to exactly the right group.
- Every state reaches a terminal screen and no screen repeats.

The first one is now **also** checked against the running interface in
`e2e/funnel.spec.ts`: it walks a real doctor-route session to the end and asserts
the page contains no price and no link to the shop. A logic test cannot catch a
shop link pasted into the wrong component. That one can.

## What the screens became

`SCREEN.*` string builders became components, one file per group:

| Prototype | Now |
|---|---|
| `SCREEN.s1`–`s11` | `src/quiz/screens/questions.tsx` |
| `SCREEN.s12`, `s13` | `src/quiz/screens/gate.tsx` |
| `SCREEN.r1`, `r2`, `rDoc` | `src/quiz/screens/reveal.tsx` |
| `SCREEN.r4`–`r7` | `src/quiz/screens/offer.tsx` |
| `SCREEN.r3` | removed — it was never in `FLOW` and never rendered |
| `AFTER.*` | effects inside the component that needs them |
| copy tables | `src/lib/content.ts` |

The copy travelled verbatim. Where a sentence changed, it is listed under
"What changed from the prototype" in the README.
