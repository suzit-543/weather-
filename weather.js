const apiKey = API_CONFIG.apikey;
let searchhistory = JSON.parse(localStorage.getItem("weather_history")) || [];
renderhistory();

async function getdata(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("City not found");
        }
        const data = await response.json();
        weatherdisplay(data);
        addtohistory(city);
    }
    catch (err) {
        document.querySelector("#display").innerHTML = `<p class="error">${err.message}</p>`;
    }
}

function weatherdisplay(data) {
    const display = document.querySelector("#display");
    const icon = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    
     if (data.main.temp > 25) {
        document.body.style.background = "linear-gradient(135deg, #f83600, #f9d423)";
    } else if (data.main.temp < 10) {
        document.body.style.background = "linear-gradient(135deg, #8e9eab, #eef2f3)";
    } else {
        document.body.style.background = "linear-gradient(135deg, #00b4db, #0083b0)";
    }

    display.innerHTML = `
        <h2>${data.name}, ${data.sys.country}</h2>
        <img src="${icon}" alt="weather icon">
        <p>Temperature: ${Math.round(data.main.temp)}°C</p>
        <p>Condition: ${data.weather[0].description}</p>
        <p>Humidity: ${data.main.humidity}%</p>
        <p>Wind speed: ${data.wind.speed} m/s</p>
        <p>Wind degree: ${data.wind.deg}°</p>
    `;
}

function addtohistory(city) {
    const lowerCity = city.toLowerCase().trim();
    if (!searchhistory.includes(lowerCity)) {
        searchhistory.unshift(lowerCity);
        searchhistory = searchhistory.slice(0, 5);
        localStorage.setItem("weather_history", JSON.stringify(searchhistory));
        renderhistory();
    }
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
                <button class="delete-btn">x</button>
            </li>
        `).join("");
    }
}

const click = document.querySelector("#searchbtn");
const type = document.querySelector("#city-input");
const listElement = document.querySelector("#list");
const clear = document.querySelector("#clear");

click.addEventListener("click", () => {
    const input = type.value.trim();
    if (input) {
        getdata(input);
        type.value = "";
    } else {
        alert("Please enter the name of your city");
    }
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