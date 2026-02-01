"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Upload,
    FileSpreadsheet,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    RefreshCw,
    Download,
    Package,
    MapPin,
    Phone,
    User,
    ChevronDown,
    ChevronUp,
    ShoppingCart
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useCart } from "@/lib/CartContext";

interface ImportRow {
    rowNumber: number;
    productName: string;
    quantity: number;
    customerName: string;
    customerPhone: string;
    address: string;
    pincode: string;
    matchedProduct?: any;
    matchScore?: number;
    matchStatus?: 'auto' | 'suggest' | 'not_found';
    pincodeValid?: boolean;
    phoneValid?: boolean;
    inferredState?: string;
    inferredCity?: string;
    errors: string[];
    warnings: string[];
}

interface ImportSummary {
    totalRows: number;
    validRows: number;
    invalidRows: number;
    autoMatched: number;
    suggested: number;
    notFound: number;
    pincodeErrors: number;
    phoneErrors: number;
}

export default function BulkImportPage() {
    const { toast } = useToast();
    const { addToCart } = useCart();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [summary, setSummary] = useState<ImportSummary | null>(null);
    const [rows, setRows] = useState<ImportRow[]>([]);
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setSummary(null);
            setRows([]);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            toast({
                variant: "destructive",
                title: "No File Selected",
                description: "Please select an Excel or CSV file to upload."
            });
            return;
        }

        setIsProcessing(true);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/bulk-import', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Upload failed');
            }

            setSummary(data.summary);
            setRows(data.rows);

            toast({
                title: "File Processed",
                description: `${data.summary.validRows} of ${data.summary.totalRows} orders are ready to import.`
            });

        } catch (error) {
            toast({
                variant: "destructive",
                title: "Upload Failed",
                description: String(error)
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const toggleRowExpand = (rowNumber: number) => {
        setExpandedRows(prev => {
            const newSet = new Set(prev);
            if (newSet.has(rowNumber)) {
                newSet.delete(rowNumber);
            } else {
                newSet.add(rowNumber);
            }
            return newSet;
        });
    };

    const handleConfirmMatch = (rowIndex: number, product: any) => {
        setRows(prev => prev.map((row, i) => {
            if (i === rowIndex) {
                return {
                    ...row,
                    matchedProduct: product,
                    matchStatus: 'auto' as const,
                    errors: row.errors.filter(e => !e.includes('not found') && !e.includes('might be'))
                };
            }
            return row;
        }));
    };

    const handleAddAllToCart = () => {
        const validOrders = rows.filter(r => r.errors.length === 0 && r.matchedProduct);

        validOrders.forEach(order => {
            for (let i = 0; i < order.quantity; i++) {
                addToCart({
                    id: order.matchedProduct.id,
                    name: order.matchedProduct.name,
                    price: order.matchedProduct.price,
                    image: order.matchedProduct.image_url,
                    category: 'General',
                    packingCostPerUnit: order.matchedProduct.packing_cost_per_unit || 0
                });
            }
        });

        toast({
            title: "Orders Added to Cart",
            description: `${validOrders.length} orders have been added to your cart.`
        });
    };

    const downloadSampleTemplate = () => {
        const sampleData = `Product Name,Quantity,Customer Name,Phone,Address,Pincode,City,State
AirPods Pro 2nd Gen,1,Rahul Sharma,9876543210,123 Main Street Colony,110001,New Delhi,Delhi
iPhone 15 Cover,2,Priya Patel,8765432109,456 Park Avenue,400001,Mumbai,Maharashtra
Samsung Charger,1,Amit Singh,7654321098,789 Gandhi Road,560001,Bangalore,Karnataka`;

        const blob = new Blob([sampleData], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'bulk_order_template.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="container mx-auto px-4 py-6 max-w-6xl">
            <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
                    <FileSpreadsheet className="h-8 w-8 text-blue-600" />
                    Bulk Order Import
                </h1>
                <p className="text-gray-600 mt-1">Upload Excel/CSV file to create multiple orders at once</p>
            </div>

            {/* Upload Section */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="text-lg">Step 1: Upload Your File</CardTitle>
                    <CardDescription>
                        Supported formats: .xlsx, .xls, .csv
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <div
                                className="p-8 border-2 border-dashed rounded-lg text-center cursor-pointer hover:bg-gray-50 transition-colors"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {file ? (
                                    <div className="space-y-2">
                                        <FileSpreadsheet className="h-12 w-12 mx-auto text-green-600" />
                                        <p className="font-medium">{file.name}</p>
                                        <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <Upload className="h-12 w-12 mx-auto text-gray-400" />
                                        <p className="font-medium">Drop file here or click to browse</p>
                                        <p className="text-sm text-gray-500">Excel or CSV file with order details</p>
                                    </div>
                                )}
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".xlsx,.xls,.csv"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </div>

                        <div className="flex flex-col gap-2 sm:w-48">
                            <Button
                                onClick={handleUpload}
                                disabled={!file || isProcessing}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                {isProcessing ? (
                                    <>
                                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="h-4 w-4 mr-2" />
                                        Process File
                                    </>
                                )}
                            </Button>
                            <Button variant="outline" onClick={downloadSampleTemplate}>
                                <Download className="h-4 w-4 mr-2" />
                                Download Template
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Summary Section */}
            {summary && (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="text-lg">Step 2: Review Import Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="p-4 bg-blue-50 rounded-lg text-center">
                                <p className="text-2xl font-bold text-blue-700">{summary.totalRows}</p>
                                <p className="text-sm text-gray-600">Total Orders</p>
                            </div>
                            <div className="p-4 bg-green-50 rounded-lg text-center">
                                <p className="text-2xl font-bold text-green-700">{summary.validRows}</p>
                                <p className="text-sm text-gray-600">Valid Orders</p>
                            </div>
                            <div className="p-4 bg-red-50 rounded-lg text-center">
                                <p className="text-2xl font-bold text-red-700">{summary.invalidRows}</p>
                                <p className="text-sm text-gray-600">Invalid Orders</p>
                            </div>
                            <div className="p-4 bg-amber-50 rounded-lg text-center">
                                <p className="text-2xl font-bold text-amber-700">{summary.suggested}</p>
                                <p className="text-sm text-gray-600">Need Review</p>
                            </div>
                        </div>

                        {/* Match Statistics */}
                        <div className="mt-4 flex flex-wrap gap-2">
                            <Badge variant="outline" className="bg-green-100">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                {summary.autoMatched} Auto-Matched
                            </Badge>
                            <Badge variant="outline" className="bg-amber-100">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                {summary.suggested} Suggestions
                            </Badge>
                            <Badge variant="outline" className="bg-red-100">
                                <XCircle className="h-3 w-3 mr-1" />
                                {summary.notFound} Not Found
                            </Badge>
                            {summary.pincodeErrors > 0 && (
                                <Badge variant="outline" className="bg-red-100">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    {summary.pincodeErrors} Pincode Errors
                                </Badge>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Orders Preview */}
            {rows.length > 0 && (
                <Card className="mb-6">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg">Step 3: Verify & Import Orders</CardTitle>
                        <Button
                            onClick={handleAddAllToCart}
                            disabled={rows.filter(r => r.errors.length === 0).length === 0}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Add {rows.filter(r => r.errors.length === 0).length} to Cart
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3 max-h-[500px] overflow-y-auto">
                            {rows.map((row, index) => (
                                <div
                                    key={row.rowNumber}
                                    className={`p-4 rounded-lg border ${row.errors.length > 0
                                            ? 'border-red-200 bg-red-50'
                                            : row.matchStatus === 'suggest'
                                                ? 'border-amber-200 bg-amber-50'
                                                : 'border-green-200 bg-green-50'
                                        }`}
                                >
                                    <div
                                        className="flex items-center justify-between cursor-pointer"
                                        onClick={() => toggleRowExpand(row.rowNumber)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-medium text-gray-500">#{row.rowNumber}</span>

                                            {/* Status Badge */}
                                            {row.errors.length > 0 ? (
                                                <Badge variant="destructive">
                                                    <XCircle className="h-3 w-3 mr-1" />
                                                    {row.errors.length} Error{row.errors.length > 1 ? 's' : ''}
                                                </Badge>
                                            ) : row.matchStatus === 'suggest' ? (
                                                <Badge className="bg-amber-500">
                                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                                    Review Required
                                                </Badge>
                                            ) : (
                                                <Badge className="bg-green-500">
                                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                                    Ready
                                                </Badge>
                                            )}

                                            {/* Product Name */}
                                            <span className="font-medium">{row.productName}</span>
                                            <span className="text-gray-500">×{row.quantity}</span>
                                        </div>

                                        {expandedRows.has(row.rowNumber) ? (
                                            <ChevronUp className="h-5 w-5 text-gray-400" />
                                        ) : (
                                            <ChevronDown className="h-5 w-5 text-gray-400" />
                                        )}
                                    </div>

                                    {/* Expanded Details */}
                                    {expandedRows.has(row.rowNumber) && (
                                        <div className="mt-4 pt-4 border-t space-y-3">
                                            {/* Customer Info */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-gray-400" />
                                                    <span>{row.customerName || 'N/A'}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Phone className={`h-4 w-4 ${row.phoneValid ? 'text-green-500' : 'text-red-500'}`} />
                                                    <span>{row.customerPhone || 'N/A'}</span>
                                                    {!row.phoneValid && <Badge variant="destructive" className="text-xs">Invalid</Badge>}
                                                </div>
                                                <div className="flex items-center gap-2 sm:col-span-2">
                                                    <MapPin className={`h-4 w-4 ${row.pincodeValid ? 'text-green-500' : 'text-red-500'}`} />
                                                    <span>{row.address}, {row.pincode}</span>
                                                    {row.inferredState && (
                                                        <Badge variant="outline" className="text-xs">{row.inferredCity}, {row.inferredState}</Badge>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Matched Product */}
                                            {row.matchedProduct && (
                                                <div className="p-3 bg-white rounded-lg border flex items-center gap-3">
                                                    <Package className="h-5 w-5 text-blue-500" />
                                                    <div className="flex-1">
                                                        <p className="font-medium">{row.matchedProduct.name}</p>
                                                        <p className="text-sm text-gray-500">
                                                            Match: {row.matchScore}% | ₹{row.matchedProduct.price}
                                                        </p>
                                                    </div>
                                                    {row.matchStatus === 'suggest' && (
                                                        <Button
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleConfirmMatch(index, row.matchedProduct);
                                                            }}
                                                        >
                                                            Confirm Match
                                                        </Button>
                                                    )}
                                                </div>
                                            )}

                                            {/* Errors */}
                                            {row.errors.length > 0 && (
                                                <div className="space-y-1">
                                                    {row.errors.map((error, i) => (
                                                        <p key={i} className="text-sm text-red-600 flex items-center gap-1">
                                                            <XCircle className="h-3 w-3" />
                                                            {error}
                                                        </p>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Warnings */}
                                            {row.warnings.length > 0 && (
                                                <div className="space-y-1">
                                                    {row.warnings.map((warning, i) => (
                                                        <p key={i} className="text-sm text-amber-600 flex items-center gap-1">
                                                            <AlertTriangle className="h-3 w-3" />
                                                            {warning}
                                                        </p>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
