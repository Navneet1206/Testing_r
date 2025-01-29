import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import { CaptainContext } from "../context/CapatainContext";

const Navbar = () => {
  const { user } = useContext(UserContext);
  const { captain } = useContext(CaptainContext);

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
          <>
            <Link to="/user/history" className="text-black hover:text-gray-600 font-medium">
              Ride History
            </Link>
            <Link to="/home" className="text-black hover:text-gray-600 font-medium">
              Home
            </Link>
            <Link to="/user/logout" className="text-red-600 hover:text-gray-600 font-medium">
              Logout
            </Link>
          </>
        ) : captain ? (
          <>
            <Link to="/captain-home" className="text-black hover:text-gray-600 font-medium">
              Home
            </Link>
            <Link to="/captain/logout" className="text-black hover:text-gray-600 font-medium">
              Logout
            </Link>
          </>
        ) : (
          <>
            <Link to="/login" className="text-black hover:text-gray-600 font-medium">
              Login
            </Link>
            <Link to="/signup" className="text-black hover:text-gray-600 font-medium">
              Signup
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
