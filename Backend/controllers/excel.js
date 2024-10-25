const express = require("express");
const pool = require("../db");
const bodyParser = require("body-parser");
const multer = require("multer");
const cors = require("cors");
const ExcelJS = require("exceljs");
const router = express.Router();

router.use(bodyParser.json());
router.use(express.json());
const upload = multer({ storage: multer.memoryStorage() }); // Use memory storage for uploaded files

function formatDate(date) {
  if (!date) return null;
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}


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

let isImportInProgress = false;


//post method for testing the data file

async function handleImportExcel(req, res) {
  if (isImportInProgress) {
    return res.status(400).json({
      message: "Another import operation is in progress. Please wait.",
    });
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

    // Load the workbook directly from the buffer
    await workbook.xlsx.load(req.file.buffer);

    const worksheet = workbook.getWorksheet(1);
    const excelHeaders = worksheet.getRow(1).values.slice(1);

    const worksheetCount = workbook.worksheets.length;
    if (worksheetCount !== 1) {
      return res.status(400).json({
        message: "The Excel file must contain only one sheet or workbook.",
      });
    }

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

    const mobileNumbers = new Set();
    const batchSize = 10000;
    let updated_count = 0;
    let inserted_count = 0;

    await pool.query("BEGIN");

    for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
      const row = worksheet.getRow(rowNumber);
      const rowData = {};

      validSelectedColumns.forEach((dbColumn) => {
        const excelHeader = columnMapping[dbColumn];
        const colIndex = excelHeaders.indexOf(excelHeader) + 1;
        if (colIndex > 0) {
          rowData[dbColumn] = row.getCell(colIndex).value;
        }
      });

      if (!rowData.mobileno) {
        console.warn(`Row ${rowNumber} has a null or empty 'mobileno' value.`);
        break;
      }

      if (mobileNumbers.has(rowData.mobileno)) {
        return res.status(400).json({
          message: "Duplicate mobile numbers found in the uploaded file.",
          duplicates: [rowData.mobileno],
        });
      }

      mobileNumbers.add(rowData.mobileno);

       // Format dates to dd-mm-yyyy
       rowData.create_date = formatDate(rowData.create_date);
       rowData.last_updated_date = formatDate(new Date()); // Set current date for last_updated_date
       rowData.last_purchased_date = formatDate(rowData.last_purchased_date);

      const result = await pool.query(
        'SELECT * FROM "contacts" WHERE mobileno = $1',
        [rowData.mobileno]
      );

      if (result.rows.length > 0) {
        // Update existing record
        const updateColumns = validSelectedColumns.filter(col => col !== "last_updated_date");
  await pool.query(
    `UPDATE "contacts" SET ${updateColumns
      .map((col, i) => `"${col}" = $${i + 1}`)
      .join(", ")}, "last_updated_date" = $${updateColumns.length + 1} WHERE mobileno = $${updateColumns.length + 2}`,
    [...updateColumns.map((col) => rowData[col]), new Date(), rowData.mobileno]
  );
  updated_count++;
      } else {
        // Insert new record
        await pool.query(
          `INSERT INTO "contacts" (${validSelectedColumns
            .map((col) => `"${col}"`)
            .join(", ")}, "last_updated_date")
           VALUES (${validSelectedColumns
             .map((_, i) => `$${i + 1}`)
             .join(", ")}, $${validSelectedColumns.length + 1})`,
          [...validSelectedColumns.map((col) => rowData[col]), rowData.last_updated_date]
        );
        inserted_count++;
      }

      // Commit in batches
      if ((updated_count + inserted_count) % batchSize === 0) {
        await pool.query("COMMIT");
        await pool.query("BEGIN");
      }
    }

    // Final commit
    await pool.query("COMMIT");

    // Log import operation
    if (updated_count > 0 || inserted_count > 0) {
      await pool.query(
        "INSERT INTO logs (username, file_name, record_count, operation_type, updated_count, inserted_count) VALUES ($1, $2, $3, $4, $5, $6)",
        [
          req.body.username || "Admin",
          file_name,
          updated_count + inserted_count,
          "IMPORT",
          updated_count,
          inserted_count,
        ]
      );
    }

    res.status(200).json({
      message: "Import completed successfully",
      updated_count,
      inserted_count,
    });
  } catch (e) {
    await pool.query("ROLLBACK"); // Rollback transaction on error
    console.error("Error importing contacts:", e);

    // Prepare an error response
    const errorResponse = {
      message: "An error occurred while importing data",
      error: e.message || "Unknown error",
    };

    res.status(500).json(errorResponse);
  } finally {
    isImportInProgress = false;
  }
}

//to get all logs 
async function getAllLogs(req, res) {
  try {
    const result = await pool.query(
      "SELECT * FROM logs ORDER BY timestamp DESC"
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching logs :", error);
    res.status(500).send("an error occured while fetching the logs");
  }
}

module.exports = {
  handleImportExcel,
  getAllLogs,
};
