import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { orderService, paymentService, userService } from '../services/api';
import { useAuth } from './AuthContext';
import { notify } from './NotificationContext';
import { Product } from '../types';

interface CartItem extends Product {
  quantity: number;
}

interface CheckoutFormData {
  cardName: string;
  paymentMethod: 'test' | 'paypal' | 'card';
  deliveryAddress: string;
}

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: authUser, isAuthenticated } = useAuth();
  const { cartItems } = (location.state as { cartItems: CartItem[] }) || { cartItems: [] };

  const [userProfile, setUserProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [formData, setFormData] = useState<CheckoutFormData>({
    cardName: '',
    paymentMethod: 'test', // Default to test mode for development
    deliveryAddress: ''
  });

  const [processing, setProcessing] = useState(false);

  // Fetch user profile for delivery address
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (authUser?.id) {
        try {
          const response = await userService.getUserById(authUser.id);
          setUserProfile(response.data);
          // Pre-fill delivery address from profile
          if (response.data.address) {
            setFormData(prev => ({
              ...prev,
              deliveryAddress: response.data.address || ''
            }));
          }
        } catch (err) {
          console.warn('Could not fetch user profile:', err);
        }
      }
      setLoadingProfile(false);
    };

    fetchUserProfile();
  }, [authUser?.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + (Number(item.prix) * item.quantity), 0).toFixed(2);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated || !authUser?.id) {
      notify.error('Please log in to place an order.');
      navigate('/login');
      return;
    }

    setProcessing(true);

    try {
      // Use the logged-in user's ID automatically
      const userId = authUser.id;

      // Get delivery address from form (pre-filled from profile or manually entered)
      const deliveryAddress = formData.deliveryAddress ||
        userProfile?.address ||
        `${authUser.firstName} ${authUser.lastName}, Delivery Address`;

      // Prepare order data
      const orderData = {
        userId: userId,
        adresseLivraison: deliveryAddress,
        orderItems: cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity
        }))
      };

      // Create order
      const orderResponse = await orderService.createOrder(orderData);
      const order = orderResponse.data;

      notify.success('Order created successfully!');

      // Handle payment based on selected method
      if (formData.paymentMethod === 'paypal') {
        // Create PayPal payment
        try {
          const paymentData = {
            orderId: order.id,
            userId: order.userId,
            amount: parseFloat(calculateTotal()),
            currency: 'USD',
            description: `Order #${order.orderNumber}`,
            returnUrl: `${window.location.origin}/payment/success`,
            cancelUrl: `${window.location.origin}/payment/cancel`
          };

          const paymentResponse = await paymentService.createPayPalPayment(paymentData);

          // Clear cart
          localStorage.removeItem('cart');

          // Redirect to PayPal
          if (paymentResponse.data.approvalUrl) {
            notify.info('Redirecting to PayPal...');
            setTimeout(() => {
              window.location.href = paymentResponse.data.approvalUrl;
            }, 1500);
          } else {
            notify.warning('PayPal is not configured. Order saved with pending payment.');
            navigate('/profile');
          }
        } catch (paymentErr) {
          console.error('PayPal payment error:', paymentErr);
          notify.warning('PayPal unavailable. Order saved with pending payment status.');
          localStorage.removeItem('cart');
          navigate('/profile');
        }
      } else if (formData.paymentMethod === 'test') {
        // Simulated test payment (for development)
        notify.success('Test payment completed! (Simulated)');
        localStorage.removeItem('cart');
        navigate('/profile');
      } else {
        // Card payment (future implementation)
        notify.info('Card payment processing...');
        localStorage.removeItem('cart');
        navigate('/profile');
      }

    } catch (err: any) {
      console.error('Error creating order:', err);
      notify.error(err.response?.data?.message || 'Failed to process order. Please try again.');
      setProcessing(false);
    }
  };

  // Redirect to login if not authenticated
  if (!isAuthenticated && !loadingProfile) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-10 min-h-[80vh]">
        <div className="text-center py-20 bg-white rounded-3xl shadow-md">
          <svg className="w-20 h-20 text-gray-300 mx-auto mb-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Please log in to checkout</h2>
          <p className="text-gray-500 mb-8 text-lg">You need to be logged in to complete your purchase.</p>
          <button
            onClick={() => navigate('/login')}
            className="px-8 py-3.5 bg-gray-900 text-white rounded-full font-semibold hover:bg-black hover:scale-105 transition-all shadow-sm"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-10 min-h-[80vh]">
        <div className="text-center py-20 bg-white rounded-3xl shadow-md">
          <svg className="w-20 h-20 text-gray-300 mx-auto mb-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="21" r="1"/>
            <circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">No items to checkout</h2>
          <p className="text-gray-500 mb-8 text-lg">Your cart is empty. Add some products to continue.</p>
          <button
            onClick={() => navigate('/products')}
            className="px-8 py-3.5 bg-gray-900 text-white rounded-full font-semibold hover:bg-black hover:scale-105 transition-all shadow-sm"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 min-h-[80vh]">
      <h1 className="text-4xl font-bold text-gray-900 mb-10 text-center tracking-tight">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-10 items-start">
        <div className="bg-white p-10 rounded-3xl shadow-lg border border-black/5">
          <form onSubmit={handleSubmitOrder}>
            {/* User Info Section */}
            <div className="mb-10 border-b border-black/5 pb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Your Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-semibold text-gray-500">Name:</span>
                  <span className="text-lg font-medium text-gray-900">{authUser?.firstName} {authUser?.lastName}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-semibold text-gray-500">Email:</span>
                  <span className="text-lg font-medium text-gray-900">{authUser?.email}</span>
                </div>
              </div>
            </div>

            {/* Delivery Address Section */}
            <div className="mb-10 border-b border-black/5 pb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Delivery Address</h2>
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-gray-700">Address *</label>
                <textarea
                  name="deliveryAddress"
                  value={formData.deliveryAddress}
                  onChange={handleInputChange}
                  placeholder="Enter your delivery address"
                  required
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-y"
                />
                <small className="text-gray-500">Your order will be delivered to this address</small>
              </div>
            </div>

            {/* Payment Section */}
            <div className="mb-10">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Method</h2>

              <div className="flex flex-col gap-2 mb-6">
                <label className="font-semibold text-gray-700">Name on Card</label>
                <input
                  type="text"
                  name="cardName"
                  value={formData.cardName}
                  onChange={handleInputChange}
                  placeholder={`${authUser?.firstName || ''} ${authUser?.lastName || ''}`}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-semibold text-gray-700 mb-2">Select Payment Method *</label>
                <div className="grid grid-cols-1 gap-4">
                  {/* Test Payment Option (for development) */}
                  <label className={`relative flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-all ${formData.paymentMethod === 'test' ? 'border-blue-600 bg-blue-50/50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="test"
                      checked={formData.paymentMethod === 'test'}
                      onChange={handleInputChange}
                      className="absolute top-4 right-4"
                    />
                    <div className="flex items-center gap-3 mb-1">
                      <svg className="w-6 h-6 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                        <polyline points="22 4 12 14.01 9 11.01"/>
                      </svg>
                      <span className="font-bold text-gray-900">Test Payment (Demo)</span>
                    </div>
                    <small className="text-gray-500 ml-9">For testing - simulates successful payment</small>
                  </label>

                  <label className={`relative flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-all ${formData.paymentMethod === 'paypal' ? 'border-blue-600 bg-blue-50/50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="paypal"
                      checked={formData.paymentMethod === 'paypal'}
                      onChange={handleInputChange}
                      className="absolute top-4 right-4"
                    />
                    <div className="flex items-center gap-3 mb-1">
                      <svg className="w-6 h-6 text-[#003087]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                        <line x1="1" y1="10" x2="23" y2="10"/>
                      </svg>
                      <span className="font-bold text-gray-900">PayPal</span>
                    </div>
                    <small className="text-gray-500 ml-9">Requires PayPal account configuration</small>
                  </label>

                  <label className={`relative flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-all ${formData.paymentMethod === 'card' ? 'border-blue-600 bg-blue-50/50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={formData.paymentMethod === 'card'}
                      onChange={handleInputChange}
                      className="absolute top-4 right-4"
                    />
                    <div className="flex items-center gap-3 mb-1">
                      <svg className="w-6 h-6 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                        <line x1="1" y1="10" x2="23" y2="10"/>
                      </svg>
                      <span className="font-bold text-gray-900">Credit Card</span>
                    </div>
                    <small className="text-gray-500 ml-9">Coming soon</small>
                  </label>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              disabled={processing}
            >
              {processing ? 'Processing...' : `Complete Order - $${calculateTotal()}`}
            </button>
          </form>
        </div>

        <div className="bg-white/60 backdrop-blur-sm p-8 rounded-3xl border border-white/20 sticky top-24">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
          <div className="flex flex-col gap-4 mb-6 max-h-[400px] overflow-y-auto pr-2">
            {cartItems.map(item => (
              <div key={item.id} className="flex gap-4 bg-white/50 p-3 rounded-xl border border-white/20">
                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.nom} className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-xs text-gray-400">No Image</span>
                  )}
                </div>
                <div className="flex-grow">
                  <h4 className="font-semibold text-gray-900 text-sm line-clamp-2">{item.nom}</h4>
                  <p className="text-gray-500 text-xs mt-1">Qty: {item.quantity}</p>
                </div>
                <div className="font-bold text-gray-900 text-sm">
                  ${(Number(item.prix) * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-4 flex flex-col gap-3">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>${calculateTotal()}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span className="text-green-600 font-medium">Free</span>
            </div>
            <div className="flex justify-between text-gray-900 font-bold text-xl pt-2 border-t border-gray-200 mt-2">
              <span>Total</span>
              <span>${calculateTotal()}</span>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-3 text-gray-500 text-sm bg-white p-4 rounded-xl border border-gray-100">
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <p>Your payment information is secure and encrypted</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
