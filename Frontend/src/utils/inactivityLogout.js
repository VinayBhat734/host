import { useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";

const InactivityLogout = () => {
  const inactivityTimeoutRef = useRef(null); 
  const navigate = useNavigate();

  
  const handleLogout = useCallback(() => {
    console.log("Logging out due to inactivity");
    localStorage.clear(); 
    alert("You have been logged out due to inactivity.");
    clearTimeout(inactivityTimeoutRef.current); 
    navigate('/login')
  }, [navigate]);

  // Reset the inactivity timer
  const resetInactivityTimer = () => {
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }

    
    inactivityTimeoutRef.current = setTimeout(() => {
      handleLogout();
    }, 600000); // 10 minute inactivity timeout
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const activityHandler = () => {
        // console.log("User is active. Resetting inactivity timer.");
        resetInactivityTimer();
      };

     
      window.addEventListener("mousemove", activityHandler);
      window.addEventListener("keypress", activityHandler);
      window.addEventListener("scroll", activityHandler);
      window.addEventListener("click", activityHandler);

      resetInactivityTimer(); 

      return () => {
        window.removeEventListener("mousemove", activityHandler);
        window.removeEventListener("keypress", activityHandler);
        window.removeEventListener("scroll", activityHandler);
        window.removeEventListener("click", activityHandler);
        clearTimeout(inactivityTimeoutRef.current); 
      };
    }
  }, [handleLogout]);

  return null; 
};

export default InactivityLogout;
