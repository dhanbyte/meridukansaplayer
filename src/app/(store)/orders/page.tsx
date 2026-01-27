
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Share, Upload, Trash2, CheckCircle, Edit, AlertCircle, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/AuthContext";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Order {
  _id: string;
  orderId: string;
  orderNumber?: string;
  partnerId: string;
  partnerName: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  pincode?: string;
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
  trackingId?: string;
  cancellation_reason?: string;
  createdAt: string;
}

export default function OrdersPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Create form states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createCustomerName, setCreateCustomerName] = useState("");
  const [createCustomerPhone, setCreateCustomerPhone] = useState("");
  const [createAddress, setCreateAddress] = useState("");
  const [createPincode, setCreatePincode] = useState("");
  const [createSellingPrice, setCreateSellingPrice] = useState("");
  const [createProductName, setCreateProductName] = useState("");
  const [createPaymentMethod, setCreatePaymentMethod] = useState("cod");
  const [createQty, setCreateQty] = useState("1");

  // Edit form states
  const [editSellingPrice, setEditSellingPrice] = useState("");
  const [editCustomerName, setEditCustomerName] = useState("");
  const [editCustomerPhone, setEditCustomerPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editPincode, setEditPincode] = useState("");

  const openViewModal = (order: Order) => {
    setSelectedOrder(order);
    setIsViewDialogOpen(true);
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      let url = '/api/orders';
      const params = new URLSearchParams();

      // Add partnerId to filter on server side
      const partnerId = user?.partnerId || user?.id || user?._id;
      if (partnerId) params.append('partnerId', partnerId);

      if (activeTab !== 'all') params.append('status', activeTab);

      if (params.toString()) url += `?${params.toString()}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.orders && Array.isArray(data.orders)) {
        // Filter by current partner
        const userOrders = data.orders.filter((order: Order) => order.partnerId === (user?.partnerId || user?.id || user?._id));
        // Sort by createdAt descending (newest first)
        const sortedOrders = userOrders.sort((a: Order, b: Order) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setOrders(sortedOrders);
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

  const handleDeleteDraft = async (orderId: string) => {
    if (!window.confirm("Delete this draft permanently?")) return;

    try {
      const response = await fetch('/api/orders', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId })
      });

      if (response.ok) {
        toast({
          title: "Draft deleted",
          description: "Draft order removed successfully.",
        });
        loadOrders();
      } else {
        throw new Error('Failed to delete draft');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: "Could not delete draft order.",
      });
    }
  };



  useEffect(() => {
    loadOrders();
  }, [user, activeTab]);

  const openEditModal = (order: Order) => {
    setEditOrder(order);
    setEditSellingPrice(order.sellingPrice?.toString() || "");
    setEditCustomerName(order.customerName || "");
    setEditCustomerPhone(order.customerPhone || "");
    setEditAddress(order.shippingAddress || "");
    setEditPincode(order.pincode || extractPincode(order.shippingAddress || ""));
    setIsEditDialogOpen(true);
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const isEnglishOnly = (text: string) => /^[\x00-\x7F]*$/.test(text || '');

    if (!isEnglishOnly(createCustomerName) || !isEnglishOnly(createAddress)) {
      toast({
        variant: "destructive",
        title: "English Only Allowed",
        description: "Customer name and address must be in English only. Hindi or other regional languages are not supported.",
      });
      return;
    }

    try {
      const sellingPriceNum = parseFloat(createSellingPrice);
      const qtyNum = parseInt(createQty);
      // For manual orders, we assume base price is 0 or user manages profit manually.
      // Currently setting cost price to 0 so profit = selling price.
      const price = 0; 
      const totalAmount = price * qtyNum;
      const profit = sellingPriceNum - totalAmount;

      const orderData = {
        partnerId: user.partnerId || user.id || user._id,
        partnerName: user.name || user.username || 'Partner',
        customerName: createCustomerName,
        customerPhone: createCustomerPhone,
        shippingAddress: createAddress,
        pincode: createPincode,
        items: [{
          productId: 'MANUAL_' + Date.now(),
          productName: createProductName,
          productSku: 'MANUAL',
          quantity: qtyNum,
          price: price, // Cost price 0
          total: totalAmount
        }],
        totalAmount: totalAmount,
        sellingPrice: sellingPriceNum,
        profit: profit, // Full selling price is profit since cost is 0
        paymentMethod: createPaymentMethod,
        status: 'draft',
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        toast({ title: "Order Created", description: "Saved as draft. Please approve to process." });
        setIsCreateDialogOpen(false);
        // Reset form
        setCreateProductName("");
        setCreatePaymentMethod("cod");
        setCreateCustomerName("");
        setCreateCustomerPhone("");
        setCreateAddress("");
        setCreatePincode("");
        setCreateSellingPrice("");
        setCreateQty("1");
        loadOrders();
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Failed", description: "Could not create order." });
    }
  };

  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editOrder) return;

    const isEnglishOnly = (text: string) => /^[\x00-\x7F]*$/.test(text || '');

    if (!isEnglishOnly(editCustomerName) || !isEnglishOnly(editAddress)) {
      toast({
        variant: "destructive",
        title: "English Only Allowed",
        description: "Customer name and address must be in English only. Hindi or other regional languages are not supported.",
      });
      return;
    }

    try {
      const sellingPriceNum = parseFloat(editSellingPrice);
      const profit = sellingPriceNum - editOrder.totalAmount;

      const response = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editOrder._id,
          customerName: editCustomerName,
          customerPhone: editCustomerPhone,
          shippingAddress: editAddress,
          pincode: editPincode,
          sellingPrice: sellingPriceNum,
          profit: profit
        })
      });

      if (response.ok) {
        toast({
          title: "Order Updated",
          description: "Order details have been saved.",
        });
        setIsEditDialogOpen(false);
        loadOrders();
      } else {
        throw new Error('Update failed');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Could not update order details.",
      });
    }
  };

  const handleApprove = async (orderId: string) => {
    // English-Only Validation
    const orderToApprove = orders.find(o => o._id === orderId);
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
      console.log('Approving order:', orderId); // Debug log

      const response = await fetch('/api/orders/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId })
      });

      const data = await response.json();
      console.log('Approve response:', data); // Debug log

      if (response.ok) {
        toast({
          title: "Order Submitted",
          description: "Order has been submitted for admin approval.",
        });
        loadOrders();
      } else {
        console.error('Approve failed:', data); // Debug log
        toast({
          variant: "destructive",
          title: "Approval Failed",
          description: data.error || "Could not approve the order. Please try again.",
        });
      }
    } catch (error) {
      console.error('Approve error:', error); // Debug log
      toast({
        variant: "destructive",
        title: "Approval Failed",
        description: "Network error. Please check your connection and try again.",
      });
    }
  };

  const handleRefer = () => {
    const websiteLink = "https://www.shopwave.social/dropshipping";
    const message = `Hi! 🚀 I'm using Shopwave for my dropshipping business and it's amazing. Join now and start your own business with zero investment! 💼✨\n\nCheck it out here: ${websiteLink}`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, '_blank');

    toast({
      title: "WhatsApp Opened",
      description: "Referral message ready to send!",
    });
  };

  // Extract pincode from address
  const extractPincode = (address: string): string => {
    if (!address) return '';

    // Look for 6-digit pincode pattern
    const pincodePattern = /\b(\d{6})\b/g;
    const matches = address.match(pincodePattern);

    if (matches && matches.length > 0) {
      return matches[matches.length - 1]; // Return the last 6-digit number found
    }

    return '';
  };


  return (
    <div className="flex flex-col h-full px-2 sm:px-0">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-4">
        <h1 className="text-xl sm:text-2xl font-bold">Manage Orders</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none" asChild>
            <Link href="/orders/bulk-import">
              <Upload className="h-4 w-4 mr-2" />
              Bulk Import
            </Link>
          </Button>
          <Button size="sm" className="flex-1 sm:flex-none" onClick={() => setIsCreateDialogOpen(true)}>
            Create New
          </Button>
        </div>
      </header>

      <div className="mb-4 sm:mb-6 overflow-x-auto">
        <Tabs defaultValue="all" value={activeTab || 'all'} onValueChange={(val) => {
          setActiveTab(val);
          // Trigger reload would happen via useEffect if we add dependency
        }}>
          <TabsList className="flex-wrap h-auto p-1 gap-1">
            <TabsTrigger value="all" className="text-xs sm:text-sm px-2 sm:px-3">All Orders</TabsTrigger>
            <TabsTrigger value="draft" className="text-xs sm:text-sm px-2 sm:px-3">Draft</TabsTrigger>
            <TabsTrigger value="confirmed" className="text-xs sm:text-sm px-2 sm:px-3">Confirmed</TabsTrigger>
            <TabsTrigger value="in_transit" className="text-xs sm:text-sm px-2 sm:px-3">In Transit</TabsTrigger>
            <TabsTrigger value="out_for_delivery" className="text-xs sm:text-sm px-2 sm:px-3">Out For Delivery</TabsTrigger>
            <TabsTrigger value="delivered" className="text-xs sm:text-sm px-2 sm:px-3">Delivered</TabsTrigger>
            <TabsTrigger value="cancelled" className="text-xs sm:text-sm px-2 sm:px-3">Cancelled</TabsTrigger>
            <TabsTrigger value="rto" className="text-xs sm:text-sm px-2 sm:px-3">RTO</TabsTrigger>
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
        {/* Desktop Table View */}
        <div className="hidden lg:block flex-1 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"><Input type="checkbox" className="w-4 h-4" /></TableHead>
                <TableHead className="min-w-[100px] text-sm">Order No</TableHead>
                <TableHead className="min-w-[100px] text-sm">Tracking ID</TableHead>
                <TableHead className="min-w-[100px] text-sm">Order Date</TableHead>
                <TableHead className="min-w-[150px] text-sm">Product Details</TableHead>
                <TableHead className="min-w-[80px] text-sm">Payment</TableHead>
                <TableHead className="min-w-[120px] text-sm">Customer Details</TableHead>
                <TableHead className="min-w-[80px] text-sm">Pincode</TableHead>
                <TableHead className="min-w-[80px] text-sm">Status</TableHead>
                <TableHead className="min-w-[60px] text-sm">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
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
                    <TableCell className="text-sm font-bold">{order.orderNumber || order.orderId}</TableCell>
                    <TableCell className="text-sm">
                      {order.trackingId ? (
                        <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200 font-mono">
                          {order.trackingId}
                        </span>
                      ) : '-'}
                    </TableCell>
                    <TableCell className="text-sm">{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-sm">
                      <div className="max-w-[150px] truncate font-medium" title={order.items?.map(item => item.productName).join(', ') || 'No items'}>
                        {order.items?.map(item => item.productName).join(', ') || 'No items'}
                      </div>
                      <div className="text-xs text-green-600 font-bold">₹{order.sellingPrice?.toFixed(2) || order.totalAmount?.toFixed(2)}</div>
                    </TableCell>
                    <TableCell className="text-sm capitalize">{order.paymentMethod}</TableCell>
                    <TableCell className="text-sm">
                      <div className="font-semibold">{order.customerName}</div>
                      <div className="text-xs text-blue-600 font-mono">{order.customerPhone}</div>
                      <div className="text-[10px] text-gray-500 leading-tight max-w-[150px] truncate" title={order.shippingAddress}>
                        {order.shippingAddress}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-mono">{order.pincode || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={
                        order.status === "draft" ? "outline" :
                          order.status === "confirmed" ? "secondary" :
                            order.status === "cancelled" || order.status === "rto" ? "destructive" :
                              order.status === "in_transit" ? "default" :
                                order.status === "out_for_delivery" ? "default" :
                                  "default"
                      } className="text-xs">
                        {order.status === 'in_transit' ? 'In Transit' : order.status === 'out_for_delivery' ? 'Out for Delivery' : order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {order.status === 'draft' ? (
                        <div className="flex gap-1">
                          <Button variant="outline" size="sm" className="h-7 px-2 text-[10px]" onClick={() => openEditModal(order)}>
                            <Edit className="h-3 w-3 mr-1" /> Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 text-[10px] text-red-600 border-red-200"
                            onClick={() => handleDeleteDraft(order._id)}
                          >
                            <Trash2 className="h-3 w-3 mr-1" /> Delete
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            className="h-7 px-2 text-[10px] bg-green-600 hover:bg-green-700 font-bold"
                            onClick={() => handleApprove(order._id)}
                          >
                            Approve Now
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-1">
                          <Button variant="outline" size="sm" className="h-7 px-2 text-[10px]" onClick={() => openViewModal(order)}>
                            View Details
                          </Button>
                          {(order.status === 'in_transit' && order.trackingId) || order.status === 'out_for_delivery' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2 text-[10px] bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const productName = order.items?.[0]?.productName?.slice(0, 50) || 'Your Order';
                                let message = '';
                                if (order.status === 'out_for_delivery') {
                                  message = `*Out for Delivery!*\n\nHello ${order.customerName},\n\nYour order (${productName}) will be delivered TODAY!\n\nPlease be available to receive it.\n\nThank you!`;
                                } else {
                                  message = `*Order Shipped!*\n\nHello ${order.customerName},\n\nYour order (${productName}) is on the way!\n\nTracking ID: ${order.trackingId}\n\nTrack here: https://shipbhai.com/\n\nThank you!`;
                                }
                                const phone = order.customerPhone?.replace(/\D/g, '');
                                const formattedPhone = phone?.startsWith('91') && phone.length === 12 ? phone : `91${phone?.slice(-10)}`;
                                window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, '_blank');
                              }}
                            >
                              <MessageCircle className="h-3 w-3 mr-1" /> Share
                            </Button>
                          ) : null}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden space-y-4 p-4">
          {loading ? (
            <div className="text-center py-10">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-10">
              <p>You haven't placed any orders yet.</p>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order._id} className="border rounded-lg p-4 space-y-3">
                {/* Order Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Input type="checkbox" className="w-4 h-4" />
                    <span className="font-bold text-sm">{order.orderNumber || order.orderId}</span>
                  </div>
                  <Badge variant={
                    order.status === "draft" ? "outline" :
                      order.status === "confirmed" ? "secondary" :
                        order.status === "cancelled" || order.status === "rto" ? "destructive" :
                          order.status === "in_transit" ? "default" :
                            order.status === "out_for_delivery" ? "default" :
                              "default"
                  } className="text-xs">
                    {order.status === 'in_transit' ? 'In Transit' : order.status === 'out_for_delivery' ? 'Out for Delivery' : order.status}
                  </Badge>
                </div>

                {/* Pincode */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Pincode:</span>
                  <span className="text-xs font-mono">{order.pincode || '-'}</span>
                </div>

                {/* Tracking ID */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Tracking ID:</span>
                  {order.trackingId ? (
                    <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200 font-mono text-xs">
                      {order.trackingId}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-500">-</span>
                  )}
                </div>

                {/* Order Date */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Order Date:</span>
                  <span className="text-xs">{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>

                {/* Product Details & Price */}
                <div className="flex justify-between items-start bg-gray-50/50 p-2 rounded border border-gray-100">
                  <div className="flex-1">
                    <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Product:</span>
                    <p className="text-xs mt-0.5 line-clamp-1 text-gray-800" title={order.items?.map(item => item.productName).join(', ')}>
                      {order.items?.map(item => item.productName).join(', ') || 'No items'}
                    </p>
                  </div>
                  <div className="text-right pl-2">
                    <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Price:</span>
                    <p className="text-xs mt-0.5 font-bold text-green-600 whitespace-nowrap">₹{order.sellingPrice?.toFixed(2) || order.totalAmount?.toFixed(2)}</p>
                  </div>
                </div>

                {/* Payment & Pincode Row */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Payment:</span>
                    <span className="text-xs capitalize font-medium">{order.paymentMethod}</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Pincode:</span>
                    <span className="text-xs font-mono font-medium">{order.pincode || '-'}</span>
                  </div>
                </div>

                {/* Customer Details & Address */}
                <div className="bg-blue-50/30 p-2 rounded border border-blue-100/50">
                  <span className="text-[10px] uppercase tracking-wider text-blue-600 font-bold">Customer Info:</span>
                  <div className="mt-1">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-bold text-gray-900">{order.customerName}</p>
                      <p className="text-xs text-blue-600 font-mono">{order.customerPhone}</p>
                    </div>
                    <div className="mt-1.5 p-2 bg-white rounded border border-blue-100 text-xs text-gray-600 leading-relaxed shadow-sm">
                      <span className="font-semibold text-gray-400 mr-1">Address:</span>
                      {order.shippingAddress}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {order.status === 'draft' && (
                  <div className="flex gap-2 pt-2 border-t">
                    <Button variant="outline" size="sm" className="flex-1 h-8 text-xs" onClick={() => openEditModal(order)}>
                      <Edit className="h-3 w-3 mr-1" /> Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-8 text-xs text-red-600 border-red-200"
                      onClick={() => handleDeleteDraft(order._id)}
                    >
                      <Trash2 className="h-3 w-3 mr-1" /> Delete
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1 h-8 text-xs bg-green-600 hover:bg-green-700 font-bold"
                      onClick={() => handleApprove(order._id)}
                    >
                      Approve
                    </Button>
                  </div>
                )}
                {order.status !== 'draft' && (
                  <div className="pt-2 border-t space-y-2">
                    <Button variant="outline" size="sm" className="w-full h-8 text-xs" onClick={() => openViewModal(order)}>
                      View Details
                    </Button>
                    {(order.status === 'in_transit' && order.trackingId) || order.status === 'out_for_delivery' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full h-8 text-xs bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const productName = order.items?.[0]?.productName?.slice(0, 50) || 'Your Order';
                          let message = '';
                          if (order.status === 'out_for_delivery') {
                            message = `*Out for Delivery!*\n\nHello ${order.customerName},\n\nYour order (${productName}) will be delivered TODAY!\n\nPlease be available to receive it.\n\nThank you!`;
                          } else {
                            message = `*Order Shipped!*\n\nHello ${order.customerName},\n\nYour order (${productName}) is on the way!\n\nTracking ID: ${order.trackingId}\n\nTrack here: https://shipbhai.com/\n\nThank you!`;
                          }
                          const phone = order.customerPhone?.replace(/\D/g, '');
                          const formattedPhone = phone?.startsWith('91') && phone.length === 12 ? phone : `91${phone?.slice(-10)}`;
                          window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, '_blank');
                        }}
                      >
                        <MessageCircle className="h-3 w-3 mr-1" /> Share on WhatsApp
                      </Button>
                    ) : null}
                  </div>
                )}
              </div>
            ))
          )}
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
      <Button variant="default" className="fixed bottom-4 right-4 sm:bottom-10 sm:right-32 shadow-lg bg-[#25D366] hover:bg-[#128C7E] text-white font-bold rounded-full px-6 flex items-center gap-2" onClick={handleRefer}>
        <Share className="h-4 w-4" />
        <span className="hidden sm:inline">Refer & Earn</span>
        <span className="sm:hidden">Refer</span>
      </Button>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md w-[95vw]">
          <DialogHeader>
            <DialogTitle>Edit Draft Order</DialogTitle>
          </DialogHeader>
          {editOrder && (
            <form onSubmit={handleUpdateOrder} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Customer Name</Label>
                <Input value={editCustomerName} onChange={e => setEditCustomerName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Customer Phone</Label>
                <Input value={editCustomerPhone} onChange={e => setEditCustomerPhone(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Shipping Address</Label>
                <Textarea
                  value={editAddress}
                  onChange={e => setEditAddress(e.target.value)}
                  required
                  placeholder="Enter full address with pincode..."
                />
              </div>
              <div className="space-y-2">
                <Label>Pincode</Label>
                <Input
                  value={editPincode}
                  onChange={(e) => setEditPincode(e.target.value)}
                  placeholder="Enter Pincode"
                />
              </div>
              <div className="space-y-2">
                <Label>Selling Price (₹)</Label>
                <Input
                  type="number"
                  value={editSellingPrice}
                  onChange={(e) => setEditSellingPrice(e.target.value)}
                  placeholder="Enter selling price"
                  required
                />
              </div>
              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Single Order</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateOrder} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Product Name</Label>
              <Input 
                value={createProductName} 
                onChange={e => setCreateProductName(e.target.value)} 
                placeholder="Type product name..."
                required 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input type="number" min="1" value={createQty} onChange={e => setCreateQty(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Selling Price (₹)</Label>
                <Input type="number" value={createSellingPrice} onChange={e => setCreateSellingPrice(e.target.value)} required placeholder="Customer price" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Payment Method</Label>
              <RadioGroup value={createPaymentMethod} onValueChange={setCreatePaymentMethod} className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cod" id="r-cod" />
                  <Label htmlFor="r-cod">COD</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="prepaid" id="r-prepaid" />
                  <Label htmlFor="r-prepaid">Prepaid</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Customer Name</Label>
              <Input value={createCustomerName} onChange={e => setCreateCustomerName(e.target.value)} required placeholder="Name" />
            </div>
            <div className="space-y-2">
              <Label>Customer Phone</Label>
              <Input value={createCustomerPhone} onChange={e => setCreateCustomerPhone(e.target.value)} required placeholder="Mobile number" />
            </div>
            <div className="space-y-2">
              <Label>Pincode</Label>
              <Input value={createPincode} onChange={e => setCreatePincode(e.target.value)} required placeholder="6 digit PIN" />
            </div>
            <div className="space-y-2">
              <Label>Shipping Address</Label>
              <Textarea value={createAddress} onChange={e => setCreateAddress(e.target.value)} required placeholder="Full address" />
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Create Order</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Order Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md w-[95vw]">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 py-2">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-sm text-gray-500">Status</span>
                <Badge variant={
                    selectedOrder.status === "cancelled" || selectedOrder.status === "rto" ? "destructive" : "default"
                }>
                    {selectedOrder.status.toUpperCase()}
                </Badge>
              </div>

              {selectedOrder.status === 'cancelled' && selectedOrder.cancellation_reason && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                  <h4 className="text-xs font-bold text-red-700 flex items-center gap-2 mb-1">
                    <AlertCircle className="h-3 w-3" />
                    Cancellation Reason
                  </h4>
                  <p className="text-sm text-red-600 font-medium">{selectedOrder.cancellation_reason}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Order ID</p>
                  <p className="text-sm font-mono">{selectedOrder.orderNumber || selectedOrder.orderId}</p>
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] text-gray-500 uppercase font-bold">Tracking ID</p>
                   <p className="text-sm font-mono">{selectedOrder.trackingId || '-'}</p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] text-gray-500 uppercase font-bold">Customer</p>
                <p className="text-sm font-semibold">{selectedOrder.customerName}</p>
                <p className="text-xs text-blue-600">{selectedOrder.customerPhone}</p>
              </div>

              <div className="space-y-1">
                 <p className="text-[10px] text-gray-500 uppercase font-bold">Address</p>
                 <p className="text-xs text-gray-700 leading-relaxed">{selectedOrder.shippingAddress}</p>
                 <p className="text-xs font-bold">PIN: {selectedOrder.pincode}</p>
              </div>

              <div className="border-t pt-2 mt-2">
                <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Items</p>
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-xs py-1">
                    <span>{item.productName} x{item.quantity}</span>
                    <span className="font-bold">₹{item.total?.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between border-t border-dashed pt-2 mt-2">
                <span className="text-sm font-bold">Total Amount</span>
                <span className="text-sm font-bold text-blue-600">₹{selectedOrder.totalAmount?.toFixed(2)}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" className="w-full" onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
