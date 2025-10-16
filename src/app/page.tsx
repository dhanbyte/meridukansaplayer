"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
import Image from "next/image";
import { NEWARRIVALS_PRODUCTS } from "@/lib/products";
import type { Product } from "@/lib/types";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function StoreHome() {
  const [cart, setCart] = React.useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");

  const addToCart = (product: Product) => {
    setCart((prevCart) => [...prevCart, product]);
  };

  const totalCartPrice = cart.reduce(
    (total, item) => total + (item.price.discounted || item.price.original),
    0
  );

  const filteredProducts = NEWARRIVALS_PRODUCTS.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-16 bg-white flex-col items-center py-4 space-y-6 hidden sm:flex">
        <div className="p-2 bg-red-500 rounded-md">
          <Search className="h-6 w-6 text-white" />
        </div>
        <Landmark className="h-6 w-6 text-gray-500" />
        <Box className="h-6 w-6 text-gray-500" />
        <Truck className="h-6 w-6 text-gray-500" />
        <FileText className="h-6 w-6 text-gray-500" />
        <div className="relative">
          <Bookmark className="h-6 w-6 text-gray-500" />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
            1
          </span>
        </div>
        <PlaySquare className="h-6 w-6 text-gray-500" />
        <MoreHorizontal className="h-6 w-6 text-gray-500" />
        <div className="mt-auto">
          <LogOut className="h-6 w-6 text-gray-500" />
        </div>
      </aside>

      <main className="flex-1 p-6">
        <header className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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

        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Products</h2>
            <Button variant="link">VIEW ALL</Button>
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
                    onClick={() => addToCart(product)}
                  >
                    Add to Cart
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
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
      </main>
    </div>
  );
}
