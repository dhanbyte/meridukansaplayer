"use client";
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
  Wallet,
  Landmark,
  Box,
  Truck,
  FileText,
  Bookmark,
  PlaySquare,
  MoreHorizontal,
  LogOut,
  ChevronDown,
} from "lucide-react";
import Image from "next/image";
import { NEWARRIVALS_PRODUCTS } from "@/lib/products";
import type { Product } from "@/lib/types";

const categories = [
  { name: "Accessories", image: "https://picsum.photos/seed/1/100/100" },
  { name: "Automotive", image: "https://picsum.photos/seed/2/100/100" },
  { name: "Baby Care", image: "https://picsum.photos/seed/3/100/100" },
  { name: "Bracelets", image: "https://picsum.photos/seed/4/100/100" },
  { name: "Chocolates", image: "https://picsum.photos/seed/5/100/100" },
  { name: "Electronics", image: "https://picsum.photos/seed/6/100/100" },
  { name: "Face & Body Care", image: "https://picsum.photos/seed/7/100/100" },
];

export default function StoreHome() {
  const [cart, setCart] = React.useState<Product[]>([]);

  const addToCart = (product: Product) => {
    setCart((prevCart) => [...prevCart, product]);
  };

  const totalCartPrice = cart.reduce((total, item) => total + (item.price.discounted || item.price.original), 0);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-16 bg-white flex flex-col items-center py-4 space-y-6">
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
        <header className="flex items-center justify-between mb-6">
          <div className="w-1/3">
            <Image
              src="https://wukusy.com/wp-content/uploads/2024/05/wukusy-logo.png"
              alt="Wukusy Logo"
              width={150}
              height={40}
              priority
            />
          </div>
          <div className="w-1/3 flex">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search Orders & Products (e.g. DE124, Magic Book)"
                className="pl-10 w-full"
              />
            </div>
          </div>
          <div className="w-1/3 flex items-center justify-end space-x-4">
            <span>+91 93115-25609</span>
            <Button variant="destructive" className="bg-red-500">Support</Button>
            <Button variant="destructive" className="bg-red-500">Recharge Wallet</Button>
            <div className="flex items-center">
              <span>Select Store</span>
              <Button variant="ghost" size="icon">
                Shopwave <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
            <Bell className="h-6 w-6" />
            <User className="h-6 w-6" />
          </div>
        </header>

        <section className="mb-8">
          <div className="flex justify-around">
            {categories.map((category) => (
              <div key={category.name} className="flex flex-col items-center">
                <Image
                  src={category.image}
                  alt={category.name}
                  width={80}
                  height={80}
                  className="rounded-full object-cover"
                />
                <span className="mt-2 text-sm">{category.name}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <div className="flex items-center space-x-2">
            <span>Filter By Weight</span>
            {["0-500 GM", "500-1000 GM", "1000-2000 GM", "2000-3000 GM", "3000-4000 GM", "4000-10000 GM"].map(
              (weight) => (
                <Button key={weight} variant="outline" size="sm" className="bg-white">
                  {weight}
                </Button>
              )
            )}
          </div>
        </section>

        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">New Arrivals</h2>
            <Button variant="link">VIEW ALL</Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {NEWARRIVALS_PRODUCTS.map((product) => (
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
                  {product.price.discounted && (
                     <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                      {(
                        ((product.price.original - product.price.discounted) /
                          product.price.original) *
                        100
                      ).toFixed(0)}
                      % OFF
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-semibold truncate group-hover:whitespace-normal">
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
                   <Sheet>
                    <SheetTrigger asChild>
                       <Button className="w-full mt-4 bg-red-500 hover:bg-red-600" onClick={() => addToCart(product)}>
                        Add to Cart
                      </Button>
                    </SheetTrigger>
                  </Sheet>
                </div>
              </div>
            ))}
          </div>
        </section>
         <Sheet>
            <SheetTrigger asChild>
              <Button className="fixed bottom-10 right-10 rounded-full h-16 w-16 bg-red-500 hover:bg-red-600 shadow-lg">
                <ShoppingCart className="h-7 w-7"/>
                 {cart.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-white text-red-500 text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">{cart.length}</span>
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
                      <div key={`${item.id}-${index}`} className="flex items-center space-x-4">
                        <Image src={item.image} alt={item.name} width={64} height={64} className="rounded-md"/>
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold">{item.name}</h4>
                          <p className="text-sm text-gray-500">{item.price.currency}{item.price.discounted || item.price.original}</p>
                        </div>
                      </div>
                    ))}
                     <div className="border-t pt-4 mt-4">
                        <div className="flex justify-between font-bold">
                          <span>Total</span>
                          <span>₹{totalCartPrice.toFixed(2)}</span>
                        </div>
                        <Button className="w-full mt-4 bg-red-500 hover:bg-red-600">Checkout</Button>
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
