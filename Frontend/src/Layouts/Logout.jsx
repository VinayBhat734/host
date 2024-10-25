import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import SideBar from "./SideBar";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from "@mui/material";

function Logout() {
  const [username, setUsername] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [logintype, setLoginType] = useState("");
  const [email, setEmail] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedLoginType = localStorage.getItem("loginType");
    if (storedLoginType) {
      setLoginType(storedLoginType);
    }
  }, []);

  useEffect(() => {
    const storedUserName = localStorage.getItem("username");
    const storedEmail = localStorage.getItem("email");
    if (storedUserName) {
      setUsername(storedUserName);
    }
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Regular expression for email validation
    return emailRegex.test(email);
  };

  const handleEditClick = () => {
    setNewEmail(email);
    setNewUsername(username); // Initialize with current username
    setIsEditing(true);
  };

  const handleSave = () => {
    setOpenConfirmDialog(true); // Open confirmation dialog
  };

  const confirmSave = async () => {
    const token = localStorage.getItem("token");
    const id = localStorage.getItem("id"); // Assuming userId is stored in localStorage

    if (!token) {
      alert("No active session found.");
      return;
    }

    try {
      const endpoint = logintype === "admin" ? `http://localhost:5700/admin/edit/${id}` : `http://localhost:5700/admin/user/edit/${id}`;
      await axios.put(
        endpoint,
        { newusername: newUsername, email: newEmail },
        {
          headers: {
            "x-auth-token": token,
          },
        }
      );
      if (!validateEmail(newEmail)) {
        alert("Please enter a valid email in the format: someone@gmail.com");
        return;
      }
      setUsername(newUsername); // Update username
      setEmail(newEmail); // Update email
      alert("Profile updated successfully");
      setIsEditing(false);
      setOpenConfirmDialog(false); // Close dialog after saving
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error updating profile. Please try again.");
      setOpenConfirmDialog(false); // Close dialog on error
    }
  };

  return (
    <div className="flex flex-row min-h-screen bg-gray-100">
      <SideBar />
      <div className="w-full p-5 mt-10">
        <div className="mt-10 flex flex-col items-center">
          <h1 className="font-bold text-3xl mb-5">User Profile</h1>
          <div className="flex flex-col justify-center items-center bg-white p-10 rounded-lg shadow-lg w-full max-w-md">
            <img
              src="../user.png"
              className="w-36 rounded-full mb-5"
              alt="User"
            />
            <h2 className="font-semibold text-lg">Username: {username}</h2>

            <button
              onClick={handleEditClick}
              className="mt-5 w-full p-2 rounded-xl text-center bg-gray-700 text-white font-semibold transition hover:bg-gray-900"
            >
              Edit Profile
            </button>

            {logintype === "admin" && (
              <div className="m-4 mt-5 flex gap-5">
                <Link
                  to={"new_user"}
                  className="flex-3 bg-blue-500 p-3 rounded-lg text-center text-white font-semibold shadow-lg hover:bg-blue-600 transition"
                >
                  Create New Users
                </Link>
                <Link
                  to={"handle-users"}
                  className="flex-1 bg-blue-500 p-3 rounded-lg text-center text-white font-semibold shadow-lg hover:bg-blue-600 transition"
                >
                  Handle Users
                </Link>
              </div>
            )}
          </div>

          {isEditing && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white p-5 rounded-lg shadow-lg">
                <h2 className="font-semibold text-lg mb-3">
                  Edit {logintype === "admin" ? "Admin" : "User"} Details
                </h2>

                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="border border-gray-300 p-2 rounded mb-3 w-full"
                  placeholder="Enter new email"
                />
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="border border-gray-300 p-2 rounded mb-3 w-full"
                  placeholder="Enter new username"
                />
                <button
                  onClick={handleSave}
                  className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-500 text-white p-2 rounded ml-2 hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Confirmation Dialog */}
          <Dialog
            open={openConfirmDialog}
            onClose={() => setOpenConfirmDialog(false)}
          >
            <DialogTitle>Confirm Changes</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Are you sure you want to save the changes? This action cannot be undone.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenConfirmDialog(false)} color="primary">
                Cancel
              </Button>
              <Button onClick={confirmSave} color="secondary">
                Confirm
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      </div>
    </div>
  );
}

export default Logout;
