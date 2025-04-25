import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate ,useLocation } from "react-router-dom";
import "../styles/style_locatie.css";

const MultiplayerGame = () => {
  const location = useLocation(); // Gebruik useLocation om de state te krijgen
  const sharedLocation = location.state?.location; // Haal de gedeelde locatie op
  const [timer, setTimer] = useState(150);
  const [selectedCoordinates, setSelectedCoordinates] = useState(null);
  const [streetViewStartCoordinates, setStreetViewStartCoordinates] = useState(null);
  const [panorama, setPanorama] = useState(null);
  const [mapExpanded, setMapExpanded] = useState(false);
  // Gebruik de API-key uit de environment variables
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  const [markerPlaced, setMarkerPlaced] = useState(false);  // Houdt bij of de marker is geplaatst
  const markerRef = useRef(null);  // We gebruiken useRef om de marker op te slaan



  const timerInterval = useRef(null);
  const navigate = useNavigate();
  const mapContainerRef = useRef(null);
  const streetViewServiceRef = useRef(null);
  const mapRef = useRef(null);
  const [startTime, setStartTime] = useState(null);
  const maxTime = 150; // 150 seconden
  // markerRef verwijderd omdat hij niet gebruikt wordt

  // Wrap initMap in useCallback om het te memoizen en de dependency-warning op te lossen
  const initMap = useCallback(() => {
    if (!window.google || !window.google.maps) {
      console.error("❌ Google Maps API is niet geladen. initMap() wordt later opnieuw geprobeerd.");
      return;
    }
  
    if (mapRef.current) {
      console.warn("⚠️ initMap() is al uitgevoerd, wordt niet opnieuw gestart.");
      return;
    }
  
    console.log("✅ initMap wordt uitgevoerd...");
  
    const streetViewService = new window.google.maps.StreetViewService();
    streetViewServiceRef.current = streetViewService;
  
    mapRef.current = new window.google.maps.Map(document.getElementById("map"), {
      zoom: 1,
      center: sharedLocation || { lat: 0, lng: 0 }, // Gebruik gedeelde locatie als middelpunt
      disableDefaultUI: true,
    });
  
    mapRef.current.addListener("click", (event) => {
      const position = { lat: event.latLng.lat(), lng: event.latLng.lng() };
  
      setSelectedCoordinates(position);
  
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
  
      markerRef.current = new window.google.maps.Marker({
        position,
        map: mapRef.current,
        title: "Jouw keuze",
      });
  
      setMarkerPlaced(true);
    });
  
    console.log("✅ Google Maps geladen:", sharedLocation);
    console.log("Bestaat #street-view in de DOM?", document.getElementById("street-view"));
    setTimeout(() => { findRandomStreetView(); }, 500); // Wacht een halve seconde
  }, []);

  // Zorg dat initMap als globale callback beschikbaar is
  useEffect(() => {
    window.initMap = initMap;
  }, [initMap]);

  useEffect(() => {
    if (!window.google || !window.google.maps) {
      if (!document.querySelector("script[src*='maps.googleapis.com']")) {
        console.log("📥 Google Maps script wordt toegevoegd...");
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
        script.async = true;
        script.defer = true;
        script.onerror = () => console.error("❌ Google Maps script kon niet worden geladen.");
        document.body.appendChild(script);
      } else {
        console.warn("⚠️ Google Maps script is al aanwezig, wacht op laden...");
      }
    } else {
      console.log("🔄 Google Maps is al geladen, initMap() starten...");
      initMap();
    }

    return () => {
      clearInterval(timerInterval.current);
    };
  }, [apiKey, initMap]);

  const toggleMap = () => {
    setMapExpanded((prev) => !prev);
  };

  function loadStreetView(location) {
    console.log("loadStreetView wordt aangeroepen met locatie:", location);

    const streetViewService = streetViewServiceRef.current;
    if (!streetViewService) {
      console.error("❌ Street View Service is niet geladen.");
      return;
    }

    streetViewService.getPanorama({ location, radius: 5000 }, (data, status) => {
      console.log("Street View Status:", status);
  
      if (status === window.google.maps.StreetViewStatus.OK) {
        console.log("✅ Street View gevonden:", data.location.latLng);

        setStreetViewStartCoordinates({
          lat: data.location.latLng.lat(),
          lng: data.location.latLng.lng(),
        });

        const streetViewElement = document.getElementById("street-view");

        if (!streetViewElement) {
          console.error("❌ Street View element niet gevonden in DOM!");
          return;
        }
  
        streetViewElement.style.width = "100%";
        streetViewElement.style.height = "100vh";

        const panoramaInstance = new window.google.maps.StreetViewPanorama(
          streetViewElement,
          {
            position: data.location.latLng,
            pov: { heading: 0, pitch: 0 },
            zoom: 1,
            fullscreenControl: false,
            enableCloseButton: false,
            addressControl: false,
            linksControl: false,
            showRoadLabels: false,
          }
        );

        console.log("✅ Street View is geïnitialiseerd!");
        setPanorama(panoramaInstance);
  
        // Start de timer alleen als deze nog niet loopt
        if (!timerInterval.current) {
          startTimer();
        }
      } else {
        console.warn("⚠️ Geen Street View gevonden, nieuwe poging...");
        findRandomStreetView();
      }
    });
  }
  
  function getRandomLocation() {
    return {
      lat: parseFloat((Math.random() * 180 - 90).toFixed(6)),
      lng: parseFloat((Math.random() * 360 - 180).toFixed(6)),
    };
  }
  useEffect(() => {
    if (sharedLocation) {
      console.log("Gedeelde locatie ontvangen:", sharedLocation);
      loadStreetView(sharedLocation); // Gebruik de gedeelde locatie
    } else {
      console.warn("Geen gedeelde locatie ontvangen.");
      loadStreetView({ lat: 52.379189, lng: 4.900826 }); // Fallback locatie
    }
  }, [sharedLocation]);
  
  
  function findRandomStreetView(attempts = 0) {
    const location = getRandomLocation();
    console.log(`🔄 Poging ${attempts + 1}: Zoek Street View op`, location);
  
    streetViewServiceRef.current.getPanorama({ location, radius: 5000 }, (data, status) => {
      if (status === window.google.maps.StreetViewStatus.OK) {
        console.log("✅ Geldige Street View gevonden:", data.location.latLng);
        loadStreetView(data.location.latLng);
      } else {
        console.warn("⚠️ Geen Street View gevonden, nieuwe poging...");
        findRandomStreetView(attempts + 1);
      }
    });
  }

  useEffect(() => {
    if (mapContainerRef.current) {
      mapContainerRef.current.classList.toggle("collapsed", !mapExpanded);
    }
  }, [mapExpanded]);

  function startTimer() {
    // Stop een bestaande interval als die al actief is
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
    }
  
    setStartTime(Date.now()); // Sla de huidige tijd op wanneer de timer start
    timerInterval.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerInterval.current); // Stop de interval als de timer 0 bereikt
          lockStreetView();
          return 0;
        }
        return prev - 1;
      });
    }, 1000); // Interval van 1 seconde
  }
  useEffect(() => {
    const timerElement = document.getElementById("timer");
  
    if (timer <= 30) {
      timerElement.style.color = "orange";
    } else {
      timerElement.style.color = "green";
    }
  
    if (timer === 0) {
      timerElement.style.color = "red";
    }
  }, [timer]);
  
  

  function lockStreetView() {
    if (panorama) {
      panorama.setOptions({
        disableDefaultUI: true,
        draggable: false,
        linksControl: false,
        motionTracking: false,
        motionTrackingControl: false,
        clickToGo: false,
        keyboardShortcuts: false,
      });

      window.addEventListener(
        "keydown",
        (event) => {
          if (
            ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "+", "=", "_", "-"].includes(event.key) &&
            !event.metaKey &&
            !event.altKey &&
            !event.ctrlKey
          ) {
            event.stopPropagation();
          }
        },
        { capture: true }
      );

      alert("Tijd voorbij! Je kunt niet meer bewegen.");
    }
  }

  function calculateDistance(coord1, coord2) {
    if (!coord1 || !coord2) {
      console.error("Ongeldige coördinaten:", coord1, coord2);
      return 0;
    }
    const R = 6371;
    const dLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
    const dLng = ((coord2.lng - coord1.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((coord1.lat * Math.PI) / 180) *
        Math.cos((coord2.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    const distance = R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
    return Number.isFinite(distance) ? distance : 0;
  }

  function stopTimer() {
    return Math.min(timer, 150);
  }

  function calculateScore(distance) {
    let score = 5000;
    if (distance <= 4) {
      score -= distance * 0;
    } else if (distance <= 10) {
      score -= (4 * 0) + ((distance - 4) * 1);
    } else if (distance <= 100) {
      score -= (6 * 1) + ((distance - 10) * 5);
    } else if (distance <= 1000) {
      score -= (100 * 5) + ((distance - 100) * 10);
    } else {
      score -= (100 * 5) + ((distance - 100) * 15);
    }
    return Math.max(Math.round(score), 0);
  }

  function handleSearch() {
    if (selectedCoordinates && streetViewStartCoordinates) {
      const elapsedTime = Math.floor((Date.now() - startTime) / 1000); // Verstreken tijd in seconden
      const distance = calculateDistance(streetViewStartCoordinates, selectedCoordinates);
      if (typeof distance !== "number" || isNaN(distance)) {
        console.error("Ongeldige afstand:", distance);
        return;
      }
      const score = calculateScore(distance);
  
      navigate("/resultaat", {
        state: {
          elapsedTime, // Verstreken tijd
          distance: distance.toFixed(2), // Afstand
          startLat: streetViewStartCoordinates.lat, // Startlocatie (latitude)
          startLng: streetViewStartCoordinates.lng, // Startlocatie (longitude)
          selectedLat: selectedCoordinates.lat, // Gekozen locatie (latitude)
          selectedLng: selectedCoordinates.lng, // Gekozen locatie (longitude)
          searchTime: elapsedTime, // Tijd (verstreken tijd)
          score, // Score
        },
      });
      console.log("Navigeren naar resultaat met de volgende parameters:", {
        elapsedTime,
        distance,
        startLat: streetViewStartCoordinates?.lat,
        startLng: streetViewStartCoordinates?.lng,
        selectedLat: selectedCoordinates?.lat,
        selectedLng: selectedCoordinates?.lng,
        searchTime: elapsedTime,
        score,
      });
    } else {
      console.warn("Geen coördinaten geselecteerd!");
    }
  }
  

  return (
    <div>
      <div id="timer-container">
        <div id="timer-label">
          Tijd over:{" "}
          <span id="timer">
            {Math.floor(timer / 60)}:
            {(timer % 60).toString().padStart(2, "0")}
          </span>
        </div>
        <div className="progress-bar">
          <span
            id="progress-bar-fill"
            style={{ width: `${(timer / 150) * 100}%` }}
          ></span>
        </div>
      </div>

      <div id="street-view"></div>

     


      <div id="map-container" ref={mapContainerRef} className="collapsed">
        <div id="toggle-map" onClick={toggleMap}>
          {mapExpanded ? "▼" : "▲"}
        </div>
        <div id="map"></div>
      </div>
      {markerPlaced && (
        <button id="result-button" onClick={handleSearch}>
          Bekijk Afstand
        </button>
      )}
    </div>
  );
};

export default MultiplayerGame;