
"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { NEWARRIVALS_PRODUCTS } from "@/lib/products";
import type { Product } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useCart } from "@/lib/CartContext";
// ...existing code...

export default function StoreHome() {
  const { toast } = useToast();
  const { addToCart } = useCart();
  const allProducts = NEWARRIVALS_PRODUCTS;
  // Removed useUser
  const [filter, setFilter] = React.useState("all");

  const handleAddToCart = (product: Product) => {
    addToCart(product);
     toast({
      title: "Added to cart!",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleFilterChange = (value: string) => {
    setFilter(value);
  };
  
  const subcategories = allProducts 
    ? [...new Set(allProducts.map((p) => p.subcategory))]
    : [];

  const filteredProducts = React.useMemo(() => {
    if (!allProducts) return [];
    if (filter === "all") {
      return allProducts;
    }
    return allProducts.filter(
      (p) => p.subcategory.toLowerCase() === filter.toLowerCase()
    );
  }, [allProducts, filter]);
  
  // Only partners can see the product list
  if (userLoading) {
    return <div className="flex-1">Loading...</div>;
  }

  if (!user || user.role !== 'partner') {
    return (
      <div className="flex-1 p-8">
        <h2 className="text-xl font-bold">Products</h2>
        <p className="text-gray-600 mt-4">Products are visible only to logged in partners. Please sign in as a partner to view the catalog.</p>
      </div>
    );
  }

  return (
    <>
    <div className="flex-1">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Products</h2>
         <div className="flex items-center gap-4">
          <Select onValueChange={handleFilterChange} defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {subcategories.map((sub) => (
                <SelectItem key={sub} value={sub}>
                  {sub}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="link">VIEW ALL</Button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {filteredProducts.map((product) => (
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
