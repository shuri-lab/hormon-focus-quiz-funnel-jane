import { useEffect, useRef, useState } from 'react';
import { useQuiz } from '../context';
import { Screen, ScreenTitle, ActionBar } from '../../components/Screen';
import { stateKey } from '../../lib/logic';
import { isEmail, submitLead } from '../../lib/leads';
import { track } from '../../lib/analytics';

/* -------------------------------------------------------------- load ---- */

/* A short pause, and only what actually happens. Nothing is matched against
   other women and nothing is measured, so neither is claimed. */
const LOAD_STEPS = [
  'Looking at your symptoms',
  'Checking the pattern',
  'Preparing your Hormone Check',
];

/** About two and a half seconds, end to end. */
const LOAD_MS = 2400;

export function Load() {
  const { next } = useQuiz();
  const [k, setK] = useState(0);
  const done = useRef(false);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const total = reduced ? 600 : LOAD_MS;
    const step = total / LOAD_STEPS.length;

    const timers = LOAD_STEPS.map((_, i) => setTimeout(() => setK(i + 1), step * (i + 1)));
    const finish = setTimeout(() => {
      if (done.current) return;
      done.current = true;
      /* replace, so the back button from the next screen returns to the last
         question rather than re-running this animation */
      next({ replace: true });
    }, total + 250);

    return () => { timers.forEach(clearTimeout); clearTimeout(finish); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Screen id="load">
      <div className="loadWrap">
        <ScreenTitle className="q">Putting your answers together…</ScreenTitle>
        <div className="loadSpin" aria-hidden="true" />
        <ul className="loadList">
          {LOAD_STEPS.map((label, i) => (
            <li key={label} className={i < k ? 'done' : i === k ? 'now' : ''}>
              <span className="ld" />{label}
            </li>
          ))}
        </ul>
        <p className="srOnly" role="status" aria-live="polite">Putting your answers together</p>
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
  const valid = isEmail(S.email);
  /* Consent is a separate gate from a valid address. Both must pass. */
  const ready = valid && S.consent;

  async function submit() {
    setTouched(true);
    if (!ready || busy) return;
    setBusy(true);
    track.lead(outcome);
    await submitLead(S, outcome, angle.slug);
    next();
  }

  return (
    <Screen id="gate">
      <ScreenTitle className="rTitle">Your Hormone Check is ready.</ScreenTitle>
      <p className="rDeck">
        Enter your first name and email to see your personalized result now.
      </p>

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
            aria-invalid={touched && !S.consent}
            aria-describedby={touched && !S.consent ? 'cf-err' : undefined}
            onChange={(e) => set({ consent: e.target.checked })}
          />
          <span>
            Yes, email me my result and tips from JJ Smith. I can unsubscribe
            at any time.
          </span>
        </label>
        {touched && !S.consent && (
          <p className="fieldErr" id="cf-err">
            Please tick the box so we know it is alright to email you.
          </p>
        )}

        <ActionBar>
          <button type="submit" className="cta" disabled={busy || !ready}>
            {busy ? 'One moment…' : 'SHOW ME MY RESULTS'}
          </button>
        </ActionBar>
      </form>

      <p className="gateNow">Your results will appear immediately.</p>
    </Screen>
  );
}
