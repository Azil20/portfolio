
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
    let idleId: number | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const load = () => {
      setReady(true);
      cleanup();
    };

    const cleanup = () => {
      if (timer) clearTimeout(timer);
      if (idleId && typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
        (window as any).cancelIdleCallback(idleId);
      }
      window.removeEventListener('scroll', load);
      window.removeEventListener('pointerdown', load);
      window.removeEventListener('pointermove', load);
      window.removeEventListener('touchstart', load);
      window.removeEventListener('keydown', load);
    };

    // Pre-fetch the Chatbot chunk in background right after main thread is idle
    import('./components/Chatbot');

    // Mount immediately on ANY user interaction
    window.addEventListener('scroll', load, { passive: true, once: true });
    window.addEventListener('pointerdown', load, { passive: true, once: true });
    window.addEventListener('pointermove', load, { passive: true, once: true });
    window.addEventListener('touchstart', load, { passive: true, once: true });
    window.addEventListener('keydown', load, { passive: true, once: true });

    // Fast-idle trigger: mounts smoothly right after first paint (60-120ms instead of 7.5s delay)
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      idleId = (window as any).requestIdleCallback(load, { timeout: 120 });
    } else {
      timer = setTimeout(load, 60);
    }

    return cleanup;
  }, []);

  if (!ready) {
    return (
      <div className="chatbot-container">
        <button
          type="button"
          className="chatbot-canvas-wrapper"
          onClick={() => setReady(true)}
          aria-label="Open AI Assistant"
          title="Click to chat with Med"
          style={{ 
            zIndex: 1000, 
            background: 'transparent',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <div className="chatbot-placeholder-bubble" style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.2), rgba(0,0,0,0.5))',
            backdropFilter: 'blur(8px)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}>
            <span className="status-indicator-dot pulse" style={{ position: 'absolute', top: 4, right: 4 }} />
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.9 }}>
              <path d="M12 2a8 8 0 0 0-8 8c0 1.9.6 3.7 1.8 5.1L5 21l6.1-1.8A7.95 7.95 0 0 0 12 20a8 8 0 0 0 8-8 8 8 0 0 0-8-8z" />
              <path d="M9.5 9h.01" />
              <path d="M14.5 9h.01" />
              <path d="M9.5 13a3.5 3.5 0 0 0 5 0" />
            </svg>
          </div>
        </button>
      </div>
    );
  }

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
