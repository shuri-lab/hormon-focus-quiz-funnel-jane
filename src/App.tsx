import { useEffect, useRef } from 'react';
import {
  BrowserRouter, Navigate, Route, Routes, useLocation, useParams,
} from 'react-router-dom';
import { Landing } from './landing/Landing';
import { Quiz } from './quiz/Quiz';
import { OfferPage } from './offer/OfferPage';
import { ANGLES, OFFER_ANGLES } from './lib/angles';
import { captureAttribution, initClarity, pageView } from './lib/analytics';

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
    /* Read the ad parameters once, before any navigation can strip them. */
    captureAttribution();
    /* Injects Clarity once. VITE_CLARITY_ID overrides the committed project. */
    initClarity();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/quiz" element={<Quiz />} />
        {/* The offer, on our own host. A static segment outranks /:slug in the
            router, so these are matched before the landing pages whatever
            order they are written in. */}
        <Route path="/offer" element={<OfferPage />} />
        <Route path="/offer/:slug" element={<KnownOffer><OfferPage /></KnownOffer>} />
        <Route path="/live" element={<OfferPage live />} />
        <Route path="/:slug" element={<KnownAngle><Landing /></KnownAngle>} />
        <Route path="/:slug/quiz" element={<KnownAngle><Quiz /></KnownAngle>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <RouteTracking />
    </BrowserRouter>
  );
}
