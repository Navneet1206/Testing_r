import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Car, User, Clock, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  const navigation = isAuthenticated ? [
    { name: 'Dashboard', href: '/dashboard', icon: Clock },
    { name: 'Book Ride', href: '/book-ride', icon: Car },
    { name: 'Ride History', href: '/ride-history', icon: Clock },
    { name: 'Profile', href: '/profile', icon: User },
  ] : [
    { name: 'Home', href: '/', icon: Car },
    { name: 'Login', href: '/login', icon: User },
    { name: 'Register', href: '/register', icon: User },
  ];

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <Car className="h-8 w-8 text-indigo-600" />
                <span className="text-xl font-bold text-gray-900">RideShare</span>
              </Link>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    location.pathname === item.href
                      ? 'text-indigo-600 bg-indigo-50'
                      : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 text-base font-medium ${
                    location.pathname === item.href
                      ? 'text-indigo-600 bg-indigo-50'
                      : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;