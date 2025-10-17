
"use client";
import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  ShoppingCart,
  User,
  Bell,
  Landmark,
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
import type { Product } from "@/lib/types";

interface CartItem extends Product {
  quantity: number;
}

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cart, setCart] = React.useState<CartItem[]>([]);
  
  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter(item => item.id !== productId));
  };

  const increaseQuantity = (productId: string) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQuantity = (productId: string) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      ).filter(item => item.quantity > 0)
    );
  };
  
  const clearCart = () => {
    setCart([]);
  }

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);


  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="fixed inset-y-0 left-0 z-20 w-16 bg-white flex-col items-center py-4 space-y-6 hidden sm:flex">
        <Link href="/">
          <div className="p-2 bg-red-500 rounded-md">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
        </Link>
        <Link href="/">
            <Search className="h-6 w-6 text-gray-500" />
        </Link>
        <Link href="/orders">
          <Box className="h-6 w-6 text-gray-500" />
        </Link>
        <Link href="/shipping">
          <Truck className="h-6 w-6 text-gray-500" />
        </Link>
        <Link href="/banking">
          <Wallet className="h-6 w-6 text-gray-500" />
        </Link>
        <Link href="/cart" className="relative">
            <ShoppingCart className="h-6 w-6 text-gray-500" />
            {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                {totalItems}
            </span>
            )}
        </Link>
        <Link href="/settings">
          <MoreHorizontal className="h-6 w-6 text-gray-500" />
        </Link>
        <div className="mt-auto">
          <Link href="/login">
            <LogOut className="h-6 w-6 text-gray-500" />
          </Link>
        </div>
      </aside>

      <div className="flex flex-col flex-1 sm:pl-16">
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
            <User className="h-6 w-6" />
          </div>
        </header>

        <main className="flex-1 p-6">
           {React.Children.map(children, (child) => {
              if (React.isValidElement(child)) {
                // Pass cart state and actions to child pages
                return React.cloneElement(child, { 
                  addToCart, 
                  cart,
                  removeFromCart,
                  increaseQuantity,
                  decreaseQuantity,
                  clearCart,
                 } as any);
              }
              return child;
            })}
        </main>
        
      </div>
    </div>
  );
}
