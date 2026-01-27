"use client";
import * as React from "react";
import { useParams, useRouter } from "next/navigation";
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

export default function EditDraftOrderPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const orderId = params.id as string;

  const [loading, setLoading] = React.useState(true);
  const [customerName, setCustomerName] = React.useState("");
  const [customerPhone, setCustomerPhone] = React.useState("");
  const [shippingAddress, setShippingAddress] = React.useState("");
  const [productSku, setProductSku] = React.useState("");
  const [quantity, setQuantity] = React.useState(1);
  const [paymentMethod, setPaymentMethod] = React.useState("COD");
  const [amount, setAmount] = React.useState(0);

  React.useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`/api/orders?id=${orderId}`);
      const data = await response.json();
      
      if (data.orders && data.orders.length > 0) {
        const order = data.orders[0];
        
        if (order.status !== 'draft') {
          toast({
            variant: "destructive",
            title: "Cannot Edit",
            description: "Only draft orders can be edited.",
          });
          router.push("/partner/orders");
          return;
        }
        
        setCustomerName(order.customerName || '');
        setCustomerPhone(order.customerPhone || '');
        setShippingAddress(order.shippingAddress || '');
        setProductSku(order.productSku || '');
        setQuantity(order.quantity || 1);
        setPaymentMethod(order.paymentMethod || 'COD');
        setAmount(order.amount || order.totalAmount || 0);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load order details.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: orderId,
          customerName,
          customerPhone,
          shippingAddress,
          productSku,
          quantity,
          paymentMethod,
          amount,
        })
      });

      if (response.ok) {
        toast({
          title: "Order Updated",
          description: "Draft order has been updated successfully.",
        });
        router.push("/partner/orders");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update order');
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "There was an error updating the order.",
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center py-20">Loading order...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Draft Order</CardTitle>
        <CardDescription>
          Update order details. Only draft orders can be edited.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleUpdateOrder} className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="customer_name">Customer Name</Label>
            <Input 
              id="customer_name" 
              placeholder="John Doe" 
              value={customerName} 
              onChange={e => setCustomerName(e.target.value)} 
              required 
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="customer_phone">Customer Phone</Label>
            <Input 
              id="customer_phone" 
              placeholder="+91 98765 43210" 
              value={customerPhone} 
              onChange={e => setCustomerPhone(e.target.value)} 
              required 
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="shipping_address">Shipping Address</Label>
            <Textarea
              id="shipping_address"
              placeholder="123 Main St, City, State, PIN"
              value={shippingAddress}
              onChange={e => setShippingAddress(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="product_sku">Product SKU/Name</Label>
              <Input 
                id="product_sku" 
                placeholder="TSHIRT-BLK-L" 
                value={productSku} 
                onChange={e => setProductSku(e.target.value)} 
                required 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input 
                id="quantity" 
                type="number" 
                placeholder="1" 
                value={quantity} 
                onChange={e => setQuantity(Number(e.target.value))} 
                required 
                min="1"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="payment_method">Payment Method</Label>
              <Input 
                id="payment_method" 
                placeholder="e.g. COD" 
                value={paymentMethod} 
                onChange={e => setPaymentMethod(e.target.value)} 
                required 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount</Label>
              <Input 
                id="amount" 
                type="number" 
                placeholder="0.00" 
                value={amount} 
                onChange={e => setAmount(Number(e.target.value))} 
                required 
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <Button type="submit" className="flex-1">Update Order</Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.push("/partner/orders")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
