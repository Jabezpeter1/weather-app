const apiKey = "8c489a48d22949fbe9ca7d8b7ee22543";
const weatherResult = document.getElementById("weatherResult");
const historyList = document.getElementById("historyList");
const chartCanvas = document.getElementById("weatherChart").getContext("2d");

let searchHistory = JSON.parse(localStorage.getItem("history")) || [];
let weatherChart;

window.onload = () => {
  renderHistory();
};

async function getWeather() {
  const city = document.getElementById("cityInput").value.trim();
  if (!city) return;

  try {
    // Get latitude & longitude
    const geoRes = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`
    );
    const geoData = await geoRes.json();

    if (!geoData.length) {
      weatherResult.innerHTML = "City not found!";
      return;
    }

    const { lat, lon, name } = geoData[0];

    // Get 7-day forecast
    const forecastRes = await fetch(
      `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&units=metric&appid=${apiKey}`
    );
    const forecastData = await forecastRes.json();

    displayWeather(name, forecastData);
    updateChart(forecastData.daily);
    updateHistory(city);

  } catch (error) {
    console.error("Error fetching weather:", error);
    weatherResult.innerHTML = "Error fetching weather data.";
  }
}

function
