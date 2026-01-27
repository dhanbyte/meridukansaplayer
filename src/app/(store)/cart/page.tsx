"use client";
import * as React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Minus, Plus, Search, ShoppingBag } from "lucide-react";
import type { Order } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";
import { useCart } from "@/lib/CartContext";
import { useAuth } from "@/lib/AuthContext";

interface ShippingInfo {
  customerName: string;
  customerPhone: string;
  address: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  sku?: string;
  productSku?: string;
}

export default function CartPage() {
  const { cart, removeFromCart, increaseQuantity, decreaseQuantity, clearCart, placeOrder, getTotalPrice, addToCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = React.useState("prepaid");
  const [isAddressDialogOpen, setIsAddressDialogOpen] = React.useState(false);
  const [shippingInfo, setShippingInfo] = React.useState<ShippingInfo | null>(null);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [productSearch, setProductSearch] = React.useState("");
  const [isProductDialogOpen, setIsProductDialogOpen] = React.useState(false);

  // State for the address form fields
  const [formName, setFormName] = React.useState("");
  const [formPhone, setFormPhone] = React.useState("");
  const [formAddress, setFormAddress] = React.useState("");

  // Fetch products for search
  React.useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      if (data.success) {
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const totalCartPrice = getTotalPrice();
  const finalTotal = totalCartPrice;

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formPhone || !formAddress) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill out all address fields.",
      });
      return;
    }
    setShippingInfo({
      customerName: formName,
      customerPhone: formPhone,
      address: formAddress,
    });
    setIsAddressDialogOpen(false);
    toast({
      title: "Address Saved",
      description: "Your shipping address has been updated.",
    });
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Not Logged In",
        description: "You need to be logged in to place an order.",
      });
      return;
    }
    if (cart.length === 0) {
      toast({
        variant: "destructive",
        title: "Empty Cart",
        description: "You cannot place an order with an empty cart.",
      });
      return;
    }
    if (!shippingInfo) {
      toast({
        variant: "destructive",
        title: "No Address",
        description: "Please add a shipping address before placing an order.",
      });
      return;
    }

    try {
      const getNumericPrice = (p: any) => {
        if (typeof p === 'number') return p;
        if (p && typeof p === 'object') return p.discounted || p.original || 0;
        return 0;
      };

      const orderData = {
        partnerId: user.partnerId || user.partner_id || user.id || user._id,
        partnerName: user.name || user.username || 'Partner',
        customerName: shippingInfo.customerName,
        customerPhone: shippingInfo.customerPhone,
        shippingAddress: shippingInfo.address,
        items: cart.map(item => {
          const itemPrice = getNumericPrice(item.price);
          return {
            productId: item.id,
            productName: item.name,
            productSku: item.productSku || item.sku || 'N/A',
            quantity: item.quantity,
            price: itemPrice,
            total: itemPrice * item.quantity
          };
        }),
        totalAmount: finalTotal,
        paymentMethod: paymentMethod,
        status: 'draft',
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        toast({ title: "Order Placed", description: "Your order has been placed successfully." });
        clearCart();
        setShippingInfo(null);
      } else {
        throw new Error('Failed to place order');
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Order Failed", description: "Could not place your order." });
    }
  };

  const handleAddProduct = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
      sku: product.sku || product.productSku || 'N/A',
      productSku: product.sku || product.productSku || 'N/A',
      category: 'General', // Fallback as item needs category
    });
    setIsProductDialogOpen(false);
    setProductSearch("");
    toast({
      title: "Product Added",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Your Cart ({cart.length} items)</h1>
      </div>

      {cart.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingBag className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Your cart is empty.</h2>
          <p className="text-gray-600 mb-6">Add products to get started!</p>
          <Button onClick={() => setIsProductDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
            <Search className="h-4 w-4 mr-2" />
            Add Products
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Add Product Button */}
            <div className="flex justify-between items-center mb-4">
              <Button onClick={() => setIsProductDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                <Search className="h-4 w-4 mr-2" />
                Add Products
              </Button>
              <Button variant="outline" onClick={() => clearCart()}>
                Clear Cart
              </Button>
            </div>

            {/* Cart Items */}
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="border rounded-lg p-4 flex gap-4">
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={80}
                    height={80}
                    className="rounded-md w-16 h-16 sm:w-20 sm:h-20 object-cover"
                  />
                  <div className="flex-1 w-full">
                    <h4 className="text-sm sm:text-base font-semibold line-clamp-2">{item.name}</h4>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center">
                        <Button size="icon" variant="outline" className="h-7 w-7 sm:h-8 sm:w-8" onClick={() => decreaseQuantity(item.id)}>
                          <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <Input
                          type="number"
                          value={item.quantity}
                          readOnly
                          className="w-10 sm:w-12 text-center mx-1 sm:mx-2 h-7 sm:h-8 text-sm"
                        />
                        <Button size="icon" variant="outline" className="h-7 w-7 sm:h-8 sm:w-8" onClick={() => increaseQuantity(item.id)}>
                          <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                      <p className="text-sm sm:text-base font-semibold">
                        ₹{((typeof item.price === 'number' ? item.price : (item.price?.discounted || item.price?.original || 0)) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                    <Button variant="link" className="p-0 h-auto text-red-500 mt-2 text-xs" onClick={() => removeFromCart(item.id)}>
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Order Details */}
          <div className="space-y-4 sm:space-y-6">
            <div className="border rounded-lg p-3 sm:p-4">
              <h3 className="font-semibold mb-2 text-sm sm:text-base">Shipping Address</h3>
              {shippingInfo ? (
                <div className="text-xs sm:text-sm">
                  <p className="font-medium">{shippingInfo.customerName}</p>
                  <p>{shippingInfo.customerPhone}</p>
                  <p className="text-muted-foreground break-words">{shippingInfo.address}</p>
                  <Button variant="link" className="p-0 h-auto mt-2 text-xs sm:text-sm" onClick={() => setIsAddressDialogOpen(true)}>Change Address</Button>
                </div>
              ) : (
                <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive">Add New Address</Button>
                  </DialogTrigger>
                  <DialogContent className="w-[95vw] max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-base sm:text-lg">Add Shipping Address</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSaveAddress}>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-sm">Name</Label>
                          <Input id="name" value={formName} onChange={e => setFormName(e.target.value)} placeholder="Full Name" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone" className="text-sm">Phone</Label>
                          <Input id="phone" value={formPhone} onChange={e => setFormPhone(e.target.value)} placeholder="Phone Number" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="address" className="text-sm">Address</Label>
                          <Textarea id="address" value={formAddress} onChange={e => setFormAddress(e.target.value)} placeholder="Full shipping address" required />
                        </div>
                      </div>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button type="button" variant="secondary">Cancel</Button>
                        </DialogClose>
                        <Button type="submit">Save Address</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>
            <div className="border rounded-lg p-3 sm:p-4">
              <h3 className="font-semibold mb-2 text-sm sm:text-base">Payment Method</h3>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="prepaid" id="prepaid" />
                  <Label htmlFor="prepaid">Prepaid</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cod" id="cod" />
                  <Label htmlFor="cod">Cash On Delivery</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="border rounded-lg p-3 sm:p-4 space-y-2">
              <h3 className="font-semibold mb-2 text-sm sm:text-base">Order Summary</h3>
              <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                <span>Total:</span>
                <span>₹{finalTotal.toFixed(2)}</span>
              </div>
            </div>
            <Button className="w-full bg-slate-900 text-white hover:bg-slate-800 text-sm sm:text-base py-2 sm:py-3" onClick={handlePlaceOrder}>
              Place Order
            </Button>
          </div>
        </div>
      )}

      {/* Add Product Dialog */}
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Products to Cart</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search products by name..."
                className="pl-9"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
              />
            </div>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No products found
                </div>
              ) : (
                filteredProducts.map((product) => (
                  <div key={product.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={60}
                      height={60}
                      className="rounded-md object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-sm line-clamp-2">{product.name}</h4>
                      <p className="text-green-600 font-semibold">₹{product.price}</p>
                    </div>
                    <Button size="sm" onClick={() => handleAddProduct(product)}>
                      Add
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
