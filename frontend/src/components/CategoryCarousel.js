import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../services/api';
import './CategoryCarousel.css';

const CategoryCarousel = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProductsByCategory();
  }, []);

  useEffect(() => {
    if (!isPlaying || categories.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % categories.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPlaying, categories.length]);

  const fetchProductsByCategory = async () => {
    try {
      setLoading(true);
      const response = await productService.getAllProducts();
      const products = response.data;

      // Group products by category
      const categoryMap = new Map();
      products.forEach(product => {
        const category = product.categoryName || 'Other';
        if (!categoryMap.has(category)) {
          categoryMap.set(category, {
            name: category,
            description: product.categoryDescription || '',
            products: []
          });
        }
        categoryMap.get(category).products.push(product);
      });

      setCategories(Array.from(categoryMap.values()));
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + categories.length) % categories.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % categories.length);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleShopNow = () => {
    if (categories[currentIndex]) {
      navigate('/products', { state: { selectedCategory: categories[currentIndex].name } });
    }
  };

  const handleProductClick = (productId) => {
    navigate('/products');
  };

  if (loading || categories.length === 0) return null;

  const currentCategory = categories[currentIndex];
  const displayProducts = currentCategory.products.slice(0, 3);

  // Dynamic background colors for different categories
  const backgroundColors = [
    'linear-gradient(135deg, #f5f7fa 0%, #e8eef3 100%)',
    'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
    'linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)',
    'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
    'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
    'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
  ];

  const carouselStyle = {
    background: backgroundColors[currentIndex % backgroundColors.length]
  };

  return (
    <div className="category-carousel" style={carouselStyle}>
      <div className="carousel-content">
        <div className="carousel-text">
          <h1>{currentCategory.name}</h1>
          <p>
            {currentCategory.description ||
             `Discover our collection of ${currentCategory.name.toLowerCase()} from multiple sources`}
          </p>
          <button className="shop-now-btn" onClick={handleShopNow}>
            Shop now
          </button>
        </div>

        <div className="carousel-products">
          {displayProducts.map((product) => (
            <div
              key={product.id}
              className="product-preview"
              onClick={() => handleProductClick(product.id)}
            >
              <div className="product-preview-image">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.nom}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/placeholder-image.svg';
                    }}
                  />
                ) : (
                  <div className="no-image-placeholder">
                    <span>No Image</span>
                  </div>
                )}
              </div>
              <h3>{product.nom}</h3>
              <span className="preview-category">{currentCategory.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="carousel-controls">
        <button onClick={goToPrevious} className="control-btn" aria-label="Previous">
          <span>&#8249;</span>
        </button>

        <div className="carousel-indicators">
          {categories.map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        <button onClick={goToNext} className="control-btn" aria-label="Next">
          <span>&#8250;</span>
        </button>

        <button
          onClick={togglePlayPause}
          className="play-pause-btn"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? '||' : '▶'}
        </button>
      </div>
    </div>
  );
};

export default CategoryCarousel;

