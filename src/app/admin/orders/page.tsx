"use client";
import React, { useState, useEffect } from 'react';
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
import { CreditCard, Users, Package, IndianRupee, Search, Download, Filter, RefreshCw, AlertCircle, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import * as XLSX from "xlsx";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Clock } from "lucide-react";

interface Order {
  _id: string;
  orderId: string;
  orderNumber?: string;
  partnerId: string;
  partnerName: string;
  partnerEmail?: string;
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
  status: string;
  trackingId?: string;
  notes?: string;
  cancellation_reason?: string;
  createdAt: string;
}

export default function AdminOrdersPage() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [exportStatus, setExportStatus] = useState("all");
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [batchDate, setBatchDate] = useState(new Date().toISOString().split('T')[0]);

  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set());
  
  // Cancellation reason state
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);

  // Toggle single order selection
  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrderIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  // Toggle all visible orders selection (uses orders and applies filter)
  const toggleAllSelection = (ordersToSelect: Order[]) => {
    if (selectedOrderIds.size === ordersToSelect.length && ordersToSelect.length > 0) {
      setSelectedOrderIds(new Set());
    } else {
      setSelectedOrderIds(new Set(ordersToSelect.map(o => o._id)));
    }
  };

  // Extract pincode from address
  const extractPincode = (address: string): string => {
    if (!address) return '';
    const match = address.match(/\b(\d{6})\b/);
    return match ? match[1] : '';
  };

  // Generate Shipping Manifest CSV
  const generateShippingManifest = () => {
    const selectedOrders = orders.filter(o => selectedOrderIds.has(o._id));

    if (selectedOrders.length === 0) {
      toast({
        title: "No Orders Selected",
        description: "Please select orders to export",
        variant: "destructive"
      });
      return;
    }

    // Create CSV data with unique ship_order_id per vendor
    const rows: any[][] = [];

    // Headers
    rows.push([
      "ship_order_id",
      "awb_number",
      "order_date",
      "customer_name",
      "customer_phone",
      "shipping_address",
      "city",
      "state",
      "pincode",
      "product_name",
      "sku",
      "quantity",
      "payment_mode",
      "cod_amount",
      "weight_kg",
      "partner_name",
      "partner_id"
    ]);

    // Data rows
    selectedOrders.forEach(order => {
      // Generate unique ship_order_id: VENDORID_ORDERID
      const vendorPrefix = (order.partnerId || 'VND').toString().toUpperCase().slice(0, 8);
      const orderId = order.orderNumber || order.orderId || order._id;
      const shipOrderId = `${vendorPrefix}_${orderId}`;

      // Payment logic
      const isCOD = order.paymentMethod?.toLowerCase() === 'cod';
      const paymentMode = isCOD ? 'COD' : 'Prepaid';
      const codAmount = isCOD ? order.totalAmount?.toFixed(2) || '0' : '0';

      // Extract city/state from address (basic parsing)
      const addressParts = (order.shippingAddress || '').split(',').map(s => s.trim());
      const city = addressParts.length > 1 ? addressParts[addressParts.length - 2] : '';
      const state = addressParts.length > 0 ? addressParts[addressParts.length - 1] : '';
      const pincode = extractPincode(order.shippingAddress);

      // For each item in order
      order.items?.forEach((item, idx) => {
        rows.push([
          idx === 0 ? shipOrderId : '', // Only show ship_order_id for first item
          '', // AWB - blank for manual entry
          format(new Date(order.createdAt), 'dd/MM/yyyy'),
          order.customerName || '',
          order.customerPhone || '',
          order.shippingAddress || '',
          city,
          state,
          pincode,
          item.productName || '',
          item.productSku || '',
          item.quantity || 1,
          paymentMode,
          codAmount,
          '0.5', // Default weight
          order.partnerName || '',
          order.partnerId || ''
        ]);
      });
    });

    // Convert to CSV
    const csvContent = rows.map(row =>
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `shipping_manifest_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Manifest Downloaded",
      description: `Exported ${selectedOrders.length} orders to shipping manifest`,
    });

    // Clear selection
    setSelectedOrderIds(new Set());
  };

  useEffect(() => {
    loadOrders();
  }, []); // Remove activeTab dependency to prevent auto-refresh

  const loadOrders = async (statusOverride?: string) => {
    try {
      setLoading(true);
      const statusToUse = statusOverride || activeTab;
      
      const params = new URLSearchParams();
      params.append('excludeDraft', 'true');
      if (statusToUse !== 'all') {
        params.append('status', statusToUse);
      }
      
      const response = await fetch(`/api/orders?${params.toString()}`);
      const data = await response.json();

      if (data.orders && Array.isArray(data.orders)) {
        // Sort by createdAt descending (newest first)
        const sortedOrders = data.orders.sort((a: any, b: any) => 
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

  const exportOrders = async () => {
    try {
      if (filteredOrders.length === 0) {
        toast({
          title: "Nothing to Export",
          description: "No orders match your current filters.",
          variant: "destructive",
        });
        return;
      }

      const dataToExport = filteredOrders.map((order: any) => ({
        'Order ID': order.orderNumber || order.orderId,
        'Order Date': format(new Date(order.createdAt), 'dd/MM/yyyy'),
        'Partner Name': order.partnerName,
        'Partner Email': order.partnerEmail || '-',
        'Customer Name': order.customerName,
        'Customer Phone': order.customerPhone,
        'Pincode': order.pincode || '-',
        'City': order.city || '-',
        'State': order.state || '-',
        'Shipping Address': order.shippingAddress || '-',
        'Total Amount': '₹' + (order.totalAmount?.toFixed(2) || '0.00'),
        'Status': order.status,
        'Payment Method': order.paymentMethod || '-',
        'Tracking ID': order.trackingId || '-',
        'Items': (order.items || []).map((item: any) => (item.productName || 'Item') + ' x' + (item.quantity || 1)).join(', '),
      }));

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');

      // Auto-size columns
      const wscols = [
        { wch: 20 }, { wch: 15 }, { wch: 20 }, { wch: 30 },
        { wch: 20 }, { wch: 15 }, { wch: 12 }, { wch: 15 }, 
        { wch: 15 }, { wch: 50 }, { wch: 15 }, { wch: 15 },
        { wch: 15 }, { wch: 20 }, { wch: 60 }
      ];
      worksheet['!cols'] = wscols;

      // Add filters
      worksheet['!autofilter'] = { ref: 'A1:O' + (dataToExport.length + 1) };

      // Generate filename
      const today = new Date();
      let filename = 'Orders_Export_';
      if (exportStatus !== "all") {
        filename += exportStatus + '_';
      }
      filename += format(today, 'yyyyMMdd') + '.xlsx';

      XLSX.writeFile(workbook, filename);

      toast({
        title: "Export Successful",
        description: `Exported ${dataToExport.length} orders to ${filename}`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export orders",
        variant: "destructive",
      });
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    if (newStatus === 'cancelled') {
        setCancelOrderId(orderId);
        setCancelReason("");
        setIsCancelDialogOpen(true);
        return;
    }

    try {
      const response = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status: newStatus })
      });

      if (response.ok) {
        // Optimistic update
        setOrders(prevOrders => {
          // If we are in a specific tab and status changes, remove it
          if (activeTab !== 'all' && activeTab !== newStatus) {
            return prevOrders.filter(o => o._id !== orderId);
          }
          // Otherwise just update the status
          return prevOrders.map(o => 
            o._id === orderId ? { ...o, status: newStatus } : o
          );
        });

        toast({
          title: "Status Updated",
          description: `Order status changed to ${newStatus}`,
        });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update order status",
        variant: "destructive",
      });
    }
  };

  const submitCancellation = async () => {
    if (!cancelOrderId || !cancelReason.trim()) {
        toast({
            title: "Reason Required",
            description: "Please provide a reason for cancellation",
            variant: "destructive"
        });
        return;
    }

    setIsSubmittingCancel(true);
    try {
        const response = await fetch('/api/orders', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                id: cancelOrderId, 
                status: 'cancelled', 
                cancellationReason: cancelReason 
            })
        });

        if (response.ok) {
            setOrders(prevOrders => {
                if (activeTab !== 'all' && activeTab !== 'cancelled') {
                    return prevOrders.filter(o => o._id !== cancelOrderId);
                }
                return prevOrders.map(o => 
                    o._id === cancelOrderId ? { ...o, status: 'cancelled', cancellation_reason: cancelReason } : o
                );
            });

            toast({
                title: "Order Cancelled",
                description: "Order has been cancelled with reason",
            });
            setIsCancelDialogOpen(false);
            setCancelOrderId(null);
            setCancelReason("");
        } else {
            throw new Error("Failed to cancel");
        }
    } catch (error) {
        toast({
            title: "Error",
            description: "Could not cancel the order",
            variant: "destructive"
        });
    } finally {
        setIsSubmittingCancel(false);
    }
  };

  const handleConfirmOrder = async (orderId: string, trackingId?: string) => {
    try {
      const response = await fetch('/api/orders/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, trackingId })
      });

      const data = await response.json();

      if (response.ok) {
        // Optimistic update
        setOrders(prevOrders => {
          const newStatus = trackingId ? 'in_transit' : 'confirmed';
          
          // If we are in 'Confirmed' tab and moving to 'In Transit', remove it
          if (activeTab === 'confirmed' && newStatus === 'in_transit') {
            return prevOrders.filter(o => o._id !== orderId);
          }

          // If we are in 'Pending' tab and moving to 'Confirmed', remove it
          if (activeTab === 'pending' && newStatus === 'confirmed') {
            return prevOrders.filter(o => o._id !== orderId);
          }
          
          // Otherwise update locally
          return prevOrders.map(o => 
            o._id === orderId 
              ? { ...o, status: newStatus, trackingId: trackingId || o.trackingId } 
              : o
          );
        });

        toast({
          title: trackingId ? "Tracking Updated" : "Order Confirmed",
          description: data.message || "Order updated successfully",
        });
      } else {
        throw new Error(data.error || 'Failed to confirm order');
      }
    } catch (error: any) {
      console.error('Error confirming order:', error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to confirm order",
        variant: "destructive",
      });
    }
  };

  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    customerName: '',
    customerPhone: '',
    shippingAddress: '',
    totalAmount: '',
    notes: ''
  });

  const handleEditOrder = (order: Order) => {
    setEditOrder(order);
    setEditForm({
      customerName: order.customerName || '',
      customerPhone: order.customerPhone || '',
      shippingAddress: order.shippingAddress || '',
      totalAmount: order.totalAmount?.toString() || '0',
      notes: order.notes || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editOrder) return;

    const isEnglishOnly = (text: string) => /^[\x00-\x7F]*$/.test(text || '');

    if (!isEnglishOnly(editForm.customerName) || !isEnglishOnly(editForm.shippingAddress)) {
      toast({
        variant: "destructive",
        title: "English Only Allowed",
        description: "Customer name and address must be in English only. Regional languages are not supported.",
      });
      return;
    }

    try {
      const response = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editOrder._id,
          customerName: editForm.customerName,
          customerPhone: editForm.customerPhone,
          shippingAddress: editForm.shippingAddress,
          totalAmount: parseFloat(editForm.totalAmount) || 0,
          notes: editForm.notes
        })
      });

      if (response.ok) {
        toast({
          title: "Order Updated",
          description: "Order details have been saved successfully.",
        });
        setIsEditDialogOpen(false);
        loadOrders();
      } else {
        throw new Error('Failed to update order');
      }
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update order details.",
        variant: "destructive",
      });
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      (order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.customerName?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.customerPhone?.includes(searchQuery));

    let matchesDate = true;
    if (isBatchMode && batchDate) {
      const start = new Date(batchDate);
      start.setHours(12, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      
      const created = new Date(order.createdAt);
      matchesDate = created >= start && created < end;
    } else if (dateFilter) {
      matchesDate = new Date(order.createdAt).toLocaleDateString() === new Date(dateFilter).toLocaleDateString();
    }
    
    // Safety check for status if activeTab isn't 'all'
    const matchesStatus = activeTab === 'all' || order.status === activeTab;

    return matchesSearch && matchesDate && matchesStatus;
  });

  const handleTrackOrder = () => {
    window.open('https://www.shipbhai.com/', '_blank');
  };

  const totalRevenue = orders
    .filter(order => order.status === 'delivered')
    .reduce((sum, order) => sum + (order.totalAmount || 0), 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading Admin Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Stats Cards - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Delivered orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{orders.length}</div>
            <p className="text-xs text-muted-foreground">All orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{orders.filter(o => o.status === 'confirmed').length}</div>
            <p className="text-xs text-muted-foreground">Awaiting shipment</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{orders.filter(o => o.status === 'delivered').length}</div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Section - Responsive */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center bg-white p-4 rounded-lg shadow-sm border">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search Order No / Customer..."
            className="pl-10 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1.5 rounded-md border border-blue-100">
            <Clock className="h-4 w-4 text-blue-600" />
            <Label htmlFor="batch-mode" className="text-sm font-medium text-blue-800">12PM Batch</Label>
            <Switch 
              id="batch-mode" 
              checked={isBatchMode} 
              onCheckedChange={setIsBatchMode} 
            />
          </div>

          {isBatchMode ? (
            <Input
              type="date"
              className="w-[160px] h-9"
              value={batchDate}
              onChange={(e) => setBatchDate(e.target.value)}
            />
          ) : (
            <Input
              type="date"
              className="w-[160px] h-9"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          )}

          <Button
            onClick={() => loadOrders()}
            variant="outline"
            className="h-9 w-full sm:w-auto"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Tabs - Responsive */}
      <Tabs value={activeTab} onValueChange={(value) => {
        setActiveTab(value);
        loadOrders(value); // Pass the new value directly to avoid race condition
      }} className="w-full">
        <TabsList className="grid grid-cols-5 sm:grid-cols-9 w-full h-auto p-1">
          <TabsTrigger value="all" className="text-xs py-2 px-2 sm:px-3">All</TabsTrigger>
          <TabsTrigger value="confirmed" className="text-xs py-2 px-2 sm:px-3">Confirmed</TabsTrigger>
          <TabsTrigger value="in_transit" className="text-xs py-2 px-2 sm:px-3">In Transit</TabsTrigger>
          <TabsTrigger value="out_for_delivery" className="text-xs py-2 px-2 sm:px-3">OFD</TabsTrigger>
          <TabsTrigger value="delivered" className="text-xs py-2 px-2 sm:px-3">Delivered</TabsTrigger>
          <TabsTrigger value="cancelled" className="text-xs py-2 px-2 sm:px-3">Cancelled</TabsTrigger>
          <TabsTrigger value="rto" className="text-xs py-2 px-2 sm:px-3">RTO</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div>
                <CardTitle className="text-lg sm:text-xl">Manage Partner Orders</CardTitle>
                <CardDescription className="text-sm">
                  {activeTab === 'all' ? 'All orders waiting for processing' : `Viewing ${activeTab} orders`}
                </CardDescription>
              </div>
              {/* Export Section - Responsive */}
              <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center w-full sm:w-auto">
                <Button 
                  onClick={handleTrackOrder} 
                  variant="outline" 
                  size="sm" 
                  className="w-full sm:w-auto h-9"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Track Order
                </Button>
                <div className="flex flex-col sm:flex-row gap-2 items-center w-full sm:w-auto">
                  <Label htmlFor="export-status" className="text-sm whitespace-nowrap">Export:</Label>
                  <Select value={exportStatus} onValueChange={setExportStatus}>
                    <SelectTrigger className="w-full sm:w-[140px] h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="in_transit">In Transit</SelectItem>
                      <SelectItem value="out_for_delivery">Out For Delivery</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="rto">RTO</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={exportOrders} size="sm" className="w-full sm:w-auto h-9">
                  <Download className="h-3 w-3 mr-1" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Action Bar - Shows when orders are selected */}
              {selectedOrderIds.size > 0 && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-blue-800">
                      {selectedOrderIds.size} order(s) selected
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => setSelectedOrderIds(new Set())}
                    >
                      Clear
                    </Button>
                  </div>
                  <Button
                    onClick={generateShippingManifest}
                    className="bg-green-600 hover:bg-green-700 h-8"
                    size="sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Manifest (CSV)
                  </Button>
                </div>
              )}

              {/* Responsive Table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300"
                          checked={selectedOrderIds.size > 0 && selectedOrderIds.size === filteredOrders.length}
                          onChange={() => toggleAllSelection(filteredOrders)}
                        />
                      </TableHead>
                      <TableHead className="min-w-[120px]">Order Info</TableHead>
                      <TableHead className="min-w-[150px]">Customer & Partner</TableHead>
                      <TableHead className="min-w-[150px]">Items</TableHead>
                      <TableHead className="min-w-[100px]">Amount</TableHead>
                      <TableHead className="min-w-[80px]">Pincode</TableHead>
                      <TableHead className="min-w-[100px]">Status</TableHead>
                      <TableHead className="min-w-[120px]">Tracking</TableHead>
                      <TableHead className="min-w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                          No orders found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredOrders.map(order => (
                        <TableRow key={order._id} className={selectedOrderIds.has(order._id) ? 'bg-blue-50' : ''}>
                          <TableCell>
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-gray-300"
                              checked={selectedOrderIds.has(order._id)}
                              onChange={() => toggleOrderSelection(order._id)}
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-1">
                                <div className="font-bold text-[10px]">{order.orderNumber || order.orderId}</div>
                                {order.orderId?.startsWith('SHP-') && (
                                    <Badge variant="outline" className="text-[8px] h-4 px-1 bg-green-50 text-green-700 border-green-200">Shopify</Badge>
                                )}
                            </div>
                            <div className="text-xs text-blue-600">{order.customerPhone}</div>
                            <div className="text-[10px] text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-sm">{order.customerName}</div>
                            <div className="text-[10px] text-blue-600 font-semibold truncate max-w-[150px]">by {order.partnerName}</div>
                            <div className="text-[10px] text-gray-500 truncate max-w-[150px]" title={order.shippingAddress}>{order.shippingAddress}</div>
                            <div className="text-[10px] text-muted-foreground italic truncate max-w-[150px]">{order.partnerEmail}</div>
                          </TableCell>
                          <TableCell className="max-w-[150px]">
                            {order.items?.map((item, i) => (
                              <div key={i} className="text-xs truncate" title={item.productName}>{item.productName?.slice(0, 30)} <span className="text-blue-600 font-bold">x{item.quantity}</span></div>
                            )) || 'No items'}
                            {order.items && order.items.length > 0 && (
                              <div className="text-[10px] text-green-700 font-bold mt-1 bg-green-50 px-1 py-0.5 rounded inline-block">
                                Total Qty: {order.items.reduce((sum, item) => sum + (item.quantity || 1), 0)}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="font-bold text-sm">₹{order.totalAmount?.toFixed(2)}</TableCell>
                          <TableCell className="text-xs font-mono">{order.pincode || '-'}</TableCell>
                          <TableCell>
                            <Select
                              value={order.status}
                              onValueChange={(val) => handleStatusUpdate(order._id, val)}
                            >
                              <SelectTrigger className="w-[120px] h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="confirmed">Confirmed</SelectItem>
                                <SelectItem value="in_transit">In Transit</SelectItem>
                                <SelectItem value="out_for_delivery">Out For Delivery</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                <SelectItem value="rto">RTO</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            {['pending', 'confirmed'].includes(order.status) ? (
                              <div className="flex gap-1">
                                <Input
                                  placeholder="Tracking ID"
                                  defaultValue={order.trackingId || ''}
                                  className="h-8 text-xs w-[100px]"
                                  id={`tracking-${order._id}`}
                                />
                                <Button
                                  size="sm"
                                  className="h-8 text-xs bg-green-600 hover:bg-green-700"
                                  onClick={() => {
                                    const trackingInput = document.getElementById(`tracking-${order._id}`) as HTMLInputElement;
                                    handleConfirmOrder(order._id, trackingInput?.value || undefined);
                                  }}
                                >
                                  {order.status === 'pending' ? 'Confirm' : 'Update Tracking'}
                                </Button>
                              </div>
                            ) : (
                              <div className="text-sm font-mono">
                                {order.trackingId ? (
                                  <span className="bg-gray-100 px-2 py-1 rounded text-gray-800">
                                    {order.trackingId}
                                  </span>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {['pending', 'confirmed'].includes(order.status) && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 text-xs"
                                  onClick={() => handleEditOrder(order)}
                                >
                                  Edit
                                </Button>
                              )}
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(order)}>View</Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>Order Details</DialogTitle>
                                  </DialogHeader>
                                  {selectedOrder && (
                                    <div className="space-y-4">
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                          <h4 className="font-bold border-b pb-1">Partner Details</h4>
                                          <p className="text-sm">Name: {selectedOrder.partnerName}</p>
                                          <p className="text-xs text-gray-500">ID: {selectedOrder.partnerId}</p>
                                        </div>
                                        <div className="space-y-2">
                                          <h4 className="font-bold border-b pb-1">Customer Details</h4>
                                          <p className="text-sm">Name: {selectedOrder.customerName}</p>
                                          <p className="text-xs text-gray-500">Phone: {selectedOrder.customerPhone}</p>
                                          <p className="text-xs text-gray-500">Address: {selectedOrder.shippingAddress}</p>
                                        </div>
                                      </div>

                                      {selectedOrder.status === 'cancelled' && selectedOrder.cancellation_reason && (
                                        <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                                          <h4 className="text-sm font-bold text-red-700 flex items-center gap-2 mb-1">
                                            <AlertCircle className="h-4 w-4" />
                                            Cancellation Reason
                                          </h4>
                                          <p className="text-sm text-red-600">{selectedOrder.cancellation_reason}</p>
                                        </div>
                                      )}

                                      <div className="col-span-1 md:col-span-2">
                                        <h4 className="font-bold border-b pb-1 mb-2">Items</h4>
                                        <div className="space-y-2 max-h-40 overflow-y-auto">
                                          {selectedOrder.items?.map((item, idx) => (
                                            <div key={idx} className="flex justify-between text-sm border-b border-dashed pb-1">
                                              <span>{item.productName} x{item.quantity}</span>
                                              <span>₹{item.total?.toFixed(2)}</span>
                                            </div>
                                          ))}
                                        </div>
                                        <div className="text-right font-bold mt-2">
                                          Total: ₹{selectedOrder.totalAmount?.toFixed(2)}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Order Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md w-[95vw]">
          <DialogHeader>
            <DialogTitle>Edit Order</DialogTitle>
          </DialogHeader>
          {editOrder && (
            <form onSubmit={(e) => {
              e.preventDefault();
              handleSaveEdit();
            }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name</Label>
                <Input
                  id="customerName"
                  value={editForm.customerName}
                  onChange={(e) => setEditForm({ ...editForm, customerName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerPhone">Customer Phone</Label>
                <Input
                  id="customerPhone"
                  value={editForm.customerPhone}
                  onChange={(e) => setEditForm({ ...editForm, customerPhone: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shippingAddress">Shipping Address</Label>
                <Textarea
                  id="shippingAddress"
                  value={editForm.shippingAddress}
                  onChange={(e) => setEditForm({ ...editForm, shippingAddress: e.target.value })}
                  rows={3}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalAmount">Total Amount (₹)</Label>
                <Input
                  id="totalAmount"
                  type="number"
                  value={editForm.totalAmount}
                  onChange={(e) => setEditForm({ ...editForm, totalAmount: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Visible to User)</Label>
                <Textarea
                  id="notes"
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  rows={3}
                  placeholder="Add any important notes about this order..."
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancellation Reason Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent className="max-w-md w-[95vw]">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Cancel Order
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Reason for Cancellation</Label>
              <Select onValueChange={setCancelReason} value={cancelReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Customer call not picked">Customer call not picked</SelectItem>
                  <SelectItem value="Customer refused order">Customer refused order</SelectItem>
                  <SelectItem value="Out of stock">Out of stock</SelectItem>
                  <SelectItem value="Invalid address/phone">Invalid address/phone</SelectItem>
                  <SelectItem value="Duplicate order">Duplicate order</SelectItem>
                  <SelectItem value="Other (Specify below)">Other (Specify below)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Additional Notes</Label>
              <Textarea 
                placeholder="Type reason detail here..."
                value={cancelReason === 'Other (Specify below)' ? '' : cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
             <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>Close</Button>
             <Button 
               variant="destructive" 
               onClick={submitCancellation}
               disabled={isSubmittingCancel || !cancelReason}
             >
               {isSubmittingCancel ? "Cancelling..." : "Confirm Cancellation"}
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
