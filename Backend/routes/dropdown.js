const express = require("express");
const router = express.Router();
const pool = require("../db");
const cors = require("cors");
const {getRoutes,postRoutes,deleteRoutes} = require('../controllers/dropdown')

router.use(cors());
router.use(express.json());


router
.route('/')
// GET dropdown values
.get(getRoutes)
// to add a new value
.post(postRoutes)
//  to remove a value
.delete(deleteRoutes)


module.exports = router;
