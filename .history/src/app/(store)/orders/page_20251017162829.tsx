"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Order } from "@/lib/types";
import AuthGuard from "@/components/AuthGuard";
// ...existing code...
  productName: string;
  quantity: number;
  amount: number;
  status: string;
  createdAt: string;
  trackingId?: string;
}

export default function OrdersPage() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
>>>>>>> 23c24c9dd41422d73d913593340c1d5dc983d8d0

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchOrders(parsedUser.id);
    }
    setLoading(false);
  }, []);

  const fetchOrders = async (userId: string) => {
    try {
      const response = await fetch(`/api/orders/user?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch orders"
      });
    }
  };
<<<<<<< HEAD
  
  const isLoading = loading;
=======

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Please login to access this page.</div>;
  }
>>>>>>> 23c24c9dd41422d73d913593340c1d5dc983d8d0

  return (
    <AuthGuard>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">My Orders</h1>
        </div>

<<<<<<< HEAD
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
                   <TableRow key={order._id || order.id}>
                    <TableCell><Input type="checkbox" /></TableCell>
                    <TableCell>{(order._id || order.id)?.toString().slice(0, 8)}...</TableCell>
                    <TableCell>N/A</TableCell>
                    <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>{order.productSku}</TableCell>
                    <TableCell>{order.paymentMethod}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                     <TableCell>
                      <Badge variant={
                        order.status === "Pending" ? "secondary" : 
                        order.status === "Cancelled" || order.status === "Rejected" ? "destructive" :
                        order.status === "Accepted" ? "default" :
                        "outline"
                      }>
                        {order.status === "Accepted" ? "Approved" : order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">...</Button>
                    </TableCell>
=======
        <Card>
          <CardHeader>
            <CardTitle>Order History</CardTitle>
            <CardDescription>
              Track your recent orders and their status.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No orders found.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Tracking ID</TableHead>
>>>>>>> 23c24c9dd41422d73d913593340c1d5dc983d8d0
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        {order.productName}
                      </TableCell>
                      <TableCell>{order.quantity}</TableCell>
                      <TableCell>₹{order.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            order.status === "Delivered"
                              ? "default"
                              : order.status === "Shipped"
                              ? "secondary"
                              : order.status === "Cancelled"
                              ? "destructive"
                              : "outline"
                          }
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {order.trackingId || "Not available"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
}