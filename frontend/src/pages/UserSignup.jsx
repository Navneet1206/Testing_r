import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserDataContext } from '../context/UserContext';
import 'remixicon/fonts/remixicon.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UserSignup = () => {
  const navigate = useNavigate();
  const { setUser } = useContext(UserDataContext);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    mobileNumber: '',
  });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Update form data
  const updateFormData = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

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

  // Handle next step
  const nextStep = () => {
    setCurrentStep((prev) => prev + 1);
  };

  // Handle previous step
  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const submitFormData = new FormData();
    submitFormData.append("fullname[firstname]", formData.firstName);
    submitFormData.append("fullname[lastname]", formData.lastName);
    submitFormData.append("email", formData.email);
    submitFormData.append("password", formData.password);
    submitFormData.append("mobileNumber", formData.mobileNumber);

    if (profilePhoto) {
      submitFormData.append("profilePhoto", profilePhoto);
    }

    try {
      console.log("Submitting form data:", {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        mobileNumber: formData.mobileNumber,
      });

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/users/register`,
        submitFormData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.status === 201) {
        toast.success("OTP sent to your email and mobile number!");
        navigate('/verify-email-otp', {
          state: { email: formData.email, mobileNumber: formData.mobileNumber, userType: 'user' },
        });
      }
    } catch (error) {
      console.error("Signup failed:", error);
      toast.error(error.response?.data?.message || "Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Render password strength indicator
  const renderPasswordStrengthIndicator = () => {
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-400', 'bg-green-600'];
    return (
      <div className="flex space-x-1 mt-1">
        {[...Array(5)].map((_, index) => (
          <div
            key={index}
            className={`h-1 w-full rounded ${index < passwordStrength ? colors[index] : 'bg-gray-200'
              }`}
          />
        ))}
      </div>
    );
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
                onChange={updateFormData}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-300"
              />
              <input
                required
                name="lastName"
                type="text"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={updateFormData}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-300"
              />
            </div>
            <input
              required
              name="email"
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={updateFormData}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-300"
            />
            <div>
              <input
                required
                name="password"
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={updateFormData}
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
            <div className="flex items-center space-x-2">
              <span className="text-gray-500">+91</span>
              <input
                required
                name="mobileNumber"
                type="tel"
                placeholder="Mobile Number"
                value={formData.mobileNumber}
                onChange={updateFormData}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-300"
              />
            </div>


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
                type="submit"
                disabled={!formData.mobileNumber || isLoading}
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
            className="w-16 mx-auto mb-4"
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYQy-OIkA6In0fTvVwZADPmFFibjmszu2A0g&s"
            alt="Logo"
          />
          <h1 className="text-2xl font-bold text-gray-800">Create Account</h1>
          <div className="flex justify-center mt-4">
            {[1, 2].map((step) => (
              <div
                key={step}
                className={`w-8 h-1 mx-1 rounded-full ${currentStep === step ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
              />
            ))}
          </div>
        </div>

        <form onSubmit={submitHandler} className="space-y-6">
          {renderStepContent()}
        </form>

        <p className="text-center mt-6 text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default UserSignup;