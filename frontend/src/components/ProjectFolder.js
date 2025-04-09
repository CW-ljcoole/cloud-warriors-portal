import React from 'react';
import '../styles/ProjectFolder.css';

const ProjectFolder = ({ project }) => {
  return (
    <div className="project-folder">
      <div className="folder-icon">📁</div>
      <div className="folder-name">{project.name}</div>
      <div className="folder-details">
        <span>{project.recordings?.length || 0} recordings</span>
        <span>{project.minutes?.length || 0} minutes</span>
      </div>
    </div>
  );
};

export default ProjectFolder;
