import React from 'react';
import { ALL_PRODUCTS } from '../lib/products';

const ProductList = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">All Products</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {ALL_PRODUCTS.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              {product.price.original > product.price.discounted && (
                <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-sm">
                  {Math.round(((product.price.original - product.price.discounted) / product.price.original) * 100)}% OFF
                </div>
              )}
            </div>
            
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
              <p className="text-gray-600 text-sm mb-2">{product.brand}</p>
              <p className="text-gray-500 text-sm mb-3 line-clamp-2">{product.shortDescription}</p>
              
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold text-green-600">
                    {product.price.currency}{product.price.discounted}
                  </span>
                  {product.price.original > product.price.discounted && (
                    <span className="text-sm text-gray-500 line-through">
                      {product.price.currency}{product.price.original}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <span className="text-yellow-400">★</span>
                  <span className="text-sm text-gray-600">
                    {product.ratings.average} ({product.ratings.count})
                  </span>
                </div>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {product.category}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;