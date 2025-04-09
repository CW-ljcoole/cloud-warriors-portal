import React, { useState } from 'react';
import '../styles/ProjectForm.css';

const ProjectForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    zoomMeetingIds: [''],
    client: '',
    startDate: '',
    endDate: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleZoomIdChange = (index, value) => {
    const updatedIds = [...formData.zoomMeetingIds];
    updatedIds[index] = value;
    setFormData({
      ...formData,
      zoomMeetingIds: updatedIds
    });
  };

  const addZoomIdField = () => {
    setFormData({
      ...formData,
      zoomMeetingIds: [...formData.zoomMeetingIds, '']
    });
  };

  const removeZoomIdField = (index) => {
    const updatedIds = [...formData.zoomMeetingIds];
    updatedIds.splice(index, 1);
    setFormData({
      ...formData,
      zoomMeetingIds: updatedIds
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Filter out empty Zoom IDs
    const filteredData = {
      ...formData,
      zoomMeetingIds: formData.zoomMeetingIds.filter(id => id.trim() !== '')
    };
    onSubmit(filteredData);
  };

  return (
    <div className="project-form-container">
      <h2>Create New Project</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Project Name*</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
          />
        </div>

        <div className="form-group">
          <label htmlFor="client">Client</label>
          <input
            type="text"
            id="client"
            name="client"
            value={formData.client}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Zoom Meeting IDs</label>
          {formData.zoomMeetingIds.map((id, index) => (
            <div key={index} className="zoom-id-input">
              <input
                type="text"
                value={id}
                onChange={(e) => handleZoomIdChange(index, e.target.value)}
                placeholder="Enter Zoom Meeting ID"
              />
              {index > 0 && (
                <button 
                  type="button" 
                  className="remove-btn"
                  onClick={() => removeZoomIdField(index)}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button 
            type="button" 
            className="add-btn"
            onClick={addZoomIdField}
          >
            + Add Another Meeting ID
          </button>
        </div>

        <div className="form-group date-inputs">
          <div>
            <label htmlFor="startDate">Start Date</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="endDate">End Date</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="submit-btn">
            Create Project
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProjectForm;
