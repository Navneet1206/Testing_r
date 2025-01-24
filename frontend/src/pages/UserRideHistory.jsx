import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { UserDataContext } from '../context/UserContext';
import { motion } from 'framer-motion'; // For animations
import { FaSpinner, FaMapMarkerAlt, FaWallet, FaCheckCircle, FaUser, FaTimesCircle } from 'react-icons/fa'; // Icons for better visuals

const UserRideHistory = () => {
    const [rides, setRides] = useState([]); // Stores fetched ride history
    const [isLoading, setIsLoading] = useState(true); // Loading state
    const [selectedTab, setSelectedTab] = useState('pending'); // Tracks the selected tab ('pending', 'completed', or 'canceled')
    const { user } = useContext(UserDataContext); // Access user data from context

    useEffect(() => {
        fetchRideHistory();
    }, []);

    const fetchRideHistory = async () => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_BASE_URL}/rides/user/history`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );
            setRides(response.data); // Store fetched ride history in state
        } catch (error) {
            console.error('Failed to fetch ride history:', error);
            alert('Unable to fetch ride history. Please try again later.');
        } finally {
            setIsLoading(false); // Stop loading once the request is completed
        }
    };

    // Separate rides into pending, completed, and canceled
    const pendingRides = rides.filter(ride => ride.status.toLowerCase() === 'pending');
    const completedRides = rides.filter(ride => ride.status.toLowerCase() === 'completed');
    const canceledRides = rides.filter(ride => ride.status.toLowerCase() === 'canceled');

    // Handle tab change
    const handleTabChange = (tab) => {
        setSelectedTab(tab);
    };

    return (
        <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen mt-14">
            <h2 className="text-4xl font-bold mb-8 text-center text-gray-800">
                Your Ride History
            </h2>

            {/* Tab Buttons */}
            <div className="flex justify-center gap-4 mb-8">
                <button
                    onClick={() => handleTabChange('pending')}
                    className={`px-6 py-2 rounded-full font-semibold ${
                        selectedTab === 'pending'
                            ? 'bg-orange-600 text-white'
                            : 'bg-gray-200 text-gray-700'
                    } hover:bg-orange-500 transition-colors duration-300`}
                >
                    Pending
                </button>
                <button
                    onClick={() => handleTabChange('completed')}
                    className={`px-6 py-2 rounded-full font-semibold ${
                        selectedTab === 'completed'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-200 text-gray-700'
                    } hover:bg-green-500 transition-colors duration-300`}
                >
                    Completed
                </button>
                <button
                    onClick={() => handleTabChange('canceled')}
                    className={`px-6 py-2 rounded-full font-semibold ${
                        selectedTab === 'canceled'
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-200 text-gray-700'
                    } hover:bg-red-500 transition-colors duration-300`}
                >
                    Canceled
                </button>
            </div>

            {isLoading ? ( // Show loading spinner while fetching data
                <div className="flex justify-center items-center h-64">
                    <FaSpinner className="animate-spin text-4xl text-purple-600" />
                </div>
            ) : rides.length === 0 ? ( // Show message if no rides are found
                <p className="text-center text-gray-600 text-xl">No ride history found.</p>
            ) : (
                <>
                    {/* Display Rides Based on Selected Tab */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {selectedTab === 'pending' && (
                            pendingRides.length > 0 ? (
                                pendingRides.map((ride) => (
                                    <motion.div
                                        key={ride._id}
                                        className="border rounded-xl shadow-lg p-6 bg-white hover:shadow-2xl transition-shadow duration-300 transform hover:scale-105"
                                        whileHover={{ scale: 1.05 }} // Add hover animation
                                        initial={{ opacity: 0, y: 20 }} // Initial animation state
                                        animate={{ opacity: 1, y: 0 }} // Animate on load
                                        transition={{ duration: 0.3 }} // Animation duration
                                    >
                                        <div className="flex items-center mb-4">
                                            <FaMapMarkerAlt className="text-purple-600 mr-2" />
                                            <p className="text-lg font-semibold text-gray-800">
                                                {ride.pickup} → {ride.destination}
                                            </p>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center">
                                                <FaWallet className="text-green-600 mr-2" />
                                                <p className="text-gray-700">
                                                    <strong>Fare:</strong> ₹{ride.fare}
                                                </p>
                                            </div>
                                            <div className="flex items-center">
                                                <FaCheckCircle className="text-orange-600 mr-2" />
                                                <p className="text-gray-700">
                                                    <strong>Status:</strong> {ride.status}
                                                </p>
                                            </div>
                                            {ride.captain && (
                                                <div className="flex items-center">
                                                    <FaUser className="text-orange-600 mr-2" />
                                                    <p className="text-gray-700">
                                                        <strong>Captain:</strong> {ride.captain.fullname.firstname}{' '}
                                                        {ride.captain.fullname.lastname}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <p className="text-center text-gray-600 text-xl col-span-full">No pending rides found.</p>
                            )
                        )}

                        {selectedTab === 'completed' && (
                            completedRides.length > 0 ? (
                                completedRides.map((ride) => (
                                    <motion.div
                                        key={ride._id}
                                        className="border rounded-xl shadow-lg p-6 bg-white hover:shadow-2xl transition-shadow duration-300 transform hover:scale-105"
                                        whileHover={{ scale: 1.05 }} // Add hover animation
                                        initial={{ opacity: 0, y: 20 }} // Initial animation state
                                        animate={{ opacity: 1, y: 0 }} // Animate on load
                                        transition={{ duration: 0.3 }} // Animation duration
                                    >
                                        <div className="flex items-center mb-4">
                                            <FaMapMarkerAlt className="text-purple-600 mr-2" />
                                            <p className="text-lg font-semibold text-gray-800">
                                                {ride.pickup} → {ride.destination}
                                            </p>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center">
                                                <FaWallet className="text-green-600 mr-2" />
                                                <p className="text-gray-700">
                                                    <strong>Fare:</strong> ₹{ride.fare}
                                                </p>
                                            </div>
                                            <div className="flex items-center">
                                                <FaCheckCircle className="text-green-600 mr-2" />
                                                <p className="text-gray-700">
                                                    <strong>Status:</strong> {ride.status}
                                                </p>
                                            </div>
                                            {ride.captain && (
                                                <div className="flex items-center">
                                                    <FaUser className="text-orange-600 mr-2" />
                                                    <p className="text-gray-700">
                                                        <strong>Captain:</strong> {ride.captain.fullname.firstname}{' '}
                                                        {ride.captain.fullname.lastname}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <p className="text-center text-gray-600 text-xl col-span-full">No completed rides found.</p>
                            )
                        )}

                        {selectedTab === 'canceled' && (
                            canceledRides.length > 0 ? (
                                canceledRides.map((ride) => (
                                    <motion.div
                                        key={ride._id}
                                        className="border rounded-xl shadow-lg p-6 bg-white hover:shadow-2xl transition-shadow duration-300 transform hover:scale-105"
                                        whileHover={{ scale: 1.05 }} // Add hover animation
                                        initial={{ opacity: 0, y: 20 }} // Initial animation state
                                        animate={{ opacity: 1, y: 0 }} // Animate on load
                                        transition={{ duration: 0.3 }} // Animation duration
                                    >
                                        <div className="flex items-center mb-4">
                                            <FaMapMarkerAlt className="text-purple-600 mr-2" />
                                            <p className="text-lg font-semibold text-gray-800">
                                                {ride.pickup} → {ride.destination}
                                            </p>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center">
                                                <FaWallet className="text-green-600 mr-2" />
                                                <p className="text-gray-700">
                                                    <strong>Fare:</strong> ₹{ride.fare}
                                                </p>
                                            </div>
                                            <div className="flex items-center">
                                                <FaTimesCircle className="text-red-600 mr-2" />
                                                <p className="text-gray-700">
                                                    <strong>Status:</strong> {ride.status}
                                                </p>
                                            </div>
                                            {ride.captain && (
                                                <div className="flex items-center">
                                                    <FaUser className="text-orange-600 mr-2" />
                                                    <p className="text-gray-700">
                                                        <strong>Captain:</strong> {ride.captain.fullname.firstname}{' '}
                                                        {ride.captain.fullname.lastname}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <p className="text-center text-gray-600 text-xl col-span-full">No canceled rides found.</p>
                            )
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default UserRideHistory;