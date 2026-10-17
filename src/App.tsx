
import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import TargetCursor from './components/TargetCursor';

const Chatbot = lazy(() => import('./components/Chatbot'));

function App() {
  return (
    <Router>
      <TargetCursor
        spinDuration={2}
        hideDefaultCursor
        parallaxOn
        thickness={3.5}
        targetSelector="a, button, .cursor-target, [role='button'], input, textarea, select"
      />
      <Navigation />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<Home />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Suspense fallback={null}>
        <Chatbot />
      </Suspense>
    </Router>
  );
}

export default App;
