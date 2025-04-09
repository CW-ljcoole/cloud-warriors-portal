const axios = require('axios');
const Project = require('../models/Project');
const Recording = require('../models/Recording');
const ZoomSettings = require('../models/ZoomSettings');

// Connect to Zoom API
exports.connectZoom = async (req, res) => {
  try {
    const { apiKey, apiSecret, accountId } = req.body;

    try {
      // Test the credentials
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
        // Credentials are valid, save them to database
        // First, check if settings already exist
        let settings = await ZoomSettings.findOne();
        
        if (settings) {
          // Update existing settings
          settings.apiKey = apiKey;
          settings.apiSecret = apiSecret;
          settings.accountId = accountId;
          await settings.save();
        } else {
          // Create new settings
          settings = new ZoomSettings({
            apiKey,
            apiSecret,
            accountId
          });
          await settings.save();
        }

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

// Get Zoom OAuth token
const getZoomToken = async () => {
  try {
    // Get credentials from database
    const settings = await ZoomSettings.findOne();
    
    if (!settings) {
      throw new Error('Zoom credentials not configured');
    }
    
    const { apiKey, apiSecret, accountId } = settings;
    
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
    
    return tokenResponse.data.access_token;
  } catch (error) {
    console.error('Error getting Zoom token:', error);
    throw error;
  }
};

// Get Zoom recordings
exports.getZoomRecordings = async (req, res) => {
  try {
    // Get OAuth token
    const token = await getZoomToken();
    
    // Get recordings
    const response = await axios.get('https://api.zoom.us/v2/users/me/recordings', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }) ;
    
    res.json(response.data);
  } catch (err) {
    console.error('Error fetching Zoom recordings:', err);
    res.status(500).json({ message: 'Error fetching Zoom recordings', error: err.message });
  }
};

// Get recordings for a specific meeting
exports.getZoomRecordingsByMeetingId = async (req, res) => {
  try {
    const { meetingId } = req.params;
    
    // Get OAuth token
    const token = await getZoomToken();
    
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

// Import Zoom recordings to project
exports.importZoomRecordings = async (req, res) => {
  try {
    const { projectId, recordings } = req.body;
    
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    const importedRecordings = [];
    
    for (const recording of recordings) {
      const newRecording = new Recording({
        projectId,
        name: recording.topic || 'Zoom Recording',
        date: new Date(recording.start_time),
        duration: `${Math.floor(recording.duration / 60)}:${String(recording.duration % 60).padStart(2, '0')}`,
        zoomId: recording.id,
        url: recording.share_url || recording.download_url,
        size: recording.total_size ? `${Math.round(recording.total_size / (1024 * 1024))} MB` : 'Unknown'
      });
      
      await newRecording.save();
      importedRecordings.push(newRecording);
    }
    
    res.json(importedRecordings);
  } catch (err) {
    console.error('Error importing Zoom recordings:', err);
    res.status(500).json({ message: 'Error importing Zoom recordings', error: err.message });
  }
};

// Import recordings to a project
exports.importRecordingsToProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { recordings } = req.body;
    
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    const importedRecordings = [];
    
    for (const recording of recordings) {
      const newRecording = new Recording({
        projectId,
        name: recording.recording_type || 'Zoom Recording',
        date: new Date(recording.recording_start),
        duration: recording.duration || '0:00',
        zoomId: recording.id,
        url: recording.play_url || recording.download_url,
        size: recording.file_size ? `${Math.round(recording.file_size / (1024 * 1024))} MB` : 'Unknown'
      });
      
      await newRecording.save();
      importedRecordings.push(newRecording);
    }
    
    res.json(importedRecordings);
  } catch (err) {
    console.error('Error importing recordings to project:', err);
    res.status(500).json({ message: 'Error importing recordings', error: err.message });
  }
};

// Disconnect Zoom account
exports.disconnectZoomAccount = async (req, res) => {
  try {
    // Remove Zoom settings from database
    await ZoomSettings.deleteMany({});
    
    res.json({ success: true, message: 'Zoom account disconnected successfully' });
  } catch (err) {
    console.error('Error disconnecting Zoom account:', err);
    res.status(500).json({ message: 'Error disconnecting Zoom account', error: err.message });
  }
};

// Check Zoom connection status
exports.getZoomStatus = async (req, res) => {
  try {
    const settings = await ZoomSettings.findOne();
    res.json({ connected: !!settings });
  } catch (err) {
    console.error('Error checking Zoom status:', err);
    res.status(500).json({ message: 'Error checking Zoom status', error: err.message });
  }
};
