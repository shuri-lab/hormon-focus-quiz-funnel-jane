import { useEffect, useState } from 'react';
import { useQuiz } from '../context';
import { Screen, ScreenTitle, ActionBar } from '../../components/Screen';
import {
  GROUPS, TILES, BRAND, confidence, docReason, groupCount, groupMax, has, masked,
  score, stateKey,
} from '../../lib/logic';
import { DOC, IMG, QUIZ_DISCLAIMER, VERDICT } from '../../lib/content';

function displayName(name: string) {
  return name.trim() || 'you';
}

/* ---------------------------------------------------------------- r1 ---- */

export function R1() {
  const { S, next } = useQuiz();
  const v = VERDICT[stateKey(S)];

  return (
    <Screen id="r1">
      <p className="eyebrow">Your hormone check</p>
      <ScreenTitle className="rTitle">{displayName(S.name)}, here is your answer.</ScreenTitle>

      <div className="verdict">
        <p className="lab">What your answers point to</p>
        <p className="name">{v.name}</p>
        <p className="sub">{v.sub(S)}</p>
        <p className="conf">
          <span className="srOnly">How clear this read is: </span>
          {confidence(S)}
        </p>
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

      <ActionBar>
        <button type="button" className="cta" onClick={() => next()}>Show me how you know &rarr;</button>
      </ActionBar>
    </Screen>
  );
}

/* ---------------------------------------------------------------- r2 ---- */

/* The read opens on her own answers, as pictures, not as a bar chart. */
export function R2() {
  const { S, next } = useQuiz();
  const sc = score(S);
  const [shown, setShown] = useState(false);
  const picked = TILES.filter(([id]) => has(S, id));

  useEffect(() => {
    const t = setTimeout(() => setShown(true), 260);
    return () => clearTimeout(t);
  }, []);

  return (
    <Screen id="r2">
      <p className="eyebrow">Here is how I know</p>
      <ScreenTitle className="rTitle">Your read.</ScreenTitle>

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

      <div className="scoreCard">
        <div className="scoreBig">{sc.raw} <small>of 14</small></div>
        <p className="scoreLab">
          {sc.pct > 65 ? 'A strong pattern' : sc.pct > 35 ? 'A clear pattern' : 'Early signs'}
        </p>

        <div className="gauge" role="img" aria-label={`Symptom load ${sc.pct} out of 100`}>
          <span className="gaugePin" style={{ left: `${shown ? sc.pct : 0}%` }} />
        </div>
        <div className="gaugeEnds"><span>Mild</span><span>Moderate</span><span>Severe</span></div>

        <div className="bars">
          {GROUPS.map((g) => {
            const n = groupCount(S, g);
            const m = groupMax(g);
            const pct = m ? Math.round((n / m) * 100) : 0;
            return (
              <div className="barRow" key={g.k}>
                <b>{g.name}</b>
                <i>{n} of {m}</i>
                <span className="barTrack">
                  <span className="barFill" style={{ width: `${shown ? pct : 0}%` }} />
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <ActionBar>
        <button type="button" className="cta" onClick={() => next()}>Why has nothing worked? &rarr;</button>
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
