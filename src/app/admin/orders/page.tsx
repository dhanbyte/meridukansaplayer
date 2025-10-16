
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

// Mock data - this would typically come from an API
const mockOrders = [
  {
    id: "ORD001",
    partner: "Partner One",
    customer: {
      name: "Liam Johnson",
      email: "liam@example.com",
      phone: "123-456-7890",
      address: "123 Main St, Anytown, USA 12345",
    },
    status: "Pending",
    trackingId: "N/A",
    amount: 250.0,
    paymentMethod: "Prepaid",
  },
  {
    id: "ORD002",
    partner: "Partner Two",
    customer: {
      name: "Olivia Smith",
      email: "olivia@example.com",
      phone: "987-654-3210",
      address: "456 Oak Ave, Sometown, USA 54321",
    },
    status: "Accepted",
    trackingId: "SHP123456789",
    amount: 150.0,
    paymentMethod: "COD",
  },
  {
    id: "ORD003",
    partner: "Partner One",
    customer: {
      name: "Noah Williams",
      email: "noah@example.com",
      phone: "555-555-5555",
      address: "789 Pine Ln, Otherville, USA 67890",
    },
    status: "Shipped",
    trackingId: "SHP987654321",
    amount: 350.0,
    paymentMethod: "Prepaid",
  },
   {
    id: "ORD004",
    partner: "Partner Three",
    customer: {
      name: "Emma Brown",
      email: "emma@example.com",
      phone: "111-222-3333",
      address: "321 Cedar Rd, Newcity, USA 13579",
    },
    status: "Rejected",
    trackingId: "N/A",
    amount: 75.0,
    paymentMethod: "COD",
  },
];

const mockPartners = [
  { id: "P001", name: "Partner One" },
  { id: "P002", name: "Partner Two" },
  { id: "P003", name: "Partner Three" },
];


export default function AdminOrdersPage() {

  const totalRevenue = mockOrders
    .filter(order => order.status !== 'Rejected' && order.status !== 'Pending')
    .reduce((sum, order) => sum + order.amount, 0);
  
  const totalPartners = mockPartners.length;
  const prepaidOrders = mockOrders.filter(o => o.paymentMethod === 'Prepaid').length;
  const codOrders = mockOrders.filter(o => o.paymentMethod === 'COD').length;

  return (
    <div className="flex flex-col gap-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                    Total Revenue
                    </CardTitle>
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
                {mockOrders.map(order => (
                    <TableRow key={order.id}>
                        <TableCell>{order.partner}</TableCell>
                        <TableCell>
                            <div className="font-medium">{order.customer.name}</div>
                            <div className="text-sm text-muted-foreground">
                            {order.customer.email}
                            </div>
                             <div className="text-sm text-muted-foreground">
                            {order.customer.phone}
                            </div>
                            <div className="text-sm text-muted-foreground">
                            {order.customer.address}
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
                        <TableCell>{order.trackingId}</TableCell>
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
                ))}
            </TableBody>
            </Table>
        </CardContent>
        </Card>
    </div>
  );
}
