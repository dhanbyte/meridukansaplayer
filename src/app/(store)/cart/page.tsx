
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
    <div className="container mx-auto px-4 sm:px-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Your Cart ({cart.reduce((acc, item) => acc + item.quantity, 0)} items)</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 py-4">
            {/* Left Column: Cart Items */}
            <div className="space-y-4">
            {cart.length === 0 ? (
                <p className="text-center py-8 text-gray-500">Your cart is empty.</p>
            ) : (
                cart.map((item) => (
                <div key={item.id} className="border-b pb-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                    <Image
                        src={item.image}
                        alt={item.name}
                        width={80}
                        height={80}
                        className="rounded-md w-16 h-16 sm:w-20 sm:h-20 object-cover"
                    />
                    <div className="flex-1 w-full">
                        <h4 className="text-sm sm:text-base font-semibold line-clamp-2">{item.name}</h4>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center">
                            <Button size="icon" variant="outline" className="h-7 w-7 sm:h-8 sm:w-8" onClick={() => decreaseQuantity(item.id)}>
                                <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                            <Input
                                type="number"
                                value={item.quantity}
                                readOnly
                                className="w-10 sm:w-12 text-center mx-1 sm:mx-2 h-7 sm:h-8 text-sm"
                            />
                            <Button size="icon" variant="outline" className="h-7 w-7 sm:h-8 sm:w-8" onClick={() => increaseQuantity(item.id)}>
                                <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                          </div>
                          <p className="text-sm sm:text-base font-semibold">
                              ₹{((item.price?.discounted || item.price?.original || item.price) * item.quantity).toFixed(2)}
                          </p>
                        </div>
                        <Button variant="link" className="p-0 h-auto text-red-500 mt-2 text-xs" onClick={() => removeFromCart(item.id)}>
                        Remove
                        </Button>
                    </div>
                    </div>
                </div>
                ))
            )}
            </div>

            {/* Right Column: Order Details */}
            <div className="space-y-4 sm:space-y-6">
            <div className="border rounded-lg p-3 sm:p-4">
                <h3 className="font-semibold mb-2 text-sm sm:text-base">Shipping Address</h3>
                {shippingInfo ? (
                    <div className="text-xs sm:text-sm">
                        <p className="font-medium">{shippingInfo.customerName}</p>
                        <p>{shippingInfo.customerPhone}</p>
                        <p className="text-muted-foreground break-words">{shippingInfo.address}</p>
                        <Button variant="link" className="p-0 h-auto mt-2 text-xs sm:text-sm" onClick={() => setIsAddressDialogOpen(true)}>Change Address</Button>
                    </div>
                ) : (
                    <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="destructive">Add New Address</Button>
                        </DialogTrigger>
                        <DialogContent className="w-[95vw] max-w-md">
                            <DialogHeader>
                                <DialogTitle className="text-base sm:text-lg">Add Shipping Address</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSaveAddress}>
                                <div className="grid gap-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-sm">Name</Label>
                                        <Input id="name" value={formName} onChange={e => setFormName(e.target.value)} placeholder="Full Name" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone" className="text-sm">Phone</Label>
                                        <Input id="phone" value={formPhone} onChange={e => setFormPhone(e.target.value)} placeholder="Phone Number" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="address" className="text-sm">Address</Label>
                                        <Textarea id="address" value={formAddress} onChange={e => setFormAddress(e.target.value)} placeholder="Full shipping address" required />
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
            <div className="border rounded-lg p-3 sm:p-4">
                <h3 className="font-semibold mb-2 text-sm sm:text-base">Payment Method</h3>
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
            <div className="border rounded-lg p-3 sm:p-4">
                <h3 className="font-semibold mb-2 text-sm sm:text-base">Platform Order No</h3>
                <Input placeholder="Platform Order No" className="text-sm" />
            </div>
            <div className="border rounded-lg p-3 sm:p-4 space-y-2">
                <h3 className="font-semibold mb-2 text-sm sm:text-base">Order Summary</h3>
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
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-sm">
                <Label htmlFor="selling-price" className="text-xs sm:text-sm">Selling Price Total (INR):</Label>
                <Input id="selling-price" type="text" className="w-full sm:w-24 h-8 text-sm" placeholder="₹" value={sellingPrice} onChange={e => setSellingPrice(e.target.value)} />
                </div>
                <div className="flex justify-between text-sm text-green-600 font-semibold">
                <span>Profit:</span>
                <span>₹{profit.toFixed(2)}</span>
                </div>
            </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                Recommendation: GST for this order will be filed under B2C. To claim B2B GST credit, please update GSTIN and PAN details in your Profile.
                </p>
            <Button className="w-full bg-slate-900 text-white hover:bg-slate-800 text-sm sm:text-base py-2 sm:py-3" onClick={handlePlaceOrder}>
                Place Order
            </Button>
                <Button variant="destructive" className="w-full text-sm sm:text-base py-2 sm:py-3">
                Refer a friend
                </Button>
            </div>
        </div>
    </div>
  );
}
