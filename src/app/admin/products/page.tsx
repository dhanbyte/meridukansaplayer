"use client";

import { useState, useEffect } from 'react';

export default function AdminProductsPage() {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    image: '',
    stock: '',
    weight: '',
    category: 'Home & Kitchen'
  });
  interface Product {
    id: string;
    name: string;
    price: number | string;
    image: string;
    stock: number | string;
    weight?: number | string;
    category: string;
    createdAt?: Date;
  }

  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Add this effect to log when products change
  useEffect(() => {
    console.log('Products updated:', products.length);
  }, [products]);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Accessories', 'Automotive', 'Baby Care', 'Bracelets', 'Chocolates', 'Electronics', 'Face & Body Care', 'Home & Kitchen', 'Home Care'];
  
  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter((product) => product.category === selectedCategory);

  useEffect(() => {
    fetchProducts();
  }, []);

  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState('');

  const fetchProducts = async () => {
    setIsLoading(true);
    setApiError('');
    
    try {
      console.log('Fetching products from API...');
      const response = await fetch('/api/products');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch products');
      }
      
      console.log('Products fetched:', data.products?.length || 0);
      
      if (data.products && Array.isArray(data.products)) {
        setProducts(data.products);
      } else {
        console.warn('Unexpected API response format:', data);
        setApiError('Invalid response format from server');
      }
    } catch (error) {
      const err = error as Error;
      console.error('Failed to fetch products:', err);
      setApiError(err.message || 'Failed to load products. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const uploadImage = async (file: File) => {
    console.log('Uploading file:', file.name);
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData
      });
      
      const data = await response.json();
      console.log('Upload response:', data);
      
      if (data.url) {
        setFormData({...formData, image: data.url});
        console.log('Image URL set:', data.url);
      } else {
        console.error('No URL in response:', data);
        alert('Image upload failed: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Image upload failed: ' + error);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.image) {
      setError('Please upload an image for the product');
      return;
    }
    
    // Type guard to ensure we have the required fields
    const { name, price, image, stock, category } = formData;
    if (!name || !price || !image || !stock || !category) {
      setError('Please fill in all required fields');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const method = editingProduct ? 'PUT' : 'POST';
      const body = editingProduct ? { ...formData, id: editingProduct.id } : formData;
      
      console.log('Submitting product:', body);
      
      const response = await fetch('/api/products', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to save product');
      }

      // Show success message based on response source
      const message = result.source === 'memory' 
        ? 'Product added to memory (development only)' 
        : editingProduct ? 'Product updated successfully!' : 'Product added successfully!';
      
      alert(message);
      
      // Reset form without auto-refresh
      setFormData({
        name: '',
        price: '',
        image: '',
        stock: '',
        weight: '',
        category: 'Home & Kitchen'
      });
      setEditingProduct(null);
      if (editingProduct) {
        setShowEditModal(false);
      } else {
        setShowForm(false);
      }
      
    } catch (err) {
      const error = err as Error;
      console.error('Error saving product:', error);
      setError(error.message || 'Failed to save product. Please check the console for details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const editProduct = (product: Product) => {
    setFormData({
      name: product.name,
      price: product.price.toString(),
      image: product.image,
      stock: product.stock.toString(),
      weight: product.weight?.toString() || '',
      category: product.category
    });
    setEditingProduct(product);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      price: '',
      image: '',
      stock: '',
      weight: '',
      category: 'Home & Kitchen'
    });
  };

  return (
    <div>
      <nav className="bg-white shadow-sm border-b p-4">
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm ${
                selectedCategory === category 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {category === 'All' ? 'VIEW ALL' : category}
            </button>
          ))}
        </div>
      </nav>
      
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products ({products.length})</h1>
        <div className="flex gap-2">
          <button
            onClick={fetchProducts}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center gap-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
            Refresh
          </button>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingProduct(null);
              setFormData({
                name: '',
                price: '',
                image: '',
                stock: '',
                weight: '',
                category: 'Home & Kitchen'
              });
            }}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            {showForm ? 'Cancel' : 'Add Product'}
          </button>
        </div>
      </div>
      
      {showForm && (
        <form onSubmit={handleSubmit} className="max-w-md space-y-4 mb-8 p-4 border rounded">
          <div>
            <label className="block text-sm font-medium mb-1">Product Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Price</label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Product Image</label>
            <div className="flex gap-4">
              <div 
                className="flex-1 p-4 border-2 border-dashed rounded text-center cursor-pointer hover:bg-gray-50"
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file) uploadImage(file);
                }}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => document.getElementById('fileInput')?.click()}
              >
                {formData.image ? (
                  <div>
                    <img src={formData.image} alt="Preview" className="w-20 h-20 mx-auto object-cover mb-2" />
                    <p className="text-sm text-gray-600">Click to change image</p>
                  </div>
                ) : (
                  <p>Drag & drop image or click to select</p>
                )}
              </div>
              {formData.image && (
                <div className="w-24">
                  <p className="text-xs text-gray-500 mb-2">Preview</p>
                  <img src={formData.image} alt="Small preview" className="w-20 h-20 object-cover rounded border" />
                </div>
              )}
            </div>
            <input
              id="fileInput"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadImage(file);
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Stock</label>
            <input
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData({...formData, stock: e.target.value})}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Weight (optional)</label>
            <input
              type="number"
              value={formData.weight}
              onChange={(e) => setFormData({...formData, weight: e.target.value})}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="w-full p-2 border rounded"
            >
              <option value="Accessories">Accessories</option>
              <option value="Automotive">Automotive</option>
              <option value="Baby Care">Baby Care</option>
              <option value="Bracelets">Bracelets</option>
              <option value="Chocolates">Chocolates</option>
              <option value="Electronics">Electronics</option>
              <option value="Face & Body Care">Face & Body Care</option>
              <option value="Home & Kitchen">Home & Kitchen</option>
              <option value="Home Care">Home Care</option>
            </select>
          </div>

          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded mb-4">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full p-2 rounded text-white ${
              isSubmitting 
                ? 'bg-blue-400 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {isSubmitting 
              ? 'Saving...' 
              : editingProduct ? 'Update Product' : 'Add Product'}
          </button>
        </form>
      )}

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Products ({isLoading ? '...' : filteredProducts.length})</h2>
          {apiError && (
            <div className="text-red-500 text-sm">
              {apiError}
            </div>
          )}
        </div>
        
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No products found</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Add Your First Product
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
          {filteredProducts.map((product) => (
            <div key={product.id} className="border p-4 rounded">
              <div className="flex gap-4 justify-between">
                <div className="flex gap-4">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-16 h-16 object-cover" onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAyMEg0NFY0NEgyMFYyMFoiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIi8+CjxjaXJjbGUgY3g9IjI4IiBjeT0iMjgiIHI9IjMiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTIwIDM2TDI4IDI4TDM2IDM2TDQ0IDI4VjQ0SDIwVjM2WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
                    }} />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 flex items-center justify-center text-gray-400 text-xs">No Image</div>
                  )}
                  <div>
                    <h3 className="font-semibold">{product.name}</h3>
                    <p>Price: ₹{product.price}</p>
                    <p>Stock: {product.stock}</p>
                    <p>Category: {product.category}</p>
                  </div>
                </div>
                {product.createdAt && (
                  <button
                    onClick={() => editProduct(product)}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 h-fit"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
          ))}
          </div>
        )}
      </div>

      {/* Edit Product Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit Product</h2>
              <button
                onClick={closeEditModal}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Product Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Price</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Product Image</label>
                <div className="flex gap-4">
                  <div 
                    className="flex-1 p-4 border-2 border-dashed rounded text-center cursor-pointer hover:bg-gray-50"
                    onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files[0];
                      if (file) uploadImage(file);
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={() => document.getElementById('editFileInput')?.click()}
                  >
                    {formData.image ? (
                      <div>
                        <img src={formData.image} alt="Preview" className="w-20 h-20 mx-auto object-cover mb-2" />
                        <p className="text-sm text-gray-600">Click to change image</p>
                      </div>
                    ) : (
                      <p>Drag & drop image or click to select</p>
                    )}
                  </div>
                </div>
                <input
                  id="editFileInput"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadImage(file);
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Stock</label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({...formData, stock: e.target.value})}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Weight (optional)</label>
                <input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({...formData, weight: e.target.value})}
                  className="w-full p-2 border rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full p-2 border rounded"
                >
                  <option value="Accessories">Accessories</option>
                  <option value="Automotive">Automotive</option>
                  <option value="Baby Care">Baby Care</option>
                  <option value="Bracelets">Bracelets</option>
                  <option value="Chocolates">Chocolates</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Face & Body Care">Face & Body Care</option>
                  <option value="Home & Kitchen">Home & Kitchen</option>
                  <option value="Home Care">Home Care</option>
                </select>
              </div>

              {error && (
                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}
              
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="flex-1 p-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-1 p-2 rounded text-white ${
                    isSubmitting 
                      ? 'bg-blue-400 cursor-not-allowed' 
                      : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  {isSubmitting ? 'Updating...' : 'Update Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}