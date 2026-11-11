import { useEffect, useRef, useState } from 'react';
import { useQuiz } from '../context';
import { REVIEW } from '../../review/flag';
import { Screen, ScreenTitle, ActionBar } from '../../components/Screen';
import { stateKey } from '../../lib/logic';
import { isEmail, submitLead } from '../../lib/leads';
import { track } from '../../lib/analytics';
import { GATE_LINE, LOAD_CARDS } from '../../lib/resultCopy';

/* -------------------------------------------------------------- load ---- */

/* A short pause, and only what actually happens. Nothing is matched against
   other women and nothing is measured, so neither is claimed. */
const LOAD_STEPS = [
  'Analyzing your answers',
  'Checking your pattern',
  'Building your plan',
];

/* Direction 2: the title moves with the steps, and swaps when the third
   step starts. Live component; only the words change. */
const loadTitle = (k: number): string => (k >= 2 ? 'Building your plan…' : 'Getting your results…');

/** About two and a half seconds, end to end. */
/* Direction 2: about 5.6 s, so four cards can each show for about 1.4 s.
   Jane asked to keep it under about 6 s. */
/* Jane, 11 Nov: no review here, and slower: three cards, 2.5 s each. */
const LOAD_MS = 7500;
const CARD_MS = LOAD_MS / 3;

export function Load() {
  const { next } = useQuiz();
  const [k, setK] = useState(0);
  const [card, setCard] = useState(0);
  const done = useRef(false);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const total = reduced ? 600 : LOAD_MS;
    const step = total / LOAD_STEPS.length;

    const cards = reduced ? [] : [1, 2].map((i) => setTimeout(() => setCard(i), CARD_MS * i));
    const timers = LOAD_STEPS.map((_, i) => setTimeout(() => setK(i + 1), step * (i + 1)));
    const finish = setTimeout(() => {
      if (done.current) return;
      done.current = true;
      /* replace, so the back button from the next screen returns to the last
         question rather than re-running this animation */
      next({ replace: true });
    }, total + 250);

    return () => { timers.forEach(clearTimeout); cards.forEach(clearTimeout); clearTimeout(finish); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Screen id="load">
      <div className="loadWrap">
        <ScreenTitle className="q">{loadTitle(k)}</ScreenTitle>
        <div className="loadSpin" aria-hidden="true" />
        <ul className="loadList">
          {LOAD_STEPS.map((label, i) => (
            <li key={label} className={i < k ? 'done' : i === k ? 'now' : ''}>
              <span className="ld" />{label}
            </li>
          ))}
        </ul>
        {/* Direction 2: one card at a time under the steps. A woman like
            her first (the offer page's review card), then the three things
            her plan covers (the live list card). */}
        <div className="nextPieces">
          <div><b>{LOAD_CARDS[card]}</b></div>
        </div>
        <p className="srOnly" role="status" aria-live="polite">{loadTitle(k)}</p>
      </div>
    </Screen>
  );
}

/* -------------------------------------------------------------- gate ---- */

/* THE EMAIL UNLOCK. It says what is true: her result opens on this screen's
   button, now. It does not say "where should we send it", because nothing is
   being sent before she sees it. */
export function Gate() {
  const { S, set, next, angle } = useQuiz();
  const outcome = stateKey(S);

  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const valid = REVIEW ? S.email.trim().length > 0 : isEmail(S.email);
  /* Direction 2 (the V3.5 fix): her result does not wait on the marketing
     box. A valid address opens it; submitLead still sends nothing unless
     the box is ticked. */
  /* Preview: any email moves on; nothing is sent. */
  const ready = REVIEW ? S.email.trim().length > 0 : valid;

  async function submit() {
    setTouched(true);
    if (!ready || busy) return;
    setBusy(true);
    track.lead(outcome, S.email);
    await submitLead(S, outcome, angle.slug);
    next();
  }

  return (
    <Screen id="gate">
      <ScreenTitle className="rTitle">Your Hormone Check is ready.</ScreenTitle>
      <p className="rDeck">{GATE_LINE}</p>

      <form onSubmit={(e) => { e.preventDefault(); void submit(); }} noValidate>
        <label className="srOnly" htmlFor="nf">First name</label>
        <input
          className="field" id="nf" type="text" placeholder="First name"
          autoComplete="given-name" enterKeyHint="next"
          value={S.name} onChange={(e) => set({ name: e.target.value })}
        />

        <label className="srOnly" htmlFor="ef">Email</label>
        <input
          className="field" id="ef" type="email" placeholder="Email"
          autoComplete="email" inputMode="email" enterKeyHint="go"
          aria-invalid={touched && !valid}
          aria-describedby={touched && !valid ? 'ef-err' : undefined}
          value={S.email}
          onChange={(e) => set({ email: e.target.value })}
          onBlur={() => setTouched(true)}
        />
        {touched && !valid && (
          <p className="fieldErr" id="ef-err">Please check that address.</p>
        )}

        {/* Unticked, and required. An unsubscribe link is a way out of
            something she never agreed to join; it is not consent. */}
        <label className="consent" htmlFor="cf">
          <input
            className="consentBox" id="cf" type="checkbox"
            checked={S.consent}
            onChange={(e) => set({ consent: e.target.checked })}
          />
          <span>
            Yes, email me my result and tips from JJ Smith. I can unsubscribe
            at any time.
          </span>
        </label>

        <ActionBar>
          <button type="submit" className="cta" disabled={busy || !ready}>
            {busy ? 'One moment…' : 'SHOW ME MY RESULTS'}
          </button>
        </ActionBar>
      </form>

      <p className="gateNow">We never share your email.</p>
    </Screen>
  );
}
