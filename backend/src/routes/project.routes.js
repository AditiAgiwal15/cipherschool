const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware'); // Import auth middleware
const {
  saveProject,
  getProjectsByUser, // We'll create this function
  updateProject,
} = require('../controllers/project.controller');

// All project routes will now be protected
router.post('/', auth, saveProject);
router.get('/', auth, getProjectsByUser); // New route to get user's projects
router.put('/:id', auth, updateProject);

module.exports = router;