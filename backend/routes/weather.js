// Express router
const express = require('express');
const router = express.Router();

// GET /api/weather?city=
router.get('/', async (req, res) => {
  try {
    const { city } = req.query;
    
    // Handle invalid city
    if (!city) {
      return res.status(400).json({ error: 'City parameter is required' });
    }

    // Fetch 7-day forecast from WeatherAPI
    const apiKey = process.env.WEATHER_API_KEY;
    const apiUrl = `http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(city)}&days=7`;
    
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    // Handle API errors
    if (!response.ok) {
      return res.status(response.status).json({ 
        error: data.error?.message || 'Failed to fetch weather data' 
      });
    }
    
    // Return JSON response
    res.json(data);
  } catch (error) {
    // Handle invalid city and API errors
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;