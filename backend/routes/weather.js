const express = require("express");
const axios = require("axios");

const router = express.Router();

// GET /api/weather?city=Delhi
router.get("/", async (req, res) => {
  const { city } = req.query;

  if (!city) {
    return res.status(400).json({ error: "City parameter is required" });
  }

  try {
    const response = await axios.get(
      "https://api.weatherapi.com/v1/forecast.json",
      {
        params: {
          key: process.env.WEATHER_API_KEY,
          q: city,
          days: 7,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Failed to fetch weather data" });
  }
});

module.exports = router;
