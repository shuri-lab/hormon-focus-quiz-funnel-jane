import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import {
  BrowserRouter, MemoryRouter, Navigate, Route, Routes, useLocation, useParams,
} from 'react-router-dom';
import { Landing } from './landing/Landing';
import { Quiz } from './quiz/Quiz';
import { OfferPage } from './offer/OfferPage';
import { PlanPage } from './offer/PlanPage';
import { ANGLES, OFFER_ANGLES } from './lib/angles';
import { initClarity, pageView } from './lib/analytics';
import { REVIEW } from './review/review';

/* The review build only. With the flag off this is null, the import below is
   dead code, and none of it reaches a customer. */
const ReviewBar = REVIEW ? lazy(() => import('./review/ReviewBar')) : null;

/* A shared review page has no address bar of its own to route on, so it keeps
   its place in memory instead. */
const Router = REVIEW ? MemoryRouter : BrowserRouter;

/**
 * Tells GTM about client-side navigations, which it cannot see on its own.
 *
 * Rendered AFTER <Routes> on purpose. React runs effects in tree order, so
 * this sits downstream of the route's own usePageMeta effect and therefore
 * reads the title that route just set, rather than the previous one.
 *
 * The ref guards the push: StrictMode double-invokes effects in development,
 * and a re-render with an unchanged path must not count as a second view.
 */
function RouteTracking() {
  const location = useLocation();
  const last = useRef<string | null>(null);

  useEffect(() => {
    const path = location.pathname + location.search;
    if (last.current === path) return;
    last.current = path;
    pageView(path, document.title);
  }, [location]);

  return null;
}

/** An offer slug we do not sell against falls back to the master offer page. */
function KnownOffer({ children }: { children: React.JSX.Element }) {
  const { slug } = useParams();
  const known = OFFER_ANGLES.some((a) => a.slug && a.slug === slug);
  return known ? children : <Navigate to="/offer" replace />;
}

/** An unknown slug is a bad ad link. Send her to the default page, not a 404. */
function KnownAngle({ children }: { children: React.JSX.Element }) {
  const { slug } = useParams();
  const known = ANGLES.some((a) => a.slug && a.slug === slug);
  return known ? children : <Navigate to="/" replace />;
}

export default function App() {
  useEffect(() => {
    /* Attribution is captured in main.tsx, before the first render, because
       the cart links are built during render and an effect is too late. */
    /* Injects Clarity once. VITE_CLARITY_ID overrides the committed project. */
    if (!REVIEW) initClarity();
  }, []);

  /* Bumped by the review bar, so a jump starts the quiz again from its answers. */
  const [epoch, setEpoch] = useState(0);

  return (
    <Router>
      {ReviewBar && (
        <Suspense fallback={null}>
          <ReviewBar onJump={() => setEpoch((n) => n + 1)} />
        </Suspense>
      )}
      <Routes key={epoch}>
        <Route path="/" element={<Landing />} />
        <Route path="/quiz" element={<Quiz />} />
        {/* The offer, on our own host. A static segment outranks /:slug in the
            router, so these are matched before the landing pages whatever
            order they are written in. */}
        <Route path="/offer" element={<OfferPage />} />
        <Route path="/offer/:slug" element={<KnownOffer><OfferPage /></KnownOffer>} />
        <Route path="/live" element={<OfferPage live />} />
        {/* Her Starter Guide. The archetype is validated inside the page, and
            anything we did not write a plan for goes to the front door. */}
        <Route path="/plan/:archetype" element={<PlanPage />} />
        <Route path="/:slug" element={<KnownAngle><Landing /></KnownAngle>} />
        <Route path="/:slug/quiz" element={<KnownAngle><Quiz /></KnownAngle>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <RouteTracking />
    </Router>
  );
}
