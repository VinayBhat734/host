import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SideBar from "../Layouts/SideBar";

function CreateNewUser() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Regular expression for email validation
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      alert("Please enter a valid email in the format: someone@gmail.com");
      return;
    }

    if (!validatePassword(password)) {
      alert("Password must be at least 8 characters long and contain at least one letter, one number, and one special character.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5700/users/new_user", {
        username,
        password,
        email
      });

      alert("New User Created Successfully");
      navigate("/admin/logout");
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    
 
      <div className="flex flex-col  items-center justify-center min-h-screen bg-gray-200"> 
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-3xl text-center font-semibold">
          Create New User
        </h1>
        <form className="" onSubmit={handleSubmit}>
          <label className="font-semibold">Username</label>
          <input
            type="username"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="block w-full"
            required
          />
          <label className="font-semibold">Password</label>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full"
            required
          />
          <label className="font-semibold">Email</label>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full"
            required
          />
          <button className="bg-blue-500 hover:bg-blue-600 w-full mt-5 py-2 rounded-xl font-semibold text-white">
            Create
          </button>
        </form>
      </div>
      </div>
  );
}

export default CreateNewUser;
