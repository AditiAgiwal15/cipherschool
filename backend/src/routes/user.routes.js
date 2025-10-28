const express = require('express');
const router = express.Router();
// CORRECT: This should only import the user controller
const { registerUser, loginUser } = require('../controllers/user.controller');

router.post('/register', registerUser);
router.post('/login', loginUser);

module.exports = router;