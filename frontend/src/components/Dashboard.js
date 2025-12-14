import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getAllProducts();
      // Get first 8 products as featured
      setFeaturedProducts(response.data.slice(0, 8));

      // Extract unique categories
      const uniqueCategories = [...new Set(response.data.map(p => p.categoryName))];
      setCategories(uniqueCategories);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = () => {
    navigate('/products');
  };

  const handleCategoryClick = (category) => {
    navigate('/products', { state: { selectedCategory: category } });
  };

  const handleShopNow = () => {
    navigate('/products');
  };

  return (
    <div className="dashboard-container">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1>Search & Compare Products Across Multiple Marketplaces</h1>
          <p>Find the best deals from Amazon, eBay, Walmart and our internal catalog</p>
          <button className="shop-now-btn" onClick={handleShopNow}>
            Start Shopping
          </button>
        </div>
        <div className="hero-badges">
          <span className="source-badge">🏪 Internal Catalog</span>
          <span className="source-badge">📦 Amazon</span>
          <span className="source-badge">🛒 eBay</span>
          <span className="source-badge">🏬 Walmart</span>
        </div>
      </div>

      {/* Categories Section */}
      {categories.length > 0 && (
        <div className="categories-section">
          <h2>Shop by Category</h2>
          <div className="categories-grid">
            {categories.map((category, index) => (
              <div
                key={index}
                className="category-card"
                onClick={() => handleCategoryClick(category)}
              >
                <div className="category-icon">
                  {getCategoryIcon(category)}
                </div>
                <h3>{category}</h3>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Featured Products Section */}
      <div className="featured-section">
        <h2>Featured Products</h2>
        {loading ? (
          <div className="loading">Loading products...</div>
        ) : (
          <div className="products-grid">
            {featuredProducts.map(product => (
              <div
                key={product.id}
                className="product-card"
                onClick={handleProductClick}
              >
                <div className="product-image">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.nom} />
                  ) : (
                    <div className="placeholder-image">
                      {getProductIcon(product.categoryName)}
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
                    {product.description?.substring(0, 60)}...
                  </p>
                  <div className="product-footer">
                    <span className="product-price">${product.prix}</span>
                    <button className="quick-view-btn">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="view-all-container">
          <button className="view-all-btn" onClick={handleShopNow}>
            View All Products →
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <div className="feature-item">
          <span className="feature-icon">🔍</span>
          <h3>Multi-Source Search</h3>
          <p>Search across multiple marketplaces at once</p>
        </div>
        <div className="feature-item">
          <span className="feature-icon">💰</span>
          <h3>Price Comparison</h3>
          <p>Find the best deals instantly</p>
        </div>
        <div className="feature-item">
          <span className="feature-icon">🔗</span>
          <h3>Affiliate Links</h3>
          <p>Direct purchase from trusted sellers</p>
        </div>
        <div className="feature-item">
          <span className="feature-icon">⚡</span>
          <h3>Real-Time Results</h3>
          <p>Updated product information</p>
        </div>
      </div>
    </div>
  );
};

// Helper functions
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

const getProductIcon = (category) => {
  return getCategoryIcon(category);
};

const getSourceIcon = (source) => {
  const icons = {
    'INTERNAL': '🏪',
    'AMAZON': '📦',
    'EBAY': '🛒',
    'WALMART': '🏬',
    'EXTERNAL': '🌐'
  };
  return icons[source?.toUpperCase()] || '🏪';
};

export default Dashboard;

