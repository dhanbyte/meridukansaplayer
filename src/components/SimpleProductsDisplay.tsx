"use client";

import React from 'react';
import { SIMPLE_PRODUCTS } from '@/lib/simpleProducts';
import Image from 'next/image';

export default function SimpleProductsDisplay() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Products</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {SIMPLE_PRODUCTS.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative">
              <Image
                src={product.image}
                alt={product.name}
                width={400}
                height={300}
                className="w-full h-64 object-cover"
                unoptimized
              />
            </div>
            
            <div className="p-6">
              <h3 className="font-bold text-xl mb-2">{product.name}</h3>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-green-600">
                    ₹{product.price}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Stock: {product.stock} pcs</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-white bg-blue-500 px-3 py-1 rounded">
                  {product.category}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}