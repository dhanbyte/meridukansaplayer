"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Package, Plus, Trash2, Edit, RefreshCw, X, Upload, Image as ImageIcon, FileSpreadsheet, Download, CheckCircle, AlertTriangle } from "lucide-react";
import * as XLSX from 'xlsx';

interface Product {
  id: string;
  name: string;
  sku?: string;
  price: number | string;
  mrp?: number | string;
  description?: string;
  image: string;
  extraImages?: string[];
  stock: number | string;
  weight?: number | string;
  packingCostPerUnit?: number | string;
  useGlobalCharges?: boolean;
  customDeliveryCharge?: number | string;
  customRtoPenalty?: number | string;
  category: string;
  createdAt?: Date;
  status?: 'active' | 'pending' | 'draft';
}

interface FormData {
  name: string;
  sku: string;
  price: string;
  mrp: string;
  description: string;
  image: string;
  extraImages: string[];
  stock: string;
  weight: string;
  packingCostPerUnit: string;
  useGlobalCharges: boolean;
  customDeliveryCharge: string;
  customRtoPenalty: string;
  category: string;
}

const initialFormData: FormData = {
  name: '',
  sku: '',
  price: '',
  mrp: '',
  description: '',
  image: '',
  extraImages: [],
  stock: '',
  weight: '',
  packingCostPerUnit: '10',
  useGlobalCharges: true,
  customDeliveryCharge: '',
  customRtoPenalty: '',
  category: 'General'
};

export default function AdminProductsPage() {
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [apiError, setApiError] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingExtraImage, setUploadingExtraImage] = useState(false);

  // Bulk Import States
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [bulkImportData, setBulkImportData] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredProducts = selectedCategory === 'All'
    ? products
    : products.filter((product) => product.category === selectedCategory);

  // Prevent double fetch in React Strict Mode
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    setApiError('');

    try {
      const response = await fetch('/api/products?includePending=true');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch products');
      }

      if (data.products && Array.isArray(data.products)) {
        setProducts(data.products);
      } else {
        setApiError('Invalid response format from server');
      }
    } catch (error) {
      const err = error as Error;
      setApiError(err.message || 'Failed to load products. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const uploadImage = async (file: File, isExtraImage: boolean = false) => {
    if (isExtraImage) {
      setUploadingExtraImage(true);
    } else {
      setUploadingImage(true);
    }

    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData
      });

      const data = await response.json();

      if (data.url) {
        if (isExtraImage) {
          setFormData(prev => ({
            ...prev,
            extraImages: [...prev.extraImages, data.url]
          }));
        } else {
          setFormData(prev => ({ ...prev, image: data.url }));
        }
        toast({
          title: "Image Uploaded",
          description: "Image has been uploaded successfully."
        });
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: String(error)
      });
    } finally {
      setUploadingImage(false);
      setUploadingExtraImage(false);
    }
  };

  const removeExtraImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      extraImages: prev.extraImages.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.image) {
      setError('Please upload a main image for the product');
      return;
    }

    if (!formData.name || !formData.price || !formData.stock) {
      setError('Please fill in all required fields (Name, Price, Stock)');
      return;
    }

    setIsSubmitting(true);

    try {
      const method = editingProduct ? 'PUT' : 'POST';
      const body = {
        ...formData,
        id: editingProduct?.id,
        price: parseFloat(formData.price),
        mrp: formData.mrp ? parseFloat(formData.mrp) : null,
        stock: parseInt(formData.stock),
        weight: formData.weight ? parseFloat(formData.weight) : 0.5,
        packingCostPerUnit: parseFloat(formData.packingCostPerUnit) || 10,
        useGlobalCharges: formData.useGlobalCharges,
        customDeliveryCharge: formData.useGlobalCharges ? null : (parseFloat(formData.customDeliveryCharge) || null),
        customRtoPenalty: formData.useGlobalCharges ? null : (parseFloat(formData.customRtoPenalty) || null)
      };

      const response = await fetch('/api/products', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save product');
      }

      toast({
        title: editingProduct ? "Product Updated" : "Product Added",
        description: editingProduct
          ? "Product has been updated successfully."
          : "New product has been added to the catalog."
      });

      resetForm();
      fetchProducts();

    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingProduct(null);
    setShowForm(false);
    setShowEditModal(false);
    setError('');
  };

  const editProduct = (product: Product) => {
    setFormData({
      name: product.name,
      sku: product.sku || '',
      price: product.price.toString(),
      mrp: product.mrp?.toString() || '',
      description: product.description || '',
      image: product.image,
      extraImages: product.extraImages || [],
      stock: product.stock.toString(),
      weight: product.weight?.toString() || '',
      packingCostPerUnit: product.packingCostPerUnit?.toString() || '10',
      useGlobalCharges: product.useGlobalCharges !== false,
      customDeliveryCharge: product.customDeliveryCharge?.toString() || '',
      customRtoPenalty: product.customRtoPenalty?.toString() || '',
      category: product.category
    });
    setEditingProduct(product);
    setShowEditModal(true);
  };

  const deleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch('/api/products', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: productId })
      });

      if (response.ok) {
        toast({ title: "Product Deleted" });
        fetchProducts();
      } else {
        throw new Error('Failed to delete');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: "Could not delete the product"
      });
    }
  };

  // Bulk Import Handler
  const handleBulkFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        // Map the data to product format
        const mappedData = jsonData.map((row: any, idx: number) => ({
          rowNumber: idx + 2, // Excel row (header is 1)
          name: row['Name'] || row['Product Name'] || row['name'] || '',
          sku: row['SKU'] || row['sku'] || row['Product Code'] || '',
          price: parseFloat(row['Price'] || row['price'] || row['Selling Price'] || 0),
          mrp: parseFloat(row['MRP'] || row['mrp'] || row['Original Price'] || 0),
          stock: parseInt(row['Stock'] || row['stock'] || row['Quantity'] || 0),
          weight: row['Weight'] || row['weight'] || '',
          category: row['Category'] || row['category'] || 'General',
          description: row['Description'] || row['description'] || '',
          image: row['Image'] || row['image'] || row['Image URL'] || '',
          isValid: !!(row['Name'] || row['Product Name'] || row['name'])
        }));

        setBulkImportData(mappedData);
        setShowBulkImport(true);
        toast({
          title: "File Loaded",
          description: `Found ${mappedData.length} products to import`
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "File Error",
          description: "Could not read the file. Make sure it's a valid Excel or CSV file."
        });
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = ''; // Reset input
  };

  const downloadSampleTemplate = () => {
    const sampleData = [
      {
        'Name': 'Sample Product 1',
        'SKU': 'SKU-001',
        'Price': 299,
        'MRP': 399,
        'Stock': 100,
        'Weight': '500g',
        'Category': 'General',
        'Description': 'Product description here',
        'Image URL': 'https://example.com/image.jpg'
      },
      {
        'Name': 'Sample Product 2',
        'SKU': 'SKU-002',
        'Price': 499,
        'MRP': 599,
        'Stock': 50,
        'Weight': '1kg',
        'Category': 'Electronics',
        'Description': 'Another product',
        'Image URL': ''
      }
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Products');
    XLSX.writeFile(wb, 'product_import_template.xlsx');
    toast({ title: "Template Downloaded", description: "Fill in your products and upload" });
  };

  const processBulkImport = async () => {
    const validProducts = bulkImportData.filter(p => p.isValid && p.name.trim());
    if (validProducts.length === 0) {
      toast({ variant: "destructive", title: "No valid products", description: "Please check the data" });
      return;
    }

    setImporting(true);
    setImportProgress({ current: 0, total: validProducts.length });

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < validProducts.length; i++) {
      const product = validProducts[i];
      try {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: product.name,
            sku: product.sku || `SKU-${Date.now()}-${i}`,
            price: product.price || 0,
            mrp: product.mrp || product.price || 0,
            stock: product.stock || 0,
            weight: product.weight || '',
            category: product.category || 'General',
            description: product.description || '',
            image: product.image || '/placeholder.png',
            status: 'active'
          })
        });

        if (res.ok) successCount++;
        else failCount++;
      } catch (error) {
        failCount++;
      }
      setImportProgress({ current: i + 1, total: validProducts.length });
    }

    setImporting(false);
    setShowBulkImport(false);
    setBulkImportData([]);
    fetchProducts();

    toast({
      title: "Import Complete",
      description: `${successCount} products imported successfully${failCount > 0 ? `, ${failCount} failed` : ''}`
    });
  };

  // Product Form Component
  const ProductForm = ({ isModal = false }: { isModal?: boolean }) => (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Product Title *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., AirPods Pro 2nd Gen"
            required
          />
        </div>
        <div>
          <Label htmlFor="sku">SKU / Product ID</Label>
          <Input
            id="sku"
            value={formData.sku}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            placeholder="e.g., SKU-001"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Product features, warranty details, specifications..."
          rows={3}
        />
      </div>

      {/* Pricing */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="price" className="flex items-center gap-2">
            Base Price (Wholesale) *
            <Badge variant="secondary" className="text-xs">Vendor Sees This</Badge>
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
            <Input
              id="price"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="500"
              className="pl-7"
              required
            />
          </div>
        </div>
        <div>
          <Label htmlFor="mrp">Selling Price (MSRP)</Label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
            <Input
              id="mrp"
              type="number"
              value={formData.mrp}
              onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
              placeholder="999"
              className="pl-7"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Optional - for profit margin display</p>
        </div>
        <div>
          <Label htmlFor="packingCostPerUnit">Packing Cost / Unit</Label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
            <Input
              id="packingCostPerUnit"
              type="number"
              value={formData.packingCostPerUnit}
              onChange={(e) => setFormData({ ...formData, packingCostPerUnit: e.target.value })}
              placeholder="10"
              className="pl-7"
            />
          </div>
        </div>
      </div>

      {/* Stock & Weight */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="stock">Stock Quantity *</Label>
          <Input
            id="stock"
            type="number"
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
            placeholder="50"
            required
          />
        </div>
        <div>
          <Label htmlFor="weight">Weight (kg)</Label>
          <Input
            id="weight"
            type="number"
            step="0.1"
            value={formData.weight}
            onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
            placeholder="0.5"
          />
        </div>
      </div>

      {/* Charges Override Section */}
      <div className="p-4 border rounded-lg bg-amber-50/50">
        <div className="flex items-center justify-between mb-3">
          <div>
            <Label className="text-base font-medium">Charges Configuration</Label>
            <p className="text-xs text-gray-500">Override global charges for this product</p>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.useGlobalCharges}
              onChange={(e) => setFormData({ ...formData, useGlobalCharges: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300"
            />
            <span className="text-sm font-medium">Use Global Charges</span>
          </label>
        </div>

        {!formData.useGlobalCharges && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-3 bg-white rounded-lg border border-amber-200">
            <div>
              <Label htmlFor="customDeliveryCharge" className="flex items-center gap-2">
                Custom Delivery Charge
                <Badge variant="outline" className="text-xs bg-amber-100">Override</Badge>
              </Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
                <Input
                  id="customDeliveryCharge"
                  type="number"
                  value={formData.customDeliveryCharge}
                  onChange={(e) => setFormData({ ...formData, customDeliveryCharge: e.target.value })}
                  placeholder="Heavy item? Higher rate"
                  className="pl-7"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">For bulky/heavy items</p>
            </div>
            <div>
              <Label htmlFor="customRtoPenalty" className="flex items-center gap-2">
                Custom RTO Penalty
                <Badge variant="outline" className="text-xs bg-amber-100">Override</Badge>
              </Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
                <Input
                  id="customRtoPenalty"
                  type="number"
                  value={formData.customRtoPenalty}
                  onChange={(e) => setFormData({ ...formData, customRtoPenalty: e.target.value })}
                  placeholder="Custom RTO charge"
                  className="pl-7"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">For high-risk products</p>
            </div>
          </div>
        )}
      </div>

      {/* Main Image */}
      <div>
        <Label>Main Product Image *</Label>
        <div className="flex gap-4 mt-2">
          <div
            className="flex-1 p-6 border-2 border-dashed rounded-lg text-center cursor-pointer hover:bg-gray-50 transition-colors"
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              if (file) uploadImage(file);
            }}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => document.getElementById('mainImageInput')?.click()}
          >
            {uploadingImage ? (
              <div className="flex items-center justify-center">
                <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            ) : formData.image ? (
              <div className="space-y-2">
                <img src={formData.image} alt="Preview" className="w-24 h-24 mx-auto object-cover rounded-lg" />
                <p className="text-sm text-gray-600">Click to change</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="h-8 w-8 mx-auto text-gray-400" />
                <p className="text-sm text-gray-600">Drag & drop or click to upload</p>
              </div>
            )}
          </div>
          <input
            id="mainImageInput"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadImage(file);
            }}
          />
        </div>
      </div>

      {/* Extra Images for Carousel */}
      <div>
        <Label className="flex items-center gap-2">
          <ImageIcon className="h-4 w-4" />
          Additional Images (Carousel)
        </Label>
        <div className="mt-2 space-y-3">
          {/* Existing extra images */}
          {formData.extraImages.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.extraImages.map((img, index) => (
                <div key={index} className="relative group">
                  <img src={img} alt={`Extra ${index + 1}`} className="w-20 h-20 object-cover rounded-lg border" />
                  <button
                    type="button"
                    onClick={() => removeExtraImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add more images button */}
          <div
            className="w-24 h-24 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => document.getElementById('extraImageInput')?.click()}
          >
            {uploadingExtraImage ? (
              <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
            ) : (
              <Plus className="h-6 w-6 text-gray-400" />
            )}
          </div>
          <input
            id="extraImageInput"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadImage(file, true);
            }}
          />
          <p className="text-xs text-gray-500">Add multiple images for product carousel view</p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Submit Buttons */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={resetForm}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          {isSubmitting ? 'Saving...' : editingProduct ? 'Update Product' : 'Add Product'}
        </Button>
      </div>
    </form>
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Package className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold">Products ({products.length})</h1>
            <p className="text-sm text-gray-500">Manage your product catalog</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={fetchProducts}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          {/* Bulk Import */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleBulkFileUpload}
            accept=".xlsx,.xls,.csv"
            className="hidden"
          />
          <Button
            variant="outline"
            onClick={downloadSampleTemplate}
            className="text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Template
          </Button>
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="text-green-600 border-green-200 hover:bg-green-50"
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Bulk Import
          </Button>

          <Button
            onClick={() => {
              setShowForm(!showForm);
              if (showForm) resetForm();
            }}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            {showForm ? 'Cancel' : 'Add Product'}
          </Button>
        </div>
      </div>

      {/* Add Product Form */}
      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add New Product</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductForm />
          </CardContent>
        </Card>
      )}

      {/* Products List */}
      {apiError && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg mb-4">
          {apiError}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12">
          <RefreshCw className="h-12 w-12 animate-spin mx-auto text-blue-500" />
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 mb-4">No products found</p>
          <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Product
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex gap-4 justify-between">
                  <div className="flex gap-4">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-20 h-20 object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAiIGhlaWdodD0iODAiIGZpbGw9IiNGM0Y0RjYiLz48L3N2Zz4=';
                        }}
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{product.name}</h3>
                        <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                          {product.status || 'pending'}
                        </Badge>
                      </div>
                      {product.sku && (
                        <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                      )}
                      <div className="flex gap-4 text-sm">
                        <span className="font-medium text-green-600">₹{product.price}</span>
                        {product.mrp && (
                          <span className="text-gray-400 line-through">MRP ₹{product.mrp}</span>
                        )}
                        <span className="text-gray-500">Stock: {product.stock}</span>
                        {product.packingCostPerUnit && (
                          <span className="text-gray-500">Packing: ₹{product.packingCostPerUnit}/unit</span>
                        )}
                      </div>
                      {product.extraImages && product.extraImages.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {product.extraImages.slice(0, 4).map((img, i) => (
                            <img key={i} src={img} alt="" className="w-8 h-8 object-cover rounded" />
                          ))}
                          {product.extraImages.length > 4 && (
                            <span className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-xs">
                              +{product.extraImages.length - 4}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => editProduct(product)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteProduct(product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Edit Product</CardTitle>
              <Button variant="ghost" size="sm" onClick={resetForm}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <ProductForm isModal={true} />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Bulk Import Preview Dialog */}
      <Dialog open={showBulkImport} onOpenChange={setShowBulkImport}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-green-600" />
              Bulk Import Preview
            </DialogTitle>
          </DialogHeader>

          {importing ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              <p className="text-lg font-medium">Importing Products...</p>
              <div className="w-full max-w-xs bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500">{importProgress.current} of {importProgress.total} products</p>
            </div>
          ) : (
            <>
              <div className="text-sm text-gray-500 mb-2">
                Found <span className="font-semibold text-green-600">{bulkImportData.filter(p => p.isValid).length}</span> valid products,
                <span className="font-semibold text-red-500 ml-1">{bulkImportData.filter(p => !p.isValid).length}</span> invalid
              </div>

              <div className="flex-1 overflow-auto border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left w-8">#</th>
                      <th className="px-3 py-2 text-left">Name</th>
                      <th className="px-3 py-2 text-left">SKU</th>
                      <th className="px-3 py-2 text-right">Price</th>
                      <th className="px-3 py-2 text-right">Stock</th>
                      <th className="px-3 py-2 text-left">Category</th>
                      <th className="px-3 py-2 text-center w-12">Valid</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bulkImportData.slice(0, 50).map((product, idx) => (
                      <tr key={idx} className={`border-t ${!product.isValid ? 'bg-red-50' : ''}`}>
                        <td className="px-3 py-2 text-gray-400">{product.rowNumber}</td>
                        <td className="px-3 py-2 font-medium truncate max-w-[200px]">{product.name || '-'}</td>
                        <td className="px-3 py-2 text-gray-500">{product.sku || '-'}</td>
                        <td className="px-3 py-2 text-right">₹{product.price || 0}</td>
                        <td className="px-3 py-2 text-right">{product.stock || 0}</td>
                        <td className="px-3 py-2">{product.category}</td>
                        <td className="px-3 py-2 text-center">
                          {product.isValid ? (
                            <CheckCircle className="h-4 w-4 text-green-500 mx-auto" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-red-500 mx-auto" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {bulkImportData.length > 50 && (
                  <div className="text-center py-2 text-sm text-gray-500 bg-gray-50">
                    Showing first 50 of {bulkImportData.length} products...
                  </div>
                )}
              </div>

              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => { setShowBulkImport(false); setBulkImportData([]); }}>
                  Cancel
                </Button>
                <Button
                  onClick={processBulkImport}
                  disabled={bulkImportData.filter(p => p.isValid).length === 0}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import {bulkImportData.filter(p => p.isValid).length} Products
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}