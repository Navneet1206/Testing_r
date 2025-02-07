import React, { useState } from 'react';
import { Car, Shield, Clock, MapPin, Star, Phone, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const RideSharingLanding = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [submitStatus, setSubmitStatus] = useState({ show: false, success: false });

  const services = [
    {
      title: "Daily Rides",
      icon: <Car className="w-12 h-12 mb-4 text-blue-600" />,
      description: "Comfortable daily commute with professional drivers"
    },
    {
      title: "Premium Rides",
      icon: <Star className="w-12 h-12 mb-4 text-blue-600" />,
      description: "Luxury vehicles for special occasions and business travel"
    },
    {
      title: "Express Pool",
      icon: <Clock className="w-12 h-12 mb-4 text-blue-600" />,
      description: "Share your ride and save with Express Pool options"
    }
  ];

  const stats = [
    { value: "1M+", label: "Happy Riders" },
    { value: "50K+", label: "Professional Drivers" },
    { value: "100+", label: "Cities Covered" },
    { value: "4.9", label: "Average Rating" }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset form and show success message
      setFormData({ name: '', email: '', message: '' });
      setSubmitStatus({ show: true, success: true });
      
      // Hide message after 3 seconds
      setTimeout(() => {
        setSubmitStatus({ show: false, success: false });
      }, 3000);
    } catch (error) {
      setSubmitStatus({ show: true, success: false });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <header className="relative h-screen">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80" 
            alt="City traffic" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/50"></div>
        </div>
        
        {/* Navigation */}
        <nav className="relative z-10 container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-3xl font-bold text-white">RideShare</div>
          <div className="space-x-8 text-white">
            <a href="#services" className="hover:text-blue-300 transition-colors">Rides</a>
            <a href="#about" className="hover:text-blue-300 transition-colors">About</a>
            <a href="#contact" className="hover:text-blue-300 transition-colors">Contact</a>
          </div>
        </nav>
        
        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-6 h-[calc(100vh-80px)] flex items-center">
          <div className="max-w-2xl">
            <h1 className="text-6xl font-bold text-white mb-6 leading-tight">Your Ride, Your Way</h1>
            <p className="text-2xl text-white mb-8">Get to your destination safely and comfortably with our professional drivers</p>
            <div className="flex space-x-4">
              <Link to="/login">
                <button className="bg-blue-600 text-white px-8 py-4 rounded-lg font-bold hover:bg-blue-700 transition-colors">
                  Book a Ride
                </button>
              </Link>
              <Link to="/captain-login">
                <button className="bg-white text-blue-900 px-8 py-4 rounded-lg font-bold hover:bg-gray-100 transition-colors">
                  Become a Driver
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-16 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center space-x-4 bg-white p-6 rounded-lg shadow-lg transform hover:-translate-y-1 transition-transform">
              <Shield className="w-12 h-12 text-blue-600" />
              <div>
                <h3 className="font-bold text-lg">Safe Rides</h3>
                <p className="text-gray-600">Background-checked drivers</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 bg-white p-6 rounded-lg shadow-lg transform hover:-translate-y-1 transition-transform">
              <Clock className="w-12 h-12 text-blue-600" />
              <div>
                <h3 className="font-bold text-lg">24/7 Service</h3>
                <p className="text-gray-600">Available anytime</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 bg-white p-6 rounded-lg shadow-lg transform hover:-translate-y-1 transition-transform">
              <MapPin className="w-12 h-12 text-blue-600" />
              <div>
                <h3 className="font-bold text-lg">Live Tracking</h3>
                <p className="text-gray-600">Real-time ride tracking</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">About RideShare</h2>
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                Founded in 2020, RideShare has revolutionized urban transportation by connecting riders with reliable drivers through our innovative platform. Our mission is to make transportation accessible, safe, and comfortable for everyone.
              </p>
              <div className="grid grid-cols-2 gap-6">
                {stats.map((stat, index) => (
                  <div key={index} className="bg-blue-50 p-6 rounded-lg text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">{stat.value}</div>
                    <div className="text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                alt="Professional driver" 
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-blue-600 text-white p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-2">Trusted Service</h3>
                <p>Rated 4.9/5 by our users</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-16">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {services.map((service, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow text-center transform hover:-translate-y-1 transition-transform">
                {service.icon}
                <h3 className="text-xl font-bold mb-4">{service.title}</h3>
                <p className="text-gray-600">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* App Preview Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">Download Our App</h2>
              <p className="text-xl mb-8">Get the best ride-sharing experience with our mobile app. Available for iOS and Android.</p>
              <div className="flex space-x-4">
                <img 
                  src="https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&h=50&q=80" 
                  alt="App Store" 
                  className="h-12 rounded-lg"
                />
                <img 
                  src="https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&h=50&q=80" 
                  alt="Play Store" 
                  className="h-12 rounded-lg"
                />
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=600&q=80" 
                alt="App Screenshot" 
                className="rounded-3xl shadow-2xl mx-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-12 bg-blue-600 text-white">
                <h2 className="text-3xl font-bold mb-6">Contact Us</h2>
                <p className="mb-6">Have questions? Our team is here to help you 24/7</p>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Phone className="w-6 h-6" />
                    <span>+1 (555) 123-4567</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <MapPin className="w-6 h-6" />
                    <span>123 Ride Street, Transit City</span>
                  </div>
                </div>
              </div>
              <div className="p-12">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {submitStatus.show && (
                    <div className={`p-4 rounded-lg ${submitStatus.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} flex items-center space-x-2`}>
                      <CheckCircle className="w-5 h-5" />
                      <span>{submitStatus.success ? 'Message sent successfully!' : 'Error sending message. Please try again.'}</span>
                    </div>
                  )}
                  <div>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Your Name"
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Your Email"
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Your Message"
                      required
                      rows="4"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    ></textarea>
                  </div>
                  <button 
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              <h3 className="text-2xl font-bold mb-4">RideShare</h3>
              <p className="text-gray-400">Your trusted ride-sharing partner</p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Services</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Daily Rides</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Premium Rides</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Premium Rides</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Express Pool</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#about" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Safety</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 RideShare. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default RideSharingLanding;