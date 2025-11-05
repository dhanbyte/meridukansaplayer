
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
import { useAuth } from "@/lib/AuthContext";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";

interface Order {
  _id: string;
  orderId: string;
  partnerId: string;
  partnerName: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  items: Array<{
    productId: string;
    productName: string;
    productSku: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  paymentMethod: string;
  totalAmount: number;
  sellingPrice: number;
  profit: number;
  status: string;
  createdAt: string;
}

export default function OrdersPage() {
    const { toast } = useToast();
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadOrders();
    }, [user]);

    const loadOrders = async () => {
        try {
            const response = await fetch('/api/orders');
            const data = await response.json();
            
            if (data.orders && Array.isArray(data.orders)) {
                const userOrders = data.orders.filter((order: Order) => order.partnerId === user?.id);
                setOrders(userOrders);
            } else {
                setOrders([]);
            }
        } catch (error) {
            console.error('Error loading orders:', error);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

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
  
  const isLoading = loading;

  return (
    <div className="flex flex-col h-full px-2 sm:px-0">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-4">
        <h1 className="text-xl sm:text-2xl font-bold">Manage Orders</h1>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <div className="flex items-center space-x-2">
            <span className="text-sm">Auto Confirm Order</span>
            <Switch />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="text-xs sm:text-sm">Export Drafts</Button>
            <Button variant="destructive" size="sm" className="text-xs sm:text-sm">Import Confirm</Button>
            <Button variant="destructive" size="sm" className="text-xs sm:text-sm">Bulk Order</Button>
          </div>
        </div>
      </header>

      <div className="mb-4 sm:mb-6 overflow-x-auto">
        <Tabs defaultValue="draft">
          <TabsList className="flex-wrap h-auto p-1 gap-1">
            <TabsTrigger value="draft" className="text-xs sm:text-sm px-2 sm:px-3">Draft</TabsTrigger>
            <TabsTrigger value="confirmed" className="text-xs sm:text-sm px-2 sm:px-3">Confirmed</TabsTrigger>
            <TabsTrigger value="shipped" className="text-xs sm:text-sm px-2 sm:px-3">Shipped</TabsTrigger>
            <TabsTrigger value="closed" className="text-xs sm:text-sm px-2 sm:px-3">Closed</TabsTrigger>
            <TabsTrigger value="delivered" className="text-xs sm:text-sm px-2 sm:px-3">Delivered</TabsTrigger>
            <TabsTrigger value="cancelled" className="text-xs sm:text-sm px-2 sm:px-3">Cancelled</TabsTrigger>
            <TabsTrigger value="rto" className="text-xs sm:text-sm px-2 sm:px-3">RTO</TabsTrigger>
            <TabsTrigger value="all" className="text-xs sm:text-sm px-2 sm:px-3">All Orders</TabsTrigger>
            <TabsTrigger value="profit" className="text-xs sm:text-sm px-2 sm:px-3">Profit</TabsTrigger>
            <TabsTrigger value="upcoming" className="text-xs sm:text-sm px-2 sm:px-3">Upcoming</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
        <Input placeholder="Order Id, Customer" className="text-sm" />
        <Input type="date" placeholder="Select Date Range" className="text-sm" />
        <Select>
          <SelectTrigger className="w-full sm:w-[180px] text-sm">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="destructive" className="text-sm">
          <Search className="mr-2 h-4 w-4" /> Search
        </Button>
      </div>

      <div className="border rounded-lg flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"><Input type="checkbox" className="w-4 h-4" /></TableHead>
                <TableHead className="min-w-[100px] text-xs sm:text-sm">Wukusy Id</TableHead>
                <TableHead className="min-w-[100px] text-xs sm:text-sm">Order No</TableHead>
                <TableHead className="min-w-[100px] text-xs sm:text-sm">Order Date</TableHead>
                <TableHead className="min-w-[150px] text-xs sm:text-sm">Product Details</TableHead>
                <TableHead className="min-w-[80px] text-xs sm:text-sm">Payment</TableHead>
                <TableHead className="min-w-[120px] text-xs sm:text-sm">Customer Details</TableHead>
                <TableHead className="min-w-[80px] text-xs sm:text-sm">Status</TableHead>
                <TableHead className="min-w-[60px] text-xs sm:text-sm">Action</TableHead>
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
                   <TableRow key={order._id}>
                    <TableCell><Input type="checkbox" className="w-4 h-4" /></TableCell>
                    <TableCell className="text-xs sm:text-sm font-mono">{order.orderId}</TableCell>
                    <TableCell className="text-xs sm:text-sm">N/A</TableCell>
                    <TableCell className="text-xs sm:text-sm">{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-xs sm:text-sm max-w-[150px] truncate" title={order.items?.map(item => item.productName).join(', ') || 'No items'}>
                      {order.items?.map(item => item.productName).join(', ') || 'No items'}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm capitalize">{order.paymentMethod}</TableCell>
                    <TableCell className="text-xs sm:text-sm">{order.customerName}</TableCell>
                     <TableCell>
                      <Badge variant={
                        order.status === "pending" ? "secondary" : 
                        order.status === "cancelled" || order.status === "rejected" ? "destructive" :
                        "default"
                      } className="text-xs">
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" className="text-xs p-1">...</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      <footer className="mt-auto pt-4 sm:pt-6 text-center text-xs sm:text-sm text-gray-500">
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
          <Link href="#" className="hover:underline">Order Policy</Link>
          <Link href="#" className="hover:underline">Terms</Link>
          <Link href="#" className="hover:underline">Privacy</Link>
          <Link href="#" className="hover:underline">Grievance</Link>
          <Link href="#" className="hover:underline">Return Policy</Link>
          <Link href="#" className="hover:underline">Withdrawal</Link>
          <Link href="#" className="hover:underline">Shipping</Link>
          <Link href="#" className="hover:underline">FAQs</Link>
          <Link href="#" className="hover:underline">KYC</Link>
        </div>
      </footer>
       <Button variant="destructive" className="fixed bottom-4 right-4 sm:bottom-10 sm:right-32 rounded-full h-10 w-10 sm:h-12 sm:w-auto text-xs sm:text-sm" onClick={handleRefer}>
        <span className="hidden sm:inline">Refer a friend</span>
        <span className="sm:hidden">Refer</span>
      </Button>
    </div>
  );
}
