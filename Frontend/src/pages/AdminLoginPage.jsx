import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";


const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const [loginType, setLoginType] = useState("admin/user-login");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      alert("You are already logged in.");
      navigate("/admin"); // Redirect to admin page
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`http://localhost:5700/${loginType}`, {
        username,
        password,
        recaptchaToken,
      });
      
      const { id, token } = response.data;

      // Store token and expiration time (1 minute for testing purposes)
      localStorage.setItem("token", token);
      localStorage.setItem("id", id); // Store ID in local storage
      localStorage.setItem("username", response.data.username);
      localStorage.setItem("loginType", loginType);

      alert("You are logged in successfully");
      navigate(`/admin`);
    } catch (error) {
      console.error("Login error:", error);
      alert(
        error.response?.data?.error || "An error occurred. Please try again."
      );
    }
  };
  const siteKey = import.meta.env.VITE_REACT_APP_SITE_KEY; // Accessing the site key

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">Login</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-around mb-4">
            <label>
              <input
                type="radio"
                name="loginType"
                value="admin"
                checked={loginType === "admin"}
                onChange={(e) => setLoginType(e.target.value)}
                className="mr-2"
              />
              Admin
            </label>
            <label>
              <input
                type="radio"
                name="loginType"
                value="admin/user-login"
                checked={loginType === "admin/user-login"}
                onChange={(e) => setLoginType(e.target.value)}
                className="mr-2"
              />
              User
            </label>
          </div>
          <input
            type="username"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="block w-full p-2 border border-gray-300 rounded-md"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full p-2 border border-gray-300 rounded-md"
            required
          />
          <ReCAPTCHA
            sitekey={siteKey}
            onChange={setRecaptchaToken}
            className="ml-10"
            required
          />
          <button
            type="submit"
            className="bg-blue-500 text-white w-full py-2 rounded-md hover:bg-blue-600"
          >
            Login
          </button>
        </form>
        {loginType === "admin" && (
          <div className="text-center mt-4">
            <Link to="/forgot-password">Forgot Password?</Link>
          </div>
        )}
        {loginType === "admin/user-login" && (
          <div className="text-center mt-4">
            <Link to="/user-forgot-password">Forgot Password?</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
