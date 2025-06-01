'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import styles from './page.module.css';

export default function LocationMap() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);
  const [searchInput, setSearchInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [mapboxLoaded, setMapboxLoaded] = useState(false);

  // Handle Mapbox script load
  /* const handleMapboxLoad = () => {
    if (window.mapboxgl) {
      window.mapboxgl.accessToken = 'pk.eyJ1IjoibWFwd29ya3NhaSIsImEiOiJjbWFsYnlyMm4wNnlsMmxxMG8xZjkwbjhiIn0.BqwAtkSjVxzQXzg5DkduqA';
      setMapboxLoaded(true);
    }
  };

  // Initialize map when Mapbox is loaded
  useEffect(() => {
    if (mapboxLoaded) {
      getCurrentLocation();
    }
  }, [mapboxLoaded]);

  // Initialize the map
  const initMap = (lng = -74.5, lat = 40, zoom = 9) => {
    if (!window.mapboxgl || !mapContainer.current) return;

    map.current = new window.mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [lng, lat],
      zoom: zoom,
      attributionControl: true
    });

    // Add navigation controls
    map.current.addControl(new window.mapboxgl.NavigationControl(), 'top-right');

    // Add marker
    marker.current = new window.mapboxgl.Marker({
      color: '#667eea',
      scale: 1.2
    })
    .setLngLat([lng, lat])
    .addTo(map.current);

    // Add smooth transitions
    map.current.on('load', () => {
      map.current.getCanvas().style.cursor = 'grab';
      setIsLoading(false);
    });

    map.current.on('mousedown', () => {
      map.current.getCanvas().style.cursor = 'grabbing';
    });

    map.current.on('mouseup', () => {
      map.current.getCanvas().style.cursor = 'grab';
    });
  };

  // Get user's current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          initMap(lng, lat, 12);
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
          showError(errorMsg + ' Showing default location.');
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

  // Search for location using Mapbox Geocoding API
  const searchLocation = async (query) => {
    if (!query.trim()) {
      showError('Please enter a location to search.');
      return;
    }

    if (!mapboxLoaded || !window.mapboxgl) {
      showError('Map is still loading. Please try again in a moment.');
      return;
    }

    try {
      clearError();
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${window.mapboxgl.accessToken}&limit=1`
      );
      
      if (!response.ok) {
        throw new Error('Geocoding request failed');
      }

      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const [lng, lat] = feature.center;
        
        // Animate to new location
        map.current.flyTo({
          center: [lng, lat],
          zoom: 12,
          duration: 2000,
          essential: true
        });

        // Update marker position
        marker.current.setLngLat([lng, lat]);

        // Add popup with location name
        const popup = new window.mapboxgl.Popup({ offset: 25 })
          .setLngLat([lng, lat])
          .setHTML(`<div style="padding: 10px; text-align: center;"><h3 style="margin: 0; color: #2d3748;">${feature.place_name}</h3></div>`)
          .addTo(map.current);

        // Auto close popup after 3 seconds
        setTimeout(() => {
          popup.remove();
        }, 3000);

      } else {
        showError('Location not found. Please try a different search term.');
      }
    } catch (error) {
      let errorMsg = 'Error searching location. ';
      if (error.message.includes('fetch')) {
        errorMsg += 'Network connection issue.';
      } else if (error.message.includes('Geocoding')) {
        errorMsg += 'Search service unavailable.';
      } else {
        errorMsg += 'Please try again.';
      }
      showError(errorMsg);
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
  }; */

  return (
    <>
      {/* Load Mapbox CSS */}
      <link 
        href="https://cdnjs.cloudflare.com/ajax/libs/mapbox-gl/2.15.0/mapbox-gl.min.css" 
        rel="stylesheet" 
      />
      
      {/* Load Mapbox JS */}
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/mapbox-gl/2.15.0/mapbox-gl.min.js"
        /*onLoad={handleMapboxLoad}*/
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
            /*onKeyPress={handleKeyPress}*/
          />
          <button 
            className={styles.searchButton}
            /*onClick={handleSearch}*/
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
