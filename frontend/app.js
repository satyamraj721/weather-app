const API_URL = 'http://localhost:3000/api/weather';

const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const resultContainer = document.getElementById('resultContainer');
const chartContainer = document.getElementById('chartContainer');

let temperatureChart = null;

// Fetch weather data from backend API
async function fetchWeather(city) {
  try {
    const response = await fetch(`${API_URL}?city=${encodeURIComponent(city)}`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch weather data');
    }
    
    return data;
  } catch (error) {
    throw error;
  }
}

// Display city, temperature, condition
function displayCurrentWeather(data) {
  const { location, current } = data;
  
  return `
    <div class="current-weather">
      <h2>${location.name}, ${location.country}</h2>
      <div class="temp">${current.temp_c}°C</div>
      <div class="condition">
        <img src="${current.condition.icon}" alt="${current.condition.text}">
        <p>${current.condition.text}</p>
      </div>
      <div class="details">
        <p>Feels like: ${current.feelslike_c}°C</p>
        <p>Humidity: ${current.humidity}%</p>
        <p>Wind: ${current.wind_kph} km/h</p>
      </div>
    </div>
  `;
}

// Display 7-day forecast
function displayForecast(data) {
  const { forecast } = data;
  
  const forecastHTML = forecast.forecastday.map(day => {
    const date = new Date(day.date);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    
    return `
      <div class="forecast-day">
        <p class="date">${dayName}</p>
        <img src="${day.day.condition.icon}" alt="${day.day.condition.text}">
        <p class="condition-text">${day.day.condition.text}</p>
        <p class="temps">
          <span class="max">${day.day.maxtemp_c}°</span>
          <span class="min">${day.day.mintemp_c}°</span>
        </p>
      </div>
    `;
  }).join('');
  
  return `
    <div class="forecast-container">
      <h3>7-Day Forecast</h3>
      <div class="forecast-grid">
        ${forecastHTML}
      </div>
    </div>
  `;
}

// Create line chart for hourly temperature using Chart.js
function createTemperatureChart(data) {
  const hourlyData = data.forecast.forecastday[0].hour;
  
  const labels = hourlyData.map(hour => {
    const time = new Date(hour.time);
    return time.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
  });
  
  const temperatures = hourlyData.map(hour => hour.temp_c);
  
  // Destroy existing chart if it exists
  if (temperatureChart) {
    temperatureChart.destroy();
  }
  
  const ctx = document.getElementById('temperatureChart').getContext('2d');
  temperatureChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Temperature (°C)',
        data: temperatures,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: true,
          position: 'top'
        },
        tooltip: {
          mode: 'index',
          intersect: false
        }
      },
      scales: {
        y: {
          beginAtZero: false,
          ticks: {
            callback: function(value) {
              return value + '°C';
            }
          }
        },
        x: {
          ticks: {
            maxRotation: 45,
            minRotation: 45
          }
        }
      }
    }
  });
  
  chartContainer.style.display = 'block';
}

// Handle errors gracefully
function displayError(message) {
  resultContainer.innerHTML = `
    <div class="error">
      <p>⚠️ ${message}</p>
    </div>
  `;
  chartContainer.style.display = 'none';
}

async function handleSearch() {
  const city = cityInput.value.trim();
  
  if (!city) {
    displayError('Please enter a city name');
    return;
  }
  
  resultContainer.innerHTML = '<div class="loading">Loading...</div>';
  
  try {
    const data = await fetchWeather(city);
    const currentWeatherHTML = displayCurrentWeather(data);
    const forecastHTML = displayForecast(data);
    
    resultContainer.innerHTML = currentWeatherHTML + forecastHTML;
    createTemperatureChart(data);
  } catch (error) {
    displayError(error.message);
  }
}

searchBtn.addEventListener('click', handleSearch);

cityInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    handleSearch();
  }
});