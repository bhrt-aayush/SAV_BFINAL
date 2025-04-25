// Enhanced useGeolocation hook to add getCurrentPosition function
import { useState, useEffect } from 'react';

export default function useGeolocation() {
  const [position, setPosition] = useState({
    latitude: 0,
    longitude: 0,
    accuracy: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to get current position that can be called on demand
  const getCurrentPosition = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const err = new Error("Geolocation is not supported by your browser");
        setError(err);
        reject(err);
        return;
      }

      setLoading(true);
      setError(null);

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          });
          setLoading(false);
          resolve(pos.coords);
        },
        (err) => {
          setError(err);
          setLoading(false);
          reject(err);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 10000,
        }
      );
    });
  };

  // Initial call to get position when component mounts
  useEffect(() => {
    // Don't automatically get position on mount to avoid permission prompts
    // Instead, wait for user action to explicitly request location
  }, []);

  return { position, loading, error, getCurrentPosition };
}