import React, { useState, useEffect } from 'react';
import '../styles/Projects.css';
import ProjectFolder from '../components/ProjectFolder';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // Replace with your actual API URL
        const apiUrl = process.env.REACT_APP_API_URL || 'https://cloud-warriors-portal.onrender.com';
        const response = await fetch(`${apiUrl}/api/projects`) ;
        
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

    fetchProjects();
  }, []);

  if (loading) return <div className="loading">Loading projects...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="dashboard-container">
      <h1>Project Dashboard</h1>
      <div className="projects-grid">
        {projects.length > 0 ? (
          projects.map(project => (
            <ProjectFolder key={project._id} project={project} />
          ))
        ) : (
          <div className="no-projects">No projects found. Create your first project!</div>
        )}
        <div className="project-folder new-project">
          <div className="folder-icon">+</div>
          <div className="folder-name">New Project</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
