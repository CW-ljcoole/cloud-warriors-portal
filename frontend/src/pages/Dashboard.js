// Helper function outside the component to avoid hooks-related issues
const fetchZoomRecordingsHelper = async (apiUrl, projectId, meetingIds, refreshCallback) => {
  try {
    let recordingsFetched = false;
    
    for (const meetingId of meetingIds) {
      // Remove spaces from meeting ID
      const formattedMeetingId = meetingId.replace(/\s+/g, '');
      console.log(`Attempting to fetch recordings for meeting ID: ${formattedMeetingId}`);
      
      try {
        // Fetch recordings for this meeting ID
        const response = await fetch(`${apiUrl}/api/zoom/recordings/meeting/${formattedMeetingId}`);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Error response from API for meeting ${formattedMeetingId}:`, errorText);
          continue; // Skip this meeting ID and try the next one
        }
        
        const recordingData = await response.json();
        console.log(`Recording data received for meeting ${formattedMeetingId}:`, recordingData);
        
        // Check if there are recordings
        if (recordingData.recording_files && recordingData.recording_files.length > 0) {
          console.log(`Found ${recordingData.recording_files.length} recordings for meeting ${formattedMeetingId}`);
          recordingsFetched = true;
          
          // Import these recordings to the project
          try {
            const importResponse = await fetch(`${apiUrl}/api/zoom/recordings/import/${projectId}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ recordings: recordingData.recording_files }),
            });
            
            if (!importResponse.ok) {
              console.error(`Error importing recordings for meeting ${formattedMeetingId}`);
            } else {
              console.log(`Successfully imported recordings for meeting ${formattedMeetingId}`);
            }
          } catch (importError) {
            console.error(`Error during import for meeting ${formattedMeetingId}:`, importError);
          }
        } else {
          console.log(`No recordings found for meeting ${formattedMeetingId}`);
        }
      } catch (meetingError) {
        console.error(`Error processing meeting ID ${formattedMeetingId}:`, meetingError);
        // Continue with other meeting IDs
      }
    }
    
    // Refresh projects after importing recordings
    if (refreshCallback) refreshCallback();
    
    // Only show alert if no recordings were fetched from any meeting
    if (!recordingsFetched) {
      console.log("No recordings found for any of the provided meeting IDs");
      alert("No recordings found for the provided Zoom Meeting IDs. Please verify that these meetings have recordings available.");
    }
    
  } catch (error) {
    console.error("Error fetching Zoom recordings:", error);
    alert("Error fetching Zoom recordings. Please check your Zoom integration settings.");
  }
};

