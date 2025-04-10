import React, { useState, useEffect } from 'react';
import '../styles/Projects.css';
import ProjectFolder from '../components/ProjectFolder';
import ProjectForm from '../components/ProjectForm';
import config from '../config';

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

// Your Dashboard component
const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const apiUrl = config.apiUrl;
      const response = await fetch(`${apiUrl}/api/projects`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setProjects(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching projects:", error);
      setError("Failed to load projects. Please try again later.");
      setLoading(false);
    }
  };

  const handleCreateProject = async (projectData) => {
    try {
      const apiUrl = config.apiUrl;
      const response = await fetch(`${apiUrl}/api/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const newProject = await response.json();
      setProjects([...projects, newProject]);
      setShowForm(false);
      
      // Fetch recordings for this project's Zoom Meeting IDs
      if (projectData.zoomMeetingIds && projectData.zoomMeetingIds.length > 0) {
        // Use the helper function instead of defining the async function inside the component
        fetchZoomRecordingsHelper(config.apiUrl, newProject._id, projectData.zoomMeetingIds, fetchProjects);
      }
    } catch (error) {
      console.error("Error creating project:", error);
      alert("Failed to create project. Please try again.");
    }
  };

  if (loading) return <div className="loading">Loading projects...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="dashboard-container">
      <h1>Project Dashboard</h1>
      
      {showForm ? (
        <ProjectForm 
          onSubmit={handleCreateProject} 
          onCancel={() => setShowForm(false)} 
        />
      ) : (
        <div className="projects-grid">
          {projects.length > 0 ? (
            projects.map(project => (
              <ProjectFolder key={project._id} project={project} />
            ))
          ) : (
            <div className="no-projects">No projects found. Create your first project!</div>
          )}
          <div 
            className="project-folder new-project"
            onClick={() => setShowForm(true)}
          >
            <div className="folder-icon">+</div>
            <div className="folder-name">New Project</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

