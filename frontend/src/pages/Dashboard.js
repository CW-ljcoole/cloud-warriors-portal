import React, { useState, useEffect } from 'react';
import '../styles/Projects.css';
import ProjectFolder from '../components/ProjectFolder';
import ProjectForm from '../components/ProjectForm';
import config from '../config';

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
        fetchZoomRecordings(newProject._id, projectData.zoomMeetingIds);
      }
    } catch (error) {
      console.error("Error creating project:", error);
      alert("Failed to create project. Please try again.");
    }
  };

  const fetchZoomRecordings = async (projectId, meetingIds) => {
    try {
      const apiUrl = config.apiUrl;
      
      for (const meetingId of meetingIds) {
        // Fetch recordings for this meeting ID
        const response = await fetch(`${apiUrl}/api/zoom/recordings/meeting/${meetingId}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const recordingData = await response.json();
        
        // Import these recordings to the project
        await fetch(`${apiUrl}/api/zoom/recordings/import/${projectId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ recordings: recordingData.recording_files }),
        });
      }
      
      alert(`Successfully fetched recordings for project ${projectId}`);
    } catch (error) {
      console.error("Error fetching Zoom recordings:", error);
      alert("Error fetching Zoom recordings. Please check your Zoom integration settings.");
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
          
          <div className="new-project-folder" onClick={() => setShowForm(true)}>
            <div className="folder-icon">+</div>
            <div className="folder-name">New Project</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
