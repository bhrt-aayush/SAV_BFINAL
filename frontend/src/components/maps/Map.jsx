import { useEffect, useRef, useState } from "react";
import leaflet from "leaflet";
import "leaflet/dist/leaflet.css"; // Make sure to import Leaflet CSS
import useLocalStorage from "../../hooks/useLocalStorage";
import useGeolocation from "../../hooks/useGeolocation";
import FindMeButton from "./FindMeButton";

export default function Map({ 
  onLocationSelect, 
  initialLocation, 
  locationConfirmed,
  onFindMeLocation // New prop for handling current location
}) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const userMarkerRef = useRef(null);
  const popupRef = useRef(null);

  const { position, loading, error, getCurrentPosition } = useGeolocation();
  
  const [userPosition, setUserPosition] = useLocalStorage("USER_MARKER", {
    latitude: 0,
    longitude: 0
  });
  
  const [nearbyMarkers, setNearbyMarkers] = useLocalStorage(
    "NEARBY_MARKERS",
    []
  );

  // Check if current location is provided, if not, fetch it
  useEffect(() => {
    const checkAndFetchLocation = async () => {
      // Check if we already have a valid position
      if (position.latitude === 0 && position.longitude === 0) {
        // We don't have a position, try to get current location
        try {
          await getCurrentPosition();
        } catch (err) {
          console.error("Could not get current location:", err);
        }
      } else if (position.latitude !== 0 && position.longitude !== 0) {
        // We have a valid position, update userPosition
        setUserPosition({ ...position });
        
        // Notify parent if needed but don't update UI automatically
        // This just makes the location available but doesn't select it
        if (onFindMeLocation && !initialLocation) {
          onFindMeLocation(position);
        }
      }
    };
    
    checkAndFetchLocation();
  }, [position, getCurrentPosition]);

  // Initialize the map
  useEffect(() => {
    if (!mapRef.current) return;
    
    // Set default coordinates if none available
    const defaultLat = userPosition.latitude || 0;
    const defaultLng = userPosition.longitude || 0;

    // Create map instance
    mapInstanceRef.current = leaflet.map(mapRef.current).setView([defaultLat, defaultLng], 13);

    // Add the tile layer
    leaflet
      .tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
          '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      })
      .addTo(mapInstanceRef.current);

    // Force map to recalculate its size after render
    setTimeout(() => {
      mapInstanceRef.current.invalidateSize();
    }, 100);

    // Add click event for location selection
    mapInstanceRef.current.on('click', (e) => {
      const { lat, lng } = e.latlng;
      const location = { latitude: lat, longitude: lng };
      
      // Update position and notify parent component
      setUserPosition(location);
      if (onLocationSelect) {
        onLocationSelect(location, false); // Not current location
      }
      
      updateMarker(lat, lng, "Selected Location");
    });

    // Add existing nearby markers from localStorage
    nearbyMarkers.forEach(({ latitude, longitude }) => {
      leaflet
        .marker([latitude, longitude])
        .addTo(mapInstanceRef.current)
        .bindPopup(
          `lat: ${latitude.toFixed(2)}, long: ${longitude.toFixed(2)}`
        );
    });

    // Add initial user marker if coordinates exist
    if (defaultLat !== 0 || defaultLng !== 0) {
      updateMarker(defaultLat, defaultLng, "Your Location");
    }

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update marker when initialLocation changes (from form input)
  useEffect(() => {
    if (!mapInstanceRef.current || !initialLocation) return;
    
    const { latitude, longitude } = initialLocation;
    if (latitude && longitude) {
      mapInstanceRef.current.setView([latitude, longitude], 15);
      updateMarker(latitude, longitude, locationConfirmed ? "Confirmed Location" : "Selected Location");
    }
  }, [initialLocation, locationConfirmed]);

  // Update user position when geolocation changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    
    if (position.latitude !== 0 && position.longitude !== 0) {
      setUserPosition({ ...position });
    }
  }, [position]);

  const updateMarker = (lat, lng, popupText) => {
    if (!mapInstanceRef.current) return;
    
    // Remove existing marker if any
    if (userMarkerRef.current) {
      mapInstanceRef.current.removeLayer(userMarkerRef.current);
    }
    
    // Add new marker
    userMarkerRef.current = leaflet
      .marker([lat, lng], {
        icon: leaflet.divIcon({
          className: 'custom-marker',
          html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="38" height="38" fill="${locationConfirmed ? '#4CAF50' : '#FF5722'}">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>`,
          iconSize: [38, 38],
          iconAnchor: [19, 38],
          popupAnchor: [0, -38],
        })
      })
      .addTo(mapInstanceRef.current);
    
    // Add popup
    popupRef.current = leaflet.popup()
      .setContent(popupText);
    
    userMarkerRef.current.bindPopup(popupRef.current).openPopup();
    
    // Apply color style if confirmed
    if (locationConfirmed) {
      const el = userMarkerRef.current.getElement();
      if (el) {
        el.style.filter = "hue-rotate(120deg)";
      }
    }
  };

  const handleFindMe = (e) => {
    if (e) e.preventDefault();

    if (!mapInstanceRef.current) return;
    
    if (position.latitude !== 0 && position.longitude !== 0) {
      mapInstanceRef.current.setView([position.latitude, position.longitude], 15);
      
      // Update position when Find Me is clicked
      const location = { latitude: position.latitude, longitude: position.longitude };
      setUserPosition(location);
      
      // Call onFindMeLocation to let parent know this is current location
      if (onFindMeLocation) {
        onFindMeLocation(location);
      }
      
      // Update marker on map
      updateMarker(position.latitude, position.longitude, "Your Current Location");
      
      // Also call onLocationSelect to update form fields
      if (onLocationSelect) {
        onLocationSelect(location, true); // true means this is current location
      }
    } else {
      // Attempt to get the current position
      getCurrentPosition().then(() => {
        if (position.latitude !== 0 && position.longitude !== 0) {
          handleFindMe(e); // Recursively call this function once we have position
        }
      }).catch(err => {
        console.error("Error getting position:", err);
      });
    }
  };

  return (
    <div className="map-container">
      <div id="map" ref={mapRef} style={{ width: '100%', height: '300px' }}>
        <FindMeButton onFindMe={handleFindMe} loading={loading} error={error} />
      </div>
    </div>
  );
}