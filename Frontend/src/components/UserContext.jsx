import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5700/contacts');
      setUsers(response.data);
      
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const getUserById = async (sl_no) => {
    try {
      const response = await axios.get(`http://localhost:5700/contacts/${sl_no}`);
      setSelectedUser(response.data);
      return response.data; // Return the user data
    } catch (error) {
      console.error('Error fetching user:', error);
      return null; // Return null if there's an error
    }
  };

  const createUser = async (user) => {
    try {
      await axios.post('http://localhost:5700/contacts', user);
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const updateUser = async (sl_no, user) => {
    try {
      await axios.put(`http://localhost:5700/contacts/${sl_no}`, user);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const deleteUser = async (sl_no) => {
    try {
      await axios.delete(`http://localhost:5700/contacts/${sl_no}`);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  return (
    <UserContext.Provider
      value={{ users, selectedUser, setSelectedUser, fetchUsers, getUserById, createUser, updateUser, deleteUser }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;


