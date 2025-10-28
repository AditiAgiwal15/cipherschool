require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db.js');

// Import your route handlers
const projectRoutes = require('./src/routes/project.routes'); // Corrected: Removed duplicate
const userRoutes = require('./src/routes/user.routes');    // This line is correct

// Initialize Express App
const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors()); // Allows cross-origin requests from your frontend
app.use(express.json()); // Parses incoming JSON requests

// API Routes
app.use('/api/projects', projectRoutes);
app.use('/api/users', userRoutes); // NEW: Add this line to use your user routes

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`🚀 Server is running on port ${PORT}`));