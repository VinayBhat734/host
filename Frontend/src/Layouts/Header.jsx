import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import '@fontsource/poppins';
import axios from "axios";


function Header() {
  const [showModal, setShowModal] = useState(false); 
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  useEffect(() => {
   
    const token = localStorage.getItem("token");
    setIsAdminLoggedIn(!!token); 
  }, []);

  const handleLogout = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("No active session found. You are logged out.");
      return navigate("/login");
    }

    try {
      await axios.post(
        "http://localhost:5700/logout",
        {},
        {
          headers: {
            "x-auth-token": token,
          },
        }
      );

      // Clear local storage on logout
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      localStorage.removeItem("loginType");
      localStorage.removeItem("expiration");
      alert("Logged out successfully");
      setIsAdminLoggedIn(false); 
      navigate("/login"); 
    } catch (err) {
      console.error("Error logging out:", err);
      alert("Error logging out. Please try again.");
    }
  };

  // Confirm Logout
  const confirmLogout = () => {
    setShowModal(true);
  };

  const handleConfirmLogout = () => {
    setShowModal(false);
    handleLogout(); // Call the actual logout function
  };

  const handleCancelLogout = () => {
    setShowModal(false); 
  };

  // Check if the current location is "/login"
  const isLoginPage = location.pathname === "/login";

  return (
    <header className="flex items-center justify-between w-full h-20 bg-gray-800 p-4 md:p-6">
      {/* Logo Section */}
      <Link to="/admin" className="flex items-center gap-1">
        <img style={{ width: '100px', height: '90px' }} className="ml-12" src="../logo2.png" alt="Logo" />
      </Link>

      {/* Title Section */}
      <Link className="text-xl text-white md:text-2xl lg:text-4xl font-bold hidden sm:block">
        Database Portal
      </Link>

      {/* User Profile Section */}
      <div className="relative flex items-center gap-4">
        {!isLoginPage && isAdminLoggedIn && ( // Conditionally render the profile icon
          <div 
            className="flex items-center bg-white px-4 py-1.5 rounded-3xl"
          >
            <Link 
              to="admin/logout"
              className="flex items-center"
            >
              <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
              <div 
                className="bg-gray-500 text-white rounded-full border border-gray-500 overflow-hidden w-8 h-8 flex items-center justify-center cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </Link>
          </div>
        )}

        {/* Separate Logout Button */}
        {!isLoginPage &&isAdminLoggedIn && (
          <button
            className="ml-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-200"
            onClick={confirmLogout} 
          >
            Logout
          </button>
        )}
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20">
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Confirm Logout</h2>
            <p>Are you sure you want to log out?</p>
            <div className="flex justify-end mt-4">
              <button
                className="mr-2 bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
                onClick={handleCancelLogout} // Cancel logout
              >
                Cancel
              </button>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                onClick={handleConfirmLogout} // Confirm logout
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
