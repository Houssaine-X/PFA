import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import api from '../services/api';
import { User, LoginCredentials, SignupData, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setError(null);
  }, []);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      console.log('InitAuth - Token exists:', !!token, 'SavedUser exists:', !!savedUser);

      if (token && savedUser) {
        try {
          // Set the token in axios headers
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          // Try to validate token with backend
          try {
            const response = await api.post('/auth/validate');
            console.log('Token validation response:', response.data);

            if (response.data && (response.data.id || response.data.email)) {
              // Token is valid, use saved user data
              const parsedUser = JSON.parse(savedUser) as User;
              setUser(parsedUser);
              console.log('User restored from localStorage:', parsedUser);
            } else {
              // Token invalid, clear storage
              console.log('Token validation failed - no valid response');
              logout();
            }
          } catch (validationErr: any) {
            console.warn('Token validation request failed:', validationErr.message);
            // If validation endpoint fails, still try to use saved user
            // (this allows offline usage or when backend is temporarily unavailable)
            if (validationErr.response?.status === 401) {
              // Token is definitely invalid
              logout();
            } else {
              // Network error or other issue - trust the saved token
              const parsedUser = JSON.parse(savedUser) as User;
              setUser(parsedUser);
              console.log('Using cached user due to validation error:', parsedUser);
            }
          }
        } catch (err) {
          console.error('Auth initialization error:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [logout]);

  const login = async (email: string, password: string): Promise<{ success: boolean; user?: User; message?: string }> => {
    try {
      setError(null);
      console.log('Attempting login for:', email);

      const response = await api.post('/auth/login', { email, password });
      console.log('Login response:', response.data);

      if (response.data && response.data.token) {
        const { token, id, email: userEmail, nom, firstName, lastName, role } = response.data;

        const userData: User = { 
          id, 
          email: userEmail, 
          nom: nom || firstName || userEmail, 
          role: role || 'USER' 
        };
        console.log('Login successful, user data:', userData);

        // Store in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));

        // Set axios header
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        setUser(userData);
        return { success: true, user: userData };
      } else {
        const message = response.data?.message || 'Login failed - no token received';
        console.error('Login failed:', message);
        setError(message);
        return { success: false, message };
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const message = err.response?.data?.message || 'Login failed. Please try again.';
      setError(message);
      return { success: false, message };
    }
  };

  const signup = async (userData: SignupData | any): Promise<{ success: boolean; user?: User; message?: string }> => {
    try {
      setError(null);
      console.log('Attempting signup for:', userData.email);

      const response = await api.post('/auth/signup', userData);
      console.log('Signup response:', response.data);

      if (response.data && response.data.token) {
        const { token, id, email, nom, firstName, lastName, role } = response.data;

        const newUser: User = { 
          id, 
          email, 
          nom: nom || firstName || email, 
          role: role || 'USER' 
        };

        // Store in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(newUser));

        // Set axios header
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        setUser(newUser);
        return { success: true, user: newUser };
      } else {
        const message = response.data?.message || 'Signup failed';
        setError(message);
        return { success: false, message };
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      const message = err.response?.data?.message || 'Signup failed. Please try again.';
      setError(message);
      return { success: false, message };
    }
  };

  const updateUser = (updatedData: Partial<User>) => {
    if (user) {
      const newUser = { ...user, ...updatedData };
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
    }
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'ADMIN';

  const value: AuthContextType = {
    user,
    token: localStorage.getItem('token'),
    login,
    signup,
    logout,
    isAuthenticated,
    isAdmin,
    loading,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

