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
// const {handleTestExcelFile} =require("../controllers/test")

router.use(cors());
router.use(bodyParser.json());
router.use(express.json());
router.use("/uploads", express.static(path.join(__dirname, "uploads")));
router.use(express.static("uploads"));


const upload = multer({ storage: multer.memoryStorage() }); // Store uploaded files in memory


// router
// .post("/analyze", upload.single("file"),handleTestExcelFile)

const columnMapping = {
  name: "Name",
  customer_unique_code: "Customer Unique Code",
  clinic_college_name: "Clinic/College/Company Name",
  designation: "Designation",
  department: "Department",
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

router.post("/analyze", upload.single("file"), async (req, res) => {
  const results = [];
  let duplicateCount = 0;
  let genuineCount = 0;

  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded");
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer); // Load the file from memory
    const worksheet = workbook.getWorksheet(1);
    const excelHeaders = worksheet.getRow(1).values.slice(1);

    const mobileNumbers = new Set();

    // Check for header mismatches
    const invalidHeaders = excelHeaders.filter(
      (header) => !Object.values(columnMapping).includes(header)
    );

    if (invalidHeaders.length > 0) {
      return res.status(400).json({
        message: "Invalid headers found in the uploaded file.",
        invalidHeaders,
      });
    }

    for (let rowNumber = 2; rowNumber <= 25001; rowNumber++) {
      const row = worksheet.getRow(rowNumber);
      const rowData = {};

      Object.keys(columnMapping).forEach((dbColumn) => {
        const excelHeader = columnMapping[dbColumn];
        const colIndex = excelHeaders.indexOf(excelHeader) + 1;
        if (colIndex > 0) {
          rowData[dbColumn] = row.getCell(colIndex).value;
        }
      });

      const mobileNo = rowData.mobileno ? String(rowData.mobileno).trim() : null;
      if (!mobileNo) continue; // Skip if MobileNo is not provided

      if (mobileNumbers.has(mobileNo)) {
        duplicateCount++;
        results.push({ MobileNo: mobileNo, Genuine: false });
        break ;// Skip further checks for duplicates
      }

      mobileNumbers.add(mobileNo);
      const result = await pool.query(
        'SELECT * FROM "contacts" WHERE "mobileno" = $1',
        [mobileNo]
      );

      const comparisonResults = { MobileNo: mobileNo, Genuine: true }; // Assume genuine initially

      if (result.rows.length > 0) {
        duplicateCount++;
        comparisonResults.Genuine = false; // Mark as duplicate
        const dbData = result.rows[0];

        // Compare each field
        Object.keys(columnMapping).forEach((dbColumn) => {
          const excelValue = rowData[dbColumn];
          const dbValue = dbData[dbColumn];

          // Store both values in separate fields
          if (excelValue) {
            comparisonResults[`${columnMapping[dbColumn]} (Excel)`] = excelValue;
          }
          if (dbValue !== null) {
            comparisonResults[`${columnMapping[dbColumn]} (DB)`] = dbValue;
          }
        });
      } else {
        genuineCount++;
        // Add values if genuine, comparing each field similarly
        Object.keys(columnMapping).forEach((dbColumn) => {
          const excelValue = rowData[dbColumn];
          if (excelValue) {
            comparisonResults[`${columnMapping[dbColumn]} (Excel)`] = excelValue;
          }
        });
      }

      results.push(comparisonResults);
    }

    const resultWorkbook = new ExcelJS.Workbook();
    const resultWorksheet = resultWorkbook.addWorksheet("Results");

    // Define headers with separate columns for Excel and DB values
    const headers = [
      "MobileNo",
      "Genuine",
      ...Object.values(columnMapping).flatMap((col) => [
        `${col} (Excel)`,
        `${col} (DB)`,
      ]),
    ];
    resultWorksheet.columns = headers.map((header) => ({
      header,
      key: header,
    }));

    results.forEach((result) => {
      resultWorksheet.addRow(result);
    });

    const resultFilePath = `uploads/results_${Date.now()}.xlsx`;
    await resultWorkbook.xlsx.writeFile(resultFilePath);

    // Schedule file deletion after 1 minute
    setTimeout(() => {
      fs.unlink(resultFilePath, (err) => {
        if (err) {
          console.error("Error deleting file:", err);
        } else {
          console.log(`Deleted file: ${resultFilePath}`);
        }
      });
    }, 60000); // 60000 ms = 1 minute

    res.json({
      results,
      duplicateCount,
      genuineCount,
      downloadUrl: resultFilePath.replace("uploads/", ""),
    });
  } catch (error) {
    const errorResponse = {
      message: "An error occurred while processing the file",
      error: error.message || "File format is not correct",
    };

    res.status(500).json(errorResponse);
  }
});

router.get("/download/:file", (req, res) => {
  const filePath = `uploads/${req.params.file}`;
  res.download(filePath, (err) => {
    if (err) {
      console.error("Error downloading file:", err);
    }
  });
});

module.exports = router;
