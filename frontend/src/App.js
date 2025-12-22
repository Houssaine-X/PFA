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
import './App.css';

function App() {
  const { NotificationContainer } = useNotification();

  return (
    <Router>
      <div className="App">
        <NotificationContainer />
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/users" element={<Users />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </main>
        <ChatBot />
      </div>
    </Router>
  );
}

export default App;
