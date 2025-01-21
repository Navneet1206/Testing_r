import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { UserDataContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ClipLoader } from 'react-spinners'; // For loading spinner
import { toast, ToastContainer } from 'react-toastify'; // For popup messages
import 'react-toastify/dist/ReactToastify.css'; // CSS for toast notifications

const UserLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // Loading state

  const { user, setUser } = useContext(UserDataContext);
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loading

    const userData = {
      email: email,
      password: password,
    };

    try {
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/users/login`, userData);

      if (response.status === 200) {
        const data = response.data;
        setUser(data.user);
        localStorage.setItem('token', data.token);
        toast.success('Login successful! Redirecting...'); // Success popup
        setTimeout(() => {
          navigate('/home');
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
    <div className='p-7 h-screen flex flex-col justify-between bg-gradient-to-r from-blue-50 to-purple-50'>
      <ToastContainer position="top-center" autoClose={3000} /> {/* Popup container */}
      <div>
        <img
          className='w-16 mb-10 animate-bounce' // Added animation
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYQy-OIkA6In0fTvVwZADPmFFibjmszu2A0g&s"
          alt="Logo"
        />

        <form onSubmit={submitHandler}>
          <h3 className='text-lg font-medium mb-2 text-gray-700'>What's your email?</h3>
          <input
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className='bg-[#eeeeee] mb-7 rounded-lg px-4 py-2 border w-full text-lg placeholder:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all'
            type="email"
            placeholder='email@example.com'
          />

          <h3 className='text-lg font-medium mb-2 text-gray-700'>Enter Password</h3>
          <input
            className='bg-[#eeeeee] mb-7 rounded-lg px-4 py-2 border w-full text-lg placeholder:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            type="password"
            placeholder='password'
          />

          <button
            type="submit"
            disabled={loading} // Disable button when loading
            className='bg-[#111] text-white font-semibold mb-3 rounded-lg px-4 py-2 w-full text-lg hover:bg-[#333] transition-all flex items-center justify-center'
          >
            {loading ? (
              <ClipLoader size={20} color="#ffffff" /> // Loading spinner
            ) : (
              'Login'
            )}
          </button>
        </form>

        <p className='text-center text-gray-600'>
          New here?{' '}
          <Link to='/signup' className='text-blue-600 hover:underline'>
            Create new Account
          </Link>
        </p>
      </div>

      <div>
        <Link
          to='/captain-login'
          className='bg-[#10b461] flex items-center justify-center text-white font-semibold mb-5 rounded-lg px-4 py-2 w-full text-lg hover:bg-[#0d9a4f] transition-all'
        >
          Sign in as Captain
        </Link>
      </div>
    </div>
  );
};

export default UserLogin;