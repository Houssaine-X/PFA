import React, { useState } from 'react';
import { productService, ebayService, transformEbayItem } from '../services/api';
import { Product } from '../types';

interface RecommendationQuery {
  category?: string;
  keywords?: string[];
  priceRange?: { min: number; max: number };
  source?: 'ALL' | 'INTERNAL' | 'EBAY';
  sortBy?: 'price_asc' | 'price_desc' | 'relevance';
  isComparison?: boolean;
}

export interface AIRecommendation {
  products: Product[];
  reasoning: string;
  tips: string[];
  comparison?: ProductComparison;
}

export interface ProductComparison {
  cheapest: Product | null;
  mostExpensive: Product | null;
  bestValue: Product | null;
  avgPrice: number;
  priceRange: { min: number; max: number };
  internalVsEbay: {
    internalAvg: number;
    ebayAvg: number;
    recommendation: string;
  };
}

// Simple keyword matching for product recommendations
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  beauty: ['beauty', 'cosmetics', 'skincare', 'makeup', 'bio', 'organic', 'natural', 'cream', 'serum', 'lotion'],
  electronics: ['electronics', 'phone', 'laptop', 'computer', 'tablet', 'gadget', 'tech', 'smart', 'wireless'],
  clothing: ['clothing', 'clothes', 'fashion', 'shirt', 'pants', 'dress', 'shoes', 'wear', 'outfit'],
  sports: ['sports', 'fitness', 'gym', 'workout', 'exercise', 'athletic', 'running', 'training'],
  home: ['home', 'furniture', 'decor', 'kitchen', 'living', 'bedroom', 'bathroom', 'garden'],
};

const QUALITY_KEYWORDS = ['bio', 'organic', 'natural', 'premium', 'best', 'top', 'quality', 'genuine', 'authentic'];
const PRICE_KEYWORDS = {
  cheap: ['cheap', 'affordable', 'budget', 'low price', 'inexpensive', 'economical', 'lowest', 'cheapest'],
  expensive: ['premium', 'luxury', 'high-end', 'expensive', 'best quality', 'highest'],
};
const COMPARISON_KEYWORDS = ['compare', 'comparison', 'versus', 'vs', 'difference', 'which is better', 'best deal', 'best price', 'cheapest', 'worth'];

// Parse user query to extract intent
const parseQuery = (query: string): RecommendationQuery => {
  const lowerQuery = query.toLowerCase();
  const result: RecommendationQuery = {
    keywords: [],
    source: 'ALL',
    sortBy: 'relevance',
    isComparison: false,
  };

  // Detect if user wants comparison
  result.isComparison = COMPARISON_KEYWORDS.some(kw => lowerQuery.includes(kw));

  // Detect category
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(kw => lowerQuery.includes(kw))) {
      result.category = category;
      break;
    }
  }

  // Detect price preference
  if (PRICE_KEYWORDS.cheap.some(kw => lowerQuery.includes(kw))) {
    result.sortBy = 'price_asc';
  } else if (PRICE_KEYWORDS.expensive.some(kw => lowerQuery.includes(kw))) {
    result.sortBy = 'price_desc';
  }

  // Extract quality keywords
  result.keywords = QUALITY_KEYWORDS.filter(kw => lowerQuery.includes(kw));

  // Check for source preference
  if (lowerQuery.includes('ebay')) {
    result.source = 'EBAY';
  } else if (lowerQuery.includes('internal') || lowerQuery.includes('our products')) {
    result.source = 'INTERNAL';
  }

  return result;
};

// Generate AI-like reasoning based on query and results
const generateReasoning = (query: string, products: Product[], parsedQuery: RecommendationQuery): string => {
  const parts: string[] = [];

  if (parsedQuery.category) {
    parts.push(`I found ${products.length} products in the ${parsedQuery.category} category`);
  } else {
    parts.push(`I found ${products.length} products matching your search`);
  }

  if (parsedQuery.keywords && parsedQuery.keywords.length > 0) {
    parts.push(`focusing on ${parsedQuery.keywords.join(', ')} options`);
  }

  if (parsedQuery.sortBy === 'price_asc') {
    parts.push('sorted by best price');
  } else if (parsedQuery.sortBy === 'price_desc') {
    parts.push('sorted by premium quality');
  }

  const internalCount = products.filter(p => p.source === 'INTERNAL').length;
  const ebayCount = products.filter(p => p.source === 'EBAY').length;

  if (internalCount > 0 && ebayCount > 0) {
    parts.push(`Comparing ${internalCount} from our catalog and ${ebayCount} from eBay`);
  }

  return parts.join('. ') + '.';
};

// Generate helpful tips based on query
const generateTips = (parsedQuery: RecommendationQuery): string[] => {
  const tips: string[] = [];

  if (parsedQuery.category === 'beauty') {
    tips.push('💡 Look for products with natural ingredients and certifications');
    tips.push('🌿 Bio and organic products are usually gentler on skin');
  } else if (parsedQuery.category === 'electronics') {
    tips.push('💡 Compare warranty periods between sellers');
    tips.push('🔌 Check compatibility with your existing devices');
  } else if (parsedQuery.category === 'clothing') {
    tips.push('📏 Always check the size guide before purchasing');
    tips.push('👕 Look for material composition for comfort');
  }

  if (parsedQuery.sortBy === 'price_asc') {
    tips.push('💰 Lower prices from eBay may have longer shipping times');
  }

  if (tips.length === 0) {
    tips.push('💡 Compare prices between internal and eBay products');
    tips.push('⭐ Check product descriptions for detailed specifications');
  }

  return tips.slice(0, 3);
};

// Generate comparison data
const generateComparison = (products: Product[]): ProductComparison | undefined => {
  if (products.length < 2) return undefined;

  const sortedByPrice = [...products].sort((a, b) => (a.prix || 0) - (b.prix || 0));
  const prices = products.map(p => p.prix || 0).filter(p => p > 0);

  const internalProducts = products.filter(p => p.source === 'INTERNAL');
  const ebayProducts = products.filter(p => p.source === 'EBAY');

  const internalAvg = internalProducts.length > 0
    ? internalProducts.reduce((sum, p) => sum + (p.prix || 0), 0) / internalProducts.length
    : 0;
  const ebayAvg = ebayProducts.length > 0
    ? ebayProducts.reduce((sum, p) => sum + (p.prix || 0), 0) / ebayProducts.length
    : 0;

  let recommendation = '';
  if (internalAvg > 0 && ebayAvg > 0) {
    const diff = ((internalAvg - ebayAvg) / ebayAvg * 100).toFixed(0);
    if (internalAvg < ebayAvg) {
      recommendation = `Our catalog is ${Math.abs(Number(diff))}% cheaper on average! 🎉`;
    } else if (ebayAvg < internalAvg) {
      recommendation = `eBay is ${Math.abs(Number(diff))}% cheaper on average, but check shipping costs! 📦`;
    } else {
      recommendation = 'Prices are similar - choose based on shipping and trust! ⚖️';
    }
  }

  return {
    cheapest: sortedByPrice[0] || null,
    mostExpensive: sortedByPrice[sortedByPrice.length - 1] || null,
    bestValue: sortedByPrice[Math.floor(sortedByPrice.length / 3)] || null, // Lower third as "value"
    avgPrice: prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0,
    priceRange: {
      min: Math.min(...prices),
      max: Math.max(...prices),
    },
    internalVsEbay: {
      internalAvg,
      ebayAvg,
      recommendation,
    },
  };
};

// AI Query parameters from the AI service
export interface AIQueryParams {
  category?: string;
  searchTerms?: string;
  keywords?: string[];
  pricePreference?: 'cheap' | 'expensive' | 'any';
  maxPrice?: number;
  wantsComparison?: boolean;
}

// Main recommendation function
export const getRecommendations = async (userQuery: string, aiParams?: AIQueryParams): Promise<AIRecommendation> => {
  const parsedQuery = parseQuery(userQuery);

  // Merge AI params with parsed query (AI params take priority)
  if (aiParams) {
    if (aiParams.category) parsedQuery.category = aiParams.category;
    if (aiParams.keywords) parsedQuery.keywords = [...(parsedQuery.keywords || []), ...aiParams.keywords];
    if (aiParams.pricePreference === 'cheap') parsedQuery.sortBy = 'price_asc';
    if (aiParams.pricePreference === 'expensive') parsedQuery.sortBy = 'price_desc';
    if (aiParams.wantsComparison) parsedQuery.isComparison = true;
    if (aiParams.maxPrice) parsedQuery.priceRange = { min: 0, max: aiParams.maxPrice };
  }

  let allProducts: Product[] = [];

  try {
    // Fetch internal products
    if (parsedQuery.source === 'ALL' || parsedQuery.source === 'INTERNAL') {
      const internalResponse = await productService.getAllProducts();
      const internalProducts = internalResponse.data.map((p: any) => ({
        ...p,
        source: p.source || 'INTERNAL'
      }));
      allProducts = [...allProducts, ...internalProducts];
    }

    // Fetch eBay products - use searchTerms from AI if available for more specific results
    if (parsedQuery.source === 'ALL' || parsedQuery.source === 'EBAY') {
      try {
        // Use AI's searchTerms first, then category, then fallback to user query
        const ebaySearchQuery = aiParams?.searchTerms || parsedQuery.category || userQuery.split(' ').slice(0, 3).join(' ');
        const ebayResponse = await ebayService.searchProducts(ebaySearchQuery, 10);
        const responseData = ebayResponse.data as any;

        if (Array.isArray(responseData)) {
          allProducts = [...allProducts, ...responseData.map(transformEbayItem)];
        } else if (responseData?.itemSummaries) {
          allProducts = [...allProducts, ...responseData.itemSummaries.map(transformEbayItem)];
        }
      } catch (ebayErr) {
        console.warn('Could not fetch eBay products:', ebayErr);
      }
    }

    // PRIORITY FILTER: Filter by searchTerms first (most specific)
    if (aiParams?.searchTerms) {
      const searchTermsList = aiParams.searchTerms.toLowerCase().split(/\s+/);
      allProducts = allProducts.filter(p => {
        const productText = `${p.nom} ${p.description || ''} ${p.categoryName || ''}`.toLowerCase();
        // Product must match at least one of the search terms
        return searchTermsList.some(term => productText.includes(term));
      });
    }

    // Filter by category if specified and no searchTerms filter was applied
    if (parsedQuery.category && !aiParams?.searchTerms) {
      const categoryKeywords = CATEGORY_KEYWORDS[parsedQuery.category] || [];
      allProducts = allProducts.filter(p => {
        const searchText = `${p.nom} ${p.description} ${p.categoryName}`.toLowerCase();
        return categoryKeywords.some(kw => searchText.includes(kw));
      });
    }

    // Filter by max price if specified
    if (parsedQuery.priceRange?.max) {
      allProducts = allProducts.filter(p => (p.prix || 0) <= parsedQuery.priceRange!.max);
    }

    // Filter by quality keywords (optional, for additional refinement)
    if (parsedQuery.keywords && parsedQuery.keywords.length > 0) {
      const keywordFiltered = allProducts.filter(p => {
        const searchText = `${p.nom} ${p.description}`.toLowerCase();
        return parsedQuery.keywords!.some(kw => searchText.includes(kw));
      });
      // Only apply keyword filter if it doesn't eliminate all products
      if (keywordFiltered.length > 0) {
        allProducts = keywordFiltered;
      }
    }

    // Sort products
    if (parsedQuery.sortBy === 'price_asc') {
      allProducts.sort((a, b) => (a.prix || 0) - (b.prix || 0));
    } else if (parsedQuery.sortBy === 'price_desc') {
      allProducts.sort((a, b) => (b.prix || 0) - (a.prix || 0));
    }

    // Limit results
    const recommendedProducts = allProducts.slice(0, 8);

    // Generate comparison if requested or if we have products from multiple sources
    const comparison = (parsedQuery.isComparison ||
      (recommendedProducts.some(p => p.source === 'INTERNAL') && recommendedProducts.some(p => p.source === 'EBAY')))
      ? generateComparison(recommendedProducts)
      : undefined;

    return {
      products: recommendedProducts,
      reasoning: generateReasoning(userQuery, recommendedProducts, parsedQuery),
      tips: generateTips(parsedQuery),
      comparison,
    };
  } catch (error) {
    console.error('Error getting recommendations:', error);
    return {
      products: [],
      reasoning: 'I had trouble finding products. Please try a different search.',
      tips: ['Try using simpler keywords', 'Check your internet connection'],
    };
  }
};

// Product Recommendation Card Component
interface RecommendationCardProps {
  product: Product;
  onClick: () => void;
  highlight?: 'cheapest' | 'expensive';
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ product, onClick, highlight }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      onClick={onClick}
      className={`flex gap-3 p-3 bg-white rounded-lg border cursor-pointer transition-all ${
        highlight === 'cheapest' 
          ? 'border-green-300 bg-green-50 ring-1 ring-green-200' 
          : 'border-gray-100 hover:border-blue-200 hover:shadow-sm'
      }`}
    >
      <div className="w-14 h-14 rounded-lg bg-gray-50 overflow-hidden flex-shrink-0">
        {product.imageUrl && !imgError ? (
          <img
            src={product.imageUrl}
            alt={product.nom}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            </svg>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-1">
          <h4 className="font-medium text-sm text-gray-900 truncate flex-1">{product.nom}</h4>
          {highlight === 'cheapest' && (
            <span className="text-[10px] bg-green-500 text-white px-1.5 py-0.5 rounded-full whitespace-nowrap">Best Price</span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className={`font-bold ${highlight === 'cheapest' ? 'text-green-600' : 'text-blue-600'}`}>
            {product.currency === 'USD' ? '$' : product.currency || '$'}{product.prix?.toFixed(2)}
          </span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded ${
            product.source === 'EBAY' 
              ? 'bg-blue-100 text-blue-700' 
              : 'bg-green-100 text-green-700'
          }`}>
            {product.source === 'EBAY' ? 'eBay' : 'Ours'}
          </span>
        </div>
      </div>
    </div>
  );
};

// Main Recommendation Component for the ChatBot
interface ProductRecommendationProps {
  recommendation: AIRecommendation;
  onProductClick: (productId: string) => void;
}

export const ProductRecommendationDisplay: React.FC<ProductRecommendationProps> = ({
  recommendation,
  onProductClick
}) => {
  if (recommendation.products.length === 0) {
    return (
      <div className="p-3 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">{recommendation.reasoning}</p>
      </div>
    );
  }

  const { comparison } = recommendation;

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-700">{recommendation.reasoning}</p>

      {/* Comparison Summary */}
      {comparison && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-100">
          <h4 className="font-semibold text-purple-900 text-sm mb-3 flex items-center gap-2">
            📊 Price Comparison
          </h4>

          {/* Price Stats */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="bg-white rounded-lg p-2 text-center shadow-sm">
              <p className="text-[10px] text-gray-500 uppercase">Lowest</p>
              <p className="font-bold text-green-600 text-sm">${comparison.priceRange.min.toFixed(2)}</p>
            </div>
            <div className="bg-white rounded-lg p-2 text-center shadow-sm">
              <p className="text-[10px] text-gray-500 uppercase">Average</p>
              <p className="font-bold text-blue-600 text-sm">${comparison.avgPrice.toFixed(2)}</p>
            </div>
            <div className="bg-white rounded-lg p-2 text-center shadow-sm">
              <p className="text-[10px] text-gray-500 uppercase">Highest</p>
              <p className="font-bold text-orange-600 text-sm">${comparison.priceRange.max.toFixed(2)}</p>
            </div>
          </div>

          {/* Internal vs eBay */}
          {comparison.internalVsEbay.recommendation && (
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <div className="text-center flex-1">
                  <span className="text-xs text-gray-500">Our Store</span>
                  <p className="font-bold text-green-600">
                    {comparison.internalVsEbay.internalAvg > 0
                      ? `$${comparison.internalVsEbay.internalAvg.toFixed(2)}`
                      : 'N/A'}
                  </p>
                </div>
                <div className="text-gray-300 px-2">vs</div>
                <div className="text-center flex-1">
                  <span className="text-xs text-gray-500">eBay</span>
                  <p className="font-bold text-blue-600">
                    {comparison.internalVsEbay.ebayAvg > 0
                      ? `$${comparison.internalVsEbay.ebayAvg.toFixed(2)}`
                      : 'N/A'}
                  </p>
                </div>
              </div>
              <p className="text-xs text-center text-purple-700 font-medium">
                {comparison.internalVsEbay.recommendation}
              </p>
            </div>
          )}

          {/* Best Deal Highlight */}
          {comparison.cheapest && (
            <div className="mt-3 flex items-center gap-2 text-xs">
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                🏆 Best Deal
              </span>
              <span className="text-gray-600 truncate flex-1">{comparison.cheapest.nom}</span>
              <span className="font-bold text-green-600">${comparison.cheapest.prix?.toFixed(2)}</span>
            </div>
          )}
        </div>
      )}

      {/* Product Cards */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
        {recommendation.products.map((product, idx) => (
          <RecommendationCard
            key={product.id}
            product={product}
            onClick={() => onProductClick(product.id)}
            highlight={comparison?.cheapest?.id === product.id ? 'cheapest' : undefined}
          />
        ))}
      </div>

      {recommendation.tips.length > 0 && (
        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs font-medium text-blue-800 mb-1">💡 AI Tips:</p>
          {recommendation.tips.map((tip, idx) => (
            <p key={idx} className="text-xs text-blue-700">{tip}</p>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductRecommendationDisplay;

