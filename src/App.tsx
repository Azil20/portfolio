
import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import AdvancedCursor from './components/AdvancedCursor';

const Chatbot = lazy(() => import('./components/Chatbot'));

function App() {
  return (
    <Router>
      <AdvancedCursor />
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
