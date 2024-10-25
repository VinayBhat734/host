import React, { useContext, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import SideBar from "../Layouts/SideBar";
import { UserContext } from "../components/UserContext";
import { MdSpaceDashboard } from "react-icons/md";
import { SiTestcafe } from "react-icons/si";

function AdminPage() {
  const { users } = useContext(UserContext);
  const location = useLocation();

  useEffect(() => {
    // Check if we are on the AdminPage
    if (location.pathname === "/admin") {
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

  return (
    <div className="flex min-h-screen bg-gray-200">
      <SideBar />

      <div className="flex-grow mt-40 p-4 lg:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 lg:gap-8">
          <Link
            to="view"
            className="flex flex-col items-center p-4 bg-white shadow-md rounded-lg hover:shadow-lg transition-shadow"
          >
            <img
              className="w-24 h-auto mb-4"
              src="./view.png"
              alt="View User Data"
            />
            <h3 className="text-base md:text-lg lg:text-xl font-bold text-center">
              View User Data
            </h3>
            <p className="text-xs md:text-sm lg:text-base text-center">
              Total number of rows: {users.length}
            </p>
          </Link>

          <Link
            to="import"
            className="flex flex-col items-center p-4 bg-white shadow-md rounded-lg hover:shadow-lg transition-shadow"
          >
            <img
              className="w-24 h-auto mb-4"
              src="./import.png"
              alt="Import/Export Data"
            />
            <h3 className="text-base md:text-lg lg:text-xl font-bold text-center">
              Import Data
            </h3>
          </Link>

          <Link
            to="create"
            className="flex flex-col items-center p-4 bg-white shadow-md rounded-lg hover:shadow-lg transition-shadow"
          >
            <img
              className="w-24 h-auto mb-4"
              src="./create.png"
              alt="Create New Data"
            />
            <h3 className="text-base md:text-lg lg:text-xl font-bold text-center">
              Create New Data
            </h3>
          </Link>

          <Link
            to="dashboard"
            className="flex flex-col items-center p-4 bg-white shadow-md rounded-lg hover:shadow-lg transition-shadow"
          >
            <MdSpaceDashboard className="w-24 h-24 mb-4" />
            <h3 className="text-base md:text-lg lg:text-xl font-bold text-center">
              Dashboard
            </h3>
          </Link>

          <Link
            to="test-data"
            className="flex flex-col items-center p-4 bg-white shadow-md rounded-lg hover:shadow-lg transition-shadow"
          >
            <SiTestcafe className="w-24 h-24 mb-4" />
            <h3 className="text-base md:text-lg lg:text-xl font-bold text-center">
              Test Data
            </h3>
          </Link>
        </div>
        <Outlet />
      </div>
    </div>
  );
}

export default AdminPage;
