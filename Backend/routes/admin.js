const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db");
const path = require("path");
const multer = require("multer");
const dotenv = require('dotenv');
const router = express.Router();
const { adminRegister,adminLogin,userLogin } = require("../controllers/admin");
const authenticateToken = require("../middleware/auth"); // Import the auth middleware
const nodemailer = require("nodemailer");
// const authMiddleware = require('../middleware/auth')
dotenv.config();

router.use(cors());
router.use(bodyParser.json());
router.use(express.json());

//register route
router
.route('/register')
.post(adminRegister)


//Login route
router
.route('/')
.post(adminLogin)

//User login
router
.route('/user-login')
.post(userLogin)

// Update Admin Details
router.put("/edit/:id", async (req, res) => {
  const { id } = req.params;
  const { newusername, email } = req.body;

  try {
    const result = await pool.query(
      "UPDATE admins SET username = $1, email = $2 WHERE id = $3 RETURNING *",
      [newusername, email, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.status(200).json({ message: "Admin updated successfully", data: result.rows[0] });
  } catch (error) {
    console.error("Error updating admin:", error);
    res.status(500).json({ message: "Error updating admin", error });
  }
});

router.put("user/edit/:id", async (req, res) => {
  const { id } = req.params;
  const { newusername, email } = req.body;

  try {
    const result = await pool.query(
      "UPDATE users SET username = $1, email = $2 WHERE id = $3 RETURNING *",
      [newusername, email, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User updated successfully", data: result.rows[0] });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Error updating user", error });
  }
});



// Protected Route Example
router.get("/protected", authenticateToken, (req, res) => {
  res.json({ message: "This is a protected route", user: req.user });
});



module.exports = router;
