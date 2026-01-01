import React, { useState, useEffect } from 'react';
import { orderService, productService } from '../services/api';
import { useAuth } from './AuthContext';
import { Product, Order } from '../types';

interface NewOrderState {
  adresseLivraison: string;
  orderItems: { productId: string; quantity: number }[];
}

const Orders: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [newOrder, setNewOrder] = useState<NewOrderState>({
    adresseLivraison: '',
    orderItems: [{
      productId: '',
      quantity: 1
    }]
  });

  useEffect(() => {
    if (user) {
        fetchOrders();
    }
    fetchProducts();
  }, [user]);

  const fetchOrders = async () => {
    try {
      if (!user || (!user.id && !(user as any).userId)) {
        return;
      }
      const userIdToUse = user.id || (user as any).userId;

      setLoading(true);
      const response = await orderService.getOrdersByUserId(userIdToUse);
      setOrders(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load orders. Please ensure the backend services are running.');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await productService.getAllProducts();
      if (Array.isArray(response.data)) {
         setProducts(response.data);
      } else {
         setProducts([]);
      }
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. ' + (err.message || 'Unknown error'));
    }
  };

  const handleAddOrderItem = () => {
    setNewOrder({
      ...newOrder,
      orderItems: [...newOrder.orderItems, { productId: '', quantity: 1 }]
    });
  };

  const handleRemoveOrderItem = (index: number) => {
    const items = newOrder.orderItems.filter((_, i) => i !== index);
    setNewOrder({ ...newOrder, orderItems: items });
  };

  const handleOrderItemChange = (index: number, field: 'productId' | 'quantity', value: string | number) => {
    const items = [...newOrder.orderItems];
    (items[index] as any)[field] = value;
    setNewOrder({ ...newOrder, orderItems: items });
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!user || (!user.id && !(user as any).userId)) {
        alert('You must be logged in to create an order. (User ID missing)');
        return;
      }

      const userIdToUse = user.id || (user as any).userId;

      const orderData = {
        userId: userIdToUse,
        adresseLivraison: newOrder.adresseLivraison,
        orderItems: newOrder.orderItems.map(item => ({
          productId: item.productId,
          quantity: Number(item.quantity)
        }))
      };

      await orderService.createOrder(orderData as any);
      alert('Order created successfully!');
      setShowCreateForm(false);
      setNewOrder({
        adresseLivraison: '',
        orderItems: [{ productId: '', quantity: 1 }]
      });
      fetchOrders();
    } catch (err: any) {
      alert('Failed to create order: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        await orderService.cancelOrder(orderId);
        alert('Order cancelled successfully!');
        fetchOrders();
      } catch (err: any) {
        alert('Failed to cancel order: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      SHIPPED: 'bg-purple-100 text-purple-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900">Order Management</h1>
        <button
          className={`px-6 py-3 rounded-full font-semibold transition-all shadow-sm ${showCreateForm ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-gray-900 text-white hover:bg-black hover:scale-105'}`}
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Close Form' : '+ New Order'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-100">
          {error}
        </div>
      )}

      {showCreateForm && (
          <div className="bg-white p-8 rounded-3xl shadow-lg mb-10 border border-black/5 animate-fade-in-down">
           <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Order</h2>
           <form onSubmit={handleCreateOrder}>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Delivery Address:</label>
              <textarea
                value={newOrder.adresseLivraison}
                onChange={(e) => setNewOrder({ ...newOrder, adresseLivraison: e.target.value })}
                required
                placeholder="Enter delivery address"
                rows={3}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Order Items</h3>
              {newOrder.orderItems.map((item, index) => (
                <div key={index} className="flex gap-4 mb-4 items-end">
                  <div className="flex-grow">
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Product:</label>
                    <select
                      value={item.productId}
                      onChange={(e) => handleOrderItemChange(index, 'productId', e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                    >
                      <option value="">Select a product</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.nom} - ${product.prix} (Stock: {product.stockQuantity})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-32">
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Quantity:</label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleOrderItemChange(index, 'quantity', e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                    />
                  </div>
                  {newOrder.orderItems.length > 1 && (
                    <button
                      type="button"
                      className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                      onClick={() => handleRemoveOrderItem(index)}
                      title="Remove item"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                className="mt-2 text-blue-600 font-semibold text-sm hover:text-blue-800 flex items-center gap-1"
                onClick={handleAddOrderItem}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Add Another Product
              </button>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
              <button
                type="button"
                className="px-6 py-2.5 text-gray-600 font-semibold hover:bg-gray-100 rounded-full transition-colors"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 shadow-md hover:shadow-lg transition-all"
              >
                Create Order
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="flex flex-col gap-6">
        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
            <p className="text-gray-500 text-lg mb-4">No orders found.</p>
            <button
              className="px-6 py-2 bg-white border border-gray-200 rounded-full text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              onClick={() => setShowCreateForm(true)}
            >
              Create your first order
            </button>
          </div>
        ) : (
          orders.map(order => (
            <div key={order.id} className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-sm border border-white/20 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-6 pb-6 border-b border-gray-100">
                <div>
                  <div className="text-lg font-bold text-gray-900 mb-1">Order #{order.orderNumber || order.id}</div>
                  <div className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</div>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase ${getStatusColor(order.status)}`}>
                  {order.status}
                </div>
              </div>

              {order.orderItems && order.orderItems.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Items</h4>
                  <div className="flex flex-col gap-3">
                    {order.orderItems.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm">
                        <span className="font-medium text-gray-900">{item.productNom || `Product #${item.productId}`}</span>
                        <div className="flex items-center gap-6 text-gray-600">
                          <span>Qty: {item.quantity}</span>
                          {item.prixUnitaire && (
                            <span>${Number(item.prixUnitaire).toFixed(2)} each</span>
                          )}
                          {item.sousTotal && (
                            <span className="font-semibold text-gray-900">${Number(item.sousTotal).toFixed(2)}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-medium text-gray-500">Total Amount:</span>
                  <span className="text-2xl font-bold text-gray-900">${Number(order.montantTotal || 0).toFixed(2)}</span>
                </div>

                {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
                  <button
                    className="px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-semibold transition-colors"
                    onClick={() => handleCancelOrder(order.id)}
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Orders;
