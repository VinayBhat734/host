import React, { createContext, useState, useEffect } from "react";
import axios from "axios";


export const DropdownContext = createContext();


export const DropdownProvider = ({ children }) => {
  const [dropdownOptions, setDropdownOptions] = useState({
    designation: [],
    country: [],
    state: [],
    city: [],
    district: [],
    type: [],
    status: [],
    salesPerson: [],
    tags: [],
  });

  useEffect(() => {
    const fetchDropdownOptions = async () => {
      try {
        const response = await axios.get("http://localhost:5700/dropdown"); 
        setDropdownOptions(response.data);
      } catch (error) {
        console.error("Error fetching dropdown options:", error);
      }
    };

    fetchDropdownOptions();
  }, []);

  return (
    <DropdownContext.Provider value={{ dropdownOptions, setDropdownOptions }}>
      {children}
    </DropdownContext.Provider>
  );
};
