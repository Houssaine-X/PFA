import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../services/api';
import { Product } from '../types';

interface Category {
  name: string;
  description: string;
  products: Product[];
}

const CategoryCarousel: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);

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

  const fetchProductsByCategory = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await productService.getAllProducts();
      const products = response.data;

      // Group products by category
      const categoryMap = new Map<string, Category>();
      products.forEach((product: Product) => {
        const category = product.categoryName || 'Other';
        if (!categoryMap.has(category)) {
          categoryMap.set(category, {
            name: category,
            description: (product as any).categoryDescription || '',
            products: []
          });
        }
        categoryMap.get(category)!.products.push(product);
      });

      setCategories(Array.from(categoryMap.values()));
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const goToPrevious = (): void => {
    setCurrentIndex((prev) => (prev - 1 + categories.length) % categories.length);
  };

  const goToNext = (): void => {
    setCurrentIndex((prev) => (prev + 1) % categories.length);
  };

  const togglePlayPause = (): void => {
    setIsPlaying(!isPlaying);
  };

  const handleShopNow = (): void => {
    if (categories[currentIndex]) {
      navigate('/products', { state: { selectedCategory: categories[currentIndex].name } });
    }
  };

  const handleProductClick = (productId: string): void => {
    navigate(`/product/${productId}`);
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
    <div className="w-full min-h-[450px] py-[60px] px-[80px] relative overflow-hidden transition-[background] duration-[800ms] ease-linear" style={carouselStyle}>
      <div className="flex justify-between items-center gap-[60px] max-w-[1400px] mx-auto animate-[fadeIn_0.5s_ease]">
        <div className="flex-1 max-w-[500px]">
          <h1 className="text-[3.5rem] font-bold mb-5 text-[#1a1a1a] leading-[1.2]">{currentCategory.name}</h1>
          <p className="text-[1.2rem] text-[#4a4a4a] mb-[35px] leading-[1.6]">
            {currentCategory.description ||
             `Discover our collection of ${currentCategory.name.toLowerCase()} from multiple sources`}
          </p>
          <button 
            className="bg-[#1a1a1a] text-white py-4 px-[45px] border-none rounded-[30px] text-[1.05rem] font-semibold cursor-pointer transition-all duration-300 shadow-[0_4px_15px_rgba(0,0,0,0.15)] hover:bg-[#333] hover:-translate-y-[3px] hover:shadow-[0_6px_20px_rgba(0,0,0,0.25)]" 
            onClick={handleShopNow}
          >
            Shop now
          </button>
        </div>

        <div className="flex-1 flex gap-[25px] justify-end items-center">
          {displayProducts.map((product) => (
            <div
              key={product.id}
              className="text-center transition-transform duration-300 cursor-pointer hover:-translate-y-2"
              onClick={() => handleProductClick(product.id)}
            >
              <div className="w-[220px] h-[220px] rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.12)] bg-white flex items-center justify-center">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.nom}
                    className="w-full h-full object-contain p-2"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = '/placeholder-image.svg';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                    <span>No Image</span>
                  </div>
                )}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-[#1a1a1a] truncate max-w-[220px]">{product.nom}</h3>
              <span className="text-sm text-[#666] mt-1 block">{currentCategory.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-5 bg-white/30 backdrop-blur-sm py-2 px-5 rounded-full">
        <button onClick={goToPrevious} className="w-8 h-8 rounded-full border border-[#1a1a1a] bg-transparent text-[#1a1a1a] flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-[#1a1a1a] hover:text-white" aria-label="Previous">
          <span>&#8249;</span>
        </button>

        <div className="flex gap-2">
          {categories.map((_, index) => (
            <button
              key={index}
              className={`w-2.5 h-2.5 rounded-full border-none cursor-pointer transition-all duration-300 ${index === currentIndex ? 'bg-[#1a1a1a] scale-125' : 'bg-[#1a1a1a]/30 hover:bg-[#1a1a1a]/50'}`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        <button onClick={goToNext} className="w-8 h-8 rounded-full border border-[#1a1a1a] bg-transparent text-[#1a1a1a] flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-[#1a1a1a] hover:text-white" aria-label="Next">
          <span>&#8250;</span>
        </button>

        <button
          onClick={togglePlayPause}
          className="w-8 h-8 rounded-full border-none bg-[#1a1a1a] text-white flex items-center justify-center cursor-pointer text-xs ml-2 hover:bg-[#333]"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? '||' : '▶'}
        </button>
      </div>
    </div>
  );
};

export default CategoryCarousel;
