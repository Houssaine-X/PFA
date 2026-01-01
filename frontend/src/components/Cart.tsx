import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../services/api';
import { Product, CartItem } from '../types';
import { notify } from './NotificationContext';

interface CartProduct extends Product {
  quantity: number;
}

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      const cartIds: CartItem[] = JSON.parse(savedCart);
      loadCartProducts(cartIds);
    }
  }, []);

  const loadCartProducts = async (cartData: CartItem[]): Promise<void> => {
    setLoading(true);
    try {
      const items = await Promise.all(
        cartData.map(async (item) => {
          try {
            const response = await productService.getProductById(item.productId);
            return {
              ...response.data,
              quantity: item.quantity
            } as CartProduct;
          } catch (err) {
            console.error(`Error loading product ${item.productId}:`, err);
            return null;
          }
        })
      );
      setCartItems(items.filter((item): item is CartProduct => item !== null));
    } catch (err) {
      console.error('Error loading cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveCartToStorage = (items: CartProduct[]): void => {
    const cartData: CartItem[] = items.map(item => ({
      productId: item.id,
      quantity: item.quantity
    }));
    localStorage.setItem('cart', JSON.stringify(cartData));
  };

  const updateQuantity = (productId: string, newQuantity: number): void => {
    if (newQuantity < 1) return;

    const updatedItems = cartItems.map(item =>
      item.id === productId ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedItems);
    saveCartToStorage(updatedItems);
  };

  const removeFromCart = (productId: string): void => {
    const updatedItems = cartItems.filter(item => item.id !== productId);
    setCartItems(updatedItems);
    saveCartToStorage(updatedItems);
  };

  const clearCart = (): void => {
    setCartItems([]);
    localStorage.removeItem('cart');
  };

  const calculateTotal = (): string => {
    return cartItems.reduce((sum, item) => sum + (item.prix * item.quantity), 0).toFixed(2);
  };

  const handleCheckout = (): void => {
    if (cartItems.length === 0) {
      notify.warning('Your cart is empty!');
      return;
    }
    navigate('/checkout', { state: { cartItems } });
  };

  if (loading) {
    return <div className="max-w-[1200px] mx-auto px-6 py-10 min-h-[80vh]"><div className="text-center py-20 text-gray-500 text-lg">Loading cart...</div></div>;
  }

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-10 min-h-[80vh]">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-[2.5rem] font-bold text-gray-900 m-0 tracking-tight">Shopping Cart</h1>
        {cartItems.length > 0 && (
          <button className="px-5 py-2.5 bg-red-500/10 text-red-500 border-none rounded-full cursor-pointer text-sm font-semibold transition-all duration-200 hover:bg-red-500 hover:text-white" onClick={clearCart}>
            Clear Cart
          </button>
        )}
      </div>

      {cartItems.length === 0 ? (
        <div className="text-center py-20 px-5 bg-white rounded-[32px] shadow-md">
          <svg className="w-[100px] h-[100px] text-gray-400 opacity-20 mb-6 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="21" r="1"/>
            <circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          <h2 className="text-gray-900 mb-3 text-[1.8rem] font-bold">Your cart is empty</h2>
          <p className="text-gray-500 mb-8 text-[1.1rem]">Add some products to get started!</p>
          <button className="px-8 py-3.5 bg-gray-900 text-white rounded-full font-semibold text-base transition-all duration-300 hover:bg-gray-800 hover:-translate-y-0.5 hover:shadow-lg" onClick={() => navigate('/products')}>
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10 items-start">
          <div className="flex flex-col gap-6">
            {cartItems.map(item => (
              <div key={item.id} className="grid grid-cols-[100px_1fr_auto] gap-6 p-6 bg-white rounded-3xl shadow-sm border border-black/5 transition-all duration-300 hover:shadow-md">
                <div className="w-[100px] h-[100px] rounded-2xl overflow-hidden bg-gray-50 flex items-center justify-center">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.nom} className="w-full h-full object-contain p-2" />
                  ) : (
                    <div className="text-gray-400 opacity-50">
                      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex flex-col justify-center">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{item.nom}</h3>
                  <p className="text-sm text-gray-500 mb-2">{item.categoryName}</p>
                  <p className="text-lg font-bold text-gray-900 mb-2">${item.prix}</p>
                  {item.stockQuantity < 10 && (
                    <p className="text-xs font-semibold text-red-500 bg-red-50 px-2 py-1 rounded-lg w-fit">Only {item.stockQuantity} left in stock</p>
                  )}
                </div>
                <div className="flex flex-col items-end justify-between py-2">
                  <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-200">
                    <button
                      className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-white hover:shadow-sm rounded-md transition-all"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-semibold text-gray-900">{item.quantity}</span>
                    <button
                      className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-white hover:shadow-sm rounded-md transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:shadow-none"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.stockQuantity}
                    >
                      +
                    </button>
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    ${(item.prix * item.quantity).toFixed(2)}
                  </div>
                  <button
                    className="text-gray-400 hover:text-red-500 transition-colors p-2"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white p-8 rounded-[32px] shadow-lg border border-black/5 sticky top-24">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>
            <div className="flex justify-between mb-4 text-gray-600">
              <span>Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
              <span className="font-medium text-gray-900">${calculateTotal()}</span>
            </div>
            <div className="flex justify-between mb-6 text-gray-600 pb-6 border-b border-gray-100">
              <span>Shipping</span>
              <span className="text-sm italic">Calculated at checkout</span>
            </div>
            <div className="flex justify-between mb-8 text-xl font-bold text-gray-900">
              <span>Total</span>
              <span>${calculateTotal()}</span>
            </div>
            <button className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg mb-4 transition-all duration-300 hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-lg shadow-blue-600/20" onClick={handleCheckout}>
              Proceed to Checkout
            </button>
            <button className="w-full py-4 bg-transparent text-gray-600 rounded-2xl font-semibold text-base transition-all duration-200 hover:bg-gray-50 hover:text-gray-900" onClick={() => navigate('/products')}>
              Continue Shopping
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
