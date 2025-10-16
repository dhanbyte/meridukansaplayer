
"use client";
import * as React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Minus, Plus } from "lucide-react";
import type { Product } from "@/lib/types";

interface CartItem extends Product {
  quantity: number;
}

interface CartPageProps {
  cart?: CartItem[];
  removeFromCart?: (productId: string) => void;
  increaseQuantity?: (productId: string) => void;
  decreaseQuantity?: (productId: string) => void;
}

export default function CartPage({ cart = [], removeFromCart, increaseQuantity, decreaseQuantity }: CartPageProps) {

  const totalCartPrice = cart.reduce(
    (total, item) => total + (item.price.discounted || item.price.original) * item.quantity,
    0
  );

  const handleRemoveFromCart = (productId: string) => {
    if(removeFromCart) {
      removeFromCart(productId);
    }
  }

  const handleIncreaseQuantity = (productId: string) => {
    if (increaseQuantity) {
      increaseQuantity(productId);
    }
  };

  const handleDecreaseQuantity = (productId: string) => {
    if (decreaseQuantity) {
      decreaseQuantity(productId);
    }
  };


  return (
    <div className="container mx-auto">
        <h1 className="text-2xl font-bold mb-6">Your Cart ({cart.reduce((acc, item) => acc + item.quantity, 0)} items)</h1>
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
                        <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => handleDecreaseQuantity(item.id)}>
                            <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                            type="number"
                            value={item.quantity}
                            readOnly
                            className="w-12 text-center mx-2 h-8"
                        />
                        <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => handleIncreaseQuantity(item.id)}>
                            <Plus className="h-4 w-4" />
                        </Button>
                        </div>
                        <Button variant="link" className="p-0 h-auto text-red-500 mt-2 text-xs" onClick={() => handleRemoveFromCart(item.id)}>
                        Remove
                        </Button>
                    </div>
                    <p className="text-sm font-semibold">
                        {item.price.currency}
                        {((item.price.discounted || item.price.original) * item.quantity).toFixed(2)}
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
    </div>
  );
}
