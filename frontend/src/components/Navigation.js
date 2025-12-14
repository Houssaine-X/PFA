import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-brand">
          <Link to="/">
            <span className="brand-icon">🔍</span>
            <span className="brand-text">ProductHub</span>
          </Link>
        </div>
        <ul className="nav-menu">
          <li className={isActive('/')}>
            <Link to="/">
              <span className="nav-icon">🏠</span>
              Home
            </Link>
          </li>
          <li className={isActive('/products')}>
            <Link to="/products">
              <span className="nav-icon">📦</span>
              Products
            </Link>
          </li>
          <li className={isActive('/orders')}>
            <Link to="/orders">
              <span className="nav-icon">🛒</span>
              Orders
            </Link>
          </li>
          <li className={isActive('/users')}>
            <Link to="/users">
              <span className="nav-icon">👥</span>
              Users
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;

