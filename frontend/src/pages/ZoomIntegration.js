import React, { useState, useEffect } from 'react';
import '../styles/ZoomIntegration.css';
import config from '../config';

const ZoomIntegration = () => {
  const [zoomCredentials, setZoomCredentials] = useState({
    apiKey: '',
    apiSecret: '',
    accountId: ''
  });
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Check if Zoom is already connected
    const checkZoomConnection = async () => {
      try {
        const apiUrl = config.apiUrl;
        const response = await fetch(`${apiUrl}/api/zoom/status`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.connected) {
            setConnected(true);
          }
        }
      } catch (error) {
        console.error('Error checking Zoom connection:', error);
      }
    };
    
    checkZoomConnection();
  }, []);

  const handleChange = (e) => {
    setZoomCredentials({
      ...zoomCredentials,
      [e.target.name]: e.target.value
    });
  };

  const handleConnect = async (e) => {
    e.preventDefault();
    
    try {
      const apiUrl = config.apiUrl;
      const response = await fetch(`${apiUrl}/api/zoom/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(zoomCredentials),
      });
      
      if (!response.ok) throw new Error('Failed to connect to Zoom');
      
      const data = await response.json();
      setConnected(true);
      alert('Successfully connected to Zoom! You can now add Zoom Meeting IDs to your projects.');
    } catch (error) {
      console.error('Error connecting to Zoom:', error);
      alert('Failed to connect to Zoom. Please check your credentials and try again.');
    }
  };

  const handleDisconnect = async () => {
    try {
      const apiUrl = config.apiUrl;
      const response = await fetch(`${apiUrl}/api/zoom/disconnect/1`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to disconnect Zoom');
      
      setConnected(false);
      alert('Successfully disconnected Zoom account.');
    } catch (error) {
      console.error('Error disconnecting Zoom:', error);
      alert('Failed to disconnect Zoom. Please try again.');
    }
  };

  return (
    <div className="zoom-integration-container">
      <h1>Zoom Integration</h1>
      
      {connected ? (
        <div className="zoom-connected">
          <div className="success-icon">✓</div>
          <h2>Your Zoom account is connected!</h2>
          <p>You can now add Zoom Meeting IDs to your projects to automatically fetch recordings.</p>
          <button className="disconnect-btn" onClick={handleDisconnect}>
            Disconnect Zoom
          </button>
        </div>
      ) : (
        <div className="zoom-connect-form">
          <p>Connect your Zoom account to automatically fetch recordings for your projects.</p>
          
          <form onSubmit={handleConnect}>
            <div className="form-group">
              <label htmlFor="apiKey">Zoom API Key</label>
              <input
                type="text"
                id="apiKey"
                name="apiKey"
                value={zoomCredentials.apiKey}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="apiSecret">Zoom API Secret</label>
              <input
                type="text"
                id="apiSecret"
                name="apiSecret"
                value={zoomCredentials.apiSecret}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="accountId">Zoom Account ID</label>
              <input
                type="text"
                id="accountId"
                name="accountId"
                value={zoomCredentials.accountId}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-actions">
              <button type="submit" className="connect-btn">
                Connect to Zoom
              </button>
            </div>
          </form>
          
          <div className="zoom-instructions">
            <h3>How to get your Zoom API credentials:</h3>
            <ol>
              <li>Log in to the <a href="https://marketplace.zoom.us/" target="_blank" rel="noopener noreferrer">Zoom App Marketplace</a></li>
              <li>Click on "Develop" in the top-right corner and select "Build App"</li>
              <li>Choose "Server-to-Server OAuth" as the app type</li>
              <li>Fill in the required information and create your app</li>
              <li>Copy the API Key (Client ID) , API Secret (Client Secret), and Account ID provided</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};

export default ZoomIntegration;
