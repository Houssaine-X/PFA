import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService, orderService } from '../services/api';
import { useAuth } from './AuthContext';
import { notify } from './NotificationContext';
import { User, Order } from '../types';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user: authUser, updateUser: updateAuthUser, isAdmin, loading: authLoading } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<User | null>(null);

  useEffect(() => {
    if (authUser?.id) {
      fetchUserData();
    } else if (authUser && !authUser.id) {
      // If authUser exists but no ID, use authUser data directly
      setUser(authUser as unknown as User);
      setEditedUser(authUser as unknown as User);
      setLoading(false);
    } else if (!authLoading && !authUser) {
      // Not authenticated
      setLoading(false);
      setError('Please log in to view your profile.');
    }
  }, [authUser?.id, authLoading]);

  const fetchUserData = async () => {
    if (!authUser?.id) return;
    setLoading(true);
    setError(null);

    // 1. Fetch User Details (Independent Attempt)
    try {
      const userResponse = await userService.getUserById(authUser.id);
      setUser(userResponse.data);
      setEditedUser(userResponse.data);
    } catch (err) {
      console.error('Error fetching user data:', err);
      // Fallback to authUser if API fails
      if (authUser) {
        setUser(authUser as unknown as User);
        setEditedUser(authUser as unknown as User);
      } else {
        setError('Failed to load user data.');
      }
    }

    // 2. Fetch User Orders (Independent Attempt)
    try {
      const ordersResponse = await orderService.getOrdersByUserId(authUser.id);
      const ordersData = ordersResponse.data || [];
      setOrders(ordersData);
    } catch (orderErr) {
      console.warn('Could not fetch orders:', orderErr);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editedUser) return;
    setEditedUser({
      ...editedUser,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveProfile = async () => {
    if (!authUser?.id || !editedUser) return;
    try {
      await userService.updateUser(authUser.id, editedUser);
      setUser(editedUser);
      if (updateAuthUser) {
        updateAuthUser({
          firstName: editedUser.firstName,
          lastName: editedUser.lastName
        });
      }
      setIsEditing(false);
      notify.success('Profile updated successfully!');
    } catch (err: any) {
      notify.error('Failed to update profile: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        await orderService.cancelOrder(orderId);
        notify.success('Order cancelled successfully!');
        fetchUserData();
      } catch (err: any) {
        notify.error('Failed to cancel order: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      SHIPPED: 'bg-purple-100 text-purple-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="text-center py-20 text-gray-500 text-lg">Loading profile...</div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl text-center mb-8 border border-red-100">{error || 'Unable to load profile. Please try again.'}</div>
        <button
          onClick={fetchUserData}
          className="mx-auto block px-6 py-2.5 bg-gray-900 text-white rounded-full font-semibold hover:bg-gray-800 transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900">My Account</h1>
        {isAdmin && (
          <span className="bg-gradient-to-r from-pink-500 to-red-500 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-md">
            Administrator
          </span>
        )}
      </div>

      <div className="inline-flex gap-2 mb-10 bg-gray-100 p-1.5 rounded-2xl">
        <button
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === 'profile' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
          onClick={() => setActiveTab('profile')}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          Profile Information
        </button>
        <button
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === 'orders' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
          onClick={() => setActiveTab('orders')}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 2v4H3v16h18V6h-6V2H9z"/>
            <path d="M9 6h6"/>
          </svg>
          My Orders ({orders.length})
        </button>
      </div>

      {activeTab === 'profile' && (
        <div className="animate-fade-in">
          <div className="bg-white p-10 rounded-3xl shadow-lg border border-black/5">
            <div className="flex justify-between items-center mb-10 pb-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
              {!isEditing ? (
                <button
                  className="flex items-center gap-2 px-5 py-2.5 bg-gray-50 text-gray-700 rounded-full font-semibold hover:bg-gray-100 transition-all"
                  onClick={() => setIsEditing(true)}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-3">
                  <button
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 shadow-md transition-all"
                    onClick={handleSaveProfile}
                  >
                    Save
                  </button>
                  <button
                    className="px-6 py-2.5 bg-gray-100 text-gray-600 rounded-full font-semibold hover:bg-gray-200 transition-all"
                    onClick={() => {
                      setIsEditing(false);
                      setEditedUser(user);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {!isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-500">First Name</label>
                  <p className="text-lg font-medium text-gray-900">{user.firstName}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-500">Last Name</label>
                  <p className="text-lg font-medium text-gray-900">{user.lastName}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-500">Email</label>
                  <p className="text-lg font-medium text-gray-900">{user.email}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-500">Phone Number</label>
                  <p className="text-lg font-medium text-gray-900">{user.phoneNumber || 'Not provided'}</p>
                </div>
                <div className="flex flex-col gap-1 md:col-span-2">
                  <label className="text-sm font-semibold text-gray-500">Address</label>
                  <p className="text-lg font-medium text-gray-900">{user.address || 'Not provided'}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-500">Role</label>
                  <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold w-fit capitalize">
                    {user.role}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-500">Status</label>
                  <span className={`inline-block px-3 py-1 rounded-lg text-sm font-semibold w-fit ${user.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {user.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            ) : (
              <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="font-semibold text-gray-700">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={editedUser?.firstName || ''}
                    onChange={handleInputChange}
                    className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-semibold text-gray-700">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={editedUser?.lastName || ''}
                    onChange={handleInputChange}
                    className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-semibold text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={editedUser?.email || ''}
                    onChange={handleInputChange}
                    className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-semibold text-gray-700">Phone Number</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={editedUser?.phoneNumber || ''}
                    onChange={handleInputChange}
                    className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                </div>
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="font-semibold text-gray-700">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={editedUser?.address || ''}
                    onChange={handleInputChange}
                    className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="animate-fade-in">
          {orders.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 2v4H3v16h18V6h-6V2H9z"/>
                <path d="M9 6h6"/>
              </svg>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-500 mb-6">Start shopping to see your orders here!</p>
              <button
                onClick={() => navigate('/products')}
                className="px-6 py-2.5 bg-gray-900 text-white rounded-full font-semibold hover:bg-black transition-all shadow-sm"
              >
                Browse Products
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {orders.map(order => (
                <div key={order.id} className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-sm border border-white/20 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-6 pb-6 border-b border-gray-100">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">Order #{order.orderNumber}</h3>
                      <p className="text-sm text-gray-500">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-semibold text-gray-500">Total Amount</span>
                      <strong className="text-xl text-gray-900">${order.montantTotal?.toFixed(2) || '0.00'}</strong>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-semibold text-gray-500">Delivery Address</span>
                      <p className="text-gray-700">{order.adresseLivraison}</p>
                    </div>
                  </div>
                  {order.status === 'PENDING' && (
                    <div className="flex justify-end pt-4 border-t border-gray-100">
                      <button
                        className="px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-semibold transition-colors"
                        onClick={() => handleCancelOrder(order.id)}
                      >
                        Cancel Order
                      </button>
                    </div>
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

