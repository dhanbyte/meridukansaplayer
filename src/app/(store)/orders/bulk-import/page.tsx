"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/AuthContext";
import { ArrowLeft, Upload, FileText, CheckCircle2, AlertCircle, Loader2, Trash2, LayoutDashboard, Package, Video, User } from "lucide-react";
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
  paymentMethod: string; // COD or Prepaid
  items?: any[];
  isDuplicate?: boolean;
}

export default function BulkImportPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [previewOrders, setPreviewOrders] = useState<PreviewOrder[]>([]);
  const [pincodeValidation, setPincodeValidation] = useState<Record<string, { valid: boolean; city?: string }>>({});
  const [existingOrderNumbers, setExistingOrderNumbers] = useState<Set<string>>(new Set());
  const [isValidating, setIsValidating] = useState(false);

  // Validate pincodes using API
  const validatePincodes = async (orders: PreviewOrder[]) => {
    const pincodes = [...new Set(orders.map(o => o.pincode).filter(Boolean))];
    if (pincodes.length === 0) return;

    setIsValidating(true);
    try {
      const response = await fetch('/api/pincode/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pincodes })
      });

      if (response.ok) {
        const data = await response.json();
        setPincodeValidation(data.results || {});

        const invalidCount = Object.values(data.results || {}).filter((r: any) => !r.valid).length;
        if (invalidCount > 0) {
          toast({
            title: "Pincode Warning",
            description: `${invalidCount} pincode(s) appear to be invalid. Click to edit.`,
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('Pincode validation failed:', error);
    } finally {
      setIsValidating(false);
    }
  };

  // State for editing pincode
  const [editingPincodeIdx, setEditingPincodeIdx] = useState<number | null>(null);
  const [editPincodeValue, setEditPincodeValue] = useState('');

  // State for editing Name and Address
  const [editingCell, setEditingCell] = useState<{ idx: number, field: 'customerName' | 'shippingAddress' } | null>(null);
  const [editCellValue, setEditCellValue] = useState('');

  // English-only validation helper
  const isEnglishOnly = (text: string) => /^[\x00-\x7F]*$/.test(text || '');

  // Update pincode for an order and re-validate
  const updatePincode = async (idx: number) => {
    const newPincode = editPincodeValue.trim();
    if (!newPincode || newPincode.length !== 6 || !/^\d{6}$/.test(newPincode)) {
      toast({
        title: "Invalid Format",
        description: "Pincode must be 6 digits",
        variant: "destructive"
      });
      return;
    }

    // Update the order
    const updatedOrders = [...previewOrders];
    updatedOrders[idx].pincode = newPincode;
    setPreviewOrders(updatedOrders);
    setEditingPincodeIdx(null);
    setEditPincodeValue('');

    // Re-validate this pincode
    try {
      const response = await fetch('/api/pincode/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pincodes: [newPincode] })
      });

      if (response.ok) {
        const data = await response.json();
        setPincodeValidation(prev => ({ ...prev, ...data.results }));

        if (data.results[newPincode]?.valid) {
          toast({
            title: "Pincode Valid",
            description: `${newPincode} is a valid pincode${data.results[newPincode].city ? ` (${data.results[newPincode].city})` : ''}`,
          });
        } else {
          toast({
            title: "Pincode Still Invalid",
            description: "Please check and try again",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('Re-validation failed:', error);
    }
  };

  // Update Name or Address
  const updateCell = (idx: number, field: 'customerName' | 'shippingAddress') => {
    const updatedOrders = [...previewOrders];
    updatedOrders[idx][field] = editCellValue.trim();
    setPreviewOrders(updatedOrders);
    setEditingCell(null);
    setEditCellValue('');
  };

  // Helper function to clean pincode (remove quotes and special chars)
  const cleanPincode = (pin: any): string => {
    if (!pin) return '';
    return pin.toString().replace(/['"]/g, '').trim();
  };

  // Helper function to determine payment type
  const getPaymentType = (method: any): string => {
    if (!method) return 'Prepaid';
    const methodStr = method.toString().toLowerCase();
    if (methodStr.includes('cash on delivery') || methodStr.includes('cod')) {
      return 'COD';
    }
    return 'Prepaid';
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
          // If the order has its own ID in shopify format, check that too
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

        // Grouping by Order Name (for Shopify style where one order can have multiple lines)
        const orderMap = new Map<string, any>();

        jsonData.forEach((row) => {
          // Shopify standard headers or fallback to common ones
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

            // Extract and clean pincode
            const rawPincode = row['Shipping Zip'] || row['Zip'] || row['Pincode'] || '';

            // Extract payment method
            const paymentMethod = getPaymentType(row['Payment Method'] || row['Payment Type'] || row['Payment Status'] || '');

            orderMap.set(id, {
              orderNumber: id,
              customerName: row['Shipping Name'] || row['Customer Name'] || row['Billing Name'] || 'N/A',
              customerPhone: (row['Shipping Phone'] || row['Phone'] || row['Billing Phone'] || '').toString(),
              shippingAddress: shippingAddress || 'N/A',
              pincode: cleanPincode(rawPincode),
              sellingPrice: parseFloat(row['Total'] || row['Selling Price'] || row['Amount'] || '0'),
              paymentMethod: paymentMethod,
              items: [],
              costPrice: 0 // Will be filled from items or set to 0
            });
          }

          const order = orderMap.get(id);
          const itemName = row['Lineitem name'] || row['Product Name'] || row['Item Name'] || 'Product';
          const itemQty = parseInt(row['Lineitem quantity'] || row['Quantity'] || row['Qty'] || '1');
          const itemPrice = parseFloat(row['Lineitem price'] || row['Price'] || row['Item Price'] || '0');

          order.items.push({
            productName: itemName,
            quantity: itemQty,
            price: itemPrice // This is often the cost or selling price depending on CSV source
          });

          // For simple files where one row is one order, use row price as selling price
          if (order.items.length === 1 && !row['Total']) {
            order.sellingPrice = itemPrice * itemQty;
          }
        });

        const mapped = Array.from(orderMap.values()).map(order => ({
          ...order,
          productName: order.items[0]?.productName || 'Multiple Items',
          quantity: order.items.reduce((sum: number, i: any) => sum + i.quantity, 0),
          isDuplicate: existingSet.has(order.orderNumber.toString().toLowerCase()),
          // We assume costPrice might need adjustment or is same as selling price initially
          costPrice: order.sellingPrice * 0.8 // Dummy estimate if not provided, user will edit
        }));

        setPreviewOrders(mapped);

        // Validate pincodes
        validatePincodes(mapped);

        toast({
          title: "File Processed",
          description: `Found ${mapped.length} orders. Validating pincodes...`,
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
    if (!user) {
      toast({
        variant: "destructive",
        title: "Not Logged In",
        description: "Please log in to import orders.",
      });
      return;
    }
    setIsUploading(true);
    let successCount = 0;
    let failCount = 0;
    let lastError = '';

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
          partnerId: user.partnerId || user.partner_id || user.id || user._id || 'UNKNOWN',
          partnerName: user.name || user.username || user.email || 'Partner',
          customerName: order.customerName || 'N/A',
          customerPhone: order.customerPhone || '',
          shippingAddress: order.shippingAddress || 'N/A',
          pincode: order.pincode || '',
          items: (order.items || []).map((i: any) => ({
            productId: 'bulk-import',
            productName: i.productName || 'Product',
            productSku: (i.productName || 'PROD').substring(0, 10),
            quantity: Number(i.quantity) || 1,
            price: Number(i.price) || 0,
            total: (Number(i.price) || 0) * (Number(i.quantity) || 1)
          })),
          totalAmount: (order.items || []).reduce((sum: number, i: any) => sum + ((Number(i.price) || 0) * (Number(i.quantity) || 1)), 0),
          sellingPrice: Number(order.sellingPrice) || 0,
          profit: (Number(order.sellingPrice) || 0) - (Number(order.costPrice) || 0),
          paymentMethod: order.paymentMethod === 'COD' ? 'cod' : 'prepaid',
          status: 'draft',
        };

        console.log('[BulkImport] Sending order:', orderData);

        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData)
        });

        if (response.ok) {
          successCount++;
        } else {
          failCount++;
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          lastError = errorData.error || errorData.message || `HTTP ${response.status}`;
          console.error('[BulkImport] Order failed:', lastError, errorData);
        }
      }

      if (successCount > 0) {
        toast({
          title: "Import Complete",
          description: `Successfully imported ${successCount} orders.${failCount > 0 ? ` (${failCount} failed)` : ''}`,
        });
        router.push('/orders');
      } else {
        toast({
          variant: "destructive",
          title: "Import Failed",
          description: lastError || "All orders failed to import. Check console for details.",
        });
      }
    } catch (error: any) {
      console.error('[BulkImport] Exception:', error);
      toast({
        variant: "destructive",
        title: "Import Failed",
        description: error.message || "An error occurred while saving orders.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto p-2 sm:p-4 max-w-6xl space-y-4 sm:space-y-6">
      {/* Header - Mobile Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <Button variant="ghost" size="icon" asChild className="self-start">
          <Link href="/orders">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Bulk Shopify Import</h1>
          <p className="text-muted-foreground text-xs sm:text-sm">Upload your Shopify orders CSV or Excel file</p>
        </div>
      </div>

      {!previewOrders.length ? (
        <Card className="border-dashed border-2 bg-muted/30">
          <CardContent className="flex flex-col items-center justify-center py-12 sm:py-20 gap-4 px-4">
            <div className="bg-primary/10 p-3 sm:p-4 rounded-full">
              <Upload className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
            </div>
            <div className="text-center">
              <h3 className="text-base sm:text-lg font-semibold">Drop your Shopify file here</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mb-4">Support CSV, XLSX, and XLS formats</p>
              <Input
                type="file"
                accept=".csv, .xlsx, .xls"
                className="hidden"
                id="file-upload"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
              <Button asChild disabled={isUploading} size="lg" className="w-full sm:w-auto">
                <label htmlFor="file-upload" className="cursor-pointer">
                  {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
                  Select File
                </label>
              </Button>
            </div>
            <div className="mt-4 p-3 sm:p-4 bg-white/50 rounded-lg border text-xs text-muted-foreground w-full max-w-md">
              <p className="font-bold mb-1">Required Shopify Headers:</p>
              <p className="break-words">Name, Shipping Name, Shipping Phone, Shipping Address1, Total, Lineitem name</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Action Bar - Mobile Responsive */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 bg-blue-50 border-blue-100 border p-3 sm:p-4 rounded-lg">
            <div className="flex items-center gap-2 text-blue-800">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <span className="font-semibold text-sm sm:text-base">{previewOrders.length} Orders Loaded</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => setPreviewOrders([])} disabled={isUploading} className="flex-1 sm:flex-none">
                Cancel
              </Button>
              <Button size="sm" onClick={() => {
                const nonDuplicates = previewOrders.filter(o => !o.isDuplicate);
                if (nonDuplicates.length === 0) {
                  toast({ title: "No New Orders", description: "All orders are duplicates.", variant: "destructive" });
                  return;
                }
                setPreviewOrders(nonDuplicates);
                toast({ title: "Duplicates Removed", description: "Removed suspected duplicate orders." });
              }} variant="destructive" className="bg-orange-600 hover:bg-orange-700 flex-1 sm:flex-none text-xs sm:text-sm">
                Skip Duplicates
              </Button>
              <Button size="sm" onClick={handleImport} disabled={isUploading} className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
                {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Import {previewOrders.length} Orders
              </Button>
            </div>
          </div>

          {/* Desktop Table View - Hidden on Mobile */}
          <div className="hidden md:block border rounded-lg overflow-hidden bg-white">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Pincode</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Payment</TableHead>
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
                    <TableCell className="relative p-2">
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
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-blue-600 font-mono text-xs">{order.customerPhone}</TableCell>
                    <TableCell className="max-w-[180px] p-2">
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
                          <span className={`${!isEnglishOnly(order.shippingAddress) ? 'line-clamp-none' : 'line-clamp-2'}`}>{order.shippingAddress}</span>
                          {!isEnglishOnly(order.shippingAddress) && <AlertCircle className="h-3 w-3 text-red-600 shrink-0 mt-0.5" />}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const validation = pincodeValidation[order.pincode];
                        const isValid = validation?.valid;
                        const isChecked = validation !== undefined;

                        if (isValidating && !isChecked) {
                          return (
                            <span className="font-mono text-xs text-gray-400 flex items-center gap-1">
                              <Loader2 className="h-3 w-3 animate-spin" />
                              {order.pincode || '-'}
                            </span>
                          );
                        }

                        if (isChecked && isValid) {
                          return (
                            <span className="font-mono text-xs font-bold text-green-600 flex items-center gap-1" title={validation.city ? `Valid: ${validation.city}` : 'Valid pincode'}>
                              <CheckCircle2 className="h-3 w-3" />
                              {order.pincode}
                            </span>
                          );
                        }

                        if (isChecked && !isValid) {
                          // If this row is being edited, show input
                          if (editingPincodeIdx === idx) {
                            return (
                              <div className="flex items-center gap-1">
                                <Input
                                  type="text"
                                  maxLength={6}
                                  placeholder="6 digits"
                                  value={editPincodeValue}
                                  onChange={(e) => setEditPincodeValue(e.target.value.replace(/\D/g, ''))}
                                  className="h-7 w-20 text-xs font-mono"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') updatePincode(idx);
                                    if (e.key === 'Escape') {
                                      setEditingPincodeIdx(null);
                                      setEditPincodeValue('');
                                    }
                                  }}
                                />
                                <Button
                                  size="sm"
                                  className="h-7 px-2 text-xs bg-green-600 hover:bg-green-700"
                                  onClick={() => updatePincode(idx)}
                                >
                                  ✓
                                </Button>
                              </div>
                            );
                          }

                          // Show clickable invalid pincode
                          return (
                            <button
                              className="font-mono text-xs font-bold text-red-600 flex items-center gap-1 hover:bg-red-50 px-1 py-0.5 rounded cursor-pointer"
                              title="Click to edit pincode"
                              onClick={() => {
                                setEditingPincodeIdx(idx);
                                setEditPincodeValue(order.pincode || '');
                              }}
                            >
                              <AlertCircle className="h-3 w-3" />
                              {order.pincode}
                              <span className="text-[10px] text-red-400 ml-1">Edit</span>
                            </button>
                          );
                        }

                        return (
                          <span className="font-mono text-xs font-bold text-purple-600">
                            {order.pincode || '-'}
                          </span>
                        );
                      })()}
                    </TableCell>
                    <TableCell className="text-xs">
                      {order.productName} {(order.items || []).length > 1 ? `(+${(order.items || []).length - 1} more)` : ''}
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-0.5 rounded ${order.paymentMethod === 'COD' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                        {order.paymentMethod}
                      </span>
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

          {/* Mobile Card View - Shown only on Mobile */}
          <div className="md:hidden space-y-3">
            {previewOrders.map((order, idx) => (
              <Card key={idx} className={`${order.isDuplicate ? 'border-red-300 bg-red-50' : ''}`}>
                <CardContent className="p-3 space-y-3">
                  {/* Header Row */}
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">{order.orderNumber}</span>
                        {order.isDuplicate && (
                          <span className="text-[10px] bg-red-200 text-red-700 px-1.5 py-0.5 rounded font-bold">DUPLICATE</span>
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded ${order.paymentMethod === 'COD' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                          {order.paymentMethod}
                        </span>
                      </div>
                      <p className="text-lg font-bold text-green-600 mt-1">₹{(order.sellingPrice || 0).toFixed(2)}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeOrder(idx)} className="h-8 w-8 text-red-500 shrink-0">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Customer Info */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="text-muted-foreground w-16 shrink-0">Customer:</span>
                      <span
                        className={`font-medium flex-1 ${!isEnglishOnly(order.customerName) ? 'text-red-600' : ''}`}
                        onClick={() => { setEditingCell({ idx, field: 'customerName' }); setEditCellValue(order.customerName); }}
                      >
                        {order.customerName}
                        {!isEnglishOnly(order.customerName) && <AlertCircle className="h-3 w-3 inline ml-1 text-red-600" />}
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-muted-foreground w-16 shrink-0">Phone:</span>
                      <span className="text-blue-600 font-mono text-xs">{order.customerPhone}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-muted-foreground w-16 shrink-0">Pincode:</span>
                      {(() => {
                        const validation = pincodeValidation[order.pincode];
                        const isValid = validation?.valid;
                        if (isValid) {
                          return <span className="text-green-600 font-mono font-bold flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />{order.pincode}</span>;
                        }
                        if (validation && !isValid) {
                          return (
                            <button
                              onClick={() => { setEditingPincodeIdx(idx); setEditPincodeValue(order.pincode || ''); }}
                              className="text-red-600 font-mono font-bold flex items-center gap-1"
                            >
                              <AlertCircle className="h-3 w-3" />{order.pincode} <span className="text-xs underline">Edit</span>
                            </button>
                          );
                        }
                        return <span className="font-mono">{order.pincode || '-'}</span>;
                      })()}
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-muted-foreground w-16 shrink-0">Address:</span>
                      <span
                        className={`text-xs leading-relaxed flex-1 ${!isEnglishOnly(order.shippingAddress) ? 'text-red-600' : ''}`}
                        onClick={() => { setEditingCell({ idx, field: 'shippingAddress' }); setEditCellValue(order.shippingAddress); }}
                      >
                        {order.shippingAddress}
                        {!isEnglishOnly(order.shippingAddress) && <AlertCircle className="h-3 w-3 inline ml-1 text-red-600" />}
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-muted-foreground w-16 shrink-0">Product:</span>
                      <span className="text-xs flex-1">
                        {order.productName} {(order.items || []).length > 1 ? `(+${(order.items || []).length - 1} more)` : ''}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Info Cards - Mobile Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mt-6 sm:mt-8">
        <div className="p-3 sm:p-4 border rounded-lg flex items-start gap-3">
          <div className="bg-orange-100 p-2 rounded text-orange-600 shrink-0">
            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs sm:text-sm">Review Data</h4>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Check customer details and prices before importing.</p>
          </div>
        </div>
        <div className="p-3 sm:p-4 border rounded-lg flex items-start gap-3">
          <div className="bg-green-100 p-2 rounded text-green-600 shrink-0">
            <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs sm:text-sm">Auto Mapping</h4>
            <p className="text-[10px] sm:text-xs text-muted-foreground">We auto-recognize Shopify columns.</p>
          </div>
        </div>
        <div className="p-3 sm:p-4 border rounded-lg flex items-start gap-3">
          <div className="bg-blue-100 p-2 rounded text-blue-600 shrink-0">
            <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs sm:text-sm">Draft Mode</h4>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Orders saved as drafts for editing.</p>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-2xl z-[999] block md:hidden">
        <div className="grid grid-cols-4 py-3 px-2 safe-area-inset-bottom">
          <Link href="/" className="flex flex-col items-center justify-center py-1 text-gray-500 hover:text-blue-600 transition-colors">
            <LayoutDashboard className="h-6 w-6" />
            <span className="text-[11px] mt-1 font-medium">Dashboard</span>
          </Link>
          <Link href="/orders" className="flex flex-col items-center justify-center py-1 text-blue-600">
            <Package className="h-6 w-6" />
            <span className="text-[11px] mt-1 font-bold">Orders</span>
          </Link>
          <Link href="/learning" className="flex flex-col items-center justify-center py-1 text-gray-500 hover:text-blue-600 transition-colors">
            <Video className="h-6 w-6" />
            <span className="text-[11px] mt-1 font-medium">Learning</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center justify-center py-1 text-gray-500 hover:text-blue-600 transition-colors">
            <User className="h-6 w-6" />
            <span className="text-[11px] mt-1 font-medium">Profile</span>
          </Link>
        </div>
      </nav>

      {/* Bottom padding for mobile nav */}
      <div className="block md:hidden h-20"></div>
    </div>
  );
}
