import { useEffect, useState } from 'react';
import { useQuiz } from './context';
import { ArrowLeft } from '../components/icons';

export function QuizHeader() {
  const { here, back, canBack, questionStep, revealStep } = useQuiz();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="appHeader" data-scrolled={scrolled}>
      <div className="headerInner">
        <button
          type="button"
          className="backBtn"
          onClick={back}
          hidden={!canBack}
          aria-label="Go back to the previous question"
        >
          <ArrowLeft />
        </button>

        <span className="brand">Hormone Focus</span>

        {revealStep ? (
          <div className="segbar" role="progressbar"
            aria-valuenow={revealStep.index} aria-valuemin={1} aria-valuemax={revealStep.total}
            aria-label="Result progress">
            {Array.from({ length: revealStep.total }, (_, i) => (
              <i key={i} className={i < revealStep.index ? 'on' : ''} />
            ))}
          </div>
        ) : (
          <div className="progress" role="progressbar"
            aria-valuenow={questionStep?.index ?? (here === 's1' ? 0 : 100)}
            aria-valuemin={0}
            aria-valuemax={questionStep?.total ?? 100}
            aria-label="Quiz progress">
            <span style={{ width: questionStep ? `${(questionStep.index / questionStep.total) * 100}%` : '100%' }} />
          </div>
        )}

        {questionStep && (
          <span className="stepno">{questionStep.index} of {questionStep.total}</span>
        )}
      </div>
    </header>
  );
}
