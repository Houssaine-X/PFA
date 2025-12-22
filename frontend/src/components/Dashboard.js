import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../services/api';
import CategoryCarousel from './CategoryCarousel';
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
      {/* Category Carousel */}
      <CategoryCarousel />

      {/* Categories Section */}
      {categories.length > 0 && (
        <div className="categories-section">
          <h2>Browse by Category</h2>
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
            View All Products
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <div className="feature-item">
          <svg className="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <h3>Multi-Source Search</h3>
          <p>Search across multiple marketplaces simultaneously</p>
        </div>
        <div className="feature-item">
          <svg className="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="1" x2="12" y2="23"/>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
          <h3>Price Comparison</h3>
          <p>Compare prices and find the best deals instantly</p>
        </div>
        <div className="feature-item">
          <svg className="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
          </svg>
          <h3>Direct Links</h3>
          <p>Purchase directly from trusted marketplace sellers</p>
        </div>
        <div className="feature-item">
          <svg className="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
          <h3>Real-Time Updates</h3>
          <p>Get up-to-date product information and availability</p>
        </div>
      </div>
    </div>
  );
};

// Helper functions
const getCategoryIcon = (category) => {
  const iconMap = {
    'ELECTRONICS': (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
        <line x1="8" y1="21" x2="16" y2="21"/>
        <line x1="12" y1="17" x2="12" y2="21"/>
      </svg>
    ),
    'CLOTHING': (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/>
      </svg>
    ),
    'BOOKS': (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
    ),
    'HOME': (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
    'SPORTS': (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
        <path d="M2 12h20"/>
      </svg>
    ),
    'TOYS': (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <circle cx="12" cy="12" r="4"/>
        <line x1="12" y1="2" x2="12" y2="8"/>
        <line x1="12" y1="16" x2="12" y2="22"/>
        <line x1="2" y1="12" x2="8" y2="12"/>
        <line x1="16" y1="12" x2="22" y2="12"/>
      </svg>
    ),
    'FOOD': (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
        <line x1="6" y1="1" x2="6" y2="4"/>
        <line x1="10" y1="1" x2="10" y2="4"/>
        <line x1="14" y1="1" x2="14" y2="4"/>
      </svg>
    ),
    'BEAUTY': (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2v20"/>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    )
  };

  return iconMap[category?.toUpperCase()] || (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    </svg>
  );
};

export default Dashboard;

