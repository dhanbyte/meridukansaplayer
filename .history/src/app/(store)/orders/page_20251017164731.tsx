
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import { useUser } from "@/firebase/use-user";
import { useCollection } from "@/firebase/use-collection";
import type { Order } from "@/lib/types";
import { where } from "firebase/firestore";
import { Badge } from "@/components/ui/badge";

export default function OrdersPage() {
    const { toast } = useToast();
    const { user, loading: userLoading } = useUser();
    const { data: orders, loading: ordersLoading } = useCollection<Order>(
        user ? `orders` : null,
        user ? where('partnerId', '==', user.uid) : null
    );

    const handleRefer = async () => {
    const shareData = {
      title: "Refer a friend",
      text: "mere share 9157499884",
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback for browsers that don't support the Web Share API
        await navigator.clipboard.writeText(shareData.text);
        toast({
          title: "Copied to clipboard",
          description: "Referral message copied to your clipboard.",
        });
      }
    } catch (err) {
      console.error("Error sharing:", err);
       toast({
          variant: "destructive",
          title: "Could not share",
          description: "Something went wrong while trying to share.",
        });
    }
  };
  
  const isLoading = userLoading || ordersLoading;

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Manage Orders</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span>Auto Confirm Order</span>
            <Switch />
          </div>
          <Button variant="outline">Export Drafts</Button>
          <Button variant="destructive">Import Confirm</Button>
          <Button variant="destructive">Bulk Order</Button>
        </div>
      </header>

      <Tabs defaultValue="draft" className="mb-6">
        <TabsList>
          <TabsTrigger value="draft">Draft</TabsTrigger>
          <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
          <TabsTrigger value="shipped">Shipped</TabsTrigger>
          <TabsTrigger value="closed">Closed</TabsTrigger>
          <TabsTrigger value="delivered">Delivered</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          <TabsTrigger value="rto">RTO</TabsTrigger>
          <TabsTrigger value="all">All Orders</TabsTrigger>
          <TabsTrigger value="profit">Profit</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming Estimate Profit</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex items-center space-x-4 mb-6">
        <Input placeholder="Order Id, Customer" className="max-w-xs" />
        <Input type="date" placeholder="Select Date Range" className="max-w-xs" />
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="destructive">
          <Search className="mr-2 h-4 w-4" /> Search
        </Button>
      </div>

      <div className="border rounded-lg flex-1 flex flex-col">
        <div className="flex-1">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead><Input type="checkbox" /></TableHead>
                <TableHead>Wukusy Id</TableHead>
                <TableHead>Order No</TableHead>
                <TableHead>Order Date</TableHead>
                <TableHead>Product Details</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Customer Details</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-10">Loading orders...</TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-10">
                    <p>You haven't placed any orders yet.</p>
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                   <TableRow key={order.id}>
                    <TableCell><Input type="checkbox" /></TableCell>
                    <TableCell>{order.id.slice(0, 8)}...</TableCell>
                    <TableCell>N/A</TableCell>
                    <TableCell>{order.orderDate?.toDate().toLocaleDateString()}</TableCell>
                    <TableCell>{order.productSku}</TableCell>
                    <TableCell>{order.paymentMethod}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                     <TableCell>
                      <Badge variant={
                        order.status === "Pending" ? "secondary" : 
                        order.status === "Cancelled" || order.status === "Rejected" ? "destructive" :
                        "default"
                      }>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">...</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      <footer className="mt-auto pt-6 text-center text-sm text-gray-500">
        <div className="flex justify-center space-x-4">
          <Link href="#" className="hover:underline">Order Cancellation Policy</Link>
          <Link href="#" className="hover:underline">Terms & Conditions</Link>
          <Link href="#" className="hover:underline">Privacy Policy</Link>
          <Link href="#" className="hover:underline">Grievance Redressal Policy</Link>
          <Link href="#" className="hover:underline">Return & Refund Policy</Link>
          <Link href="#" className="hover:underline">Withdrawal Policy</Link>
          <Link href="#" className="hover:underline">Shipping Policy</Link>
          <Link href="#" className="hover:underline">Product Description Policy</Link>
          <Link href="#" className="hover:underline">FAQs</Link>
          <Link href="#" className="hover:underline">KYC Policy</Link>
        </div>
      </footer>
       <Button variant="destructive" className="fixed bottom-10 right-32 rounded-full h-12" onClick={handleRefer}>
        Refer a friend
      </Button>
    </div>
  );
}
