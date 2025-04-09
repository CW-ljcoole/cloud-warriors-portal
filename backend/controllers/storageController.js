const fs = require('fs');
const path = require('path');
const Project = require('../models/Project');
const Recording = require('../models/Recording');
const Minutes = require('../models/Minutes');

// Base storage path
const getStoragePath = () => {
  return process.env.STORAGE_PATH || path.join(__dirname, '../../storage');
};

// Initialize storage directories
exports.initializeStorage = async (req, res) => {
  try {
    const storagePath = getStoragePath();
    
    // Create main storage directory if it doesn't exist
    if (!fs.existsSync(storagePath)) {
      fs.mkdirSync(storagePath, { recursive: true });
    }
    
    // Create projects directory
    const projectsPath = path.join(storagePath, 'projects');
    if (!fs.existsSync(projectsPath)) {
      fs.mkdirSync(projectsPath, { recursive: true });
    }
    
    // Create backups directory
    const backupsPath = path.join(storagePath, 'backups');
    if (!fs.existsSync(backupsPath)) {
      fs.mkdirSync(backupsPath, { recursive: true });
    }
    
    // Get all projects
    const projects = await Project.find();
    
    // Create directory for each project
    for (const project of projects) {
      const projectPath = path.join(projectsPath, project._id.toString());
      if (!fs.existsSync(projectPath)) {
        fs.mkdirSync(projectPath, { recursive: true });
      }
      
      // Create recordings directory
      const recordingsPath = path.join(projectPath, 'recordings');
      if (!fs.existsSync(recordingsPath)) {
        fs.mkdirSync(recordingsPath, { recursive: true });
      }
      
      // Create minutes directory
      const minutesPath = path.join(projectPath, 'minutes');
      if (!fs.existsSync(minutesPath)) {
        fs.mkdirSync(minutesPath, { recursive: true });
      }
    }
    
    res.json({
      message: 'Storage directories initialized successfully',
      storagePath,
      projectsCount: projects.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      message: 'Error initializing storage directories',
      error: err.message
    });
  }
};

// Get storage statistics
exports.getStorageStats = async (req, res) => {
  try {
    const storagePath = getStoragePath();
    const projectsPath = path.join(storagePath, 'projects');
    
    // Check if storage is initialized
    if (!fs.existsSync(storagePath) || !fs.existsSync(projectsPath)) {
      return res.status(400).json({ 
        message: 'Storage not initialized',
        initialized: false
      });
    }
    
    let stats = {
      initialized: true,
      totalSize: 0,
      projectsCount: 0,
      recordingsCount: 0,
      minutesCount: 0,
      projects: []
    };
    
    // If projectId is provided, get stats for specific project
    if (req.params.projectId) {
      const project = await Project.findById(req.params.projectId);
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      const projectPath = path.join(projectsPath, project._id.toString());
      if (!fs.existsSync(projectPath)) {
        return res.json({
          initialized: true,
          projectName: project.name,
          projectId: project._id,
          totalSize: 0,
          recordingsSize: 0,
          minutesSize: 0,
          recordingsCount: 0,
          minutesCount: 0
        });
      }
      
      // Get recordings count
      const recordingsCount = await Recording.countDocuments({ projectId: project._id });
      
      // Get minutes count
      const minutesCount = await Minutes.countDocuments({ projectId: project._id });
      
      // Calculate sizes
      const recordingsPath = path.join(projectPath, 'recordings');
      const minutesPath = path.join(projectPath, 'minutes');
      
      let recordingsSize = 0;
      let minutesSize = 0;
      
      if (fs.existsSync(recordingsPath)) {
        const recordingFiles = fs.readdirSync(recordingsPath);
        for (const file of recordingFiles) {
          const filePath = path.join(recordingsPath, file);
          const stats = fs.statSync(filePath);
          recordingsSize += stats.size;
        }
      }
      
      if (fs.existsSync(minutesPath)) {
        const minutesFiles = fs.readdirSync(minutesPath);
        for (const file of minutesFiles) {
          const filePath = path.join(minutesPath, file);
          const stats = fs.statSync(filePath);
          minutesSize += stats.size;
        }
      }
      
      const totalSize = recordingsSize + minutesSize;
      
      return res.json({
        initialized: true,
        projectName: project.name,
        projectId: project._id,
        totalSize,
        recordingsSize,
        minutesSize,
        recordingsCount,
        minutesCount
      });
    }
    
    // Get all projects
    const projects = await Project.find();
    stats.projectsCount = projects.length;
    
    // Get total recordings and minutes count
    stats.recordingsCount = await Recording.countDocuments();
    stats.minutesCount = await Minutes.countDocuments();
    
    // Calculate sizes for each project
    for (const project of projects) {
      const projectPath = path.join(projectsPath, project._id.toString());
      if (!fs.existsSync(projectPath)) {
        continue;
      }
      
      const recordingsPath = path.join(projectPath, 'recordings');
      const minutesPath = path.join(projectPath, 'minutes');
      
      let recordingsSize = 0;
      let minutesSize = 0;
      
      if (fs.existsSync(recordingsPath)) {
        const recordingFiles = fs.readdirSync(recordingsPath);
        for (const file of recordingFiles) {
          const filePath = path.join(recordingsPath, file);
          const fileStats = fs.statSync(filePath);
          recordingsSize += fileStats.size;
        }
      }
      
      if (fs.existsSync(minutesPath)) {
        const minutesFiles = fs.readdirSync(minutesPath);
        for (const file of minutesFiles) {
          const filePath = path.join(minutesPath, file);
          const fileStats = fs.statSync(filePath);
          minutesSize += fileStats.size;
        }
      }
      
      const projectSize = recordingsSize + minutesSize;
      stats.totalSize += projectSize;
      
      stats.projects.push({
        projectId: project._id,
        projectName: project.name,
        size: projectSize,
        recordingsSize,
        minutesSize
      });
    }
    
    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      message: 'Error getting storage statistics',
      error: err.message
    });
  }
};

// Export project data
exports.exportProjectData = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // Get project
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Get recordings
    const recordings = await Recording.find({ projectId });
    
    // Get minutes
    const minutes = await Minutes.find({ projectId });
    
    // Create export data
    const exportData = {
      project,
      recordings,
      minutes,
      exportDate: new Date()
    };
    
    // Save to file
    const storagePath = getStoragePath();
    const backupsPath = path.join(storagePath, 'backups');
    
    if (!fs.existsSync(backupsPath)) {
      fs.mkdirSync(backupsPath, { recursive: true });
    }
    
    const fileName = `project_${projectId}_${new Date().toISOString().replace(/:/g, '-')}.json`;
    const filePath = path.join(backupsPath, fileName);
    
    fs.writeFileSync(filePath, JSON.stringify(exportData, null, 2));
    
    res.json({
      message: 'Project data exported successfully',
      fileName,
      filePath,
      exportDate: exportData.exportDate
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      message: 'Error exporting project data',
      error: err.message
    });
  }
};

// Import project data
exports.importProjectData = async (req, res) => {
  try {
    const { importData } = req.body;
    
    if (!importData || !importData.project) {
      return res.status(400).json({ message: 'Invalid import data' });
    }
    
    // Check if project already exists
    let existingProject = await Project.findOne({ name: importData.project.name });
    
    // Create or update project
    let project;
    if (existingProject) {
      // Update existing project
      project = await Project.findByIdAndUpdate(
        existingProject._id,
        { $set: importData.project },
        { new: true }
      );
    } else {
      // Create new project
      const newProject = new Project(importData.project);
      project = await newProject.save();
    }
    
    // Import recordings
    const importedRecordings = [];
    if (importData.recordings && Array.isArray(importData.recordings)) {
      for (const recordingData of importData.recordings) {
        // Check if recording already exists
        const existingRecording = await Recording.findOne({ 
          projectId: project._id,
          name: recordingData.name,
          date: recordingData.date
        });
        
        if (existingRecording) {
          // Update existing recording
          const updatedRecording = await Recording.findByIdAndUpdate(
            existingRecording._id,
            { $set: { ...recordingData, projectId: project._id } },
            { new: true }
          );
          importedRecordings.push(updatedRecording);
        } else {
          // Create new recording
          const newRecording = new Recording({
            ...recordingData,
            projectId: project._id
          });
          const savedRecording = await newRecording.save();
          importedRecordings.push(savedRecording);
        }
      }
    }
    
    // Import minutes
    const importedMinutes = [];
    if (importData.minutes && Array.isArray(importData.minutes)) {
      for (const minutesData of importData.minutes) {
        // Check if minutes already exists
        const existingMinutes = await Minutes.findOne({ 
          projectId: project._id,
          name: minutesData.name,
          date: minutesData.date
        });
        
        if (existingMinutes) {
          // Update existing minutes
          const updatedMinutes = await Minutes.findByIdAndUpdate(
            existingMinutes._id,
            { $set: { ...minutesData, projectId: project._id } },
            { new: true }
          );
          importedMinutes.push(updatedMinutes);
        } else {
          // Create new minutes
          const newMinutes = new Minutes({
            ...minutesData,
            projectId: project._id
          });
          const savedMinutes = await newMinutes.save();
          importedMinutes.push(savedMinutes);
        }
      }
    }
    
    // Initialize storage for the project
    const storagePath = getStoragePath();
    const projectsPath = path.join(storagePath, 'projects');
    const projectPath = path.join(projectsPath, project._id.toString());
    
    if (!fs.existsSync(projectPath)) {
      fs.mkdirSync(projectPath, { recursive: true });
    }
    
    const recordingsPath = path.join(projectPath, 'recordings');
    if (!fs.existsSync(recordingsPath)) {
      fs.mkdirSync(recordingsPath, { recursive: true });
    }
    
    const minutesPath = path.join(projectPath, 'minutes');
    if (!fs.existsSync(minutesPath)) {
      fs.mkdirSync(minutesPath, { recursive: true });
    }
    
    res.json({
      message: 'Project data imported successfully',
      project,
      recordingsCount: importedRecordings.length,
      minutesCount: importedMinutes.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      message: 'Error importing project data',
      error: err.message
    });
  }
};
