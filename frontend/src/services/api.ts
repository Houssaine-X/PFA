import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { Product, EbayItem, Order, Payment, PayPalPaymentData, User, LoginCredentials, SignupData } from '../types';

// Base API configuration
const API_BASE_URL = 'http://localhost:8080/api';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log successful responses for debugging
    console.log('API Response:', response.config.url, response.status, response.data);
    return response;
  },
  (error) => {
    console.error('API Error:', error.config?.url, error.response?.status, error.response?.data);
    if (error.response?.status === 401) {
      // Token expired or invalid - only clear if we're not on auth endpoints
      const isAuthEndpoint = error.config?.url?.includes('/auth/');
      if (!isAuthEndpoint) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Redirect to login if not already there
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authService = {
  login: (credentials: LoginCredentials) => api.post('/auth/login', credentials),
  signup: (userData: SignupData) => api.post('/auth/signup', userData),
  logout: () => api.post('/auth/logout'),
  validateToken: () => api.post('/auth/validate'),
  getCurrentUser: () => api.get<User>('/auth/me'),
};

// Users API
export const userService = {
  getAllUsers: () => api.get<User[]>('/users'),
  getUserById: (id: string) => api.get<User>(`/users/${id}`),
  createUser: (userData: Partial<User>) => api.post<User>('/users', userData),
  updateUser: (id: string, userData: Partial<User>) => api.put<User>(`/users/${id}`, userData),
  deleteUser: (id: string) => api.delete(`/users/${id}`),
};

// Products API
export const productService = {
  getAllProducts: () => api.get<Product[]>('/products'),
  getProductById: (id: string) => api.get<Product>(`/products/${id}`),
  getProductsByCategory: (category: string) => api.get<Product[]>(`/products/category/${category}`),
  createProduct: (productData: Partial<Product>) => api.post<Product>('/products', productData),
  updateProduct: (id: string, productData: Partial<Product>) => api.put<Product>(`/products/${id}`, productData),
  updateStock: (id: string, quantity: number) => api.patch(`/products/${id}/stock`, { quantity }),
  deleteProduct: (id: string) => api.delete(`/products/${id}`),
};

// Orders API
export const orderService = {
  getAllOrders: () => api.get<Order[]>('/orders'),
  getOrderById: (id: string) => api.get<Order>(`/orders/${id}`),
  getOrdersByUserId: (userId: string) => api.get<Order[]>(`/orders/user/${userId}`),
  createOrder: (orderData: Partial<Order>) => api.post<Order>('/orders', orderData),
  cancelOrder: (id: string) => api.patch(`/orders/${id}/cancel`),
};

// Payments API
export const paymentService = {
  createPayPalPayment: (paymentData: PayPalPaymentData) => api.post('/payments/paypal/create', paymentData),
  executePayPalPayment: (paymentData: any) => api.post('/payments/paypal/execute', paymentData),
  getPaymentById: (id: string) => api.get<Payment>(`/payments/${id}`),
};

// eBay Products API
export const ebayService = {
  getFeaturedProducts: () => api.get<EbayItem[]>('/products/ebay/featured'),
  searchProducts: (query: string, limit: number = 10) => api.get<EbayItem[]>(`/products/ebay/search?q=${encodeURIComponent(query)}&limit=${limit}`),
  getProductsByCategory: (categoryName: string, limit: number = 10) => api.get<EbayItem[]>(`/products/ebay/category/${encodeURIComponent(categoryName)}?limit=${limit}`),
};

// Helper function to transform eBay item to internal product format
export const transformEbayItem = (ebayItem: EbayItem): Product => ({
  id: `ebay-${ebayItem.itemId}`,
  ebayItemId: ebayItem.itemId,
  nom: ebayItem.title,
  description: ebayItem.shortDescription || 'No description available',
  prix: ebayItem.price?.value ? parseFloat(ebayItem.price.value) : 0,
  currency: ebayItem.price?.currency || 'USD',
  imageUrl: ebayItem.image?.imageUrl || null,
  additionalImages: ebayItem.additionalImages?.map(img => img.imageUrl) || [],
  categoryName: ebayItem.categories?.[0]?.categoryName || 'eBay',
  stockQuantity: 999, // eBay items are assumed to be in stock
  source: 'EBAY',
  itemWebUrl: ebayItem.itemWebUrl,
  condition: ebayItem.condition,
  location: ebayItem.itemLocation?.city || ebayItem.itemLocation?.country || 'Unknown',
});

export default api;

