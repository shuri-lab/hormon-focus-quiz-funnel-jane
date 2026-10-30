import type { ReactNode } from 'react';
import { useQuiz } from '../context';
import { Screen, ScreenTitle, ActionBar } from '../../components/Screen';
import { SHOT_KIT_BOTTLE } from '../../lib/offer';
import { TILES, mainConcern, otherConcerns } from '../../lib/logic';
import type { SymptomId } from '../../lib/logic';
import {
  CAUSE_BODY_2, CAUSE_CHIPS, CAUSE_CTA, CAUSE_DECK, CAUSE_EYEBROW,
  CAUSE_HEAD, CAUSE_IMG_ALT, CAUSE_IMG_CAP, MEET_BODY, MEET_BOTTLE_ALT,
  MEET_CLOSE, MEET_CTA, MEET_EYEBROW, MEET_HEAD, MEET_HOW_ALT, MEET_INGS,
  MEET_INGS_HEAD, MEET_LEAD, PLAN_BODY, PLAN_CTA, PLAN_EYEBROW, PLAN_HEAD,
  causeBody,
  PLAN_NOTE, PLAN_STEPS, PLAN_STEP_ALTS,
} from '../../lib/nurtureCopy';

const LABEL = Object.fromEntries(TILES) as Record<SymptomId, string>;

/**
 * Copy with **its key phrases** set bold.
 *
 * David asked on 30 October for these screens to be skimmable: every
 * paragraph was the same weight, so there was nothing for an eye to land on.
 * The marker lives in the copy, beside the words it emphasises, which means
 * the writer decides what matters and not this file.
 *
 * Odd segments are the emphasised ones, because splitting "a **b** c" on the
 * marker gives ["a ", "b", " c"].
 */
function Rich({ children }: { children: string }): ReactNode {
  return children.split('**').map((part, i) => (
    // eslint-disable-next-line react/no-array-index-key
    i % 2 ? <strong key={i}>{part}</strong> : part
  ));
}

/* THE THREE SCREENS BETWEEN THE RESULT AND THE PRICE.
 *
 * See the head of nurtureCopy.ts for why they exist. These render them, and
 * they are deliberately thin: every word comes from that module, so the copy
 * gate reads all of it and none of it can be edited here.
 *
 * THE PICTURES CARRY NO WORDS, on purpose. Every caption, step label and
 * ingredient name below is real text, which means a screen reader gets it, a
 * slow connection gets it, and none of it has to be re-exported to fix a typo.
 */

/* Beside the copy rather than in it: a file path is read by a browser and
   never by her, so it has no business in a module the claim gate walks. */
const IMG_ESTROGEN = '/img/nurture-estrogen.webp';
const IMG_HOW = '/img/nurture-how-it-works.webp';
const IMG_STEPS = [
  '/img/nurture-step-1-clear.webp',
  '/img/nurture-step-2-eat.webp',
  '/img/nurture-step-3-track.webp',
];

/* ------------------------------------------------------------- cause ---- */

/** What is behind her result. Problem-aware to solution-aware. */
export function RCause() {
  const { S, next } = useQuiz();

  /* HER CHIPS, NOT THE SAMPLE. Read off the same answers the result page
     reads, in the same order: the one she said bothers her most first.
     CAUSE_CHIPS is the fallback for a state with no symptoms, which only a
     deep link into this address can produce. */
  const main = mainConcern(S);
  const picked = main ? [main, ...otherConcerns(S)] : [];
  const chips = picked.length ? picked.map((id) => LABEL[id]) : CAUSE_CHIPS;

  return (
    <Screen id="cause">
      <p className="blabel">{CAUSE_EYEBROW}</p>
      <ScreenTitle className="rTitle">{CAUSE_HEAD}</ScreenTitle>
      <p className="rDeck">{CAUSE_DECK}</p>

      <figure className="nFig">
        <img
          className="nFigImg" src={IMG_ESTROGEN} alt={CAUSE_IMG_ALT}
          width={640} height={640} decoding="async"
        />
        <figcaption className="nCap"><Rich>{CAUSE_IMG_CAP}</Rich></figcaption>
      </figure>

      <div className="block">
        {/* HER SYMPTOMS, named. See causeBody() in nurtureCopy.ts. */}
        <p><Rich>{causeBody(picked)}</Rich></p>
        <p><Rich>{CAUSE_BODY_2}</Rich></p>
      </div>

      {/* Her own words back: what SHE tapped, four screens ago. */}
      <ul className="nChips">
        {chips.map((c) => <li key={c} className="nChip">{c}</li>)}
      </ul>

      <ActionBar>
        <button type="button" className="cta" onClick={() => next()}>
          {CAUSE_CTA}
        </button>
      </ActionBar>
    </Screen>
  );
}

/* -------------------------------------------------------------- plan ---- */

/** What to do about it. Three things, one of which is the product. */
export function RPlan() {
  const { next } = useQuiz();

  return (
    <Screen id="plan">
      <p className="blabel">{PLAN_EYEBROW}</p>
      <ScreenTitle className="rTitle">{PLAN_HEAD}</ScreenTitle>

      <ol className="nSteps">
        {PLAN_STEPS.map(([what, takes], i) => (
          <li key={what} className="nStep">
            <span className="nStepNum" aria-hidden="true">{i + 1}</span>
            <img
              className="nStepIcon" src={IMG_STEPS[i]} alt={PLAN_STEP_ALTS[i]}
              width={192} height={192} decoding="async"
            />
            <b className="nStepWhat">{what}</b>
            <span className="nStepTakes"><Rich>{takes}</Rich></span>
          </li>
        ))}
      </ol>

      <p className="nNote"><Rich>{PLAN_NOTE}</Rich></p>

      <div className="block">
        <p><Rich>{PLAN_BODY}</Rich></p>
      </div>

      <ActionBar>
        <button type="button" className="cta" onClick={() => next()}>
          {PLAN_CTA}
        </button>
      </ActionBar>
    </Screen>
  );
}

/* -------------------------------------------------------------- meet ---- */

/** The product, as step one of the plan she has just read. */
export function RMeet() {
  const { next } = useQuiz();

  return (
    <Screen id="meet">
      <p className="blabel">{MEET_EYEBROW}</p>
      <ScreenTitle className="rTitle">{MEET_HEAD}</ScreenTitle>
      <p className="rDeck"><Rich>{MEET_LEAD}</Rich></p>

      {/* THE DIAGRAM MOVED ABOVE THE PARAGRAPH, 30 October. It used to sit
          between MEET_BODY and the ingredient rows, which put a wide pale
          picture directly after a sentence ending in a colon: on a phone the
          page looked finished there, and the three ingredients the colon
          promised were below the fold with nothing to suggest it. The
          picture now belongs to the bottle above it, and the colon is
          followed by the list it announces. */}
      <div className="nShots">
        <img
          className="nBottle" src={SHOT_KIT_BOTTLE} alt={MEET_BOTTLE_ALT}
          width={800} height={800} decoding="async"
        />
        <img
          className="nHow" src={IMG_HOW} alt={MEET_HOW_ALT}
          width={768} height={512} decoding="async"
        />
      </div>

      <div className="block">
        <p><Rich>{MEET_BODY}</Rich></p>
      </div>

      {/* TWO LINES PER INGREDIENT. The plain one is what she understands and
          the quiet one under it is what the label is allowed to say, so the
          plain language never carries the claim by itself. */}
      <p className="blabel nIngsHead">{MEET_INGS_HEAD}</p>
      <ul className="nIngs">
        {MEET_INGS.map(([dose, name, plain, official]) => (
          <li key={name} className="nIng">
            <span className="nDose">{dose}</span>
            <div>
              <p className="nIngName">{name}</p>
              <p className="nIngPlain">{plain}</p>
              <p className="nIngOfficial">{official}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className="block">
        <p><Rich>{MEET_CLOSE}</Rich></p>
      </div>

      <ActionBar>
        <button type="button" className="cta" onClick={() => next()}>
          {MEET_CTA}
        </button>
      </ActionBar>
    </Screen>
  );
}
