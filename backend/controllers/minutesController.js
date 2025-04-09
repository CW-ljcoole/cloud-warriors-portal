const Minutes = require('../models/Minutes');
const Project = require('../models/Project');
const Recording = require('../models/Recording');

// Get all minutes
exports.getAllMinutes = async (req, res) => {
  try {
    const minutes = await Minutes.find().sort({ date: -1 });
    res.json(minutes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get minutes by project ID
exports.getMinutesByProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    const minutes = await Minutes.find({ projectId: req.params.projectId }).sort({ date: -1 });
    res.json(minutes);
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single minutes by ID
exports.getMinutesById = async (req, res) => {
  try {
    const minutes = await Minutes.findById(req.params.id);
    
    if (!minutes) {
      return res.status(404).json({ message: 'Meeting minutes not found' });
    }
    
    res.json(minutes);
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Meeting minutes not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new minutes
exports.createMinutes = async (req, res) => {
  try {
    const { 
      projectId, 
      recordingId, 
      name, 
      date, 
      attendees, 
      summary, 
      content, 
      actionItems,
      nextSync
    } = req.body;
    
    // Check if project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check if recording exists if recordingId is provided
    if (recordingId) {
      const recording = await Recording.findById(recordingId);
      if (!recording) {
        return res.status(404).json({ message: 'Recording not found' });
      }
    }
    
    // Create new minutes
    const newMinutes = new Minutes({
      projectId,
      recordingId,
      name,
      date,
      attendees,
      summary,
      content,
      actionItems,
      nextSync
    });
    
    const minutes = await newMinutes.save();
    
    // If this is linked to a recording, update the recording's minutesGenerated flag
    if (recordingId) {
      await Recording.findByIdAndUpdate(
        recordingId,
        { minutesGenerated: true }
      );
    }
    
    res.json(minutes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update minutes
exports.updateMinutes = async (req, res) => {
  try {
    const { 
      name, 
      date, 
      attendees, 
      summary, 
      content, 
      actionItems,
      nextSync,
      emailSent
    } = req.body;
    
    // Build minutes object
    const minutesFields = {};
    if (name) minutesFields.name = name;
    if (date) minutesFields.date = date;
    if (attendees) minutesFields.attendees = attendees;
    if (summary !== undefined) minutesFields.summary = summary;
    if (content) minutesFields.content = content;
    if (actionItems) minutesFields.actionItems = actionItems;
    if (nextSync !== undefined) minutesFields.nextSync = nextSync;
    if (emailSent !== undefined) minutesFields.emailSent = emailSent;
    
    let minutes = await Minutes.findById(req.params.id);
    
    if (!minutes) {
      return res.status(404).json({ message: 'Meeting minutes not found' });
    }
    
    // Update
    minutes = await Minutes.findByIdAndUpdate(
      req.params.id,
      { $set: minutesFields },
      { new: true }
    );
    
    res.json(minutes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete minutes
exports.deleteMinutes = async (req, res) => {
  try {
    const minutes = await Minutes.findById(req.params.id);
    
    if (!minutes) {
      return res.status(404).json({ message: 'Meeting minutes not found' });
    }
    
    await minutes.deleteOne();
    res.json({ message: 'Meeting minutes removed' });
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Meeting minutes not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};
