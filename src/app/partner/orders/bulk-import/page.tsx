"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/AuthContext";
import { ArrowLeft, Upload, FileText, CheckCircle2, AlertCircle, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import * as XLSX from 'xlsx';
import { useRouter } from 'next/navigation';

interface PreviewOrder {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  pincode: string;
  productName: string;
  quantity: number;
  costPrice: number;
  sellingPrice: number;
  items?: any[];
  isDuplicate?: boolean;
}

export default function PartnerBulkImportPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [previewOrders, setPreviewOrders] = useState<PreviewOrder[]>([]);
  const [existingOrderNumbers, setExistingOrderNumbers] = useState<Set<string>>(new Set());

  // State for editing Name and Address
  const [editingCell, setEditingCell] = useState<{ idx: number, field: 'customerName' | 'shippingAddress' } | null>(null);
  const [editCellValue, setEditCellValue] = useState('');

  // English-only validation helper
  const isEnglishOnly = (text: string) => /^[\x00-\x7F]*$/.test(text || '');

  // Update Name or Address
  const updateCell = (idx: number, field: 'customerName' | 'shippingAddress') => {
    const updatedOrders = [...previewOrders];
    updatedOrders[idx][field] = editCellValue.trim();
    setPreviewOrders(updatedOrders);
    setEditingCell(null);
    setEditCellValue('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    // Fetch existing order numbers for duplicate check
    let existingSet = new Set<string>();
    try {
      const resp = await fetch('/api/orders?status=all');
      const data = await resp.json();
      if (data.orders) {
        data.orders.forEach((o: any) => {
          if (o.orderNumber) existingSet.add(o.orderNumber.toString().toLowerCase());
          if (o.orderId) existingSet.add(o.orderId.toString().toLowerCase());
        });
        setExistingOrderNumbers(existingSet);
      }
    } catch (err) {
      console.error("Failed to fetch existing orders for duplicate check", err);
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

        if (jsonData.length === 0) {
          throw new Error("The file is empty.");
        }

        const orderMap = new Map<string, any>();

        jsonData.forEach((row) => {
          const id = (row['Name'] || row['Order ID'] || row['Order Number'] || '').toString();
          if (!id) return;

          if (!orderMap.has(id)) {
            const shippingAddress = [
              row['Shipping Address1'] || row['Address1'] || '',
              row['Shipping Address2'] || row['Address2'] || '',
              row['Shipping City'] || row['City'] || '',
              row['Shipping Province'] || row['Province'] || '',
              row['Shipping Country'] || row['Country'] || ''
            ].filter(Boolean).join(', ');

            orderMap.set(id, {
              orderNumber: id,
              customerName: row['Shipping Name'] || row['Customer Name'] || row['Billing Name'] || 'N/A',
              customerPhone: (row['Shipping Phone'] || row['Phone'] || row['Billing Phone'] || '').toString(),
              shippingAddress: shippingAddress || 'N/A',
              pincode: (row['Shipping Zip'] || row['Zip'] || row['Pincode'] || '').toString(),
              sellingPrice: parseFloat(row['Total'] || row['Selling Price'] || row['Amount'] || '0'),
              items: [],
              costPrice: 0
            });
          }

          const order = orderMap.get(id);
          const itemName = row['Lineitem name'] || row['Product Name'] || row['Item Name'] || 'Product';
          const itemQty = parseInt(row['Lineitem quantity'] || row['Quantity'] || row['Qty'] || '1');
          const itemPrice = parseFloat(row['Lineitem price'] || row['Price'] || row['Item Price'] || '0');

          order.items.push({
            productName: itemName,
            quantity: itemQty,
            price: itemPrice
          });
          
          if (order.items.length === 1 && !row['Total']) {
            order.sellingPrice = itemPrice * itemQty;
          }
        });

        const mapped = Array.from(orderMap.values()).map(order => ({
          ...order,
          productName: order.items[0]?.productName || 'Multiple Items',
          quantity: order.items.reduce((sum: number, i: any) => sum + i.quantity, 0),
          isDuplicate: existingSet.has(order.orderNumber.toString().toLowerCase()),
          costPrice: order.sellingPrice * 0.8
        }));

        setPreviewOrders(mapped);
        toast({
          title: "File Processed",
          description: `Found ${mapped.length} orders in the file.`,
        });
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error reading file",
          description: error.message || "Please upload a valid Shopify Excel/CSV file.",
        });
      } finally {
        setIsUploading(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const removeOrder = (index: number) => {
    setPreviewOrders(prev => prev.filter((_, i) => i !== index));
  };

  const handleImport = async () => {
    // Partner ID from AuthContext or LocalStorage fallback
    const userStr = localStorage.getItem('user') || localStorage.getItem('currentUser');
    const currentUser = userStr ? JSON.parse(userStr) : user;
    
    if (!currentUser) {
        toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "Please log in again to import orders.",
        });
        return;
    }

    setIsUploading(true);
    let successCount = 0;

    
    // Check all orders first
    const invalidOrders = previewOrders.filter(o => !isEnglishOnly(o.customerName) || !isEnglishOnly(o.shippingAddress));
    
    if (invalidOrders.length > 0) {
      toast({
        variant: "destructive",
        title: "English Only Allowed",
        description: `${invalidOrders.length} order(s) contain non-English characters in name or address. Please fix them before importing.`,
      });
      setIsUploading(false);
      return;
    }

    try {
      for (const order of previewOrders) {
        const orderData = {
          partnerId: currentUser.partnerId || currentUser.partner_id || currentUser.id || currentUser._id,
          partnerName: currentUser.name || currentUser.username || 'Partner',
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          shippingAddress: order.shippingAddress,
          pincode: order.pincode,
          items: (order.items || []).map((i: any) => ({
            productId: 'bulk-import',
            productName: i.productName,
            productSku: i.productName.substring(0, 10),
            quantity: i.quantity,
            price: i.price,
            total: i.price * i.quantity
          })),
          totalAmount: (order.items || []).reduce((sum: number, i: any) => sum + (i.price * i.quantity), 0),
          sellingPrice: order.sellingPrice,
          profit: order.sellingPrice - order.costPrice,
          paymentMethod: 'cod',
          status: 'draft',
        };

        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData)
        });

        if (response.ok) successCount++;
      }

      toast({
        title: "Import Complete",
        description: `Successfully imported ${successCount} orders as drafts.`,
      });
      
      router.push('/partner/orders');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Import Failed",
        description: "An error occurred while saving orders.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/partner/orders">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Partner Bulk Import</h1>
          <p className="text-muted-foreground text-sm">Upload Shopify CSV/Excel to import orders as drafts</p>
        </div>
      </div>

      {!previewOrders.length ? (
        <Card className="border-dashed border-2 bg-muted/30">
          <CardContent className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="bg-primary/10 p-4 rounded-full">
              <Upload className="h-10 w-10 text-primary" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold">Drop your Shopify file here</h3>
              <p className="text-sm text-muted-foreground mb-4">Support CSV, XLSX, and XLS formats</p>
              <Input
                type="file"
                accept=".csv, .xlsx, .xls"
                className="hidden"
                id="file-upload"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
              <Button asChild disabled={isUploading}>
                <label htmlFor="file-upload" className="cursor-pointer">
                  {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
                  Select File
                </label>
              </Button>
            </div>
            <div className="mt-4 p-4 bg-white/50 rounded-lg border text-xs text-muted-foreground w-full max-w-md">
              <p className="font-bold mb-1">Required Shopify Headers:</p>
              <p>Name, Shipping Name, Shipping Phone, Shipping Address1, Total, Lineitem name</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-blue-50 border-blue-100 border p-4 rounded-lg">
            <div className="flex items-center gap-2 text-blue-800">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-semibold">{previewOrders.length} Orders Ready to Import</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setPreviewOrders([])} disabled={isUploading}>
                Cancel
              </Button>
              <Button onClick={() => {
                const nonDuplicates = previewOrders.filter(o => !o.isDuplicate);
                if (nonDuplicates.length === 0) {
                  toast({ title: "No New Orders", description: "All orders are duplicates.", variant: "destructive" });
                  return;
                }
                setPreviewOrders(nonDuplicates);
                toast({ title: "Duplicates Removed", description: "Removed suspected duplicate orders." });
              }} variant="destructive" className="bg-orange-600 hover:bg-orange-700">
                Skip Duplicates
              </Button>
              <Button onClick={handleImport} disabled={isUploading} className="bg-green-600 hover:bg-green-700">
                {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Import {previewOrders.length} Orders
              </Button>
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden bg-white">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewOrders.map((order, idx) => (
                  <TableRow key={idx} className={order.isDuplicate ? 'bg-red-50' : ''}>
                    <TableCell className="font-bold relative">
                      {order.isDuplicate && (
                        <div className="absolute -top-1 -left-1">
                          <AlertCircle className="h-4 w-4 text-red-600 fill-white" />
                        </div>
                      )}
                      {order.orderNumber}
                      {order.isDuplicate && (
                        <span className="block text-[8px] text-red-600 font-bold">DUPLICATE</span>
                      )}
                    </TableCell>
                    <TableCell className="relative p-2 whitespace-nowrap">
                         {editingCell?.idx === idx && editingCell?.field === 'customerName' ? (
                            <div className="flex items-center gap-1">
                                <Input 
                                    value={editCellValue} 
                                    onChange={e => setEditCellValue(e.target.value)}
                                    className="h-8 text-xs min-w-[120px]"
                                    autoFocus
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') updateCell(idx, 'customerName');
                                        if (e.key === 'Escape') setEditingCell(null);
                                    }}
                                />
                                <Button size="sm" className="h-8 px-2 bg-green-600" onClick={() => updateCell(idx, 'customerName')}>✓</Button>
                            </div>
                        ) : (
                            <div 
                                onClick={() => { setEditingCell({ idx, field: 'customerName' }); setEditCellValue(order.customerName); }}
                                className={`cursor-pointer hover:bg-muted p-1 rounded min-h-[30px] flex items-center gap-2 ${!isEnglishOnly(order.customerName) ? 'bg-red-100 border border-red-300' : ''}`}
                            >
                                <span className="text-sm">{order.customerName}</span>
                                {!isEnglishOnly(order.customerName) && <AlertCircle className="h-3 w-3 text-red-600" />}
                                {!isEnglishOnly(order.customerName) && <span className="text-[10px] text-red-500 font-bold ml-1">Edit Hindi</span>}
                            </div>
                        )}
                    </TableCell>
                    <TableCell className="text-blue-600 font-mono text-xs">{order.customerPhone}</TableCell>
                    <TableCell className="max-w-[200px] p-2">
                         {editingCell?.idx === idx && editingCell?.field === 'shippingAddress' ? (
                            <div className="flex items-center gap-1">
                                <Input 
                                    value={editCellValue} 
                                    onChange={e => setEditCellValue(e.target.value)}
                                    className="h-8 text-xs min-w-[200px]"
                                    autoFocus
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') updateCell(idx, 'shippingAddress');
                                        if (e.key === 'Escape') setEditingCell(null);
                                    }}
                                />
                                <Button size="sm" className="h-8 px-2 bg-green-600" onClick={() => updateCell(idx, 'shippingAddress')}>✓</Button>
                            </div>
                        ) : (
                            <div 
                                onClick={() => { setEditingCell({ idx, field: 'shippingAddress' }); setEditCellValue(order.shippingAddress); }}
                                className={`cursor-pointer hover:bg-muted p-1 rounded text-xs leading-tight min-h-[30px] flex items-start gap-2 ${!isEnglishOnly(order.shippingAddress) ? 'bg-red-100 border border-red-300' : ''}`}
                                title={order.shippingAddress}
                            >
                                <span className={`${!isEnglishOnly(order.shippingAddress) ? 'line-clamp-none' : 'line-clamp-2'}`}>{order.shippingAddress} (PIN: {order.pincode})</span>
                                {!isEnglishOnly(order.shippingAddress) && <AlertCircle className="h-3 w-3 text-red-600 shrink-0 mt-0.5" />}
                            </div>
                        )}
                    </TableCell>
                    <TableCell className="text-xs">
                      {order.productName} {(order.items || []).length > 1 ? `(+${(order.items || []).length - 1} more)` : ''}
                    </TableCell>
                    <TableCell className="text-right font-bold text-green-600">
                      ₹{(order.sellingPrice || 0).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => removeOrder(idx)} className="h-8 w-8 text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <div className="p-4 border rounded-lg flex items-start gap-3">
          <div className="bg-orange-100 p-2 rounded text-orange-600">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm">Review Data</h4>
            <p className="text-xs text-muted-foreground">Confirm names and phone numbers before the final import.</p>
          </div>
        </div>
        <div className="p-4 border rounded-lg flex items-start gap-3">
          <div className="bg-green-100 p-2 rounded text-green-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm">Shopify Compatible</h4>
            <p className="text-xs text-muted-foreground">The parser is optimized for Shopify's multi-line export format.</p>
          </div>
        </div>
        <div className="p-4 border rounded-lg flex items-start gap-3">
          <div className="bg-blue-100 p-2 rounded text-blue-600">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm">Drafts First</h4>
            <p className="text-xs text-muted-foreground">Orders are imported as drafts, allowing you to manually approve them.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
