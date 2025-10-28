const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  files: {
    type: Object,
    required: true,
  },
  // NEW: Add a reference to the User model
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Project', ProjectSchema);