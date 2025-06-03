const apiKey = "8c489a48d22949fbe9ca7d8b7ee22543"; // Replace with your actual OpenWeatherMap API key
const historyList = document.getElementById("historyList");

async function getWeather() {
  const city = document.getElementById("cityInput").value.trim();

  if (!city) return;

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.cod === 200) {
      // Display weather info
      document.getElementById("weatherResult").innerHTML = `
        <h3>${data.name}</h3>
        <p><strong>${data.weather[0].main}</strong>: ${data.weather[0].description}</p>
        <p>🌡️ Temperature: ${data.main.temp}°C</p>
        <p>💧 Humidity: ${data.main.humidity}%</p>
        <p>🌬️ Wind: ${data.wind.speed} m/s</p>
      `;

      // Add to search history
      const li = document.createElement("li");
      li.textContent = city;
      historyList.prepend(li); // Adds newest on top
    } else {
      document.getElementById("weatherResult").innerHTML = "City not found!";
    }
  } catch (error) {
    console.error("Error fetching weather:", error);
    document.getElementById("weatherResult").innerHTML = "Error fetching weather data.";
  }
}
