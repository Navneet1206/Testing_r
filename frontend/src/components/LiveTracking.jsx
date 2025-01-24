import React, { useState, useEffect, useContext } from 'react';
import { SocketContext } from '../context/SocketContext';

const LiveTracking = ({ sourceCoords, destinationCoords }) => {
    const [currentPosition, setCurrentPosition] = useState({ lat: -33.8688, lng: 151.2195 });
    const [map, setMap] = useState(null);
    const [marker, setMarker] = useState(null);
    const { socket } = useContext(SocketContext);

    // Validate coordinates
    const validateCoordinates = (coords) => {
        return coords && typeof coords.lat === 'number' && typeof coords.lng === 'number';
    };

    // Initialize the map
    const initializeMap = () => {
        const mapElement = document.getElementById('map');
        if (mapElement && !map) {
            const newMap = new window.google.maps.Map(mapElement, {
                center: currentPosition,
                zoom: 15,
            });
            setMap(newMap);

            // Use standard Marker instead of AdvancedMarkerElement
            const newMarker = new window.google.maps.Marker({
                position: currentPosition,
                map: newMap,
                title: "You are here!",
            });
            setMarker(newMarker);
        }
    };

    // Load Google Maps script and initialize the map
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

    // Update the map center and marker position when currentPosition changes
    useEffect(() => {
        if (map && marker && validateCoordinates(currentPosition)) {
            map.setCenter(currentPosition);
            marker.setPosition(currentPosition);
        }
    }, [currentPosition, map, marker]);

    // Get the user's current location
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setCurrentPosition({ lat: latitude, lng: longitude });
                },
                (error) => {
                    console.error('Error getting user location:', error);
                }
            );
        }
    }, []);

    // Render directions between source and destination
    useEffect(() => {
        if (map && validateCoordinates(sourceCoords) && validateCoordinates(destinationCoords)) {
            const directionsService = new window.google.maps.DirectionsService();
            const directionsRenderer = new window.google.maps.DirectionsRenderer();
            directionsRenderer.setMap(map);

            const request = {
                origin: new window.google.maps.LatLng(sourceCoords.lat, sourceCoords.lng),
                destination: new window.google.maps.LatLng(destinationCoords.lat, destinationCoords.lng),
                travelMode: window.google.maps.TravelMode.DRIVING,
            };

            directionsService.route(request, (result, status) => {
                if (status === window.google.maps.DirectionsStatus.OK) {
                    directionsRenderer.setDirections(result);
                } else {
                    console.error('Error rendering directions:', status);
                }
            });
        }
    }, [map, sourceCoords, destinationCoords]);

    // Listen for captain location updates
    useEffect(() => {
        if (socket) {
            socket.on('captain-location-update', (location) => {
                if (validateCoordinates(location)) {
                    setCurrentPosition({ lat: location.ltd, lng: location.lng });
                } else {
                    console.error('Invalid captain location:', location);
                }
            });
        }

        return () => {
            if (socket) {
                socket.off('captain-location-update');
            }
        };
    }, [socket]);

    return <div id="map" style={{ width: '100%', height: '100%' }}></div>;
};

export default LiveTracking;