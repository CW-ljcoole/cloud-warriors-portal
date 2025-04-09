const handleCreateProject = async (projectData) => {
  try {
    const apiUrl = config.apiUrl;
    const response = await fetch(`${apiUrl}/api/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(projectData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const newProject = await response.json();
    
    // Fetch Zoom recordings for this project if it has meeting IDs
    if (projectData.zoomMeetingIds && projectData.zoomMeetingIds.length > 0) {
      await fetchZoomRecordings(newProject._id, projectData.zoomMeetingIds);
    }
    
    setShowForm(false);
    fetchProjects(); // Refresh the projects list
  } catch (error) {
    console.error("Error creating project:", error);
    alert("Error creating project. Please try again.");
  }
};

const fetchZoomRecordings = async (projectId, meetingIds) => {
  try {
    const apiUrl = config.apiUrl;
    
    for (const meetingId of meetingIds) {
      // Remove spaces from meeting ID
      const formattedMeetingId = meetingId.replace(/\s+/g, '');
      
      // Fetch recordings for this meeting ID
      const response = await fetch(`${apiUrl}/api/zoom/recordings/meeting/${formattedMeetingId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const recordingData = await response.json();
      
      // Check if there are recordings
      if (recordingData.recording_files && recordingData.recording_files.length > 0) {
        // Import these recordings to the project
        await fetch(`${apiUrl}/api/zoom/recordings/import/${projectId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ recordings: recordingData.recording_files }),
        });
      }
    }
    
    // Refresh projects after importing recordings
    fetchProjects();
    
  } catch (error) {
    console.error("Error fetching Zoom recordings:", error);
    alert("Error fetching Zoom recordings. Please check your Zoom integration settings.");
  }
};
