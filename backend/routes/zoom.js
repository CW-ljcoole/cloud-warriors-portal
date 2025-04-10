const express = require('express');
const router = express.Router();
const zoomController = require('../controllers/zoomController');

// Simple test route to verify the router is working
router.get('/test', (req, res) => {
  res.json({ message: 'Zoom router is working' });
});

// Add only one route at a time to identify which one is causing the issue
router.get('/status', zoomController.getZoomStatus);

module.exports = router;

