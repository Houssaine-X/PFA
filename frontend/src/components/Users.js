import React, { useState, useEffect } from 'react';
import { userService } from '../services/api';
import './Users.css';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'CLIENT'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getAllUsers();
      setUsers(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load users. Please ensure the backend services are running.');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await userService.updateUser(editingUser.id, formData);
        alert('User updated successfully!');
      } else {
        await userService.createUser(formData);
        alert('User created successfully!');
      }
      resetForm();
      fetchUsers();
    } catch (err) {
      alert('Operation failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userService.deleteUser(userId);
        alert('User deleted successfully!');
        fetchUsers();
      } catch (err) {
        alert('Failed to delete user: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', password: '', role: 'CLIENT' });
    setEditingUser(null);
    setShowCreateForm(false);
  };

  if (loading) {
    return (
      <div className="users-container">
        <div className="loading">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="users-container">
      <div className="users-header">
        <h1>User Management</h1>
        <button className="create-btn" onClick={() => setShowCreateForm(!showCreateForm)}>
          {showCreateForm ? 'Close Form' : '+ New User'}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {showCreateForm && (
        <div className="create-form">
          <h2>{editingUser ? 'Edit User' : 'Create New User'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Enter user name"
              />
            </div>
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                placeholder="Enter email address"
              />
            </div>
            <div className="form-group">
              <label>Password:</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={!editingUser}
                placeholder={editingUser ? 'Leave blank to keep current password' : 'Enter password'}
              />
            </div>
            <div className="form-group">
              <label>Role:</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                required
              >
                <option value="CLIENT">CLIENT</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
            <div className="form-actions">
              <button type="submit" className="submit-btn">
                {editingUser ? 'Update User' : 'Create User'}
              </button>
              <button type="button" className="cancel-btn" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="users-grid">
        {users.length === 0 ? (
          <div className="no-users">No users found. Create your first user!</div>
        ) : (
          users.map(user => (
            <div key={user.id} className="user-card">
              <div className="user-avatar">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="user-info">
                <h3>{user.name}</h3>
                <p className="user-email">{user.email}</p>
                <span className={`user-role ${user.role.toLowerCase()}`}>
                  {user.role}
                </span>
              </div>
              <div className="user-actions">
                <button className="edit-btn" onClick={() => handleEdit(user)}>
                  ✏️ Edit
                </button>
                <button className="delete-btn" onClick={() => handleDelete(user.id)}>
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Users;

