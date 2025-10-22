
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
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      return data.products || [];
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

  const handleSuggestionClick = (product: Product) => {
    setSearchQuery(product.name);
    setSelectedProduct(product);
    setShowSuggestions(false);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setShowSuggestions(false);
    setSuggestions([]);
  };

  return (
    <div className="relative w-full max-w-md">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <Input
        type="text"
        placeholder="Search Products..."
        className="pl-10 pr-10 w-full"
        value={searchQuery}
        onChange={handleSearchChange}
        onFocus={() => searchQuery.trim() && setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
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
                onClick={() => handleSuggestionClick(product)}
              >
                <Image
                  src={product.image || '/placeholder.jpg'}
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

      <header className="sticky top-0 z-10 flex flex-col sm:flex-row items-center justify-between mb-6 gap-4 bg-white p-4 border-b">
        <div className="w-full sm:w-auto">
          <Link href="/">
            <h1 className="text-2xl font-bold text-red-600">Shopwave</h1>
          </Link>
        </div>
        <div className="w-full sm:flex-1 flex justify-center">
          <SearchBox />
        </div>
        <div className="w-full sm:w-auto flex items-center justify-center sm:justify-end space-x-2 sm:space-x-4">
          <span className="hidden md:inline">+91 93115-25609</span>
          <Button variant="destructive" className="bg-red-500">Support</Button>
          <Button asChild variant="outline">
            <Link href="/recharge">
              <Wallet className="mr-2 h-4 w-4" />
              Recharge Wallet
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost">
                {user?.name || 'User'} <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Bell className="h-6 w-6" />
          <User className="h-6 w-6" />
        </div>
      </header>
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
        return;
      }
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await response.json();
        setSearchResults(data.products || []);
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
          <main className="flex-1 p-6">
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
