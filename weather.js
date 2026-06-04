const apiKey = API_CONFIG.apiKey;
let searchhistory = JSON.parse(localStorage.getItem("weather_history")) || [];
let currentTempC = null;
let isCelsius = true;

renderhistory();

async function getdata(city) {
    const display = document.querySelector("#display");
    display.innerHTML = `<p class="loading">⏳ Fetching weather for <strong>${city}</strong>...</p>`;

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("City not found. Please check the spelling and try again.");
        }
        const data = await response.json();
        currentTempC = data.main.temp;
        isCelsius = true;
        weatherdisplay(data);
        addtohistory(city);
        getforecast(city);
    } catch (err) {
        display.innerHTML = `<p class="error">❌ ${err.message}</p>`;
        document.querySelector("#forecast-container").innerHTML = "";
    }
}


async function getforecast(city) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&cnt=40&appid=${apiKey}`;
    try {
        const response = await fetch(url);
        if (!response.ok) return;
        const data = await response.json();
        const seen = {};
        const days = data.list.filter(entry => {
            const day = entry.dt_txt.split(" ")[0];
            if (!seen[day]) {
                seen[day] = true;
                return true;
            }
            return false;
        }).slice(1, 6);

        const forecastContainer = document.querySelector("#forecast-container");
        forecastContainer.innerHTML = `
            <div class="forecast-title">5-Day Forecast</div>
            <div class="forecast-strip">
                ${days.map(entry => {
            const date = new Date(entry.dt_txt);
            const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
            const icon = `https://openweathermap.org/img/wn/${entry.weather[0].icon}.png`;
            const temp = Math.round(entry.main.temp);
            return `
                        <div class="forecast-card">
                            <p class="f-day">${dayName}</p>
                            <img src="${icon}" alt="${entry.weather[0].description}">
                            <p class="f-temp">${temp}°C</p>
                        </div>
                    `;
        }).join("")}
            </div>
        `;
    } catch (err) {

    }
}


async function getdatabylocation(lat, lon) {
    const display = document.querySelector("#display");
    display.innerHTML = `<p class="loading">⏳ Detecting your location...</p>`;

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Could not get weather for your location.");
        const data = await response.json();
        currentTempC = data.main.temp;
        isCelsius = true;
        weatherdisplay(data);
        addtohistory(data.name);
        getforecast(data.name);
    } catch (err) {
        display.innerHTML = `<p class="error">❌ ${err.message}</p>`;
    }
}

function weatherdisplay(data) {
    const display = document.querySelector("#display");
    const icon = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    const condition = data.weather[0].main;
    const temp = Math.round(data.main.temp);
    const updatedTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const backgrounds = {
        Clear: "linear-gradient(135deg, #f83600, #f9d423)",
        Clouds: "linear-gradient(135deg, #757f9a, #d7dde8)",
        Rain: "linear-gradient(135deg, #373b44, #4286f4)",
        Drizzle: "linear-gradient(135deg, #4b6cb7, #182848)",
        Thunderstorm: "linear-gradient(135deg, #0f0c29, #302b63)",
        Snow: "linear-gradient(135deg, #e0eafc, #cfdef3)",
        Mist: "linear-gradient(135deg, #606c88, #3f4c6b)",
        Fog: "linear-gradient(135deg, #606c88, #3f4c6b)",
        Haze: "linear-gradient(135deg, #f7971e, #ffd200)",
    };
    document.body.style.background = backgrounds[condition] || "linear-gradient(135deg, #00b4db, #0083b0)";

    display.innerHTML = `
        <h2>${data.name}, ${data.sys.country}</h2>
        <img src="${icon}" alt="${data.weather[0].description}">
        <p id="temp-display">Temperature: ${temp}°C</p>
        <button id="togglebtn">Switch to °F</button>
        <p>Condition: ${data.weather[0].description}</p>
        <p>Humidity: ${data.main.humidity}%</p>
        <p>Wind speed: ${data.wind.speed} m/s</p>
        <p class="updated">Last updated: ${updatedTime}</p>
    `;
    document.querySelector("#togglebtn").addEventListener("click", toggletemp);
}

function toggletemp() {
    if (currentTempC === null) return;
    const tempDisplay = document.querySelector("#temp-display");
    const togglebtn = document.querySelector("#togglebtn");

    if (isCelsius) {
        const fahrenheit = Math.round((currentTempC * 9) / 5 + 32);
        tempDisplay.textContent = `Temperature: ${fahrenheit}°F`;
        togglebtn.textContent = "Switch to °C";
        isCelsius = false;
    } else {
        tempDisplay.textContent = `Temperature: ${Math.round(currentTempC)}°C`;
        togglebtn.textContent = "Switch to °F";
        isCelsius = true;
    }
}


function addtohistory(city) {
    const lowerCity = city.toLowerCase().trim();
    searchhistory = [lowerCity, ...searchhistory.filter(c => c !== lowerCity)].slice(0, 5);
    localStorage.setItem("weather_history", JSON.stringify(searchhistory));
    renderhistory();
}

function deleteCity(city) {
    searchhistory = searchhistory.filter(item => item !== city);
    localStorage.setItem("weather_history", JSON.stringify(searchhistory));
    renderhistory();
}

function renderhistory() {
    const listElement = document.querySelector("#list");
    if (listElement) {
        listElement.innerHTML = searchhistory.map(city => `
            <li class="history-item">
                <span class="city-name">${city}</span>
                <button class="delete-btn" aria-label="Remove ${city}">×</button>
            </li>
        `).join("");
    }
}

const click = document.querySelector("#searchbtn");
const type = document.querySelector("#city-input");
const listElement = document.querySelector("#list");
const clear = document.querySelector("#clear");
const locationbtn = document.querySelector("#locationbtn");

click.addEventListener("click", () => {
    const input = type.value.trim();
    if (input) {
        getdata(input);
        type.value = "";
    } else {
        alert("Please enter the name of your city");
    }
});

type.addEventListener("keydown", (e) => {
    if (e.key === "Enter") click.click();
});

clear.addEventListener("click", () => {
    if (confirm("Are you sure you want to clear your search history?")) {
        searchhistory = [];
        localStorage.removeItem("weather_history");
        renderhistory();
    }
});

listElement.addEventListener("click", (e) => {
    const li = e.target.closest("li");
    if (!li) return;
    const cityName = li.querySelector(".city-name").textContent;
    if (e.target.classList.contains("delete-btn")) {
        deleteCity(cityName);
    } else {
        getdata(cityName);
    }
});

locationbtn.addEventListener("click", () => {
    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser.");
        return;
    }
    navigator.geolocation.getCurrentPosition(
        (position) => {
            getdatabylocation(position.coords.latitude, position.coords.longitude);
        },
        () => {
            alert("Unable to get your location. Please allow location access and try again.");
        }
    );
});
