import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Stack,
  Typography,
  TextField,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import SideBar from "../Layouts/SideBar";
import { Link } from "react-router-dom";

const BackupAndRestore = () => {
  const [backupData, setBackupData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [backupLoading, setBackupLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [fileName, setFileName] = useState(""); 

  useEffect(() => {
    fetchBackupData();
  }, []);

  const fetchBackupData = async () => {
    try {
      const res = await axios.get("http://localhost:5700/api/backup/get-backups");
      setBackupData(res.data);
    } catch (error) {
      setError("Error fetching backup data");
    } finally {
      setLoading(false);
    }
  };

  const backupAllData = async () => {
    setBackupLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const response = await axios.post("http://localhost:5700/api/backup/backup-all", { fileName });
      setSuccessMessage(`Backup created: ${response.data.fileName}`);
      fetchBackupData(); // Refresh the list of backups
      setFileName(""); 
    } catch (error) {
      setError("Error backing up data");
    } finally {
      setBackupLoading(false);
    }
  };

  const restoreData = async (fileName) => {
    setRestoreLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await axios.post(`http://localhost:5700/api/backup/restore/${fileName}`);
      setSuccessMessage("Data restored successfully!");
      fetchBackupData(); 
    } catch (error) {
      setError("Error restoring data");
    } finally {
      setRestoreLoading(false);
    }
  };

  const deleteBackup = async (fileName) => {
    try {
      await axios.delete(`http://localhost:5700/api/backup/delete-backup/${fileName}`);
      setSuccessMessage("Backup file deleted successfully!");
      fetchBackupData();
    } catch (error) {
      setError("Error deleting backup file");
    }
  };

  const downloadBackup = (fileName) => {
    const link = document.createElement("a");
    link.href = `http://localhost:5700/api/backup/backups/${fileName}`;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link); 
  };

  return (
    <div className="flex w-full">
      <SideBar />
      <div className="w-full ">
        <Container sx={{ mt: 4, mb: 4 }}>
          <h2 className=" text-3xl text-center font-bold mb-5 ">Backup and Restore</h2>
          <Link to={'/admin/backup-restore/deleted-data'} className="bg-red-500 p-3 text-white rounded-lg">
            { "View Deleted Data"}
          </Link>
          <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mb: 2 }}>
            <TextField
              label="Backup File Name"
              variant="outlined"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              sx={{ width: 250 }}
            />
            <button
              className="bg-gray-500 p-3 text-white rounded-lg"
              onClick={backupAllData}
            >
              {backupLoading ? <CircularProgress size={24} /> : "Backup All Data"}
            </button>
          </Stack>

          {loading ? (
            <CircularProgress />
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : backupData.length === 0 ? (
            <Alert severity="info">No backup data available</Alert>
          ) : (
            <div style={{ height: 800, width: "100%" }}>
              <DataGrid
                rows={backupData.map((fileName) => ({ fileName }))}
                columns={[
                  { field: "fileName", headerName: "Backup File", width: 300 },
                  {
                    field: "actions",
                    headerName: "Actions",
                    width: 500,
                    renderCell: (params) => (
                      <div>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => restoreData(params.row.fileName)}
                          style={{ marginRight: '10px' }}
                        >
                          Restore
                        </Button>
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={() => downloadBackup(params.row.fileName)}
                          style={{ marginRight: '10px' }}
                        >
                          Download
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          onClick={() => deleteBackup(params.row.fileName)}
                        >
                          Delete
                        </Button>
                      </div>
                    ),
                  },
                ]}
                pageSize={10}
              
                rowsPerPageOptions={[10, 20, 50]}
                getRowId={(row) => row.fileName}
                
              />
            </div>
          )}

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
        </Container>
      </div>
    </div>
  );
};

export default BackupAndRestore;

