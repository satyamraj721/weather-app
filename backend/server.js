// Load environment variables
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const weatherRoutes = require('./routes/weather');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Use /api/weather routes
app.use('/api/weather', weatherRoutes);

// Start server on PORT from .env
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});