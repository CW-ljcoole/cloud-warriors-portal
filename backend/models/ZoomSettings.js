const mongoose = require('mongoose');

const ZoomSettingsSchema = new mongoose.Schema({
  apiKey: {
    type: String,
    required: true
  },
  apiSecret: {
    type: String,
    required: true
  },
  accountId: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ZoomSettings', ZoomSettingsSchema);
