import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { productService, ebayService, transformEbayItem } from '../services/api';
import { useAuth } from './AuthContext';
import { notify } from './NotificationContext';
import ProductCard from './ProductCard';
import { Product } from '../types';

interface ProductFormData {
  nom: string;
  description: string;
  prix: string;
  stockQuantity: string;
  categoryName: string;
  imageUrl: string;
  source: 'INTERNAL' | 'EBAY' | 'AMAZON' | 'WALMART';
}

const Products: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedSource, setSelectedSource] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [ebayLoading, setEbayLoading] = useState<boolean>(false);

  // Admin product management state
  const [showProductForm, setShowProductForm] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productFormData, setProductFormData] = useState<ProductFormData>({
    nom: '',
    description: '',
    prix: '',
    stockQuantity: '',
    categoryName: '',
    imageUrl: '',
    source: 'INTERNAL'
  });

  useEffect(() => {
    // Check if category was passed from Dashboard
    if (location.state?.selectedCategory) {
      setSelectedCategory(location.state.selectedCategory);
    }
  }, [location]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);

      // Fetch internal products
      const internalResponse = await productService.getAllProducts();
      const internalProducts = internalResponse.data.map((p: any) => ({
        ...p,
        source: p.source || 'INTERNAL'
      }));

      // Fetch eBay products (featured)
      let ebayProducts: Product[] = [];
      try {
        setEbayLoading(true);
        console.log('Fetching eBay products...');
        const ebayResponse = await ebayService.getFeaturedProducts();
        console.log('eBay API raw response:', ebayResponse);
        const responseData = ebayResponse.data as any;
        console.log('eBay response data:', responseData);

        if (Array.isArray(responseData)) {
             console.log('Response is array with', responseData.length, 'items');
             ebayProducts = responseData.map(transformEbayItem);
        } else if (responseData?.itemSummaries) {
             console.log('Response has itemSummaries with', responseData.itemSummaries.length, 'items');
             ebayProducts = responseData.itemSummaries.map(transformEbayItem);
        } else {
             console.warn('Unexpected eBay response format:', responseData);
        }
        console.log('Transformed eBay products:', ebayProducts);
      } catch (ebayErr: any) {
        console.error('Could not fetch eBay products:', ebayErr);
        console.error('eBay error details:', ebayErr?.response?.data || ebayErr?.message);
        // Don't fail the whole request if eBay fails
      } finally {
        setEbayLoading(false);
      }

      // Merge products
      const allMergedProducts = [...internalProducts, ...ebayProducts];
      setAllProducts(allMergedProducts);
      setProducts(allMergedProducts);
      setError(null);
    } catch (err) {
      setError('Failed to load products. Please ensure the backend services are running.');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    filterProducts();
  }, [selectedCategory, selectedSource, searchTerm, allProducts]);

  // Debounced eBay search when search term changes
  useEffect(() => {
    const searchEbay = async () => {
      if (searchTerm && searchTerm.length >= 3 && (selectedSource === 'ALL' || selectedSource === 'EBAY')) {
        try {
          setEbayLoading(true);
          const ebayResponse = await ebayService.searchProducts(searchTerm, 20);
          const responseData = ebayResponse.data as any;

          let ebayProducts: Product[] = [];
          if (Array.isArray(responseData)) {
             ebayProducts = responseData.map(transformEbayItem);
          } else if (responseData?.itemSummaries) {
             ebayProducts = responseData.itemSummaries.map(transformEbayItem);
          }

          if (ebayProducts.length > 0) {
            // Keep internal products and update with new eBay results
            setAllProducts(prev => {
              const internalProducts = prev.filter(p => p.source !== 'EBAY');
              return [...internalProducts, ...ebayProducts];
            });
          }
        } catch (err) {
          console.warn('eBay search failed:', err);
        } finally {
          setEbayLoading(false);
        }
      }
    };

    const debounceTimer = setTimeout(searchEbay, 500);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, selectedSource]);

  const filterProducts = () => {
    let filtered = [...allProducts];

    // Filter by category
    if (selectedCategory !== 'ALL') {
      filtered = filtered.filter(p =>
        p.categoryName?.toUpperCase() === selectedCategory.toUpperCase()
      );
    }

    // Filter by source (marketplace)
    if (selectedSource !== 'ALL') {
      filtered = filtered.filter(p =>
        (p.source || 'INTERNAL').toUpperCase() === selectedSource.toUpperCase()
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setProducts(filtered);
  };

  // Extract unique categories and sources from products
  const categories = ['ALL', ...new Set(allProducts.map(p => p.categoryName).filter(Boolean))];
  const sources = ['ALL', 'INTERNAL', 'AMAZON', 'EBAY', 'WALMART'];

  const addToCart = (product: Product) => {
    if (product.stockQuantity === 0) {
      notify.warning('This product is out of stock!');
      return;
    }

    // Get existing cart from localStorage
    const savedCart = localStorage.getItem('cart');
    const cart = savedCart ? JSON.parse(savedCart) : [];

    // Check if product already in cart
    const existingItemIndex = cart.findIndex((item: any) => item.productId === product.id);

    if (existingItemIndex >= 0) {
      // Update quantity
      cart[existingItemIndex].quantity += 1;
      notify.success(`${product.nom} quantity updated in cart!`);
    } else {
      // Add new item
      cart.push({
        productId: product.id,
        quantity: 1
      });
      notify.success(`${product.nom} added to cart!`);
    }

    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
  };

  // Admin functions
  const resetProductForm = () => {
    setProductFormData({
      nom: '',
      description: '',
      prix: '',
      stockQuantity: '',
      categoryName: '',
      imageUrl: '',
      source: 'INTERNAL'
    });
    setEditingProduct(null);
    setShowProductForm(false);
  };

  const handleProductFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProductFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductFormData({
      nom: product.nom || '',
      description: product.description || '',
      prix: product.prix.toString() || '',
      stockQuantity: product.stockQuantity.toString() || '',
      categoryName: product.categoryName || '',
      imageUrl: product.imageUrl || '',
      source: (product.source as 'INTERNAL' | 'EBAY' | 'AMAZON' | 'WALMART') || 'INTERNAL'
    });
    setShowProductForm(true);
  };

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const productData = {
        ...productFormData,
        prix: parseFloat(productFormData.prix),
        stockQuantity: parseInt(productFormData.stockQuantity, 10)
      };

      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, productData);
        notify.success('Product updated successfully!');
      } else {
        await productService.createProduct(productData);
        notify.success('Product created successfully!');
      }
      resetProductForm();
      fetchProducts();
    } catch (err: any) {
      notify.error('Failed to save product: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productService.deleteProduct(productId);
        notify.success('Product deleted successfully!');
        fetchProducts();
      } catch (err: any) {
        notify.error('Failed to delete product: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Our Products</h1>
        <div className="flex items-center gap-4">
          {isAdmin && (
            <button
              className="flex items-center gap-2 px-6 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-full font-semibold hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-all duration-300 shadow-sm"
              onClick={() => setShowProductForm(!showProductForm)}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              {showProductForm ? 'Close Form' : 'Add Product'}
            </button>
          )}
          <button
            className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-full font-semibold hover:bg-blue-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            onClick={() => navigate('/cart')}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1"/>
              <circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            View Cart
          </button>
        </div>
      </div>

      {/* Admin Product Form */}
      {isAdmin && showProductForm && (
        <div className="bg-white rounded-2xl p-8 mb-10 shadow-lg border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{editingProduct ? 'Edit Product' : 'Create New Product'}</h2>
          <form onSubmit={handleSubmitProduct} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-gray-700">Product Name *</label>
                <input
                  type="text"
                  name="nom"
                  value={productFormData.nom}
                  onChange={handleProductFormChange}
                  required
                  placeholder="Enter product name"
                  className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-gray-700">Category *</label>
                <input
                  type="text"
                  name="categoryName"
                  value={productFormData.categoryName}
                  onChange={handleProductFormChange}
                  required
                  placeholder="e.g., Electronics, Clothing"
                  className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-gray-700">Description</label>
              <textarea
                name="description"
                value={productFormData.description}
                onChange={handleProductFormChange}
                placeholder="Enter product description"
                rows={3}
                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-y min-h-[100px]"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-gray-700">Price ($) *</label>
                <input
                  type="number"
                  name="prix"
                  value={productFormData.prix}
                  onChange={handleProductFormChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-gray-700">Stock Quantity *</label>
                <input
                  type="number"
                  name="stockQuantity"
                  value={productFormData.stockQuantity}
                  onChange={handleProductFormChange}
                  required
                  min="0"
                  placeholder="0"
                  className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-gray-700">Image URL</label>
              <input
                type="url"
                name="imageUrl"
                value={productFormData.imageUrl}
                onChange={handleProductFormChange}
                placeholder="https://example.com/image.jpg"
                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>
            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                className="px-8 py-3 bg-gray-100 text-gray-600 rounded-full font-semibold hover:bg-gray-200 transition-all"
                onClick={resetProductForm}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-8 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
              >
                {editingProduct ? 'Update Product' : 'Create Product'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative max-w-2xl mx-auto mb-8">
        <input
          type="text"
          placeholder="Search products across all marketplaces..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-6 pr-14 py-4 bg-white border border-gray-200 rounded-full text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        <svg className="absolute right-6 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
      </div>

      {/* Source Filter (Marketplaces) */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Marketplace:</h3>
        <div className="flex flex-wrap gap-3">
          {sources.map(source => (
            <button
              key={source}
              className={`px-5 py-2.5 rounded-full font-medium text-sm transition-all duration-200 ${
                selectedSource === source 
                  ? 'bg-gray-900 text-white shadow-md transform -translate-y-0.5' 
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
              }`}
              onClick={() => setSelectedSource(source)}
            >
              {source}
            </button>
          ))}
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-10">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Category:</h3>
        <div className="flex flex-wrap gap-3 justify-center">
          {categories.map(category => (
            <button
              key={category}
              className={`px-5 py-2 rounded-full font-medium text-sm transition-all duration-200 ${
                selectedCategory === category 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl text-center mb-8 border border-red-100">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-gray-500 text-lg">Loading products...</div>
      ) : (
        <>
          <div className="text-center text-gray-500 mb-8">
            Showing {products.length} product{products.length !== 1 ? 's' : ''}
            {ebayLoading && <span className="text-red-500 italic ml-2 animate-pulse"> (Searching eBay...)</span>}
          </div>

          {products.length === 0 ? (
            <div className="text-center py-16 text-gray-500 text-lg bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              No products found.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {products.map(product => {
                const handleProductClick = (product: Product) => {
                  if (product.source === 'EBAY' && product.itemWebUrl) {
                    window.open(product.itemWebUrl, '_blank');
                  } else {
                    navigate(`/product/${product.id}`);
                  }
                };

                return (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isAdmin={isAdmin}
                    onEdit={handleEditProduct}
                    onDelete={handleDeleteProduct}
                    onAddToCart={addToCart}
                    onClick={handleProductClick}
                  />
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Products;

