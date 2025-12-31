import React, { useState, useEffect } from 'react';
import { orderService, productService } from '../services/api';
import './Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [products, setProducts] = useState([]);
  const [newOrder, setNewOrder] = useState({
    userId: '',
    adresseLivraison: '',
    orderItems: [{
      productId: '',
      quantity: 1
    }]
  });

  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getAllOrders();
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
      setProducts(response.data);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const handleAddOrderItem = () => {
    setNewOrder({
      ...newOrder,
      orderItems: [...newOrder.orderItems, { productId: '', quantity: 1 }]
    });
  };

  const handleRemoveOrderItem = (index) => {
    const items = newOrder.orderItems.filter((_, i) => i !== index);
    setNewOrder({ ...newOrder, orderItems: items });
  };

  const handleOrderItemChange = (index, field, value) => {
    const items = [...newOrder.orderItems];
    items[index][field] = value;
    setNewOrder({ ...newOrder, orderItems: items });
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    try {
      const orderData = {
        userId: parseInt(newOrder.userId),
        adresseLivraison: newOrder.adresseLivraison,
        orderItems: newOrder.orderItems.map(item => ({
          productId: parseInt(item.productId),
          quantity: parseInt(item.quantity)
        }))
      };

      await orderService.createOrder(orderData);
      alert('Order created successfully!');
      setShowCreateForm(false);
      setNewOrder({
        userId: '',
        adresseLivraison: '',
        orderItems: [{ productId: '', quantity: 1 }]
      });
      fetchOrders();
    } catch (err) {
      alert('Failed to create order: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        await orderService.cancelOrder(orderId);
        alert('Order cancelled successfully!');
        fetchOrders();
      } catch (err) {
        alert('Failed to cancel order: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: '#f39c12',
      CONFIRMED: '#3498db',
      SHIPPED: '#9b59b6',
      DELIVERED: '#27ae60',
      CANCELLED: '#e74c3c'
    };
    return colors[status] || '#95a5a6';
  };


  return (
    <div className="orders-container">
      <div className="orders-header">
        <h1>Order Management</h1>
        <button className="create-btn" onClick={() => setShowCreateForm(!showCreateForm)}>
          {showCreateForm ? 'Close Form' : '+ New Order'}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {showCreateForm && (
        <div className="create-form">
          <h2>Create New Order</h2>
          <form onSubmit={handleCreateOrder}>
            <div className="form-group">
              <label>User ID:</label>
              <input
                type="number"
                value={newOrder.userId}
                onChange={(e) => setNewOrder({ ...newOrder, userId: e.target.value })}
                required
                placeholder="Enter user ID"
              />
            </div>
            <div className="form-group">
              <label>Delivery Address:</label>
              <textarea
                value={newOrder.adresseLivraison}
                onChange={(e) => setNewOrder({ ...newOrder, adresseLivraison: e.target.value })}
                required
                placeholder="Enter delivery address"
                rows="3"
              />
            </div>

            <div className="order-items-section">
              <h3>Order Items</h3>
              {newOrder.orderItems.map((item, index) => (
                <div key={index} className="order-item-row">
                  <div className="form-group flex-grow">
                    <label>Product:</label>
                    <select
                      value={item.productId}
                      onChange={(e) => handleOrderItemChange(index, 'productId', e.target.value)}
                      required
                    >
                      <option value="">Select a product</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.nom} - ${product.prix} (Stock: {product.stockQuantity})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Quantity:</label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleOrderItemChange(index, 'quantity', e.target.value)}
                      required
                    />
                  </div>
                  {newOrder.orderItems.length > 1 && (
                    <button
                      type="button"
                      className="remove-item-btn"
                      onClick={() => handleRemoveOrderItem(index)}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button type="button" className="add-item-btn" onClick={handleAddOrderItem}>
                + Add Another Product
              </button>
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-btn">Create Order</button>
              <button type="button" className="cancel-btn" onClick={() => setShowCreateForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="orders-list">
        {loading ? (
          <div className="loading">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="no-orders">No orders found. Create your first order!</div>
        ) : (
          orders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-header-card">
                <div className="order-id-group">
                  <div className="order-id">Order #{order.orderNumber || order.id}</div>
                  <div className="order-date">{new Date(order.createdAt).toLocaleString()}</div>
                </div>
                <div
                  className="order-status"
                  style={{ background: getStatusColor(order.status) }}
                >
                  {order.status}
                </div>
              </div>

              <div className="order-details">
                <div className="detail-item">
                  <span className="label">User ID:</span>
                  <span className="value">{order.userId}</span>
                </div>
                <div className="detail-item full-width">
                  <span className="label">Delivery Address:</span>
                  <span className="value">{order.adresseLivraison}</span>
                </div>
              </div>

              {order.orderItems && order.orderItems.length > 0 && (
                <div className="order-items">
                  <h4>Items:</h4>
                  {order.orderItems.map((item, idx) => (
                    <div key={idx} className="order-item">
                      <span className="item-name">{item.productNom || `Product #${item.productId}`}</span>
                      <span className="item-quantity">Qty: {item.quantity}</span>
                      {item.prixUnitaire && (
                        <span className="item-price">${Number(item.prixUnitaire).toFixed(2)} each</span>
                      )}
                      {item.sousTotal && (
                        <span className="item-subtotal">Subtotal: ${Number(item.sousTotal).toFixed(2)}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="order-total">
                <span className="label">Total Amount:</span>
                <span className="value price">${Number(order.montantTotal || 0).toFixed(2)}</span>
              </div>

              {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
                <div className="order-actions">
                  <button
                    className="cancel-order-btn"
                    onClick={() => handleCancelOrder(order.id)}
                  >
                    Cancel Order
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Orders;

