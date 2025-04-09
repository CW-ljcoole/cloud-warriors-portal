const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');

// Load environment variables
dotenv.config();

// Import routes
const projectRoutes = require('./routes/projects');
const recordingRoutes = require('./routes/recordings');
const minutesRoutes = require('./routes/minutes');
const userRoutes = require('./routes/users');
const zoomRoutes = require('./routes/zoom');
const distributionRoutes = require('./routes/distribution');
const storageRoutes = require('./routes/storage');

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB
const connectDB = require('./config/db');
connectDB();

// Define routes
app.use('/api/projects', projectRoutes);
app.use('/api/recordings', recordingRoutes);
app.use('/api/minutes', minutesRoutes);
app.use('/api/users', userRoutes);
app.use('/api/zoom', zoomRoutes);
app.use('/api/distribution', distributionRoutes);
app.use('/api/storage', storageRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.send('Cloud Warriors PM Portal API is running');
});

// Define port
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
