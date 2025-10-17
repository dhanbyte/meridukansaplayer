"use client";

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
import { Button } from "@/components/ui/button";
import { CreditCard, Users, Package, IndianRupee } from "lucide-react";
import { useCollection } from "@/firebase/use-collection";
import type { Order } from "@/lib/types";

export default function AdminOrdersPage() {
  const { data: orders, loading: ordersLoading } = useCollection<Order>("orders");
  const { data: partners, loading: partnersLoading } = useCollection("partners");

  const totalRevenue = orders
    .filter(order => order.status !== 'Rejected' && order.status !== 'Pending')
    .reduce((sum, order) => sum + order.amount, 0);

  const totalPartners = partners.length;
  const prepaidOrders = orders.filter(o => o.paymentMethod === 'Prepaid').length;
  const codOrders = orders.filter(o => o.paymentMethod === 'COD').length;

  if (ordersLoading || partnersLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Based on all accepted and shipped orders
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Partners</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPartners}</div>
            <p className="text-xs text-muted-foreground">
              Currently active partners
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prepaid Orders</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{prepaidOrders}</div>
            <p className="text-xs text-muted-foreground">
              Total number of prepaid transactions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">COD Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{codOrders}</div>
            <p className="text-xs text-muted-foreground">
              Total number of cash on delivery orders
            </p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
          <CardDescription>
            A list of all orders from all partners.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Partner</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tracking ID</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map(order => {
                const partner = partners.find(p => p.id === order.partnerId);
                return (
                  <TableRow key={order.id}>
                    <TableCell>{partner ? partner.name : 'N/A'}</TableCell>
                    <TableCell>
                      <div className="font-medium">{order.customerName}</div>
                      <div className="text-sm text-muted-foreground">
                        {order.customerPhone}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {order.shippingAddress}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          order.status === 'Pending' ? 'secondary' :
                            order.status === 'Rejected' ? 'destructive' :
                              'default'
                        }
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{order.trackingId || 'N/A'}</TableCell>
                    <TableCell>₹{order.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      {order.status === 'Pending' && (
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Accept</Button>
                          <Button variant="destructive" size="sm">Reject</Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
