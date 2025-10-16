
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
  FileText,
  Bookmark,
  PlaySquare,
  MoreHorizontal,
  LogOut,
  ChevronDown,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { Product } from "@/lib/types";


export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cart, setCart] = React.useState<Product[]>([]);
  const totalCartPrice = cart.reduce(
    (total, item) => total + (item.price.discounted || item.price.original),
    0
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="fixed inset-y-0 left-0 z-20 w-16 bg-white flex-col items-center py-4 space-y-6 hidden sm:flex">
        <Link href="/">
          <div className="p-2 bg-red-500 rounded-md">
            <Search className="h-6 w-6 text-white" />
          </div>
        </Link>
        <Link href="/banking">
          <Landmark className="h-6 w-6 text-gray-500" />
        </Link>
        <Link href="/orders">
          <Box className="h-6 w-6 text-gray-500" />
        </Link>
        <Link href="/shipping">
          <Truck className="h-6 w-6 text-gray-500" />
        </Link>
        <Link href="/invoices">
          <FileText className="h-6 w-6 text-gray-500" />
        </Link>
        <Link href="/bookmarks">
          <div className="relative">
            <Bookmark className="h-6 w-6 text-gray-500" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              1
            </span>
          </div>
        </Link>
        <Link href="/tutorials">
          <PlaySquare className="h-6 w-6 text-gray-500" />
        </Link>
        <Link href="/settings">
          <MoreHorizontal className="h-6 w-6 text-gray-500" />
        </Link>
        <div className="mt-auto">
          <Link href="#">
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
            <Button variant="outline">
              <Wallet className="mr-2 h-4 w-4" />
              Recharge Wallet
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

        <main className="flex-1 p-6">{children}</main>

        <Sheet>
          <SheetTrigger asChild>
            <Button className="fixed bottom-10 right-10 rounded-full h-16 w-16 bg-red-500 hover:bg-red-600 shadow-lg">
              <ShoppingCart className="h-7 w-7" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-white text-red-500 text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {cart.length}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>My Cart</SheetTitle>
            </SheetHeader>
            <div className="py-4">
              {cart.length === 0 ? (
                <p>Your cart is empty.</p>
              ) : (
                <div className="space-y-4">
                  {cart.map((item, index) => (
                    <div
                      key={`${item.id}-${index}`}
                      className="flex items-center space-x-4"
                    >
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={64}
                        height={64}
                        className="rounded-md"
                      />
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold">{item.name}</h4>
                        <p className="text-sm text-gray-500">
                          {item.price.currency}
                          {item.price.discounted || item.price.original}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>₹{totalCartPrice.toFixed(2)}</span>
                    </div>
                    <Button className="w-full mt-4 bg-red-500 hover:bg-red-600">
                      Checkout
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
