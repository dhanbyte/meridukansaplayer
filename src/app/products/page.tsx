"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { 
  Edit, 
  Trash2, 
  Check, 
  X, 
  Package, 
  ShoppingCart, 
  Home, 
  User, 
  Search,
  Plus,
  Star,
  Truck,
  DollarSign
} from "lucide-react";

interface Product {
  _id: string;
  name: string;
  brand: string;
  price: number;
  deliveryCharge: number;
  stock: number;
  category: string;
  image: string;
  description?: string;
  status?: 'active' | 'inactive' | 'pending';
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const { toast } = useToast();

  const categories = ['All', 'Accessories', 'Automotive', 'Baby Care', 'Bracelets', 'Chocolates', 'Electronics', 'Face & Body Care', 'Home & Kitchen', 'Home Care'];
  
  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Failed to fetch products');
      setProducts([]);
    }
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url.trim());
      return true;
    } catch {
      return false;
    }
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsEditDialogOpen(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await fetch('/api/products', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: productId }),
        });
        
        if (response.ok) {
          setProducts(products.filter(p => p._id !== productId));
          toast({
            title: "Product Deleted",
            description: "Product has been deleted successfully",
          });
        }
      } catch (error) {
        toast({
          title: "Delete Failed",
          description: "Failed to delete product",
          variant: "destructive",
        });
      }
    }
  };

  const handleApproveProduct = async (productId: string) => {
    try {
      const response = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: productId, status: 'active' }),
      });
      
      if (response.ok) {
        setProducts(products.map(p => 
          p._id === productId ? { ...p, status: 'active' } : p
        ));
        toast({
          title: "Product Approved",
          description: "Product has been approved successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Approval Failed",
        description: "Failed to approve product",
        variant: "destructive",
      });
    }
  };

  const handleUpdateProduct = async (updatedProduct: Product) => {
    try {
      const response = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: updatedProduct._id, ...updatedProduct }),
      });
      
      if (response.ok) {
        setProducts(products.map(p => 
          p._id === updatedProduct._id ? updatedProduct : p
        ));
        setIsEditDialogOpen(false);
        toast({
          title: "Product Updated",
          description: "Product has been updated successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update product",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Bar */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Package className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-bold">Products</h1>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  className="pl-9 w-48 md:w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Category Filter */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex flex-wrap gap-2 overflow-x-auto">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                selectedCategory === category 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {category === 'All' ? 'VIEW ALL' : category}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 pb-20 md:pb-8">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">
              {selectedCategory === 'All' ? 'All Products' : selectedCategory} 
              <span className="text-gray-500 ml-2">({filteredProducts.length})</span>
            </h2>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <Card key={product._id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="p-3">
                  <div className="relative">
                    <Image
                      src={isValidUrl(product.image || '') ? product.image.trimEnd() : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='}
                      alt={product.name}
                      width={300}
                      height={300}
                      className="w-full h-40 object-cover rounded-lg"
                      unoptimized
                    />
                    {product.status && (
                      <Badge className={`absolute top-2 right-2 ${getStatusColor(product.status)}`}>
                        {product.status}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="p-3">
                  <div className="space-y-2">
                    <div>
                      <h3 className="font-semibold text-sm line-clamp-2">{product.name}</h3>
                      <p className="text-xs text-gray-600">{product.brand || 'Generic'}</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-3 w-3 text-green-600" />
                        <span className="text-lg font-bold text-green-600">
                          {product.price}
                        </span>
                      </div>
                      {product.deliveryCharge && (
                        <div className="flex items-center space-x-1">
                          <Truck className="h-3 w-3 text-gray-500" />
                          <span className="text-xs text-gray-500">
                            +{product.deliveryCharge}
                          </span>
                        </div>
                      )}
                    </div>

                    {product.deliveryCharge && (
                      <div className="text-sm font-semibold text-blue-600">
                        Total: {product.price + product.deliveryCharge}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">
                        Stock: {product.stock}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {product.category}
                      </Badge>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditProduct(product)}
                        className="flex-1"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      {product.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => handleApproveProduct(product._id)}
                          className="flex-1"
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Approve
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteProduct(product._id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No products found</p>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Navigation (Mobile Only) */}
      {isMobile && (
        <footer className="fixed bottom-0 left-0 right-0 bg-white border-t z-40">
          <div className="grid grid-cols-4 py-2">
            <button className="flex flex-col items-center py-2 text-blue-600">
              <ShoppingCart className="h-5 w-5" />
              <span className="text-xs mt-1">Products</span>
            </button>
            <button className="flex flex-col items-center py-2 text-gray-600">
              <Package className="h-5 w-5" />
              <span className="text-xs mt-1">Orders</span>
            </button>
            <button className="flex flex-col items-center py-2 text-gray-600">
              <User className="h-5 w-5" />
              <span className="text-xs mt-1">Users</span>
            </button>
            <button className="flex flex-col items-center py-2 text-gray-600">
              <Home className="h-5 w-5" />
              <span className="text-xs mt-1">Home</span>
            </button>
          </div>
        </footer>
      )}

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    value={selectedProduct.name}
                    onChange={(e) => setSelectedProduct({...selectedProduct, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="brand">Brand</Label>
                  <Input
                    id="brand"
                    value={selectedProduct.brand}
                    onChange={(e) => setSelectedProduct({...selectedProduct, brand: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    value={selectedProduct.price}
                    onChange={(e) => setSelectedProduct({...selectedProduct, price: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="delivery">Delivery Charge</Label>
                  <Input
                    id="delivery"
                    type="number"
                    value={selectedProduct.deliveryCharge}
                    onChange={(e) => setSelectedProduct({...selectedProduct, deliveryCharge: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="stock">Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={selectedProduct.stock}
                    onChange={(e) => setSelectedProduct({...selectedProduct, stock: Number(e.target.value)})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={selectedProduct.category} onValueChange={(value) => setSelectedProduct({...selectedProduct, category: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter(c => c !== 'All').map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  value={selectedProduct.image}
                  onChange={(e) => setSelectedProduct({...selectedProduct, image: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={selectedProduct.description || ''}
                  onChange={(e) => setSelectedProduct({...selectedProduct, description: e.target.value})}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={() => handleUpdateProduct(selectedProduct)} className="flex-1">
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
