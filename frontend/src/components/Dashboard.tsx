import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService, ebayService, transformEbayItem } from '../services/api';
import { Product } from '../types';
import InfiniteMarquee from './InfiniteMarquee';
import BentoGrid from './BentoGrid';
import FeaturedCarousel from './FeaturedCarousel';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async (): Promise<void> => {
    try {
      setLoading(true);

      // Fetch internal products
      const internalResponse = await productService.getAllProducts();
      const internalProducts = internalResponse.data.map((p: any) => ({
        ...p,
        source: p.source || 'INTERNAL'
      }));

      // Fetch eBay products
      let ebayProducts: Product[] = [];
      try {
        const ebayResponse = await ebayService.getFeaturedProducts();
        const responseData = ebayResponse.data as any;

        if (Array.isArray(responseData)) {
          ebayProducts = responseData.map(transformEbayItem);
        } else if (responseData?.itemSummaries) {
          ebayProducts = responseData.itemSummaries.map(transformEbayItem);
        }
      } catch (ebayErr) {
        console.warn('Could not fetch eBay products for carousel:', ebayErr);
      }

      // Combine products - mix internal and eBay for variety
      const combined = [...internalProducts, ...ebayProducts];
      // Shuffle to mix sources
      const shuffled = combined.sort(() => Math.random() - 0.5);
      // Get products for the carousel (e.g., 24 products)
      setFeaturedProducts(shuffled.slice(0, 24));
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (): void => {
    navigate('/products');
  };


  const handleShopNow = (): void => {
    navigate('/products');
  };

  return (
    <div className="max-w-[1400px] mx-auto p-0">
      <InfiniteMarquee />

      {/* Featured Products Carousel Section */}
      {loading ? (
        <div className="text-center p-[60px] text-[1.3rem] text-[#7f8c8d]">Loading products...</div>
      ) : (
        <FeaturedCarousel products={featuredProducts} />
      )}

      <BentoGrid />

      {/* Features Section */}
      <div className="bg-white py-20 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            <div className="flex flex-col items-center text-center group">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Multi-Source Search</h3>
              <p className="text-gray-500 leading-relaxed">Search across multiple marketplaces simultaneously to find exactly what you need.</p>
            </div>

            <div className="flex flex-col items-center text-center group">
              <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23"/>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Price Comparison</h3>
              <p className="text-gray-500 leading-relaxed">Compare prices instantly and secure the best deals available online.</p>
            </div>

            <div className="flex flex-col items-center text-center group">
              <div className="w-16 h-16 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:bg-green-600 group-hover:text-white">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Direct Links</h3>
              <p className="text-gray-500 leading-relaxed">Purchase directly from trusted marketplace sellers with one click.</p>
            </div>

            <div className="flex flex-col items-center text-center group">
              <div className="w-16 h-16 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:bg-orange-600 group-hover:text-white">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Real-Time Updates</h3>
              <p className="text-gray-500 leading-relaxed">Get up-to-the-minute product information, stock status, and availability.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
