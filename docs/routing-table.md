---
type: C
lane: paid
created: 2026-09-11
status: current
supersedes: the routing described in (C)-2026-09-10-three-states-to-product.md
---

# Hormone Check — the routing table of record

Five outcomes. Three are the read she came for. Two are exits.

| Key | Outcome | What it is |
|-----|---------|-----------|
| A | Hormonal imbalance | Estrogen building up faster than her body clears it. The product route. |
| B | Perimenopause | The years before periods stop. The product route. |
| C | Menopause | Periods have stopped. The product route. |
| E | Early menopause | Periods stopped in her forties. Product route, with "have it confirmed". |
| D | This one needs a doctor | We stop. No offer, no upsell, no email follow-up into a sale. |

## Inputs

- **age**: under 30 / 30 to 39 / 40 to 49 / 50 to 59 / 60+
- **periods**: still have them / have them but changed / stopped
- **stopCause** (asked only when stopped): hormonal coil, implant or injection / the pill without a break / hysterectomy or other surgery / cancer treatment or another medication / nothing like that
- **periScore**: hot flashes or night sweats (+2), each perimenopause marker skipped, heavier, closer or further apart (+1 each), cycle all over the place (+2) or a bit off (+1), age 40s (+1), 50s or 60+ (+2)

## The rules, in order

**1. She still has periods (changed or not)**

| Age | Outcome |
|-----|---------|
| 60+ | **D** — bleeding at sixty or over is uncommon and gets looked at, not explained away |
| 50 to 59 | **B** |
| 40 to 49 | **B** if periScore is 3 or more, otherwise **A** |
| 30 to 39 | **B** if periScore is 5 or more, otherwise **A** |
| Under 30 | **A** always. Under thirty is never perimenopause. |

**2. Periods stopped, nothing else explains it**

| Age | Outcome |
|-----|---------|
| 50+ | **C** |
| 40 to 49 | **E** |
| Under 40 | **D** — stopping before forty is not menopause in the ordinary sense |

**3. Periods stopped because of a coil, implant, injection, or the pill without a break**

The bleed is suppressed. Her cycle cannot tell us anything, so we read her on symptoms and age and **say so on the result screen**.

| Age | Outcome |
|-----|---------|
| 50+ | **C** |
| 40 to 49 | **B** |
| 30 to 39 | **B** if periScore is 5 or more, otherwise **A** |
| Under 30 | **A** |

The verdict copy for A and C is rewritten in this case so it does not claim a cycle we cannot see.

**4. Periods stopped after a hysterectomy or other surgery**

| Age | Outcome |
|-----|---------|
| 50+ | **C** |
| Under 50 | **D** — whether her ovaries are still working decides this, and we never asked |

**5. Periods stopped after cancer treatment or another medication**

**D at every age.** Treatment-induced absence can be temporary or lasting, she already has a clinical team, and estrogen metabolism is exactly where we do not sell.

## What D does

No product, no price, no upsell. A scripted opening line for the appointment, her ticked symptoms to read out, what they may look at, and a restart button. The copy is specific to the reason: young, surgery, treatment, or late bleeding.

The email gate before it drops "your plan is ready" and says "your read is ready" instead.

## The bug this replaced

Periods stopped **plus any named cause** fell straight through to `periScore() >= 3`. Age alone contributes 2 points at 50+, so a woman in her fifties who had a hysterectomy, or who has a coil, was told **Perimenopause**. The stopped-periods group also never gets asked the cycle-regularity question, so their score was systematically built from age and hot flashes alone.

## Two judgement calls still open for Jane

1. **30 to 39 can reach Perimenopause** on a heavy symptom load. Late-thirties perimenopause is real, but the band is 30 to 39, so a woman of 31 can land there. Splitting the age question into 30 to 34 and 35 to 39 would close it.
2. **Under 30 never gets Perimenopause**, by design. If she wants that door open, it needs its own threshold rather than the shared one.
