const axios = require('axios');
const Project = require('../models/Project'); // Ensure this is defined
const Recording = require('../models/Recording'); // Ensure this is defined

// Connect to Zoom API
exports.connectZoom = async (req, res) => {
  try {
    const { apiKey, apiSecret, accountId } = req.body;

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

    const apiKey = process.env.ZOOM_API_KEY;
    const apiSecret = process.env.ZOOM_API_SECRET;
    const accountId = process.env.ZOOM_ACCOUNT_ID;

    if (!apiKey || !apiSecret || !accountId) {
      return res.status(400).json({ message: 'Zoom credentials not configured' });
    }

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

    for (const rec of recordings) {
      const existingRecording = await Recording.findOne({ zoomId: rec.id });
      if (existingRecording) {
        importedRecordings.push(existingRecording);
        continue;
      }

      const newRecording = new Recording({
        projectId,
        name: rec.topic || 'Untitled Recording',
        date: new Date(),
        duration: rec.duration ? `${Math.floor(rec.duration / 60)}:${String(rec.duration % 60).padStart(2, '0')}` : 'Unknown',
        zoomId: rec.id,
        url: rec.play_url || rec.download_url,
        size: rec.file_size ? `${Math.round(rec.file_size / (1024 * 1024))} MB` : 'Unknown'
      });

      const savedRecording = await newRecording.save();
      importedRecordings.push(savedRecording);
    }

    res.json(importedRecordings);
  } catch (err) {
    console.error('Error importing recordings to project:', err);
    res.status(500).json({ message: 'Error importing recordings', error: err.message });
  }
};

// Get all Zoom recordings
exports.getZoomRecordings = async (req, res) => {
  try {
    const apiKey = process.env.ZOOM_API_KEY;
    const apiSecret = process.env.ZOOM_API_SECRET;
    const accountId = process.env.ZOOM_ACCOUNT_ID;

    if (!apiKey || !apiSecret || !accountId) {
      return res.status(400).json({ message: 'Zoom credentials not configured' });
    }

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

    // Get user's recordings (adjust this endpoint as needed)
    const response = await axios.get('https://api.zoom.us/v2/users/me/recordings', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      params: {
        from: new Date(Date.now()  - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Last 30 days
        to: new Date().toISOString().split('T')[0]
      }
    });

    res.json(response.data);
  } catch (err) {
    console.error('Error fetching Zoom recordings:', err);
    res.status(500).json({ message: 'Error fetching Zoom recordings', error: err.message });
  }
};

// Import Zoom recordings
exports.importZoomRecordings = async (req, res) => {
  try {
    const { recordings, projectId } = req.body;

    if (!recordings || !projectId) {
      return res.status(400).json({ message: 'Recordings and projectId are required' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const importedRecordings = [];

    for (const rec of recordings) {
      const existingRecording = await Recording.findOne({ zoomId: rec.id });
      if (existingRecording) {
        importedRecordings.push(existingRecording);
        continue;
      }

      const newRecording = new Recording({
        projectId,
        name: rec.topic || 'Untitled Recording',
        date: new Date(rec.start_time) || new Date(),
        duration: rec.duration ? `${Math.floor(rec.duration / 60)}:${String(rec.duration % 60).padStart(2, '0')}` : 'Unknown',
        zoomId: rec.id,
        url: rec.play_url || rec.download_url,
        size: rec.file_size ? `${Math.round(rec.file_size / (1024 * 1024))} MB` : 'Unknown'
      });

      const savedRecording = await newRecording.save();
      importedRecordings.push(savedRecording);
    }

    res.json(importedRecordings);
  } catch (err) {
    console.error('Error importing Zoom recordings:', err);
    res.status(500).json({ message: 'Error importing Zoom recordings', error: err.message });
  }
};

// Disconnect Zoom account
exports.disconnectZoomAccount = async (req, res) => {
  try {
    // In a real implementation, you would remove the user's Zoom credentials from your database
    // For this demo, we'll just clear the environment variables
    delete process.env.ZOOM_API_KEY;
    delete process.env.ZOOM_API_SECRET;
    delete process.env.ZOOM_ACCOUNT_ID;

    res.json({ success: true, message: 'Zoom account disconnected successfully' });
  } catch (err) {
    console.error('Error disconnecting Zoom account:', err);
    res.status(500).json({ message: 'Error disconnecting Zoom account', error: err.message });
  }
};

