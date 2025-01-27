import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CaptainDataContext } from '../context/CapatainContext';
import 'remixicon/fonts/remixicon.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CaptainSignup = () => {
  const navigate = useNavigate();
  const { setCaptain } = useContext(CaptainDataContext);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    mobileNumber: '',
    drivingLicense: '',
    vehicle: {
      color: '',
      plate: '',
      capacity: '',
      type: '',
    },
  });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Update form data
  const updateFormData = (e, section = '') => {
    const { name, value } = e.target;
    if (section) {
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [name]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Password strength calculation
    if (name === 'password') {
      const strength = calculatePasswordStrength(value);
      setPasswordStrength(strength);
    }
  };

  // Calculate password strength
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  // Render password strength indicator
  const renderPasswordStrengthIndicator = () => {
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-400', 'bg-green-600'];
    return (
      <div className="flex space-x-1 mt-1">
        {[...Array(5)].map((_, index) => (
          <div
            key={index}
            className={`h-1 w-full rounded ${
              index < passwordStrength ? colors[index] : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
    );
  };

  // Handle next step
  const nextStep = () => {
    setCurrentStep((prev) => prev + 1);
  };

  // Handle previous step
  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
  
    const submitFormData = new FormData();
    submitFormData.append('fullname[firstname]', formData.firstName);
    submitFormData.append('fullname[lastname]', formData.lastName);
    submitFormData.append('email', formData.email);
    submitFormData.append('password', formData.password);
    submitFormData.append('mobileNumber', formData.mobileNumber);
    submitFormData.append('drivingLicense', formData.drivingLicense);
    submitFormData.append('vehicle[color]', formData.vehicle.color);
    submitFormData.append('vehicle[plate]', formData.vehicle.plate);
    submitFormData.append('vehicle[capacity]', formData.vehicle.capacity);
    submitFormData.append('vehicle[vehicleType]', formData.vehicle.type);
  
    if (profilePhoto) {
      submitFormData.append('profilePhoto', profilePhoto);
    }
  
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/captains/register`,
        submitFormData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
  
      if (response.status === 201) {
        toast.success('OTP sent to your email and mobile number!');
        navigate('/verify-email-otp', {
          state: { email: formData.email, mobileNumber: formData.mobileNumber, userType: 'captain' },
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                required
                name="firstName"
                type="text"
                placeholder="First Name"
                value={formData.firstName}
                onChange={(e) => updateFormData(e)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-300"
              />
              <input
                required
                name="lastName"
                type="text"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={(e) => updateFormData(e)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-300"
              />
            </div>
            <input
              required
              name="email"
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={(e) => updateFormData(e)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-300"
            />
            <div>
              <input
                required
                name="password"
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => updateFormData(e)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-300"
              />
              {renderPasswordStrengthIndicator()}
              <p className="text-xs text-gray-500 mt-1">
                Password must be at least 8 characters long
              </p>
            </div>
            <button
              type="button"
              onClick={nextStep}
              disabled={!formData.firstName || !formData.lastName || !formData.email || !formData.password}
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition duration-300"
            >
              Next
            </button>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <input
              required
              name="mobileNumber"
              type="tel"
              placeholder="Mobile Number"
              value={formData.mobileNumber}
              onChange={(e) => updateFormData(e)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-300"
            />
            <input
              required
              name="drivingLicense"
              type="text"
              placeholder="Driving License Number"
              value={formData.drivingLicense}
              onChange={(e) => updateFormData(e)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-300"
            />
            <input
              type="file"
              onChange={(e) => setProfilePhoto(e.target.files[0])}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-300"
            />
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={prevStep}
                className="w-1/2 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition duration-300"
              >
                Back
              </button>
              <button
                type="button"
                onClick={nextStep}
                disabled={!formData.mobileNumber || !formData.drivingLicense}
                className="w-1/2 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition duration-300"
              >
                Next
              </button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                required
                name="color"
                type="text"
                placeholder="Vehicle Color"
                value={formData.vehicle.color}
                onChange={(e) => updateFormData(e, 'vehicle')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-300"
              />
              <input
                required
                name="plate"
                type="text"
                placeholder="Vehicle Plate"
                value={formData.vehicle.plate}
                onChange={(e) => updateFormData(e, 'vehicle')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-300"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                required
                name="capacity"
                type="number"
                placeholder="Vehicle Capacity"
                value={formData.vehicle.capacity}
                onChange={(e) => updateFormData(e, 'vehicle')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-300"
              />
              <select
                required
                name="type"
                value={formData.vehicle.type}
                onChange={(e) => updateFormData(e, 'vehicle')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-300"
              >
                <option value="">Select Vehicle Type</option>
                <option value="car">Car</option>
                <option value="auto">Auto</option>
                <option value="moto">Moto</option>
              </select>
            </div>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={prevStep}
                className="w-1/2 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition duration-300"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={!formData.vehicle.color || !formData.vehicle.plate || !formData.vehicle.capacity || !formData.vehicle.type || isLoading}
                className="w-1/2 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 transition duration-300"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-purple-50 p-4">
      <ToastContainer />
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <img
            className="w-20 mx-auto mb-4"
            src="https://www.svgrepo.com/show/505031/uber-driver.svg"
            alt="Captain Logo"
          />
          <h1 className="text-2xl font-bold text-gray-800">Create Captain Account</h1>
          <div className="flex justify-center mt-4">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`w-8 h-1 mx-1 rounded-full ${
                  currentStep === step ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {renderStepContent()}
        </form>

        <p className="text-center mt-6 text-gray-600">
          Already have an account?{' '}
          <Link to="/captain-login" className="text-blue-600 hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default CaptainSignup;