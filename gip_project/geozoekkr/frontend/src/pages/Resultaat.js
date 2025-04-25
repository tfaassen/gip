import React, { useEffect, useState ,useRef} from "react"; 
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/style_resultaat.css";

const Resultaat = () => {
  const isSaved = useRef(false);
  const location = useLocation();
  const navigate = useNavigate();
  const {
    distance = 0,
    score = 0,
    searchTime = 0,
    startLat = 0,
    startLng = 0,
    selectedLat = 0,
    selectedLng = 0,
  } = location.state || {};

  

  const saveGame = async () => {
    if (isSaved.current) return; // Controleer de vlag
    isSaved.current = true; // Stel de vlag in
  
    const token = localStorage.getItem('authToken');
    if (!token) {
      alert('Je moet ingelogd zijn om je score op te slaan!');
      return;
    }
  
    const response = await fetch('http://localhost:5000/save-game', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        score,
        searchTime, // Verstuur de verstreken tijd
      }),
    });
  
    const data = await response.json();
    if (response.ok) {
      alert('Game succesvol opgeslagen!');
    } else {
      alert(data.error || 'Er is iets misgegaan bij het opslaan van de game.');
    }
  };

  useEffect(() => {
    if (score >= 0) {
    saveGame();
  }}, [score]);

    useEffect(() => {
      if (
        typeof distance !== "string" || isNaN(parseFloat(distance)) ||
        typeof score !== "number" || score < 0 ||
        typeof searchTime !== "number" || searchTime < 0 ||
        typeof startLat !== "number" || isNaN(startLat) ||
        typeof startLng !== "number" || isNaN(startLng) ||
        typeof selectedLat !== "number" || isNaN(selectedLat) ||
        typeof selectedLng !== "number" || isNaN(selectedLng)
      ) {
        console.error("Ongeldige of ontbrekende parameters:", {
          distance,
          score,
          searchTime,
          startLat,
          startLng,
          selectedLat,
          selectedLng,
        });
        return;
      }
    
      checkForNewRecords(parseFloat(distance), searchTime);
      loadGoogleMapsScript(() => {
        initMap(startLat, startLng, selectedLat, selectedLng);
      });
    }, [distance, score, searchTime, startLat, startLng, selectedLat, selectedLng]);
  
  const checkForNewRecords = (newDistance, newTime) => {
    const bestDistance = parseFloat(localStorage.getItem("bestDistance")) || Infinity;
    const bestTime = parseFloat(localStorage.getItem("bestTime")) || Infinity;

    let message = "";

    if (newDistance < bestDistance) {
      localStorage.setItem("bestDistance", newDistance);
      message += `Nieuwe kortste afstand: ${newDistance} km!\n`;
    }

    if (newTime < bestTime) {
      localStorage.setItem("bestTime", newTime);
      message += `Nieuwe snelste tijd: ${newTime} sec!`;
    }

    if (message) {
      alert(message);
    }
  };

  const loadGoogleMapsScript = (callback) => {
    const existingScript = document.getElementById("googleMaps");
    if (!existingScript) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=&v=weekly`;
      script.id = "googleMaps";
      script.async = true;
      script.defer = true;
      script.onload = () => callback && callback();
      script.onerror = () => console.error("❌ Google Maps script kon niet worden geladen.");
      document.body.appendChild(script);
    } else {
      callback && callback();
    }
  };
  const initMap = (startLat, startLng, selectedLat, selectedLng) => {
    if (!window.google || !window.google.maps) {
      console.error("Google Maps API is not loaded.");
      return;
    }
  
    if (
      isNaN(startLat) || isNaN(startLng) ||
      isNaN(selectedLat) || isNaN(selectedLng)
    ) {
      console.error("Ongeldige coördinaten:", { startLat, startLng, selectedLat, selectedLng });
      return;
    }
  
    const startLocation = { lat: startLat, lng: startLng };
    const selectedLocation = { lat: selectedLat, lng: selectedLng };
  
    const map = new window.google.maps.Map(document.getElementById("map"), {
      disableDefaultUI: false,
    });
  
    new window.google.maps.Marker({
      position: startLocation,
      map: map,
      label: "S",
      title: "Startlocatie",
    });
  
    new window.google.maps.Marker({
      position: selectedLocation,
      map: map,
      label: "G",
      title: "Jouw gekozen locatie",
    });
  
    new window.google.maps.Polyline({
      path: [startLocation, selectedLocation],
      geodesic: true,
      strokeColor: "#FF0000",
      strokeOpacity: 1.0,
      strokeWeight: 2,
      map: map,
    });
  
    const bounds = new window.google.maps.LatLngBounds();
    bounds.extend(startLocation);
    bounds.extend(selectedLocation);
    map.fitBounds(bounds);
  };
  

  return (
    <div>
      <h1>Jouw Resultaat</h1>
      <div id="result-container">
        <div className="result-item">
          <h3>Afstand</h3>
          <p>{distance} km</p>
        </div>
        <div className="result-item">
          <h3>Score</h3>
          <p>{score}</p>
        </div>
        <div className="result-item">
          <h3>Tijd</h3>
          <p>{searchTime} sec</p> {/* Verstreken tijd wordt hier weergegeven */}
        </div>
      </div>
      <div id="map-container">
        <div id="map"></div>
      </div>
      <div id="button-container">
        <button onClick={() => navigate("/locatie")}>Speel Opnieuw</button>
        <button onClick={() => navigate("/")}>Terug naar Start</button>
      </div>
    </div>
  );
};

export default Resultaat;
