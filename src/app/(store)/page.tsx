
"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
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
import { useSearch } from "./layout";
export default function StoreHome() {
  const { toast } = useToast();
  const { addToCart } = useCart();
  const { searchQuery, searchResults } = useSearch();
  const [allProducts, setAllProducts] = React.useState([]);
  const [filter, setFilter] = React.useState("all");

  React.useEffect(() => {
    fetchProducts();
    
    // Refresh products when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchProducts();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products?t=' + Date.now());
      const data = await response.json();
      console.log('API Response:', data);
      
      const products = data.products || [];
      console.log('Total products:', products.length);
      
      // Sort products - database products first (newest first), then JSON products
      const sorted = products.sort((a: any, b: any) => {
        if (a.createdAt && !b.createdAt) return -1;
        if (!a.createdAt && b.createdAt) return 1;
        if (a.createdAt && b.createdAt) return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return 0;
      });
      console.log('Sorted products:', sorted.length);
      setAllProducts(sorted);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setAllProducts([]);
    }
  };

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
    ? [...new Set(allProducts.map((p: any) => p.subcategory).filter(Boolean))]
    : [];

  const isValidUrl = (url: string) => {
    if (!url || url.trim() === '') return false;
    // Check for local uploads or valid URLs
    if (url.startsWith('/uploads/')) return true;
    try {
      new URL(url.trim());
      return true;
    } catch {
      return false;
    }
  };

  const filteredProducts = React.useMemo(() => {
    // If there's a search query, show search results
    if (searchQuery.trim()) {
      if (filter === "all") {
        return searchResults;
      }
      return searchResults.filter(
        (p: any) => p.subcategory?.toLowerCase() === filter.toLowerCase()
      );
    }
    
    // Otherwise show all products with filter
    if (!allProducts) return [];
    if (filter === "all") {
      return allProducts;
    }
    return allProducts.filter(
      (p: any) => p.subcategory?.toLowerCase() === filter.toLowerCase()
    );
  }, [allProducts, filter, searchQuery, searchResults]);
  
  return (
    <>
    <div className="flex-1">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">
          {searchQuery.trim() ? `Search Results (${filteredProducts.length})` : "Products"}
        </h2>
         <div className="flex items-center gap-4">
          <Select onValueChange={handleFilterChange} defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {subcategories.map((sub: string) => (
                <SelectItem key={sub} value={sub}>
                  {sub}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="link">VIEW ALL</Button>
        </div>
      </div>
      {searchQuery.trim() && filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No products found for "{searchQuery}"</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredProducts.map((product: any) => (
          <div
            key={product.id}
            className="bg-white rounded-lg shadow-md overflow-hidden group"
          >
            <div className="relative">
              <Image
                src={isValidUrl(product.image || '') ? product.image.trim() : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2Y5ZmFmYiIvPgo8cGF0aCBkPSJNNzUgMTEyLjVIMjI1VjE4Ny41SDc1VjExMi41WiIgc3Ryb2tlPSIjZDFkNWRiIiBzdHJva2Utd2lkdGg9IjMiIGZpbGw9Im5vbmUiLz4KPGNpcmNsZSBjeD0iMTEyLjUiIGN5PSIxMzciIHI9IjEwIiBmaWxsPSIjZDFkNWRiIi8+CjxwYXRoIGQ9Ik03NSAxNjJMMTEyLjUgMTI1TDE1MCA1MEwyMjUgMTI1VjE4Ny41SDc1VjE2MloiIGZpbGw9IiNkMWQ1ZGIiLz4KPC9zdmc+'}
                alt={product.name}
                width={300}
                height={300}
                className="object-cover w-full h-48"
                unoptimized
              />
            </div>
            <div className="p-4">
              <h3 className="text-sm font-semibold truncate group-hover:whitespace-normal h-10">
                {product.name}
              </h3>
              <div className="flex items-baseline mt-2">
                <span className="text-lg font-bold text-green-600">
                  ₹{product.price}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="ml-2 text-sm text-gray-500 line-through">
                    ₹{product.originalPrice}
                  </span>
                )}
              </div>
              <div className="mt-2">
                <span className="text-sm text-gray-600">
                  Stock: {product.stock || product.quantity}
                </span>
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
      )}
      </div>
    </>
  );
}
