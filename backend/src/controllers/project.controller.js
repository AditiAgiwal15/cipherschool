const Project = require('../models/project.model');

// Updated to associate project with a user
const saveProject = async (req, res) => {
  try {
    const newProject = new Project({
      files: req.body.files,
      user: req.user.id, // Get user ID from the auth middleware
    });
    await newProject.save();
    res.status(201).json(newProject);
  } catch (error) {
    res.status(500).json({ message: 'Error saving project' });
  }
};

// NEW: Function to get all projects for the logged-in user
const getProjectsByUser = async (req, res) => {
  try {
    const projects = await Project.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// Updated to ensure user owns the project before updating
const updateProject = async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ msg: 'Project not found' });

    // Make sure user owns the project
    if (project.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    project.files = req.body.files;
    await project.save();
    res.status(200).json({ message: 'Project updated successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Server error while updating project.' });
  }
};

module.exports = {
  saveProject,
  getProjectsByUser,
  updateProject,
};