import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productService } from '../services/api';
import { notify } from './NotificationContext';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await productService.getProductById(id);
      setProduct(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load product details.');
      console.error('Error fetching product:', err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = () => {
    if (product.stockQuantity === 0) {
      notify.warning('This product is out of stock!');
      return;
    }

    if (quantity > product.stockQuantity) {
      notify.warning(`Only ${product.stockQuantity} items available!`);
      return;
    }

    // Get existing cart
    const savedCart = localStorage.getItem('cart');
    const cart = savedCart ? JSON.parse(savedCart) : [];

    // Check if product already in cart
    const existingItemIndex = cart.findIndex(item => item.productId === product.id);

    if (existingItemIndex >= 0) {
      // Update quantity
      cart[existingItemIndex].quantity += quantity;
      notify.success(`${product.nom} quantity updated in cart!`);
    } else {
      // Add new item
      cart.push({
        productId: product.id,
        quantity: quantity
      });
      notify.success(`${product.nom} added to cart!`);
    }

    localStorage.setItem('cart', JSON.stringify(cart));
  };

  const buyNow = () => {
    addToCart();
    navigate('/cart');
  };

  if (loading) {
    return (
      <div className="product-detail-container">
        <div className="loading">Loading product details...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail-container">
        <div className="error">{error || 'Product not found'}</div>
        <button onClick={() => navigate('/products')}>Back to Products</button>
      </div>
    );
  }

  return (
    <div className="product-detail-container">
      <button className="back-btn" onClick={() => navigate('/products')}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="19" y1="12" x2="5" y2="12"/>
          <polyline points="12 19 5 12 12 5"/>
        </svg>
        Back to Products
      </button>

      <div className="product-detail-content">
        <div className="product-image-section">
          <div className="main-image">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.nom} />
            ) : (
              <div className="placeholder-image">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
                <span>No Image Available</span>
              </div>
            )}
          </div>
          {product.source && (
            <div className="source-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
              </svg>
              Source: {product.source}
            </div>
          )}
        </div>

        <div className="product-info-section">
          <div className="product-header">
            <span className="category-badge">{product.categoryName}</span>
            <h1>{product.nom}</h1>
            <div className="product-meta">
              {product.categoryDescription && (
                <p className="category-desc">{product.categoryDescription}</p>
              )}
            </div>
          </div>

          <div className="price-section">
            <div className="price">
              <span className="currency">$</span>
              <span className="amount">{product.prix}</span>
            </div>
            <div className={`stock-status ${product.stockQuantity > 0 ? 'in-stock' : 'out-of-stock'}`}>
              {product.stockQuantity > 0 ? (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  In Stock ({product.stockQuantity} available)
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                  Out of Stock
                </>
              )}
            </div>
          </div>

          <div className="description-section">
            <h3>Product Description</h3>
            <p>{product.description || 'No description available for this product.'}</p>
          </div>

          {product.stockQuantity > 0 && (
            <div className="purchase-section">
              <div className="quantity-selector">
                <label>Quantity:</label>
                <div className="quantity-controls">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={product.stockQuantity}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(product.stockQuantity, parseInt(e.target.value) || 1)))}
                  />
                  <button
                    onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                    disabled={quantity >= product.stockQuantity}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="action-buttons">
                <button className="add-to-cart-btn" onClick={addToCart}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="9" cy="21" r="1"/>
                    <circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                  </svg>
                  Add to Cart
                </button>
                <button className="buy-now-btn" onClick={buyNow}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  Buy Now
                </button>
              </div>
            </div>
          )}

          <div className="product-details">
            <h3>Product Details</h3>
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">Category:</span>
                <span className="detail-value">{product.categoryName}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Price:</span>
                <span className="detail-value">${product.prix}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Availability:</span>
                <span className="detail-value">
                  {product.disponible ? 'Available' : 'Unavailable'}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Stock:</span>
                <span className="detail-value">{product.stockQuantity} units</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

