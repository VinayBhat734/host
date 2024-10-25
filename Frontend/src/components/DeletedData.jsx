import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { DataGrid, GridToolbarQuickFilter } from "@mui/x-data-grid";
import SideBar from "../Layouts/SideBar";

const DeletedData = () => {
  const [backupData, setBackupData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

  // Utility function to format date and time as dd-mm-yyyy hh:mm:ss IST
  const formatDateTime = (dateString) => {
    if (!dateString) return " ";

    const date = new Date(dateString);
    const offset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
    const localDate = new Date(date.getTime() + offset);

    const day = String(localDate.getDate()).padStart(2, "0");
    const month = String(localDate.getMonth() + 1).padStart(2, "0");
    const year = localDate.getFullYear();
    const hours = String(localDate.getHours()).padStart(2, "0");
    const minutes = String(localDate.getMinutes()).padStart(2, "0");
    const seconds = String(localDate.getSeconds()).padStart(2, "0");

    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
  };

  const handleSelectionModelChange = (newSelection) => {
    setSelectedIds(newSelection);
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) {
      alert("No records selected for deletion.");
      return;
    }
    setOpenConfirmDialog(true); // Open confirmation dialog
  };

  const confirmDeleteSelected = async () => {
    try {
      await Promise.all(selectedIds.map(mobileno =>
        axios.delete(`http://localhost:5700/api/backup/delete/${mobileno}`)
      ));

      setSuccessMessage("Selected records deleted successfully!");
      setBackupData((prev) =>
        prev.filter((item) => !selectedIds.includes(item.mobileno))
      );
      setSelectedIds([]);
      setOpenConfirmDialog(false); // Close confirmation dialog
    } catch (error) {
      setError("Error deleting selected data.");
      setOpenConfirmDialog(false); // Close confirmation dialog
    }
  };

  useEffect(() => {
    const fetchBackupData = async () => {
      try {
        const res = await axios.get("http://localhost:5700/api/backup/get-backup");
        if (Array.isArray(res.data) && res.data.length > 0) {
          const formattedData = res.data.map((item) => ({
            ...item,
            backup_date: formatDateTime(item.backup_date),
          }));
          setBackupData(formattedData);
        } else {
          throw new Error("Backup data is not in the expected format or is empty");
        }
      } catch (error) {
        setError("no deleted data available");
      } finally {
        setLoading(false);
      }
    };

    fetchBackupData();
  }, []);

  const restoreData = async (mobileno) => {
    try {
      await axios.post("http://localhost:5700/api/backup/restore", { mobileno });
      setSuccessMessage("Data restored successfully!");
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      setError("Error restoring data");
    }
  };

  const deleteData = async (mobileno) => {
    try {
      await axios.delete(`http://localhost:5700/api/backup/delete/${mobileno}`);
      setSuccessMessage("Data deleted successfully!");
      setBackupData((prev) => prev.filter((item) => item.mobileno !== mobileno));
    } catch (error) {
      setError("Error deleting data");
    }
  };

  function QuickSearchToolbar() {
    return (
      <Box sx={{ p: 0.5, pb: 0 }}>
        <GridToolbarQuickFilter />
      </Box>
    );
  }

  // Define columns for the DataGrid
  const columns = [
    { field: "mobileno", headerName: "Mobile No", width: 150 },
    { field: "name", headerName: "Name", width: 200 },
    { field: "operation_type", headerName: "Operation", width: 150 },
    { field: "backup_date", headerName: "Backup Date", width: 250 },
    {
      field: "actions",
      headerName: "Actions",
      width: 300,
      renderCell: (params) => (
        <div>
          <Button
            variant="contained"
            color="primary"
            onClick={() => restoreData(params.row.mobileno)}
            style={{ marginRight: "10px" }}
          >
            Restore
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => deleteData(params.row.mobileno)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex w-full">
      <SideBar />
      <div className="w-full">
        <Container sx={{ mt: 4, mb: 4 }}>
          <h2 className="text-center text-2xl mb-5">Backup and Restore</h2>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteSelected}
            style={{ marginBottom: "20px" }}
          >
            Delete Selected
          </Button>

          {/* DataGrid for displaying backup data */}
          {loading ? (
            <CircularProgress />
          ) : backupData.length === 0 ? (
            <Alert severity="info">No backup data available</Alert>
          ) : (
            <div style={{ height: 800, width: "100%" }}>
              <DataGrid
                rows={backupData}
                columns={columns}
                pageSize={10}
                rowsPerPageOptions={[10, 20, 50]}
                getRowId={(row) => row.mobileno || Math.random()}
                slots={{ toolbar: QuickSearchToolbar }}
                checkboxSelection
                onRowSelectionModelChange={handleSelectionModelChange}
                selectionModel={selectedIds}
              />
            </div>
          )}

          {/* Snackbar for success or error messages */}
          <Snackbar
            open={Boolean(successMessage)}
            autoHideDuration={2000}
            onClose={() => setSuccessMessage(null)}
          >
            <Alert onClose={() => setSuccessMessage(null)} severity="success">
              {successMessage}
            </Alert>
          </Snackbar>
          <Snackbar
            open={Boolean(error)}
            autoHideDuration={2000}
            onClose={() => setError(null)}
          >
            <Alert onClose={() => setError(null)} severity="error">
              {error}
            </Alert>
          </Snackbar>

          {/* Confirmation Dialog */}
          <Dialog
            open={openConfirmDialog}
            onClose={() => setOpenConfirmDialog(false)}
          >
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Are you sure you want to delete the selected records? This action cannot be undone.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenConfirmDialog(false)} color="primary">
                Cancel
              </Button>
              <Button onClick={confirmDeleteSelected} color="secondary">
                Confirm
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      </div>
    </div>
  );
};

export default DeletedData;
