const axios = require('axios');
const User = require('../models/User');
const Recording = require('../models/Recording');

// Get Zoom recordings
exports.getZoomRecordings = async (req, res) => {
  try {
    const { userId, from, to } = req.query;
    
    // Get user with Zoom credentials
    const user = await User.findById(userId);
    if (!user || !user.zoomIntegration.connected) {
      return res.status(400).json({ message: 'User does not have Zoom integration configured' });
    }
    
    // Prepare Zoom API request
    const zoomApiUrl = `${process.env.ZOOM_API_BASE_URL}/users/me/recordings`;
    const params = {};
    if (from) params.from = from;
    if (to) params.to = to;
    
    // Create Zoom JWT token
    const token = Buffer.from(`${user.zoomIntegration.apiKey}:${user.zoomIntegration.apiSecret}`).toString('base64');
    
    // Make request to Zoom API
    const response = await axios.get(zoomApiUrl, {
      params,
      headers: {
        'Authorization': `Basic ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    res.json(response.data);
  } catch (err) {
    console.error('Zoom API Error:', err.response ? err.response.data : err.message);
    res.status(500).json({ 
      message: 'Error fetching Zoom recordings',
      error: err.response ? err.response.data : err.message
    });
  }
};

// Import Zoom recordings to project
exports.importZoomRecordings = async (req, res) => {
  try {
    const { projectId, recordings } = req.body;
    
    if (!Array.isArray(recordings) || recordings.length === 0) {
      return res.status(400).json({ message: 'No recordings provided' });
    }
    
    const importedRecordings = [];
    
    // Process each recording
    for (const recording of recordings) {
      // Check if recording already exists
      const existingRecording = await Recording.findOne({ zoomId: recording.id });
      
      if (!existingRecording) {
        // Create new recording
        const newRecording = new Recording({
          projectId,
          name: recording.topic || 'Zoom Meeting',
          date: new Date(recording.start_time),
          duration: recording.duration ? `${Math.floor(recording.duration / 60)}:${recording.duration % 60}` : '0:00',
          zoomId: recording.id,
          url: recording.share_url || recording.recording_files[0]?.download_url,
          size: recording.total_size ? `${Math.round(recording.total_size / 1024 / 1024)} MB` : 'Unknown',
          processed: false,
          minutesGenerated: false
        });
        
        const savedRecording = await newRecording.save();
        importedRecordings.push(savedRecording);
      }
    }
    
    res.json({
      message: `Imported ${importedRecordings.length} recordings`,
      recordings: importedRecordings
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Connect Zoom account
exports.connectZoomAccount = async (req, res) => {
  try {
    const { userId, apiKey, apiSecret } = req.body;
    
    // Validate input
    if (!apiKey || !apiSecret) {
      return res.status(400).json({ message: 'API Key and API Secret are required' });
    }
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Test Zoom credentials
    try {
      const zoomApiUrl = `${process.env.ZOOM_API_BASE_URL}/users/me`;
      const token = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
      
      await axios.get(zoomApiUrl, {
        headers: {
          'Authorization': `Basic ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Update user with Zoom credentials
      user.zoomIntegration = {
        apiKey,
        apiSecret,
        connected: true
      };
      
      await user.save();
      
      res.json({
        message: 'Zoom account connected successfully',
        connected: true
      });
    } catch (zoomErr) {
      console.error('Zoom API Error:', zoomErr.response ? zoomErr.response.data : zoomErr.message);
      return res.status(400).json({ 
        message: 'Invalid Zoom credentials',
        error: zoomErr.response ? zoomErr.response.data : zoomErr.message
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Disconnect Zoom account
exports.disconnectZoomAccount = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update user to disconnect Zoom
    user.zoomIntegration = {
      apiKey: '',
      apiSecret: '',
      connected: false
    };
    
    await user.save();
    
    res.json({
      message: 'Zoom account disconnected successfully',
      connected: false
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
