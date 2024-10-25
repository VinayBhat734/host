const express = require("express");
const pool = require("../db.js");
const bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.json());
app.use(express.json());

async function handleCreateUsers(req, res) {
  const {
    name,
    customer_unique_code,
    clinic_college_name,
    designation,
    department,
    address,
    mobileno,
    whatsapp_availability,
    alternative_mobile_no,
    alternative_mobile_no2,
    alternative_mobile_no3,
    telephone,
    drug_license_no,
    gst,
    email_id,
    website,
    city,
    state,
    country,
    district,
    pincode,
    type,
    source,
    status,
    enquiry,
    last_purchased_date,
    branch_data,
    under_sales_person,
    create_date,
    age,
    tags,
    last_updated_date,
  } = req.body;

  // Input validation
  if (!name || !mobileno) {
    return res
      .status(400)
      .json({ error: "Name and Mobile Number are required" });
  }

  // Function to convert empty strings to null
  const sanitizeInput = (input) => (input === "" ? null : input);

  try {
    // SQL Insert Query
    const insertQuery = `
      INSERT INTO contacts (
        name, customer_unique_code, clinic_college_name, designation, department, address, mobileno,whatsapp_availability, alternative_mobile_no, alternative_mobile_no2, alternative_mobile_no3, telephone, 
        drug_license_no, gst, email_id, website, city, state, country, district, pincode, 
        type, source, status, enquiry, last_purchased_date, branch_data, under_sales_person, 
        create_date, age, tags,last_updated_date
      ) 
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, 
        $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32
      ) RETURNING *`;

    const result = await pool.query(insertQuery, [
      sanitizeInput(name),
      sanitizeInput(customer_unique_code),
      sanitizeInput(clinic_college_name),
      sanitizeInput(designation),
      sanitizeInput(department),
      sanitizeInput(address),
      sanitizeInput(mobileno),
      sanitizeInput(whatsapp_availability),
      sanitizeInput(alternative_mobile_no),
      sanitizeInput(alternative_mobile_no2),
      sanitizeInput(alternative_mobile_no3),
      sanitizeInput(telephone),
      sanitizeInput(drug_license_no),
      sanitizeInput(gst),
      sanitizeInput(email_id),
      sanitizeInput(website),
      sanitizeInput(city),
      sanitizeInput(state),
      sanitizeInput(country),
      sanitizeInput(district),
      sanitizeInput(pincode),
      sanitizeInput(type),
      sanitizeInput(source),
      sanitizeInput(status),
      sanitizeInput(enquiry),
      sanitizeInput(last_purchased_date),
      sanitizeInput(branch_data),
      sanitizeInput(under_sales_person),
      sanitizeInput(create_date),
      sanitizeInput(age),
      sanitizeInput(tags),
      sanitizeInput(last_updated_date),
    ]);

    // Return the created user
    res.status(201).json(result.rows[0]);
  } catch (err) {

    const errorResponse = {
      message: "An error occurred while creating user",
      error: err.message || "Unknown error",
    };

    console.error("Error creating user:", err.message || err);
    res.status(500).json(errorResponse);
  }
}

async function handleGetAllUsers(req, res) {
  try {
    const getUsers = await pool.query("SELECT * FROM contacts ");
    if (getUsers.rows.length === 0) {
      return res.status(404).json({ error: "no users found " });
    }
    return res.status(200).json(getUsers.rows);
  } catch (error) {
    console.log("somer error occured", error);
    res.status(500).json({ message: "some error occured" });
  }
}


async function handleGetSingleUsers(req, res) {
  const { sl_no } = req.params;
  const id = parseInt(sl_no, 10); // Convert sl_no to an integer

  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }
  
  try {
    const result = await pool.query("SELECT * FROM contacts WHERE sl_no = $1", [
      id,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function handleUpdateUsers(req, res) {
  const { sl_no } = req.params;
  const id = parseInt(sl_no, 10); // Convert sl_no to an integer
  const {
    name,
    customer_unique_code,
    clinic_college_name,
    designation,
    department,
    address,
    mobileno,
    whatsapp_availability,
    alternative_mobile_no,
    alternative_mobile_no2,
    alternative_mobile_no3,
    telephone,
    drug_license_no,
    gst,
    email_id,
    website,
    city,
    state,
    country,
    district,
    pincode,
    type,
    source,
    status,
    enquiry,
    last_purchased_date,
    branch_data,
    under_sales_person,
    create_date,
    age,
    tags,
    last_updated_date
  } = req.body;

  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  let updatedLastUpdatedDate = new Date().toISOString(); 

  try {
    // Proceed with the update
    const updateQuery = `
      UPDATE contacts
      SET name = $1,
          customer_unique_code = $2,
          clinic_college_name = $3,
          designation = $4,
          department = $5,
          address = $6,
          mobileno = $7,
          whatsapp_availability = $8,
          alternative_mobile_no = $9,
          alternative_mobile_no2 = $10,
          alternative_mobile_no3 = $11,
          telephone = $12,
          drug_license_no = $13,
          gst = $14,
          email_id = $15,
          website = $16,
          city = $17,
          state = $18,
          country = $19,
          district = $20,
          pincode = $21,
          type = $22,
          source = $23,
          status = $24,
          enquiry = $25,
          last_purchased_date = $26,
          branch_data = $27,
          under_sales_person = $28,
          create_date = $29,
          age = $30,
          tags = $31,
          last_updated_date = $32
          
      WHERE sl_no = $33
      RETURNING *;
    `;

    const updateResult = await pool.query(updateQuery, [
      name,
      customer_unique_code,
      clinic_college_name,
      designation,
      department,
      address,
      mobileno,
      whatsapp_availability,
      alternative_mobile_no,
      alternative_mobile_no2,
      alternative_mobile_no3,
      telephone,
      drug_license_no,
      gst,
      email_id,
      website,
      city,
      state,
      country,
      district,
      pincode,
      type,
      source,
      status,
      enquiry,
      last_purchased_date === undefined || last_purchased_date === "" ? null : last_purchased_date,
      branch_data,
      under_sales_person,
      create_date === undefined || create_date === "" ? null : create_date, 
      age,
      tags,
      updatedLastUpdatedDate, // Use the updated variable here
      id,
    ]);

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found for update" });
    }

    // Return the updated user
    return res.status(200).json({
      message: "User updated successfully",
      user: updateResult.rows[0],
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function handleDeleteSelectedUsers(req, res) {
  const { ids } = req.body; // Expecting an array of sl_no IDs to delete

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: 'Invalid request: IDs must be an array.' });
  }

  const backup_date = new Date().toISOString();
  const operation_type = "delete"; // Define operation type as 'delete'

  try {
    // Backup the data for each user before deletion
    for (const id of ids) {
      // Backup query for each individual ID
      const backupQuery = `
        INSERT INTO contacts_delete (
          sl_no, name, customer_unique_code, clinic_college_name, designation, department, address, mobileno,
          whatsapp_availability, alternative_mobile_no, alternative_mobile_no2, alternative_mobile_no3,
          telephone, drug_license_no, gst, email_id, website, city, state, country, district,
          pincode, type, source, status, enquiry, last_purchased_date, branch_data,
          under_sales_person, create_date, age, tags,last_updated_date, 
          backup_date, operation_type
        ) 
        SELECT sl_no, name, customer_unique_code, clinic_college_name, designation, department, address, mobileno,
               whatsapp_availability, alternative_mobile_no, alternative_mobile_no2, alternative_mobile_no3,
               telephone, drug_license_no, gst, email_id, website, city, state, country, district,
               pincode, type, source, status, enquiry, last_purchased_date, branch_data,
               under_sales_person, create_date, age, tags, last_updated_date, 
               $1, $2
        FROM contacts
        WHERE sl_no = $3;
      `;

      // Execute backup for the current ID
      const backupResult = await pool.query(backupQuery, [backup_date, operation_type, id]);

      if (backupResult.rowCount === 0) {
        return res.status(404).json({ error: `User not found for backup with sl_no ${id}` });
      }
    }

    // Proceed with the delete operation using "WHERE IN"
    const deleteQuery = 'DELETE FROM contacts WHERE sl_no = ANY($1)';
    const deleteResult = await pool.query(deleteQuery, [ids]);

    // Check if any rows were affected
    if (deleteResult.rowCount === 0) {
      return res.status(404).json({ error: "No users found for deletion" });
    }

    return res.status(200).json({ message: 'Users deleted and backed up successfully' });
  } catch (error) {
    console.error('Error deleting users:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}



async function handleDeleteUsers(req, res) {
  const { sl_no } = req.params;
  const id = parseInt(sl_no, 10);

  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  const backup_date = new Date().toISOString();
  const operation_type = "delete"; // Define operation type as 'delete'

  try {
    // Backup the current data before delete
    const backupQuery = `
      INSERT INTO contacts_delete (
        sl_no, name, customer_unique_code, clinic_college_name, designation, department,address, mobileno,
        whatsapp_availability, alternative_mobile_no, alternative_mobile_no2, alternative_mobile_no3,
        telephone, drug_license_no, gst, email_id, website, city, state, country, district,
        pincode, type, source, status, enquiry, last_purchased_date, branch_data,
        under_sales_person, create_date, age, tags,last_updated_date, 
        backup_date, operation_type
      )
      SELECT sl_no, name, customer_unique_code, clinic_college_name, designation,department, address, mobileno,
             whatsapp_availability, alternative_mobile_no, alternative_mobile_no2, alternative_mobile_no3,
             telephone, drug_license_no, gst, email_id, website, city, state, country, district,
             pincode, type, source, status, enquiry, last_purchased_date, branch_data,
             under_sales_person, create_date, age, tags, last_updated_date, 
             $1, $2
      FROM contacts
      WHERE sl_no = $3
      RETURNING *;
    `;

    // Backup the data before deletion
    const backupResult = await pool.query(backupQuery, [
      backup_date,
      operation_type,
      id,
    ]);

    if (backupResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found for backup" });
    }

    // Proceed with the delete operation
    const deleteQuery = `
      DELETE FROM contacts
      WHERE sl_no = $1
      RETURNING *;
    `;

    const deleteResult = await pool.query(deleteQuery, [id]);

    if (deleteResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found for deletion" });
    }

    return res
      .status(200)
      .json({ message: "User deleted and backed up successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = {
  handleCreateUsers,
  handleGetAllUsers,
  handleGetSingleUsers,
  handleUpdateUsers,
  handleDeleteUsers,
  handleDeleteSelectedUsers,
};
