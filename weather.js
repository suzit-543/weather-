const apiKey = "befcd427358fd34c9f4ad25a43277fa2";
let searchhistory = JSON.parse(localStorage.getItem("weather_history")) || [];
renderhistory();

async function getdata(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
    try {
        const response= await fetch(url)
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
    display.innerHTML = `
      <h2>${data.name}, ${data.sys.country}</h2>
        <p>Temperature: ${data.main.temp}°C</p>
        <p>Condition: ${data.weather[0].description}</p>
        <p>Humidity: ${data.main.humidity}%</p>
    `
}

function addtohistory(city){
    if(!searchhistory.includes(city)){
        searchhistory.unshift(city);
        searchhistory=searchhistory.slice(0,5);
        localStorage.setItem("weather_history",JSON.stringify(searchhistory));
        renderhistory();
    }
}
 function renderhistory(){
    const listElement=document.querySelector("#list");
     if (listElement) {
        listElement.innerHTML = searchhistory.map(city => 
            `<li>${city}</li>`
        ).join("");
    }
}
 const click=document.querySelector("#searchbtn");
 const type=document.querySelector("#city-input");
 click.addEventListener("click",()=>{
    const input=type.value;
    if(input){
    getdata(input);
    type.value= "";}
    else{
        alert`Please enter the name of your city`;
    }
 })

 const clear=document.querySelector("#clear")
 clear.addEventListener("click",()=>{
    if (confirm("Are you sure you want to clear your search history?")){
    searchhistory=[];
    localStorage.removeItem("weather_history")
    renderhistory();
    }
 })