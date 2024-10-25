const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");
const bcrypt = require("bcrypt");
const pool = require("../db");
const router = express.Router();
const nodemailer = require('nodemailer');
const dotenv = require('dotenv')
dotenv.config();

router.use(cors());
router.use(bodyParser.json());
router.use(express.json());


// Generate OTP
const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };
  
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.AUTH_USER, // your email
      pass: process.env.AUTH_PASS // your app password
    },
  });

  async function forgotPassword(req,res){
    const { email } = req.body; // Get email from request
  
    try {
      const userQuery = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
      );
  
      if (userQuery.rows.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }
  
      const otp = generateOtp();
  
      await transporter.sendMail({
        from:process.env.EMAIL,
        to: email,
        subject: "Reset Password OTP",
        text: `Your OTP for resetting password is ${otp}`,
      });
  
      // Save OTP in the database
      await pool.query("UPDATE users SET otp = $1 WHERE email = $2", [
        otp,
        email,
      ]);
  
      res.status(200).json({ message: "OTP sent to your email" });
    } catch (error) {
      console.error("Error sending OTP:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }


  async function verifyOtp(req,res){
    const { email, otp } = req.body;
  
    try {
      const userQuery = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
      );
  
      if (userQuery.rows.length === 0 || userQuery.rows[0].otp !== otp) {
        return res.status(400).json({ error: "Invalid OTP" });
      }
  
      // OTP is valid
      res
        .status(200)
        .json({ message: "OTP verified, you can reset your password" });
    } catch (error) {
      console.error("Error verifying OTP:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async function resetPassword(req,res){
    const { email, newPassword } = req.body;
  
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await pool.query("UPDATE users SET password = $1 WHERE email = $2", [
        hashedPassword,
        email,
      ]);
      res.status(200).json({ message: "Password reset successful" });
    } catch (error) {
      console.error("Error resetting password:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  module.exports={
    forgotPassword,
    verifyOtp,
    resetPassword
  }