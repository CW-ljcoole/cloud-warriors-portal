const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  role: {
    type: String,
    default: 'User',
    enum: ['Admin', 'Project Manager', 'User']
  },
  company: {
    type: String,
    trim: true
  },
  profilePicture: {
    type: String
  },
  notificationSettings: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    meetingReminders: {
      type: Boolean,
      default: true
    },
    actionItemReminders: {
      type: Boolean,
      default: true
    },
    weeklyDigest: {
      type: Boolean,
      default: false
    }
  },
  zoomIntegration: {
    apiKey: {
      type: String
    },
    apiSecret: {
      type: String
    },
    connected: {
      type: Boolean,
      default: false
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema);
