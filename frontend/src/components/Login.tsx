import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { notify } from './NotificationContext';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, loading: authLoading } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      console.log('User is authenticated, redirecting...');
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate, location]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Submitting login form...');
      const result = await login(formData.email, formData.password);
      console.log('Login result:', result);

      if (result.success && result.user) {
        notify.success(`Welcome back, ${result.user.nom}!`);
        // Small delay to ensure state is updated
        setTimeout(() => {
          const from = (location.state as any)?.from?.pathname || '/';
          console.log('Navigating to:', from);
          navigate(from, { replace: true });
        }, 100);
      } else {
        const errorMessage = result.message || 'Login failed';
        setError(errorMessage);
        notify.error(errorMessage);
      }
    } catch (err) {
      console.error('Login submission error:', err);
      setError('An error occurred. Please try again.');
      notify.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking auth state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-10 relative overflow-hidden">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-10 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute w-[600px] h-[600px] rounded-full opacity-5 -z-0 bg-blue-600 -top-[200px] -left-[200px] animate-[float_10s_infinite_ease-in-out]"></div>
      <div className="absolute w-[600px] h-[600px] rounded-full opacity-5 -z-0 bg-[#ff375f] -bottom-[200px] -right-[200px] animate-[float_12s_infinite_ease-in-out_reverse]"></div>

      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl max-w-[440px] w-full p-12 relative z-10 border border-white/50 animate-[scaleIn_0.3s_cubic-bezier(0.25,1,0.5,1)]">
        <div className="text-center mb-10">
          <h1 className="text-gray-900 text-[2rem] font-bold mb-3 tracking-tight">Welcome Back</h1>
          <p className="text-gray-500 text-base leading-relaxed">Sign in to continue shopping</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium text-center border border-red-100">{error}</div>}

          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-gray-900 font-semibold text-sm ml-1">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              disabled={loading}
              required
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-gray-900 font-semibold text-sm ml-1">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              disabled={loading}
              required
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>

          <div className="flex justify-between items-center text-sm">
            <label className="flex items-center gap-2 cursor-pointer text-gray-600 select-none">
              <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <span>Remember me</span>
            </label>
            <Link to="/forgot-password" className="text-blue-600 font-medium hover:text-blue-700 transition-colors">
              Forgot password?
            </Link>
          </div>

          <button 
            type="submit" 
            className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-bold text-base transition-all duration-300 hover:bg-black hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 text-center pt-6 border-t border-gray-100">
          <p className="text-gray-600 text-sm">
            Don't have an account?
            <Link to="/signup" className="text-blue-600 font-bold ml-1 hover:text-blue-700 transition-colors"> Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
