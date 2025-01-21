import React, { useState, useEffect } from 'react';
import axios from 'axios';

const LiveTracking = () => {
    const [currentPosition, setCurrentPosition] = useState({ lat: -33.8688, lng: 151.2195 });
    const [map, setMap] = useState(null);
    const [routePolyline, setRoutePolyline] = useState(null);

    const initializeMap = () => {
        const mapElement = document.getElementById('map');
        if (mapElement && !map) {
            const newMap = new window.google.maps.Map(mapElement, {
                center: currentPosition,
                zoom: 12,
                draggable: true,
                scrollwheel: true,
                mapTypeControl: true,
                streetViewControl: true,
            });
            setMap(newMap);

            // Add marker for the current position
            new window.google.maps.Marker({
                position: currentPosition,
                map: newMap,
                title: "You are here!",
            });
        }
    };

    const loadMapScript = () => {
        const script = document.createElement('script');
        script.src = `https://maps.gomaps.pro/maps/api/js?key=${import.meta.env.VITE_GOMAPPRO_API_KEY}&libraries=places,geometry`;
        script.async = true;
        script.defer = true;
        script.onload = initializeMap;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    };

    useEffect(() => {
        if (window.google && window.google.maps) {
            initializeMap();
        } else {
            loadMapScript();
        }
    }, []);

    const drawRoute = async (origin, destination) => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/maps/get-distance-time`, {
                params: { origin, destination },
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            console.log(response.data);
            const route = response.data;
            const routeCoordinates = route.legs[0].steps.flatMap(step => [
                { lat: step.start_location.lat, lng: step.start_location.lng },
                { lat: step.end_location.lat, lng: step.end_location.lng },
            ]);

            // Remove existing polyline if any
            if (routePolyline) {
                routePolyline.setMap(null);
            }

            // Draw new polyline
            const newPolyline = new window.google.maps.Polyline({
                path: routeCoordinates,
                geodesic: true,
                strokeColor: '#FF0000',
                strokeOpacity: 1.0,
                strokeWeight: 4,
            });

            newPolyline.setMap(map);
            setRoutePolyline(newPolyline);
        } catch (err) {
            console.error('Error drawing route:', err);
        }
    };

    // Automatically fetch and display a route
    useEffect(() => {
        if (map) {
            drawRoute('HR6C+5HX, Jawahar Nagar, Satna, Lamtara, Madhya Pradesh 485001, India', 'Pateri, Satna, Madhya Pradesh, India'); // Replace with actual source and destination
        }
    }, [map]);

    // Update the current position if geolocation is enabled
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                setCurrentPosition({ lat: latitude, lng: longitude });
            });
        }
    }, []);

    return <div id="map" style={{ width: '100%', height: '100%' }}></div>;
};

export default LiveTracking;
