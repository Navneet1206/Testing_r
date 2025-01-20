import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Car, CreditCard, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface Location {
  address: string;
  coordinates: [number, number];
}

interface VehicleOption {
  type: 'bike' | 'auto' | 'sedan' | 'suv';
  name: string;
  capacity: number;
  basePrice: number;
  pricePerKm: number;
}

const vehicleOptions: VehicleOption[] = [
  { type: 'bike', name: 'Bike', capacity: 1, basePrice: 20, pricePerKm: 8 },
  { type: 'auto', name: 'Auto', capacity: 3, basePrice: 30, pricePerKm: 12 },
  { type: 'sedan', name: 'Sedan', capacity: 4, basePrice: 50, pricePerKm: 15 },
  { type: 'suv', name: 'SUV', capacity: 6, basePrice: 60, pricePerKm: 18 }
];

const BookRide = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pickup, setPickup] = useState<Location>({ address: '', coordinates: [0, 0] });
  const [dropoff, setDropoff] = useState<Location>({ address: '', coordinates: [0, 0] });
  const [selectedVehicle, setSelectedVehicle] = useState<string>('sedan');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'razorpay'>('cash');
  const [distance, setDistance] = useState<number>(0);
  const [fare, setFare] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Initialize map
    const script = document.createElement('script');
    script.src = `https://maps.gomaps.pro/maps/api/js?key=${process.env.GOMAP_API_KEY}&libraries=places`;
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      initializeMap();
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const initializeMap = () => {
    // Initialize map and autocomplete functionality
    // This is a placeholder for the actual map initialization
    console.log('Map initialized');
  };

  const calculateFare = (distance: number, vehicleType: string) => {
    const vehicle = vehicleOptions.find(v => v.type === vehicleType);
    if (!vehicle) return 0;
    return vehicle.basePrice + (vehicle.pricePerKm * distance);
  };

  const handleLocationSelect = async (type: 'pickup' | 'dropoff', address: string) => {
    try {
      // Geocode the address using Gomap.pro API
      const response = await axios.get(`http://localhost:5000/api/maps/geocode?address=${encodeURIComponent(address)}`);
      const { coordinates } = response.data;

      if (type === 'pickup') {
        setPickup({ address, coordinates });
      } else {
        setDropoff({ address, coordinates });
      }

      // If both locations are set, calculate distance and fare
      if (pickup.coordinates[0] !== 0 && coordinates[0] !== 0) {
        const distanceResponse = await axios.post('http://localhost:5000/api/maps/route', {
          origin: type === 'pickup' ? coordinates : pickup.coordinates,
          destination: type === 'pickup' ? dropoff.coordinates : coordinates
        });
        
        const newDistance = distanceResponse.data.distance;
        setDistance(newDistance);
        setFare(calculateFare(newDistance, selectedVehicle));
      }
    } catch (error) {
      setError('Failed to get location coordinates');
    }
  };

  const handleBookRide = async () => {
    if (!pickup.address || !dropoff.address) {
      setError('Please select both pickup and drop-off locations');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const rideData = {
        pickup,
        dropoff,
        vehicleType: selectedVehicle,
        paymentMethod,
        distance,
        fare
      };

      const response = await axios.post('http://localhost:5000/api/rides/book', rideData);

      if (paymentMethod === 'razorpay') {
        // Handle Razorpay payment
        const options = {
          key: process.env.RAZORPAY_KEY_ID,
          amount: fare * 100, // Razorpay expects amount in paise
          currency: 'INR',
          name: 'Ride Sharing',
          description: 'Ride Payment',
          order_id: response.data.orderId,
          handler: async (response: any) => {
            await axios.post('http://localhost:5000/api/payments/verify', {
              rideId: response.data.rideId,
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature
            });
            navigate('/dashboard');
          }
        };

        const razorpay = new (window as any).Razorpay(options);
        razorpay.open();
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to book ride');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Book a Ride</h2>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-400 text-red-700">
                {error}
              </div>
            )}

            <div className="space-y-6">
              {/* Pickup Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Pickup Location</label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Enter pickup location"
                    value={pickup.address}
                    onChange={(e) => handleLocationSelect('pickup', e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              {/* Dropoff Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Drop-off Location</label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Enter drop-off location"
                    value={dropoff.address}
                    onChange={(e) => handleLocationSelect('dropoff', e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              {/* Vehicle Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Vehicle</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {vehicleOptions.map((vehicle) => (
                    <button
                      key={vehicle.type}
                      type="button"
                      onClick={() => {
                        setSelectedVehicle(vehicle.type);
                        if (distance) {
                          setFare(calculateFare(distance, vehicle.type));
                        }
                      }}
                      className={`p-4 border rounded-lg text-center ${
                        selectedVehicle === vehicle.type
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-indigo-200'
                      }`}
                    >
                      <Car className="h-6 w-6 mx-auto mb-2" />
                      <div className="text-sm font-medium">{vehicle.name}</div>
                      <div className="text-xs text-gray-500">{vehicle.capacity} seats</div> <div className="text-xs text-gray-500">₹{vehicle.basePrice + (distance * vehicle.pricePerKm)}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-4 border rounded-lg text-center ${
                      paymentMethod === 'cash'
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-indigo-200'
                    }`}
                  >
                    <div className="text-sm font-medium">Cash</div>
                    <div className="text-xs text-gray-500">Pay after ride</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('razorpay')}
                    className={`p-4 border rounded-lg text-center ${
                      paymentMethod === 'razorpay'
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-indigo-200'
                    }`}
                  >
                    <CreditCard className="h-5 w-5 mx-auto mb-1" />
                    <div className="text-sm font-medium">Online Payment</div>
                    <div className="text-xs text-gray-500">Cards, UPI, & more</div>
                  </button>
                </div>
              </div>

              {/* Fare Estimate */}
              {distance > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Distance</span>
                    <span className="font-medium">{distance.toFixed(1)} km</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Estimated Fare</span>
                    <span className="font-medium">₹{fare.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* Book Button */}
              <button
                onClick={handleBookRide}
                disabled={isLoading || !pickup.address || !dropoff.address}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    Booking...
                  </>
                ) : (
                  'Book Now'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookRide;