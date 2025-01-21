import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { UserDataContext } from '../context/UserContext';
import { CaptainDataContext } from '../context/CapatainContext';

const Navbar = () => {
  const { user } = useContext(UserDataContext);
  const { captain } = useContext(CaptainDataContext);

  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-md z-50 p-4 flex justify-between items-center">
      <Link to="/">
        <img
          className="w-16"
          src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png"
          alt="Uber Logo"
        />
      </Link>

      <div className="flex items-center gap-4">
        {user ? (
          // User is logged in
          <>
            <Link
              to="/home"
              className="text-black hover:text-gray-600 font-medium"
            >
              Home
            </Link>
            <Link
              to="/user/logout"
              className="text-red-600 hover:text-gray-600 font-medium"
            >
              Logout
            </Link>
          </>
        ) : captain ? (
          // Captain is logged in
          <>
            <Link
              to="/captain-home"
              className="text-black hover:text-gray-600 font-medium"
            >
              Home
            </Link>
            <Link
              to="/captain/logout"
              className="text-black hover:text-gray-600 font-medium"
            >
              Logout
            </Link>
          </>
        ) : (
          // No one is logged in
          <>
            <Link
              to="/login"
              className="text-black hover:text-gray-600 font-medium"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="text-black hover:text-gray-600 font-medium"
            >
              Signup
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;