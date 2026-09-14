import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom';
import { Landing } from './landing/Landing';
import { Quiz } from './quiz/Quiz';
import { ANGLES } from './lib/angles';
import { captureAttribution } from './lib/analytics';

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
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/:slug" element={<KnownAngle><Landing /></KnownAngle>} />
        <Route path="/:slug/quiz" element={<KnownAngle><Quiz /></KnownAngle>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
