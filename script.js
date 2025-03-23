document.addEventListener("DOMContentLoaded", () => {
    const searchBox = document.querySelector(".search-box");
    const searchBtn = document.querySelector(".search-btn");
    const weatherContainer = document.querySelector(".weather");
    const errorContainer = document.querySelector(".error");
    const loadingIndicator = document.querySelector(".loading-indicator");
    const themeSelect = document.getElementById("theme-select");
    const satelliteBtn = document.getElementById("satellite-btn");
    const menuBtn = document.getElementById("menu-btn");
    const zoomInBtn = document.getElementById("zoom-in");
    const zoomOutBtn = document.getElementById("zoom-out");
    const sidebar = document.querySelector(".sidebar");
    const body = document.body;
    const zoomControls = document.querySelector(".zoom-controls");

    let map, marker, currentTileLayer;
    let isSatelliteView = false;

    const initializeMap = async (lat = 20, lon = 0) => {
        if (!map) {
            map = L.map('map').setView([lat, lon], 2);
            currentTileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(map);
        } else {
            map.setView([lat, lon], 10);
        }

        const locationName = await getLocationName(lat, lon);

        if (marker) {
            marker.setLatLng([lat, lon]).setPopupContent(locationName).openPopup();
        } else {
            marker = L.marker([lat, lon]).addTo(map).bindPopup(locationName).openPopup();
        }
    };

    const getLocationName = async (lat, lon) => {
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
            const data = await res.json();
            return data.display_name || "Unknown Location";
        } catch (error) {
            console.error("Reverse Geocoding Failed:", error);
            return "Unknown Location";
        }
    };

    const fetchWeather = async (location) => {
        weatherContainer.classList.add("loading");
        errorContainer.style.display = "none";
        loadingIndicator.style.display = "block";

        try {
            const res = await fetch(`https://wttr.in/${location}?format=j1`);
            if (!res.ok) throw new Error("Failed to fetch weather");
            const data = await res.json();
            updateWeatherUI(data, location);
        } catch (error) {
            showError("Could not fetch weather data. Try again later.");
        }
    };

    const updateWeatherUI = (data, city) => {
        const current = data.current_condition[0];
        const { temp_C, humidity, windspeedKmph, uvIndex, pressure, localObsDateTime } = current;
        const weatherDesc = current.weatherDesc[0].value;
        const today = data.weather[0];
        const lat = parseFloat(data.nearest_area[0].latitude);
        const lon = parseFloat(data.nearest_area[0].longitude);

        document.querySelector(".city").textContent = city;
        document.querySelector(".temp").textContent = `${temp_C}°C`;
        document.querySelector(".description").textContent = weatherDesc;
        document.querySelector(".text-information").textContent = `Last Observation : ${localObsDateTime}`;
        document.querySelector(".temp-hi").textContent = `H:  ${today.maxtempC}°C`;
        document.querySelector(".temp-lo").textContent = `L:  ${today.mintempC}°C`;
        document.querySelector(".pressure").textContent = `Pressure:  ${pressure}`;
        document.querySelector(".humidity").textContent = `Humidity:  ${humidity}%`;
        document.querySelector(".wind").textContent = `Wind:  ${windspeedKmph} km/h`;
        document.querySelector(".uv-index").textContent = `UV Index:  ${uvIndex}`;

        initializeMap(lat, lon);

        loadingIndicator.style.display = "none";
        weatherContainer.classList.remove("loading");
    };

    const showError = (message) => {
        errorContainer.style.display = "block";
        errorContainer.textContent = message;
        loadingIndicator.style.display = "none";
        weatherContainer.classList.remove("loading");
    };

    searchBtn.addEventListener("click", () => {
        const city = searchBox.value.trim();
        if (city) fetchWeather(city);
    });

    searchBox.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            const city = searchBox.value.trim();
            if (city) fetchWeather(city);
        }
    });

    const fetchUserLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    fetchWeather(`${latitude},${longitude}`);
                    initializeMap(latitude, longitude);
                },
                () => showError("Location access denied. Please search manually."),
                { enableHighAccuracy: true }
            );
        } else {
            showError("Geolocation is not supported by your browser.");
        }
    };
    fetchUserLocation();

    const applyTheme = (theme) => {
        document.body.classList.remove("light-mode", "dark-mode");
        if (theme === "light") {
            document.body.classList.add("light-mode");
        } else if (theme === "dark") {
            document.body.classList.add("dark-mode");
        }
    };

    themeSelect.addEventListener("change", () => {
        const selectedTheme = themeSelect.value;
        if (selectedTheme === "system") {
            const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            applyTheme(systemPrefersDark ? "dark" : "light");
        } else {
            applyTheme(selectedTheme);
        }
    });

    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    themeSelect.value = "system";
    applyTheme(systemPrefersDark ? "dark" : "light");

    satelliteBtn.addEventListener("click", () => {
        if (currentTileLayer) {
            map.removeLayer(currentTileLayer);
        }

        if (!isSatelliteView) {
            currentTileLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                attribution: 'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community'
            });
            satelliteBtn.textContent = "Default View";
        } else {
            currentTileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            });
            satelliteBtn.textContent = "Satellite View";
        }

        currentTileLayer.addTo(map);
        isSatelliteView = !isSatelliteView;
    });

    menuBtn.addEventListener("click", () => {
        sidebar.classList.toggle("active");
        body.classList.toggle("sidebar-open");

        if (window.innerWidth <= 768) {
            map.invalidateSize();
        }

        if (sidebar.classList.contains("active")) {
            zoomControls.style.display = "none";
        } else {
            zoomControls.style.display = "flex";
        }
    });

    zoomInBtn.addEventListener("click", () => {
        if (map) map.zoomIn();
    });

    zoomOutBtn.addEventListener("click", () => {
        if (map) map.zoomOut();
    });
});
