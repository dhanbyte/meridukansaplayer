
"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { NEWARRIVALS_PRODUCTS } from "@/lib/products";
import type { Product } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Search, ShoppingCart, Wallet, ChevronDown } from "lucide-react";

export default function StoreHome() {
  const [cart, setCart] = React.useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const totalCartPrice = cart.reduce(
    (total, item) => total + (item.price.discounted || item.price.original),
    0
  );

  const addToCart = (product: Product) => {
    setCart((prevCart) => [...prevCart, product]);
  };

  const allProducts = NEWARRIVALS_PRODUCTS;

  const filteredProducts = allProducts.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
    <div className="flex-1 p-6">
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
      </div>
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
    </>
  );
}
