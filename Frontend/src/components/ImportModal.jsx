import React, { useState } from "react";
import axios from "axios";
import {
  Checkbox,
  FormControlLabel,
  FormGroup,
  Typography,
  Button,
  Grid,
  CircularProgress,
} from "@mui/material";
import { message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import SideBar from "../Layouts/SideBar";
import LoadingOverlay from "../Layouts/LoadingOverlay"; // Import the LoadingOverlay

const ImportModal = () => {
  const [file, setFile] = useState(null);
  const [selectedColumns, setSelectedColumns] = useState(["mobileno"]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [errorMessages, setErrorMessages] = useState([]); // Store error messages

  const allColumns = [
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
    "tags"
  ];

  

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleColumnChange = (column) => {
    if (column === "mobileno") return;

    setSelectedColumns((prev) => {
      if (prev.includes(column)) {
        return prev.filter((col) => col !== column);
      } else {
        return [...prev, column];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedColumns.length === allColumns.length) {
      setSelectedColumns(["mobileno"]);
    } else {
      setSelectedColumns(allColumns);
    }
  };

  const handleUpload = () => {
    if (!file) {
      message.error("Please select a file to import");
      navigate("/admin/import");
      return;
    }

    setLoading(true);
    setErrorMessages([]); // Clear previous errors

    const username = localStorage.getItem("username");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("username", username); 
    formData.append("selectedColumns", JSON.stringify(selectedColumns));

    axios
      .post("http://localhost:5700/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((response) => {
        console.log("Upload successful:", response.data);
        alert("data imported successfully")
        message.success("Data imported successfully");
        navigate("/admin/view");
      })
      .catch((error) => {
        console.log(error.response);
        const { message: errorMessage, duplicates, invalidHeaders } = error.response.data || {};

        // Collect error messages
        const errors = [];
        if (errorMessage) errors.push(errorMessage);
        if (duplicates && duplicates.length > 0) {
          errors.push(`Duplicates: ${duplicates.join(", ")}`);
        }
        if (invalidHeaders && invalidHeaders.length > 0) {
          errors.push(`Invalid headers: ${invalidHeaders.join(", ")}`);
        }
        if (error.response && error.response.data && error.response.data.error) {
          errors.push(`Error: ${error.response.data.error}`);
        }
        

        setErrorMessages(errors);
        message.error(errors.join(" | ")); // Show error messages in a single line
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleDownloadSample = () => {
    window.location.href = "sampledata.xlsx";
  };

  return (
    <div className="flex gap-5 bg-gray-200">
      <SideBar />
      <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-lg max-w-3xl mx-auto mt-5 mb-20">
        {/* {errorMessages.length > 0 && (
          <div className="mb-4 text-red-600">
            {errorMessages.map((error, index) => (
              <Typography key={index}>{error}</Typography>
            ))}
          </div>
        )} */}
        <a
          className="text-blue-600 m-2 underline"
          href="/sampledata.xlsx"
          download="sampledata.xlsx"
        >
          Download Sample File
        </a>
        <p className="text-red-500 mb-3">Note : Import is only possible for Excel(.xlsx) files</p>
        <input
          type="file"
          accept=".xlsx"
          onChange={handleFileChange}
          className="block w-full max-w-md p-2 border border-gray-300 rounded-md mb-6"
        />

        <Button
          variant="contained"
          color="primary"
          onClick={handleSelectAll}
          className="mb-4"
        >
          {selectedColumns.length === allColumns.length
            ? "Unselect All"
            : "Select All"}
        </Button>

        <FormGroup className="w-full mb-2">
          <Grid container spacing={1}>
            {allColumns.map((col) => (
              <Grid item xs={12} sm={6} md={4} key={col}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedColumns.includes(col)}
                      onChange={() => handleColumnChange(col)}
                      disabled={col === "mobileno"}
                    />
                  }
                  label={col
                    .replace(/_/g, " ")
                    .split(" ")
                    .map(
                      (word) =>
                        word.charAt(0).toUpperCase() +
                        word.slice(1).toLowerCase()
                    )
                    .join(" ")}
                />
              </Grid>
            ))}
          </Grid>
        </FormGroup>

        <Button
          variant="contained"
          color="primary"
          onClick={handleUpload}
          className="px-10 py-4 bg-gray-300 rounded-xl"
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Upload and Import"
          )}
        </Button>
      </div>

      {/* Show loading overlay when loading is true */}
      {loading && <LoadingOverlay message="Importing data, please wait..." />}
    </div>
  );
};

export default ImportModal;
