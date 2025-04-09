import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/App.css';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Recordings from './pages/Recordings';
import Minutes from './pages/Minutes';
import Automation from './pages/Automation';
import Settings from './pages/Settings';
import ZoomIntegration from './pages/ZoomIntegration';
import Distribution from './pages/Distribution';
import Storage from './pages/Storage';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <div className="content-container">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/recordings" element={<Recordings />} />
            <Route path="/minutes" element={<Minutes />} />
            <Route path="/automation" element={<Automation />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/zoom-integration" element={<ZoomIntegration />} />
            <Route path="/distribution" element={<Distribution />} />
            <Route path="/storage" element={<Storage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
