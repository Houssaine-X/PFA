import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { productService } from '../services/api';
import './Products.css';

const Products = () => {
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedSource, setSelectedSource] = useState('ALL');
  const [cart, setCart] = useState([]);
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
      alert('This product is out of stock!');
      return;
    }

    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    alert(`${product.nom} added to cart!`);
  };

  return (
    <div className="products-container">
      <div className="products-header">
        <h1>Our Products</h1>
        <div className="cart-summary">
          🛒 Cart: {cart.reduce((sum, item) => sum + item.quantity, 0)} items
        </div>
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
        <span className="search-icon">🔍</span>
      </div>

      {/* Source Filter (Marketplaces) */}
      <div className="filter-section">
        <h3 className="filter-title">🌐 Marketplace:</h3>
        <div className="source-filter">
          {sources.map(source => (
            <button
              key={source}
              className={`source-btn ${selectedSource === source ? 'active' : ''}`}
              onClick={() => setSelectedSource(source)}
            >
              {getSourceIcon(source)} {source}
            </button>
          ))}
        </div>
      </div>

      {/* Category Filter */}
      <div className="filter-section">
        <h3 className="filter-title">📁 Category:</h3>
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
                  <div className="product-image">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.nom} />
                    ) : (
                      <div className="placeholder-image">
                        {getCategoryIcon(product.categoryName)}
                      </div>
                    )}
                    {product.stockQuantity > 0 && product.stockQuantity < 10 && (
                      <span className="badge-stock">Only {product.stockQuantity} left!</span>
                    )}
                    <span className="source-tag">
                      {getSourceIcon(product.source || 'INTERNAL')}
                      {product.source || 'Internal'}
                    </span>
                  </div>
                  <div className="product-info">
                    <h3>{product.nom}</h3>
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

// Helper function
const getCategoryIcon = (category) => {
  const icons = {
    'ELECTRONICS': '💻',
    'CLOTHING': '👕',
    'BOOKS': '📚',
    'HOME': '🏠',
    'SPORTS': '⚽',
    'TOYS': '🧸',
    'FOOD': '🍔',
    'BEAUTY': '💄'
  };
  return icons[category?.toUpperCase()] || '📦';
};

const getSourceIcon = (source) => {
  const icons = {
    'INTERNAL': '🏪',
    'AMAZON': '📦',
    'EBAY': '🛒',
    'WALMART': '🏬',
    'ALL': '🌐',
    'EXTERNAL': '🌐'
  };
  return icons[source?.toUpperCase()] || '🏪';
};

export default Products;

