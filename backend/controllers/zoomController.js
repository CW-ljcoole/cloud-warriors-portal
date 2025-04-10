// Get recordings for a specific meeting
exports.getZoomRecordingsByMeetingId = async (req, res) => {
  try {
    const { meetingId } = req.params;
    console.log(`Fetching recordings for meeting ID: ${meetingId}`);
    
    // Get OAuth token
    const token = await getZoomToken();
    
    try {
      // Get recordings
      const response = await axios.get(`https://api.zoom.us/v2/meetings/${meetingId}/recordings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }) ;
      
      res.json(response.data);
    } catch (apiError) {
      // Handle specific Zoom API errors
      console.error('Zoom API Error:', apiError.response ? apiError.response.data : apiError.message);
      
      // If the meeting doesn't exist or has no recordings
      if (apiError.response && apiError.response.status === 404) {
        return res.json({ recording_files: [] }); // Return empty recordings array
      }
      
      // For other errors, return the error details
      res.status(apiError.response ? apiError.response.status : 500).json({ 
        message: 'Error fetching Zoom recordings', 
        error: apiError.message,
        details: apiError.response ? apiError.response.data : 'No additional details'
      });
    }
  } catch (err) {
    console.error('Error in Zoom token generation:', err);
    res.status(500).json({ message: 'Error fetching Zoom recordings', error: err.message });
  }
};
