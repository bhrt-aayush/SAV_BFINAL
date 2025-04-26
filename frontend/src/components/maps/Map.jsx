import { useEffect, useRef, useCallback } from "react";
import leaflet from "leaflet";
import "leaflet/dist/leaflet.css"; // Leaflet styles
import useLocalStorage from "../../hooks/useLocalStorage";
import useGeolocation from "../../hooks/useGeolocation";
import FindMeButton from "./FindMeButton";
import "./Map.css";

export default function Map({ 
  onLocationSelect, 
  initialLocation, 
  locationConfirmed,
  onFindMeLocation 
}) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const userMarkerRef = useRef(null);
  const popupRef = useRef(null);
  const mapInitializedRef = useRef(false);

  const { position, loading, error, getCurrentPosition } = useGeolocation();

  const [userPosition, setUserPosition] = useLocalStorage("USER_MARKER", {
    latitude: 0,
    longitude: 0
  });

  const [nearbyMarkers] = useLocalStorage("NEARBY_MARKERS", []);

  // Memoize updateMarker to prevent recreation on each render
  const updateMarker = useCallback((lat, lng, popupText) => {
    if (!mapInstanceRef.current) return;

    if (userMarkerRef.current) {
      mapInstanceRef.current.removeLayer(userMarkerRef.current);
    }

    userMarkerRef.current = leaflet
      .marker([lat, lng], {
        icon: leaflet.divIcon({
          className: "custom-marker",
          html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="38" height="38" fill="${
            locationConfirmed ? "#4CAF50" : "#FF5722"
          }">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>`,
          iconSize: [38, 38],
          iconAnchor: [19, 38],
          popupAnchor: [0, -38],
        }),
      })
      .addTo(mapInstanceRef.current);

    popupRef.current = leaflet.popup().setContent(popupText);
    userMarkerRef.current.bindPopup(popupRef.current).openPopup();

    if (locationConfirmed) {
      const el = userMarkerRef.current.getElement();
      if (el) {
        el.style.filter = "hue-rotate(120deg)";
      }
    }
  }, [locationConfirmed]);

  // Fetch geolocation if missing
  useEffect(() => {
    const checkAndFetchLocation = async () => {
      if (position.latitude === 0 && position.longitude === 0) {
        try {
          await getCurrentPosition();
        } catch (err) {
          console.error("Could not get current location:", err);
        }
      } else if (!initialLocation && onFindMeLocation && 
                (position.latitude !== userPosition.latitude || 
                 position.longitude !== userPosition.longitude)) {
        // Only update if position changed to prevent loops
        setUserPosition({ ...position });
        onFindMeLocation(position);
      }
    };

    checkAndFetchLocation();
  }, [position.latitude, position.longitude, getCurrentPosition, initialLocation, onFindMeLocation]);

  // Initialize map - only runs once
  useEffect(() => {
    // Return early if map is already initialized or ref not available
    if (mapInitializedRef.current || !mapRef.current) return;
    
    const defaultLat = userPosition.latitude || 0;
    const defaultLng = userPosition.longitude || 0;

    mapInstanceRef.current = leaflet.map(mapRef.current).setView([defaultLat, defaultLng], 13);

    leaflet
      .tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
          '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      })
      .addTo(mapInstanceRef.current);

    // Mark map as initialized
    mapInitializedRef.current = true;

    // Use requestAnimationFrame for more reliable timing
    requestAnimationFrame(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });

    // Block further clicks if confirmed
    mapInstanceRef.current.on("click", (e) => {
      if (locationConfirmed) return;

      const { lat, lng } = e.latlng;
      const location = { latitude: lat, longitude: lng };

      setUserPosition(location);
      if (onLocationSelect) {
        onLocationSelect(location, false);
      }

      updateMarker(lat, lng, "Selected Location");
    });

    // Add nearby markers
    nearbyMarkers.forEach(({ latitude, longitude }) => {
      leaflet
        .marker([latitude, longitude])
        .addTo(mapInstanceRef.current)
        .bindPopup(`lat: ${latitude.toFixed(2)}, long: ${longitude.toFixed(2)}`);
    });

    if (defaultLat !== 0 || defaultLng !== 0) {
      updateMarker(defaultLat, defaultLng, "Your Location");
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        userMarkerRef.current = null;
        mapInitializedRef.current = false;
      }
    };
  }, []); // Empty dependency array - only run once on mount

  // Handle window resize events to keep map properly sized
  useEffect(() => {
    const handleResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Update marker if initialLocation changes
  useEffect(() => {
    if (!mapInstanceRef.current || !initialLocation) return;

    const { latitude, longitude } = initialLocation;
    if (latitude && longitude) {
      mapInstanceRef.current.setView([latitude, longitude], 15);
      updateMarker(
        latitude,
        longitude,
        locationConfirmed ? "Confirmed Location" : "Selected Location"
      );
    }
  }, [initialLocation, locationConfirmed, updateMarker]);

  const handleFindMe = useCallback((e) => {
    if (e) e.preventDefault();
    if (locationConfirmed) return;
    if (!mapInstanceRef.current) return;

    if (position.latitude !== 0 && position.longitude !== 0) {
      mapInstanceRef.current.setView([position.latitude, position.longitude], 15);

      const location = { latitude: position.latitude, longitude: position.longitude };
      setUserPosition(location);

      if (onFindMeLocation) {
        onFindMeLocation(location);
      }

      updateMarker(position.latitude, position.longitude, "Your Current Location");

      if (onLocationSelect) {
        onLocationSelect(location, true);
      }
    } else {
      getCurrentPosition()
        .then(() => {
          if (position.latitude !== 0 && position.longitude !== 0) {
            // We need to handle this in the next useEffect since position will update
          }
        })
        .catch((err) => {
          console.error("Error getting position:", err);
        });
    }
  }, [position, locationConfirmed, getCurrentPosition, setUserPosition, onFindMeLocation, updateMarker, onLocationSelect]);

  return (
    <div className="map-container" style={{ position: "relative" }}>
    <div
      id="map"
      ref={mapRef}
      style={{
        width: "100%",
        height: "300px",
        pointerEvents: locationConfirmed ? "none" : "auto",
        opacity: locationConfirmed ? 0.9 : 1,
      }}
    />
  
  {!locationConfirmed && (
  <div className="find-me-button-wrapper">
    <FindMeButton onFindMe={handleFindMe} loading={loading} error={error} />
  </div>
)}

</div>

  );
}