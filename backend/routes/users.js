const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// @route   GET api/users
// @desc    Get all users
// @access  Public
router.get('/', userController.getUsers);

// @route   GET api/users/:id
// @desc    Get user by ID
// @access  Public
router.get('/:id', userController.getUserById);

// @route   POST api/users
// @desc    Create a new user
// @access  Public
router.post('/', userController.createUser);

// @route   PUT api/users/:id
// @desc    Update a user
// @access  Public
router.put('/:id', userController.updateUser);

// @route   DELETE api/users/:id
// @desc    Delete a user
// @access  Public
router.delete('/:id', userController.deleteUser);

module.exports = router;
