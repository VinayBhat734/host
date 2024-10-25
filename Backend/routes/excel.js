const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const multer = require("multer");
const cors = require("cors");
const pool = require("../db");
const ExcelJS = require("exceljs");
const {handleImportExcel,getAllLogs} = require('../controllers/excel')

router.use(cors());
router.use(bodyParser.json());
router.use(express.json());

const upload = multer({ storage: multer.memoryStorage() }); 


router
.route('/')
.post(upload.single("file"),handleImportExcel)

router
.route('/logs')
.get(getAllLogs)


module.exports = router;
