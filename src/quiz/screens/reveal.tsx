import { useQuiz } from '../context';
import { Screen, ScreenTitle, ActionBar } from '../../components/Screen';
import {
  TILES, BRAND, docReason, has, mainConcern, masked, otherConcerns, seesOffer, stateKey,
} from '../../lib/logic';
import {
  CANNOT_TELL, DOC, DOC_TITLE, MASKED_NOTE, QUIZ_DISCLAIMER, RESULT, WANT_PHRASE,
  patternLine,
} from '../../lib/content';
import type { Outcome, SymptomId } from '../../lib/logic';

const LABEL = Object.fromEntries(TILES) as Record<SymptomId, string>;

/* ---------------------------------------------------------------- r1 ---- */

/* WHAT HER ANSWERS MEAN. One page, and nothing is sold on it: she gave an
   address for a result, and the result is what she is given first.
 *
 * It is a pattern and never a diagnosis. Everything on it is one of her own
 * answers said back to her, or a plain sentence about the stage. */
export function R1() {
  const { S, next, restart } = useQuiz();
  const outcome = stateKey(S) as Exclude<Outcome, 'D'>;
  const copy = RESULT[outcome] ?? RESULT.A;
  const main = mainConcern(S);
  const others = otherConcerns(S);
  const pattern = patternLine(S);
  const name = S.name.trim();

  return (
    <Screen id="r1">
      <p className="eyebrow">Your Hormone Check</p>
      <ScreenTitle className="rTitle">
        {name ? `${name}, ${copy.headline.charAt(0).toLowerCase()}${copy.headline.slice(1)}` : copy.headline}
      </ScreenTitle>

      <dl className="resCard">
        {main && (
          <div>
            <dt>Your biggest concern</dt>
            <dd>{LABEL[main]}</dd>
          </div>
        )}
        {others.length > 0 && (
          <div>
            <dt>You are also noticing</dt>
            <dd>{others.map((id) => LABEL[id]).join(' + ')}</dd>
          </div>
        )}
        {pattern && (
          <div>
            <dt>Your pattern</dt>
            <dd className="resSay">{pattern}</dd>
          </div>
        )}
      </dl>

      <div className="block">
        <p className="blabel">Here is what that means</p>
        {copy.means.map((p) => <p key={p}>{p}</p>)}
        {masked(S) && <p>{MASKED_NOTE}</p>}
      </div>

      {S.want && (
        <div className="block key">
          <p className="blabel">And what you want most is</p>
          <p className="lead">{WANT_PHRASE[S.want]}</p>
        </div>
      )}

      <p className="fine">{CANNOT_TELL} {QUIZ_DISCLAIMER}</p>

      {seesOffer(S) ? (
        <ActionBar>
          <button type="button" className="cta" onClick={() => next()}>
            SHOW ME WHAT TO DO NEXT &rarr;
          </button>
        </ActionBar>
      ) : (
        <button type="button" className="cta ghost" onClick={restart}>Start the check again</button>
      )}
    </Screen>
  );
}

/* -------------------------------------------------------------- rDoc ---- */

/* The safety route. Its only outbound link is the brand site.
   It must never link to the shop, and it has no next screen. */
export function RDoc() {
  const { S, restart } = useQuiz();
  const reason = docReason(S) || 'young';
  const copy = DOC[reason];
  const picked = TILES.filter(([id]) => has(S, id)).map(([, label]) => label.toLowerCase());
  const list = picked.length ? picked.join(', ') : 'what you described';

  return (
    <Screen id="rDoc">
      <p className="eyebrow">Your Hormone Check</p>
      <ScreenTitle className="rTitle">{DOC_TITLE}</ScreenTitle>
      <p className="rDeck">{copy.deck}</p>

      <div className="block key">
        <p className="blabel">What to say</p>
        <p className="lead">&ldquo;{copy.say}&rdquo;</p>
        <p>Then tell them how long it has been, and mention {list}.</p>
      </div>

      <div className="block">
        <p className="blabel">What they may look at</p>
        <p>{copy.look}</p>
      </div>

      <a className="cta soft" href={BRAND} target="_blank" rel="noopener noreferrer">
        More from JJ Smith
      </a>
      <button type="button" className="cta ghost" onClick={restart}>Start the check again</button>

      <p className="fine">{QUIZ_DISCLAIMER}</p>
    </Screen>
  );
}
