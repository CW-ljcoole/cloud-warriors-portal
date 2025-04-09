const express = require('express');
const router = express.Router();
const recordingController = require('../controllers/recordingController');

// @route   GET api/recordings
// @desc    Get all recordings
// @access  Public
router.get('/', recordingController.getRecordings);

// @route   GET api/recordings/project/:projectId
// @desc    Get recordings by project ID
// @access  Public
router.get('/project/:projectId', recordingController.getRecordingsByProject);

// @route   GET api/recordings/:id
// @desc    Get recording by ID
// @access  Public
router.get('/:id', recordingController.getRecordingById);

// @route   POST api/recordings
// @desc    Create a new recording
// @access  Public
router.post('/', recordingController.createRecording);

// @route   PUT api/recordings/:id
// @desc    Update a recording
// @access  Public
router.put('/:id', recordingController.updateRecording);

// @route   DELETE api/recordings/:id
// @desc    Delete a recording
// @access  Public
router.delete('/:id', recordingController.deleteRecording);

module.exports = router;
