const express = require('express');
const router = express.Router();
const pool = require("../db");
const cors = require("cors");

router.use(cors());
router.use(express.json());

//get dropdown values
async function getRoutes(req,res){
    try {
        const dropdownTypes = [
          "state",
          "type",
          "designation",
          "department",
          "status",
          "whatsapp_availability",
          "under_sales_person",
          "source",
          "enquiry",
          "branch_data",
          "tags",
          
        ];
        const dropdowns = {};
    
        for (const type of dropdownTypes) {
          const { rows } = await pool.query(
            "SELECT value FROM dropdowns WHERE dropdown_type = $1",
            [type]
          );
          dropdowns[type] = rows.map((row) => row.value);
        }
    
        res.json(dropdowns);
      } catch (error) {
        console.error("Failed to fetch dropdown values:", error);
        res.status(500).json({ error: "Failed to fetch dropdown values" });
      }
}

//post dropdown values
async function postRoutes(req,res){
    const { dropdown_type, value } = req.body;
  try {
    await pool.query(
      "INSERT INTO dropdowns (dropdown_type, value) VALUES ($1, $2) ON CONFLICT (dropdown_type, value) DO NOTHING",
      [dropdown_type, value]
    );
    res.status(201).json({ message: "Value added" });
  } catch (error) {
    console.error("Failed to add new value:", error);
    res.status(500).json({ error: "Failed to add new value" });
  }
}

//delete dropdown values
async function deleteRoutes(req,res){
    const { dropdown_type, value } = req.body;
  try {
    await pool.query(
      "DELETE FROM dropdowns WHERE dropdown_type = $1 AND value = $2",
      [dropdown_type, value]
    );
    res.status(200).json({ message: "Value deleted" });
  } catch (error) {
    console.error("Failed to delete value:", error);
    res.status(500).json({ error: "Failed to delete value" });
  }
}


module.exports = {
    getRoutes,
    postRoutes,
    deleteRoutes
}