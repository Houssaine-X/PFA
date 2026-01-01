import React, { MouseEvent } from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  isAdmin?: boolean;
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
  onAddToCart?: (product: Product) => void;
  onClick: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  isAdmin = false, 
  onEdit, 
  onDelete, 
  onAddToCart, 
  onClick 
}) => {
  const isEbayProduct = product.source === 'EBAY';
  const isInternalProduct = product.source === 'INTERNAL' || !product.source;

  const handleCardClick = (e: MouseEvent<HTMLDivElement>) => {
    // Prevent click if clicking admin buttons or add to cart
    const target = e.target as HTMLElement;
    if (target.closest('.admin-controls') || target.closest('button')) {
      return;
    }
    onClick(product);
  };

  return (
    <div
      className={`group bg-white/80 backdrop-blur-sm rounded-[20px] overflow-hidden transition-all duration-300 border border-white/20 shadow-sm flex flex-col h-full relative cursor-pointer hover:-translate-y-2 hover:shadow-xl hover:border-white/40 ${isEbayProduct ? 'ring-2 ring-[#0064D2]/10' : ''}`}
      onClick={handleCardClick}
    >

      {/* Admin Controls */}
      {isAdmin && isInternalProduct && onEdit && onDelete && (
        <div className="admin-controls absolute top-4 right-4 z-10 flex gap-2">
          <button
            className="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-gray-600 hover:text-blue-600 transition-colors hover:bg-blue-50"
            onClick={(e) => { e.stopPropagation(); onEdit(product); }}
            title="Edit"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button 
            className="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-gray-600 hover:text-red-600 transition-colors hover:bg-red-50"
            onClick={(e) => { e.stopPropagation(); onDelete(product.id); }}
            title="Delete"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
      )}

      {/* Image Container */}
      <div className="h-[260px] w-full bg-[#f5f5f7] relative flex items-center justify-center overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.nom}
            className="w-full h-full object-contain p-5 transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = '/placeholder-image.svg';
            }}
          />
        ) : (
          <div className="text-gray-400 opacity-50 w-full h-full flex items-center justify-center">
            <svg className="w-16 h-16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-4 left-4 right-4 flex justify-between pointer-events-none">
          {product.source && product.source !== 'INTERNAL' && (
            <span className={`px-3 py-1 rounded-xl text-xs font-semibold backdrop-blur-md bg-white/90 text-gray-900 shadow-sm capitalize mr-auto`}>
              {product.source.toLowerCase()}
            </span>
          )}
          {!isEbayProduct && product.stockQuantity > 0 && product.stockQuantity < 10 && (
            <span className="px-3 py-1 rounded-xl text-xs font-semibold backdrop-blur-md bg-red-500/10 text-red-600 ml-auto">
              Only {product.stockQuantity} left
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex flex-col mb-2">
          <h3 className="font-bold text-gray-900 text-lg line-clamp-1 group-hover:text-blue-600 transition-colors mb-1">
            {product.nom}
          </h3>
          <p className="text-sm text-gray-500 mb-2 line-clamp-2">
            {product.description}
          </p>
          <span className="font-bold text-base text-black whitespace-nowrap">
            {product.currency === 'USD' || !product.currency ? '$' : product.currency + ' '}
            {Number(product.prix).toFixed(2)}
          </span>
        </div>
        
        <p className="text-xs text-gray-400 font-medium mb-4">{product.categoryName}</p>

        <div className="mt-auto pt-4 border-t border-gray-100 flex gap-2">
            {isEbayProduct ? (
                 <button 
                    className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 bg-[#0064D2]/10 text-[#0064D2] hover:bg-[#0064D2]/20"
                    onClick={() => window.open(product.itemWebUrl, '_blank')}
                 >
                    View on eBay
                 </button>
            ) : (
                <button 
                    className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 bg-gray-900 text-white hover:bg-gray-800 shadow-md hover:shadow-lg disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed disabled:shadow-none"
                    disabled={product.stockQuantity === 0}
                    onClick={(e) => { e.stopPropagation(); onAddToCart && onAddToCart(product); }}
                >
                    {product.stockQuantity > 0 ? 'Add to Cart' : 'Sold Out'}
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
