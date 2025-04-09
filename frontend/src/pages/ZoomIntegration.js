import React, { useState } from 'react';
import '../styles/ZoomIntegration.css';
import config from '../config';

const ZoomIntegration = () => {
  const [zoomCredentials, setZoomCredentials] = useState({
    apiKey: '',
    apiSecret: '',
    accountId: ''
  });
  const [connected, setConnected] = useState(false);

  const handleChange = (e) => {
    setZoomCredentials({
      ...zoomCredentials,
      [e.target.name]: e.target.value
    });
  };

  const handleConnect = async (e) => {
    e.preventDefault();
    
    try {
      // Mock API call
      // const apiUrl = config.apiUrl;
      // const response = await fetch(`${apiUrl}/api/users/zoom-connect`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(zoomCredentials),
      // });

      // if (!response.ok) throw new Error('Failed to connect to Zoom');

      setConnected(true);
      alert('Successfully connected to Zoom! You can now add Zoom Meeting IDs to your projects.');
    } catch (error) {
      console.error('Error connecting to Zoom:', error);
      alert('Failed to connect to Zoom. Please check your credentials and try again.');
    }
  };

  return (
    <div className="zoom-integration-container">
      <h1>Zoom Integration</h1>
      
      {connected ? (
        <div className="zoom-connected">
          <div className="success-icon">✓</div>
          <h2>Connected to Zoom</h2>
          <p>Your Zoom account is successfully connected. You can now add Zoom Meeting IDs to your projects to automatically fetch recordings.</p>
          <button 
            className="disconnect-btn"
            onClick={() => setConnected(false)}
          >
            Disconnect
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
                type="password"
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
              <li>Choose "JWT" as the app type</li>
              <li>Fill in the required information and create your app</li>
              <li>Copy the API Key, API Secret, and Account ID provided</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};

export default ZoomIntegration;
