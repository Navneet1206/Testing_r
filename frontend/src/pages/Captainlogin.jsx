import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CaptainDataContext } from '../context/CapatainContext';
import { ClipLoader } from 'react-spinners'; // For loading spinner
import { toast, ToastContainer } from 'react-toastify'; // For popup messages
import 'react-toastify/dist/ReactToastify.css'; // CSS for toast notifications

const Captainlogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // Loading state

  const { captain, setCaptain } = useContext(CaptainDataContext);
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loading

    const captainData = {
      email: email,
      password: password,
    };

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/captains/login`,
        captainData
      );

      if (response.status === 200) {
        const data = response.data;
        setCaptain(data.captain);
        localStorage.setItem('token', data.token);
        toast.success('Login successful! Redirecting...'); // Success popup
        setTimeout(() => {
          navigate('/captain-home');
        }, 2000); // Redirect after 2 seconds
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed. Please try again.'); // Error popup
    } finally {
      setLoading(false); // Stop loading
      setEmail('');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-purple-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        {/* Logo and Heading */}
        <div className="text-center mb-8">
          <img
            className="w-20 mx-auto mb-4 animate-bounce" // Added animation
            src="https://www.svgrepo.com/show/505031/uber-driver.svg"
            alt="Captain Logo"
          />
          <h1 className="text-2xl font-bold text-gray-800">Captain Login</h1>
          <p className="text-gray-600">Welcome back! Please log in to continue.</p>
        </div>

        {/* Form */}
        <form onSubmit={submitHandler} className="space-y-6">
          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              required
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300"
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              required
              type="password"
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading} // Disable button when loading
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition duration-300 flex items-center justify-center"
          >
            {loading ? (
              <ClipLoader size={20} color="#ffffff" /> // Loading spinner
            ) : (
              'Login'
            )}
          </button>
        </form>

        {/* Register Link */}
        <p className="text-center mt-6 text-gray-600">
          Join a fleet?{' '}
          <Link
            to="/captain-signup"
            className="text-blue-600 hover:underline"
          >
            Register as a Captain
          </Link>
        </p>

        {/* Sign in as User Link */}
        <div className="mt-6">
          <Link
            to="/login"
            className="w-full bg-[#d5622d] flex items-center justify-center text-white font-semibold py-2 rounded-lg hover:bg-[#c05525] transition duration-300"
          >
            Sign in as User
          </Link>
        </div>
      </div>

      {/* Toast Container */}
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
};

export default Captainlogin;