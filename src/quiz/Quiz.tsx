import { useEffect } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { QuizProvider } from './QuizContext';
import { useQuiz } from './context';
import { QuizHeader } from './QuizHeader';
import { angleBySlug } from '../lib/angles';
import { usePageMeta } from '../lib/usePageMeta';
import type { ScreenId } from '../lib/logic';
import { FIRST_STEP, STEP_SLUG, screenFromSlug } from './steps';

import { Q1, Q2, Q3, Q4, Q4b, Q5, Q6, Q7 } from './screens/questions';
import { Load, Gate } from './screens/gate';
import { R1, RDoc } from './screens/reveal';
import { R2 } from './screens/offer';

const SCREENS: Record<ScreenId, () => React.JSX.Element> = {
  q1: Q1, q2: Q2, q3: Q3, q4: Q4, q4b: Q4b, q5: Q5, q6: Q6, q7: Q7,
  load: Load, gate: Gate,
  r1: R1, r2: R2, rDoc: RDoc,
};

function Stage() {
  const { here } = useQuiz();
  const Current = SCREENS[here] ?? Q1;
  return (
    <main className="appMain">
      <div className="container">
        <Current />
      </div>
    </main>
  );
}

export function Quiz() {
  const { slug, step } = useParams();

  /* A step we do not have is a mistyped or stale link. Send her to the first
     question rather than rendering it under an address that means nothing —
     a URL people can share is only useful if a wrong one is obvious. */
  if (step && !screenFromSlug(step)) {
    const base = slug ? `/${slug}` : '';
    return <Navigate to={`${base}/quiz/${STEP_SLUG[FIRST_STEP]}`} replace />;
  }

  const angle = angleBySlug(slug);

  usePageMeta({
    title: `The Hormone Check${angle.slug ? ` — ${angle.label}` : ''}`,
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
