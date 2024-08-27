document.addEventListener("DOMContentLoaded", () => {
    const apiKey = "7f66c05db3964abf9b843503242608";
    const cities = ["New York", "London", "Paris", "Tokyo", "Sydney"];
    const datalist = document.querySelector("#city-suggestions");

    cities.forEach(city => {
        const option = document.createElement("option");
        option.value = city;
        datalist.appendChild(option);
    });

    const cache = {};

    function formatTime(date) {
        let hours = date.getHours();
        hours = hours < 10 ? `0${hours}` : hours;

        let minutes = date.getMinutes();
        minutes = minutes < 10 ? `0${minutes}` : minutes;

        return `${hours}:${minutes}`;
    }

    function formatDay(date) {
        const dayArray = date.getDay();
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        return days[dayArray];
    }

    function displayWeatherInfo(response) {
        const location = response.location;
        const current = response.current;

        const cityElement = document.querySelector("#searched-city");
        if (cityElement) {
            cityElement.innerHTML = `${location.name}, ${location.country}`;
        }

        const temperatureElement = document.querySelector("#current-temperature");
        if (temperatureElement) {
            temperatureElement.innerHTML = `${Math.round(current.temp_c)}°C`;
        }

        const humidityElement = document.querySelector("#humidity");
        if (humidityElement) {
            humidityElement.innerHTML = `${current.humidity}%`;
        }

        const windElement = document.querySelector("#wind");
        if (windElement) {
            windElement.innerHTML = `${Math.round(current.wind_kph)} km/h`;
        }

        const weatherTypeElement = document.querySelector("#weather-type");
        if (weatherTypeElement) {
            weatherTypeElement.innerHTML = current.condition.text;
        }

        const weatherIconElement = document.querySelector("#weather-icon");
        if (weatherIconElement) {
            const weatherIcon = new Image();
            weatherIcon.src = current.condition.icon;
            weatherIcon.onload = () => {
                weatherIconElement.src = current.condition.icon;
                weatherIconElement.style.display = "block";
            };
        }

        const forecast = response.forecast.forecastday;
        displayForecast(forecast);
    }

    function displayForecast(forecast) {
        const forecastContainer = document.querySelector("#forecast");
        if (forecastContainer) {
            forecastContainer.innerHTML = ""; 

            forecast.forEach(day => {
                const date = new Date(day.date);
                const dayName = formatDay(date);
                const temperature = Math.round(day.day.avgtemp_c);
                const iconUrl = day.day.condition.icon;
                const weatherType = day.day.condition.text;

                const forecastItem = `
                    <div class="forecast-item">
                        <h4>${dayName}</h4>
                        <img src="${iconUrl}" alt="${weatherType}">
                        <p>${temperature}°C</p>
                        <p>${weatherType}</p>
                    </div>
                `;

                forecastContainer.innerHTML += forecastItem;
            });
        }
    }

    function sortForecast(forecast, key) {
        return forecast.sort((a, b) => a.day[key] - b.day[key]);
    }

    function handleApiError(error) {
        console.error("Error fetching weather data:", error);
        const errorContainer = document.querySelector("#error-message");
        if (errorContainer) {
            errorContainer.innerHTML = "Unable to retrieve weather data. Please try again later.";
        }
    }

    function searchCity(city) {
        if (cache[city]) {
            displayWeatherInfo(cache[city]);
        } else {
            const apiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=3`;
            axios.get(apiUrl)
                .then(response => {
                    cache[city] = response.data;
                    displayWeatherInfo(response.data);
                })
                .catch(handleApiError);
        }
    }

    function searchByLocation(lat, lon) {
        const apiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${lat},${lon}&days=3`;
        axios.get(apiUrl)
            .then(response => {
                displayWeatherInfo(response.data);
            })
            .catch(handleApiError);
    }

    function getCurrentLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const { latitude, longitude } = position.coords;
                searchByLocation(latitude, longitude);
            }, () => {
                handleApiError("Unable to retrieve your location");
            });
        } else {
            handleApiError("Geolocation is not supported by your browser");
        }
    }

    const searchBar = document.querySelector("#search-form");
    if (searchBar) {
        searchBar.addEventListener("submit", event => {
            event.preventDefault();
            const city = document.querySelector("#search-input").value;
            searchCity(city);
        });
    }

    const gpsIcon = document.querySelector("#gps-icon");
    if (gpsIcon) {
        gpsIcon.addEventListener("click", getCurrentLocation);
    }


    const currentTime = document.querySelector("#current-time");
    const currentDay = document.querySelector("#current-day");
    const newCurrentTime = new Date();
    if (currentTime) {
        currentTime.innerHTML = formatTime(newCurrentTime);
    }
    if (currentDay) {
        currentDay.innerHTML = formatDay(newCurrentTime);
    }
});
