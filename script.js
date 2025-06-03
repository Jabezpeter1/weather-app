const API_KEY = "8c489a48d22949fbe9ca7d8b7ee22543"; // <-- Replace with your OpenWeatherMap API key

async function getWeather() {
  const city = document.getElementById("cityInput").value.trim();
  if (!city) return alert("Please enter a city name.");

  const currentUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}`;

  try {
    const [currentRes, forecastRes] = await Promise.all([
      fetch(currentUrl),
      fetch(forecastUrl),
    ]);

    if (!currentRes.ok || !forecastRes.ok) {
      throw new Error("City not found or API error");
    }

    const currentData = await currentRes.json();
    const forecastData = await forecastRes.json();

    displayCurrent(currentData);
    displayHourlyForecast(forecastData);
    displayDailyForecast(forecastData);
    displayChart(forecastData);
    saveHistory(currentData.name);
    displayHistory();

  } catch (err) {
    alert("❌ Could not fetch weather data. Please check the city name or try again later.");
    console.error(err);
  }
}

// Display current weather info
function displayCurrent(data) {
  const temp = (data.main.temp - 273.15).toFixed(1);
  const condition = data.weather[0].description;
  const icon = data.weather[0].icon;
  const html = `
    <h3>${data.name}</h3>
    <p><strong>${temp} °C</strong></p>
    <p style="text-transform: capitalize;">${condition}</p>
    <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${condition}" />
  `;
  document.getElementById("current-weather").innerHTML = html;
}

// Show next 6 hours forecast (two 3-hour intervals)
function displayHourlyForecast(data) {
  const container = document.getElementById("hourly-forecast");
  container.innerHTML = "";

  // First 2 intervals = 6 hours (3 hours each)
  const nextSixHours = data.list.slice(0, 2);

  nextSixHours.forEach(item => {
    const dateTime = new Date(item.dt_txt);
    const timeStr = dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const temp = (item.main.temp - 273.15).toFixed(1);
    const icon = item.weather[0].icon;
    const description = item.weather[0].description;

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h4>${timeStr}</h4>
      <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}" />
      <p>${temp} °C</p>
      <p style="text-transform: capitalize;">${description}</p>
    `;
    container.appendChild(card);
  });
}

// Show 5-day forecast with daily high & low
function displayDailyForecast(data) {
  const container = document.getElementById("daily-forecast");
  container.innerHTML = "";

  // Group by date: find high & low temps per day
  const dailyTemps = {};

  data.list.forEach(item => {
    const date = item.dt_txt.split(" ")[0];
    const temp = item.main.temp - 273.15; // Kelvin to Celsius

    if (!dailyTemps[date]) {
      dailyTemps[date] = {
        high: temp,
        low: temp,
        icon: item.weather[0].icon,
      };
    } else {
      if (temp > dailyTemps[date].high) dailyTemps[date].high = temp;
      if (temp < dailyTemps[date].low) dailyTemps[date].low = temp;
    }
  });

  // Display only next 5 days
  Object.keys(dailyTemps).slice(0, 5).forEach(date => {
    const dayName = new Date(date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    const { high, low, icon } = dailyTemps[date];

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h4>${dayName}</h4>
      <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="Weather icon" />
      <p><strong>High:</strong> ${high.toFixed(1)} °C</p>
      <p><strong>Low:</strong> ${low.toFixed(1)} °C</p>
    `;
    container.appendChild(card);
  });
}

// Draw temperature trend chart for next 5 days (every 3 hours)
function displayChart(data) {
  const ctx = document.getElementById("weatherChart").getContext("2d");

  // Prepare labels and temps
  const labels = [];
  const temps = [];

  // Limit to next 40 data points max (5 days * 8 intervals)
  data.list.slice(0, 40).forEach(item => {
    const dateTime = new Date(item.dt_txt);
    const label = dateTime.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    labels.push(label);
    temps.push((item.main.temp - 273.15).toFixed(1));
  });

  // Destroy old chart if exists to avoid duplication
  if (window.myChart) window.myChart.destroy();

  window.myChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Temp (°C)",
        data: temps,
        borderColor: "#3498db",
        backgroundColor: "rgba(52, 152, 219, 0.2)",
        tension: 0.3,
        fill: true,
        pointRadius: 3,
        pointHoverRadius: 6,
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: false,
          title: {
            display: true
