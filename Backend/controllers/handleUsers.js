const express = require("express");
const router = express.Router();
const pool = require("../db");
const cors = require("cors");
const bcrypt = require("bcryptjs");

router.use(express.json());
router.use(cors());

//create new Users
async function createUsers(req, res) {
  const { username, password, email } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO users (username,password,email) VALUES($1,$2,$3) ",
      [username, hashedPassword, email]
    );

    res.status(200).send("user created successfully");
  } catch (error) {
    console.error("some error occured", error);
    res.status(500).send(error);
  }
}

//get all users
async function getAllUsers(req, res) {
  try {
    const result = await pool.query("SELECT * FROM users");
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error occurred:", error);
    res.status(500).send(error);
  }
}

//update a users
async function updateUsers(req, res) {
  const { id } = req.params;
  const { username, email } = req.body;
  try {
    let updateQuery = "UPDATE users SET username = $1 ,email = $2 ";
    const values = [username, email];

    updateQuery += " WHERE id = $3";
    values.push(id);

    await pool.query(updateQuery, values);
    res.status(200).send("User updated successfully");
  } catch (error) {
    console.error("Error occurred:", error);
    res.status(500).send(error);
  }
}

//delete a user
async function deleteUsers(req, res) {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM users WHERE id = $1", [id]);
    res.status(200).send("User deleted successfully");
  } catch (error) {
    console.error("Error occurred:", error);
    res.status(500).send(error);
  }
}

module.exports = {
  createUsers,
  getAllUsers,
  updateUsers,
  deleteUsers,
};
