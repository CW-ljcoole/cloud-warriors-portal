const express = require('express');
const router = express.Router();
const zoomController = require('../controllers/zoomController');

// Define a fallback handler for undefined controller functions
const fallbackHandler = (req, res) => {
  res.status(501).json({ message: 'This functionality is not implemented yet' });
};

// Simple test route
router.get('/test', (req, res) => {
  res.json({ message: 'Zoom router is working' });
});

// Only include routes with functions we know exist
if (zoomController.connectZoom) {
  router.post('/connect', zoomController.connectZoom);
}

if (zoomController.getZoomRecordingsByMeetingId) {
  router.get('/recordings/meeting/:meetingId', zoomController.getZoomRecordingsByMeetingId);
}

if (zoomController.importRecordingsToProject) {
  router.post('/recordings/import/:projectId', zoomController.importRecordingsToProject);
}

if (zoomController.getZoomStatus) {
  router.get('/status', zoomController.getZoomStatus);
}

if (zoomController.disconnectZoomAccount) {
  router.post('/disconnect', zoomController.disconnectZoomAccount);
}

if (zoomController.getZoomRecordings) {
  router.get('/recordings', zoomController.getZoomRecordings);
}

module.exports = router;

