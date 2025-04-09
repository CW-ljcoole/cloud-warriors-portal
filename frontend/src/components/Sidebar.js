import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  
  return (
    <div className="sidebar">
      <div className="logo-container">
        <h2>Cloud Warriors</h2>
        <p>PM Portal</p>
      </div>
      <nav className="sidebar-nav">
        <ul>
          <li className={location.pathname === '/' ? 'active' : ''}>
            <Link to="/">Dashboard</Link>
          </li>
          <li className={location.pathname === '/recordings' ? 'active' : ''}>
            <Link to="/recordings">Recordings</Link>
          </li>
          <li className={location.pathname === '/minutes' ? 'active' : ''}>
            <Link to="/minutes">Meeting Minutes</Link>
          </li>
          <li className={location.pathname === '/zoom-integration' ? 'active' : ''}>
            <Link to="/zoom-integration">Zoom Integration</Link>
          </li>
          <li className={location.pathname === '/distribution' ? 'active' : ''}>
            <Link to="/distribution">Distribution</Link>
          </li>
          <li className={location.pathname === '/storage' ? 'active' : ''}>
            <Link to="/storage">Storage</Link>
          </li>
          <li className={location.pathname === '/automation' ? 'active' : ''}>
            <Link to="/automation">Automation</Link>
          </li>
          <li className={location.pathname === '/settings' ? 'active' : ''}>
            <Link to="/settings">Settings</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
