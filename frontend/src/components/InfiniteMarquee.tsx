import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { productService, ebayService, transformEbayItem } from '../services/api';

const InfiniteMarquee: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
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
          console.warn('Could not fetch eBay products for marquee:', ebayErr);
        }

        // Combine and shuffle products for variety
        const allProducts = [...internalProducts, ...ebayProducts];
        const shuffled = allProducts.sort(() => Math.random() - 0.5);

        // Get enough products for the marquee (up to 20)
        setProducts(shuffled.slice(0, 20));
      } catch (error) {
        console.error('Error fetching products for marquee:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading || products.length === 0) return null;

  // Split products into two rows
  const midPoint = Math.ceil(products.length / 2);
  const row1 = products.slice(0, midPoint);
  const row2 = products.slice(midPoint);

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  return (
    <div className="w-full overflow-hidden bg-gray-50 py-12 flex flex-col gap-8">
      {/* Row 1 - Moving Right */}
      <div className="relative flex overflow-x-hidden group">
        <div className="animate-marquee-reverse flex gap-6 whitespace-nowrap hover:[animation-play-state:paused]">
          {[...row1, ...row1, ...row1].map((product, idx) => (
            <MarqueeCard
              key={`${product.id}-r1-${idx}`}
              product={product}
              onClick={() => handleProductClick(product.id)}
            />
          ))}
        </div>
      </div>

      {/* Row 2 - Moving Left */}
      <div className="relative flex overflow-x-hidden group">
        <div className="animate-marquee flex gap-6 whitespace-nowrap hover:[animation-play-state:paused]">
          {[...row2, ...row2, ...row2].map((product, idx) => (
            <MarqueeCard
              key={`${product.id}-r2-${idx}`}
              product={product}
              onClick={() => handleProductClick(product.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

interface MarqueeCardProps {
  product: Product;
  onClick: () => void;
}

const MarqueeCard: React.FC<MarqueeCardProps> = ({ product, onClick }) => {
  const [imgError, setImgError] = useState(false);

  // Fallback placeholder as data URI
  const placeholderImg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%23ccc' stroke-width='1'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3Cpolyline points='21 15 16 10 5 21'/%3E%3C/svg%3E";

  return (
    <div
      onClick={onClick}
      className="inline-block w-[200px] h-[280px] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer transition-transform hover:scale-105 hover:shadow-md flex-shrink-0"
    >
      <div className="h-[180px] w-full m-3 rounded-xl bg-gray-50 flex items-center justify-center relative overflow-hidden" style={{ width: 'calc(100% - 24px)' }}>
        {product.imageUrl && !imgError ? (
          <img
            src={product.imageUrl}
            alt={product.nom}
            className="max-w-full max-h-full object-contain mix-blend-multiply rounded-lg"
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

        {/* Source Badge */}
        <span className={`absolute bottom-2 left-2 backdrop-blur-sm text-[10px] font-medium px-2 py-0.5 rounded-full shadow-sm border ${
          product.source === 'EBAY' 
            ? 'bg-blue-500/90 text-white border-blue-400' 
            : 'bg-white/90 text-gray-700 border-gray-100'
        }`}>
          {product.source === 'EBAY' ? '🛒 eBay' : product.source || 'Internal'}
        </span>
      </div>
      <div className="px-4 pb-4 flex flex-col h-[76px]">
        <h3 className="font-semibold text-gray-900 truncate text-sm mb-1">{product.nom}</h3>
        <p className="text-xs text-gray-500 line-clamp-2">{product.categoryName || product.description || 'Product'}</p>
      </div>
    </div>
  );
};

export default InfiniteMarquee;
