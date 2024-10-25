import React, { useEffect, useContext, useState } from "react";
import { Link, useNavigate,useLocation } from "react-router-dom";
import axios from "axios";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { UserContext } from "./UserContext";
import SideBar from "../Layouts/SideBar";
import { Box, Button, Checkbox, Chip, Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";



const calculateAge = (createDate) => {
  if (!createDate) return " ";

  const now = new Date();
  const birthDate = new Date(createDate);
  let years = now.getFullYear() - birthDate.getFullYear();
  let months = now.getMonth() - birthDate.getMonth();
  let days = now.getDate() - birthDate.getDate();

  if (days < 0) {
    months--;
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth(), 0);
    days += lastMonthDate.getDate();
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  return `${years} years, ${months} months, ${days} days`;
};

// Utility function to format date as dd-mm-yyyy
const formatDate = (dateString) => {
  if (!dateString) return " ";

  const date = new Date(dateString);

  // Convert to IST (Indian Standard Time)
  const offset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
  const localDate = new Date(date.getTime() + offset);

  const day = String(localDate.getDate()).padStart(2, "0");
  const month = String(localDate.getMonth() + 1).padStart(2, "0");
  const year = localDate.getFullYear();

  return `${day}-${month}-${year}`;
};

// Header rendering utility
const renderHeader = (label) => (
  <div className="text-base font-poppins font-semibold">{label}</div>
);

const UserList = () => {
  const { users, fetchUsers } = useContext(UserContext);
  const [processedUsers, setProcessedUsers] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we are on the AdminPage
    if (location.pathname === "/admin/view") {
      const hasVisited = sessionStorage.getItem("hasVisitedAdminPage");

      // If it hasn't been visited, set the flag and reload the page
      if (!hasVisited) {
        sessionStorage.setItem("hasVisitedAdminPage", "true");
        window.location.reload();
      } else {
        // Reset the session storage for future visits
        sessionStorage.removeItem("hasVisitedAdminPage");
      }
    }
  }, [location.pathname]); // Add location.pathname as a dependency


  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await axios.get("http://localhost:5700/contacts");
        // Check if response.data is an array, if not, adjust according to the structure
        const usersData = Array.isArray(response.data)
          ? response.data
          : response.data.contacts || [];

        const mobileNumberCount = usersData.reduce((acc, user) => {
          const mobileno = user.mobileno || "";
          if (mobileno) {
            acc[mobileno] = (acc[mobileno] || 0) + 1;
          }
          return acc;
        }, {});

        const processed = usersData.map((user) => {
          ({ ...user, id: user.sl_no })
          const mobileno = user.mobileno || "";
          const length = mobileno.length;
          const count = mobileNumberCount[mobileno] || 0;
          let tagsArray = typeof user.tags === "string" ? user.tags.split(",") : user.tags;
          let enquiryArray = typeof user.enquiry === "string" ? user.enquiry.split(",") : user.enquiry;
          if (typeof user.tags === "string") {
            tagsArray = user.tags
              .replace(/{|}/g, "") 
              .replace(/"/g, "")   
              .split(",")          
              .map(tag => tag.trim()); 
          }
          if (typeof user.enquiry === "string") {
            enquiryArray = user.enquiry
              .replace(/{|}/g, "") 
              .replace(/"/g, "")   
              .split(",")          
              .map(tag => tag.trim()); 
          }
          return {
            ...user,
            id: user.sl_no, 
            length,
            count,
            age: calculateAge(user.create_date),
            last_purchased_date: formatDate(user.last_purchased_date),
            create_date: formatDate(user.create_date),
            last_updated_date: formatDate(user.last_updated_date),
            tags: tagsArray, 
            enquiry:enquiryArray,
          };
        });

        setProcessedUsers(processed);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    loadUsers();
  }, []);

  useEffect(() => {
    const hasReload = sessionStorage.getItem("hasReload");
    if (!hasReload) {
      sessionStorage.setItem("hasReload", "true");
      window.location.reload();
    }
  }, []);

  const handleDeleteClick = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleConfirmDelete = async () => {
    if (selectedIds.length === 0) {
      alert("No users selected for deletion.");
      return;
    }

    try {
      const response = await axios.delete("http://localhost:5700/contacts", {
        data: { ids: selectedIds },
      });

      if (response.status === 200) {
        setProcessedUsers((prev) =>
          prev.filter((user) => !selectedIds.includes(user.sl_no))
        );
        setSelectedIds([]);
        alert("Selected users have been deleted successfully.");
      }
    } catch (error) {
      console.error("Error deleting users:", error);
    }

    handleCloseModal();
  };

  const handleSelectionModelChange = (newSelection) => {
    setSelectedIds(newSelection);
  };





  
  const columns = [
    {
      field: "actions",
      headerName: "Actions",
      width: 50,
      renderHeader: () => (
        <div className="text-base font-poppins font-semibold">Actions</div>
      ),
      renderCell: (params) => (
        <button
          className="ml-2 w-5 h-5 "
          onClick={() => navigate(`/users/${params.row.sl_no}`)}
        >
          <img src="../eye.png" alt="View" />
        </button>
      ),
    },
    {
      field: "sl_no",
      headerName: "SL No",
      width: 90,
      renderHeader: () => (
        <div className="text-base font-poppins font-semibold">Sl No</div>
      ),
    },
    {
      field: "name",
      headerName: "Name",
      width: 150,
      renderHeader: () => (
        <div className="text-base font-poppins font-semibold">Name</div>
      ),
    },
    {
      field: "customer_unique_code",
      headerName: "Customer Unique Code",
      width: 150,
      renderHeader: () => (
        <div className="text-base font-poppins font-semibold">
          Customer Unique Code
        </div>
      ),
    },
    {
      field: "clinic_college_name",
      headerName: "Clinic/College/Company Name",
      width: 150,
      renderHeader: () => (
        <div className="text-base font-poppins font-semibold">
          Clinic/College/Company Name
        </div>
      ),
    },
    {
      field: "designation",
      headerName: "Designation",
      width: 150,
      renderHeader: () => (
        <div className="text-base font-poppins font-semibold">Designation</div>
      ),
    },
    {
      field: "department",
      headerName: "Department",
      width: 150,
      renderHeader: () => (
        <div className="text-base font-poppins font-semibold">Department</div>
      ),
    },
    {
      field: "address",
      headerName: "Address",
      width: 200,
      renderHeader: () => (
        <div className="text-base font-poppins font-semibold">Address</div>
      ),
    },
    {
      field: "mobileno",
      headerName: "Mobile No",
      width: 150,
      renderHeader: () => (
        <div className="text-base font-poppins font-semibold">Mobile No</div>
      ),
    },
    {
      field: "whatsapp_availability",
      headerName: "WhatsApp Available",
      width: 150,
      renderCell: (params) => (
        <Checkbox
          checked={params.row.whatsapp_availability === true}
          disabled
        />
      ),
      renderHeader: () => (
        <div className="text-base font-poppins font-semibold">
          WhatsApp Available
        </div>
      ),
    },
    {
      field: "length",
      headerName: "Length",
      width: 100,
      renderHeader: () => (
        <div className="text-base font-poppins font-semibold">Length</div>
      ),
    },
    {
      field: "count",
      headerName: "Count",
      width: 150,
      renderHeader: () => (
        <div className="text-base font-poppins font-semibold">Count</div>
      ),
    },
    {
      field: "alternative_mobile_no",
      headerName: "Alt Mobile No",
      width: 150,
      renderHeader: () => (
        <div className="text-base font-poppins font-semibold">
          Alt Mobile No
        </div>
      ),
    },
    {
      field: "alternative_mobile_no2",
      headerName: "Alt Mobile No 2",
      width: 150,
      renderHeader: () => (
        <div className="text-base font-poppins font-semibold">
          Alt Mobile No 2
        </div>
      ),
    },
    {
      field: "alternative_mobile_no3",
      headerName: "Alt Mobile No 3",
      width: 150,
      renderHeader: () => (
        <div className="text-base font-poppins font-semibold">
          Alt Mobile No 3
        </div>
      ),
    },
    {
      field: "telephone",
      headerName: "Telephone No",
      width: 150,
      renderHeader: () => (
        <div className="text-base font-poppins font-semibold">Telephone No</div>
      ),
    },
    {
      field: "drug_license_no",
      headerName: "Drug License No",
      width: 150,
      renderHeader: () => (
        <div className="text-base font-poppins font-semibold">
          Drug License No
        </div>
      ),
    },
    {
      field: "gst",
      headerName: "GST",
      width: 150,
      renderHeader: () => (
        <div className="text-base font-poppins font-semibold">GST</div>
      ),
    },
    {
      field: "email_id",
      headerName: "Email",
      width: 200,
      renderHeader: () => (
        <div className="text-base font-poppins font-semibold">Email</div>
      ),
    },
    {
      field: "website",
      headerName: "Website",
      width: 200,
      renderHeader: () => (
        <div className="text-base font-poppins font-semibold">Website</div>
      ),
    },
    {
      field: "city",
      headerName: "City",
      width: 150,
      renderHeader: () => (
        <div className="text-base font-poppins font-semibold">City</div>
      ),
    },
    {
      field: "state",
      headerName: "State",
      width: 150,
      renderHeader: () => (
        <div className="text-base font-poppins font-semibold">State</div>
      ),
    },
    {
      field: "country",
      headerName: "Country",
      width: 150,
      renderHeader: () => (
        <div className="text-base font-poppins font-semibold">Country</div>
      ),
    },
    {
      field: "district",
      headerName: "District",
      width: 150,
      renderHeader: () => (
        <div className="text-base font-poppins font-semibold">District</div>
      ),
    },
    {
      field: "pincode",
      headerName: "Pincode",
      width: 150,
      renderHeader: () => (
        <div className="text-base font-poppins font-semibold">Pincode</div>
      ),
    },
    {
      field: "type",
      headerName: "Type",
      width: 150,
      renderHeader: () => (
        <div className="text-base font-poppins font-semibold">Type</div>
      ),
    },
    {
      field: "source",
      headerName: "Source",
      width: 150,
      renderHeader: () => (
        <div className="text-base font-poppins font-semibold">Source</div>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 150,
      renderHeader: () => (
        <div className="text-base font-poppins font-semibold">Status</div>
      ),
    },
    {
      field: "enquiry",
      headerName: "Enquiry",
      width: 150,
      renderHeader: () => (
        <div className="text-base font-poppins font-semibold">Enquiry</div>
      ),
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          {Array.isArray(params.value) ? (
            params.value.map((tag, index) => (
              <Chip key={index} label={tag} size="small" />
            ))
          ) : (
            <Chip label={params.value} size="small" />
          )}
        </Box>
      ),
    },
    {
      field: "last_purchased_date",
      headerName: "Last Purchased Date",
      width: 150,
      renderHeader: () => (
        <div className="text-base font-poppins font-semibold">
          Last Purchased Date
        </div>
      ),
    },
    {
      field: "branch_data",
      headerName: "Branch Data",
      width: 150,
      renderHeader: () => (
        <div className="text-base font-poppins font-semibold">Branch Data</div>
      ),
    },
    {
      field: "under_sales_person",
      headerName: "Under Sales Person",
      width: 150,
      renderHeader: () => (
        <div className="text-base font-poppins font-semibold">
          Under Sales Person
        </div>
      ),
    },
    {
      field: "create_date",
      headerName: "Create Date",
      width: 150,
      renderHeader: () => (
        <div className="text-base font-poppins font-semibold">Create Date</div>
      ),
    },
    {
      field: "age",
      headerName: "Age",
      width: 100,
      renderHeader: () => (
        <div className="text-base font-poppins font-semibold">Age</div>
      ),
    },
    {
      field: "tags",
      headerName: "Tags",
      width: 150,
      renderHeader: () => (
        <div className="text-base font-poppins font-semibold">Tags</div>
      ),renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          {Array.isArray(params.value) ? (
            params.value.map((tag, index) => (
              <Chip key={index} label={tag.trim()} size="small" />
            ))
          ) : (
            <Chip label={params.value} size="small" />
          )}
        </Box>
      ),
    },
    {
      field: "last_updated_date",
      headerName: "Last Updated Date",
      width: 150,
      renderHeader: () => (
        <div className="text-base font-poppins font-semibold">
          Last Updated Date
        </div>
      ),
    },
  ];
 



  return (
    <>
      <div className="flex h-screen  mb-20">
        
        <SideBar  />

        <div className="flex-grow m-4  mb-12 " style={{ width: "80%" ,height: '86vh' }}>
          <div className="mb-5">
            <Link
              className="bg-blue-300 px-2 py-1 m-1 rounded-xl"
              to={"/admin/import"}
              variant="contained"
              color="primary"
            >
              Import Excel
            </Link>
            <button className="bg-red-500 px-2 py-1 m-1 rounded-xl text-white" onClick={handleDeleteClick}>
            Delete Selected
          </button>
          </div>
          <div className="h-full bg-gray-100 w-full">
            <DataGrid
              rows={processedUsers}
              columns={columns}
              rowHeight={35}
              slots={{ toolbar: GridToolbar }}
              pageSize={10}
              rowsPerPageOptions={[10]}
              getRowId={(row) => row.sl_no}
              slotProps={{
                toolbar: {
                  showQuickFilter: true,
                  printOptions: { disableToolbarButton: true },
                },
              }}
              initialState={{
                sorting: {
                  sortModel: [{ field: "sl_no", sort: "asc" }],
                },
              }}
              onRowSelectionModelChange={handleSelectionModelChange} // Correct event handler
              selectionModel={selectedIds}
              checkboxSelection
              disableRowSelectionOnClick
            />
          </div>
         {/* Confirmation Dialog */}
         <Dialog open={openModal} onClose={handleCloseModal}>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Are you sure you want to delete the selected users? This action cannot be undone.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseModal} color="primary">
                Cancel
              </Button>
              <Button onClick={handleConfirmDelete} color="secondary">
                Confirm
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      </div>
    </>
  );
};

export default UserList;
