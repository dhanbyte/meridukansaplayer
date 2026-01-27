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
  paymentMethod: string; // COD or Prepaid
  items?: any[];
}

export default function BulkImportPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [previewOrders, setPreviewOrders] = useState<PreviewOrder[]>([]);
  const [pincodeValidation, setPincodeValidation] = useState<Record<string, { valid: boolean; city?: string }>>({});
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
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
    if (!user) return;
    setIsUploading(true);
    let successCount = 0;

    const isEnglishOnly = (text: string) => /^[\x00-\x7F]*$/.test(text || '');
    
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
          partnerId: user.partnerId || user.partner_id || user.id || user._id,
          partnerName: user.name || user.username || 'Partner',
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
          paymentMethod: order.paymentMethod === 'COD' ? 'cod' : 'prepaid',
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

      router.push('/orders');
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
          <Link href="/orders">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Bulk Shopify Import</h1>
          <p className="text-muted-foreground text-sm">Upload your Shopify orders CSV or Excel file</p>
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
              <span className="font-semibold">{previewOrders.length} Orders Loaded</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setPreviewOrders([])} disabled={isUploading}>
                Cancel
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
                  <TableHead>Pincode</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewOrders.map((order, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-bold">{order.orderNumber}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell className="text-blue-600 font-mono text-xs">{order.customerPhone}</TableCell>
                    <TableCell className="max-w-[180px] truncate text-xs" title={order.shippingAddress}>
                      {order.shippingAddress}
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
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <div className="p-4 border rounded-lg flex items-start gap-3">
          <div className="bg-orange-100 p-2 rounded text-orange-600">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm">Review Data</h4>
            <p className="text-xs text-muted-foreground">Check customer details and prices carefully before importing.</p>
          </div>
        </div>
        <div className="p-4 border rounded-lg flex items-start gap-3">
          <div className="bg-green-100 p-2 rounded text-green-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm">Auto Mapping</h4>
            <p className="text-xs text-muted-foreground">We automatically recognize Shopify columns like 'Name', 'Shipping Name', etc.</p>
          </div>
        </div>
        <div className="p-4 border rounded-lg flex items-start gap-3">
          <div className="bg-blue-100 p-2 rounded text-blue-600">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm">Draft Mode</h4>
            <p className="text-xs text-muted-foreground">Imported orders will be saved as drafts so you can edit them later.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
