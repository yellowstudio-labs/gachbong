import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useWasmEngine } from './hooks/useWasmEngine';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { GamePage } from './pages/GamePage';
import { CollectionPage } from './pages/CollectionPage';
import { AboutPage } from './pages/AboutPage';
import './styles/index.css';

function App() {
  const { engine, loading, error } = useWasmEngine();

  // Loading state
  if (loading) {
    return (
      <div className="app">
        <div className="loading-container">
          <div className="loading-spinner" />
          <p className="loading-text">Đang tải engine gạch bông...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !engine) {
    return (
      <div className="app">
        <div className="loading-container">
          <p style={{ color: 'var(--danger)', fontSize: '1.2rem' }}>❌</p>
          <p className="loading-text">{error || 'Không thể tải engine'}</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="app">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage engine={engine} />} />
          <Route path="/game" element={<GamePage engine={engine} />} />
          <Route path="/collection" element={<CollectionPage engine={engine} />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
