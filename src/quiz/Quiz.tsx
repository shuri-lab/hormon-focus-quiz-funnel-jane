import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { QuizProvider } from './QuizContext';
import { useQuiz } from './context';
import { QuizHeader } from './QuizHeader';
import { angleBySlug } from '../lib/angles';
import { usePageMeta } from '../lib/usePageMeta';
import type { ScreenId } from '../lib/logic';

import { S1, S2, S3, S4, S4b, S5, S6, S7, S8, S9, S10, S11 } from './screens/questions';
import { S12, S13 } from './screens/gate';
import { R1, R2, RDoc } from './screens/reveal';
import { R4, R4b, R5, R6, R7 } from './screens/offer';

const SCREENS: Record<ScreenId, () => React.JSX.Element> = {
  s1: S1, s2: S2, s3: S3, s4: S4, s4b: S4b, s5: S5, s6: S6, s7: S7, s8: S8, s9: S9,
  s10: S10, s11: S11, s12: S12, s13: S13,
  r1: R1, r2: R2, rDoc: RDoc, r4: R4, r4b: R4b, r5: R5, r6: R6, r7: R7,
};

function Stage() {
  const { here } = useQuiz();
  const Current = SCREENS[here] ?? S1;
  return (
    <main className="appMain">
      <div className="container">
        <Current />
      </div>
    </main>
  );
}

export function Quiz() {
  const { slug } = useParams();
  const angle = angleBySlug(slug);

  usePageMeta({
    title: `The Hormone Check${angle.slug ? ` — ${angle.kicker}` : ''}`,
    description: angle.description,
    /* The quiz itself should never be indexed. The landing pages are the
       entry points and the quiz has no standalone value in search. */
    noindex: true,
  });

  useEffect(() => {
    /* A refresh mid-quiz should land at the top of whatever screen she was on. */
    window.scrollTo(0, 0);
  }, []);

  return (
    <QuizProvider angle={angle}>
      <div className="app">
        <QuizHeader />
        <Stage />
      </div>
    </QuizProvider>
  );
}
