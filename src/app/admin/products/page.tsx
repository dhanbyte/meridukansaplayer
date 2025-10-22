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
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Accessories', 'Automotive', 'Baby Care', 'Bracelets', 'Chocolates', 'Electronics', 'Face & Body Care', 'Home & Kitchen', 'Home Care'];
  
  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter((product: any) => product.category === selectedCategory);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data.products);
    } catch (error) {
      console.error('Failed to fetch products');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.image) {
      alert('Please upload an image for the product');
      return;
    }
    
    try {
      const method = editingProduct ? 'PUT' : 'POST';
      const body = editingProduct ? { ...formData, id: editingProduct.id } : formData;
      
      const response = await fetch('/api/products', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        alert(editingProduct ? 'Product updated successfully!' : 'Product added successfully!');
        setFormData({
          name: '',
          price: '',
          image: '',
          stock: '',
          weight: '',
          category: 'Home & Kitchen'
        });
        setEditingProduct(null);
        fetchProducts();
        setShowForm(false);
      }
    } catch (error) {
      alert('Failed to save product');
    }
  };

  const editProduct = (product: any) => {
    setFormData({
      name: product.name,
      price: product.price.toString(),
      image: product.image,
      stock: product.stock.toString(),
      weight: product.weight?.toString() || '',
      category: product.category
    });
    setEditingProduct(product);
    setShowForm(true);
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

          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            {editingProduct ? 'Update Product' : 'Add Product'}
          </button>
        </form>
      )}

      <div>
        <h2 className="text-xl font-bold mb-4">Products ({filteredProducts.length})</h2>
        <div className="grid gap-4">
          {filteredProducts.map((product: any) => (
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
      </div>
    </div>
    </div>
  );
}