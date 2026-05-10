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
 
function renderhistory() {
    const listElement = document.querySelector("#list");
    if (listElement) {
        listElement.innerHTML = searchhistory.map(city => 
            `<li>${city}</li>`
        ).join("");
    }
}

const listElement = document.querySelector("#list");
listElement.addEventListener("click", (e) => {
    if (e.target.tagName === "LI") {
        const cityToRemove = e.target.textContent;
        searchhistory = searchhistory.filter(item => item !== cityToRemove);
        localStorage.setItem("weather_history", JSON.stringify(searchhistory));
        renderhistory();
    }
});

const click = document.querySelector("#searchbtn");
const type = document.querySelector("#city-input");

click.addEventListener("click", () => {
    const input = type.value;
    if (input) {
        getdata(input);
        type.value = "";
    } else {
        alert("Please enter the name of your city");
    }
});

const clear = document.querySelector("#clear");
clear.addEventListener("click", () => {
    if (confirm("Are you sure you want to clear your search history?")) {
        searchhistory = [];
        localStorage.removeItem("weather_history");
        renderhistory();
    }
});