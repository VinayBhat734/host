// routes/backup.js
const express = require("express");
const router = express.Router();
const pool = require("../db");
const cors = require("cors");
const fs = require("fs");
const XLSX = require("xlsx");
const path = require("path");
const { Parser } = require("json2csv");
const csv = require("csv-parser");
const {handleBackupAllData,handleRestoreAllData,getAllBackupData,getAllBackupFiles,handleDeleteBackupFiles,handleDeleteData,getAllDeletedData, restoreDeletedData}=require('../controllers/backup')


router.use(express.json());
router.use(cors());

router.route("/backup-all")
.post(handleBackupAllData)

router.route("/restore/:fileName")
.post(handleRestoreAllData)

router.route("/get-backups")
.get(getAllBackupData)

router.route("/backups/:fileName")
.get(getAllBackupFiles)

router.route("/delete-backup/:fileName")
.delete(handleDeleteBackupFiles)

router.route("/delete/:mobileno")
.delete(handleDeleteData)

router.route("/get-backup")
.get(getAllDeletedData)

router.route("/restore")
.post(restoreDeletedData)



module.exports = router;
