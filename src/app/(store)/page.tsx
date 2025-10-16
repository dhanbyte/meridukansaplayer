
"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { NEWARRIVALS_PRODUCTS } from "@/lib/products";
import type { Product } from "@/lib/types";

interface StoreHomeProps {
  addToCart?: (product: Product) => void;
}

export default function StoreHome({ addToCart }: StoreHomeProps) {

  const allProducts = NEWARRIVALS_PRODUCTS;

  const handleAddToCart = (product: Product) => {
    if (addToCart) {
      addToCart(product);
    }
  };

  return (
    <>
    <div className="flex-1">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Products</h2>
        <Button variant="link">VIEW ALL</Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {allProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-lg shadow-md overflow-hidden group"
          >
            <div className="relative">
              <Image
                src={product.image}
                alt={product.name}
                width={300}
                height={300}
                className="object-cover w-full h-48"
              />
            </div>
            <div className="p-4">
              <h3 className="text-sm font-semibold truncate group-hover:whitespace-normal h-10">
                {product.name}
              </h3>
              <div className="flex items-baseline mt-2">
                <span className="text-lg font-bold">
                  {product.price.currency}
                  {product.price.discounted || product.price.original}
                </span>
                {product.price.discounted && (
                  <span className="ml-2 text-sm text-gray-500 line-through">
                    {product.price.currency}
                    {product.price.original}
                  </span>
                )}
              </div>
              <Button
                className="w-full mt-4 bg-red-500 hover:bg-red-600"
                onClick={() => handleAddToCart(product)}
              >
                Add to Cart
              </Button>
            </div>
          </div>
        ))}
      </div>
      </div>
    </>
  );
}
