import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Polyline, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Custom marker icon
const customIcon = new L.Icon({
  iconUrl: 'https://www.uber-assets.com/image/upload/f_auto,q_auto:eco,c_fill,h_384,w_576/v1548646918/assets/e9/2eeb8f-3764-4e26-8b17-5905a75e7e85/original/2.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

const LiveTracking = ({ pickup, destination }) => {
  const [route, setRoute] = useState(null);
  const [startCoords, setStartCoords] = useState(null);
  const [endCoords, setEndCoords] = useState(null);

  useEffect(() => {
    const fetchRoute = async () => {
      if (!pickup || !destination) return;

      try {
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/maps/get-route`, {
          params: {
            origin: `${pickup.lat},${pickup.lng}`,
            destination: `${destination.lat},${destination.lng}`,
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        const directions = response.data;
        if (directions) {
          const decodedRoute = decodePolyline(directions.routes[0].overview_polyline.points);
          setRoute(decodedRoute);
          setStartCoords(pickup);
          setEndCoords(destination);
        }
      } catch (error) {
        console.error('Error fetching directions:', error);
      }
    };

    fetchRoute();
  }, [pickup, destination]);

  // Function to decode the polyline into an array of coordinates
  const decodePolyline = (encoded) => {
    let points = [];
    let index = 0;
    let lat = 0,
      lng = 0;

    while (index < encoded.length) {
      let b, shift = 0, result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = result & 1 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = result & 1 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      points.push([lat / 1e5, lng / 1e5]);
    }

    return points;
  };

  return (
    <div style={{ height: '100%', width: '100%' }}>
      {startCoords && endCoords && (
        <MapContainer
          center={[startCoords.lat, startCoords.lng]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {route && <Polyline positions={route} color="blue" />}
          <Marker position={[startCoords.lat, startCoords.lng]} icon={customIcon} />
          <Marker position={[endCoords.lat, endCoords.lng]} icon={customIcon} />
        </MapContainer>
      )}
    </div>
  );
};

export default LiveTracking;
