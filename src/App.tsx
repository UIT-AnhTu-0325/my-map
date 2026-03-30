import { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import MapPage from './pages/MapPage';
import Dashboard from './pages/Dashboard';
import LoginModal from './components/LoginModal';
import './App.css';

function NavBar() {
  const { loggedIn, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      <nav className="top-nav">
        <span className="logo">📍 MyMap</span>
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
      <BrowserRouter>
        <NavBar />
        <Routes>
          <Route path="/" element={<MapPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
