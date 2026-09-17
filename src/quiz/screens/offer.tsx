import { useQuiz } from '../context';
import { Screen, ScreenTitle, ActionBar } from '../../components/Screen';
import { score, stateKey, SHOP_BASE } from '../../lib/logic';
import {
  BOTTLE, CUSTOMERS, FDA_DISCLAIMER, OFFER_DISCLAIMER, SEV_PHRASE, TRIED_WHY, VERDICT,
} from '../../lib/content';
import { Stars } from '../../components/icons';
import { shopUrl, track } from '../../lib/analytics';
import {
  GUARANTEE_DAYS, ONE_MONTH_PRICE, SUBSCRIBE_PRICE, SUBSCRIBE_SAVING, money, showInternalNotes,
} from '../../lib/offer';
import type { Severity } from '../../lib/logic';

function Guarantee() {
  return (
    <>
      <div className="sealWrap">
        <span className="seal"><b>SEE<br />RESULTS</b><i>or it&rsquo;s free</i></span>
        <div className="sealTxt">
          <b>Sixty days. Up to two bottles.</b>
          <span>Empty or full. If you do not feel the difference, tell us and we send your money back.</span>
        </div>
      </div>
      <p className="microDisc">Results may vary based on individual. No results guaranteed.</p>
    </>
  );
}

/* ---------------------------------------------------------------- r4 ---- */

export function R4() {
  const { S, next } = useQuiz();
  const why = S.tried.map((k) => TRIED_WHY[k]).filter(Boolean);

  return (
    <Screen id="r4">
      <p className="eyebrow">What you have already tried</p>
      <ScreenTitle className="rTitle">Why nothing has worked.</ScreenTitle>

      <div className="block">
        {why.length
          ? why.map(([head, tail], i) => <p key={i}><strong>{head}</strong> {tail}</p>)
          : (
            <p>
              <strong>You have not tried anything for this yet.</strong> Most women have not.
              Nobody tells you there is anything to try.
            </p>
          )}
      </div>

      <div className="block key"><p className="lead">None of it was aimed at the cause.</p></div>

      <ActionBar>
        <button type="button" className="cta" onClick={() => next()}>So what does? &rarr;</button>
      </ActionBar>
    </Screen>
  );
}

/* --------------------------------------------------------------- r4b ---- */

export function R4b() {
  const { next } = useQuiz();
  return (
    <Screen id="r4b">
      <p className="eyebrow">What does</p>
      <ScreenTitle className="rTitle">Two capsules a day.</ScreenTitle>

      <div className="shot">
        <img src={BOTTLE} alt="Hormone Focus" width={620} height={540} loading="lazy" decoding="async" />
      </div>

      <div className="badges">
        <span className="badge">{GUARANTEE_DAYS}-day guarantee</span>
        <span className="badge">No diet changes</span>
        <span className="badge">Two capsules a day</span>
      </div>

      <div className="block key">
        <p className="lead">Most hormone supplements only do half the job.</p>
        <p>They break it down. They do not carry it out. So it goes back in.</p>
        <p><strong>Hormone Focus is a 3-in-1 blend that does all three.</strong></p>
        <div className="formula">
          <div className="ing"><b>Breaks it down &mdash; <em>DIM</em></b><i>From broccoli and cabbage.</i></div>
          <div className="ing"><b>Carries it out &mdash; <em>Calcium D-Glucarate</em></b><i>So it does not come back.</i></div>
          <div className="ing"><b>Helps you absorb both &mdash; <em>BioPerine</em></b><i>From black pepper.</i></div>
        </div>
      </div>

      <Guarantee />

      <ActionBar>
        <button type="button" className="cta" onClick={() => next()}>How fast does it work? &rarr;</button>
      </ActionBar>
    </Screen>
  );
}

/* ---------------------------------------------------------------- r5 ---- */

export function R5() {
  const { next } = useQuiz();
  return (
    <Screen id="r5">
      <p className="eyebrow">You asked</p>
      <ScreenTitle className="rTitle">This is how fast it works.</ScreenTitle>

      <div className="protocol">Take two capsules a day</div>

      <div className="steps">
        <div className="step">
          <b className="n">1</b>
          <div className="t"><b>The first month</b><span>Your body needs a full cycle before it can show you anything. The first thing most women notice is <em>less bloating and water retention.</em>*</span></div>
        </div>
        <div className="step">
          <b className="n">2</b>
          <div className="t"><b>While you wait</b><span>JJ&rsquo;s Starter Guide arrives today. One thing to change a week.</span></div>
        </div>
        <div className="step">
          <b className="n">3</b>
          <div className="t"><b>Day thirty</b><span>The point most women say they can tell.</span></div>
        </div>
        <div className="step">
          <b className="n">4</b>
          <div className="t"><b>Day sixty</b><span>The guarantee is still running. It outlasts the bottle by a month, on purpose.</span></div>
        </div>
      </div>

      <p className="fine">*{FDA_DISCLAIMER}</p>

      <ActionBar>
        <button type="button" className="cta" onClick={() => next()}>Who else is doing this? &rarr;</button>
      </ActionBar>
    </Screen>
  );
}

/* ---------------------------------------------------------------- r6 ---- */

export function R6() {
  const { next } = useQuiz();
  return (
    <Screen id="r6">
      <p className="eyebrow">Who else is doing this</p>
      <ScreenTitle className="rTitle">You would be in good company.</ScreenTitle>

      {/* 800,000 is scoped to books and challenges. It is never a Hormone Focus
          customer count, and it never appears on a button. */}
      <div className="block key">
        <p className="lead">JJ&rsquo;s books and challenges have helped over 800,000 women.</p>
        <p>Hormone Focus is the one she made for what happens to your hormones.</p>
      </div>

      <div className="selfieGrid">
        {CUSTOMERS.map((src) => (
          <img key={src} src={src} alt="" width={170} height={265} loading="lazy" decoding="async" />
        ))}
      </div>
      <p className="selfieCap">Real customers, from JJ&rsquo;s own product page.</p>

      <div className="ratingBlock" style={{ marginTop: 14 }}>
        <div className="ratingBig">4.9</div>
        <div className="ratingStars"><Stars /></div>
        <p className="ratingSub">from 169 verified reviews of Hormone Focus</p>
      </div>

      <ActionBar>
        <button type="button" className="cta" onClick={() => next()}>See what it costs &rarr;</button>
      </ActionBar>
    </Screen>
  );
}

/* ---------------------------------------------------------------- r7 ---- */

export function R7() {
  const { S, angle, restart } = useQuiz();
  const outcome = stateKey(S);
  const v = VERDICT[outcome];
  const sc = score(S);
  const href = shopUrl(SHOP_BASE, outcome, angle.slug);

  return (
    <Screen id="r7">
      <p className="eyebrow">Based on your answers</p>
      <ScreenTitle className="rTitle">
        Here is where I would start you, {S.name.trim() || 'you'}.
      </ScreenTitle>
      <p className="rDeck">
        {v.name} &middot; {sc.raw} of 14 signs
        {S.sev && ` · ${SEV_PHRASE[S.sev as Severity]}`}
      </p>

      <div className="ladder">
        <div className="rung">
          <span className="rn">1</span>
          <div className="rt"><b>Your Starter Guide</b><i>Arrives today. What to change this week, before the capsules have done anything.</i></div>
          <span className="rp free">Free</span>
        </div>
        <div className="rung on">
          <span className="rn">2</span>
          <div className="rt"><b>Hormone Focus, 30 days</b><i>Two capsules a day. You change nothing else.</i></div>
          <span className="rp">{money(ONE_MONTH_PRICE)}</span>
        </div>
        <div className="rung">
          <span className="rn">3</span>
          <div className="rt"><b>Subscribe and save {SUBSCRIBE_SAVING}</b><i>It takes more than one month to know. Cancel any time.</i></div>
          <span className="rp">{money(SUBSCRIBE_PRICE)}<em>/mo</em></span>
        </div>
      </div>

      <div className="shot">
        <img src={BOTTLE} alt="Hormone Focus" width={620} height={540} loading="lazy" decoding="async" />
      </div>

      <Guarantee />

      <ActionBar>
        <a
          className="cta"
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track.checkout(outcome, ONE_MONTH_PRICE)}
        >
          Start today &mdash; {money(ONE_MONTH_PRICE)}
        </a>
      </ActionBar>

      <button type="button" className="cta ghost" onClick={restart}>Start the check again</button>

      {showInternalNotes() && (
        <div className="warn">
          <b>Internal note — not shown to customers.</b> The {SUBSCRIBE_SAVING} subscribe-and-save
          comes from JJ&rsquo;s live product page, so {money(SUBSCRIBE_PRICE)} is derived rather than
          confirmed. No 3 or 6-month bundle exists yet. The Starter Guide still has to be produced.
          The button goes to the product page carrying quiz UTMs; a prefilled Shopify checkout
          would be better and does not exist yet.
        </div>
      )}

      <p className="fine">{OFFER_DISCLAIMER}</p>
    </Screen>
  );
}
