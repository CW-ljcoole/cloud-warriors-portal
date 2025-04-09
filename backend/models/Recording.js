const mongoose = require('mongoose');

const RecordingSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  zoomMeetingId: {
    type: String
  },
  recordingUrl: {
    type: String,
    required: true
  },
  recordingDate: {
    type: Date,
    default: Date.now
  },
  duration: {
    type: Number // in minutes
  },
  participants: [
    {
      name: String,
      email: String
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Recording', RecordingSchema);
