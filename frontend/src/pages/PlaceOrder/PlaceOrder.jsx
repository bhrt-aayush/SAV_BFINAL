import React, { useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './PlaceOrder.css';
import { StoreContext } from '../../context/StoreContext';
import Map from '../../components/maps/Map';

const PlaceOrder = () => {
  const { getTotalCartAmount, setUserInfo } = useContext(StoreContext);
  const navigate = useNavigate();
  const [locationConfirmed, setLocationConfirmed] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationAddress, setLocationAddress] = useState('');
  const [addressLookupInProgress, setAddressLookupInProgress] = useState(false);
  const [currentLocationUsed, setCurrentLocationUsed] = useState(false);
  const [locationStatus, setLocationStatus] = useState('');

  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    street: '',
    city: '',
    zipcode: '',
    phone: '',
    suggestion: '',
    latitude: 0,
    longitude: 0,
    formattedAddress: '',
  });

  // Check if geolocation is available in browser
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by your browser');
    } else {
      setLocationStatus('Checking location access...');
      // Just check permission status, don't request location yet
      navigator.permissions.query({ name: 'geolocation' }).then(result => {
        if (result.state === 'granted') {
          setLocationStatus('Location access is available');
        } else if (result.state === 'prompt') {
          setLocationStatus('Location permission will be requested when needed');
        } else {
          setLocationStatus('Location access is blocked. Please enable it in your browser settings.');
        }
      }).catch(err => {
        console.error("Error checking location permission:", err);
        setLocationStatus('Unable to determine location access status');
      });
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  // Function to get address from coordinates using reverse geocoding
  const getAddressFromCoordinates = async (lat, lng) => {
    setAddressLookupInProgress(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Extract address components
      const address = data.address || {};
      const street = address.road || '';
      const houseNumber = address.house_number || '';
      const city = address.city || address.town || address.village || '';
      const zipcode = address.postcode || '';
      
      // Create formatted address
      const formattedAddress = data.display_name || `${street} ${houseNumber}, ${city}, ${zipcode}`;
      
      // Update form fields with the address data
      setUserData(prev => ({
        ...prev,
        street: street + (houseNumber ? ' ' + houseNumber : ''),
        city: city,
        zipcode: zipcode,
        formattedAddress: formattedAddress
      }));
      
      setLocationAddress(formattedAddress);
      setAddressLookupInProgress(false);
      
      return formattedAddress;
    } catch (error) {
      console.error("Error getting address:", error);
      setAddressLookupInProgress(false);
      return "Address lookup failed";
    }
  };

  // Handler for when a location is selected on the map
  const handleLocationSelect = (location, isCurrentLocation = false) => {
    setSelectedLocation(location);
    setLocationConfirmed(false);
    
    // Reset address confirmation when new location is selected
    setLocationAddress('');
    
    // Track if this is the user's current location
    setCurrentLocationUsed(isCurrentLocation);
    
    // Automatically lookup address when location is selected
    if (location && location.latitude && location.longitude) {
      getAddressFromCoordinates(location.latitude, location.longitude);
    }
  };

  // Handler for when the "Find Me" button is clicked
  const handleFindMe = useCallback(async (position) => {
    if (position && position.latitude && position.longitude) {
      // Update selected location
      const location = {
        latitude: position.latitude,
        longitude: position.longitude
      };
      
      // Set location and mark as current location
      handleLocationSelect(location, true);
      
      // Update status to inform user their location is being used
      setLocationStatus('Using your current location');
    }
  }, []);

  // This new function will be called when the Map component provides a current location
  // without the user explicitly clicking the "Find Me" button
  const handleAutoLocationDetection = useCallback((position) => {
    if (position && position.latitude && position.longitude && !selectedLocation) {
      // Only auto-fill if the user hasn't selected a location yet
      setLocationStatus('Current location detected. Click "Find Me" button to use it.');
    }
  }, [selectedLocation]);

  // Handler for confirming the selected location
  const handleConfirmLocation = async () => {
    if (selectedLocation) {
      const { latitude, longitude } = selectedLocation;
      
      // Get address from coordinates if not already fetched
      if (!locationAddress) {
        await getAddressFromCoordinates(latitude, longitude);
      }
      
      // Update user data with confirmed location
      setUserData(prev => ({
        ...prev,
        latitude,
        longitude,
        formattedAddress: locationAddress
      }));
      
      setLocationConfirmed(true);
    }
  };

  // Update map if address fields are manually changed
  const handleAddressFieldChange = async (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
    
    // Reset current location flag when user edits address manually
    setCurrentLocationUsed(false);
    
    // Only attempt geocoding if we have enough address information
    // and we're not already looking up an address
    if ((name === 'street' || name === 'city' || name === 'zipcode') && !addressLookupInProgress) {
      // Debounce the geocoding requests to prevent too many requests
      if (userData.street && userData.city) {
        try {
          const query = `${userData.street}, ${userData.city}${userData.zipcode ? ', ' + userData.zipcode : ''}`;
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`
          );
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          
          if (data && data.length > 0) {
            const { lat, lon } = data[0];
            const newLocation = { 
              latitude: parseFloat(lat), 
              longitude: parseFloat(lon) 
            };
            
            setSelectedLocation(newLocation);
            // Reset confirmation when address is manually changed
            setLocationConfirmed(false);
            setLocationAddress('');
          }
        } catch (error) {
          console.error("Error geocoding address:", error);
        }
      }
    }
  };

  // Debounced address field change handler
  const debounce = (func, delay) => {
    let debounceTimer;
    return function(...args) {
      const context = this;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => func.apply(context, args), delay);
    };
  };

  // Create debounced version of address field change handler
  const debouncedHandleAddressFieldChange = useCallback(
    debounce(handleAddressFieldChange, 1000),
    [userData.street, userData.city, userData.zipcode, addressLookupInProgress]
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Check if location is selected and confirmed
    if (!locationConfirmed || !selectedLocation) {
      alert("Please select and confirm your delivery location on the map");
      return;
    }
    
    // Add the confirmed location to the user data
    const finalUserData = {
      ...userData,
      latitude: selectedLocation.latitude,
      longitude: selectedLocation.longitude,
      formattedAddress: locationAddress,
      usingCurrentLocation: currentLocationUsed
    };
    
    setUserInfo(finalUserData); // Save all data in context
    navigate('/checkout'); // Redirect to Checkout page
  };

  return (
    <form className="place-order" onSubmit={handleSubmit}>
      <div className="place-order-left">
        <p className='title'>Delivery Information</p>
        <div className="multi-fields">
          <input required name='firstName' type="text" placeholder='First Name' onChange={handleChange} value={userData.firstName} />
          <input required name='lastName' type="text" placeholder='Last Name' onChange={handleChange} value={userData.lastName} />
        </div>
        <input required name='email' type="email" placeholder='Email address' onChange={handleChange} value={userData.email} />
        
        {/* Address Fields Section */}
        <div className="address-section">
          {currentLocationUsed && (
            <div className="current-location-badge">
              <span>📍 Using Your Current Location</span>
            </div>
          )}
          
          <input 
            required 
            name='street' 
            type="text" 
            placeholder='Street' 
            onChange={(e) => {
              handleChange(e);
              debouncedHandleAddressFieldChange(e);
            }} 
            value={userData.street} 
          />
          <div className="multi-fields">
            <input 
              required 
              name='city' 
              type="text" 
              placeholder='City' 
              onChange={(e) => {
                handleChange(e);
                debouncedHandleAddressFieldChange(e);
              }} 
              value={userData.city} 
            />
            <input 
              required 
              name='zipcode' 
              type="text" 
              placeholder='Zip code' 
              onChange={(e) => {
                handleChange(e);
                debouncedHandleAddressFieldChange(e);
              }} 
              value={userData.zipcode} 
            />
          </div>
        </div>
        
        <input required name='phone' type="text" placeholder='Phone' onChange={handleChange} value={userData.phone} />
        <input name='suggestion' type="text" placeholder='Suggestions (Optional)' onChange={handleChange} value={userData.suggestion} />
        
        {locationConfirmed && locationAddress && (
          <div className="confirmed-location-info">
            <p className="confirmed-address-label">Confirmed Delivery Location:</p>
            <p className="confirmed-address">{locationAddress}</p>
            {currentLocationUsed && (
              <p className="current-location-note">✓ Using your current location</p>
            )}
          </div>
        )}
      </div>
      
      <div className="place-order-right">
        <p className='title'>Select Delivery Location</p>
        <p className='subtitle'>Click on the map to select your delivery location or use the "Find Me" button</p>
        <div className="map-container">
          <Map 
            onLocationSelect={handleLocationSelect} 
            initialLocation={selectedLocation}
            locationConfirmed={locationConfirmed}
            onFindMeLocation={handleFindMe}
          />
        </div>
        <button 
          type="button" 
          className="confirm-location-button"
          onClick={handleConfirmLocation}
          disabled={!selectedLocation || addressLookupInProgress}
          style={{ 
            backgroundColor: locationConfirmed ? '#4CAF50' : '#66BB6A',
            cursor: !selectedLocation || addressLookupInProgress ? 'not-allowed' : 'pointer',
            opacity: !selectedLocation || addressLookupInProgress ? 0.7 : 1
          }}
        >
          {addressLookupInProgress ? 'Looking up address...' : 
           locationConfirmed ? '✓ Location Confirmed' : 'Confirm This Location'}
        </button>
        <button 
          type="submit" 
          className="place-order-button"
          disabled={!locationConfirmed}
          style={{
            opacity: !locationConfirmed ? 0.7 : 1,
            cursor: !locationConfirmed ? 'not-allowed' : 'pointer'
          }}
        >
          Complete Order
        </button>
      </div>
    </form>
  );
};

export default PlaceOrder;