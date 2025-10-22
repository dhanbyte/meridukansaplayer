"use client";
import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function PartnerOrdersPage() {
  const [orders, setOrders] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading your orders...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Orders</CardTitle>
        <CardDescription>A list of your recent orders.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
               <TableRow>
                  <TableCell colSpan={5} className="text-center">You have not placed any orders yet.</TableCell>
               </TableRow>
            ) : (
            orders.map(order => (
              <TableRow key={order.id}>
                <TableCell>
                  <div className="font-medium">{order.customerName}</div>
                  <div className="text-sm text-muted-foreground">
                    {order.customerPhone}
                  </div>
                </TableCell>
                <TableCell>{order.productSku}</TableCell>
                <TableCell>
                   <Badge
                    variant={
                      order.status === 'Pending' ? 'secondary' :
                      order.status === 'Rejected' || order.status === 'Cancelled' ? 'destructive' :
                      'default'
                    }
                  >
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell>₹{order.amount}</TableCell>
                <TableCell>{new Date(order.orderDate).toLocaleDateString()}</TableCell>
              </TableRow>
            )))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
