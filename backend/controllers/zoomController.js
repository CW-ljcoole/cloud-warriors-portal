// Connect to Zoom API
exports.connectZoom = async (req, res) => {
  try {
    const { apiKey, apiSecret, accountId } = req.body;
    
    // Test the credentials by trying to get an OAuth token
    try {
      const tokenResponse = await axios.post('https://zoom.us/oauth/token', null, {
        params: {
          grant_type: 'account_credentials',
          account_id: accountId
        },
        headers: {
          'Authorization': `Basic ${Buffer.from(`${apiKey}:${apiSecret}`) .toString('base64')}`
        }
      });
      
      if (tokenResponse.data && tokenResponse.data.access_token) {
        // Credentials are valid, save them
        // For demo purposes, we'll just return success
        // In a real app, you would save these to a database
        
        // Create a global config or environment variables
        process.env.ZOOM_API_KEY = apiKey;
        process.env.ZOOM_API_SECRET = apiSecret;
        process.env.ZOOM_ACCOUNT_ID = accountId;
        
        res.json({ success: true, message: 'Zoom credentials saved successfully' });
      } else {
        res.status(400).json({ success: false, message: 'Invalid Zoom credentials' });
      }
    } catch (error) {
      console.error('Error testing Zoom credentials:', error);
      res.status(400).json({ success: false, message: 'Invalid Zoom credentials', error: error.message });
    }
  } catch (err) {
    console.error('Error connecting to Zoom:', err);
    res.status(500).json({ success: false, message: 'Error connecting to Zoom', error: err.message });
  }
};

// Get recordings for a specific meeting
exports.getZoomRecordingsByMeetingId = async (req, res) => {
  try {
    const { meetingId } = req.params;
    
    // Get credentials from environment variables
    const apiKey = process.env.ZOOM_API_KEY;
    const apiSecret = process.env.ZOOM_API_SECRET;
    const accountId = process.env.ZOOM_ACCOUNT_ID;
    
    if (!apiKey || !apiSecret || !accountId) {
      return res.status(400).json({ message: 'Zoom credentials not configured' });
    }
    
    // Get OAuth token
    const tokenResponse = await axios.post('https://zoom.us/oauth/token', null, {
      params: {
        grant_type: 'account_credentials',
        account_id: accountId
      },
      headers: {
        'Authorization': `Basic ${Buffer.from(`${apiKey}:${apiSecret}`) .toString('base64')}`
      }
    });
    
    const token = tokenResponse.data.access_token;
    
    // Get recordings
    const response = await axios.get(`https://api.zoom.us/v2/meetings/${meetingId}/recordings`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }) ;
    
    res.json(response.data);
  } catch (err) {
    console.error('Error fetching Zoom recordings for meeting:', err);
    res.status(500).json({ message: 'Error fetching Zoom recordings', error: err.message });
  }
};
