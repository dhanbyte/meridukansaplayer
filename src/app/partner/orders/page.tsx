"use client";
import * as React from "react";
import Link from "next/link";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Edit, CheckCircle, Upload } from "lucide-react";

export default function PartnerOrdersPage() {
  const [orders, setOrders] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState("all");
  const { toast } = useToast();

  React.useEffect(() => {
    fetchOrders();
  }, [activeTab]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      // Get partner ID from localStorage
      const userStr = localStorage.getItem('user') || localStorage.getItem('currentUser');
      const currentUser = userStr ? JSON.parse(userStr) : null;
      const partnerId = currentUser?.id || currentUser?._id;
      
      let url = '/api/orders';
      const params = new URLSearchParams();
      
      if (partnerId) params.append('partnerId', partnerId);
      if (activeTab !== 'all') params.append('status', activeTab);
      
      if (params.toString()) url += `?${params.toString()}`;
      
      const response = await fetch(url);
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (orderId: string) => {
    // English-Only Validation
    const orderToApprove = orders.find((o: any) => o._id === orderId);
    if (orderToApprove) {
      const isEnglishOnly = (text: string) => /^[\x00-\x7F]*$/.test(text || '');
      if (!isEnglishOnly(orderToApprove.customerName) || !isEnglishOnly(orderToApprove.shippingAddress)) {
        toast({
          variant: "destructive",
          title: "English Only Allowed",
          description: "Customer name and address must be in English only. Please edit the order.",
        });
        return;
      }
    }

    try {
      const response = await fetch('/api/orders/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId })
      });

      if (response.ok) {
        toast({
          title: "Order Approved",
          description: "Order has been confirmed and sent to admin.",
        });
        fetchOrders();
      } else {
        throw new Error('Failed to approve order');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Approval Failed",
        description: "Could not approve the order. Please try again.",
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft': return 'outline';
      case 'confirmed': return 'secondary';
      case 'shipped': return 'default';
      case 'delivered': return 'default';
      case 'cancelled':
      case 'rto': return 'destructive';
      default: return 'secondary';
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center py-20">Loading your orders...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Orders</h1>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/partner/orders/bulk-import">
              <Upload className="mr-2 h-4 w-4" />
              Bulk Import
            </Link>
          </Button>
          <Button asChild>
            <Link href="/partner/orders/create">Create New Order</Link>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="draft">Draft</TabsTrigger>
          <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
          <TabsTrigger value="shipped">Shipped</TabsTrigger>
          <TabsTrigger value="delivered">Delivered</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          <TabsTrigger value="rto">RTO</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {activeTab === 'all' ? 'All Orders' : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Orders`}
              </CardTitle>
              <CardDescription>
                {activeTab === 'draft' && 'Review and approve your draft orders'}
                {activeTab === 'confirmed' && 'Orders confirmed and visible to admin'}
                {activeTab === 'shipped' && 'Orders that have been shipped'}
                {activeTab === 'delivered' && 'Successfully delivered orders'}
                {activeTab === 'cancelled' && 'Cancelled orders'}
                {activeTab === 'rto' && 'Return to origin orders'}
                {activeTab === 'all' && 'All your orders across all statuses'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order Number</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Pincode</TableHead>
                    <TableHead>Tracking ID</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No orders found in this category.
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders.map((order: any) => (
                      <TableRow key={order._id}>
                        <TableCell className="font-medium">
                          {order.orderNumber || order.orderId}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-sm">{order.customerName}</div>
                          <div className="text-xs text-blue-600 font-mono">{order.customerPhone}</div>
                          <div className="text-[10px] text-gray-500 truncate max-w-[150px]" title={order.shippingAddress}>
                            {order.shippingAddress || 'No address'}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[150px] truncate text-xs" title={order.productSku || order.items?.[0]?.productName}>
                          {order.productSku || order.items?.[0]?.productName || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(order.status)}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>₹{order.amount || order.totalAmount}</TableCell>
                        <TableCell className="text-xs font-mono">{order.pincode || '-'}</TableCell>
                        <TableCell>
                          {order.trackingId ? (
                            <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                              {order.trackingId}
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {order.status === 'draft' && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  asChild
                                >
                                  <Link href={`/partner/orders/edit/${order._id}`}>
                                    <Edit className="h-4 w-4 mr-1" />
                                    Edit
                                  </Link>
                                </Button>
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => handleApprove(order._id)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                              </>
                            )}
                            {order.status !== 'draft' && (
                              <span className="text-sm text-muted-foreground">-</span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
