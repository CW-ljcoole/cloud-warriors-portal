const express = require('express');
const router = express.Router();
const zoomController = require('../controllers/zoomController');

// @route   GET api/zoom/recordings
// @desc    Get Zoom recordings
// @access  Public
router.get('/recordings', zoomController.getZoomRecordings);

// @route   POST api/zoom/recordings/import
// @desc    Import Zoom recordings to project
// @access  Public
router.post('/recordings/import', zoomController.importZoomRecordings);

// @route   POST api/zoom/connect
// @desc    Connect Zoom account
// @access  Public
router.post('/connect', zoomController.connectZoom);

// @route   DELETE api/zoom/disconnect/:userId
// @desc    Disconnect Zoom account
// @access  Public
router.delete('/disconnect/:userId', zoomController.disconnectZoomAccount);

// @route   GET api/zoom/recordings/meeting/:meetingId
// @desc    Get recordings for a specific meeting
// @access  Public
router.get('/recordings/meeting/:meetingId', zoomController.getZoomRecordingsByMeetingId);

// @route   POST api/zoom/recordings/import/:projectId
// @desc    Import recordings to a project
// @access  Public
router.post('/recordings/import/:projectId', zoomController.importRecordingsToProject);

// @route   GET api/zoom/status
// @desc    Check Zoom connection status
// @access  Public
router.get('/status', zoomController.getZoomStatus);

module.exports = router;

