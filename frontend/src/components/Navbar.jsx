import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="navbar" id="main-navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="navbar-logo">◈</span>
          <span className="navbar-title">DevPulse</span>
        </Link>
        <div className="navbar-links">
          <Link
            to="/"
            className={`navbar-link ${location.pathname === '/' ? 'active' : ''}`}
            id="nav-developers"
          >
            Developers
          </Link>
          <Link
            to="/manager"
            className={`navbar-link ${location.pathname === '/manager' ? 'active' : ''}`}
            id="nav-manager"
          >
            Manager View
          </Link>
        </div>
      </div>
    </nav>
  );
}
