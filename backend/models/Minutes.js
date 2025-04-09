const mongoose = require('mongoose');

const MinutesSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  recording: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recording'
  },
  title: {
    type: String,
    required: true
  },
  meetingDate: {
    type: Date,
    default: Date.now
  },
  attendees: [
    {
      name: String,
      email: String,
      role: String
    }
  ],
  agenda: [String],
  discussion: [
    {
      topic: String,
      notes: String
    }
  ],
  actionItems: [
    {
      description: String,
      assignedTo: String,
      dueDate: Date,
      status: {
        type: String,
        enum: ['Not Started', 'In Progress', 'Completed'],
        default: 'Not Started'
      }
    }
  ],
  decisions: [String],
  nextMeeting: {
    date: Date,
    agenda: [String]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Minutes', MinutesSchema);

