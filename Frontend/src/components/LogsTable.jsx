import React, { useEffect, useState } from "react";
import axios from "axios";
import SideBar from "../Layouts/SideBar";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";


const LogsTable = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await axios.get("http://localhost:5700/import/logs");
        setLogs(response.data);
      } catch (error) {
        console.error("Error fetching logs:", error);
      }
    };

    fetchLogs();
  }, []);

  const columns = [
    {
      field: "id",
      headerName: "Sl No",
      width: 150,
      renderHeader: () => (
        <div className="text-base font-poppins font-semibold">SL No</div>
      ),
    },
    {
      field: "username",
      headerName: "Username",
      width: 150,
      renderHeader: () => (
        <div className="text-base font-poppins font-semibold">Username</div>
      ),
    },
    {
      field: "file_name",
      headerName: "File Name",
      width: 200,
      renderHeader: () => (
        <div className="text-base font-poppins font-semibold">
          File Name
        </div>
      ),
    },
    {
      field: "inserted_count",
      headerName: "Inserted Count",
      width: 150,
      renderHeader: () => (
        <div className="text-base font-poppins font-semibold">
          Inserted Count
        </div>
      ),
    },
    {
      field: "updated_count",
      headerName: "Updated Count",
      width: 150,
      renderHeader: () => (
        <div className="text-base font-poppins font-semibold">
          Updated Count
        </div>
      ),
    },
    {
      field: "operation_type",
      headerName: "Operation Type",
      width: 200,
      renderHeader: () => (
        <div className="text-base font-poppins font-semibold">
          Operation Type
        </div>
      ),
    },{
      field: "timestamp",
      headerName: "Timestamp",
      width: 200,
      renderHeader: () => (
        <div className="text-base font-poppins font-semibold">
          Timestamp
        </div>
      ),
      renderCell: (params) => {
        const date = new Date(params.value);
        return date.toLocaleString("en-IN") || "N/A";
      },
    },
  ];

  return (
    <div className=" flex gap-14 h-screen ">
      <div>
        <SideBar />
      </div>
      <div className="ml-24 mt-10" style={{height:'85vh',width:'80%'}}>
        {" "}
        <h2 className="text-2xl font-bold mb-4">Import Logs</h2>
        <DataGrid
              rows={logs}
              columns={columns}
              rowHeight={35}
              pageSize={10}
              rowsPerPageOptions={[10]}
              getRowId={(row) => row.id}
            />
      </div>
    </div>
  );
};

export default LogsTable;
