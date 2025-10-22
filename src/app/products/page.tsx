"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
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

  const isValidUrl = (url: string) => {
    try {
      new URL(url.trim());
      return true;
    } catch {
      return false;
    }
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

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">
          {selectedCategory === 'All' ? 'All Products' : selectedCategory} ({filteredProducts.length})
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product: any) => (
            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <Image
                  src={isValidUrl(product.image || '') ? product.image.trimEnd() : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='}
                  alt={product.name}
                  width={300}
                  height={300}
                  className="w-full h-48 object-cover"
                  unoptimized
                />
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-2">{product.brand || 'Generic'}</p>
                
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-green-600">
                      ₹{product.price}
                    </span>
                    {product.deliveryCharge && (
                      <span className="text-sm text-gray-500">
                        + ₹{product.deliveryCharge} delivery
                      </span>
                    )}
                  </div>
                </div>

                {product.deliveryCharge && (
                  <div className="mb-2">
                    <span className="text-sm font-semibold text-blue-600">
                      Total: ₹{product.price + product.deliveryCharge}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Stock: {product.stock}
                  </span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {product.category}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}