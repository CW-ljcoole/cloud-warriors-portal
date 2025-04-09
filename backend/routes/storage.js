const express = require('express');
const router = express.Router();
const storageController = require('../controllers/storageController');

// @route   POST api/storage/initialize
// @desc    Initialize storage directories
// @access  Public
router.post('/initialize', storageController.initializeStorage);

// @route   GET api/storage/stats
// @desc    Get storage statistics
// @access  Public
router.get('/stats', storageController.getStorageStats);

// @route   GET api/storage/stats/:projectId
// @desc    Get storage statistics for a project
// @access  Public
router.get('/stats/:projectId', storageController.getStorageStats);

// @route   GET api/storage/export/:projectId
// @desc    Export project data
// @access  Public
router.get('/export/:projectId', storageController.exportProjectData);

// @route   POST api/storage/import
// @desc    Import project data
// @access  Public
router.post('/import', storageController.importProjectData);

module.exports = router;
