import { useEffect, useRef, useState } from 'react';
import { useQuiz } from '../context';
import { Screen, ScreenTitle, ActionBar } from '../../components/Screen';
import { score, stateKey } from '../../lib/logic';
import { isEmail, submitLead } from '../../lib/leads';
import { track } from '../../lib/analytics';

/* --------------------------------------------------------------- s12 ---- */

const LOAD_STEPS = [
  'Reading what you told me',
  'Weighing how often it hits',
  'Working out your stage',
  /* The review count is a review count, not a number of customers. Saying
     "170 women" turns a rating into a club size, which is the exact error the
     claim rule names. No number here: none is needed. */
  'Matching it against what other women report',
  'Building your plan',
];

const RING = 364;

export function S12() {
  const { next } = useQuiz();
  const [n, setN] = useState(0);
  const done = useRef(false);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const tick = reduced ? 12 : 55;

    const t = setInterval(() => {
      setN((v) => {
        const nv = Math.min(100, v + 1);
        if (nv >= 100 && !done.current) {
          done.current = true;
          clearInterval(t);
          /* replace, so the back button from the next screen returns to the
             last question rather than re-running this animation */
          setTimeout(() => next({ replace: true }), reduced ? 200 : 700);
        }
        return nv;
      });
    }, tick);

    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const k = Math.floor(n / 20);

  return (
    <Screen id="s12">
      <div className="loadWrap">
        <ScreenTitle className="q" >Analyzing your answers.</ScreenTitle>
        <p className="qsub">Preparing your plan.</p>
        <div className="ring">
          <svg width="132" height="132" aria-hidden="true">
            <circle cx="66" cy="66" r="58" stroke="var(--wash-2)" strokeWidth="11" fill="none" />
            <circle
              cx="66" cy="66" r="58" stroke="var(--plum)" strokeWidth="11" fill="none"
              strokeLinecap="round" strokeDasharray={RING}
              strokeDashoffset={RING - (RING * n) / 100}
            />
          </svg>
          <div className="pct">{n}%</div>
        </div>
        <ul className="loadList">
          {LOAD_STEPS.map((label, i) => (
            <li key={label} className={
              i < k || n >= 100 ? 'done' : i === Math.min(k, LOAD_STEPS.length - 1) && n < 100 ? 'now' : ''
            }>
              <span className="ld" />{label}
            </li>
          ))}
        </ul>
        <p className="srOnly" role="status" aria-live="polite">{n}% complete</p>
      </div>
    </Screen>
  );
}

/* --------------------------------------------------------------- s13 ---- */

export function S13() {
  const { S, set, next, angle } = useQuiz();
  const sc = score(S);
  const outcome = stateKey(S);
  const doc = outcome === 'D';

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
    <Screen id="s13">
      <p className="eyebrow">{doc ? 'Almost there' : 'Good news'}</p>
      <ScreenTitle className="rTitle">
        {doc ? 'Your read is ready.' : 'Your pattern is clear, and your plan is ready.'}
      </ScreenTitle>
      <p className="rDeck">
        You said yes to {sc.raw} things, and they are not {sc.raw} separate problems.
        Where should I send it?
      </p>

      <form onSubmit={(e) => { e.preventDefault(); void submit(); }} noValidate>
        <label className="srOnly" htmlFor="nf">Your first name</label>
        <input
          className="field" id="nf" type="text" placeholder="Your first name"
          autoComplete="given-name" enterKeyHint="next"
          value={S.name} onChange={(e) => set({ name: e.target.value })}
        />

        <label className="srOnly" htmlFor="ef">Your email address</label>
        <input
          className="field" id="ef" type="email" placeholder="you@email.com"
          autoComplete="email" inputMode="email" enterKeyHint="go"
          aria-invalid={touched && !valid}
          aria-describedby={touched && !valid ? 'ef-err' : undefined}
          value={S.email}
          onChange={(e) => set({ email: e.target.value })}
          onBlur={() => setTouched(true)}
        />
        {touched && !valid && (
          <p className="fieldErr" id="ef-err">Please check that address — we cannot send your result without it.</p>
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
            Yes, send my result and keep me posted from JJ Smith. I can
            unsubscribe at any time.
          </span>
        </label>
        {touched && !S.consent && (
          <p className="fieldErr" id="cf-err">
            Please tick the box so we know it is alright to email you.
          </p>
        )}

        <ActionBar>
          <button type="submit" className="cta" disabled={busy || !ready}>
            {busy ? 'One moment…' : 'Show me my results'}
          </button>
        </ActionBar>
      </form>

      <p className="fine">
        We use your address to send your result and to keep you posted from JJ
        Smith. Nothing is sent unless you tick the box above.
      </p>
    </Screen>
  );
}
