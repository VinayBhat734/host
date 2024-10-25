const express = require("express");
const router = express.Router();
const cors = require("cors");

router.use(express.json())
const {
  handleCreateUsers,
  handleGetAllUsers,
  handleGetSingleUsers,
  handleUpdateUsers,
  handleDeleteUsers,
  handleDeleteSelectedUsers
} = require("../controllers/contacts");

router.use(cors());


router
  .route("/")
  // Create a user
  .post(handleCreateUsers)
  // Get all users
  .get(handleGetAllUsers)
  .delete(handleDeleteSelectedUsers)

router
  .route("/:sl_no")
  //get Single user
  .get(handleGetSingleUsers)
  // Update a user
  .put(handleUpdateUsers)
  // Delete a user
  .delete(handleDeleteUsers);



module.exports = router;
