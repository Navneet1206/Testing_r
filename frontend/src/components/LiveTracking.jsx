import React, { useState, useEffect, useContext } from 'react';
import { SocketContext } from '../context/SocketContext';
import { FaExpand, FaCompress, FaExchangeAlt } from 'react-icons/fa';

const LiveTracking = ({ 
    sourceCoords, 
    destinationCoords,
    isFullScreen = false,
    onToggleFullScreen,
    onTogglePosition 
}) => {
    const [currentPosition, setCurrentPosition] = useState({ lat: -33.8688, lng: 151.2195 });
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

    return (
        <div 
        className='fixed inset-0 z-[1000] w-40 h-40 rounded-lg shadow-lg overflow-hidden'   
        onClick={onToggleFullScreen}
        >
            <div 
                id="map" 
                style={{ width: '100%', height: '100%' }}
                className="absolute top-0 left-0 z-30"
            />
            <div 
                className="absolute top-2 right-2 z-10 flex space-x-2"
                onClick={(e) => e.stopPropagation()}
            >
            </div>
        </div>
    );
};

export default LiveTracking;