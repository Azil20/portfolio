
import { lazy, Suspense, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import NotFound from './pages/NotFound';

const TargetCursor = lazy(() => import('./components/TargetCursor'));
const Chatbot = lazy(() => import('./components/Chatbot'));

function DeferredChatbot() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const load = () => {
      setReady(true);
      window.removeEventListener('scroll', load);
      window.removeEventListener('pointerdown', load);
      window.removeEventListener('keydown', load);
    };

    if ('requestIdleCallback' in window) {
      const idleId = (window as any).requestIdleCallback(load, { timeout: 2000 });
      timer = setTimeout(load, 2000);
      return () => {
        (window as any).cancelIdleCallback(idleId);
        clearTimeout(timer);
        window.removeEventListener('scroll', load);
        window.removeEventListener('pointerdown', load);
        window.removeEventListener('keydown', load);
      };
    } else {
      timer = setTimeout(load, 1500);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('scroll', load);
        window.removeEventListener('pointerdown', load);
        window.removeEventListener('keydown', load);
      };
    }
  }, []);

  if (!ready) return null;

  return (
    <Suspense fallback={null}>
      <Chatbot />
    </Suspense>
  );
}

function App() {
  const [enableDesktopCursor, setEnableDesktopCursor] = useState(false);

  useEffect(() => {
    // Only load and initialize TargetCursor on devices with actual mouse / fine pointer hardware
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      setEnableDesktopCursor(true);
    }
  }, []);

  return (
    <Router>
      {enableDesktopCursor && (
        <Suspense fallback={null}>
          <TargetCursor
            spinDuration={2}
            hideDefaultCursor
            parallaxOn
            thickness={3.5}
            targetSelector="a, button, .cursor-target, [role='button'], input, textarea, select"
          />
        </Suspense>
      )}
      <Navigation />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<Home />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <DeferredChatbot />
    </Router>
  );
}

export default App;
