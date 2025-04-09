const mongoose = require('mongoose');

const RecordingSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  duration: {
    type: String
  },
  zoomId: {
    type: String
  },
  url: {
    type: String
  },
  size: {
    type: String
  },
  processed: {
    type: Boolean,
    default: false
  },
  minutesGenerated: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Recording', RecordingSchema);
