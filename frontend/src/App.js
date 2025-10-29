import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import CarouselMenu from './components/CarouselMenu';
import TileMenu from './components/TileMenu';
import Applications from './pages/Applications';
import Users from './pages/Users';
import Maintenance from './pages/Maintenance';
import SiteProperties from './pages/SiteProperties';
import SetAdminCredentials from './components/SetAdminCredentials.js';
import Login from './components/Login';
// Layout nur für eingeloggte Nutzer
import { Outlet } from 'react-router-dom';
import './App.css';

function App() {
  const [useCarousel, setUseCarousel] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setAuthenticated(!!token);
  }, []);

  const handleLogin = () => setAuthenticated(true);
  const handleLogout = () => {
    localStorage.removeItem('token');
    setAuthenticated(false);
  };

  return (
    <Router>
      <Routes>
        {/* Öffentliche Routen */}
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/set-admin-passwort" element={<SetAdminCredentials />} />

        {/* Geschützte Routen: alles andere */}
        <Route
          path="/"
          element={
            <RequireAuth authenticated={authenticated}>
              <AppLayout
                useCarousel={useCarousel}
                setUseCarousel={setUseCarousel}
                onLogout={handleLogout}
              />
            </RequireAuth>
          }
        >
          <Route index element={<div className="menu-container">{useCarousel ? <CarouselMenu /> : <TileMenu />}</div>} />
          <Route path="applications" element={<Applications />} />
          <Route path="users" element={<Users />} />
          <Route path="maintenance" element={<Maintenance />} />
          <Route path="site-properties" element={<SiteProperties />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to={authenticated ? "/" : "/login"} replace />} />
      </Routes>
    </Router>
  );
}

/* --- Helfer-Komponenten --- */

function RequireAuth({ authenticated, children }) {
  const location = useLocation();
  if (!authenticated) {
    // wenn nicht eingeloggt → zur Login-Seite umleiten
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}


function AppLayout({ useCarousel, setUseCarousel, onLogout }) {
  return (
    <div className="app-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/" className="app-title"><h1>ApplicationManager</h1></Link>
          <button onClick={() => setUseCarousel(prev => !prev)}>
            {useCarousel ? 'Zur Kachel-Ansicht' : 'Zum Carousel'}
          </button>
        </div>
        <button onClick={onLogout}>Logout</button>
      </div>
      <Outlet />
    </div>
  );
}

export default App;
