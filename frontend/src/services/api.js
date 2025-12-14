import axios from 'axios';

// Base API configuration
const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Users API
export const userService = {
  getAllUsers: () => api.get('/users'),
  getUserById: (id) => api.get(`/users/${id}`),
  createUser: (userData) => api.post('/users', userData),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`),
};

// Products API
export const productService = {
  getAllProducts: () => api.get('/products'),
  getProductById: (id) => api.get(`/products/${id}`),
  getProductsByCategory: (category) => api.get(`/products/category/${category}`),
  createProduct: (productData) => api.post('/products', productData),
  updateProduct: (id, productData) => api.put(`/products/${id}`, productData),
  updateStock: (id, quantity) => api.patch(`/products/${id}/stock`, { quantity }),
  deleteProduct: (id) => api.delete(`/products/${id}`),
};

// Orders API
export const orderService = {
  getAllOrders: () => api.get('/orders'),
  getOrderById: (id) => api.get(`/orders/${id}`),
  getOrdersByUserId: (userId) => api.get(`/orders/user/${userId}`),
  createOrder: (orderData) => api.post('/orders', orderData),
  cancelOrder: (id) => api.patch(`/orders/${id}/cancel`),
};

// Payments API
export const paymentService = {
  createPayPalPayment: (paymentData) => api.post('/payments/paypal/create', paymentData),
  executePayPalPayment: (paymentData) => api.post('/payments/paypal/execute', paymentData),
  getPaymentById: (id) => api.get(`/payments/${id}`),
};

export default api;

