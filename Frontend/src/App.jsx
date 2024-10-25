import React, { useCallback, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { UserProvider } from "./components/UserContext";
import UserForm from "./components/UserForm";
import UserList from "./components/UserList";
import Layout from "./Layouts/Layout";
import AdminPage from "./pages/AdminPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import ProtectedRoute from "./ProtectedRoute";
import Logout from "./Layouts/Logout";
import CreateUser from "./components/CreateUser";
import ImportModal from "./components/ImportModal";
import LogsTable from "./components/LogsTable";
import DashBoard from "./components/DashBoard";
import CreateNewUser from "./components/CreateNewUser";
import ManageDropDown from "./components/ManageDropDown";
import { DropdownProvider } from "./DropdownContext";
import NullValuesTable from "./components/NullValuesTable";
import BackupRestore from "./components/BackupRestore";
import HandleUsers from "./components/HandleUsers";
import ForgotPassword from "./components/ForgotPassword";
import TestData from "./components/TestData";
import DeletedData from "./components/DeletedData";
import UserForgotPassword from "./components/UserForgotPassword";
import FloatingRedirect from "./Layouts/FloatingRedirect";
import LoadingOverlay from "./Layouts/LoadingOverlay";
// import { checkTokenOnLoad, setupInactivityListeners } from './utils/inactivityLogout';
import InactivityLogout from './utils/inactivityLogout';

const App = () => {
  // const navigate = useNavigate();

  // // Define the handleLogout function using useCallback to clear user data and navigate to login
  // const handleLogout = useCallback(() => {
  //   console.log("Logging out due to inactivity");
  //   localStorage.removeItem("token");
  //   localStorage.removeItem("username");
  //   localStorage.removeItem("loginType");
  //   localStorage.removeItem('expiration');
  //   sessionStorage.removeItem('alertShown');

  //   alert("You have been logged out due to inactivity.");
  //   navigate('/login'); // Redirect to login page
  // }, [navigate]);

  // useEffect(() => {
  //   // Check if the token is valid when the page loads
  //   checkTokenOnLoad(handleLogout);

  //   // Only set up inactivity listeners if the user is logged in
  //   const token = localStorage.getItem("token");

  //   if (token) {
  //     // Start listening for inactivity
  //     const cleanupInactivityListeners = setupInactivityListeners(handleLogout);

  //     // Clean up listeners when the component unmounts
  //     return () => {
  //       cleanupInactivityListeners(); // Call the cleanup function to remove listeners
  //       if (window.inactivityTimeout) {
  //         clearTimeout(window.inactivityTimeout); // Clear any ongoing inactivity timeout
  //       }
  //     };
  //   }
  // }, [handleLogout]);
  const loginType = localStorage.getItem("loginType");

  
  return (
    <UserProvider>
      <DropdownProvider>
        <Routes>
        
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/login" />} />

            <Route path="/login" element={<AdminLoginPage />} />

            {loginType === "admin" && (
              <>
                <Route
                  path="admin/logout/handle-users"
                  element={
                    <ProtectedRoute>
                      <HandleUsers />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/backup-restore"
                  element={
                    <ProtectedRoute>
                      <BackupRestore />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/backup-restore/deleted-data"
                  element={
                    <ProtectedRoute>
                      <DeletedData />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="admin/logout/new_user"
                  element={
                    <ProtectedRoute>
                      <CreateNewUser />
                    </ProtectedRoute>
                  }
                />
                {/* More admin routes */}
              </>
            )}

            <Route
              path="admin/logout"
              element={
                <ProtectedRoute>
                  <Logout />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/create"
              element={
                <ProtectedRoute>
                  <CreateUser />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/view"
              element={
                <ProtectedRoute>
                  <UserList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/import"
              element={
                <ProtectedRoute>
                  <ImportModal />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/test-data"
              element={
                <ProtectedRoute>
                  <TestData />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <DashBoard />
                </ProtectedRoute>
              }
            />

            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route
              path="/user-forgot-password"
              element={<UserForgotPassword />}
            />

            <Route
              path="/admin/dashboard/null-values"
              element={
                <ProtectedRoute>
                  <NullValuesTable />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/manage-options"
              element={
                <ProtectedRoute>
                  <ManageDropDown />
                </ProtectedRoute>
              }
            />

            <Route
              path="/users/new"
              element={
                <ProtectedRoute>
                  <UserForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users/:sl_no"
              element={
                <ProtectedRoute>
                  <UserForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/logs"
              element={
                <ProtectedRoute>
                  <LogsTable />
                </ProtectedRoute>
              }
            />

            <Route
              path="/backup"
              element={
                <ProtectedRoute>
                  <BackupRestore />
                </ProtectedRoute>
              }
            />

            <Route
              path="*"
              element={
                <ProtectedRoute>
                  <div className="text-3xl text-red-500 text-center mt-36">
                    Page not Found !
                  </div>
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
        {/* <LoadingOverlay/> */}
        <FloatingRedirect />
        <InactivityLogout />
      </DropdownProvider>
    </UserProvider>
  );
};

export default App;
