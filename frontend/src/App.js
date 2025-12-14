import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import Orders from './components/Orders';
import Users from './components/Users';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/users" element={<Users />} />
          </Routes>
        </main>
        <footer className="app-footer">
          <p>E-Commerce Microservices Platform © 2025 | Built with Spring Boot & React</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
