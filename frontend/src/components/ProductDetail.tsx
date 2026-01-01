import React, { useState, useEffect, ChangeEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productService } from '../services/api';
import { Product, CartItem } from '../types';
import { notify } from './NotificationContext';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async (): Promise<void> => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await productService.getProductById(id);
      setProduct(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load product details.');
      console.error('Error fetching product:', err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (): void => {
    if (!product) return;
    
    if (product.stockQuantity === 0) {
      notify.warning('This product is out of stock!');
      return;
    }

    if (quantity > product.stockQuantity) {
      notify.warning(`Only ${product.stockQuantity} items available!`);
      return;
    }

    // Get existing cart
    const savedCart = localStorage.getItem('cart');
    const cart: CartItem[] = savedCart ? JSON.parse(savedCart) : [];

    // Check if product already in cart
    const existingItemIndex = cart.findIndex(item => item.productId === product.id);

    if (existingItemIndex >= 0) {
      // Update quantity
      cart[existingItemIndex].quantity += quantity;
      notify.success(`${product.nom} quantity updated in cart!`);
    } else {
      // Add new item
      cart.push({
        productId: product.id,
        quantity: quantity
      });
      notify.success(`${product.nom} added to cart!`);
    }

    localStorage.setItem('cart', JSON.stringify(cart));
  };

  const buyNow = (): void => {
    addToCart();
    navigate('/cart');
  };

  const handleQuantityChange = (e: ChangeEvent<HTMLInputElement>): void => {
    if (!product) return;
    const value = parseInt(e.target.value) || 1;
    setQuantity(Math.max(1, Math.min(product.stockQuantity, value)));
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="text-center py-20 text-gray-500 text-lg">Loading product details...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl text-center mb-8 border border-red-100">{error || 'Product not found'}</div>
        <button
          onClick={() => navigate('/products')}
          className="mx-auto block px-6 py-2.5 bg-gray-900 text-white rounded-full font-semibold hover:bg-gray-800 transition-all"
        >
          Back to Products
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <button
        className="flex items-center gap-2 px-5 py-2.5 bg-transparent border border-black/10 rounded-full text-gray-600 font-medium hover:bg-gray-50 hover:text-gray-900 hover:border-black/20 transition-all mb-6"
        onClick={() => navigate('/products')}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="19" y1="12" x2="5" y2="12"/>
          <polyline points="12 19 5 12 12 5"/>
        </svg>
        Back to Products
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        <div className="sticky top-24 flex flex-col gap-5">
          <div className="w-full aspect-square rounded-3xl overflow-hidden bg-white flex items-center justify-center shadow-md border border-black/5">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.nom} className="w-full h-full object-contain p-10" />
            ) : (
              <div className="flex flex-col items-center gap-4 text-gray-400 opacity-50">
                <svg className="w-20 h-20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
                <span>No Image Available</span>
              </div>
            )}
          </div>
          {product.source && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md rounded-xl text-gray-600 font-medium text-sm border border-black/5 shadow-sm w-fit">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
              </svg>
              Source: {product.source}
            </div>
          )}
        </div>

        <div className="pt-5">
          <div className="border-b border-black/5 pb-6 mb-6">
            <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-sm font-semibold mb-3">{product.categoryName}</span>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{product.nom}</h1>
            <div className="flex items-center gap-4 text-gray-500">
              {(product as any).categoryDescription && (
                <p className="text-sm">{(product as any).categoryDescription}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between mb-8">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-medium text-gray-500">$</span>
              <span className="text-5xl font-bold text-gray-900">{product.prix}</span>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium ${product.stockQuantity > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {product.stockQuantity > 0 ? (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  In Stock ({product.stockQuantity} available)
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                  Out of Stock
                </>
              )}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Product Description</h3>
            <p className="text-gray-600 leading-relaxed">{product.description || 'No description available for this product.'}</p>
          </div>

          {product.stockQuantity > 0 && (
            <div className="bg-gray-50 rounded-2xl p-6 mb-8">
              <div className="flex items-center gap-4 mb-6">
                <label className="font-semibold text-gray-700">Quantity:</label>
                <div className="flex items-center bg-white rounded-lg border border-gray-200 p-1">
                  <button
                    className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={product.stockQuantity}
                    value={quantity}
                    onChange={handleQuantityChange}
                    className="w-12 text-center font-semibold text-gray-900 focus:outline-none"
                  />
                  <button
                    className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
                    onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                    disabled={quantity >= product.stockQuantity}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-gray-200 text-gray-900 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                  onClick={addToCart}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="9" cy="21" r="1"/>
                    <circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                  </svg>
                  Add to Cart
                </button>
                <button
                  className="flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  onClick={buyNow}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  Buy Now
                </button>
              </div>
            </div>
          )}

          <div className="border-t border-gray-100 pt-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Product Details</h3>
            <div className="grid grid-cols-2 gap-y-4 gap-x-8">
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 mb-1">Category</span>
                <span className="font-medium text-gray-900">{product.categoryName}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 mb-1">Price</span>
                <span className="font-medium text-gray-900">${product.prix}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 mb-1">Availability</span>
                <span className="font-medium text-gray-900">
                  {(product as any).disponible ? 'Available' : 'Unavailable'}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 mb-1">Stock</span>
                <span className="font-medium text-gray-900">{product.stockQuantity} units</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

