/* DIRECTION 2, 11 November 2026 (local mock). YOUR PLAN (your-plan), at
 * the live plan screen's address and in its layout: what her body needs,
 * four steps keyed to her symptoms, no product and no price. Then the turn:
 * the four Kit items as Step 1 to 4 with their own thumbnails and a small
 * picture of the Kit (no price on it), and one button to JJ's Kit page.
 */
import { useQuiz } from '../context';
import { Screen, ScreenTitle, ActionBar } from '../../components/Screen';
import { IMG, OFFER_DISCLAIMER } from '../../lib/content';
import { mainConcern, stateKey } from '../../lib/logic';
import {
  PLAN_EYEBROW_D2, PLAN_INSIDE, PLAN_INSIDE_ITEMS, PLAN_JJ_STORY, PLAN_LOT,
  PLAN_TO_KIT_CTA, PLAN_WHY_KIT, PLAN_PUSH, REVIEW_FOR, planSteps,
} from '../../lib/resultCopy';
import { reviewByName } from '../../lib/reviews';
import { getArm } from '../../lib/arm';
import { PLAN_OFFER_TEASE, PLAN_BOTTLE_CTA, PLAN_BOTTLE_LOT, PLAN_BOTTLE_WHY, PLAN_BOTTLE_STORY, PLAN_BOTTLE_PUSH, PLAN_INTRO_V10, planTitle } from '../../lib/resultCopy';
import { Quote } from '../../components/Proof';
import {
  SHOT_KIT_FULL, SHOT_STEP_CLEAR, SHOT_STEP_EAT, SHOT_STEP_TRACK,
} from '../../lib/offer';

const KIT_THUMBS = [
  '/img/kit-guide-thumb.webp',
  '/img/kit-recipes-thumb.webp',
  '/img/kit-two-bottles-thumb.webp',
  '/img/kit-tracker-thumb.webp',
];

export function YourPlan() {
  const { S, next } = useQuiz();
  const outcome = stateKey(S);
  /* The offer switch: the one-bottle arm is not shown the Kit here. */
  const bottleArm = getArm() === 'bottle25';
  const main = mainConcern(S);
  /* Live, non-product pictures: her own symptom photo, then the cut plan
     screen's step icons (plate, capsule, notebook). */
  const review = reviewByName(main ? REVIEW_FOR[main] : 'Roslind');
  const stepImg = [main ? IMG[main] : SHOT_STEP_TRACK, SHOT_STEP_EAT, SHOT_STEP_CLEAR, SHOT_STEP_TRACK];

  return (
    <Screen id="plan">
      <p className="blabel">{PLAN_EYEBROW_D2}</p>
      <ScreenTitle className="rTitle">{planTitle(S)}</ScreenTitle>
      <p className="rDeck">{PLAN_INTRO_V10}</p>

      <ol className="nSteps">
        {planSteps(S, outcome).map((st, i) => (
          <li key={st.title} className="nStep">
            <span className="nStepNum" aria-hidden="true">{i + 1}</span>
            <img className="nStepIcon" src={stepImg[i]} alt="" width={192} height={192}
              decoding="async" />
            <b className="nStepWhat"><span className="nStepWhen">{st.when}</span>{st.title}</b>
            <span className="nStepTakes">
              {st.body}
              {st.eat && <><br /><strong>Eat more:</strong> {st.eat}</>}
              {st.cut && <><br /><strong>Cut back:</strong> {st.cut}</>}
            </span>
          </li>
        ))}
      </ol>

      {bottleArm
        ? (
          <>
            <p className="bridge">{PLAN_BOTTLE_LOT}</p>
            <p className="bridge"><strong>{PLAN_BOTTLE_WHY}</strong></p>
            <p className="bridge">{PLAN_BOTTLE_STORY}</p>
            <p className="bridge"><strong>{PLAN_BOTTLE_PUSH}</strong></p>
          </>
        )
        : (
          <>
      <p className="bridge">{PLAN_LOT}</p>
      <p className="bridge"><strong>{PLAN_WHY_KIT}</strong></p>
      <p className="bridge">{PLAN_JJ_STORY}</p>

      <figure className="nFig">
        <img className="kitHeroShot isKit" src={SHOT_KIT_FULL} alt="The 60-Day Feel Like You Again Kit"
          width={600} height={267} decoding="async" />
      </figure>
      <p className="blabel">{PLAN_INSIDE}</p>
      <ul className="kitVsList">
        {PLAN_INSIDE_ITEMS.map(([name, what], i) => (
          <li key={name}>
            <span className="kitVsName">
              <img className="kitVsImg" src={KIT_THUMBS[i]} alt="" width={180} height={180}
                loading="lazy" decoding="async" />
              <span><b>{name}:</b> {what}</span>
            </span>
          </li>
        ))}
      </ul>

            <p className="bridge"><strong>{PLAN_PUSH}</strong></p>
          </>
        )}
      {review && (
        <div className="kitRevs">
          <Quote review={review} />
          <p className="kitNote">Individual results vary.</p>
        </div>
      )}

      <p className="fine">*{OFFER_DISCLAIMER}</p>

      <p className="planTease"><strong>{PLAN_OFFER_TEASE[getArm()]}</strong></p>
      <ActionBar>
        <button type="button" className="cta" onClick={() => next()}>
          {bottleArm ? PLAN_BOTTLE_CTA : PLAN_TO_KIT_CTA} &rarr;
        </button>
      </ActionBar>
    </Screen>
  );
}
