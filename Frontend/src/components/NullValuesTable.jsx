import React from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { useLocation, useNavigate } from 'react-router-dom';
import SideBar from '../Layouts/SideBar';
import { Checkbox,Box,Chip } from '@mui/material';


const NullValuesTable = () => {
  const location = useLocation();
  const { filteredUsers, column } = location.state;
    const navigate = useNavigate();
  const columns = [
    
    { field: "sl_no", headerName: "SL No", width: 90, renderHeader: () => <div className="text-sm font-semibold " >Sl No</div > },
    { field: "name", headerName: "Name", width: 150, renderHeader: () => <div className="text-base font-semibold">Name</div > },
    { field: "customer_unique_code", headerName: "Customer Unique Code", width: 150, renderHeader: () => <div className="text-base font-semibold" >Customer Unique Code</div > },
    { field: "clinic_college_name", headerName: "Clinic/College Name", width: 150, renderHeader: () => <div className="text-base font-semibold">Clinic/College Name</div > },
    { field: "designation", headerName: "Designation", width: 150, renderHeader: () => <div className="text-base font-semibold">Designation</div > },
    { field: "address", headerName: "Address", width: 200, renderHeader: () => <div className="text-base font-semibold">Address</div > },
    { field: "mobileno", headerName: "Mobile No", width: 150, renderHeader: () => <div className="text-base font-semibold">Mobile No</div > },
    {
      field: "whatsapp_availability",
      headerName: "WhatsApp Availability",
      width: 150,
      renderCell: (params) => (
        <Checkbox
          checked={params.row.whatsapp_availability === true} 
          disabled 
        />
      ),
      renderHeader: () => <div className="text-base font-semibold">WhatsApp Available</div >
    },
    { field: "length", headerName: "Length", width: 100, renderHeader: () => <div className="text-base font-semibold">Length</div > },
    { field: "count", headerName: "Count", width: 150, renderHeader: () => <div className="text-base font-semibold">Count</div > },
    { field: "alternative_mobile_no", headerName: "Alt Mobile No", width: 150, renderHeader: () => <div className="text-base font-semibold">Alt Mobile No</div > },
    { field: "alternative_mobile_no2", headerName: "Alt Mobile No 2", width: 150, renderHeader: () => <div className="text-base font-semibold">Alt Mobile No 2</div > },
    { field: "alternative_mobile_no3", headerName: "Alt Mobile No 3", width: 150, renderHeader: () => <div className="text-base font-semibold">Alt Mobile No 3</div > },
    { field: "telephone", headerName: "Telephone No", width: 150, renderHeader: () => <div className="text-base font-semibold" >Telephone No</div > },
    { field: "drug_license_no", headerName: "Drug License No", width: 150, renderHeader: () => <div className="text-base font-semibold">Drug License No</div > },
    { field: "gst", headerName: "GST", width: 150, renderHeader: () => <div className="text-base font-semibold">GST</div > },
    { field: "email_id", headerName: "Email", width: 200, renderHeader: () => <div className="text-base font-semibold">Email</div > },
    { field: "website", headerName: "Website", width: 200, renderHeader: () => <div className="text-base font-semibold">Website</div > },
    { field: "city", headerName: "City", width: 150, renderHeader: () => <div className="text-base font-semibold">City</div > },
    { field: "state", headerName: "State", width: 150, renderHeader: () => <div className="text-base font-semibold">State</div > },
    { field: "country", headerName: "Country", width: 150, renderHeader: () => <div className="text-base font-semibold">Country</div > },
    { field: "district", headerName: "District", width: 150, renderHeader: () => <div className="text-base font-semibold">District</div > },
    { field: "pincode", headerName: "Pincode", width: 150, renderHeader: () => <div className="text-base font-semibold">Pincode</div > },
    { field: "type", headerName: "Type", width: 150, renderHeader: () => <div className="text-base font-semibold">Type</div > },
    { field: "source", headerName: "Source", width: 150, renderHeader: () => <div className="text-base font-semibold">Source</div > },
    { field: "status", headerName: "Status", width: 150, renderHeader: () => <div className="text-base font-semibold">Status</div > },
    {
      field: "enquiry",
      headerName: "Enquiry",
      width: 150,
      renderHeader: () => <div className="text-base font-semibold">Enquiry</div>,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {Array.isArray(params.value) ? params.value.map((tag, index) => (
            <Chip key={index} label={tag} size="small" />
          )) : <Chip label={params.value} size="small" />} {/* If it's a single value */}
        </Box>
      ),
    },
    { field: "last_purchased_date", headerName: "Last Purchased Date", width: 150, renderHeader: () => <div className="text-base font-semibold">Last Purchased Date</div > },
    { field: "branch_data", headerName: "Branch Data", width: 150, renderHeader: () => <div className="text-base font-semibold">Branch Data</div > },
    { field: "under_sales_person", headerName: "Under Sales Person", width: 150, renderHeader: () => <div className="text-base font-semibold">Under Sales Person</div > },
    { field: "create_date", headerName: "Create Date", width: 150, renderHeader: () => <div className="text-base font-semibold">Create Date</div > },
    { field: "age", headerName: "Age", width: 100, renderHeader: () => <div className="text-base font-semibold">Age</div > },
    { field: "tags", headerName: "Tags", width: 150, renderHeader: () => <div className="text-base font-semibold">Tags</div > },
    { field: "last_updated_date", headerName: "Last Updated Date", width: 150, renderHeader: () => <div className="text-base font-semibold">Last Updated Date</div > },
  ];

  return (
    <div className="flex">
      <SideBar />
      <div className='mt-3 ml-10'  style={{
            height: 680,
            width: "90%",
            marginTo: "50px 40px",
            placeContent: "center",
          }}>
        <h1 className="text-2xl font-bold mb-4">Null/Empty Values for {column.replace(/_/g,' ')}</h1>
        <div style={{ height: 700, width: '100%' }}>
          <DataGrid
            rows={filteredUsers}
            rowHeight={35} 
            columns={columns}
            slots={{ toolbar: GridToolbar }}
            pageSize={10}
            getRowId={(row) => row.sl_no}
            components={{
              Toolbar: GridToolbar,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default NullValuesTable;
