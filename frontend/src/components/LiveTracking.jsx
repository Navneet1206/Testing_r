import React, { useState, useEffect, useContext } from 'react';
import { SocketContext } from '../context/SocketContext';

const LiveTracking = ({ sourceCoords, destinationCoords }) => {
  const [driverPosition, setDriverPosition] = useState(null);
    const [map, setMap] = useState(null);
    const [marker, setMarker] = useState(null);
    const { socket } = useContext(SocketContext);

    useEffect(() => {
        if (window.google && window.google.maps) {
            initializeMap();
        } else {
            const script = document.createElement('script');
            script.src = `https://maps.gomaps.pro/maps/api/js?key=${import.meta.env.VITE_GOMAPPRO_API_KEY}&libraries=places,geometry`;
            script.async = true;
            script.defer = true;
            script.onload = () => initializeMap();
            document.body.appendChild(script);

            return () => {
                document.body.removeChild(script);
            };
        }
    }, []);
    useEffect(() => {
        // Initialize Gomaps
        const map = new window.gomaps.Map(document.getElementById('map'), {
          center: { lat: 28.6139, lng: 77.2090 }, // Default to Delhi
          zoom: 13
        });
        setMapInstance(map);
    
        // Socket listeners
        socket.on('captain-location-update', (position) => {
          setDriverPosition(position);
          map.panTo(position);
        });
    
        socket.on('ride-route', ({ pickup, destination }) => {
          // Draw route on map
          new window.gomaps.Polyline({
            path: [
              { lat: pickup.ltd, lng: pickup.lng },
              { lat: destination.ltd, lng: destination.lng }
            ],
            map: map,
            strokeColor: '#0000FF',
            strokeWeight: 3
          });
        });
    
        return () => {
          socket.off('captain-location-update');
          socket.off('ride-route');
        };
      }, []);
    
      // Update driver marker
      useEffect(() => {
        if (mapInstance && driverPosition) {
          new window.gomaps.Marker({
            position: driverPosition,
            map: mapInstance,
            title: 'Driver Location'
          });
        }
      }, [driverPosition]);
    
    const initializeMap = () => {
        const mapElement = document.getElementById('map');
        if (mapElement && !map) {
            const newMap = new window.google.maps.Map(mapElement, { 
                center: currentPosition,
                zoom: 15,
                gestureHandling: 'greedy',
            });
            setMap(newMap);

            const newMarker = new window.google.maps.Marker({
                position: currentPosition,
                map: newMap,
                title: "You are here!",
            });
            setMarker(newMarker);
        }
    };

    useEffect(() => {
        if (map && marker) {
            map.setCenter(currentPosition);
            marker.setPosition(currentPosition);
        }
    }, [currentPosition]);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                setCurrentPosition({ lat: latitude, lng: longitude });
            });
        }
    }, []);

    useEffect(() => {
        if (map && sourceCoords && destinationCoords) {
            const directionsService = new window.google.maps.DirectionsService();
            const directionsRenderer = new window.google.maps.DirectionsRenderer();
            directionsRenderer.setMap(map);

            const request = {
                origin: new window.google.maps.LatLng(sourceCoords.ltd, sourceCoords.lng),
                destination: new window.google.maps.LatLng(destinationCoords.ltd, destinationCoords.lng),
                travelMode: window.google.maps.TravelMode.DRIVING,
            };

            directionsService.route(request, (result, status) => {
                if (status === window.google.maps.DirectionsStatus.OK) {
                    directionsRenderer.setDirections(result);
                }
            });
        }
    }, [map, sourceCoords, destinationCoords]);

    useEffect(() => {
        if (socket) {
            socket.on('captain-location-update', (location) => {
                setCurrentPosition({ lat: location.ltd, lng: location.lng });
            });
        }

        return () => {
            if (socket) {
                socket.off('captain-location-update');
            }
        };
    }, [socket]);

    return <div id="map" style={{ width: '100%', height: '500px' }}></div>;
};

export default LiveTracking;