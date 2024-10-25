import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { UserContext } from "./UserContext";
import {
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Checkbox,
  ListItemText,
  Chip,
} from "@mui/material";
import axios from "axios";
import SideBar from "../Layouts/SideBar";

const UserForm = () => {
  const { sl_no } = useParams();
  const navigate = useNavigate();
  const { updateUser, deleteUser } = useContext(UserContext);
  const [error, setError] = useState({});
  const [openDialog, setOpenDialog] = useState(false);

  const [user, setUser] = useState({
    name: "",
    customer_unique_code: "",
    clinic_college_name: "",
    designation: "",
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
    enquiry: [],
    tags: [],
    last_purchased_date: "",
    branch_data: "",
    under_sales_person: "",
    create_date: "",
    age: "",
  });


  
  const disabledKeys = ["last_updated_date", "sl_no"];
  const [originalUser, setOriginalUser] = useState({ ...user });

  const [dropdowns, setDropdowns] = useState({
    designation: [],
    department : [],
    whatsapp_availability: [],
    state: [],
    type: [],
    status: [],
    under_sales_person: [],
    enquiry: [],
    tags: [],
  });

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

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0'); // Month is zero-based
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  useEffect(() => {
    if (sl_no) {
      const fetchUser = async () => {
        try {
          const response = await axios.get(`http://localhost:5700/contacts/${sl_no}`);
          const fetchedUser = response.data;
  
          // Ensure enquiry and tags are arrays
          const formattedUser = {
            ...fetchedUser,
            create_date: formatDate(fetchedUser.create_date),
            last_purchased_date: formatDate(fetchedUser.last_purchased_date),
            last_updated_date: formatDate(fetchedUser.last_updated_date),
            enquiry: Array.isArray(fetchedUser.enquiry) ? fetchedUser.enquiry : [],
            tags: Array.isArray(fetchedUser.tags) ? fetchedUser.tags : [],
          };
  
          setUser(formattedUser);
          setOriginalUser(formattedUser);  // Set originalUser here
        } catch (error) {
          console.error("Error fetching user:", error.message);
        }
      };
  
      fetchUser();
    }
  }, [sl_no]);
  

  const handleChange = (e) => {
    const { name, value } = e.target;

    // For multi-select fields (enquiry and tags), ensure the value is an array
    if (name === "enquiry" || name === "tags") {
      const valueArray = typeof value === "string" ? value.split(",") : value;
      setUser((prevUser) => ({
        ...prevUser,
        [name]: valueArray,
      }));
    } else {
      setUser({ ...user, [name]: value });
    }

    // Clear errors for the field
    setError({ ...error, [name]: "" });
  };

  const handleChipDelete = (name, value) => () => {
    setUser((prevUser) => ({
      ...prevUser,
      [name]: prevUser[name].filter((chip) => chip !== value),
    }));
  };

  const deepEqual = (obj1, obj2) => {
    // Check if both are the same object
    if (obj1 === obj2) return true;
  
    // Check if both are objects
    if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || obj1 == null || obj2 == null) {
      return false;
    }
  
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
  
    if (keys1.length !== keys2.length) return false;
  
    // Compare keys and values
    for (let key of keys1) {
      if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newError = {};
  
    // Validation Logic
    if (!user.name) {
      newError.name = "Name is required";
    } else if (!/^[A-Za-z\s\,\.\.\(\]\-\[\,\)]+$/.test(user.name)) {
      newError.name = "Name must contain only characters";
    } else if (/^(.)\1{2,}$/.test(user.name)) {
      newError.name = "Name must not contain the same character throughout";
    }
  
    if (!user.mobileno) newError.mobileno = "Mobile number is required";
    if (!/^\d{10}$/.test(user.mobileno))
      newError.mobileno = "Mobile number must be 10 digits";
    if (/^(.)\1{2,}$/.test(user.mobileno)) {
      newError.mobileno =
        "Mobile number must not contain the same digit throughout";
    }
  
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


    // Date Validation
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
    ) {}
    if (user.create_date && !validateDate(user.create_date, "create_date")) {}
  
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
  
    // If there are errors, set the error state and return early
    if (Object.keys(newError).length > 0) {
      setError(newError);
      return;
    }
  
    // Check for changes using deepEqual function
  if (deepEqual(user, originalUser)) {
    alert("No changes detected. Please modify fields to update.");
    return;
  }
  
    const { last_updated_date, ...userData } = user;
  
    try {
      await updateUser(sl_no, userData);
      alert("Data updated successfully");
      navigate("/admin/view");
    } catch (error) {
      console.error("Error updating user:", error.message);
      alert("Failed to update user.");
    }
  };
  

  const handleDelete = () => {
    setOpenDialog(true);
  };

  const confirmDelete = async () => {
    await deleteUser(sl_no);
    alert("Data deleted successfully");
    setOpenDialog(false);
    navigate("/admin/view");
  };

  return (
    <div className="flex">
      <div>
        <SideBar />
      </div>
      <div className="mx-36">
        <Box sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom>
            Update User
          </Typography>
          <form onSubmit={handleSubmit}>
            {Object.keys(error).length > 0 && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {Object.values(error).map((err, index) => (
                  <div key={index}>{err}</div>
                ))}
              </Alert>
            )}
            <Grid container spacing={2}>
              {Object.keys(user).map((key) => (
                <Grid item xs={12} sm={6} md={3} key={key}>
                  <Typography variant="h6" gutterBottom>
                    {key
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (char) => char.toUpperCase())}
                  </Typography>
                  {[
                    "designation",
                    'department',
                    "whatsapp_availability",
                    "state",
                    "type",
                    "status",
                    'source',
                    "under_sales_person",
                  ].includes(key) ? (
                    <FormControl
                      fullWidth
                      variant="outlined"
                      error={!!error[key]}
                    >
                      <InputLabel id={`${key}-label`}>{key}</InputLabel>
                      <Select
                        labelId={`${key}-label`}
                        value={user[key]}
                        onChange={handleChange}
                        name={key}
                      >
                        {(dropdowns[key] || []).map((item) => (
                          <MenuItem key={item} value={item}>
                            {item}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : key === "enquiry" || key === "tags" ? (
                    // For multiple select fields (tags and enquiry)
                    <FormControl
                      fullWidth
                      variant="outlined"
                      error={!!error[key]}
                    >
                      <InputLabel id={`${key}-label`}>
                        {key
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (char) => char.toUpperCase())}
                      </InputLabel>
                      <Select
                        labelId={`${key}-label`}
                        multiple
                        value={user[key] || []} // Ensure value is an array
                        onChange={handleChange}
                        name={key}
                        renderValue={(selected) => (
                          <Box
                            sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                          >
                            {selected.map((value) => (
                              <Chip
                                key={value}
                                label={value}
                                onDelete={handleChipDelete(key, value)} // Ensure safe delete
                              />
                            ))}
                          </Box>
                        )}
                      >
                        {(dropdowns[key] || []).map((item) => (
                          <MenuItem key={item} value={item}>
                            <Checkbox checked={(Array.isArray(user[key]) ? user[key].indexOf(item) > -1 : false)} />
                            {" "}
                            {/* Ensure safe check */}
                            <ListItemText primary={item} />
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : (
                    <TextField
                      value={user[key]}
                      onChange={handleChange}
                      name={key}
                      disabled={disabledKeys.includes(key)}
                      error={!!error[key]}
                      helperText={error[key]}
                      fullWidth
                    />
                  )}
                </Grid>
              ))}
            </Grid>
            <Button type="submit" variant="contained" sx={{ mt: 2 }}>
              Update User
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleDelete}
              sx={{ mt: 2, ml: 2 }}
            >
              Delete User
            </Button>
          </form>
          <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Are you sure you want to delete this user? This action cannot be
                undone.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)} color="primary">
                Cancel
              </Button>
              <Button onClick={confirmDelete} color="secondary">
                Confirm
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </div>
    </div>
  );
};

export default UserForm;
