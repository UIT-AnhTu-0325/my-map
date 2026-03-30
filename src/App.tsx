import { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { MapProvider, useMapContext } from './MapContext';
import MapPage from './pages/MapPage';
import Dashboard from './pages/Dashboard';
import LoginModal from './components/LoginModal';
import MapSearchBar from './components/MapSearchBar';
import './App.css';

function NavBar() {
  const { loggedIn, logout } = useAuth();
  const { mapRef, markerRefs, locations } = useMapContext();
  const [showLogin, setShowLogin] = useState(false);
  const location = useLocation();
  const isMapPage = location.pathname === '/';

  return (
    <>
      <nav className="top-nav">
        <span className="logo">📍 MyMap</span>
        {isMapPage && (
          <MapSearchBar locations={locations} markerRefs={markerRefs} mapRef={mapRef} />
        )}
        <div className="nav-links">
          <NavLink to="/" end>Map</NavLink>
          <NavLink to="/dashboard">Dashboard</NavLink>
          {loggedIn ? (
            <button className="nav-btn" onClick={logout}>Logout</button>
          ) : (
            <button className="nav-btn" onClick={() => setShowLogin(true)}>Login</button>
          )}
        </div>
      </nav>
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MapProvider>
        <BrowserRouter>
          <NavBar />
          <Routes>
            <Route path="/" element={<MapPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </BrowserRouter>
      </MapProvider>
    </AuthProvider>
  );
}
