import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { orderService, paymentService } from '../services/api';
import { notify } from './NotificationContext';
import './Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems } = location.state || { cartItems: [] };

  const [formData, setFormData] = useState({
    userId: '',
    cardName: '',
    paymentMethod: 'paypal'
  });

  const [processing, setProcessing] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.prix * item.quantity), 0).toFixed(2);
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setProcessing(true);

    try {
      // Get user profile info for delivery address
      const userId = parseInt(formData.userId) || 1;

      // Create a default delivery address (will be updated from user profile)
      const deliveryAddress = 'Address from user profile';

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

      // Create PayPal payment if selected
      if (formData.paymentMethod === 'paypal') {
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
          navigate('/orders');
        }
      } else {
        // Clear cart and navigate to orders
        localStorage.removeItem('cart');
        navigate('/orders');
      }

    } catch (err) {
      console.error('Error creating order:', err);
      notify.error(err.response?.data?.message || 'Failed to process order. Please try again.');
      setProcessing(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="checkout-container">
        <div className="empty-checkout">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="21" r="1"/>
            <circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          <h2>No items to checkout</h2>
          <p>Your cart is empty. Add some products to continue.</p>
          <button onClick={() => navigate('/products')}>Browse Products</button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <h1>Checkout</h1>

      <div className="checkout-content">
        <div className="checkout-form-section">
          <form onSubmit={handleSubmitOrder}>
            <div className="form-section">
              <h2>Payment Information</h2>
              <p className="form-note">
                Other details will be taken from your profile.
                Please ensure your profile information is up to date.
              </p>

              <div className="form-group">
                <label>User ID *</label>
                <input
                  type="number"
                  name="userId"
                  value={formData.userId}
                  onChange={handleInputChange}
                  placeholder="Enter your user ID"
                  required
                />
                <small>Your delivery address and contact info will be retrieved from your profile</small>
              </div>

              <div className="form-group">
                <label>Cardholder Name *</label>
                <input
                  type="text"
                  name="cardName"
                  value={formData.cardName}
                  onChange={handleInputChange}
                  placeholder="Name on card"
                  required
                />
              </div>

              <div className="form-group">
                <label>Payment Method *</label>
                <div className="payment-methods">
                  <label className={`payment-method-option ${formData.paymentMethod === 'paypal' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="paypal"
                      checked={formData.paymentMethod === 'paypal'}
                      onChange={handleInputChange}
                    />
                    <div className="payment-method-content">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                        <line x1="1" y1="10" x2="23" y2="10"/>
                      </svg>
                      <span>PayPal</span>
                    </div>
                  </label>

                  <label className={`payment-method-option ${formData.paymentMethod === 'card' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={formData.paymentMethod === 'card'}
                      onChange={handleInputChange}
                    />
                    <div className="payment-method-content">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                        <line x1="1" y1="10" x2="23" y2="10"/>
                      </svg>
                      <span>Credit Card</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="submit-order-btn"
              disabled={processing}
            >
              {processing ? 'Processing...' : 'Complete Order'}
            </button>
          </form>
        </div>

        <div className="order-summary-section">
          <h2>Order Summary</h2>
          <div className="summary-items">
            {cartItems.map(item => (
              <div key={item.id} className="summary-item">
                <div className="summary-item-image">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.nom} />
                  ) : (
                    <div className="placeholder">No Image</div>
                  )}
                </div>
                <div className="summary-item-details">
                  <h4>{item.nom}</h4>
                  <p>Qty: {item.quantity}</p>
                </div>
                <div className="summary-item-price">
                  ${(item.prix * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className="summary-totals">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>${calculateTotal()}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>${calculateTotal()}</span>
            </div>
          </div>

          <div className="payment-security-info">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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

