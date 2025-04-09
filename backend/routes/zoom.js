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
router.post('/connect', zoomController.connectZoomAccount);

// @route   DELETE api/zoom/disconnect/:userId
// @desc    Disconnect Zoom account
// @access  Public
router.delete('/disconnect/:userId', zoomController.disconnectZoomAccount);

module.exports = router;
