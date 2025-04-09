const express = require('express');
const router = express.Router();
const distributionController = require('../controllers/distributionController');

// @route   GET api/distribution/project/:projectId
// @desc    Get distribution settings for a project
// @access  Public
router.get('/project/:projectId', distributionController.getDistributionSettings);

// @route   PUT api/distribution/project/:projectId
// @desc    Update distribution settings for a project
// @access  Public
router.put('/project/:projectId', distributionController.updateDistributionSettings);

// @route   GET api/distribution/pending
// @desc    Get pending minutes for distribution
// @access  Public
router.get('/pending', distributionController.getPendingMinutes);

// @route   POST api/distribution/send
// @desc    Send meeting minutes
// @access  Public
router.post('/send', distributionController.sendMinutes);

// @route   POST api/distribution/process-all
// @desc    Process all pending minutes
// @access  Public
router.post('/process-all', distributionController.processAllPendingMinutes);

module.exports = router;
