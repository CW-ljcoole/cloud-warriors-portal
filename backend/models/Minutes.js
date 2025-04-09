const mongoose = require('mongoose');

const MinutesSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  recordingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recording'
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
  attendees: [{
    type: String
  }],
  summary: {
    type: String
  },
  content: {
    type: String,
    required: true
  },
  actionItems: [{
    description: {
      type: String,
      required: true
    },
    assignee: {
      type: String
    },
    dueDate: {
      type: Date
    },
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Completed'],
      default: 'Open'
    }
  }],
  nextSync: {
    type: String
  },
  emailSent: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Minutes', MinutesSchema);
