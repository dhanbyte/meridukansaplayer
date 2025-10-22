"use client";

import React from 'react';
import { NEW_PRODUCTS } from '@/lib/newProducts';
import Image from 'next/image';

export default function NewProductsDisplay() {
  const isValidUrl = (url: string) => {
    try {
      new URL(url.trim());
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Newly Added Products</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {NEW_PRODUCTS.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative">
              <Image
                src={isValidUrl(product.image || '') ? product.image.trimEnd() : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='}
                alt={product.name}
                width={400}
                height={300}
                className="w-full h-64 object-cover"
                unoptimized
              />
              <div className="absolute top-2 left-2 bg-green-500 text-white px-3 py-1 rounded text-sm font-semibold">
                NEW
              </div>
            </div>
            
            <div className="p-6">
              <h3 className="font-bold text-xl mb-2">{product.name}</h3>
              <p className="text-gray-600 text-sm mb-2">Brand: {product.brand}</p>
              <p className="text-gray-700 mb-4">{product.description}</p>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-green-600">
                    {product.price.currency}{product.price.discounted}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Stock: {product.quantity} pcs</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-white bg-blue-500 px-3 py-1 rounded">
                  {product.category}
                </span>
                <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded">
                  {product.subcategory}
                </span>
              </div>

              {product.features && product.features.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold text-sm mb-2">Features:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-500 mr-2">•</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}