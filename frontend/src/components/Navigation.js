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
            {/*<svg className="brand-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">*/}
            {/*  <circle cx="11" cy="11" r="8"/>*/}
            {/*  <path d="m21 21-4.35-4.35"/>*/}
            {/*</svg>*/}
            <span className="brand-text">MarketPlace Hub</span>
          </Link>
        </div>
        <ul className="nav-menu">
          <li className={isActive('/')}>
            <Link to="/">
              <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              Home
            </Link>
          </li>
          <li className={isActive('/products')}>
            <Link to="/products">
              <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              </svg>
              Products
            </Link>
          </li>
          <li className={isActive('/cart')}>
            <Link to="/cart">
              <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1"/>
                <circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              Cart
            </Link>
          </li>
          <li className={isActive('/orders')}>
            <Link to="/orders">
              <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 2v4H3v16h18V6h-6V2H9z"/>
                <path d="M9 6h6"/>
              </svg>
              Orders
            </Link>
          </li>
          <li className={isActive('/users')}>
            <Link to="/users">
              <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              Users
            </Link>
          </li>
        </ul>
        <div className="nav-auth">
          <Link to="/profile" className="nav-auth-link">
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width: '18px', height: '18px', marginRight: '4px'}}>
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            Profile
          </Link>
          <Link to="/login" className="nav-auth-link">Sign In</Link>
          <Link to="/signup" className="nav-auth-btn">Sign Up</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

