const express = require("express");
const router = express.Router();
const pool = require("../db");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const {
  createUsers,
  getAllUsers,
  updateUsers,
  deleteUsers,
} = require("../controllers/handleUsers");

router.use(express.json());
router.use(cors());

// Create new Users
router.route("/new_user").post(createUsers);

// Get all users
router.route("/").get(getAllUsers);

router
  .route("/:id")
  //update a user
  .put(updateUsers)
  //delete a user
  .delete(deleteUsers);

module.exports = router;
