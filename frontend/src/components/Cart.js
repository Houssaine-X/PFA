import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../services/api';
import { notify } from './NotificationContext';
import './Cart.css';

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      const cartIds = JSON.parse(savedCart);
      loadCartProducts(cartIds);
    }
  }, []);

  const loadCartProducts = async (cartData) => {
    setLoading(true);
    try {
      const items = await Promise.all(
        cartData.map(async (item) => {
          try {
            const response = await productService.getProductById(item.productId);
            return {
              ...response.data,
              quantity: item.quantity
            };
          } catch (err) {
            console.error(`Error loading product ${item.productId}:`, err);
            return null;
          }
        })
      );
      setCartItems(items.filter(item => item !== null));
    } catch (err) {
      console.error('Error loading cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveCartToStorage = (items) => {
    const cartData = items.map(item => ({
      productId: item.id,
      quantity: item.quantity
    }));
    localStorage.setItem('cart', JSON.stringify(cartData));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;

    const updatedItems = cartItems.map(item =>
      item.id === productId ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedItems);
    saveCartToStorage(updatedItems);
  };

  const removeFromCart = (productId) => {
    const updatedItems = cartItems.filter(item => item.id !== productId);
    setCartItems(updatedItems);
    saveCartToStorage(updatedItems);
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.prix * item.quantity), 0).toFixed(2);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      notify.warning('Your cart is empty!');
      return;
    }
    navigate('/checkout', { state: { cartItems } });
  };

  if (loading) {
    return <div className="cart-container"><div className="loading">Loading cart...</div></div>;
  }

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h1>Shopping Cart</h1>
        {cartItems.length > 0 && (
          <button className="clear-cart-btn" onClick={clearCart}>
            Clear Cart
          </button>
        )}
      </div>

      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <svg className="empty-cart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="21" r="1"/>
            <circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          <h2>Your cart is empty</h2>
          <p>Add some products to get started!</p>
          <button className="continue-shopping-btn" onClick={() => navigate('/products')}>
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="cart-content">
          <div className="cart-items">
            {cartItems.map(item => (
              <div key={item.id} className="cart-item">
                <div className="item-image">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.nom} />
                  ) : (
                    <div className="placeholder-image">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                    </div>
                  )}
                </div>
                <div className="item-details">
                  <h3>{item.nom}</h3>
                  <p className="item-category">{item.categoryName}</p>
                  <p className="item-price">${item.prix}</p>
                  {item.stockQuantity < 10 && (
                    <p className="item-stock-warning">Only {item.stockQuantity} left in stock</p>
                  )}
                </div>
                <div className="item-actions">
                  <div className="quantity-controls">
                    <button
                      className="qty-btn"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      −
                    </button>
                    <span className="quantity">{item.quantity}</span>
                    <button
                      className="qty-btn"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.stockQuantity}
                    >
                      +
                    </button>
                  </div>
                  <div className="item-subtotal">
                    ${(item.prix * item.quantity).toFixed(2)}
                  </div>
                  <button
                    className="remove-btn"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h2>Order Summary</h2>
            <div className="summary-row">
              <span>Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
              <span>${calculateTotal()}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>${calculateTotal()}</span>
            </div>
            <button className="checkout-btn" onClick={handleCheckout}>
              Proceed to Checkout
            </button>
            <button className="continue-shopping-btn" onClick={() => navigate('/products')}>
              Continue Shopping
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;

