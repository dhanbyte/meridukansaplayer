
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
  Plus,
  Minus,
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";


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

  const addToCart = (product: Product) => {
    setCart((prevCart) => [...prevCart, product]);
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter(item => item.id !== productId));
  };


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
                return React.cloneElement(child, { addToCart } as { addToCart: (product: Product) => void; });
              }
              return child;
            })}
        </main>

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
          <SheetContent className="max-w-4xl w-full">
            <SheetHeader>
              <SheetTitle>Your Cart ({cart.length} items)</SheetTitle>
            </SheetHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
              {/* Left Column: Cart Items */}
              <div className="space-y-4">
                {cart.length === 0 ? (
                  <p>Your cart is empty.</p>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="border-b pb-4">
                      <div className="flex items-center space-x-4">
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={80}
                          height={80}
                          className="rounded-md"
                        />
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold">{item.name}</h4>
                          <div className="flex items-center mt-2">
                            <Button size="icon" variant="outline" className="h-8 w-8">
                              <Minus className="h-4 w-4" />
                            </Button>
                            <Input
                              type="number"
                              value={1}
                              readOnly
                              className="w-12 text-center mx-2 h-8"
                            />
                            <Button size="icon" variant="outline" className="h-8 w-8">
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <Button variant="link" className="p-0 h-auto text-red-500 mt-2 text-xs" onClick={() => removeFromCart(item.id)}>
                            Remove
                          </Button>
                        </div>
                        <p className="text-sm font-semibold">
                          Item Price: {item.price.currency}
                          {item.price.discounted || item.price.original}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Right Column: Order Details */}
              <div className="space-y-6">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Shipping Address</h3>
                  <Button variant="destructive">Add New Address</Button>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Payment Method</h3>
                  <RadioGroup defaultValue="prepaid">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="prepaid" id="prepaid" />
                      <Label htmlFor="prepaid">Prepaid</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="cod" id="cod" />
                      <Label htmlFor="cod">Cash On Delivery</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Platform Order No</h3>
                  <Input placeholder="Platform Order No" />
                </div>
                <div className="border rounded-lg p-4 space-y-2">
                  <h3 className="font-semibold mb-2">Order Summary</h3>
                  <div className="flex justify-between text-sm">
                    <span>Sub Total (Item Cost):</span>
                    <span>₹{totalCartPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                    <span>Total (INR):</span>
                    <span>₹{totalCartPrice.toFixed(2)}</span>
                  </div>
                   <div className="flex justify-between items-center text-sm">
                    <Label htmlFor="selling-price">Selling Price Total (INR):</Label>
                    <Input id="selling-price" type="text" className="w-24 h-8" placeholder="₹" />
                  </div>
                   <div className="flex justify-between text-sm text-green-600 font-semibold">
                    <span>Profit:</span>
                    <span>₹{totalCartPrice.toFixed(2)}</span>
                  </div>
                </div>
                 <p className="text-xs text-muted-foreground">
                    Recommendation: GST for this order will be filed under B2C. To claim B2B GST credit, please update GSTIN and PAN details in your Profile.
                  </p>
                <Button className="w-full bg-slate-900 text-white hover:bg-slate-800">
                  Place Order
                </Button>
                 <Button variant="destructive" className="w-full">
                  Refer a friend
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
