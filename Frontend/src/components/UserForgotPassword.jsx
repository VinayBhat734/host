import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const UserForgotPassword = () => {
  const [email,setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1); 
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleRequestOtp = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5700/userReset/forgot-password",
        { email }
      );
      setMessage(response.data.message);
      setStep(2); // Move to verify OTP
    } catch (error) {
      setMessage(error.response.data.error);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5700/userReset/verify-otp",
        { email, otp }
      );
      setMessage(response.data.message);
      setStep(3); // Move to reset password
    } catch (error) {
      setMessage(error.response.data.error);
    }
  };

  const handleResetPassword = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5700/userReset/reset-password",
        { email, newPassword }
      );
      setMessage(response.data.message);
      alert("Password reset Successfully");
      navigate('/login')
    } catch (error) {
      setMessage(error.response.data.error);
    }
  };

  return (
   <div className="flex items-center justify-center min-h-screen ">
    <div className="bg-gray-200 shadow-sm p-24 rounded-lg">
    <h2 className="font-bold text-2xl mb-5">Forgot Password</h2>
    {message && <p>{message}</p>}
    {step === 1 && (
        <div>
            <input className=" border-black hover:bg-gray-100 mr-4 p-3  rounded-md"
            type="text"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required />
            <button
            className="bg-red-500 hover:bg-red-600 p-2 text-white rounded-md"
            onClick={handleRequestOtp}
          >
            Send OTP
          </button>
        </div>
    )}
     {step === 2 && (
        <div>
          <input
          className="mt-2 border-black hover:bg-gray-100 mr-4 p-3  rounded-md"
            type="text"
            placeholder="Enter the OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
          <button  className="bg-red-500 hover:bg-red-600 p-2 text-white rounded-md" onClick={handleVerifyOtp}>Verify OTP</button>
        </div>
      )}
      {step === 3 && (
        <div>
          <input
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <button  className="mt-3 bg-red-500 hover:bg-red-600 p-2 text-white rounded-md" onClick={handleResetPassword}>Reset Password</button>
        </div>
      )}
    </div>
   </div>
  );
};

export default UserForgotPassword;
