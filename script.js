async function getWeather() {
    const city = document.getElementById("cityInput").value;
    const apiKey = "8c489a48d22949fbe9ca7d8b7ee22543"; // Replace with your OpenWeatherMap API key
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
  
    const response = await fetch(url);
    const data = await response.json();
  
    if (data.cod === 200) {
      document.getElementById("weatherResult").innerHTML = `
        <h2>${data.name}</h2>
        <p>${data.weather[0].description}</p>
        <p>Temp: ${data.main.temp}°C</p>
      `;
    } else {
      document.getElementById("weatherResult").innerHTML = "City not found!";
    }
  }
