import React, { useState, useContext ,useEffect} from "react";
import { UserContext } from "./UserContext";
import { useLocation, useNavigate } from "react-router-dom";
import SideBar from "../Layouts/SideBar";

const columns = [
  "state",
  "type",
  "designation",
  "status",
  "whatsapp_availability",
  "under_sales_person",
  "age",
  "city",
  "source",
  "enquiry",
  "branch_data",
  "tags",
];

function Dashboard() {
  const { users } = useContext(UserContext);
  const [selectedColumn, setSelectedColumn] = useState(null);
  const navigate = useNavigate();

  const getValueCounts = (column) => {
    const valueCounts = {};
    let nullCount = 0;

    users.forEach((user) => {
      const value = user[column];
      if (value === null || value === "") {
        nullCount += 1;
      } else {
        valueCounts[value] = (valueCounts[value] || 0) + 1;
      }
    });

    return { valueCounts, nullCount };
  };

  const location = useLocation();

  useEffect(() => {
    // Check if we are on the AdminPage
    if (location.pathname === "/admin/dashboard") {
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
    const hasReload = sessionStorage.getItem("hasReload");
    if (!hasReload) {
      sessionStorage.setItem("hasReload", "true");
      window.location.reload();
    }
  }, []);

  const getTopValues = (valueCounts) => {
    // Sort by count in descending order and get the top 5 values
    return Object.entries(valueCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
  };

  const handleColumnClick = (column) => {
    setSelectedColumn(column);
  };

  const handleCloseModal = () => {
    setSelectedColumn(null);
  };

  const handleSeeNullValues = () => {
    const filteredUsers = users.filter(
      (user) => !user[selectedColumn] || user[selectedColumn] === ""
    );
    navigate("null-values", {
      state: { filteredUsers, column: selectedColumn },
    });
  };

  const { valueCounts, nullCount } = selectedColumn
    ? getValueCounts(selectedColumn)
    : { valueCounts: {}, nullCount: 0 };
  const topValues = selectedColumn ? getTopValues(valueCounts) : [];

  return (
    <div className="flex bg-gray-200">
      <SideBar />
      <div className="ml-20  mt-12 w-full">
        <h1 className="text-3xl font-bold mb-6"> Data Overview</h1>
        <h1 className="text-xl font-bold ml-5 md-5">
          Total No of fields :{users.length}
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mr-5 mb-5">
          {columns.map((column) => {
            const columnData = getValueCounts(column);
            const topColumnValues = getTopValues(columnData.valueCounts);

            return (
              <div
                key={column}
                className="bg-white p-4 rounded-lg shadow-md cursor-pointer hover:bg-gray-100 transition-colors "
                onClick={() => handleColumnClick(column)}
              >
                <h2 className="text-lg font-semibold mb-2 capitalize">
                  {column.replace(/_/g, " ")}
                </h2>

                {/* Display top 5 values as a list */}
                <ul className="mb-2">
                  {topColumnValues.length > 0 ? (
                    topColumnValues.map(([value, count], index) => (
                      <li key={index} className="text-gray-600">
                        {value}: {count}
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-600">No data</li>
                  )}
                </ul>

                <p className="text-blue-600 font-medium underline">
                  Click to view details
                </p>
              </div>
            );
          })}
        </div>

        {selectedColumn && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg relative">
              <h2 className="text-xl font-bold mb-4">
                Data for {selectedColumn.replace(/_/g, " ")}
              </h2>
              <ul className="list-disc ml-5 mb-4 max-h-60 overflow-y-auto">
                <div className="flex flex-row justify-between">
                  <div className="text-lg py-2 m-2">Value</div>
                  <div className="text-lg py-2 m-2">Count</div>
                </div>
                {Object.entries(valueCounts).map(([value, count], index) => (
                  <li key={index} className="mb-2">
                    <div className="flex flex-row justify-between">
                      <div className="my-2">{value}</div>
                      <div className="mr-2">{count}</div>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="text-black font-semibold mb-4">
                Total Null/Empty Values: {nullCount}
              </p>
              <button
                onClick={handleCloseModal}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
              >
                &times;
              </button>
              <button
                onClick={handleSeeNullValues}
                className="bg-gray-700 p-2 text-white font-medium rounded-lg mt-5"
              >
                See Null Values in Table
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
