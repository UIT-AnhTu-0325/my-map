import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import MapPage from './pages/MapPage';
import Dashboard from './pages/Dashboard';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <nav className="top-nav">
        <span className="logo">📍 MyMap</span>
        <div className="nav-links">
          <NavLink to="/" end>Map</NavLink>
          <NavLink to="/dashboard">Dashboard</NavLink>
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<MapPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
