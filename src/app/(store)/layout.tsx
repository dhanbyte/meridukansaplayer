
"use client";
import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  ShoppingCart,
  User,
  Bell,
  Box,
  Truck,
  MoreHorizontal,
  LogOut,
  ChevronDown,
  Wallet,
  TrendingUp,
  X,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { CartProvider, useCart } from "@/lib/CartContext";
import type { Product } from "@/lib/types";
import { AuthProvider, useAuth } from "@/lib/AuthContext";
import { LoginForm } from "@/components/LoginForm";

const SearchContext = React.createContext<{
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: Product[];
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
}>({ searchQuery: "", setSearchQuery: () => {}, searchResults: [], selectedProduct: null, setSelectedProduct: () => {} });

export const useSearch = () => React.useContext(SearchContext);

function SearchBox() {
  const { searchQuery, setSearchQuery, setSelectedProduct } = useSearch();
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [suggestions, setSuggestions] = React.useState<Product[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);

  const searchProducts = async (query: string) => {
    if (!query.trim()) return [];
    try {
      const response = await fetch(`/api/products`);
      const data = await response.json();
      const allProducts = data.products || [];
      
      // Filter products that match the search query
      return allProducts.filter((product: any) => 
        product.name?.toLowerCase().includes(query.toLowerCase()) ||
        product.brand?.toLowerCase().includes(query.toLowerCase()) ||
        product.category?.toLowerCase().includes(query.toLowerCase())
      );
    } catch (error) {
      console.error('Search failed:', error);
      return [];
    }
  };

  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setSelectedProduct(null);
    
    if (value.trim()) {
      setIsSearching(true);
      const results = await searchProducts(value);
      setSuggestions(results.slice(0, 5));
      setShowSuggestions(true);
      setIsSearching(false);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (product: Product) => {
    window.location.href = `/product/${product.id}`;
  };

  const clearSearch = () => {
    setSearchQuery('');
    setShowSuggestions(false);
    setSuggestions([]);
  };

  return (
    <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md mx-auto md:mx-0">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <Input
        type="text"
        placeholder="Search Products..."
        className="pl-10 pr-10 w-full"
        value={searchQuery}
        onChange={handleSearchChange}
        onFocus={() => searchQuery.trim() && setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 300)}
      />
      {searchQuery && (
        <button
          onClick={clearSearch}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 mt-1 max-h-80 overflow-y-auto">
          {isSearching ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500 mx-auto"></div>
              <p className="mt-2 text-sm">Searching...</p>
            </div>
          ) : suggestions.length > 0 ? (
            suggestions.map((product) => (
              <div
                key={product.id}
                className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 flex items-center gap-3 transition-colors"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSuggestionClick(product);
                }}
              >
                <Image
                  src={(product.image || '/placeholder.jpg').trim()}
                  alt={product.name}
                  width={40}
                  height={40}
                  className="rounded object-cover flex-shrink-0"
                  unoptimized
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{product.name}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-green-600">
                      ₹{product.price}
                    </span>
                    {product.originalPrice && (
                      <span className="text-xs text-gray-400 line-through">
                        ₹{product.originalPrice}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{product.brand}</p>
                </div>
              </div>
            ))
          ) : searchQuery.trim() && (
            <div className="p-4 text-center text-gray-500">
              <p className="text-sm">No products found</p>
            </div>
          )}
        </div>
      )}
    </form>
  );
}

function MobileNav() {
  const { cart } = useCart();
  const { logout, user } = useAuth();
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleLogout = () => {
    logout();
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="sm:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64">
        <div className="flex flex-col space-y-4 mt-8">
          <Link href="/" className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100">
            <TrendingUp className="h-5 w-5 text-red-500" />
            <span>Dashboard</span>
          </Link>
          <Link href="/orders" className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100">
            <Box className="h-5 w-5" />
            <span>Orders</span>
          </Link>
          <Link href="/shipping" className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100">
            <Truck className="h-5 w-5" />
            <span>Shipping</span>
          </Link>
          <Link href="/banking" className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100">
            <Wallet className="h-5 w-5" />
            <span>Banking</span>
          </Link>
          <Link href="/cart" className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100">
            <ShoppingCart className="h-5 w-5" />
            <span>Cart {totalItems > 0 && `(${totalItems})`}</span>
          </Link>
          <Link href="/recharge" className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100">
            <Wallet className="h-5 w-5" />
            <span>Recharge</span>
          </Link>
          <Link href="/settings" className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100">
            <MoreHorizontal className="h-5 w-5" />
            <span>Settings</span>
          </Link>
          <button onClick={handleLogout} className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100 text-left">
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function CategoryNavbar() {
  const { setSearchQuery } = useSearch();
  
  const categories = [
    'VIEW ALL',
    'Accessories',
    'Automotive', 
    'Baby Care',
    'Bracelets',
    'Chocolates',
    'Electronics',
    'Face & Body Care',
    'Home & Kitchen',
    'Home Care'
  ];

  const handleCategoryClick = (category: string) => {
    if (category === 'VIEW ALL') {
      setSearchQuery('');
    } else {
      setSearchQuery(category);
    }
  };

  return (
    <div className="bg-white border-b px-4 sm:px-6 py-2">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryClick(category)}
            className="flex-shrink-0 px-3 py-1 text-xs sm:text-sm bg-gray-100 border rounded-full hover:bg-red-50 hover:border-red-200 transition-colors"
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}

function SubcategoryNavbar() {
  const [subcategories, setSubcategories] = React.useState<string[]>([]);
  const { setSearchQuery } = useSearch();

  React.useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        const response = await fetch('/api/products');
        const data = await response.json();
        const allProducts = data.products || [];
        
        const allSubcategories = allProducts
          .map((p: any) => p.subcategory)
          .filter(Boolean);
        
        const uniqueSubcategories = [...new Set(allSubcategories)].sort();
        setSubcategories(uniqueSubcategories.slice(0, 10));
      } catch (error) {
        console.error('Failed to fetch subcategories:', error);
      }
    };
    
    fetchSubcategories();
  }, []);

  const handleSubcategoryClick = (subcategory: string) => {
    setSearchQuery(subcategory);
  };

  return (
    <div className="bg-gray-50 border-b px-4 sm:px-6 py-2">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {subcategories.map((subcategory) => (
          <button
            key={subcategory}
            onClick={() => handleSubcategoryClick(subcategory)}
            className="flex-shrink-0 px-3 py-1 text-xs sm:text-sm bg-white border rounded-full hover:bg-red-50 hover:border-red-200 transition-colors"
          >
            {subcategory}
          </button>
        ))}
      </div>
    </div>
  );
}

function Header() {
  const { cart } = useCart();
  const { logout, user } = useAuth();
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-20 w-16 bg-white flex-col items-center py-4 space-y-6 hidden sm:flex">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/">
                <div className="p-2 bg-red-500 rounded-md">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Dashboard</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/">
                <Search className="h-6 w-6 text-gray-500" />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Search</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/orders">
                <Box className="h-6 w-6 text-gray-500" />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Orders</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/shipping">
                <Truck className="h-6 w-6 text-gray-500" />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Shipping</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/banking">
                <Wallet className="h-6 w-6 text-gray-500" />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Banking</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/cart" className="relative">
                <ShoppingCart className="h-6 w-6 text-gray-500" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {totalItems}
                  </span>
                )}
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Cart</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/settings">
                <MoreHorizontal className="h-6 w-6 text-gray-500" />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Settings</p>
            </TooltipContent>
          </Tooltip>

          <div className="mt-auto">
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={handleLogout}>
                  <LogOut className="h-6 w-6 text-gray-500" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Logout</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </aside>

      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <MobileNav />
            <Link href="/">
              <h1 className="text-xl sm:text-2xl font-bold text-red-600">Shopwave</h1>
            </Link>
          </div>
          
          <div className="hidden md:flex flex-1 justify-center max-w-md mx-4">
            <SearchBox />
          </div>
          
          <div className="flex items-center space-x-2">
            <Link href="/cart" className="relative sm:hidden">
              <ShoppingCart className="h-6 w-6" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </Link>
            
            <div className="hidden sm:flex items-center space-x-2">
              <span className="hidden lg:inline text-sm">+91 93115-25609</span>
              <Button asChild variant="outline" size="sm" className="hidden lg:inline-flex">
                <Link href="/recharge">
                  <Wallet className="mr-2 h-4 w-4" />
                  Recharge
                </Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <span className="hidden sm:inline">{user?.name || 'User'}</span>
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Bell className="h-5 w-5" />
            </div>
          </div>
        </div>
        
        <div className="md:hidden px-4 pb-4">
          <SearchBox />
        </div>
      </header>
      
      <CategoryNavbar />
    </>
  );
}

function StoreLayoutContent({ children }: { children: React.ReactNode }) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchResults, setSearchResults] = React.useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
  const { isLoggedIn } = useAuth();

  React.useEffect(() => {
    const searchProducts = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        setSelectedProduct(null);
        return;
      }
      try {
        const response = await fetch(`/api/products`);
        const data = await response.json();
        const allProducts = data.products || [];
        
        const filtered = allProducts.filter((product: any) => 
          product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category?.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setSearchResults(filtered);
      } catch (error) {
        console.error('Search failed:', error);
        setSearchResults([]);
      }
    };
    
    searchProducts();
  }, [searchQuery]);

  if (!isLoggedIn) {
    return <LoginForm />;
  }

  return (
    <SearchContext.Provider value={{ searchQuery, setSearchQuery, searchResults, selectedProduct, setSelectedProduct }}>
      <div className="flex min-h-screen bg-gray-100">
        <div className="flex flex-col flex-1 sm:pl-16">
          <Header />
          <main className="flex-1 p-4 sm:p-6">
             {children}
          </main>
        </div>
      </div>
    </SearchContext.Provider>
  );
}


export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <CartProvider>
        <StoreLayoutContent>{children}</StoreLayoutContent>
      </CartProvider>
    </AuthProvider>
  );
}
