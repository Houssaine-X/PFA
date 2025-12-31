import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService, orderService } from '../services/api';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(1); // Default user ID
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(null);

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch user details
      const userResponse = await userService.getUserById(userId);
      setUser(userResponse.data);
      setEditedUser(userResponse.data);

      // Fetch user orders
      const ordersResponse = await userService.getUserOrders(userId);
      setOrders(ordersResponse.data);
    } catch (err) {
      setError('Failed to load user data.');
      console.error('Error fetching user data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setEditedUser({
      ...editedUser,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveProfile = async () => {
    try {
      await userService.updateUser(userId, editedUser);
      setUser(editedUser);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (err) {
      alert('Failed to update profile: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        await orderService.cancelOrder(orderId);
        alert('Order cancelled successfully!');
        fetchUserData();
      } catch (err) {
        alert('Failed to cancel order: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: '#f39c12',
      CONFIRMED: '#3498db',
      SHIPPED: '#9b59b6',
      DELIVERED: '#27ae60',
      CANCELLED: '#e74c3c'
    };
    return colors[status] || '#95a5a6';
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="profile-container">
        <div className="error">{error || 'User not found'}</div>
        <div className="user-id-selector">
          <label>Enter User ID:</label>
          <input
            type="number"
            value={userId}
            onChange={(e) => setUserId(parseInt(e.target.value) || 1)}
            min="1"
          />
          <button onClick={fetchUserData}>Load Profile</button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>My Account</h1>
        <div className="user-id-selector">
          <label>User ID:</label>
          <input
            type="number"
            value={userId}
            onChange={(e) => setUserId(parseInt(e.target.value) || 1)}
            min="1"
          />
          <button onClick={fetchUserData}>Switch User</button>
        </div>
      </div>

      <div className="profile-tabs">
        <button
          className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          Profile Information
        </button>
        <button
          className={`tab ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 2v4H3v16h18V6h-6V2H9z"/>
            <path d="M9 6h6"/>
          </svg>
          My Orders ({orders.length})
        </button>
      </div>

      {activeTab === 'profile' && (
        <div className="profile-content">
          <div className="profile-card">
            <div className="card-header">
              <h2>Personal Information</h2>
              {!isEditing ? (
                <button className="edit-btn" onClick={() => setIsEditing(true)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  Edit Profile
                </button>
              ) : (
                <div className="edit-actions">
                  <button className="save-btn" onClick={handleSaveProfile}>
                    Save
                  </button>
                  <button className="cancel-btn" onClick={() => {
                    setIsEditing(false);
                    setEditedUser(user);
                  }}>
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {!isEditing ? (
              <div className="profile-info">
                <div className="info-item">
                  <label>First Name</label>
                  <p>{user.prenom}</p>
                </div>
                <div className="info-item">
                  <label>Last Name</label>
                  <p>{user.nom}</p>
                </div>
                <div className="info-item">
                  <label>Email</label>
                  <p>{user.email}</p>
                </div>
                <div className="info-item">
                  <label>Role</label>
                  <span className={`role-badge ${user.role.toLowerCase()}`}>
                    {user.role}
                  </span>
                </div>
                <div className="info-item">
                  <label>Status</label>
                  <span className={`status-badge ${user.actif ? 'active' : 'inactive'}`}>
                    {user.actif ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            ) : (
              <form className="edit-form">
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    name="prenom"
                    value={editedUser.prenom}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    name="nom"
                    value={editedUser.nom}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={editedUser.email}
                    onChange={handleInputChange}
                  />
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="orders-content">
          {orders.length === 0 ? (
            <div className="no-orders">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 2v4H3v16h18V6h-6V2H9z"/>
                <path d="M9 6h6"/>
              </svg>
              <h3>No orders yet</h3>
              <p>Start shopping to see your orders here!</p>
              <button onClick={() => navigate('/products')}>Browse Products</button>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map(order => (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <div className="order-info">
                      <h3>Order #{order.orderNumber}</h3>
                      <p>Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span
                      className="order-status"
                      style={{ background: getStatusColor(order.status) }}
                    >
                      {order.status}
                    </span>
                  </div>
                  <div className="order-details">
                    <div className="detail-row">
                      <span>Total Amount:</span>
                      <strong>${order.montantTotal?.toFixed(2) || '0.00'}</strong>
                    </div>
                    <div className="detail-row">
                      <span>Delivery Address:</span>
                      <p>{order.adresseLivraison}</p>
                    </div>
                  </div>
                  {order.status === 'PENDING' && (
                    <button
                      className="cancel-order-btn"
                      onClick={() => handleCancelOrder(order.id)}
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;

