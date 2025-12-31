import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { productService } from '../services/api';
import { notify } from './NotificationContext';
import './Products.css';

const Products = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedSource, setSelectedSource] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Check if category was passed from Dashboard
    if (location.state?.selectedCategory) {
      setSelectedCategory(location.state.selectedCategory);
    }
  }, [location]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getAllProducts();
      setAllProducts(response.data);
      setProducts(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load products. Please ensure the backend services are running.');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    filterProducts();
  }, [selectedCategory, selectedSource, searchTerm, allProducts]);

  const filterProducts = () => {
    let filtered = [...allProducts];

    // Filter by category
    if (selectedCategory !== 'ALL') {
      filtered = filtered.filter(p =>
        p.categoryName?.toUpperCase() === selectedCategory.toUpperCase()
      );
    }

    // Filter by source (marketplace)
    if (selectedSource !== 'ALL') {
      filtered = filtered.filter(p =>
        (p.source || 'INTERNAL').toUpperCase() === selectedSource.toUpperCase()
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setProducts(filtered);
  };

  // Extract unique categories and sources from products
  const categories = ['ALL', ...new Set(allProducts.map(p => p.categoryName))];
  const sources = ['ALL', 'INTERNAL', 'AMAZON', 'EBAY', 'WALMART'];

  const addToCart = (product) => {
    if (product.stockQuantity === 0) {
      notify.warning('This product is out of stock!');
      return;
    }

    // Get existing cart from localStorage
    const savedCart = localStorage.getItem('cart');
    const cart = savedCart ? JSON.parse(savedCart) : [];

    // Check if product already in cart
    const existingItemIndex = cart.findIndex(item => item.productId === product.id);

    if (existingItemIndex >= 0) {
      // Update quantity
      cart[existingItemIndex].quantity += 1;
      notify.success(`${product.nom} quantity updated in cart!`);
    } else {
      // Add new item
      cart.push({
        productId: product.id,
        quantity: 1
      });
      notify.success(`${product.nom} added to cart!`);
    }

    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
  };

  return (
    <div className="products-container">
      <div className="products-header">
        <h1>Our Products</h1>
        <button className="cart-btn" onClick={() => navigate('/cart')}>
          <svg className="cart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="21" r="1"/>
            <circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          View Cart
        </button>
      </div>

      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search products across all marketplaces..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
      </div>

      {/* Source Filter (Marketplaces) */}
      <div className="filter-section">
        <h3 className="filter-title">Marketplace:</h3>
        <div className="source-filter">
          {sources.map(source => (
            <button
              key={source}
              className={`source-btn ${selectedSource === source ? 'active' : ''}`}
              onClick={() => setSelectedSource(source)}
            >
              {source}
            </button>
          ))}
        </div>
      </div>

      {/* Category Filter */}
      <div className="filter-section">
        <h3 className="filter-title">Category:</h3>
        <div className="category-filter">
          {categories.map(category => (
            <button
              key={category}
              className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      {loading ? (
        <div className="loading">Loading products...</div>
      ) : (
        <>
          <div className="products-count">
            Showing {products.length} product{products.length !== 1 ? 's' : ''}
          </div>
          <div className="products-grid">
            {products.length === 0 ? (
              <div className="no-products">No products found.</div>
            ) : (
              products.map(product => (
                <div key={product.id} className="product-card">
                  <div className="product-image" onClick={() => navigate(`/product/${product.id}`)}>
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.nom} />
                    ) : (
                      <div className="placeholder-image">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <polyline points="21 15 16 10 5 21"/>
                        </svg>
                        <span>No Image</span>
                      </div>
                    )}
                    {product.stockQuantity > 0 && product.stockQuantity < 10 && (
                      <span className="badge-stock">Only {product.stockQuantity} left</span>
                    )}
                    <span className="source-tag">
                      {product.source || 'Internal'}
                    </span>
                  </div>
                  <div className="product-info">
                    <h3 onClick={() => navigate(`/product/${product.id}`)}>{product.nom}</h3>
                    <p className="product-description">
                      {product.description || 'No description available'}
                    </p>
                    <div className="product-details">
                      <span className="product-category">{product.categoryName}</span>
                      <span className={`stock ${product.stockQuantity > 0 ? 'in-stock' : 'out-of-stock'}`}>
                        {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : 'Out of stock'}
                      </span>
                    </div>
                    <div className="product-footer">
                      <span className="product-price">${Number(product.prix).toFixed(2)}</span>
                      <button
                        className="add-to-cart-btn"
                        onClick={() => addToCart(product)}
                        disabled={product.stockQuantity === 0}
                      >
                        {product.stockQuantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Products;

