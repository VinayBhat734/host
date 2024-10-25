import React, { useEffect, useState } from 'react';
import {
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  Typography,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Paper,
  TablePagination,
} from '@mui/material';
import SideBar from '../Layouts/SideBar';

const HandleUsers = () => {
  const [users, setUsers] = useState([]);
  const [editingUserId, setEditingUserId] = useState(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchUsers = async () => {
    const response = await fetch('http://localhost:5700/users');
    const data = await response.json();
    setUsers(data);
  };

  const updateUser = async (e) => {
    e.preventDefault();
    const data = { username, email };

    await fetch(`http://localhost:5700/users/${editingUserId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setEditingUserId(null);
    setUsername('');
    setEmail('');
    fetchUsers();
  };

  const handleDeleteUser = (id) => {
    setUserIdToDelete(id);
    setOpenDialog(true);
  };

  const deleteUser = async (id) => {
    await fetch(`http://localhost:5700/users/${id}`, { method: 'DELETE' });
    fetchUsers();
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="flex gap-5 mb-10">
      <div>
        <SideBar />
      </div>
      <Container className="bg-gray-100 p-5 mt-10 shadow-lg" maxWidth="lg">
        <Typography variant="h4" className="text-center font-semibold mb-6">
          User Management
        </Typography>
        <TableContainer component={Paper} className="shadow-md">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="center">ID</TableCell>
                <TableCell align="center">Username</TableCell>
                <TableCell align="center">Email</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.isArray(users) && users.length > 0 ? (
                users
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((user) => (
                    <TableRow key={user.id}>
                      <TableCell align="center">{user.id}</TableCell>
                      <TableCell align="center">
                        {editingUserId === user.id ? (
                          <TextField
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                          />
                        ) : (
                          user.username
                        )}
                      </TableCell>
                      <TableCell align="center">
                        {editingUserId === user.id ? (
                          <TextField
                            type="email"
                            placeholder="leave blank to keep unchanged"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                          />
                        ) : (
                          user.email
                        )}
                      </TableCell>
                      <TableCell align="center">
                        {editingUserId === user.id ? (
                          <div>
                            <button
                              className='ml-2 bg-purple-600 text-white px-5 py-2 rounded-md hover:bg-purple-400'
                              onClick={updateUser}
                              
                            >
                              Save
                            </button>
                            <button
                              className='ml-2 bg-green-600 text-white px-5 py-2 hover:bg-green-400 rounded-md'
                              onClick={() => setEditingUserId(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div>
                            <button
                              className="mr-2 bg-blue-600 px-5 py-2 text-white rounded-md hover:bg-blue-400"
                              onClick={() => {
                                setEditingUserId(user.id);
                                setUsername(user.username);
                                setEmail(user.email);
                              }}
                              
                            >
                              Edit
                            </button>
                            <button
                              
                              className='ml-1 bg-red-600 px-5 py-2 rounded-md text-white hover:bg-red-400'
                             
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan="4" align="center">
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          <TablePagination
            rowsPerPageOptions={[10, 25]}
            component="div"
            count={users.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>

        {/* Confirmation Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this user?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)} color="primary">
              Cancel
            </Button>
            <Button
              onClick={() => {
                deleteUser(userIdToDelete);
                setOpenDialog(false);
              }}
              color="error"
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </div>
  );
};

export default HandleUsers;
