"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { ShoppingCart, RefreshCcw, Edit, Send } from 'lucide-react';

interface ShopifyOrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  sku: string;
}

interface ShopifyOrder {
  id: string;
  shopify_order_id: string;
  partner_id: string;
  customer_name: string;
  customer_phone: string;
  shipping_address: string;
  items: ShopifyOrderItem[];
  total_amount: number;
  status: string;
  created_at: string;
}

export default function ShopifySyncPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [shopUrl, setShopUrl] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [orders, setOrders] = useState<ShopifyOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<ShopifyOrder | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPreviewOrders();
      const partnerId = user.id || user._id;
      const savedUrl = localStorage.getItem(`shopify_url_${partnerId}`);
      const savedToken = localStorage.getItem(`shopify_token_${partnerId}`);
      if (savedUrl) setShopUrl(savedUrl);
      if (savedToken) setAccessToken(savedToken);
    }
  }, [user]);

  const fetchPreviewOrders = async () => {
    try {
      setLoading(true);
      const partnerId = user.id || user._id;
      const response = await fetch(`/api/shopify/orders?partnerId=${partnerId}`);
      const data = await response.json();
      if (data.orders) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    if (!shopUrl || !accessToken) {
      toast({
        title: "Error",
        description: "Please provide store URL and access token.",
        variant: "destructive"
      });
      return;
    }

    try {
      setFetching(true);
      const partnerId = user.id || user._id;
      const partnerName = user.name || user.username || 'Partner';
      
      localStorage.setItem(`shopify_url_${partnerId}`, shopUrl);
      localStorage.setItem(`shopify_token_${partnerId}`, accessToken);

      const response = await fetch('/api/shopify/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopUrl, accessToken, partnerId, partnerName })
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Success",
          description: `Synced ${data.count} orders from Shopify.`,
        });
        fetchPreviewOrders();
      } else {
        toast({
          title: "Sync Failed",
          description: data.error || "Unknown error occurred",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect to Shopify.",
        variant: "destructive"
      });
    } finally {
      setFetching(false);
    }
  };

  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
      const response = await fetch('/api/shopify/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedOrder.id,
          updates: {
            customer_name: selectedOrder.customer_name,
            customer_phone: selectedOrder.customer_phone,
            shipping_address: selectedOrder.shipping_address,
          }
        })
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Order updated successfully.",
        });
        setEditDialogOpen(false);
        fetchPreviewOrders();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update order.",
        variant: "destructive"
      });
    }
  };

  const handlePushOrders = async (orderIds: string[]) => {
    try {
      const response = await fetch('/api/shopify/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderIds })
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Orders pushed to pending successfully.",
        });
        fetchPreviewOrders();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to push orders.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Shopify Order Sync</h1>
        <div className="flex gap-2">
           <Button variant="outline" onClick={fetchPreviewOrders} disabled={loading}>
            <RefreshCcw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Shopify Credentials</CardTitle>
          <CardDescription>Enter your Shopify store details to fetch orders.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="shopUrl">Store URL (e.g. your-store.myshopify.com)</Label>
              <Input 
                id="shopUrl" 
                placeholder="your-store.myshopify.com" 
                value={shopUrl}
                onChange={(e) => setShopUrl(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accessToken">Admin API Access Token</Label>
              <Input 
                id="accessToken" 
                type="password"
                placeholder="shpat_..." 
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
              />
            </div>
          </div>
          <Button onClick={handleSync} disabled={fetching} className="w-full md:w-auto">
            {fetching ? <RefreshCcw className="mr-2 h-4 w-4 animate-spin" /> : <ShoppingCart className="mr-2 h-4 w-4" />}
            Fetch Orders
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preview Orders</CardTitle>
          <CardDescription>Orders fetched from Shopify. Review and edit before pushing to the system.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-10">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground font-medium">No preview orders found. Fetch from Shopify to see them here.</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Shopify ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">#{order.shopify_order_id}</TableCell>
                      <TableCell>
                        <div className="font-semibold">{order.customer_name}</div>
                        <div className="text-xs text-muted-foreground">{order.customer_phone}</div>
                      </TableCell>
                      <TableCell>₹{order.total_amount}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                          Preview
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                           <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              setSelectedOrder(order);
                              setEditDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4 mr-1" /> Edit
                          </Button>
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => handlePushOrders([order.id])}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Send className="h-4 w-4 mr-1" /> Push
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="editName">Customer Name</Label>
                <Input 
                  id="editName" 
                  value={selectedOrder.customer_name}
                  onChange={(e) => setSelectedOrder({...selectedOrder, customer_name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editPhone">Customer Phone</Label>
                <Input 
                  id="editPhone" 
                  value={selectedOrder.customer_phone}
                  onChange={(e) => setSelectedOrder({...selectedOrder, customer_phone: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editAddress">Shipping Address</Label>
                <textarea 
                  id="editAddress"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={selectedOrder.shipping_address}
                  onChange={(e) => setSelectedOrder({...selectedOrder, shipping_address: e.target.value})}
                />
              </div>
              <div className="pt-2">
                <h4 className="font-semibold text-sm mb-2">Order Items</h4>
                <div className="bg-muted p-3 rounded-md space-y-2">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="text-sm flex justify-between">
                      <span>{item.product_name} x {item.quantity}</span>
                      <span>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateOrder}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
