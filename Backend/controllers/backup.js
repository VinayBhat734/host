const express = require("express");
const router = express.Router();
const pool = require("../db");
const cors = require("cors");
const fs = require("fs");
const XLSX = require("xlsx");
const path = require("path");
const { Parser } = require("json2csv");
const csv = require("csv-parser");

router.use(express.json());
router.use(cors());

async function handleBackupAllData(req, res) {
  const { fileName } = req.body;

  if (!fileName) {
    return res.status(400).send("File name is required");
  }

  try {
    const query = "SELECT * FROM contacts";
    const result = await pool.query(query);
    const contacts = result.rows;

    if (contacts.length === 0) {
      return res.status(404).send("No data to backup");
    }

    // Check existing mobile numbers in contacts_backup
    const existingBackupQuery = "SELECT mobileno FROM contacts_backup";
    const existingBackupResult = await pool.query(existingBackupQuery);
    const existingMobilenos = new Set(
      existingBackupResult.rows.map((row) => row.mobileno)
    );

    // Create a .csv file
    const csvFileName = `${fileName}.csv`;
    const csvFilePath = path.join(__dirname, "backups", csvFileName);

    // Prepare CSV data with custom headers
    const json2csvParser = new Parser({
      fields: [
        "name",
        "customer_unique_code",
        "clinic_college_name",
        "designation",
        "department",
        "address",
        "mobileno",
        "whatsapp_availability",
        "alternative_mobile_no",
        "alternative_mobile_no2",
        "alternative_mobile_no3",
        "telephone",
        "drug_license_no",
        "gst",
        "email_id",
        "website",
        "city",
        "state",
        "country",
        "district",
        "pincode",
        "type",
        "source",
        "status",
        "enquiry",
        "last_purchased_date",
        "branch_data",
        "under_sales_person",
        "create_date",
        "age",
        "tags",
        "last_updated_date",
        "backup_date",
      ],
      // Optional: Customize header names
      header: true,
      // You can also set a default value for missing fields here if needed
    });

    const filteredContacts = contacts.filter(
      (contact) => !existingMobilenos.has(contact.mobileno)
    );

    if (filteredContacts.length === 0) {
      return res.status(200).send("No new data to backup");
    }

    const csv = json2csvParser.parse(
      filteredContacts.map((contact) => ({
        name: contact.name,
        customer_unique_code: contact.customer_unique_code,
        clinic_college_name: contact.clinic_college_name,
        designation: contact.designation,
        department: contact.department,
        address: contact.address,
        mobileno: contact.mobileno,
        whatsapp_availability: contact.whatsapp_availability,
        alternative_mobile_no: contact.alternative_mobile_no,
        alternative_mobile_no2: contact.alternative_mobile_no2,
        alternative_mobile_no3: contact.alternative_mobile_no3,
        telephone: contact.telephone,
        drug_license_no: contact.drug_license_no,
        gst: contact.gst,
        email_id: contact.email_id,
        website: contact.website,
        city: contact.city,
        state: contact.state,
        country: contact.country,
        district: contact.district,
        pincode: contact.pincode,
        type: contact.type,
        source: contact.source,
        status: contact.status,
        enquiry: contact.enquiry,
        last_purchased_date: contact.last_purchased_date
          ? new Date(contact.last_purchased_date).toISOString()
          : null,
        branch_data: contact.branch_data,
        under_sales_person: contact.under_sales_person,
        create_date: contact.create_date
          ? new Date(contact.create_date).toISOString()
          : null,
        age: contact.age,
        tags: contact.tags,
        last_updated_date: contact.last_updated_date
          ? new Date(contact.last_updated_date).toISOString()
          : null,
        backup_date: new Date().toISOString(), // Add backup_date here
      }))
    );

    // Write to the CSV file
    fs.writeFileSync(csvFilePath, csv);

    // Store backup in contacts_backup table
    for (const contact of filteredContacts) {
      const values = [
        contact.mobileno,
        contact.name,
        contact.customer_unique_code,
        contact.clinic_college_name,
        contact.designation,
        contact.department,
        contact.address,
        contact.whatsapp_availability,
        contact.alternative_mobile_no,
        contact.alternative_mobile_no2,
        contact.alternative_mobile_no3,
        contact.telephone,
        contact.drug_license_no,
        contact.gst,
        contact.email_id,
        contact.website,
        contact.city,
        contact.state,
        contact.country,
        contact.district,
        contact.pincode,
        contact.type,
        contact.source,
        contact.status,
        contact.enquiry,
        contact.last_purchased_date
          ? new Date(contact.last_purchased_date).toISOString()
          : null,
        contact.branch_data,
        contact.under_sales_person,
        contact.create_date
          ? new Date(contact.create_date).toISOString()
          : null,
        contact.age,
        contact.tags,
        contact.last_updated_date
          ? new Date(contact.last_updated_date).toISOString()
          : null,
        new Date().toISOString(), // Add backup_date here
      ];

      await pool.query(
        `INSERT INTO contacts_backup (mobileno, name, customer_unique_code, clinic_college_name, designation, department, address,
             whatsapp_availability, alternative_mobile_no, alternative_mobile_no2, alternative_mobile_no3,
             telephone, drug_license_no, gst, email_id, website, city, state, country, district, pincode,
             type, source, status, enquiry, last_purchased_date, branch_data, under_sales_person, create_date,
             age, tags, last_updated_date, backup_date)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
             $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33)`,
        values // Ensure values includes backup_date
      );
    }

    res.status(200).json({ fileName: csvFileName });
  } catch (error) {
    console.error("Error backing up data:", error);
    res.status(500).send("Error backing up data");
  }
}

// Handle array fields and clean up with error handling
const parseArrayField = (field) => {
    if (!field) return [];
    
    const cleaned = field.replace(/^\[|\]$/g, '').trim();
    if (!cleaned) return [];
    
    return cleaned.split(',')
      .map(item => item.trim().replace(/^"|"$/g, '')) // Remove quotes from the start and end of each item
      .filter(item => item && item !== '""'); // Remove empty strings and `""`
  };

async function handleRestoreAllData(req,res){
    const { fileName } = req.params;

  if (!fileName) {
    return res.status(400).send("File name is required");
  }

  const filePath = path.join(__dirname, "backups", fileName);

  // Check if the CSV file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).send("CSV file not found");
  }

  try {
    const existingBackupQuery = "SELECT mobileno FROM contacts_backup";
    const existingBackupResult = await pool.query(existingBackupQuery);
    const existingBackupMobilenos = new Set(
      existingBackupResult.rows.map((row) => row.mobileno)
    );

    const contactsToRestore = [];

    // Read CSV file and process the contacts
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        if (existingBackupMobilenos.has(row.mobileno)) {
          row.whatsapp_availability = row.whatsapp_availability === "true";
          // Convert bigint fields, ensuring empty strings are handled
          row.alternative_mobile_no = row.alternative_mobile_no
            ? parseInt(row.alternative_mobile_no, 10)
            : null;
          row.alternative_mobile_no2 = row.alternative_mobile_no2
            ? parseInt(row.alternative_mobile_no2, 10)
            : null;
          row.alternative_mobile_no3 = row.alternative_mobile_no3
            ? parseInt(row.alternative_mobile_no3, 10)
            : null;

          // Convert other relevant fields
          row.age = row.age ? parseInt(row.age, 10) : null;
          row.create_date = row.create_date
            ? new Date(row.create_date).toISOString()
            : null;
          row.last_purchased_date = row.last_purchased_date
            ? new Date(row.last_purchased_date).toISOString()
            : null;
          row.last_updated_date = row.last_updated_date
            ? new Date(row.last_updated_date).toISOString()
            : null;
          // Inside your .on('data', (row) => { ... })
          row.enquiry = parseArrayField(row.enquiry);
          row.tags = parseArrayField(row.tags);

          contactsToRestore.push(row);
        }
      })
      .on("end", async () => {
        if (contactsToRestore.length === 0) {
          return res.status(404).send("No matching records found for restore");
        }

        // Restore contacts to the main contacts table
        for (const contact of contactsToRestore) {
          const values = [
            contact.name,
            contact.customer_unique_code,
            contact.clinic_college_name,
            contact.designation,
            contact.department,
            contact.address,
            contact.mobileno,
            contact.whatsapp_availability,
            contact.alternative_mobile_no,
            contact.alternative_mobile_no2,
            contact.alternative_mobile_no3,
            contact.telephone,
            contact.drug_license_no,
            contact.gst,
            contact.email_id,
            contact.website,
            contact.city,
            contact.state,
            contact.country,
            contact.district,
            contact.pincode,
            contact.type,
            contact.source,
            contact.status,
            contact.enquiry,
            contact.last_purchased_date
              ? new Date(contact.last_purchased_date).toISOString()
              : null,
            contact.branch_data,
            contact.under_sales_person,
            contact.create_date
              ? new Date(contact.create_date).toISOString()
              : null,
            contact.age,
            contact.tags,
            contact.last_updated_date
              ? new Date(contact.last_updated_date).toISOString()
              : null,
            // new Date().toISOString() // Add current date for last updated
          ];

          // Check if the contact already exists in the contacts table
          const existingContactQuery =
            "SELECT * FROM contacts WHERE mobileno = $1";
          const existingContactResult = await pool.query(existingContactQuery, [
            contact.mobileno,
          ]);

          if (existingContactResult.rows.length > 0) {
            // Update the existing contact
            await pool.query(
              `UPDATE contacts SET name = $1, customer_unique_code = $2, clinic_college_name = $3,
                designation = $4, department = $5, address = $6, whatsapp_availability = $7,
                alternative_mobile_no = $8, alternative_mobile_no2 = $9, alternative_mobile_no3 = $10,
                telephone = $11, drug_license_no = $12, gst = $13, email_id = $14, website = $15,
                city = $16, state = $17, country = $18, district = $19, pincode = $20, type = $21,
                source = $22, status = $23, enquiry = $24, last_purchased_date = $25,
                branch_data = $26, under_sales_person = $27, create_date = $28, age = $29,
                tags = $30, last_updated_date = $31,
              WHERE mobileno = $32`,
              [...values, contact.mobileno]
            );
          } else {
            // Insert new contact
            await pool.query(
              `INSERT INTO contacts (name, customer_unique_code, clinic_college_name, designation, department, address,
                mobileno, whatsapp_availability, alternative_mobile_no, alternative_mobile_no2, alternative_mobile_no3,
                telephone, drug_license_no, gst, email_id, website, city, state, country, district, pincode,
                type, source, status, enquiry, last_purchased_date, branch_data, under_sales_person,
                create_date, age, tags, last_updated_date)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
                $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31,$32)`,
              values
            );
          }
        }

        // Delete restored contacts from contacts_backup
        for (const contact of contactsToRestore) {
          await pool.query("DELETE FROM contacts_backup WHERE mobileno = $1", [
            contact.mobileno,
          ]);
        }

        // Delete the CSV file
        fs.unlinkSync(filePath);

        res.status(200).send("Restore completed successfully");
      });
  } catch (error) {
    console.error("Error restoring data:", error);
    res.status(500).send("Error restoring data");
  }
}

async function getAllBackupData(req,res){
    try {
        const backupDir = path.join(__dirname, "backups");
        const files = fs.readdirSync(backupDir);
        res.json(files);
      } catch (error) {
        console.error("Error fetching backup files:", error);
        res.status(500).send("Error fetching backup files");
      }
}

async function getAllBackupFiles(req,res){
    const { fileName } = req.params;
    const filePath = path.join(__dirname, "backups", fileName);
  
    res.download(filePath, (err) => {
      if (err) {
        console.error("Error sending file:", err);
        res.status(404).send("File not found");
      }
    });
}

async function handleDeleteBackupFiles(req,res){
    const { fileName } = req.params;
  const filePath = path.join(__dirname, "backups", fileName);

  fs.unlink(filePath, (err) => {
    if (err) {
      console.error("Error deleting backup file:", err);
      return res.status(500).send("Error deleting backup file");
    }
    res.status(200).send("Backup file deleted successfully");
  });
}

async function handleDeleteData(req,res){
    const { mobileno } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM contacts_delete WHERE mobileno = $1",
      [mobileno]
    );

    if (result.rowCount > 0) {
      return res
        .status(200)
        .json({ message: "Backup data deleted successfully" });
    } else {
      return res.status(404).json({ message: "Backup data not found" });
    }
  } catch (error) {
    console.error("Error deleting backup data:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function getAllDeletedData(req,res){
    try {
        const result = await pool.query(
          "SELECT * FROM contacts_delete ORDER BY backup_date DESC"
        );
        res.json(result.rows);
      } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
      }
}

async function restoreDeletedData(req,res) {
    const { mobileno } = req.body;

    try {
      // Fetch data from backup
      const result = await pool.query(
        "SELECT * FROM contacts_delete WHERE mobileno = $1",
        [mobileno]
      );
      const backupData = result.rows[0];
  
      if (backupData) {
        // Restore data to contacts table
        await pool.query(
          `INSERT INTO contacts (
              mobileno, name, customer_unique_code, clinic_college_name, designation, department, address, 
              whatsapp_availability, alternative_mobile_no, alternative_mobile_no2, alternative_mobile_no3, 
              telephone, drug_license_no, gst, email_id, website, city, state, country, district, pincode, 
              type, source, status, enquiry, last_purchased_date, branch_data, under_sales_person, 
              create_date, age, tags, last_updated_date
          ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, 
              $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32
          ) ON CONFLICT (mobileno) DO UPDATE SET 
              name = EXCLUDED.name, 
              customer_unique_code = EXCLUDED.customer_unique_code, 
              clinic_college_name = EXCLUDED.clinic_college_name, 
              designation = EXCLUDED.designation, 
              department = EXCLUDED.department,
              address = EXCLUDED.address, 
              whatsapp_availability = EXCLUDED.whatsapp_availability, 
              alternative_mobile_no = EXCLUDED.alternative_mobile_no, 
              alternative_mobile_no2 = EXCLUDED.alternative_mobile_no2, 
              alternative_mobile_no3 = EXCLUDED.alternative_mobile_no3, 
              telephone = EXCLUDED.telephone, 
              drug_license_no = EXCLUDED.drug_license_no, 
              gst = EXCLUDED.gst, 
              email_id = EXCLUDED.email_id, 
              website = EXCLUDED.website, 
              city = EXCLUDED.city, 
              state = EXCLUDED.state, 
              country = EXCLUDED.country, 
              district = EXCLUDED.district, 
              pincode = EXCLUDED.pincode, 
              type = EXCLUDED.type, 
              source = EXCLUDED.source, 
              status = EXCLUDED.status, 
              enquiry = EXCLUDED.enquiry, 
              last_purchased_date = EXCLUDED.last_purchased_date, 
              branch_data = EXCLUDED.branch_data, 
              under_sales_person = EXCLUDED.under_sales_person, 
              create_date = EXCLUDED.create_date, 
              age = EXCLUDED.age, 
              tags = EXCLUDED.tags, 
              last_updated_date = EXCLUDED.last_updated_date
          `,
          [
            backupData.mobileno,
            backupData.name,
            backupData.customer_unique_code,
            backupData.clinic_college_name,
            backupData.designation,
            backupData.department,
            backupData.address,
            backupData.whatsapp_availability,
            backupData.alternative_mobile_no,
            backupData.alternative_mobile_no2,
            backupData.alternative_mobile_no3,
            backupData.telephone,
            backupData.drug_license_no,
            backupData.gst,
            backupData.email_id,
            backupData.website,
            backupData.city,
            backupData.state,
            backupData.country,
            backupData.district,
            backupData.pincode,
            backupData.type,
            backupData.source,
            backupData.status,
            backupData.enquiry,
            backupData.last_purchased_date,
            backupData.branch_data,
            backupData.under_sales_person,
            backupData.create_date,
            backupData.age,
            backupData.tags,
            backupData.last_updated_date,
          ]
        );
  
        // Optionally, delete the restored record from the backup
        await pool.query("DELETE FROM contacts_delete WHERE mobileno = $1", [
          mobileno,
        ]);
  
        res.json({ message: "Data restored successfully" });
      } else {
        res.status(404).json({ message: "Backup data not found" });
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ error: "Server error" });
    }
  };

module.exports = {
  handleBackupAllData,
  handleRestoreAllData,
  getAllBackupData,
  getAllBackupFiles,
  handleDeleteBackupFiles,
  handleDeleteData,
  getAllDeletedData,
  restoreDeletedData,
};
