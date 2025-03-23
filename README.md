🌦️ Weather Forecast Web App

This is an interactive Weather Forecast Web Application that allows users to search for a city and retrieve real-time weather updates. The application features an interactive map with a satellite view option, automatic geolocation-based weather fetching, and a dark/light mode toggle for better user experience.

📂 Project Structure

🔹 index.html
Contains the main structure of the web app, including search functionality, weather details, an interactive map, and UI elements.

Uses Leaflet.js for map integration and supports both standard and satellite views.

🔹 style.css
Defines the styles for the entire web app, including layouts, colors, and animations.

Implements a responsive design, ensuring a seamless experience on desktops and mobile devices.

Includes support for light mode and dark mode themes.

🔹 script.js
Manages all interactive elements, including:

Fetching real-time weather data from wttr.in API.

Updating the weather UI dynamically based on user input.

Handling user location detection via the Geolocation API.

Integrating Leaflet.js for an interactive weather map.

Enabling users to switch between default and satellite map views.

Implementing theme toggles and sidebar animations.

🚀 Features

✔️ Search for Any City - Enter a location to retrieve real-time weather details.

✔️ Real-Time Weather Updates - Displays temperature, humidity, wind speed, UV index, and pressure.

✔️ Location Detection - Automatically fetches weather based on the user's location.

✔️ Interactive Map - Uses Leaflet.js for a dynamic map with zoom controls.

✔️ Satellite & Default Map Views - Switch between standard and satellite views.

✔️ Dark/Light Mode - User-selectable themes for better visual comfort.

✔️ Error Handling - Displays messages if the city is not found or data is unavailable.

✔️ Responsive UI - Works smoothly on desktops, tablets, and mobile devices.


🎯 How to Use

1.**Clone the repository:**
``bash
git clone https://github.com/Sensui-moksha/weather-forecast.git
cd weather-forecast-app``
2.Open index.html in your browser.

3.Enter a city name in the search box and click the search button.

4.View real-time weather data, including temperature, humidity, wind speed, and more.

5.Use the map to locate the searched city and toggle between different views.

6.Switch between dark mode and light mode as per your preference.

🔧 Technologies Used

HTML5 - Structure of the web app.

CSS3 - Styling and responsive design.

JavaScript (ES6) - Interactive elements and API integration.

Leaflet.js - Interactive mapping functionality.

wttr.in API - Fetching real-time weather data.

📌 Future Enhancements

🔹 Add a 7-day weather forecast feature.

🔹 Implement a graphical representation of weather trends.

🔹 Integrate more weather APIs for enhanced accuracy.

🔹 Allow users to save favorite locations for quick access.


🎯 Live Demo

🚀 Try it Live Here (Replace with the actual live link if hosted)

📜 License

This project is licensed under the MIT License – you are free to use, modify, and distribute it.

