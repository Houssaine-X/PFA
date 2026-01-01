import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { notify } from './NotificationContext';

const Navigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  const isActive = (path: string): string => {
    return location.pathname === path ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900';
  };

  const handleLogout = (): void => {
    logout();
    notify.success('You have been logged out successfully');
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 h-16 flex items-center transition-all duration-300 border-b border-black/5 backdrop-blur-md bg-white/70">
      <div className="container mx-auto px-4 flex justify-between items-center w-full">
        <div className="flex-shrink-0">
          <Link to="/">
            <span className="text-xl font-bold text-gray-900 tracking-tighter">MarketPlace.</span>
          </Link>
        </div>
        
        <ul className="hidden md:flex list-none gap-8 m-0 p-0">
          <li>
            <Link to="/" className={`no-underline text-sm font-medium transition-colors duration-200 ${isActive('/')}`}>Home</Link>
          </li>
          <li>
            <Link to="/products" className={`no-underline text-sm font-medium transition-colors duration-200 ${isActive('/products')}`}>Store</Link>
          </li>
          {isAuthenticated && (
            <>
              {isAdmin && (
                <li>
                  <Link to="/users" className={`no-underline text-sm font-medium transition-colors duration-200 ${isActive('/users')}`}>Users</Link>
                </li>
              )}
            </>
          )}
        </ul>

        <div className="flex items-center gap-6">
          {isAuthenticated ? (
            <>
              <Link to="/cart" className={`text-gray-900 opacity-70 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center ${location.pathname === '/cart' ? 'opacity-100' : ''}`} title="Cart">
                <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" className="w-5 h-5">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
              </Link>
              
              <Link to="/orders" className={`text-gray-900 opacity-70 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center ${location.pathname === '/orders' ? 'opacity-100' : ''}`} title="Orders">
                <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" className="w-5 h-5">
                   <path d="M9 2v4H3v16h18V6h-6V2H9z"/>
                   <path d="M9 6h6"/>
                </svg>
              </Link>

              <div className="flex items-center gap-3">
                <Link to="/profile" className="flex items-center gap-2 no-underline hover:opacity-80 transition-opacity">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-700">
                    {user?.nom?.charAt(0) || 'U'}
                  </div>
                  <span className="text-sm font-medium text-gray-900 hidden sm:block">{user?.nom}</span>
                </Link>
                <button onClick={handleLogout} className="text-xs font-medium text-gray-500 hover:text-red-600 transition-colors ml-2">
                  Log out
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm font-medium text-gray-900 no-underline hover:opacity-70">Sign in</Link>
              <Link to="/signup" className="bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-medium hover:scale-105 transition-transform no-underline">Sign up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
