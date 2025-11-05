
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
  const { searchQuery, searchResults, selectedProduct, setSelectedProduct, setSearchQuery } = useSearch();
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
  
  const subcategories = React.useMemo(() => {
    if (!allProducts) return [];
    
    // Get subcategories from all products (both database and JSON)
    const allSubcategories = allProducts
      .map((p: any) => p.subcategory)
      .filter(Boolean);
    
    // Remove duplicates and sort
    return [...new Set(allSubcategories)].sort();
  }, [allProducts]);
  
  const categories = React.useMemo(() => {
    if (!allProducts) return [];
    
    // Get categories from all products (both database and JSON)
    const allCategories = allProducts
      .map((p: any) => p.category)
      .filter(Boolean);
    
    // Remove duplicates and sort
    return [...new Set(allCategories)].sort();
  }, [allProducts]);

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
    // If a specific product is selected from search, show only that product
    if (selectedProduct) {
      return [selectedProduct];
    }
    
    // If there's a search query, show search results
    if (searchQuery.trim()) {
      return searchResults;
    }
    
    // Otherwise show all products with filter
    if (!allProducts) return [];
    if (filter === "all") {
      return allProducts;
    }
    return allProducts.filter(
      (p: any) => 
        p.subcategory?.toLowerCase() === filter.toLowerCase() ||
        p.category?.toLowerCase() === filter.toLowerCase()
    );
  }, [allProducts, filter, searchQuery, searchResults, selectedProduct]);
  
  return (
    <>
    <div className="flex-1">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          <h2 className="text-lg sm:text-xl font-bold">
            {selectedProduct ? `Selected Product` : searchQuery.trim() ? `Search Results (${searchResults.length})` : "Products"}
          </h2>
          {selectedProduct && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setSelectedProduct(null);
                setSearchQuery('');
              }}
            >
              ← Back to All Products
            </Button>
          )}
        </div>
         <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <Select onValueChange={handleFilterChange} defaultValue="all">
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="VIEW ALL">VIEW ALL</SelectItem>
              <SelectItem value="Accessories">Accessories</SelectItem>
              <SelectItem value="Automotive">Automotive</SelectItem>
              <SelectItem value="Baby Care">Baby Care</SelectItem>
              <SelectItem value="Bracelets">Bracelets</SelectItem>
              <SelectItem value="Chocolates">Chocolates</SelectItem>
              <SelectItem value="Electronics">Electronics</SelectItem>
              <SelectItem value="Face & Body Care">Face & Body Care</SelectItem>
              <SelectItem value="Home & Kitchen">Home & Kitchen</SelectItem>
              <SelectItem value="Home Care">Home Care</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="link" className="hidden sm:inline-flex">VIEW ALL</Button>
        </div>
      </div>
      {searchQuery.trim() && !selectedProduct && filteredProducts.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <p className="text-gray-500 text-base sm:text-lg px-4">No products found for "{searchQuery}"</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
          {filteredProducts.map((product: any, index: number) => (
          <div
            key={`${product.id}-${index}`}
            className="bg-white rounded-lg shadow-md overflow-hidden group cursor-pointer"
            onClick={() => window.location.href = `/product/${product.id}`}
          >
            <div className="relative">
              <Image
                src={isValidUrl(product.image || '') ? product.image.trim() : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2Y5ZmFmYiIvPgo8cGF0aCBkPSJNNzUgMTEyLjVIMjI1VjE4Ny41SDc1VjExMi41WiIgc3Ryb2tlPSIjZDFkNWRiIiBzdHJva2Utd2lkdGg9IjMiIGZpbGw9Im5vbmUiLz4KPGNpcmNsZSBjeD0iMTEyLjUiIGN5PSIxMzciIHI9IjEwIiBmaWxsPSIjZDFkNWRiIi8+CjxwYXRoIGQ9Ik03NSAxNjJMMTEyLjUgMTI1TDE1MCA1MEwyMjUgMTI1VjE4Ny41SDc1VjE2MloiIGZpbGw9IiNkMWQ1ZGIiLz4KPC9zdmc+'}
                alt={product.name}
                width={300}
                height={300}
                className="object-cover w-full h-32 sm:h-40 md:h-48"
                unoptimized
              />
            </div>
            <div className="p-2 sm:p-3 md:p-4">
              <h3 className="text-xs sm:text-sm font-semibold line-clamp-2 h-8 sm:h-10 mb-2">
                {product.name}
              </h3>
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-1">
                <span className="text-sm sm:text-lg font-bold text-green-600">
                  ₹{product.price}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-xs sm:text-sm text-gray-500 line-through">
                    ₹{product.originalPrice}
                  </span>
                )}
              </div>
              <div className="mt-1 sm:mt-2">
                <span className="text-xs sm:text-sm text-gray-600">
                  Stock: {product.stock || product.quantity}
                </span>
              </div>
              <Button
                className="w-full mt-2 sm:mt-4 bg-red-500 hover:bg-red-600 text-xs sm:text-sm py-1 sm:py-2"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToCart(product);
                }}
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
