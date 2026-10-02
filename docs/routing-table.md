---
type: C
lane: paid
created: 2026-09-11
rebuilt: 2026-10-02
status: current
supersedes: the eleven-question routing of 11 September to 1 October 2026 (in git history)
---

# Hormone Check — the routing table of record

The quiz was rebuilt on 2 October 2026 from eleven questions to seven. **The five outcomes did not change.** What changed is the answers they are read from, who is shown the kit, and how small the doctor route is.

| Key | Outcome (Klaviyo `outcome`) | What she is told | Sees the kit |
|-----|-----------------------------|------------------|--------------|
| A | hormonal-imbalance | "Hormone changes may be part of the picture." | **yes** |
| B | perimenopause | "A pattern often seen during the perimenopause years." | **yes** |
| C | menopause | "A pattern often seen around menopause." | **yes** |
| E | early-menopause | "A pattern often seen when menopause comes early", with "have it confirmed by your doctor". | **yes** |
| D | (never sent) | "Talk to your healthcare professional first." No email asked, no price, no shop link. | no |

The outcome names in Klaviyo are the ones the live flow already branches on. The words on screen never say "you have": a result is a pattern, not a diagnosis.

## Inputs

- **age**: under 40 / 40–44 / 45–49 / 50–54 / 55–59 / 60+
- **cycle** ("What has been happening with your cycle lately?"): about the same as usual / less predictable / skipping some / stopped completely / birth control, medication or surgery affects it / not sure
- **twelve** (asked only when stopped: "Has it been at least 12 months since your last one?"): yes / no / not sure / medication or surgery may be the reason
- **hot flashes or night sweats**: ticked or not, from question one
- **periScore**: hot flashes or night sweats (+2), cycle less predictable (+2) or skipping (+3), age in her forties (+1), fifty or over (+2)

The pattern question, what she has tried and what she wants **never change the outcome**. They change the words on her result.

## The rules, in order

**1. The doctor route. Two cases only.**

| Case | Why |
|------|-----|
| Under 40, periods stopped, and the follow-up is anything but "medication or surgery" | Periods stopping before forty is not menopause in the ordinary sense. |
| 60+, and her cycle is "less predictable" or "skipping some" | Periods still coming and going at sixty or over are worth having looked at. |

Jane's instruction of 2 October 2026: keep the doctor route as small as it can be. Surgery and medication used to be sent here and no longer are (rule 2). `tests/logic.test.ts` asserts the doctor route is exactly these two cases.

**2. Birth control, medication or surgery** (the cycle answer, or the follow-up answer)

Her cycle cannot tell us anything, so she is read on age and symptoms, and **the result says so**.

| Age | Outcome |
|-----|---------|
| 50 and over | **C** |
| 40–49 | **B** |
| Under 40 | **B** if periScore is 5 or more, otherwise **A** (in practice always A) |

**3. Periods stopped completely**

| Follow-up | Age | Outcome |
|-----------|-----|---------|
| 12 months or more | 45 and over | **C** |
| 12 months or more | 40–44 | **E** |
| Under 12 months | 40–59 | **B** |
| Under 12 months | 60+ | **C** |
| Not sure | 40–49 | **B** |
| Not sure | 50 and over | **C** |
| Any but medication or surgery | Under 40 | **D** |

**4. She still has a cycle, or she is not sure**

| Age | Outcome |
|-----|---------|
| 60+ ("same as usual" or "not sure") | **C**. "The same as usual" from a woman of 62 most likely means nothing has changed since her periods stopped. It is not evidence of bleeding. |
| 50–59 | **B** |
| 40–49 | **B** if periScore is 3 or more, otherwise **A** |
| Under 40 | **B** if periScore is 5 or more, otherwise **A** |

## What D does

No product, no price, no kit. A scripted opening line for the appointment, her ticked symptoms to read out, what they may look at, and a restart button.

**She exits at the cycle question, and there is no email gate.** The moment the answer is settled as D the quiz stops: no further questions, no name, no address, nothing sent to Klaviyo. For "under 40 and stopped" the exit waits for the follow-up, because "medication or surgery" there is rule 2, not the doctor route.

## Who is shown the kit

`OFFER_OUTCOMES` in `src/lib/logic.ts` reads `['A', 'B', 'C', 'E']`: Jane's decision of 2 October 2026 that every result but the doctor route sees the 60-Day Feel Like YOU Again Kit. It replaces the rule of 22 September (perimenopause only). Changing it is one line and one test.

Because every result is now sold to, the Klaviyo flow no longer has to withhold the kit from A, C and E.

## The seven questions

1. What has been bothering you lately? (select all)
2. Which one bothers you the most? (only the ones she ticked; skipped when she ticked one)
3. How old are you?
4. What has been happening with your cycle lately? (+ the 12-month follow-up when stopped)
5. You mentioned … When do you notice these changes most?
6. What have you already tried? ("Nothing yet" is exclusive)
7. If one thing could feel better again, what would you choose?

Then a short loader, the email unlock, result page 1 (what her answers mean) and result page 2 (what to do next, and the kit, on one scrolling page).

## What rides to Klaviyo

Metric `HF Quiz Completed`, unchanged. Properties: `outcome`, `outcome_code`, `result_route` (same value as `outcome`), `quiz` = `hf-v3`, `angle`, the UTMs she arrived with, `selected_symptoms`, `primary_symptom` (also as `main_concern`), `age_band`, `cycle_status`, `cycle_12_month_status` (only when asked), `symptom_pattern`, `tried_actions`, `desired_outcome`, `signs`, `consent_at`. Sent only when she ticks the box, and never for outcome D. None of it is put in a link or sent to an ad pixel.

## Judgement calls still open

1. **The consent tick box stays.** The rebuild brief's email screen has no tick box. Removing it changes the basis on which her address and her health answers are stored, so it waits for a yes from David or JJ. One line in `gate.tsx` and one in `leads.ts`.
2. **Under 40 can reach perimenopause** only with skipping periods and hot flashes together. One band covers 25 and 39; the result carries "if you are under 45, talk to your doctor".
3. **"Unexpected bleeding after a long time without a period"** has no question behind it. It is said as one line on every result instead.
4. **One merged option** covers birth control, medication and surgery, so the quiz cannot tell the pill from cancer treatment. Both are read on age and symptoms; the kit page carries the talk-to-your-doctor line for anyone on medication or with a history of breast, uterine or ovarian cancer.
