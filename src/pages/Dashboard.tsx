import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, MapPin, Clock, CreditCard, User, Star } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface Ride {
  _id: string;
  pickup: {
    address: string;
    coordinates: [number, number];
  };
  dropoff: {
    address: string;
    coordinates: [number, number];
  };
  status: 'requested' | 'accepted' | 'started' | 'completed' | 'cancelled';
  fare: number;
  distance: number;
  vehicleType: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  driver?: {
    name: string;
    phone: string;
    profilePhoto: string;
  };
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeRide, setActiveRide] = useState<Ride | null>(null);
  const [recentRides, setRecentRides] = useState<Ride[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRides();
  }, []);

  const fetchRides = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/rides/dashboard');
      const { activeRide, recentRides } = response.data;
      setActiveRide(activeRide);
      setRecentRides(recentRides);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch rides');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelRide = async (rideId: string) => {
    try {
      await axios.post(`http://localhost:5000/api/rides/${rideId}/cancel`);
      fetchRides();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to cancel ride');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Welcome, {user?.name}</h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage your rides and track your journey
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <button
              onClick={() => navigate('/book-ride')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Car className="h-5 w-5 mr-2" />
              Book a Ride
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-400 text-red-700">
            {error}
          </div>
        )}

        {/* Active Ride */}
        {activeRide && (
          <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-8">
            <div className="px-6 py-5 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Active Ride</h3>
            </div>
            <div className="px-6 py-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="h-5 w-5 mr-2" />
                      <span>Pickup</span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-gray-900">
                      {activeRide.pickup.address}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="h-5 w-5 mr-2" />
                      <span>Drop-off</span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-gray-900">
                      {activeRide.dropoff.address}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {activeRide.driver && (
                    <div>
                      <div className="flex items-center text-sm text-gray-500">
                        <User className="h-5 w-5 mr-2" />
                        <span>Driver</span>
                      </div>
                      <div className="mt-1 flex items-center">
                        <img
                          src={activeRide.driver.profilePhoto || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'}
                          alt={activeRide.driver.name}
                          className="h-8 w-8 rounded-full mr-2"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {activeRide.driver.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {activeRide.driver.phone}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center text-sm text-gray-500">
                        <CreditCard className="h-5 w-5 mr-2" />
                        <span>Fare</span>
                      </div>
                      <p className="mt-1 text-sm font-medium text-gray-900">
                        ₹{activeRide.fare.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-5 w-5 mr-2" />
                        <span>Status</span>
                      </div>
                      <p className="mt-1 text-sm font-medium capitalize text-indigo-600">
                        {activeRide.status}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {activeRide.status === 'requested' && (
                <div className="mt-6">
                  <button
                    onClick={() => handleCancelRide(activeRide._id)}
                    className="w-full sm:w-auto px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Cancel Ride
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recent Rides */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Rides</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {recentRides.map((ride) => (
              <div key={ride._id} className="px-6 py-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="h-5 w-5 mr-2" />
                      <span>Route</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-900">
                      {ride.pickup.address} → {ride.dropoff.address}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-5 w-5 mr-2" />
                      <span>Date</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-900">
                      {formatDate(ride.createdAt)}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center text-sm text-gray-500">
                      <CreditCard className="h-5 w-5 mr-2" />
                      <span>Payment</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-900">
                      ₹{ride.fare.toFixed(2)} • {ride.paymentMethod}
                    </p>
                  </div>
                </div>
                {ride.status === 'completed' && !ride.feedback && (
                  <div className="mt-4">
                    <button
                      onClick={() => navigate(`/rides/${ride._id}/feedback`)}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <Star className="h-4 w-4 mr-1" />
                      Rate Ride
                    </button>
                  </div>
                )}
              </div>
            ))}
            {recentRides.length === 0 && (
              <div className="px-6 py-8 text-center text-gray-500">
                No recent rides found
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;