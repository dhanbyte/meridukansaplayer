
"use client";
import * as React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Minus, Plus } from "lucide-react";
import type { Order } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";
import { useCart } from "@/lib/CartContext";
import { useAuth } from "@/lib/AuthContext";

interface ShippingInfo {
  customerName: string;
  customerPhone: string;
  address: string;
}

export default function CartPage() {
  const { cart, removeFromCart, increaseQuantity, decreaseQuantity, clearCart, placeOrder, getTotalPrice } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = React.useState("prepaid");
  const [sellingPrice, setSellingPrice] = React.useState('');
  const [isAddressDialogOpen, setIsAddressDialogOpen] = React.useState(false);
  const [shippingInfo, setShippingInfo] = React.useState<ShippingInfo | null>(null);

  // State for the address form fields
  const [formName, setFormName] = React.useState("");
  const [formPhone, setFormPhone] = React.useState("");
  const [formAddress, setFormAddress] = React.useState("");

  const calculateDeliveryCharge = () => {
    let totalWeight = 0;
    let hasApiProducts = false;
    
    cart.forEach(item => {
      if (item.createdAt) { // API product
        hasApiProducts = true;
        totalWeight += (item.weight || 0) * item.quantity;
      }
    });
    
    if (!hasApiProducts) return 0; // Free delivery for JSON products
    
    const weightInKg = totalWeight / 1000;
    let baseCharge = 0;
    
    if (weightInKg < 0.5) baseCharge = 40; // Less than 500g gets ₹40
    else if (weightInKg >= 0.5 && weightInKg <= 1) baseCharge = 79;
    else if (weightInKg > 1 && weightInKg <= 2) baseCharge = 99;
    else if (weightInKg > 2 && weightInKg <= 3) baseCharge = 120;
    else if (weightInKg > 3 && weightInKg <= 4) baseCharge = 140;
    else if (weightInKg > 4 && weightInKg <= 5) baseCharge = 160;
    else if (weightInKg > 5 && weightInKg <= 10) baseCharge = 240;
    else baseCharge = 240; // Above 10kg
    
    // Add ₹25 for COD
    if (paymentMethod === 'cod') {
      return baseCharge + 25;
    }
    
    return baseCharge;
  };

  const calculateJsonProductDiscount = () => {
    let jsonProductTotal = 0;
    
    cart.forEach(item => {
      if (!item.createdAt) { // JSON product
        const price = item.price?.discounted || item.price?.original || item.price || 0;
        jsonProductTotal += price * item.quantity;
      }
    });
    
    // ₹25 discount for prepaid on JSON products
    if (paymentMethod === 'prepaid' && jsonProductTotal > 0) {
      return 25;
    }
    
    return 0;
  };

  const getTotalWeight = () => {
    return cart.reduce((total, item) => {
      if (item.createdAt) { // API product
        return total + ((item.weight || 0) * item.quantity);
      }
      return total;
    }, 0);
  };

  const totalCartPrice = getTotalPrice();
  const deliveryCharge = calculateDeliveryCharge();
  const prepaidDiscount = calculateJsonProductDiscount();
  const totalWeight = getTotalWeight();
  const finalTotal = totalCartPrice + deliveryCharge - prepaidDiscount;

  const profit = sellingPrice ? parseFloat(sellingPrice) - finalTotal : 0;

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formPhone || !formAddress) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill out all address fields.",
      });
      return;
    }
    setShippingInfo({
      customerName: formName,
      customerPhone: formPhone,
      address: formAddress,
    });
    setIsAddressDialogOpen(false);
    toast({
      title: "Address Saved",
      description: "Your shipping address has been updated.",
    });
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Not Logged In",
        description: "You need to be logged in to place an order.",
      });
      return;
    }
    if (cart.length === 0) {
      toast({
        variant: "destructive",
        title: "Empty Cart",
        description: "You cannot place an order with an empty cart.",
      });
      return;
    }
    if (!shippingInfo) {
      toast({
        variant: "destructive",
        title: "No Address",
        description: "Please add a shipping address before placing an order.",
      });
      return;
    }

    try {
      const orderData = {
        partnerId: user.id,
        partnerName: user.name,
        customerName: shippingInfo.customerName,
        customerPhone: shippingInfo.customerPhone,
        shippingAddress: shippingInfo.address,
        items: cart.map(item => ({
          productId: item.id,
          productName: item.name,
          productSku: item.sku || 'N/A',
          quantity: item.quantity,
          price: item.price?.discounted || item.price?.original || item.price,
          total: (item.price?.discounted || item.price?.original || item.price) * item.quantity
        })),
        paymentMethod: paymentMethod,
        totalAmount: finalTotal,
        deliveryCharge: deliveryCharge,
        sellingPrice: parseFloat(sellingPrice) || finalTotal,
        profit: profit
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        toast({
          title: "Order Placed!",
          description: "Your order has been successfully placed.",
        });

        clearCart();
        setSellingPrice('');
        setShippingInfo(null);
      } else {
        throw new Error('Failed to place order');
      }

    } catch (error) {
       console.error("Error placing order:", error);
       toast({
        variant: "destructive",
        title: "Order Failed",
        description: "There was an error placing your order. Please try again.",
      });
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
                        <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => decreaseQuantity(item.id)}>
                            <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                            type="number"
                            value={item.quantity}
                            readOnly
                            className="w-12 text-center mx-2 h-8"
                        />
                        <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => increaseQuantity(item.id)}>
                            <Plus className="h-4 w-4" />
                        </Button>
                        </div>
                        <Button variant="link" className="p-0 h-auto text-red-500 mt-2 text-xs" onClick={() => removeFromCart(item.id)}>
                        Remove
                        </Button>
                    </div>
                    <p className="text-sm font-semibold">
                        ₹{((item.price?.discounted || item.price?.original || item.price) * item.quantity).toFixed(2)}
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
                {shippingInfo ? (
                    <div className="text-sm">
                        <p className="font-medium">{shippingInfo.customerName}</p>
                        <p>{shippingInfo.customerPhone}</p>
                        <p className="text-muted-foreground">{shippingInfo.address}</p>
                        <Button variant="link" className="p-0 h-auto mt-2" onClick={() => setIsAddressDialogOpen(true)}>Change Address</Button>
                    </div>
                ) : (
                    <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="destructive">Add New Address</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add Shipping Address</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSaveAddress}>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="name" className="text-right">Name</Label>
                                        <Input id="name" value={formName} onChange={e => setFormName(e.target.value)} className="col-span-3" placeholder="Full Name" required />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="phone" className="text-right">Phone</Label>
                                        <Input id="phone" value={formPhone} onChange={e => setFormPhone(e.target.value)} className="col-span-3" placeholder="Phone Number" required />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="address" className="text-right">Address</Label>
                                        <Textarea id="address" value={formAddress} onChange={e => setFormAddress(e.target.value)} className="col-span-3" placeholder="Full shipping address" required />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button type="button" variant="secondary">Cancel</Button>
                                    </DialogClose>
                                    <Button type="submit">Save Address</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
            <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Payment Method</h3>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
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
                {totalWeight > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Total Weight:</span>
                    <span>{(totalWeight / 1000).toFixed(2)} kg</span>
                  </div>
                )}
                {deliveryCharge > 0 ? (
                  <div className="flex justify-between text-sm">
                    <span>Delivery Charge:</span>
                    <span>₹{deliveryCharge.toFixed(2)}</span>
                  </div>
                ) : (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Delivery:</span>
                    <span>FREE</span>
                  </div>
                )}
                {prepaidDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Prepaid Discount:</span>
                    <span>-₹{prepaidDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                <span>Total (INR):</span>
                <span>₹{finalTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                <Label htmlFor="selling-price">Selling Price Total (INR):</Label>
                <Input id="selling-price" type="text" className="w-24 h-8" placeholder="₹" value={sellingPrice} onChange={e => setSellingPrice(e.target.value)} />
                </div>
                <div className="flex justify-between text-sm text-green-600 font-semibold">
                <span>Profit:</span>
                <span>₹{profit.toFixed(2)}</span>
                </div>
            </div>
                <p className="text-xs text-muted-foreground">
                Recommendation: GST for this order will be filed under B2C. To claim B2B GST credit, please update GSTIN and PAN details in your Profile.
                </p>
            <Button className="w-full bg-slate-900 text-white hover:bg-slate-800" onClick={handlePlaceOrder}>
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
