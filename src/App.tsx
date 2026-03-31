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
        <div className="nav-links">
          <NavLink to="/" end>Bản đồ</NavLink>
          <NavLink to="/dashboard">Tổng quan</NavLink>
          {loggedIn ? (
            <button className="nav-btn" onClick={logout}>Đăng xuất</button>
          ) : (
            <button className="nav-btn" onClick={() => setShowLogin(true)}>Đăng nhập</button>
          )}
        </div>
      </nav>
      {isMapPage && (
        <div className="search-bar-row">
          <MapSearchBar locations={locations} markerRefs={markerRefs} mapRef={mapRef} />
        </div>
      )}
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
