/* DIRECTION 2, 11 November 2026 (local mock). Two short screens between her
 * last answer and the plan being built. Both are made only of what the live
 * quiz already uses: Screen, ScreenTitle, the eyebrow, the figure and the
 * key block from the cut screens, the review card from the offer page, and
 * the ActionBar with its Continue button.
 */
import { useQuiz } from '../context';
import { Screen, ScreenTitle, ActionBar } from '../../components/Screen';
import {
  STAT_BODY, STAT_EYEBROW, STAT_LINE, STAT_SOURCE, STAT_TITLE,
} from '../../lib/resultCopy';

/* not-just-you: relief, not alone, before she is asked for anything more.
   The cut screens' plain layout: eyebrow, title, deck, the key block, the
   fine-print line, Continue. No photo. */
export function NotJustYou() {
  const { next } = useQuiz();
  return (
    <Screen id="stat">
      <p className="blabel">{STAT_EYEBROW}</p>
      <ScreenTitle className="rTitle">{STAT_TITLE}</ScreenTitle>
      <p className="rDeck">{STAT_BODY}</p>
      <div className="block key">
        <p className="lead">{STAT_LINE}</p>
      </div>
      <p className="fine">{STAT_SOURCE}</p>
      <ActionBar>
        <button type="button" className="cta" onClick={() => next()}>Continue</button>
      </ActionBar>
    </Screen>
  );
}
