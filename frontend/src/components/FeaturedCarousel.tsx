import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '../types';

interface FeaturedCarouselProps {
  products: Product[];
}

const FeaturedCarousel: React.FC<FeaturedCarouselProps> = ({ products }) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // We want to show 1 row of products in the carousel
  const itemsPerSlide = 4; // 4 items per row
  const rows = 1;
  const itemsPerView = itemsPerSlide * rows; // 4 items total per view

  const totalSlides = Math.ceil(products.length / itemsPerView);

  useEffect(() => {
    if (!isAutoPlaying || totalSlides <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }, 6000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, totalSlides]);

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  if (products.length === 0) return null;

  // Get current products for the view
  const currentProducts = products.slice(
    currentIndex * itemsPerView,
    (currentIndex + 1) * itemsPerView
  );

  return (
    <div
      className="relative w-full py-10 px-4 bg-gradient-to-b from-white to-gray-50"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-8 px-2">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Featured Collection</h2>
            <p className="text-gray-500 mt-2">Discover our most popular items across all categories</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={prevSlide}
              className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 hover:border-gray-300 transition-all"
              aria-label="Previous slide"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              onClick={nextSlide}
              className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 hover:border-gray-300 transition-all"
              aria-label="Next slide"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>

        <div className="overflow-hidden">
          <div className="flex flex-col gap-6 transition-opacity duration-500">
            {/* Single Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {currentProducts.map((product) => (
                <ProductCard key={product.id} product={product} onClick={() => handleProductClick(product.id)} />
              ))}
              {/* Fill empty spots if needed */}
              {Array.from({ length: Math.max(0, itemsPerSlide - currentProducts.length) }).map((_, i) => (
                <div key={`empty-1-${i}`} className="hidden md:block"></div>
              ))}
            </div>
          </div>
        </div>

        {/* Indicators */}
        {totalSlides > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: totalSlides }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  idx === currentIndex ? 'bg-gray-800 w-6' : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-2xl p-4 cursor-pointer border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-300 flex flex-col h-full"
    >
      <div className="relative aspect-square mb-4 overflow-hidden rounded-xl bg-gray-50">
        {product.imageUrl && !imgError ? (
          <img
            src={product.imageUrl}
            alt={product.nom}
            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
        )}

        {/* Badge */}
        {product.stockQuantity < 5 && product.stockQuantity > 0 && (
          <span className="absolute top-2 right-2 bg-red-50 text-red-600 text-xs font-bold px-2 py-1 rounded-full border border-red-100">
            Low Stock
          </span>
        )}

        {/* Source Badge */}
        <span className={`absolute bottom-2 left-2 backdrop-blur-sm text-xs font-medium px-2 py-1 rounded-md shadow-sm border ${
          product.source === 'EBAY' 
            ? 'bg-blue-500/90 text-white border-blue-400' 
            : 'bg-white/90 text-gray-700 border-gray-100'
        }`}>
          {product.source === 'EBAY' ? '🛒 eBay' : product.source || 'Internal'}
        </span>
      </div>

      <div className="flex flex-col flex-grow">
        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
          {product.nom}
        </h3>
        <p className="text-sm text-gray-500 mb-3 line-clamp-2 flex-grow">
          {product.description}
        </p>

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
          <span className="text-lg font-bold text-gray-900">
            {product.currency === 'USD' ? '$' : product.currency || '$'}{product.prix?.toFixed(2) || '0.00'}
          </span>
          <button className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeaturedCarousel;
