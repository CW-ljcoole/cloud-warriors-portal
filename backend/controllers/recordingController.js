const Recording = require('../models/Recording');
const Project = require('../models/Project');

// Get all recordings
exports.getRecordings = async (req, res) => {
  try {
    const recordings = await Recording.find().sort({ date: -1 });
    res.json(recordings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get recordings by project ID
exports.getRecordingsByProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    const recordings = await Recording.find({ projectId: req.params.projectId }).sort({ date: -1 });
    res.json(recordings);
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single recording by ID
exports.getRecordingById = async (req, res) => {
  try {
    const recording = await Recording.findById(req.params.id);
    
    if (!recording) {
      return res.status(404).json({ message: 'Recording not found' });
    }
    
    res.json(recording);
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Recording not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new recording
exports.createRecording = async (req, res) => {
  try {
    const { projectId, name, date, duration, zoomId, url, size } = req.body;
    
    // Check if project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Create new recording
    const newRecording = new Recording({
      projectId,
      name,
      date,
      duration,
      zoomId,
      url,
      size
    });
    
    const recording = await newRecording.save();
    res.json(recording);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update recording
exports.updateRecording = async (req, res) => {
  try {
    const { name, date, duration, zoomId, url, size, processed, minutesGenerated } = req.body;
    
    // Build recording object
    const recordingFields = {};
    if (name) recordingFields.name = name;
    if (date) recordingFields.date = date;
    if (duration) recordingFields.duration = duration;
    if (zoomId) recordingFields.zoomId = zoomId;
    if (url) recordingFields.url = url;
    if (size) recordingFields.size = size;
    if (processed !== undefined) recordingFields.processed = processed;
    if (minutesGenerated !== undefined) recordingFields.minutesGenerated = minutesGenerated;
    
    let recording = await Recording.findById(req.params.id);
    
    if (!recording) {
      return res.status(404).json({ message: 'Recording not found' });
    }
    
    // Update
    recording = await Recording.findByIdAndUpdate(
      req.params.id,
      { $set: recordingFields },
      { new: true }
    );
    
    res.json(recording);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete recording
exports.deleteRecording = async (req, res) => {
  try {
    const recording = await Recording.findById(req.params.id);
    
    if (!recording) {
      return res.status(404).json({ message: 'Recording not found' });
    }
    
    await recording.deleteOne();
    res.json({ message: 'Recording removed' });
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Recording not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};
