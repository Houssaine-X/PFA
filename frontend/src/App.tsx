import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import ProductDetail from './components/ProductDetail';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import Orders from './components/Orders';
import Users from './components/Users';
import Profile from './components/Profile';
import Login from './components/Login';
import Signup from './components/Signup';
import ChatBot from './components/ChatBot';
import { useNotification } from './components/NotificationContext';
import { AuthProvider } from './components/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

const App: React.FC = () => {
  const { NotificationContainer } = useNotification();

  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <NotificationContainer />
          <Navigation />
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Dashboard />} />
              <Route path="/products" element={<Products />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Protected Routes - Authenticated Users */}
              <Route path="/cart" element={
                <ProtectedRoute>
                  <Cart />
                </ProtectedRoute>
              } />
              <Route path="/checkout" element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              } />
              <Route path="/orders" element={
                <ProtectedRoute>
                  <Orders />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />

              {/* Admin Only Routes */}
              <Route path="/users" element={
                <ProtectedRoute adminOnly={true}>
                  <Users />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
          <ChatBot />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;

