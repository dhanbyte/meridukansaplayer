"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

export default function CreateOrderPage() {
  const { toast } = useToast();
  const router = useRouter();

  const [customerName, setCustomerName] = React.useState("");
  const [customerPhone, setCustomerPhone] = React.useState("");
  const [shippingAddress, setShippingAddress] = React.useState("");
  const [productSku, setProductSku] = React.useState("");
  const [quantity, setQuantity] = React.useState(1);
  const [paymentMethod, setPaymentMethod] = React.useState("COD");
  const [amount, setAmount] = React.useState(0);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const orderData = {
        customerName,
        customerPhone,
        shippingAddress,
        productSku,
        quantity,
        paymentMethod,
        amount,
        status: "Pending",
        orderDate: new Date().toISOString()
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        toast({
          title: "Order Submitted",
          description: "Your new order has been successfully created.",
        });
        router.push("/partner/orders");
      } else {
        throw new Error('Failed to create order');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Order Creation Failed",
        description: "There was an error creating the order. Please try again.",
      });
    }
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Order</CardTitle>
        <CardDescription>
          Fill out the form below to submit a new order.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmitOrder} className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="customer_name">Customer Name</Label>
            <Input id="customer_name" placeholder="John Doe" value={customerName} onChange={e => setCustomerName(e.target.value)} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="customer_phone">Customer Phone</Label>
            <Input id="customer_phone" placeholder="+1 234 567 890" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="shipping_address">Shipping Address</Label>
            <Textarea
              id="shipping_address"
              placeholder="123 Main St, Anytown, USA"
              value={shippingAddress}
              onChange={e => setShippingAddress(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="grid gap-2">
              <Label htmlFor="product_sku">Product SKU/Name</Label>
              <Input id="product_sku" placeholder="TSHIRT-BLK-L" value={productSku} onChange={e => setProductSku(e.target.value)} required />
            </div>
             <div className="grid gap-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input id="quantity" type="number" placeholder="1" value={quantity} onChange={e => setQuantity(Number(e.target.value))} required min="1"/>
            </div>
          </div>
           <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
                <Label htmlFor="payment_method">Payment Method</Label>
                <Input id="payment_method" placeholder="e.g. COD" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} required />
            </div>
             <div className="grid gap-2">
                <Label htmlFor="amount">Amount</Label>
                <Input id="amount" type="number" placeholder="0.00" value={amount} onChange={e => setAmount(Number(e.target.value))} required />
            </div>
           </div>
          
          <Button type="submit">Submit Order</Button>
        </form>
      </CardContent>
    </Card>
  );
}
