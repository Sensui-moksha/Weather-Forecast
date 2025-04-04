document.addEventListener("DOMContentLoaded", () => {
  const searchBox = document.querySelector(".search-box");
  const searchBtn = document.querySelector(".search-btn");
  const weatherContainer = document.querySelector(".weather");
  const errorContainer = document.querySelector(".error");
  const loadingIndicator = document.querySelector(".loading-indicator");
  const suggestionsContainer = document.querySelector(".suggestions");

  let map, marker;

  const initializeMap = async (lat = 25, lon = 0, zoomLevel = 17) => {
    if (!map) {
      map = L.map("map", {
        zoomControl: false,
        attributionControl: false,
      }).setView([lat, lon], zoomLevel);

      const satelliteLayer = L.tileLayer(
        `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}`
      ).addTo(map);

      map.createPane("labels");
      map.getPane("labels").style.zIndex = 650;
      map.getPane("labels").style.pointerEvents = "none";

      const labelsLayer = L.tileLayer(
        `https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png`
      ).addTo(map);

      L.control.zoom({ position: "bottomright" }).addTo(map);
    } else {
      map.setView([lat, lon], zoomLevel);
    }

    const locationName = await getLocationName(lat, lon);

    if (marker) {
      marker.setLatLng([lat, lon]).setPopupContent(locationName).openPopup();
    } else {
      marker = L.marker([lat, lon])
        .addTo(map)
        .bindPopup(locationName)
        .openPopup();
    }
  };

  const sanitizeLocationName = (name) => {
    // Remove non-English characters using a regular expression
    return name.replace(/[^a-zA-Z0-9\s,.-]/g, "");
  };

  const getLocationName = async (lat, lon) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
      );
      const data = await res.json();
      const rawName = data.display_name || "Unknown Location";
      return sanitizeLocationName(rawName);
    } catch (error) {
      console.error("Reverse Geocoding Failed:", error);
      return "Unknown Location";
    }
  };

  const loadingScreen = document.querySelector(".loading-screen");
  const showLoading = () => {
    loadingScreen.classList.add("show");
  };

  const hideLoading = () => {
    loadingScreen.classList.remove("show");
  };

  const fetchWeather = async (location) => {
    showLoading();
    try {
      const geocodeRes = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          location
        )}&format=json&limit=1`
      );
      const geocodeData = await geocodeRes.json();
      if (!geocodeData.length) throw new Error("Location not found");

      const { lat, lon } = geocodeData[0];
      const res = await fetch(`https://wttr.in/${lat},${lon}?format=j1`);
      if (!res.ok) throw new Error("Failed to fetch weather");

      const data = await res.json();
      updateWeatherUI(data, location, lat, lon);
    } catch (error) {
      showError("Could not fetch weather data. Try again later.");
    } finally {
      hideLoading();
    }
  };

  const updateWeatherUI = (data, city, lat, lon) => {
    city = sanitizeLocationName(city);
    const current = data.current_condition[0];
    const {
      temp_C,
      humidity,
      windspeedKmph,
      pressure,
      localObsDateTime,
      weatherCode,
    } = current;
    const weatherDesc = current.weatherDesc[0].value;
    const today = data.weather[0];

    document.querySelector(".city").textContent = city;
    document.querySelector(".temp").textContent = `${temp_C}°C`;
    document.querySelector(".description").textContent = weatherDesc;
    document.querySelector(
      ".text-information"
    ).textContent = ` Last Observation : ${localObsDateTime}`;
    document.querySelector(".temp-hi").textContent = ` H: ${today.maxtempC}°C`;
    document.querySelector(".temp-lo").textContent = ` L: ${today.mintempC}°C`;
    document.querySelector(
      ".pressure"
    ).textContent = ` Pressure: ${pressure} hPa`;
    document.querySelector(".humidity").textContent = ` Humidity: ${humidity}%`;
    document.querySelector(
      ".wind"
    ).textContent = ` Wind: ${windspeedKmph} km/h`;
    document.querySelector(
      ".weatherCode"
    ).textContent = ` WeatherCode: ${weatherCode}`;

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
    if (city) {
      fetchWeather(city);
      suggestionsContainer.innerHTML = ""; // Clear suggestions
    }
  });

  searchBox.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent default form submission behavior
      const city = searchBox.value.trim();
      if (city) {
        fetchWeather(city);
        suggestionsContainer.innerHTML = ""; // Clear suggestions
      }
    }
  });

  const fetchUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeatherByCoords(latitude, longitude, true);
          initializeMap(latitude, longitude, 17);
        },
        () => showError("Location access denied. Please search manually."),
        { enableHighAccuracy: true }
      );
    } else {
      showError("Geolocation is not supported by your browser.");
    }
  };

  const fetchWeatherByCoords = async (lat, lon, isPrecise = false) => {
    try {
      const res = await fetch(`https://wttr.in/${lat},${lon}?format=j1`);
      if (!res.ok) throw new Error("Location data error");

      const data = await res.json();
      const locationName = isPrecise ? ` ${lat},  ${lon}` : `${lat}, ${lon}`;
      updateWeatherUI(data, locationName, lat, lon); 
    } catch (error) {
      showError("Could not fetch location weather data.");
    }
  };

  const fetchSuggestions = async (query) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          query
        )}&format=json&addressdetails=1&limit=5`
      );
      const data = await res.json();
      displaySuggestions(data);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  const displaySuggestions = (locations) => {
    suggestionsContainer.innerHTML = "";
    if (locations.length === 0) {
      suggestionsContainer.innerHTML = "<li>No results found</li>";
      return;
    }
    locations.forEach((location) => {
      const li = document.createElement("li");
      li.textContent = `${location.display_name} (${location.lat}, ${location.lon})`;
      li.addEventListener("click", () => {
        searchBox.value = location.display_name;
        suggestionsContainer.innerHTML = "";
        fetchWeather(location.display_name);
      });
      suggestionsContainer.appendChild(li);
    });
  };

  searchBox.addEventListener("input", (e) => {
    const query = e.target.value.trim();
    if (query.length > 2) {
      fetchSuggestions(query);
    } else {
      suggestionsContainer.innerHTML = "";
    }
  });

  fetchUserLocation();
  initializeMap();
});
