'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import styles from './page.module.css';

export default function LocationMap() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);
  const geocoder = useRef(null);
  const [searchInput, setSearchInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);

  // Handle Google Maps script load
  const handleGoogleMapsLoad = () => {
    if (window.google && window.google.maps) {
      // Initialize geocoder
      geocoder.current = new window.google.maps.Geocoder();
      setGoogleMapsLoaded(true);
    }
  };

  // Initialize map when Google Maps is loaded
  useEffect(() => {
    if (googleMapsLoaded) {
      getCurrentLocation();
    }
  }, [googleMapsLoaded]);

  // Initialize the map
  const initMap = (lat = 40.7128, lng = -74.0060, zoom = 10) => {
    if (!window.google || !mapContainer.current) return;

    // Create map
    map.current = new window.google.maps.Map(mapContainer.current, {
      center: { lat, lng },
      zoom: zoom,
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
      zoomControl: true,
      styles: [
        {
          featureType: 'all',
          elementType: 'geometry.fill',
          stylers: [{ weight: '2.00' }]
        },
        {
          featureType: 'all',
          elementType: 'geometry.stroke',
          stylers: [{ color: '#9c9c9c' }]
        },
        {
          featureType: 'all',
          elementType: 'labels.text',
          stylers: [{ visibility: 'on' }]
        }
      ]
    });

    // Create marker
    marker.current = new window.google.maps.Marker({
      position: { lat, lng },
      map: map.current,
      title: 'Selected Location',
      animation: window.google.maps.Animation.DROP,
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="30" height="40" viewBox="0 0 30 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 0C6.71573 0 0 6.71573 0 15C0 23.2843 15 40 15 40C15 40 30 23.2843 30 15C30 6.71573 23.2843 0 15 0Z" fill="#667eea"/>
            <circle cx="15" cy="15" r="8" fill="white"/>
            <circle cx="15" cy="15" r="4" fill="#667eea"/>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(30, 40),
        anchor: new window.google.maps.Point(15, 40)
      }
    });

    setIsLoading(false);
    clearError();
  };

  // Get user's current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          initMap(lat, lng, 14);
          clearError();
        },
        (error) => {
          let errorMsg = 'Unable to get your location. ';
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMsg += 'Location access denied.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMsg += 'Location information unavailable.';
              break;
            case error.TIMEOUT:
              errorMsg += 'Location request timed out.';
              break;
            default:
              errorMsg += 'An unknown error occurred.';
              break;
          }
          showError(errorMsg + ' Showing default location (New York City).');
          initMap(); // Default location
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      showError('Geolocation is not supported by this browser. Showing default location.');
      initMap(); // Default location
    }
  };

  // Search for location using Google Maps Geocoding API
  const searchLocation = async (query) => {
    if (!query.trim()) {
      showError('Please enter a location to search.');
      return;
    }

    if (!googleMapsLoaded || !geocoder.current) {
      showError('Map is still loading. Please try again in a moment.');
      return;
    }

    try {
      clearError();
      
      geocoder.current.geocode({ address: query }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const location = results[0].geometry.location;
          const lat = location.lat();
          const lng = location.lng();
          
          // Animate to new location
          map.current.panTo({ lat, lng });
          map.current.setZoom(14);
          
          // Update marker position with animation
          marker.current.setPosition({ lat, lng });
          marker.current.setAnimation(window.google.maps.Animation.BOUNCE);
          
          // Stop bouncing after 2 seconds
          setTimeout(() => {
            marker.current.setAnimation(null);
          }, 2000);

          // Create info window with location details
          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div style="padding: 10px; text-align: center; max-width: 200px;">
                <h3 style="margin: 0 0 5px 0; color: #2d3748; font-size: 16px;">${results[0].formatted_address}</h3>
                <p style="margin: 0; color: #4a5568; font-size: 12px;">Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}</p>
              </div>
            `
          });

          // Show info window
          infoWindow.open(map.current, marker.current);

          // Auto close info window after 4 seconds
          setTimeout(() => {
            infoWindow.close();
          }, 4000);

        } else {
          let errorMsg = 'Location not found. ';
          if (status === 'ZERO_RESULTS') {
            errorMsg += 'Please try a different search term.';
          } else if (status === 'OVER_QUERY_LIMIT') {
            errorMsg += 'Search quota exceeded. Try again later.';
          } else if (status === 'REQUEST_DENIED') {
            errorMsg += 'Search request denied.';
          } else {
            errorMsg += 'Please try again.';
          }
          showError(errorMsg);
        }
      });
    } catch (error) {
      showError('Error searching location. Please try again.');
    }
  };

  // Show error message
  const showError = (message) => {
    setErrorMessage(message);
  };

  // Clear error message
  const clearError = () => {
    setErrorMessage('');
  };

  // Handle search
  const handleSearch = () => {
    searchLocation(searchInput);
  };

  // Handle enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchLocation(searchInput);
    }
  };

  return (
    <>
      {/* Load Google Maps JavaScript API */}
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY_HERE'}&libraries=geometry,places`}
        onLoad={handleGoogleMapsLoad}
        strategy="afterInteractive"
      />

      <div className={styles.container}>
        <h1 className={styles.title}>🗺️ Location Explorer</h1>
        
        <div className={styles.searchContainer}>
          <input 
            type="text" 
            className={styles.searchInput}
            placeholder="Search for any location (e.g., Paris, New York, Tokyo)..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button 
            className={styles.searchButton}
            onClick={handleSearch}
          >
            Search
          </button>
        </div>

        {errorMessage && (
          <div className={styles.error}>
            {errorMessage}
          </div>
        )}
        
        <div className={styles.mapWrapper}>
          {isLoading && (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <p>Loading your current location...</p>
            </div>
          )}
          <div 
            ref={mapContainer} 
            className={styles.map}
            style={{ visibility: isLoading ? 'hidden' : 'visible' }}
          />
        </div>
      </div>
    </>
  );
}