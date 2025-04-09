const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');

// @route   GET api/projects
// @desc    Get all projects
// @access  Public
router.get('/', projectController.getProjects);

// @route   GET api/projects/:id
// @desc    Get project by ID
// @access  Public
router.get('/:id', projectController.getProjectById);

// @route   POST api/projects
// @desc    Create a new project
// @access  Public
router.post('/', projectController.createProject);

// @route   PUT api/projects/:id
// @desc    Update a project
// @access  Public
router.put('/:id', projectController.updateProject);

// @route   DELETE api/projects/:id
// @desc    Delete a project
// @access  Public
router.delete('/:id', projectController.deleteProject);

module.exports = router;
