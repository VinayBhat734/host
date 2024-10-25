const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("./db");
const xlsx = require("xlsx");
const path = require("path");
const multer = require("multer");
const app = express();
const fs = require("fs");
const ExcelJS = require("exceljs");
const { format } = require("date-fns");
const status = require("express-status-monitor");
require("dotenv").config();

const userapp = require("./routes/contacts");
const importExcelapp = require("./routes/excel");
const adminLogin = require("./routes/admin");
const backupRoutes = require("./routes/backup");
const testRoutes = require("./routes/test");
const adminReset = require("./routes/adminReset");
const userReset = require("./routes/userReset");
const dropDown = require("./routes/dropdown");
const portalUser = require('./routes/handleUsers')


app.use("/contacts", userapp);
app.use("/admin", adminLogin);
app.use("/import", importExcelapp);
app.use("/api/backup", backupRoutes);
app.use("/test", testRoutes);
app.use("/adminReset", adminReset);
app.use("/userReset", userReset);
app.use("/dropdown", dropDown);
app.use('/users',portalUser)
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.static("uploads"));
app.use(cors());
app.use(status());

// In-memory store for invalidated tokens (use Redis or similar in production)
let invalidatedTokens = [];
// Middleware to authenticate and check for invalidated tokens
const authMiddleware = (req, res, next) => {
  const token = req.header("x-auth-token");

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, "secret");
    req.user = decoded;

    // Check if the token is in the blacklist
    if (invalidatedTokens.includes(token)) {
      return res.status(401).json({ message: "Token invalidated" });
    }

    next();
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
};


app.get('/',(req,res)=>{
  res.json("server started successfully");
})

app.post("/register", async (req, res) => {
  const { username, password, email } = req.body;
  try {
    const userExist = await pool.query(
      "SELECT * FROM admins WHERE username =$1",
      [username]
    );
    if (userExist.rows.length > 0) {
      return res.status(400).json({ error: "username already exist" });
    }
    const salt = 10;
    const hashedPassword = await bcrypt.hash(password, salt);

    await pool.query(
      "INSERT INTO admins (username,password,email) VALUES ($1,$2,$3)",
      [username, hashedPassword, email]
    );
    console.log("admin user created");
    res.status(201).send("admin user created ");
  } catch (error) {
    console.error("error creting admin user", error);
    res.status(500).json("error occured");
  }
});

// Logout Route
app.post("/logout", authMiddleware, (req, res) => {
  const token = req.header("x-auth-token");

  if (!token) {
    return res.status(400).json({ message: "No token provided" });
  }

  // Add the token to the invalidated tokens list
  invalidatedTokens.push(token);

  // Optionally, you could also remove the token from the database if you're storing it there

  res.json({ message: "Logged out successfully" });
});


app.post("/contacts/check-mobileno", async (req, res) => {
  const { mobileno } = req.body;

  if (!mobileno) {
    return res.status(400).json({ message: "Mobile number is required" });
  }

  try {
    const result = await pool.query(
      "SELECT COUNT(*) FROM contacts WHERE mobileno = $1",
      [mobileno]
    );
    const count = parseInt(result.rows[0].count, 10);

    if (count > 0) {
      return res.status(200).json({ exists: true });
    } else {
      return res.status(200).json({ exists: false });
    }
  } catch (error) {
    console.error("Error checking mobile number:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});


const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
