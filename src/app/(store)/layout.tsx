
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
  MessageSquare,
  Video
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
  SheetHeader,
  SheetTitle,
  SheetDescription
} from "@/components/ui/sheet";
import { CartProvider, useCart } from "@/lib/CartContext";
import type { Product } from "@/lib/types";
import { AuthProvider, useAuth } from "@/lib/AuthContext";
import { LoginForm } from "@/components/LoginForm";
import Footer from "@/components/Footer";

const SearchContext = React.createContext<{
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: Product[];
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
}>({ searchQuery: "", setSearchQuery: () => { }, searchResults: [], selectedProduct: null, setSelectedProduct: () => { } });

const useSearch = () => React.useContext(SearchContext);

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
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-navy mx-auto"></div>
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
                      ₹{typeof product.price === 'object' ? product.price.discounted || product.price.original : product.price}
                    </span>
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
        <SheetHeader>
          <SheetTitle className="text-left">Menu</SheetTitle>
          <SheetDescription className="sr-only">
            Navigation menu for store
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col space-y-4 mt-8">
          <Link href="/" className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100">
            <TrendingUp className="h-5 w-5 text-brand-navy" />
            <span>Dashboard</span>
          </Link>
          <Link href="/orders" className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100">
            <Box className="h-5 w-5" />
            <span>Orders</span>
          </Link>
          <Link href="/learning" className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100">
            <Video className="h-5 w-5" />
            <span>Learning</span>
          </Link>
          <Link href="/profile" className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100">
            <User className="h-5 w-5" />
            <span>My Profile</span>
          </Link>
          <Link href="/support" className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100">
            <MessageSquare className="h-5 w-5" />
            <span>Support</span>
          </Link>
          <Link href="https://shipbhai.com/" target="_blank" className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100">
            <Truck className="h-5 w-5 text-blue-600" />
            <span className="font-medium">Track Order</span>
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


function Header() {
  const { cart } = useCart();
  const { logout, user } = useAuth();
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleLogout = () => {
    logout();
  };

  return (
    <>


      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <MobileNav />
            <Link href="/">
              <h1 className="text-xl sm:text-2xl font-bold text-brand-navy">Shopwave</h1>
            </Link>
          </div>

          <div className="hidden md:flex flex-1 items-center justify-center space-x-6">
            <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-brand-navy hover:bg-gray-50 px-3 py-2 rounded-md transition-colors">
              <TrendingUp className="h-5 w-5" />
              <span className="font-medium">Dashboard</span>
            </Link>
            <Link href="/orders" className="flex items-center space-x-2 text-gray-600 hover:text-brand-navy hover:bg-gray-50 px-3 py-2 rounded-md transition-colors">
              <Box className="h-5 w-5" />
              <span className="font-medium">Orders</span>
            </Link>
            <Link href="/learning" className="flex items-center space-x-2 text-gray-600 hover:text-brand-navy hover:bg-gray-50 px-3 py-2 rounded-md transition-colors">
              <Video className="h-5 w-5" />
              <span className="font-medium">Learning</span>
            </Link>

            <Link href="/support" className="flex items-center space-x-2 text-gray-600 hover:text-brand-navy hover:bg-gray-50 px-3 py-2 rounded-md transition-colors">
              <MessageSquare className="h-5 w-5" />
              <span className="font-medium">Support</span>
            </Link>

            <Link href="https://shipbhai.com/" target="_blank" className="flex items-center space-x-2 text-gray-600 hover:text-brand-navy hover:bg-gray-50 px-3 py-2 rounded-md transition-colors">
              <Truck className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Track Order</span>
            </Link>
          </div>

          <div className="flex items-center space-x-2">

            <div className="hidden sm:flex items-center space-x-2">
              <Link href="/support" className="hidden lg:flex items-center space-x-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors mr-2">
                <MessageSquare className="h-4 w-4 text-blue-600 mr-2" />
                <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">Raise Ticket</span>
              </Link>
              <Button asChild variant="outline" size="sm" className="hidden lg:inline-flex">
                <Link href="/banking">
                  <Wallet className="mr-2 h-4 w-4" />
                  Banking
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
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="w-full cursor-pointer">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">Logout</DropdownMenuItem>
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

    </>
  );
}

function StoreLayoutContent({ children }: { children: React.ReactNode }) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchResults, setSearchResults] = React.useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
  const { isLoggedIn, isLoading } = useAuth();

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
          product.brand?.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setSearchResults(filtered);
      } catch (error) {
        console.error('Search failed:', error);
        setSearchResults([]);
      }
    };

    searchProducts();
  }, [searchQuery]);

  // Show loading spinner while checking auth status
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <LoginForm />;
  }

  return (
    <SearchContext.Provider value={{ searchQuery, setSearchQuery, searchResults, selectedProduct, setSelectedProduct }}>
      <div className="flex min-h-screen bg-gray-100">
        <div className="flex flex-col flex-1">
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
