const API_KEY = "8c489a48d229fbe9ca7d8b7ee22543"; // Replace with your OpenWeatherMap API key

async function getWeather() {
  const city = document.getElementById("cityInput").value.trim();
  if (!city) return;

  const currentUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}`;

  try {
    const [currentRes, forecastRes] = await Promise.all([
      fetch(currentUrl),
      fetch(forecastUrl),
    ]);

    const currentData = await currentRes.json();
    const forecastData = await forecastRes.json();

    displayCurrent(currentData);
    displayForecast(forecastData);
    displayChart(forecastData);
    saveHistory(currentData);
    displayHistory();
  } catch (err) {
    alert("Could not fetch weather data.");
    console.error(err);
  }
}

function displayCurrent(data) {
  const temp = (data.main.temp - 273.15).toFixed(1);
  const condition = data.weather[0].description;
  const html = `
    <h3>${data.name}</h3>
    <p><strong>${temp} °C</strong></p>
    <p>${condition}</p>
    <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}.png" />
  `;
  document.getElementById("current-weather").innerHTML = html;
}

function displayForecast(data) {
  const forecastDiv = document.getElementById("forecast");
  forecastDiv.innerHTML = "";

  const dailyData = {};
  data.list.forEach(item => {
    const date = item.dt_txt.split(" ")[0];
    if (!dailyData[date]) {
      dailyData[date] = item;
    }
  });

  Object.values(dailyData).slice(0, 5).forEach(item => {
    const temp = (item.main.temp - 273.15).toFixed(1);
    const icon = item.weather[0].icon;
    const date = new Date(item.dt_txt).toLocaleDateString();

    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <h4>${date}</h4>
      <img src="https://openweathermap.org/img/wn/${icon}.png" />
      <p>${temp} °C</p>
    `;
    forecastDiv.appendChild(div);
  });
}

function displayChart(data) {
  const labels = [];
  const temps = [];

  data.list.forEach(item => {
    labels.push(item.dt_txt.slice(5, 16)); // MM-DD HH:mm
    temps.push((item.main.temp - 273.15).toFixed(1));
  });

  const ctx = document.getElementById("weatherChart").getContext("2d");
  new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Temp (°C)",
        data: temps,
        borderColor: "#3498db",
        backgroundColor: "rgba(52,152,219,0.2)",
        tension: 0.3,
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: false
        }
      }
    }
  });
}

function saveHistory(data) {
  const date = new Date().toLocaleDateString();
  const temp = (data.main.temp - 273.15).toFixed(1);
  const icon = data.weather[0].icon;

  const entry = { date, temp, icon };

  let history = JSON.parse(localStorage.getItem("weatherHistory")) || [];
  if (!history.some(item => item.date === date)) {
    history.push(entry);
    localStorage.setItem("weatherHistory", JSON.stringify(history));
  }
}

function displayHistory() {
  const history = JSON.parse(localStorage.getItem("weatherHistory")) || [];
  const container = document.getElementById("history");
  container.innerHTML = "";

  history.slice(-5).forEach(item => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <h4>${item.date}</h4>
      <img src="https://openweathermap.org/img/wn/${item.icon}.png" />
      <p>${item.temp} °C</p>
    `;
    container.appendChild(div);
  });
}

// Allow ENTER key to trigger search
document.getElementById("cityInput").addEventListener("keyup", function (event) {
  if (event.key === "Enter") {
    getWeather();
  }
});
