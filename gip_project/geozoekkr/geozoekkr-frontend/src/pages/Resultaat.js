import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/style_resultaat.css";

const Resultaat = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { distance, score, searchTime, startLat, startLng, selectedLat, selectedLng } =
    location.state || {};

  useEffect(() => {
    if (!distance || !score || !searchTime || isNaN(startLat) || isNaN(startLng) || isNaN(selectedLat) || isNaN(selectedLng)) {
      console.error("Ongeldige of ontbrekende parameters.");
      return;
    }

    loadGoogleMapsScript(() => {
      initMap(startLat, startLng, selectedLat, selectedLng);
    });
  }, [distance, score, searchTime, startLat, startLng, selectedLat, selectedLng]);

  const loadGoogleMapsScript = (callback) => {
    const existingScript = document.getElementById("googleMaps");
    if (!existingScript) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=&v=weekly`;
      script.id = "googleMaps";
      document.body.appendChild(script);
      script.onload = () => callback && callback();
    } else {
      callback && callback();
    }
  };

  const initMap = (startLat, startLng, selectedLat, selectedLng) => {
    if (!window.google || !window.google.maps) {
      console.error("Google Maps API is not loaded.");
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
          <p>{searchTime} sec</p>
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