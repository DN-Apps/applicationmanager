import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import CarouselMenu from './components/CarouselMenu';
import TileMenu from './components/TileMenu';
import Applications from './pages/Applications';
import Users from './pages/Users';
import Maintenance from './pages/Maintenance';
import SiteProperties from './pages/SiteProperties';
import Rive from './pages/InteractiveAnimation';
import Login from './components/Login';
import './App.css';

function App() {
  const [useCarousel, setUseCarousel] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setAuthenticated(!!token);
  }, []);

  const handleLogin = () => {
    setAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setAuthenticated(false);
  };

  if (!authenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="app-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link to="/" className="app-title"><h1>ApplicationManager</h1></Link>
            <button onClick={() => setUseCarousel(prev => !prev)}>
              {useCarousel ? 'Zur Kachel-Ansicht' : 'Zum Carousel'}
            </button>
          </div>
          <button onClick={handleLogout}>Logout</button>
        </div>

        <Routes>
          <Route path="/" element={<div className="menu-container">{useCarousel ? <CarouselMenu /> : <TileMenu />}</div>} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/users" element={<Users />} />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/site-properties" element={<SiteProperties />} />
          <Route path="/rive" element={<Rive />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
