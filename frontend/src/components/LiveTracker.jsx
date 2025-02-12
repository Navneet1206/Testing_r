import React, { useState, useEffect, useRef } from 'react';

const LiveTracker = ({ sourceCoords, destinationCoords }) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);

  // Load Google Maps API if not already loaded.
  useEffect(() => {
    if (window.google && window.google.maps) {
      initializeMap();
    } else {
      const script = document.createElement('script');
      // Ensure your API key is valid and has the required libraries: places, geometry, directions
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOMAPPRO_API_KEY}&libraries=places,geometry,directions`;
      script.async = true;
      script.defer = true;
      script.onload = () => initializeMap();
      document.body.appendChild(script);
      return () => {
        document.body.removeChild(script);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initializeMap = () => {
    if (mapRef.current && !map) {
      const initialCenter =
        sourceCoords && (sourceCoords.ltd || sourceCoords.lat)
          ? { lat: sourceCoords.ltd || sourceCoords.lat, lng: sourceCoords.lng }
          : { lat: 0, lng: 0 };
      const newMap = new window.google.maps.Map(mapRef.current, {
        center: initialCenter,
        zoom: 14,
      });
      const dr = new window.google.maps.DirectionsRenderer();
      dr.setMap(newMap);
      setMap(newMap);
      setDirectionsRenderer(dr);
    }
  };

  useEffect(() => {
    if (!map || !directionsRenderer || !sourceCoords || !destinationCoords) return;
    
    const directionsService = new window.google.maps.DirectionsService();
    const origin = new window.google.maps.LatLng(
      sourceCoords.ltd || sourceCoords.lat,
      sourceCoords.lng
    );
    const destination = new window.google.maps.LatLng(
      destinationCoords.ltd || destinationCoords.lat,
      destinationCoords.lng
    );
    const request = {
      origin,
      destination,
      travelMode: window.google.maps.TravelMode.DRIVING,
    };

    directionsService.route(request, (result, status) => {
      if (status === window.google.maps.DirectionsStatus.OK) {
        directionsRenderer.setDirections(result);
        // Fit the map bounds to the route.
        if (result.routes && result.routes[0]) {
          const bounds = new window.google.maps.LatLngBounds();
          result.routes[0].overview_path.forEach((latLng) => bounds.extend(latLng));
          map.fitBounds(bounds);
        }
      } else {
        console.error("Directions request failed: " + status);
      }
    });
  }, [sourceCoords, destinationCoords, map, directionsRenderer]);

  return (
    <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
  );
};

export default LiveTracker;
