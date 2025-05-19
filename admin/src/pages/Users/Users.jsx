import React, { useEffect, useState } from 'react';
import './Users.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaTrash, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const Users = () => {
  const url = "http://localhost:4000";
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        url + '/api/admin/users',
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        setUsers(response.data.users);
      } else {
        toast.error("Error fetching users: " + (response.data.message || "Unknown error"));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching users");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `${url}/api/admin/users/${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      
      if (response.data.success) {
        toast.success('User deleted successfully');
        fetchUsers(); // Refresh the list
      } else {
        toast.error(response.data.message || 'Failed to delete user');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error deleting user');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className='users add'>
      <h3>User Management</h3>
      {loading ? (
        <div className="loading">Loading users...</div>
      ) : users.length === 0 ? (
        <div className="no-users">No users found</div>
      ) : (
        <div className="users-list">
          <div className="list-table-format title">
            <b>Name</b>
            <b>Email</b>
            <b>Status</b>
            <b>Action</b>
          </div>
          {users.map((user) => (
            <div key={user._id} className="list-table-format">
              <p>{user.name}</p>
              <p>{user.email}</p>
              <p className={user.isVerified ? 'verified' : 'unverified'}>
                {user.isVerified ? (
                  <FaCheckCircle className="status-icon verified" />
                ) : (
                  <FaTimesCircle className="status-icon unverified" />
                )}
                {user.isVerified ? 'Verified' : 'Unverified'}
              </p>
              <p onClick={() => handleDeleteUser(user._id)} className='cursor'>
                <FaTrash className="delete-icon" />
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Users; 