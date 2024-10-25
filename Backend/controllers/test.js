const express = require("express");
const router = express.Router();
const xlsx = require("xlsx");
const bodyParser = require("body-parser");
const multer = require("multer");
const cors = require("cors");
const pool = require("../db");
const fs = require("fs");
const path = require("path");
const ExcelJS = require("exceljs");
const { format } = require("date-fns");


router.use(cors());
router.use(bodyParser.json());
router.use(express.json());
router.use("/uploads", express.static(path.join(__dirname, "uploads")));
router.use(express.static("uploads"));

const upload = multer({ storage: multer.memoryStorage() }); // Store uploaded files in memory

const columnMapping = {
    name: "Name",
    customer_unique_code: "Customer Unique Code",
    clinic_college_name: "Clinic / College Name",
    designation: "Designation",
    department:"Department",
    address: "Address",
    mobileno: "MobileNo",
    whatsapp_availability: "Whatsapp Availability",
    alternative_mobile_no: "Alternative Mobile Number",
    alternative_mobile_no2: "Alternative Mobile Number 2",
    alternative_mobile_no3: "Alternative Mobile Number 3",
    telephone: "Telephone",
    drug_license_no: "Drug License No",
    gst: "GST #",
    email_id: "E-mail Id",
    website: "Website",
    city: "City",
    state: "State",
    country: "Country",
    district: "District",
    pincode: "Pincode",
    type: "Type",
    source: "Source",
    status: "Status(Active/Inactive)",
    enquiry: "Enquiry",
    last_purchased_date: "Last Purchased Date",
    branch_data: "Branch Data",
    under_sales_person: "Under Sales person",
    create_date: "Create Date",
    age: "Age of Data",
    tags: "Tags",
    last_updated_date: "Last Updated Date",
  };
  
  let isImportInProgress = false;
  
  async function handleTestExcelFile(req,res){
    if (isImportInProgress) {
      return res.status(400).json({ message: "Another import operation is in progress. Please wait." });
    }
  
    isImportInProgress = true; 
    try {
      if (!req.file) {
        return res.status(400).send("No file uploaded");
      }
  
      const file_name = req.file.originalname;
      const selectedColumns = req.body.selectedColumns
        ? JSON.parse(req.body.selectedColumns)
        : [];
  
      if (!Array.isArray(selectedColumns) || selectedColumns.length === 0) {
        return res.status(400).send("Selected columns are required");
      }
  
      const validSelectedColumns = selectedColumns.filter((col) =>
        columnMapping.hasOwnProperty(col)
      );
  
      if (validSelectedColumns.length === 0) {
        return res.status(400).send("No valid columns selected");
      }
  
      const workbook = new ExcelJS.Workbook();
      const filePath = req.file.path;
      const readStream = fs.createReadStream(filePath);
      await workbook.xlsx.read(readStream);
  
      const worksheet = workbook.getWorksheet(1);
      const excelHeaders = worksheet.getRow(1).values.slice(1);
    
      const invalidHeaders = excelHeaders.filter(header => 
        !Object.values(columnMapping).includes(header)
      );
  
      if (invalidHeaders.length > 0) {
        return res.status(400).json({
          message: "Invalid headers found in the uploaded file.",
          invalidHeaders,
        });
      }
  
      const genuineData = [];
      const duplicateData = [];
      const mobileNumbers = new Set();
  
      for (let rowNumber = 2; rowNumber <= 25001; rowNumber++) {
        const row = worksheet.getRow(rowNumber);
        const rowData = {};
  
        validSelectedColumns.forEach((dbColumn) => {
          const excelHeader = columnMapping[dbColumn];
          const colIndex = excelHeaders.indexOf(excelHeader) + 1;
          if (colIndex > 0) {
            rowData[dbColumn] = row.getCell(colIndex).value;
          }
        });
        
        if (mobileNumbers.has(rowData.mobileno)) {
          return res.status(400).json({
            message: "Duplicate mobile numbers found in the uploaded file.",
            duplicates: [rowData.mobileno],
          });
        }

        if (!rowData.mobileno) {
          console.warn(`Row ${rowNumber} has a null or empty 'mobileno' value.`);
          continue; 
        }
  
        if (mobileNumbers.has(rowData.mobileno)) {
          duplicateData.push(rowData);
        } else {
          mobileNumbers.add(rowData.mobileno);
          genuineData.push(rowData);
        }
      }
  
      // Mark genuine data
      const markedGenuineData = genuineData.map(row => ({ ...row, Genuine: true }));
  
      // Create separate workbooks for genuine and duplicate data
      const genuineWorkbook = new ExcelJS.Workbook();
      const duplicateWorkbook = new ExcelJS.Workbook();
      const genuineWorksheet = genuineWorkbook.addWorksheet('Genuine Data');
      const duplicateWorksheet = duplicateWorkbook.addWorksheet('Duplicate Data');
  
      // Add headers to genuine worksheet
      genuineWorksheet.addRow([...validSelectedColumns, 'Genuine']);
      markedGenuineData.forEach(row => {
        genuineWorksheet.addRow([...validSelectedColumns.map(col => row[col]), true]);
      });
  
      // Add headers to duplicate worksheet
      duplicateWorksheet.addRow(validSelectedColumns);
      duplicateData.forEach(row => {
        duplicateWorksheet.addRow(validSelectedColumns.map(col => row[col]));
      });
  
      // Save files
      const genuineFilePath = `./uploads/genuine_${file_name}`;
      const duplicateFilePath = `./uploads/duplicates_${file_name}`;
      await genuineWorkbook.xlsx.writeFile(genuineFilePath);
      await duplicateWorkbook.xlsx.writeFile(duplicateFilePath);
  
      res.status(200).json({
        message: "Files created successfully",
        genuineFile: genuineFilePath,
        duplicateFile: duplicateFilePath,
      });
    } catch (e) {
      console.error("Error importing contacts:", e);
      // Prepare an error response
    const errorResponse = {
      message: "An error occurred while importing data",
      error: e.message || "Unknown error",
    };

    res.status(500).json(errorResponse);
      
    } finally {
      isImportInProgress = false; 
      if (req.file && req.file.path) {
        fs.unlink(req.file.path, (err) => {
          if (err) {
            console.error("Error cleaning up the file:", err);
          } else {
            console.log("File cleaned up successfully");
          }
        });
      }
    }
  }

  async function handlegetDownloadFile(req,res){
    const filePath = `uploads/${req.params.file}`;
  res.download(filePath, (err) => {
    if (err) {
      console.error("Error downloading file:", err);
    }
  });
  }

  module.exports = {
    handleTestExcelFile,
    handlegetDownloadFile,
  }