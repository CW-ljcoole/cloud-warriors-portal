const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['Planning', 'In Progress', 'Completed', 'On Hold'],
    default: 'Planning'
  },
  team: [{
    name: String,
    email: String,
    role: String
  }],
  emailDistribution: {
    type: String,
    trim: true
  },
  zoomMeetingPattern: {
    type: String,
    trim: true
  },
  defaultTemplate: {
    type: String
  },
  autoGenerateMinutes: {
    type: Boolean,
    default: true
  },
  sendNotifications: {
    type: Boolean,
    default: true
  },
  autoDistribution: {
    enabled: {
      type: Boolean,
      default: false
    },
    scheduleType: {
      type: String,
      enum: ['immediate', 'daily', 'weekly'],
      default: 'immediate'
    },
    time: {
      type: String,
      default: '09:00'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Project', ProjectSchema);
