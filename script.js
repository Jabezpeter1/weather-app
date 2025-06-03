const API_KEY = "8c489a48d22949fbe9ca7d8b7ee22543"; // <-- Replace with your OpenWeatherMap API key

document.getElementById("searchBtn").addEventListener("click", getWeather);
document.getElementById("cityInput").addEventListener("keyup", (e) => {
  if (e.key === "Enter") getWeather();
});

function kelvinToCelsius(k) {
  return (k - 273.15).toFixed(1);
}

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

function displayCurrent(data) {
  const temp = kelvinToCelsius(data.main.temp);
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

function displayHourlyForecast(data) {
  const container = document.getElementById("hourly-forecast");
  container.innerHTML = "";

  // Next 6 hours = next 2 intervals (3h each)
  const nextSixHours = data.list.slice(0, 2);

  nextSixHours.forEach(item => {
    const dateTime = new Date(item.dt_txt);
    const timeStr = dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const temp = kelvinToCelsius(item.main.temp);
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

function displayDailyForecast(data) {
  const container = document.getElementById("daily-forecast");
  container.innerHTML = "";

  const dailyTemps = {};

  data.list.forEach(item => {
    const date = item.dt_txt.split(" ")[0];
    const temp = item.main.temp - 273.15;

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

function displayChart(data) {
  const ctx = document.getElementById("weatherChart").getContext("2d");

  const labels = [];
  const temps = [];

  data.list.slice(0, 40).forEach(item => {
    const dateTime = new Date(item.dt_txt);
    const label = dateTime.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit' });
    labels.push(label);
    temps.push(kelvinToCelsius(item.main.temp));
  });

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
            display: true,
            text: "Temperature (°C)"
          }
        }
      }
    }
  });
}

function saveHistory(city) {
  let history = JSON.parse(localStorage.getItem("weatherSearchHistory")) || [];
  // Avoid duplicates
  if (!history.includes(city)) {
    history.unshift(city);
    if (history.length > 5) history.pop();
    localStorage.setItem("weatherSearchHistory", JSON.stringify(history));
  }
}

function displayHistory() {
  const container = document.getElementById("history");
  container.innerHTML = "";
  const history = JSON.parse(localStorage.getItem("weatherSearchHistory")) || [];

  history.forEach(city => {
    const card = document.createElement("div");
    card.className = "card";
    card.textContent = city;
    card.style.cursor = "pointer";
    card.onclick = () => {
      document.getElementById("cityInput").value = city;
      getWeather();
    };
    container.appendChild(card);
  });
}

// Load history on page load
window.onload = displayHistory;
