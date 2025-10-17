 
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
import { useAuth } from "@/lib/AuthContext";

function Header() {
  const { cart } = useCart();
  const { user, logout } = useAuth();
  const [newOrdersCount, setNewOrdersCount] = React.useState(0);
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  React.useEffect(() => {
    const savedCount = localStorage.getItem('newOrdersCount');
    if (savedCount) {
      setNewOrdersCount(parseInt(savedCount));
    }

    const handleStorageChange = () => {
      const updatedCount = localStorage.getItem('newOrdersCount');
      if (updatedCount) {
        setNewOrdersCount(parseInt(updatedCount));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const resetOrdersCount = () => {
    setNewOrdersCount(0);
    localStorage.setItem('newOrdersCount', '0');
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
              <Link href="/orders" onClick={resetOrdersCount} className="relative">
                <Box className="h-6 w-6 text-gray-500" />
                {newOrdersCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
                    {newOrdersCount > 9 ? '9+' : newOrdersCount}
                  </span>
                )}
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
                <Link href="/login">
                  <LogOut className="h-6 w-6 text-gray-500" />
                </Link>
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
            <Image
              src="https://wukusy.com/wp-content/uploads/2024/05/wukusy-logo.png"
              alt="Wukusy Logo"
              width={150}
              height={40}
              priority
            />
          </Link>
        </div>
        <div className="w-full sm:flex-1 flex justify-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search Products..."
              className="pl-10 w-full"
            />
          </div>
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
                Shopwave <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Select Store</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Bell className="h-6 w-6" />
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {user.name}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="outline">
              <Link href="/login">
                <User className="mr-2 h-4 w-4" />
                Login
              </Link>
            </Button>
          )}
        </div>
      </header>
    </>
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="flex flex-col flex-1 sm:pl-16">
        <Header />
        <main className="flex-1 p-6">
           {children}
        </main>
      </div>
    </div>
  );
}


export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <div className="flex min-h-screen bg-gray-100">
        <div className="flex flex-col flex-1 sm:pl-16">
          <Header />
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </CartProvider>
  );
}
