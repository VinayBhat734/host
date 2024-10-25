import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  TextField,
  Button,
  Alert,
  MenuItem,
  Select,
  Checkbox,
  InputLabel,
  FormControl,
  Chip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import SideBar from "../Layouts/SideBar";
import axios from "axios";

const CreateUserPage = () => {
  const [user, setUser] = useState({
    name: "",
    customer_unique_code: "",
    clinic_college_name: "",
    designation: "",
    department: "",
    address: "",
    mobileno: "",
    whatsapp_availability: "",
    alternative_mobile_no: "",
    alternative_mobile_no2: "",
    alternative_mobile_no3: "",
    telephone: "",
    drug_license_no: "",
    gst: "",
    email_id: "",
    website: "",
    city: "",
    state: "",
    country: "",
    district: "",
    pincode: "",
    type: "",
    source: "",
    status: "",
    enquiry: [], // Change to an array for multiple values
    last_purchased_date: "",
    branch_data: "",
    under_sales_person: "",
    create_date: "",
    age: "",
    tags: [],
    last_updated_date: "",
  });

  const [dropdowns, setDropdowns] = useState({
    designation: [],
    department: [],
    state: [],
    country: [],
    type: [],
    status: [],
    under_sales_person: [],
    tags: [],
    enquiry: [],
  });

  const [error, setError] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const response = await axios.get("http://localhost:5700/dropdown");
        setDropdowns(response.data);
      } catch (error) {
        console.error("Failed to fetch dropdown values:", error.message);
      }
    };

    fetchDropdowns();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // If the field is the enquiry dropdown, update accordingly
    if (name === "enquiry" || name === "tags") {
      const valueArray = typeof value === "string" ? value.split(",") : value;
      setUser({ ...user, [name]: valueArray });
    } else {
      setUser({ ...user, [name]: value });
    }
    setError({ ...error, [name]: "" }); // Clear error when user changes input
  };

  const handleChipDelete = (chipToDelete) => () => {
    setUser((prev) => ({
      ...prev,
      enquiry: prev.enquiry.filter((chip) => chip !== chipToDelete),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newError = {};
    // Validate required fields
    if (!user.name) {
      newError.name = "Name is required";
    } else if (!/^[A-Za-z\s\,\.]+$/.test(user.name)) {
      // Check if name contains only letters and spaces
      newError.name = "Name must contain only Characters";
    } else if (/^(.)\1{2,}$/.test(user.name)) {
      newError.name = "Name must not contain the same character throughout";
    }

    if (!user.name) newError.name = "Name is required";
    if (!user.mobileno) newError.mobileno = "Mobile number is required";
    if (!/^\d{10}$/.test(user.mobileno))
      newError.mobileno = "Mobile number must be 10 digits";
    if (/^(.)\1{2,}$/.test(user.mobileno)) {
      newError.mobileno =
        "Mobile number must not contain the same digit throughout";
    }

    // Validate alternative mobile numbers only if they are provided
    const validateMobile = (mobile, fieldName) => {
      if (mobile && !/^\d{10}$/.test(mobile)) {
        newError[fieldName] = `${fieldName.replace(
          /_/g,
          " "
        )} must be 10 digits`;
      } else if (mobile && /^(.)\1{2,}$/.test(mobile)) {
        newError[fieldName] = `${fieldName.replace(
          /_/g,
          " "
        )} must not contain the same digit throughout`;
      }
    };

    validateMobile(user.alternative_mobile_no, "alternative_mobile_no");
    validateMobile(user.alternative_mobile_no2, "alternative_mobile_no2");
    validateMobile(user.alternative_mobile_no3, "alternative_mobile_no3");

    // Validation Logic for Telephone
    if (user.telephone && !/^[\d\s\.\-\,]+$/.test(user.telephone))
      newError.telephone = "Telephone can only contain numbers, spaces, .and ,";
    if (/^(.)\1{2,}$/.test(user.telephone)) {
      newError.telephone =
        "Telephone must not contain the same digit throughout";
    }

    // Date validation
    const dateRegex = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$/;
    const currentDate = new Date();

    const validateDate = (dateStr, fieldName) => {
      if (!dateRegex.test(dateStr)) {
        newError[fieldName] = `${fieldName.replace(
          /_/g,
          " "
        )} must be in dd-mm-yyyy format`;
        return false;
      }

      const [day, month, year] = dateStr.split("-").map(Number);
      const date = new Date(year, month - 1, day);

      if (date > currentDate) {
        newError[fieldName] = `${fieldName.replace(
          /_/g,
          " "
        )} must be less than or equal to the current date`;
        return false;
      }

      return true;
    };

    if (
      user.last_purchased_date &&
      !validateDate(user.last_purchased_date, "last_purchased_date")
    ) {
    }

    if (user.create_date && !validateDate(user.create_date, "create_date")) {
    }

    if (
      user.last_updated_date &&
      !validateDate(user.last_updated_date, "last_updated_date")
    ) {
    }

    const validateField = (field, fieldName) => {
      if (field && !/^[A-Za-z\s\,\.]+$/.test(field)) {
        newError[fieldName] = `${fieldName.replace(
          /_/g,
          " "
        )} must contain only characters`;
      } else if (field && /^(.)\1{2,}$/.test(field)) {
        newError[fieldName] = `${fieldName.replace(
          /_/g,
          " "
        )} must not contain the same character throughout`;
      }
    };

    validateField(user.district, "district");
    validateField(user.country, "country");
    validateField(user.city, "city");

    if (user.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
      newError.email = "Email format is not matching";
    }

    if (Object.keys(newError).length > 0) {
      setError(newError);
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5700/contacts/check-mobileno",
        { mobileno: user.mobileno }
      );
      if (response.data.exists) {
        newError.mobileno = "Mobile number already exists";
        setError(newError);
        return;
      }

      // Proceed with user creation
      await axios.post("http://localhost:5700/contacts", user);
      alert("User created successfully");
      navigate("/admin/view");
    } catch (error) {
      console.error("Failed to create user:", error.message);
      if (error.response && error.response.data) {
        setError({
          backend: error.response.data.error || "Failed to create user",
        });
      } else {
        setError({ backend: "An unexpected error occurred" });
      }
    }
  };

  return (
    <div style={{ display: "flex" }}>
      <SideBar />
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <div className="flex">
          <p className="w-full text-3xl font-semibold">Create New User</p>
          <Grid
            className="m-2"
            container
            justifyContent="center"
            sx={{ mt: 2 }}
          >
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => navigate("/admin/manage-options")}
            >
              Manage Dropdown Options
            </Button>
          </Grid>
        </div>
        {Object.keys(error).length > 0 && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {Object.values(error).map((err, index) => (
              <div key={index}>{err}</div>
            ))}
          </Alert>
        )}
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {Object.keys(user).map((key) => (
              <Grid item xs={12} sm={6} md={3} key={key}>
                {key === "enquiry" || key === "tags" ? ( // Check if the key is enquiry
                  <FormControl fullWidth margin="normal">
                    <InputLabel>{key.toUpperCase()}</InputLabel>
                    <Select
                      multiple
                      name={key}
                      value={user[key]}
                      onChange={handleChange}
                      renderValue={(selected) => (
                        <div>
                          {selected.map((value) => (
                            <Chip
                              key={value}
                              label={value}
                              onDelete={handleChipDelete(value)}
                              sx={{ margin: "2px" }} // Add margin for spacing
                            />
                          ))}
                        </div>
                      )}
                    >
                      {dropdowns[key].map((option, index) => (
                        <MenuItem key={index} value={option}>
                          <Checkbox checked={user[key].indexOf(option) > -1} />
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : key in dropdowns ? (
                  <FormControl fullWidth margin="normal">
                    <InputLabel>
                      {key.replace(/_/g, " ").toUpperCase()}
                    </InputLabel>
                    <Select
                      name={key}
                      value={user[key]}
                      onChange={handleChange}
                    >
                      {dropdowns[key].map((option, index) => (
                        <MenuItem key={index} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : (
                  <TextField
                    label={key.replace(/_/g, " ").toUpperCase()}
                    name={key}
                    value={user[key]}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    required={key === "mobileno" || key === "name"}
                    error={!!error[key]}
                    helperText={error[key]} // Show error message
                  />
                )}
              </Grid>
            ))}
          </Grid>
          <Grid container justifyContent="center" sx={{ mt: 2 }}>
            <Button variant="contained" color="primary" type="submit">
              Submit
            </Button>
          </Grid>
        </form>
      </Container>
    </div>
  );
};

export default CreateUserPage;
