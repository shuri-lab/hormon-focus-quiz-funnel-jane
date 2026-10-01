import { useQuiz } from '../context';
import { Screen, ScreenTitle, ActionBar } from '../../components/Screen';
import {
  MARKERS, MOOD, TILES, BRAND, confidenceNote, docReason, has, masked, stateKey,
} from '../../lib/logic';
import {
  AGE_PHRASE, CANNOT_TELL, DOC, IMG, PERIOD_PHRASE, QUIZ_DISCLAIMER, REG_PHRASE, VERDICT,
} from '../../lib/content';

function displayName(name: string) {
  return name.trim() || 'you';
}

/* ---------------------------------------------------------------- r1 ---- */

/* What her answers point to, said as a read and not as an answer. Nothing is
   sold on this screen: she has just handed over her email for a result, and
   the result is what she is given first. */
export function R1() {
  const { S, next } = useQuiz();
  const v = VERDICT[stateKey(S)];

  return (
    <Screen id="r1">
      <p className="eyebrow">Your hormone check</p>
      <ScreenTitle className="rTitle">{displayName(S.name)}, here is what your answers point to.</ScreenTitle>

      <div className="verdict">
        <p className="lab">The closest fit</p>
        <p className="name">{v.name}</p>
        <p className="sub">{v.sub(S)}</p>
        <p className="conf">{confidenceNote(S)}</p>
      </div>

      {masked(S) && (
        <div className="block key">
          <p className="blabel">One thing to say plainly</p>
          <p>
            {S.stopCause === 'coil'
              ? 'Your coil, implant or injection is stopping the bleed.'
              : 'Taking the pill without a break is stopping the bleed.'}
            {' '}So your periods cannot tell us anything here. This read is built from
            your symptoms and your age instead.
          </p>
        </div>
      )}

      <p className="fine">{QUIZ_DISCLAIMER}</p>

      <ActionBar>
        <button type="button" className="cta" onClick={() => next()}>Show me why &rarr;</button>
      </ActionBar>
    </Screen>
  );
}

/* ---------------------------------------------------------------- r2 ---- */

/* Why this result: her own answers, said back to her, and then what the
   check cannot establish. There is no score. A number out of a hundred with
   mild, moderate and severe under it looked like a measurement and was not
   one. */
export function R2() {
  const { S, next } = useQuiz();
  const picked = TILES.filter(([id]) => has(S, id));
  const moods = MOOD.filter(([id]) => S.mood.includes(id)).map(([, label]) => label);
  const marks = MARKERS.filter(([id]) => id !== 'none' && S.markers.includes(id)).map(([, label]) => label);
  const cycle = [
    PERIOD_PHRASE[S.periods],
    S.reg ? `and they are ${REG_PHRASE[S.reg]}` : '',
  ].filter(Boolean).join(', ');

  return (
    <Screen id="r2">
      <p className="eyebrow">Here is why</p>
      <ScreenTitle className="rTitle">What you told me.</ScreenTitle>

      {picked.length > 0 && (
        <div className="symStrip">
          {picked.map(([id, label]) => (
            <figure key={id}>
              <img src={IMG[id]} alt="" width={540} height={405} loading="lazy" decoding="async" />
              <figcaption>{label}</figcaption>
            </figure>
          ))}
        </div>
      )}

      <div className="block">
        <p className="blabel">The answers this read rests on</p>
        {S.age && <p><strong>Your age.</strong> You are {AGE_PHRASE[S.age]}.</p>}
        {cycle && <p><strong>Your cycle.</strong> {cycle}.</p>}
        {marks.length > 0 && <p><strong>In the last year.</strong> {marks.join('. ')}.</p>}
        {moods.length > 0 && <p><strong>What is different now.</strong> {moods.join('. ')}.</p>}
      </div>

      <div className="block key">
        <p className="blabel">What this check cannot tell you</p>
        <p>{CANNOT_TELL}</p>
      </div>

      <ActionBar>
        <button type="button" className="cta" onClick={() => next()}>Where do I start? &rarr;</button>
      </ActionBar>
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
      <p className="eyebrow">What to do now</p>
      <ScreenTitle className="rTitle">Take this to your doctor.</ScreenTitle>
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
