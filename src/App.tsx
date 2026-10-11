
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Chatbot from './components/Chatbot';
import Home from './pages/Home';

function App() {
  return (
    <Router>
      <Navigation />
      <Routes>
        <Route path="/" element={<Home />} />
        {/* We can route /about to Home for now or create a separate page. Since Home already has the 'about' sections, I'll use it for both for simplicity, or we can just scroll down. */}
        <Route path="/about" element={<Home />} />
      </Routes>
      <Chatbot />
    </Router>
  );
}

export default App;
