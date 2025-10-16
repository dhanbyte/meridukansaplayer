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

export default function CreateOrderPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Order</CardTitle>
        <CardDescription>
          Fill out the form below to submit a new order.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="customer_name">Customer Name</Label>
            <Input id="customer_name" placeholder="John Doe" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="customer_phone">Customer Phone</Label>
            <Input id="customer_phone" placeholder="+1 234 567 890" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="shipping_address">Shipping Address</Label>
            <Textarea
              id="shipping_address"
              placeholder="123 Main St, Anytown, USA"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="grid gap-2">
              <Label htmlFor="product_sku">Product SKU/Name</Label>
              <Input id="product_sku" placeholder="TSHIRT-BLK-L" />
            </div>
             <div className="grid gap-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input id="quantity" type="number" placeholder="1" />
            </div>
          </div>
           <div className="grid gap-2">
            <Label htmlFor="payment_method">Payment Method</Label>
            <Input id="payment_method" placeholder="Online Transfer" />
          </div>
           <div className="grid gap-2">
            <Label htmlFor="payment_proof">Payment Proof (Image)</Label>
            <Input id="payment_proof" type="file" />
          </div>
          <Button type="submit">Submit Order</Button>
        </form>
      </CardContent>
    </Card>
  );
}
