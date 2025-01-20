import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, MapPin, Shield, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: <Car className="w-12 h-12 text-indigo-600" />,
      title: "Multiple Vehicle Options",
      description: "Choose from bikes, autos, sedans, and SUVs for your perfect ride"
    },
    {
      icon: <MapPin className="w-12 h-12 text-indigo-600" />,
      title: "Real-time Tracking",
      description: "Track your ride in real-time with accurate location updates"
    },
    {
      icon: <Shield className="w-12 h-12 text-indigo-600" />,
      title: "Safe & Secure",
      description: "Verified drivers and secure payment options for worry-free rides"
    },
    {
      icon: <Star className="w-12 h-12 text-indigo-600" />,
      title: "Rate Your Experience",
      description: "Provide feedback and ratings to help us improve our service"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div 
        className="relative h-[600px] bg-cover bg-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=2070')",
          backgroundBlendMode: "overlay",
          backgroundColor: "rgba(0, 0, 0, 0.5)"
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-5xl font-bold mb-6">Your Ride, Your Way</h1>
            <p className="text-xl mb-8">Safe, reliable rides at your fingertips</p>
            {isAuthenticated ? (
              <button
                onClick={() => navigate('/book-ride')}
                className="bg-indigo-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition-colors"
              >
                Book a Ride
              </button>
            ) : (
              <button
                onClick={() => navigate('/register')}
                className="bg-indigo-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition-colors"
              >
                Get Started
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Download App Section */}
      <div className="bg-indigo-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h2 className="text-3xl font-bold mb-4">Download Our Mobile App</h2>
            <p className="text-lg mb-6">Get the best experience with our mobile app</p>
            <div className="flex space-x-4">
              <button className="bg-black px-6 py-3 rounded-lg flex items-center space-x-2">
                <span>App Store</span>
              </button>
              <button className="bg-black px-6 py-3 rounded-lg flex items-center space-x-2">
                <span>Play Store</span>
              </button>
            </div>
          </div>
          <div className="md:w-1/2">
            <img 
              src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=1470" 
              alt="Mobile App" 
              className="rounded-lg shadow-xl"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;