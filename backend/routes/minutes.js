const express = require('express');
const router = express.Router();
const minutesController = require('../controllers/minutesController');

// @route   GET api/minutes
// @desc    Get all meeting minutes
// @access  Public
router.get('/', minutesController.getAllMinutes);

// @route   GET api/minutes/project/:projectId
// @desc    Get meeting minutes by project ID
// @access  Public
router.get('/project/:projectId', minutesController.getMinutesByProject);

// @route   GET api/minutes/:id
// @desc    Get meeting minutes by ID
// @access  Public
router.get('/:id', minutesController.getMinutesById);

// @route   POST api/minutes
// @desc    Create new meeting minutes
// @access  Public
router.post('/', minutesController.createMinutes);

// @route   PUT api/minutes/:id
// @desc    Update meeting minutes
// @access  Public
router.put('/:id', minutesController.updateMinutes);

// @route   DELETE api/minutes/:id
// @desc    Delete meeting minutes
// @access  Public
router.delete('/:id', minutesController.deleteMinutes);

module.exports = router;
