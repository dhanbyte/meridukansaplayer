
"use client";
import * as React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Minus, Plus } from "lucide-react";
import type { Order } from "@/lib/types";
import { useUser } from "@/firebase/use-user";
import { useFirestore } from "@/firebase/provider";
import { addDoc, collection, serverTimestamp, doc, setDoc } from "firebase/firestore";
import { useToast } from "@/components/ui/use-toast";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { useCart } from "@/lib/CartContext";

export default function CartPage() {
  const { cart, removeFromCart, increaseQuantity, decreaseQuantity, clearCart } = useCart();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = React.useState("prepaid");
  const [sellingPrice, setSellingPrice] = React.useState('');

  const totalCartPrice = cart.reduce(
    (total, item) => total + (item.price.discounted || item.price.original) * item.quantity,
    0
  );

  const profit = sellingPrice ? parseFloat(sellingPrice) - totalCartPrice : 0;

  const handlePlaceOrder = async () => {
    if (!user || !firestore) {
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

    try {
      for (const item of cart) {
        const orderData: Omit<Order, 'id' | 'orderDate'> = {
          partnerId: user.uid,
          customerName: "New Customer", 
          customerPhone: "1234567890", 
          shippingAddress: "123 Main St", 
          productSku: item.sku || 'N/A',
          quantity: item.quantity,
          paymentMethod: paymentMethod,
          status: "Pending",
          amount: (item.price.discounted || item.price.original) * item.quantity,
        };
        const finalData = { ...orderData, orderDate: serverTimestamp() };
        
        const docRef = await addDoc(collection(firestore, "orders"), finalData);
        await setDoc(doc(firestore, "orders", docRef.id), { id: docRef.id }, { merge: true })
          .catch(async (err) => {
            const permissionError = new FirestorePermissionError({
              path: `orders/${docRef.id}`,
              operation: 'update',
              requestResourceData: { id: docRef.id }
            });
            errorEmitter.emit('permission-error', permissionError);
          });
      }

      toast({
        title: "Order Placed!",
        description: "Your order has been successfully placed.",
      });

      clearCart();
      setSellingPrice('');


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
                <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                <span>Total (INR):</span>
                <span>₹{totalCartPrice.toFixed(2)}</span>
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
